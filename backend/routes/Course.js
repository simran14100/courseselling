// Import the required modules
const express = require("express")
const router = express.Router()

// Import Middleware
const { auth, isInstructor, isStudent, isAdmin, isAdminOrSuperAdmin, isApprovedInstructor, isAdminLevel } = require("../middlewares/auth")
const uploadCourseFiles = require("../utils/multer")

// Import the Controllers

// Course Controllers Import
const {  
  createCourse,
  getAllCourses,
  getCourseDetails,
  getFullCourseDetails,
  editCourse,
  getInstructorCourses,
  getAdminCourses,
  deleteCourse
} = require("../controllers/Course")

// Tags Controllers Import

// Categories Controllers Import
const {
  showAllCategories,
  categoryPageDetails,
  deleteCategory
} = require("../controllers/Category")

const { createCategory } = require("../controllers/Category")
// Sections Controllers Import
const { createSection, updateSection, deleteSection } = require("../controllers/Section");

// Sub-Sections Controllers Import
const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../controllers/Subsection")


// ********************************************************************************************************
//                                      Sub-Section Routes
// ********************************************************************************************************
router.post("/addSubSection", auth, uploadCourseFiles, async (req, res) => {
  try {
    console.log('[addSubSection] Request received:', {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      files: req.files,
      user: req.user ? { id: req.user.id, email: req.user.email, accountType: req.user.accountType } : 'No user'
    });

    // Check user role
    if (!['Instructor', 'Admin', 'SuperAdmin'].includes(req.user.accountType)) {
      console.log('[addSubSection] Unauthorized access attempt:', req.user.accountType);
      return res.status(403).json({
        success: false,
        message: "Only instructors and admins can add subsections"
      });
    }
    
    // Get data from form fields
    const { sectionId, title, description, videoUrl, duration } = req.body;
    
    // Log the parsed body
    console.log('[addSubSection] Parsed request body:', {
      sectionId,
      title,
      description: description ? `${description.substring(0, 30)}...` : 'undefined',
      videoUrl: videoUrl ? `${videoUrl.substring(0, 50)}...` : 'undefined',
      duration
    });
    
    // Validate required fields
    if (!sectionId || !title) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: sectionId and title are required'
      });
    }

    // Check if we have either a video file or a video URL
    const videoFile = req.files?.video?.[0];
    
    if (!videoFile && !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Either a video file or video URL is required'
      });
    }

    // Prepare the data for the controller
    const processedReq = {
      ...req,
      body: {
        sectionId,
        title,
        description: description || '',
        videoUrl: videoUrl || (videoFile ? videoFile.path : ''),
        duration: duration || 0
      }
    };
    
    console.log('[addSubSection] Processed request:', {
      sectionId,
      title,
      hasVideoFile: !!videoFile,
      videoUrl: videoUrl || (videoFile ? 'File uploaded' : 'No video')
    });
    
    return createSubSection(processedReq, res);
    
  } catch (error) {
    console.error('Error in addSubSection:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing request',
      error: error.message
    });
  }
});

// Rating Controllers Import
const {
  createRating,
  getAverageRating,
  getAllRatingReview
 
} = require("../controllers/RatingAndReview")


const { updateCourseProgress } = require("../controllers/courseProgress")

// Test route to verify route mounting
router.get("/test-route", (req, res) => {
    console.log('Test route hit!');
    return res.status(200).json({
        success: true,
        message: 'Test route is working!'
    });
});

// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

// Courses can be created by Admins, SuperAdmins, Content-managers, or approved Instructors
router.post("/createCourse", auth, uploadCourseFiles, async (req, res, next) => {
  try {
    // Check user permissions
    if (
      !['Admin', 'SuperAdmin', 'Content-management'].includes(req.user.accountType) &&
      !(req.user.accountType === 'Instructor' && req.user.isApproved)
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to create a course',
      });
    }

    // Log incoming request for debugging
    console.log('Create course request received:', {
      body: { ...req.body, thumbnailImage: '***', introVideo: '***' },
      files: req.files ? Object.keys(req.files) : 'No files'
    });

    // Check if files were uploaded
    if (req.files) {
      if (req.files.thumbnailImage) {
        req.body.thumbnailImage = req.files.thumbnailImage[0];
      }
      if (req.files.introVideo) {
        req.body.introVideo = req.files.introVideo[0];
      }
    }

    // Process thumbnail
    if (!req.body.thumbnailImage && !req.files?.thumbnailImage) {
      return res.status(400).json({
        success: false,
        message: 'Course thumbnail is required',
      });
    }

    // Handle video if present
    if (req.body.introVideo || req.files?.introVideo) {
      console.log('Video provided, will be processed in the controller');
    }

    // Ensure we have all required fields
    const requiredFields = ['courseName', 'courseDescription', 'whatYouWillLearn', 'price', 'category'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      });
    }
    
    // Add user ID to request body for the controller
    req.body.userId = req.user._id;

    // Proceed to the createCourse controller
    next();
  } catch (error) {
    console.error('Error in createCourse middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing course creation',
      error: error.message
    });
  }
}, createCourse);

// Get courses for the current instructor (or all courses for Admin)
router.get("/getInstructorCourses", auth, (req, res, next) => {
  if (req.user.accountType === 'Admin' || req.user.accountType === 'Instructor') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admins and Instructors only.'
    });
  }
}, getInstructorCourses);

// Get courses created by the logged-in Admin/SuperAdmin only
router.get("/getAdminCourses", auth, isAdminOrSuperAdmin, getAdminCourses)

// Delete course (Admin only for now, could be expanded to course owners)
router.delete("/deleteCourse", auth, isAdminLevel, deleteCourse)

// Edit Course routes - Allow both Admins and approved Instructors
router.post("/editCourse", auth, uploadCourseFiles, async (req, res, next) => {
  try {
    console.log('=== EDIT COURSE REQUEST ===');
    console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Request Body:', req.body);
    console.log('Request Files:', req.files ? Object.keys(req.files) : 'No files');
    
    // Check if user is authorized to edit courses
    if (!['Instructor', 'Admin', 'SuperAdmin'].includes(req.user.accountType)) {
      return res.status(403).json({
        success: false,
        message: 'You need to be an Admin or approved Instructor to edit courses'
      });
    }

    // Parse the course data from the request
    let courseData = {};
    
    // If content-type is application/json, the data is in req.body
    if (req.headers['content-type'] === 'application/json') {
      courseData = req.body;
    } 
    // If it's form-data, we need to handle it differently
    else if (req.body && typeof req.body === 'object') {
      // If course data was sent as JSON string in a field
      if (req.body.courseData) {
        try {
          courseData = JSON.parse(req.body.courseData);
        } catch (e) {
          console.error('Error parsing courseData:', e);
          return res.status(400).json({
            success: false,
            message: 'Invalid course data format',
            error: e.message
          });
        }
      } else {
        // If fields were sent as individual form fields
        courseData = { ...req.body };
      }
    }
    
    // Check for course ID in both body and query params
    const courseId = courseData.courseId || courseData._id || req.query.courseId;
    
    // Validate course ID
    if (!courseId) {
      console.error('Edit Course - Missing course ID');
      return res.status(400).json({
        success: false,
        message: 'Course ID is required for editing',
        receivedData: {
          body: req.body,
          query: req.query,
          files: req.files ? true : false
        }
      });
    }
    
    // Ensure courseId is set in the request body for the controller
    req.body.courseId = courseId;

    // Handle thumbnail image URL if present
    if (req.body.thumbnailImage) {
      console.log('Updated thumbnail image URL provided:', req.body.thumbnailImage);
    }
    
    // Handle intro video URL if present
    if (req.body.introVideo) {
      console.log('Updated intro video URL provided:', req.body.introVideo);
    }

    // Ensure courseId is set for the controller
    if (!req.body.courseId && req.body._id) {
      req.body.courseId = req.body._id;
    }

    // Proceed to the editCourse controller
    next();
  } catch (error) {
    console.error('Error in editCourse middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing course update',
      error: error.message
    });
  }
}, editCourse)
// Add a Section to a Course
// Section routes
router.post("/addSection", auth, (req, res, next) => {
  if (req.user.accountType === 'Admin' || req.user.accountType === 'SuperAdmin' ||(req.user.accountType === 'Instructor' && req.user.isApproved)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'You need to be an Admin or approved Instructor to perform this action'
    });
  }
}, createSection);

// Update a Section
router.post("/updateSection", auth, (req, res, next) => {
  if (req.user.accountType === 'Admin' || req.user.accountType === 'SuperAdmin' || (req.user.accountType === 'Instructor' && req.user.isApproved)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'You need to be an Admin or approved Instructor to perform this action'
    });
  }
}, updateSection);

// Delete a Section
router.post("/deleteSection", auth, (req, res, next) => {
  if (req.user.accountType === 'Admin' ||  req.user.accountType === 'SuperAdmin' || (req.user.accountType === 'Instructor' && req.user.isApproved)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'You need to be an Admin or approved Instructor to perform this action'
    });
  }
}, deleteSection)



// Add a SubSection to a Section
router.post("/addSubSection", auth, async (req, res) => {
  try {
    console.log('[addSubSection] Request received:', {
      body: req.body,
      user: req.user ? { id: req.user.id, accountType: req.user.accountType } : 'No user'
    });

    // Check user authorization
    if (req.user.accountType !== 'Admin' && (req.user.accountType !== 'Instructor' ||req.user.accountType === 'SuperAdmin' || !req.user.isApproved)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only approved instructors and admins can add subsections'
      });
    }

    // Validate required fields
    const { sectionId, title, description, videoUrl, duration } = req.body;
    if (!sectionId || !title || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: sectionId, title, and videoUrl are required',
        received: { 
          sectionId: !!sectionId, 
          title: !!title, 
          videoUrl: !!videoUrl,
          duration: duration || 'not provided (will default to 0)'
        }
      });
    }

    console.log('[addSubSection] Processing video URL:', {
      videoUrl: videoUrl.substring(0, 50) + '...',
      duration: duration || 'not provided (will default to 0)'
    });

    // Call the createSubSection controller
    return createSubSection(req, res);
  } catch (error) {
    console.error('[addSubSection] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add subsection',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});
// Edit Sub Section
router.post("/updateSubSection", auth, (req, res, next) => {
  if (req.user.accountType === 'Admin' || req.user.accountType === 'SuperAdmin' || (req.user.accountType === 'Instructor' && req.user.isApproved)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'You need to be an Admin or approved Instructor to perform this action'
    });
  }
}, updateSubSection)

// Delete Sub Section
router.post("/deleteSubSection", auth, (req, res, next) => {
  if (req.user.accountType === 'Admin' ||req.user.accountType === 'SuperAdmin' || (req.user.accountType === 'Instructor' && req.user.isApproved)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'You need to be an Admin or approved Instructor to perform this action'
    });
  }
}, deleteSubSection)

// This route is a duplicate and has been removed. Use /addSubSection instead.
// Get all Courses Under a Specific Instructor

// Public Course queries (viewable by anyone)
router.get("/getAllCourses", getAllCourses)
router.post("/getCourseDetails", getCourseDetails)
router.post("/getFullCourseDetails", getFullCourseDetails)
// To Update Course Progress
router.post("/updateCourseProgress", auth, isStudent, async (req, res) => {
  try {
    console.log('Update course progress request received:', req.body);
    await updateCourseProgress(req, res);
  } catch (error) {
    console.error('Error in updateCourseProgress route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course progress',
      error: error.message
    });
  }
});

// To get Course Progress
// router.post("/getProgressPercentage", auth, isStudent, getProgressPercentage)

// Delete a Course


// ********************************************************************************************************
//                                      Category routes (Only by Admin and SuperAdmin)
// ********************************************************************************************************
// Category can Only be Created by Admin and SuperAdmin (Staff// Category routes
router.post("/createCategory", auth, isAdmin, createCategory)
router.get("/showAllCategories", showAllCategories)
router.post("/getCategoryPageDetails", categoryPageDetails)
router.delete("/deleteCategory/:categoryId", auth, isAdmin, deleteCategory)

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
router.post("/createRating", auth, isStudent, async (req, res, next) => {
    try {
        console.log('=== CREATE RATING ROUTE HIT ===');
        console.log('Request Body:', req.body);
        console.log('User:', req.user);
        
        // Ensure user is properly attached to request
        if (!req.user) {
            console.error('No user found in request after auth middleware');
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        
        // Ensure user ID is available
        if (!req.user._id) {
            console.error('No user ID found in request.user:', req.user);
            return res.status(401).json({
                success: false,
                message: 'User ID not found in request'
            });
        }
        
        // Continue to the createRating controller
        next();
    } catch (error) {
        console.error('Error in createRating middleware:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}, createRating);

router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRatingReview);

// Export the router
module.exports = router;
