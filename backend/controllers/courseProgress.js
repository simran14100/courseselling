const mongoose = require("mongoose");
const Section = require("../models/Section");
const SubSection = require("../models/Subsection");
const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course");

// const updateCourseProgress = async (req, res) => {
//   const { courseId, subsectionId } = req.body;
//   const userId = req.user.id;

//   try {
//     console.log('Updating course progress:', { userId, courseId, subsectionId });
    
//     // Check if the subsection is valid
//     const subsection = await SubSection.findById(subsectionId);
//     if (!subsection) {
//       return res.status(404).json({ 
//         success: false,
//         error: "Invalid subsection" 
//       });
//     }

//     // Find the course progress document for the user and course
//     let courseProgress = await CourseProgress.findOne({
//       courseID: courseId,
//       userId: userId,
//     });

//     if (!courseProgress) {
//       // If course progress doesn't exist, create a new one
//       console.log('Creating new course progress for user:', userId);
//       courseProgress = new CourseProgress({
//         courseID: courseId,
//         userId: userId,
//         completedVideos: [subsectionId]
//       });
//     } else {
//       // If course progress exists, check if the subsection is already completed
//       if (courseProgress.completedVideos.includes(subsectionId)) {
//         // Idempotent response: already completed is OK
//         return res.status(200).json({ 
//           success: true, 
//           message: "Subsection already completed" 
//         });
//       }

//       // Push the subsection into the completedVideos array
//       courseProgress.completedVideos.push(subsectionId);
//     }

//     // Save the updated course progress
//     await courseProgress.save();
//     console.log('Course progress updated successfully');

//     return res.status(200).json({ 
//       success: true, 
//       message: "Course progress updated" 
//     });
//   } catch (error) {
//     console.error('Error updating course progress:', error);
//     return res.status(500).json({ 
//       success: false,
//       error: "Internal server error" 
//     });
//   }
// };
const updateCourseProgress = async (req, res) => {
  const { courseId, subsectionId, userId } = req.body;
  
  // Log the entire request for debugging
  console.log('Update course progress request received:', {
    courseId,
    subsectionId,
    userId,
    authUser: req.user // Log the authenticated user from JWT
  });
  
  // Use the user ID from the request body if available, otherwise fall back to the authenticated user
  const effectiveUserId = userId || req.user?.id;
  
  if (!effectiveUserId) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
  }

  try {
    console.log('Updating course progress for user:', { 
      userId: effectiveUserId, 
      courseId, 
      subsectionId 
    });
    
    // Check if the subsection is valid
    const subsection = await SubSection.findById(subsectionId);
    if (!subsection) {
      return res.status(404).json({ 
        success: false,
        error: "Invalid subsection" 
      });
    }

    // Find the course to get total subsections
    const course = await Course.findById(courseId)
      .populate({
        path: 'courseContent',
        populate: {
          path: 'subSection',
        },
      })
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found"
      });
    }

    // Calculate total number of subsections
    let totalSubsections = 0;
    if (course.courseContent && Array.isArray(course.courseContent)) {
      course.courseContent.forEach((content) => {
        if (content.subSection && Array.isArray(content.subSection)) {
          totalSubsections += content.subSection.length;
        }
      });
    }

    // Find or create course progress
    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: effectiveUserId,
    });

    let isNewCompletion = false;

    if (!courseProgress) {
      // Create new progress
      console.log('Creating new course progress for user:', effectiveUserId);
      courseProgress = new CourseProgress({
        courseID: courseId,
        userId: effectiveUserId,
        completedVideos: [subsectionId]
      });
      isNewCompletion = true;
    } else {
      // Check if already completed
      if (courseProgress.completedVideos.includes(subsectionId)) {
        return res.status(200).json({ 
          success: true, 
          message: "Subsection already completed",
          data: {
            alreadyCompleted: true,
            completedVideos: courseProgress.completedVideos.length,
            totalSubsections,
            progressPercentage: Math.round((courseProgress.completedVideos.length / totalSubsections) * 100) || 0
          }
        });
      }

      // Add to completed videos
      courseProgress.completedVideos.push(subsectionId);
      isNewCompletion = true;
    }

    // Save changes
    await courseProgress.save();
    
    // Calculate progress
    const completedCount = courseProgress.completedVideos.length;
    const progressPercentage = totalSubsections > 0 
      ? Math.round((completedCount / totalSubsections) * 100)
      : 0;

    console.log('Course progress updated successfully:', {
      userId,
      courseId,
      completedVideos: completedCount,
      totalSubsections,
      progressPercentage
    });

    return res.status(200).json({ 
      success: true, 
      message: isNewCompletion ? "Course progress updated" : "No changes made",
      data: {
        completedVideos: completedCount,
        totalSubsections,
        progressPercentage,
        isNewCompletion
      }
    });

  } catch (error) {
    console.error('Error updating course progress:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || "Internal server error" 
    });
  }
};

module.exports = {
  updateCourseProgress
};
//       courseID: courseId,
//       userId: userId,
//     })
//       .populate({
//         path: "courseID",
//         populate: {
//           path: "courseContent",
//         },
//       })
//       .exec()

//     if (!courseProgress) {
//       return res
//         .status(400)
//         .json({ error: "Can not find Course Progress with these IDs." })
//     }
//     console.log(courseProgress, userId)
//     let lectures = 0
//     courseProgress.courseID.courseContent?.forEach((sec) => {
//       lectures += sec.subSection.length || 0
//     })

//     let progressPercentage =
//       (courseProgress.completedVideos.length / lectures) * 100

//     // To make it up to 2 decimal point
//     const multiplier = Math.pow(10, 2)
//     progressPercentage =
//       Math.round(progressPercentage * multiplier) / multiplier

//     return res.status(200).json({
//       data: progressPercentage,
//       message: "Succesfully fetched Course progress",
//     })
//   } catch (error) {
//     console.error(error)
//     return res.status(500).json({ error: "Internal server error" })
//   }
// }
