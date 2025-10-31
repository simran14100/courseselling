const mongoose = require('mongoose');
const razorpay = require("../config/razorpay");
const Course = require("../models/Course");
const crypto = require("crypto");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail");
const CourseProgress = require("../models/CourseProgress");
const { convertSecondsToDuration } = require("../utils/secToDuration");
const { createAdmissionConfirmation } = require("./AdmissionConfirmation");

// Get Razorpay key
const getRazorpayKey = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID) {
      throw new Error('Razorpay key ID is not configured');
    }
    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error getting Razorpay key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment key',
      error: error.message
    });
  }
};
// Capture payment and create Razorpay order
const capturePayment = async (req, res) => {
  try {
    const { courses } = req.body;
    const userId = req.user?._id;

    // Log the incoming request for debugging
    console.log('Capture payment request received:', { 
      userId,
      courses,
      body: req.body 
    });

    // Validate userId is present
    if (!userId) {
      console.error('User ID is missing in request');
      return res.status(400).json({
        success: false,
        message: 'User ID is missing in the request. Please log in again.'
      });
    }

    // Ensure courses is an array and not empty
    if (!Array.isArray(courses) || courses.length === 0) {
      console.error('Invalid courses array:', courses);
      return res.status(400).json({ 
        success: false, 
        message: "Please provide valid course IDs" 
      });
    }

    // Validate each course ID
    for (const courseId of courses) {
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        console.error('Invalid course ID format:', courseId);
        return res.status(400).json({
          success: false,
          message: `Invalid course ID format: ${courseId}`
        });
      }
    }

    // Fetch user with all necessary fields
    const user = await User.findById(userId).select('+enrollmentFeePaid +accountType +paymentStatus +enrollmentStatus');
    if (!user) {
      console.error('User not found:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log detailed user status for debugging
    const userStatus = {
      userId: user._id,
      accountType: user.accountType,
      enrollmentFeePaid: user.enrollmentFeePaid,
      paymentStatus: user.paymentStatus,
      enrollmentStatus: user.enrollmentStatus,
      isStudent: user.accountType === 'Student',
      timestamp: new Date().toISOString()
    };
    
    console.log('User enrollment status:', JSON.stringify(userStatus, null, 2));

    // Check if user is a student and has paid enrollment fee
    if (user.accountType === 'Student') {
      // First and foremost, check if enrollment fee is paid
      if (!user.enrollmentFeePaid) {
        console.log('Enrollment fee not paid for user:', {
          userId: user._id,
          enrollmentFeePaid: user.enrollmentFeePaid,
          paymentStatus: user.paymentStatus
        });
        
        return res.status(403).json({
          success: false,
          message: 'Please complete your enrollment fee payment before purchasing courses',
          enrollmentFeeRequired: true,
          redirectTo: '/enrollment-payment',
          userStatus: {
            isStudent: true,
            enrollmentFeePaid: false,
            paymentStatus: user.paymentStatus,
            enrollmentStatus: user.enrollmentStatus
          }
        });
      }
      
      // Then check other requirements if needed
      const isPaymentComplete = user.paymentStatus === 'Completed' || user.paymentStatus === 'Paid';
      const isEnrollmentComplete = user.enrollmentStatus === 'Approved';
      
      if (!isPaymentComplete || !isEnrollmentComplete) {
        console.log('Additional enrollment requirements not met for user:', {
          userId: user._id,
          paymentStatus: user.paymentStatus,
          enrollmentStatus: user.enrollmentStatus
        });
        
        return res.status(403).json({
          success: false,
          message: 'Please complete your enrollment process before purchasing courses',
          enrollmentIncomplete: true,
          redirectTo: '/dashboard/enroll',
          userStatus: {
            isStudent: true,
            enrollmentFeePaid: true, // Fee is paid, but other requirements not met
            paymentStatus: user.paymentStatus,
            enrollmentStatus: user.enrollmentStatus
          }
        });
      }
    }

    // Find any courses the user is already enrolled in
    const alreadyEnrolledCourses = [];
    for (const courseId of courses) {
      if (user.courses.includes(courseId)) {
        const course = await Course.findById(courseId);
        if (course) {
          alreadyEnrolledCourses.push(course.courseName);
        }
      }
    }

    // If already enrolled in any course, return early
    if (alreadyEnrolledCourses.length > 0) {
      return res.status(200).json({
        success: false,
        alreadyEnrolled: true,
        message: `You are already enrolled in: ${alreadyEnrolledCourses.join(', ')}`,
        enrolledCourses: alreadyEnrolledCourses
      });
    }


    // Initialize variables for course processing
    let total_amount = 0;
    const courseDetails = [];
    const enrolledCourses = [];

    // Fetch and validate each course
    for (const courseId of courses) {
      try {
        const course = await Course.findById(courseId).select('_id courseName price studentsEnrolled');
        if (!course) {
          console.error(`Course not found: ${courseId}`);
          return res.status(404).json({
            success: false,
            message: `Course not found: ${courseId}`
          });
        }

        // Check if already enrolled
        if (course.studentsEnrolled.includes(userId)) {
          console.log(`User already enrolled in course: ${course.courseName}`);
          return res.status(400).json({
            success: false,
            message: `You are already enrolled in: ${course.courseName}`,
            alreadyEnrolled: true
          });
        }

        total_amount += course.price || 0;
        courseDetails.push({
          id: course._id,
          name: course.courseName,
          price: course.price
        });
        enrolledCourses.push(courseId);
      } catch (error) {
        console.error(`Error processing course ${courseId}:`, error);
        return res.status(500).json({
          success: false,
          message: `Error processing course: ${error.message}`
        });
      }
    }

    // Validate total amount
    if (total_amount <= 0) {
      console.error('Invalid total amount calculated:', total_amount);
      return res.status(400).json({
        success: false,
        message: 'Invalid total amount. Please check course prices.'
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(total_amount * 100), // Convert to paise and ensure integer
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${userId.toString().slice(-4)}`,
      notes: {
        courses: JSON.stringify(courseDetails),
        userId: userId.toString(),
        type: 'course_payment'
      },
      payment_capture: 1 // Auto-capture payment
    };

    console.log('Creating Razorpay order with options:', {
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt,
      notes: options.notes
    });

    // Use the createOrder function from razorpay config
    const paymentResponse = await razorpay.createOrder(options);
    
    return res.status(200).json({
      success: true,
      orderId: paymentResponse.id,
      amount: paymentResponse.amount,
      currency: paymentResponse.currency,
      key: process.env.RAZORPAY_KEY_ID // Send key for frontend
    });
  } catch (error) {
    console.error('Error in capturePayment:', error);
    
    // Handle Razorpay specific errors
    if (error.error?.description || error.message) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment order',
        error: error.error?.description || error.message
      });
    }
    
    // Handle other errors
    res.status(500).json({ 
      success: false, 
      message: "Could not initiate payment" 
    });
  }
}

// Verify payment and process enrollment
const verifyPayment = async (req, res) => {
  try {
    console.log('🔍 [verifyPayment] Starting payment verification');
    console.log('🔍 [verifyPayment] Request body:', JSON.stringify(req.body, null, 2));

    // Get Razorpay key secret from environment
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    console.log('🔍 [verifyPayment] Razorpay Key Secret configured:', !!razorpayKeySecret);
    
    if (!razorpayKeySecret) {
      const error = new Error('RAZORPAY_KEY_SECRET is not configured in environment variables');
      console.error('❌ [verifyPayment] Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Payment verification failed: Server configuration error'
      });
    }

    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses = req.body?.courses;
    const userId = req.user?._id;

    console.log('🔍 [verifyPayment] Payment verification data:', {
      razorpay_order_id,
      razorpay_payment_id,
      has_signature: !!razorpay_signature,
      courses_count: courses?.length || 0,
      userId
    });

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses || !userId) {
      const error = new Error("Missing required payment information");
      console.error('❌ [verifyPayment] Validation error:', {
        missing_fields: {
          razorpay_order_id: !razorpay_order_id,
          razorpay_payment_id: !razorpay_payment_id,
          razorpay_signature: !razorpay_signature,
          courses: !courses,
          userId: !userId
        }
      });
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    console.log('🔍 [verifyPayment] Verifying payment with order ID:', razorpay_order_id);
    
    try {
      // Generate signature for verification
      const generated_signature = crypto
        .createHmac('sha256', razorpayKeySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      console.log('🔍 [verifyPayment] Signature verification:', {
        generated_signature,
        received_signature: razorpay_signature,
        match: generated_signature === razorpay_signature
      });

      // Verify the signature
      if (generated_signature !== razorpay_signature) {
        console.error("❌ [verifyPayment] Invalid signature received");
        return res.status(400).json({ 
          success: false, 
          message: "Payment verification failed: Invalid signature" 
        });
      }

      console.log('✅ [verifyPayment] Payment verified successfully, processing enrollment...');
      
      // Process enrollment if signature is valid
      await enrollStudents(courses, userId, res, req.body);
      
      console.log('✅ [verifyPayment] Enrollment processed successfully');
      return res.status(200).json({ 
        success: true, 
        message: "Payment verified and enrollment processed successfully" 
      });
    } catch (enrollError) {
      console.error("❌ [verifyPayment] Error during enrollment:", enrollError);
      return res.status(500).json({ 
        success: false, 
        message: "Error processing enrollment: " + (enrollError.message || 'Unknown error') 
      });
    }
  } catch (error) {
    console.error("❌ [verifyPayment] Unexpected error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error during payment verification: " + (error.message || 'Unknown error')
    });
  }
};

// Enroll students in courses after successful payment
async function enrollStudents(courses, userId, res, paymentData) {
  try {
    if (!Array.isArray(courses) || courses.length === 0) {
      throw new Error('No courses provided for enrollment');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Process each course enrollment
    for (const courseId of courses) {
      try {
        // Check if already enrolled
        if (user.courses.includes(courseId)) {
          console.log(`User already enrolled in course: ${courseId}`);
          return res.status(200).json({
            success: true,
            message: 'You are already enrolled in this course',
            alreadyEnrolled: true
          });
        }

        const course = await Course.findById(courseId);
        if (!course) {
          console.error(`Course not found: ${courseId}`);
          continue;
        }

        // Add course to user's courses
        user.courses.push(courseId);
        
        // Add user to course's enrolled students
        course.studentsEnrolled.push(userId);

        // Create admission confirmation if needed
        if (typeof createAdmissionConfirmation === 'function') {
          try {
            await createAdmissionConfirmation(userId, courseId, {
              orderId: paymentData?.razorpay_order_id || 'N/A',
              paymentId: paymentData?.razorpay_payment_id || 'N/A',
              amount: course.price || 0,
              paidAt: new Date()
            });
            console.log("Admission confirmation record created");
          } catch (admissionError) {
            console.error("Error creating admission confirmation:", admissionError);
          }
        }

        // Send enrollment email
        try {
          const emailResponse = await mailSender(
            user.email,
            `Successfully Enrolled into ${course.courseName}`,
            courseEnrollmentEmail(
              course.courseName,
              `${user.firstName} ${user.lastName}`,
              course.duration || 'N/A'
            )
          );
          console.log("Email sent successfully:", emailResponse.response);
        } catch (emailError) {
          console.error("Error sending email:", emailError);
        }

        // Save course updates
        await course.save();
        
        // Create a CourseProgress document for the user and course
        try {
          await CourseProgress.create({
            courseID: courseId,
            userId: userId,
            completedVideos: []
          });
          console.log(`✅ Created CourseProgress for user ${userId} in course ${courseId}`);
        } catch (progressError) {
          console.error(`Error creating CourseProgress for user ${userId} in course ${courseId}:`, progressError);
          // Continue even if creating CourseProgress fails
        }
      } catch (error) {
        console.error(`Error processing course ${courseId}:`, error);
        // Continue with next course even if one fails
      }
    }

    // Update enrollment fee status and save user
    user.enrollmentFeePaid = true;
    await user.save();
    
    console.log('✅ [enrollStudents] Enrollment fee status updated for user:', userId);
    
  } catch (error) {
    console.error("Error in enrollStudents:", error);
    throw error; // Re-throw to be caught by the caller
  }
}

// Send payment success email
const sendPaymentSuccessEmail = async (req, res) => {
  try {
    const { orderId, paymentId, amount, courses } = req.body;
    const userId = req.user?._id;

    if (!orderId || !paymentId || !amount || !courses || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment information'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get course names for the email
    const courseNames = [];
    for (const courseId of courses) {
      const course = await Course.findById(courseId);
      if (course) {
        courseNames.push(course.courseName);
      }
    }

    // Send email
    await mailSender(
      user.email,
      'Payment Successful',
      paymentSuccessEmail({
        orderId,
        paymentId,
        amount,
        courseNames: courseNames.join(', '),
        userName: `${user.firstName} ${user.lastName}`
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Payment success email sent successfully'
    });
  } catch (error) {
    console.error('Error sending payment success email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send payment success email',
      error: error.message
    });
  }
};

// Export all controller functions
module.exports = {
  getRazorpayKey,
  capturePayment,
  verifyPayment,
  enrollStudents,
  sendPaymentSuccessEmail
};