const Profile = require("../models/Profile")
const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course")
const User = require("../models/User")
const Batch = require("../models/Batch")

// Helper function to extract URL from text
const extractMeetUrl = (text) => {
  if (!text) return null;
  
  // If it's already a clean URL, return it
  if (text.startsWith('http')) {
    return text;
  }
  
  // Try to extract URL from text
  const urlMatch = text.match(/(https?:\/\/[^\s]+)/);
  return urlMatch ? urlMatch[0] : null;
};
const Notification = require("../models/Notification")
const { uploadImageToCloudinary } = require("../utils/imageUploader")
const mongoose = require("mongoose")
const {convertSecondsToDuration} = require("../utils/secToDuration")

// Method for updating a profile
exports.updateProfile = async (req, res) => {
  try {
    console.log("[updateProfile] controller invoked for user:", req.user?.id);
    const {
      firstName = "",
      lastName = "",
      dateOfBirth = "",
      about = "",
      contactNumber = "",
      gender = "",
      programType,
      email = "",
      phone = "",
      fatherName = ""
    } = req.body
    
    const id = req.user?.id || req.user?._id

    // Find the user
    const userDetails = await User.findById(id)
    if (!userDetails) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    // Ensure the user has an additionalDetails profile
    let profile = null
    if (userDetails.additionalDetails) {
      profile = await Profile.findById(userDetails.additionalDetails)
    }
    if (!profile) {
      // Create a new Profile document if missing
      profile = await Profile.create({
        dateOfBirth: dateOfBirth || undefined,
        about: about || undefined,
        contactNumber: contactNumber || phone || undefined,
        gender: gender || undefined,
      })
      userDetails.additionalDetails = profile._id
    }

    // Update basic profile fields
    if (profile) {
      profile.dateOfBirth = dateOfBirth || profile.dateOfBirth
      profile.about = about || profile.about
      // Prefer explicit contactNumber; fallback to phone from payload
      profile.contactNumber = contactNumber || phone || profile.contactNumber
      profile.gender = gender || profile.gender
    }

    // Update user fields
    userDetails.firstName = firstName || userDetails.firstName
    userDetails.lastName = lastName || userDetails.lastName
    userDetails.email = email || userDetails.email
    
    // Update program type if provided
    if (programType && ["UG", "PG", "PhD"].includes(programType)) {
      userDetails.programType = programType
      
      // If this is the first time setting program type, set enrollment status to pending
      if (userDetails.enrollmentStatus === "Not Enrolled") {
        userDetails.enrollmentStatus = "Pending"
        userDetails.enrollmentDate = new Date()
      }
    }

    // Save both user and profile
    await Promise.all([userDetails.save(), profile.save()])

    // Get updated user details with populated profile
    const updatedUserDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec()

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        ...updatedUserDetails._doc,
        enrollmentStatus: updatedUserDetails.enrollmentStatus,
        programType: updatedUserDetails.programType
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

// GET /api/v1/profile/live-classes
// Returns all upcoming and past live classes for batches the student is assigned to
exports.getStudentLiveClasses = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email; // Get user's email from JWT
    console.log('Fetching live classes for user:', { userId, email: userEmail });

    // Find batches where the student is assigned either in students or tempStudents array
    const batches = await Batch.find({
      $or: [
        { students: userId },
        { 'tempStudents.email': userEmail }
      ]
    }, { 
      name: 1, 
      liveClasses: 1, 
      students: 1,
      tempStudents: 1
    }).lean();
      
    console.log(`Found ${batches.length} batches for user ${userId} (${userEmail})`);
    console.log('Batch details:', JSON.stringify(batches.map(b => ({
      _id: b._id,
      name: b.name,
      studentCount: b.students ? b.students.length : 0,
      tempStudentCount: b.tempStudents ? b.tempStudents.length : 0,
      liveClassCount: b.liveClasses ? b.liveClasses.length : 0
    })), null, 2));

    const events = [];
    for (const b of batches) {
      console.log(`Processing batch ${b._id} with ${(b.liveClasses || []).length} live classes`);
      
      for (const e of (b.liveClasses || [])) {
        const event = {
          id: String(e._id || `${b._id}-${e.startTime}`),
          title: e.title || "Live Class",
          description: e.description || "",
          batchId: String(b._id),
          batchName: b.name,
          link: e.link || "",
          startTime: e.startTime,
          endTime: e.endTime || new Date(new Date(e.startTime).getTime() + 60 * 60 * 1000), // Default 1 hour duration
          meetUrl: extractMeetUrl(e.link), // Add cleaned meet URL
          createdAt: e.createdAt,
        };
        console.log('Adding event:', JSON.stringify(event, null, 2));
        events.push(event);
      }
    }
    
    // Sort by startTime ascending
    events.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error("GET STUDENT LIVE CLASSES ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// =============================
// Student Notifications
// =============================
// GET /api/v1/profile/notifications
exports.getStudentNotifications = async (req, res) => {
  try {
    // For now, return all notifications in latest-first order.
    // In future, can filter by audience (role, batch, user-specific).
    const items = await Notification.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error("GET STUDENT NOTIFICATIONS ERROR:", error)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

// GET /api/v1/profile/batch-courses
// Returns unique list of courses assigned to batches the student belongs to
exports.getStudentBatchCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find batches the student is in and populate minimal course fields
    const batches = await Batch.find({ students: userId }, { name: 1 })
      .populate({
        path: "courses",
        select: "courseName price thumbnail instructor createdAt",
        populate: { path: "instructor", select: "firstName lastName" },
      })
      .lean();

    const courseMap = new Map();
    for (const b of batches) {
      for (const c of (b.courses || [])) {
        const id = String(c._id);
        if (!courseMap.has(id)) {
          courseMap.set(id, {
            _id: id,
            courseName: c.courseName || "Untitled Course",
            price: c.price || 0,
            thumbnail: c.thumbnail || "",
            createdAt: c.createdAt,
            instructor: c.instructor ? {
              _id: String(c.instructor._id || ""),
              firstName: c.instructor.firstName || "",
              lastName: c.instructor.lastName || "",
            } : null,
          });
        }
      }
    }

    const courses = Array.from(courseMap.values());
    return res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error("GET STUDENT BATCH COURSES ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
exports.deleteAccount = async (req, res) => {
  try {
    const id = req.user.id
    console.log(id)
    const userDetails = await User.findById({ _id: id })
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }
    // Delete Assosiated Profile with the User
    await Profile.findByIdAndDelete({
      _id: userDetails.additionalDetails,
    })
    for (const courseId of userDetails.courses) {
      await Course.findByIdAndUpdate(
        courseId,
        { $pull: { studentsEnroled: id } },
        { new: true }
      )
    }
    // Now Delete User
    await User.findByIdAndDelete({ _id: id })
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
    await CourseProgress.deleteMany({ userId: id })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ success: false, message: "User Cannot be deleted successfully" })
  }
}

exports.getAllUserDetails = async (req, res) => {
  try {
    console.log('🔍 [getAllUserDetails] Starting to fetch user details');
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      console.error('❌ [getAllUserDetails] No user ID found in request');
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    console.log(`🔍 [getAllUserDetails] Fetching user with ID: ${userId}`);
    
    // Fetch user with specific fields to avoid sensitive data leakage
    const userDetails = await User.findById(userId)
      .select('firstName lastName email accountType image additionalDetails')
      .populate('additionalDetails')
      .lean()
      .exec();

    console.log('🔍 [getAllUserDetails] Raw user data from DB:', JSON.stringify(userDetails, null, 2));

    if (!userDetails) {
      console.error(`❌ [getAllUserDetails] User not found with ID: ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Ensure we have a name to display
    let displayName = '';
    let initials = 'U';
    
    // Try to get first name and last name
    const firstName = userDetails.firstName || '';
    const lastName = userDetails.lastName || '';
    
    if (firstName || lastName) {
      displayName = `${firstName} ${lastName}`.trim();
      initials = `${firstName ? firstName[0] : ''}${lastName ? lastName[0] : ''}`.toUpperCase() || 'U';
    } else if (userDetails.email) {
      // Fallback to email username if no name is set
      const emailPrefix = userDetails.email.split('@')[0];
      displayName = emailPrefix;
      initials = emailPrefix.substring(0, 2).toUpperCase();
    }

    // Prepare response data
    const responseData = {
      ...userDetails,
      displayName,
      initials,
    };

    console.log('🔍 [getAllUserDetails] Sending user data:', {
      userId: userDetails._id,
      email: userDetails.email,
      displayName,
      initials,
      hasFirstName: !!firstName,
      hasLastName: !!lastName,
    });

    res.status(200).json({
      success: true,
      message: 'User data fetched successfully',
      data: responseData,
    });
  } catch (error) {
    console.error('❌ [getAllUserDetails] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

  exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  exports.getEnrolledCourses = async (req, res) => {
    try {
      // Debug: Log the request details
      console.log('Request headers:', JSON.stringify(req.headers, null, 2));
      console.log('Request user object:', req.user ? {
        id: req.user._id || req.user.id,
        email: req.user.email,
        accountType: req.user.accountType
      } : 'No user object found');
      
      // Get user ID from the request object
      const userId = req.user?._id || req.user?.id;
      
      // Validate user ID
      if (!userId) {
        console.error('No user ID found in request object');
        return res.status(400).json({
          success: false,
          message: 'User ID not found in request',
          requestUser: req.user ? 'User object exists but no ID found' : 'No user object'
        });
      }
      
      // Ensure userId is a string and validate ObjectId format
      const userIdStr = userId.toString();
      console.log('Processing enrolled courses for user ID:', userIdStr);
      
      // Validate MongoDB ObjectId format
      if (!mongoose.Types.ObjectId.isValid(userIdStr)) {
        console.error('Invalid MongoDB ObjectId format:', userIdStr);
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format',
          receivedId: userIdStr,
          expectedFormat: '24 character hex string'
        });
      }
      
      // Convert to ObjectId for consistent querying
      const userIdObj = new mongoose.Types.ObjectId(userIdStr);
      
      // Get user with course IDs
      const user = await User.findById(userIdObj)
        .select('courses')
        .lean()
        .exec();
      
      if (!user) {
        console.error('User not found in database:', userIdStr);
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // If no courses, return empty array
      if (!user.courses || user.courses.length === 0) {
        console.log('No courses found for user:', userIdStr);
        return res.status(200).json({
          success: true,
          data: [],
          message: 'No courses enrolled yet',
        });
      }

      try {
        // Convert course IDs to ObjectId for consistent querying
        const courseIds = user.courses.map(id => new mongoose.Types.ObjectId(id));
        
        // Get all active courses with populated content
        const courses = await Course.find({
          _id: { $in: courseIds },
          status: { $ne: 'Inactive' }
        })
        .populate({
          path: 'courseContent',
          populate: {
            path: 'subSection',
          },
        })
        .lean()
        .exec();

        // Process each course to calculate progress
        const processedCourses = await Promise.all(courses.map(async (course) => {
          // Calculate total duration and subsections
          let totalDurationInSeconds = 0;
          let totalSubsections = 0;
          
          if (course.courseContent && Array.isArray(course.courseContent)) {
            course.courseContent.forEach((content) => {
              if (content.subSection && Array.isArray(content.subSection)) {
                totalDurationInSeconds += content.subSection.reduce(
                  (acc, curr) => acc + (parseInt(curr.timeDuration) || 0),
                  0
                );
                totalSubsections += content.subSection.length;
              }
            });
          }
          
          // Get course progress
          const courseProgress = await CourseProgress.findOne({
            courseID: course._id,
            userId: userIdObj,
          }).lean();
          
          // Calculate progress percentage
          const completedVideosCount = courseProgress?.completedVideos?.length || 0;
          const progressPercentage = totalSubsections > 0 
            ? Math.round((completedVideosCount / totalSubsections) * 100 * 100) / 100 
            : 0;
            
          return {
            ...course,
            totalDuration: convertSecondsToDuration(totalDurationInSeconds),
            progressPercentage,
            totalSubsections,
            completedVideos: completedVideosCount
          };
        }));
        
        return res.status(200).json({
          success: true,
          data: processedCourses,
        });
        
      } catch (error) {
        console.error('Error processing courses:', error);
        return res.status(500).json({
          success: false,
          message: 'Error processing course data',
          error: error.message
        });
      }
    } catch (error) {
      console.error('Error in getEnrolledCourses:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching enrolled courses',
        error: error.message
      });
    }
  };

  exports.instructorDashboard = async (req, res) => {
    try {
      const courseDetails = await Course.find({ instructor: req.user.id })
  
      const courseData = courseDetails.map((course) => {
        const totalStudentsEnrolled = course.studentsEnrolled.length
        const totalAmountGenerated = totalStudentsEnrolled * course.price
  
        // Create a new object with the additional fields
        const courseDataWithStats = {
          _id: course._id,
          courseName: course.courseName,
          courseDescription: course.courseDescription,
          // Include other course properties as needed
          totalStudentsEnrolled,
          totalAmountGenerated,
        }
  
        return courseDataWithStats
      })
  
      res.status(200).json({ courses: courseData })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server Error" })
    }
  }

// =============================
// Student Assignments Endpoints
// =============================
const Task = require("../models/Task")
const TaskSubmission = require("../models/TaskSubmission")

// GET /api/v1/profile/assignments
// Returns tasks assigned to the logged-in student based on batch membership and direct assignment
// exports.getStudentAssignments = async (req, res) => {
//   try {
//     const userId = req.user.id

//     // Find batches the student belongs to
//     const batches = await Batch.find({ students: userId }, { _id: 1 }).lean()
//     const batchIds = batches.map((b) => b._id)

//     // Find tasks in those batches, either assigned to all (assignedTo null) or directly to this student
//     const tasks = await Task.find({
//       batch: { $in: batchIds },
//       $or: [{ assignedTo: { $exists: false } }, { assignedTo: null }, { assignedTo: userId }],
//     })
//       .populate("createdBy", "firstName lastName email accountType")
//       .populate("batch", "name")
//       .populate("assignedTo", "firstName lastName email accountType")
//       .sort({ createdAt: -1 })
//       .lean()

//     // Load this student's submissions for these tasks
//     const taskIds = tasks.map((t) => t._id)
//     const submissions = await TaskSubmission.find({ task: { $in: taskIds }, student: userId })
//       .lean()
//     const subByTask = new Map(submissions.map((s) => [String(s.task), s]))

//     const data = tasks.map((t) => {
//       const sub = subByTask.get(String(t._id))
//       return {
//         ...t,
//         submission: sub
//           ? {
//               _id: sub._id,
//               submittedAt: sub.submittedAt,
//               score: typeof sub.score === "number" ? sub.score : null,
//               feedback: sub.feedback || null,
//             }
//           : null,
//         status: sub ? "submitted" : "pending",
//       }
//     })

//     return res.status(200).json({ success: true, data })
//   } catch (error) {
//     console.error("GET STUDENT ASSIGNMENTS ERROR:", error)
//     return res.status(500).json({ success: false, message: "Internal server error" })
//   }
// }

exports.getStudentAssignments = async (req, res) => {
  console.log('1. Entering getStudentAssignments');
  try {
    console.log('2. User ID from request:', req.user);
    const userId = req.user._id;
    console.log(`3. Fetching assignments for user ID: ${userId}`);

    // Find all batches the student belongs to
    console.log('4. Finding batches for user');
    const batches = await Batch.find({ students: userId }, { _id: 1, name: 1 }).lean();
    console.log('5. Batches found:', JSON.stringify(batches, null, 2));
    
    const batchIds = batches.map((b) => b._id);
    console.log('6. Batch IDs:', batchIds);

    if (batchIds.length === 0) {
      console.log('7. No batches found for user');
      return res.status(200).json({ success: true, data: [] });
    }

    // Find all tasks in those batches that are either assigned to this user or not assigned to anyone
    console.log('8. Finding tasks for batch IDs');
    const tasks = await Task.find({
      batch: { $in: batchIds },
      $or: [
        { assignedTo: { $exists: false } }, 
        { assignedTo: null }, 
        { assignedTo: userId }
      ],
      status: { $ne: 'draft' }
    })
    .populate("createdBy", "firstName lastName")
    .populate("batch", "name")
    .populate("assignedTo", "firstName lastName")
    .sort({ dueDate: 1 })
    .lean();

    console.log('9. Tasks found:', tasks.length);
    console.log('10. Sample task (if any):', tasks[0] ? JSON.stringify(tasks[0], null, 2) : 'No tasks');

    // If no tasks found, return empty array
    if (tasks.length === 0) {
      console.log('10.1 No tasks found for the user');
      return res.status(200).json({ success: true, data: [] });
    }

    // Get all task IDs to find submissions
    const taskIds = tasks.map((t) => t._id);
    
    // Find all submissions for these tasks by this user
    const submissions = await TaskSubmission.find({ 
      task: { $in: taskIds }, 
      student: userId 
    }).lean();

    // Create a map of taskId -> submission for quick lookup
    const subByTask = new Map(submissions.map((s) => [String(s.task), s]));

    // Format the response data
    const data = tasks.map((t) => ({
      _id: t._id,
      title: t.title,
      description: t.description,
      dueDate: t.dueDate,
      batch: t.batch,
      status: subByTask.has(String(t._id)) ? "submitted" : "pending",
      submission: subByTask.get(String(t._id)) || null,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    }));

    console.log('11. Sending response with data');
    return res.status(200).json({ success: true, data });

  } catch (error) {
    console.error('12. ERROR in getStudentAssignments:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// GET /api/v1/profile/assignments/:taskId
// Returns task details with this student's submission (if any)
exports.getStudentAssignmentDetail = async (req, res) => {
  try {
    const userId = req.user._id
    const { taskId } = req.params

    const task = await Task.findById(taskId)
      .populate("createdBy", "firstName lastName email accountType")
      .populate("batch", "name")
      .populate("assignedTo", "firstName lastName email accountType")
    if (!task) return res.status(404).json({ success: false, message: "Task not found" })

    // Ensure student belongs to the task's batch
    const inBatch = await Batch.exists({ _id: task.batch, students: userId })
    if (!inBatch) return res.status(403).json({ success: false, message: "Not authorized for this task" })

    const submission = await TaskSubmission.findOne({ task: taskId, student: userId })
    return res.status(200).json({ success: true, data: { task, submission } })
  } catch (error) {
    console.error("GET STUDENT ASSIGNMENT DETAIL ERROR:", error)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

// POST /api/v1/profile/assignments/:taskId/submit
// Create or update a student's submission
exports.submitAssignment = async (req, res) => {
  try {
    const userId = req.user._id
    const { taskId } = req.params
    const { text = "", links = [] } = req.body

    const task = await Task.findById(taskId)
    if (!task) return res.status(404).json({ success: false, message: "Task not found" })

    // Ensure the student is part of the batch
    const inBatch = await Batch.exists({ _id: task.batch, students: userId })
    if (!inBatch) return res.status(403).json({ success: false, message: "Not authorized for this task" })

    // Handle links (ensure array)
    const linksArr = Array.isArray(links)
      ? links
      : typeof links === "string"
      ? links.split(",").map((s) => s.trim()).filter(Boolean)
      : []

    // Handle files (optional, may be a single file or array from express-fileupload)
    let uploadedFiles = []
    if (req.files && req.files.files) {
      const fileItems = Array.isArray(req.files.files) ? req.files.files : [req.files.files]
      for (const f of fileItems) {
        try {
          const uploaded = await uploadImageToCloudinary(f, process.env.FOLDER_NAME || "webmok-uploads/assignments")
          uploadedFiles.push({ url: uploaded.secure_url, publicId: uploaded.public_id, name: f.name, size: f.size })
        } catch (e) {
          console.error("File upload failed:", e)
        }
      }
    }

    // Upsert submission
    const update = {
      text: String(text || "").trim(),
      links: linksArr,
      submittedAt: new Date(),
      batch: task.batch,
    }
    if (uploadedFiles.length) {
      update.$push = { files: { $each: uploadedFiles } }
    }

    const submission = await TaskSubmission.findOneAndUpdate(
      { task: taskId, student: userId },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    return res.status(200).json({ success: true, data: submission })
  } catch (error) {
    console.error("SUBMIT ASSIGNMENT ERROR:", error)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}