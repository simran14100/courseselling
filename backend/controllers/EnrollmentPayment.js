const { instance, createOrder } = require("../config/razorpay");
const User = require("../models/User");
const crypto = require("crypto");
const mailSender = require("../utils/mailSender");
const { enrollmentFeeEmail } = require("../mail/templates/enrollmentFeeEmail");

// Create enrollment fee payment order
exports.createEnrollmentOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const enrollmentFee = 1000; // 1000 rupees

        if (!userId) {
            console.error('User ID is missing in request:', { user: req.user });
            return res.status(400).json({
                success: false,
                message: 'User ID is missing. Please log in again.'
            });
        }

        console.log('Creating enrollment order for user ID:', userId);

        // Get user with necessary fields including enrollment status
        const user = await User.findById(userId).select('accountType enrollmentFeePaid email firstName lastName enrollmentStatus paymentStatus');
        
        if (!user) {
            console.error('User not found in database for ID:', userId);
            return res.status(404).json({
                success: false,
                message: "User not found. Please log in again."
            });
        }

        console.log('User enrollment status:', {
            id: user._id,
            email: user.email,
            accountType: user.accountType,
            enrollmentFeePaid: user.enrollmentFeePaid,
            enrollmentStatus: user.enrollmentStatus,
            paymentStatus: user.paymentStatus
        });

        // Verify user is a student
        if (user.accountType !== "Student") {
            console.error('User is not a student:', {
                userId,
                accountType: user.accountType
            });
            return res.status(403).json({
                success: false,
                message: "Only students can pay enrollment fee"
            });
        }

        // Check if already paid
        if (user.enrollmentFeePaid === true) {
            console.log('Enrollment fee already paid for user:', {
                userId: user._id,
                email: user.email,
                enrollmentStatus: user.enrollmentStatus,
                paymentStatus: user.paymentStatus
            });
            
            // If already paid but status might be out of sync, update it
            if (user.enrollmentStatus !== 'Approved' || user.paymentStatus !== 'Paid') {
                console.log('Updating enrollment status for user:', user._id);
                user.enrollmentStatus = 'Approved';
                user.paymentStatus = 'Paid';
                await user.save();
            }
            
            return res.status(200).json({
                success: false,
                message: "Enrollment fee already paid. Your enrollment is already complete.",
                alreadyPaid: true,
                redirectTo: '/dashboard/enrolled-courses'
            });
        }

        // Create Razorpay order
        const options = {
            amount: enrollmentFee * 100, // Razorpay expects amount in paise
            currency: "INR",
            receipt: `enroll_${Date.now()}`,
            notes: {
                userId: user._id,
                type: 'enrollment_fee'
            }
        };

        console.log('Creating Razorpay order with options:', options);
        
        // Use the createOrder function from razorpay config
        const order = await createOrder(options);

        console.log('Razorpay order created:', {
            orderId: order.id,
            amount: enrollmentFee,
            userId
        });

        res.status(200).json({
            success: true,
            message: "Enrollment order created successfully",
            data: {
                orderId: order.id,
                amount: enrollmentFee,
                currency: "INR",
                key: process.env.RAZORPAY_KEY_ID // Send the Razorpay key to frontend
            }
        });
    } catch (error) {
        console.error('Error in createEnrollmentOrder:', {
            error: error.message,
            stack: error.stack,
            userId: req.user?.id,
            razorpayKeySet: !!process.env.RAZORPAY_KEY_SECRET
        });
        
        res.status(500).json({
            success: false,
            message: "Failed to create enrollment order",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Verify enrollment payment
exports.verifyEnrollmentPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const userId = req.user._id; // Changed from req.user.id to req.user._id
        
        console.log('Verifying payment for user ID:', userId, 'User object:', req.user);

        // Input validation
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            console.error('Missing required fields for payment verification:', {
                razorpay_order_id: !!razorpay_order_id,
                razorpay_payment_id: !!razorpay_payment_id,
                razorpay_signature: !!razorpay_signature,
                userId
            });
            
            return res.status(400).json({
                success: false,
                message: "Payment verification failed - missing required fields"
            });
        }

        // Verify the payment signature
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        
        if (!process.env.RAZORPAY_KEY_SECRET) {
            console.error('RAZORPAY_KEY_SECRET is not set in environment variables');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error. Please contact support.'
            });
        }
        
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');
            
        console.log('Signature verification:', {
            body,
            expectedSignature,
            receivedSignature: razorpay_signature,
            match: expectedSignature === razorpay_signature
        });

        if (expectedSignature !== razorpay_signature) {
            console.error('Invalid payment signature:', {
                expected: expectedSignature,
                received: razorpay_signature,
                userId,
                orderId: razorpay_order_id
            });
            
            return res.status(400).json({
                success: false,
                message: "Payment verification failed - invalid signature"
            });
        }

        // Check if user exists and is a student
        console.log('Looking up user in database with ID:', userId, 'Type:', typeof userId);
        const user = await User.findById(userId);
        
        if (!user) {
            console.error('User not found during payment verification. Details:', {
                userId,
                userIdType: typeof userId,
                userObject: req.user,
                allUsers: await User.find({}).select('_id email') // Log all users for debugging
            });
            return res.status(404).json({
                success: false,
                message: `User not found with ID: ${userId}`
            });
        }
        
        console.log('Found user:', {
            id: user._id,
            email: user.email,
            accountType: user.accountType
        });

        if (user.accountType !== 'Student') {
            console.error('Non-student user attempted payment verification:', {
                userId,
                accountType: user.accountType
            });
            
            return res.status(403).json({
                success: false,
                message: "Only students can verify enrollment payments"
            });
        }

        // Check if already paid
        if (user.enrollmentFeePaid) {
            console.log('Enrollment fee already paid for user:', userId);
            return res.status(200).json({
                success: true,
                message: "Enrollment already completed",
                alreadyPaid: true,
                data: {
                    paymentId: razorpay_payment_id,
                    orderId: razorpay_order_id,
                    enrollmentDate: user.enrollmentDate
                }
            });
        }

        // Update user's enrollment status with proper error handling
        let updatedUser;
        try {
            const updateData = {
                enrollmentFeePaid: true,
                paymentStatus: 'Completed',
                enrollmentStatus: 'Approved',
                enrollmentDate: new Date(),
                'paymentDetails.orderId': razorpay_order_id,
                'paymentDetails.paymentId': razorpay_payment_id,
                'paymentDetails.amount': 1000, // Enrollment fee amount
                'paymentDetails.paidAt': new Date()
            };

            // Use findByIdAndUpdate with proper options to get the updated document
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { $set: updateData },
                { 
                    new: true,
                    runValidators: true 
                }
            ).select('-password -refreshToken -token');

            if (!updatedUser) {
                console.error('Failed to update user enrollment status:', { userId });
                throw new Error('Failed to update user enrollment status');
            }
            
            console.log('Successfully updated user enrollment status:', {
                userId: updatedUser._id,
                enrollmentFeePaid: updatedUser.enrollmentFeePaid,
                paymentStatus: updatedUser.paymentStatus
            });
        } catch (updateError) {
            console.error('Error updating user enrollment status:', {
                error: updateError.message,
                stack: updateError.stack,
                userId
            });
            throw new Error(`Failed to update enrollment status: ${updateError.message}`);
        }

        // Send confirmation email (non-blocking)
        mailSender(
            updatedUser.email,
            "Enrollment Fee Payment Successful",
            enrollmentFeeEmail(
                `${updatedUser.firstName} ${updatedUser.lastName}`,
                updatedUser.email
            )
        ).catch(emailError => {
            console.error("Error sending enrollment confirmation email:", emailError);
            // Don't fail the request if email fails
        });

        console.log('Enrollment payment verified successfully for user:', userId);
        
        res.status(200).json({
            success: true,
            message: "Enrollment payment verified successfully",
            data: {
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                enrollmentDate: updatedUser.enrollmentDate,
                user: {
                    id: updatedUser._id,
                    email: updatedUser.email,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    accountType: updatedUser.accountType,
                    enrollmentFeePaid: updatedUser.enrollmentFeePaid,
                    paymentStatus: updatedUser.paymentStatus,
                    enrollmentDate: updatedUser.enrollmentDate
                }
            }
        });
    } catch (error) {
        console.error("Error in verifyEnrollmentPayment:", {
            error: error.message,
            stack: error.stack,
            userId: req.user?.id,
            orderId: req.body?.razorpay_order_id
        });
        
        res.status(500).json({
            success: false,
            message: "Error verifying enrollment payment",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get enrollment payment status
exports.getEnrollmentStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        res.status(200).json({
            success: true,
            data: {
                enrollmentFeePaid: user.enrollmentFeePaid || false,
                paymentStatus: user.paymentStatus || "Not Paid",
                enrollmentDate: user.enrollmentDate
            }
        });
    } catch (error) {
        console.error("Error getting enrollment status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get enrollment status",
            error: error.message
        });
    }
};

// Reset enrollment status (Admin only)
exports.resetEnrollmentStatus = async (req, res) => {
    try {
        const { userId } = req.body;
        
        // Check if user is admin
        if (req.user.accountType !== "Admin") {
            return res.status(403).json({
                success: false,
                message: "Only admins can reset enrollment status"
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    enrollmentFeePaid: false,
                    paymentStatus: "Pending"
                }
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Enrollment status reset successfully",
            data: user
        });
    } catch (error) {
        console.error("Error resetting enrollment status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reset enrollment status",
            error: error.message
        });
    }
};