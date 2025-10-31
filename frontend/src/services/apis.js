// API endpoints for the application
export const categories = {
    CREATE_CATEGORY_API: "/api/v1/course/createCategory", 
    CATEGORIES_API: "/api/v1/course/showAllCategories",
    UPDATE_CATEGORY_API: (id) => `/api/v1/course/updateCategory/${id}`,
    DELETE_CATEGORY_API: (id) => `/api/v1/course/deleteCategory/${id}`,
    CATEGORY_PAGE_DETAILS_API: "/api/v1/course/getCategoryPageDetails",
};

// Super Admin specific endpoints (separate from generic admin controller)
export const superAdmin = {
    CREATE_USER_API: "/api/v1/super-admin/create-user",
    UPDATE_USER_API: (id) => `/api/v1/super-admin/users/${id}`,
};

export const auth = {
    SENDOTP_API: "/api/v1/auth/sendotp",
    SIGNUP_API: "/api/v1/auth/signup",
    LOGIN_API: "/api/v1/auth/login",
    LOGOUT_API: "/api/v1/auth/logout",
    RESETPASSTOKEN_API: "/api/v1/auth/reset-password-token",
    RESETPASSWORD_API: "/api/v1/auth/reset-password",
    REFRESH_TOKEN_API: "/api/v1/auth/refresh-token",
};

export const profile = {
    UPDATE_PROFILE_API: "/api/v1/profile/updateProfile",
    DELETE_PROFILE_API: "/api/v1/profile/deleteProfile",
    GET_USER_DETAILS_API: "/api/v1/profile/getUserDetails",
    GET_ENROLLED_COURSES_API: "/api/v1/profile/getEnrolledCourses",
    UPDATE_DISPLAY_PICTURE_API: "/api/v1/profile/updateDisplayPicture",
    LIVE_CLASSES_API: "/api/v1/profile/live-classes",
    BATCH_COURSES_API: "/api/v1/profile/batch-courses",
    // Student Assignments
    STUDENT_ASSIGNMENTS_API: "/api/v1/profile/assignments", // GET list
    STUDENT_ASSIGNMENT_DETAIL_API: "/api/v1/profile/assignments", // GET `${...}/${taskId}`
    STUDENT_ASSIGNMENT_SUBMIT_API: "/api/v1/profile/assignments", // POST `${...}/${taskId}/submit`
    // Student Notifications
    STUDENT_NOTIFICATIONS_API: "/api/v1/profile/notifications", // GET list
};

export const subCategory = {
    GET_SUBCATEGORIES_BY_PARENT_API: "/api/v1/sub-categories/getSubCategory",
    SHOW_ALL_SUBCATEGORIES_API: "/api/v1/sub-categories/showAllSubCategories",
    SUBCATEGORY_PAGE_DETAILS_API: "/api/v1/sub-categories/subCategoryPageDetails",
    CREATE_SUBCATEGORY_API: "/api/v1/sub-categories/createSubCategory",
    UPDATE_SUBCATEGORY_API: (id) => `/api/v1/sub-categories/updateSubCategory/${id}`,
    DELETE_SUBCATEGORY_API: (id) => `/api/v1/sub-categories/deleteSubCategory/${id}`,
    BULK_DELETE_SUBCATEGORIES_API: "/api/v1/sub-categories/bulkDeleteSubCategories",
};

export const course = {
    CREATE_COURSE_API: "/api/v1/course/createCourse",
    GET_ALL_COURSES_API: "/api/v1/course/getAllCourses",
    GET_COURSE_DETAILS_API: "/api/v1/course/getCourseDetails",
    GET_FULL_COURSE_DETAILS_API: "/api/v1/course/getFullCourseDetails",
    GET_FULL_COURSE_DETAILS_AUTHENTICATED: "/api/v1/course/getFullCourseDetails",
    EDIT_COURSE_API: "/api/v1/course/editCourse",
    GET_INSTRUCTOR_COURSES_API: "/api/v1/course/getInstructorCourses",
    GET_ADMIN_COURSES_API: "/api/v1/course/getAdminCourses",
    DELETE_COURSE_API: "/api/v1/course/deleteCourse",
    CREATE_CATEGORY_API: "/api/v1/course/createCategory",
    SHOW_ALL_CATEGORIES_API: "/api/v1/course/showAllCategories",
    CATEGORY_PAGE_DETAILS_API: "/api/v1/course/categoryPageDetails",
    // Section and Subsection APIs
    CREATE_SECTION_API: "/api/v1/course/addSection",
    UPDATE_SECTION_API: "/api/v1/course/updateSection",
    DELETE_SECTION_API: "/api/v1/course/deleteSection",
    // Enrollment Payment
    CREATE_ENROLLMENT_ORDER_API: "/api/v1/enrollments/create-order",
    VERIFY_ENROLLMENT_PAYMENT_API: "/api/v1/enrollments/verify-payment",
    GET_ENROLLMENT_STATUS_API: "/api/v1/enrollments/status",
    // Course Payment
    CAPTURE_PAYMENT_API: "/api/v1/payment/capturePayment",
    VERIFY_PAYMENT_API: "/api/v1/payment/verifyPayment",
    SEND_PAYMENT_SUCCESS_EMAIL_API: "/api/v1/payment/sendPaymentSuccessEmail",
    GET_RAZORPAY_KEY_API: "/api/v1/payment/getRazorpayKey",
    CREATE_SUBSECTION_API: "/api/v1/course/addSubSection",
    UPDATE_SUBSECTION_API: "/api/v1/course/updateSubSection",
    DELETE_SUBSECTION_API: "/api/v1/course/deleteSubSection",
    // Rating and Review APIs
    CREATE_RATING_API: "/api/v1/course/createRating",
    GET_AVERAGE_RATING_API: "/api/v1/course/getAverageRating",
    GET_REVIEWS_API: "/api/v1/course/getReviews",
    // Course Progress API
    LECTURE_COMPLETION_API: "/api/v1/course/updateCourseProgress",
};

export const payment = {
    CAPTURE_PAYMENT_API: "/api/v1/payment/capturePayment",
    VERIFY_PAYMENT_API: "/api/v1/payment/verifyPayment",
    SEND_PAYMENT_SUCCESS_EMAIL_API: "/api/v1/payment/sendPaymentSuccessEmail",
};

// Enrollment API endpoints
export const enrollment = {
    // Payment related
    CREATE_ENROLLMENT_ORDER_API: "/api/v1/enrollments/create-order",
    VERIFY_ENROLLMENT_PAYMENT_API: "/api/v1/enrollments/verify-payment",
    
    // Enrollment management
    CHECK_ENROLLMENT: "/api/v1/enrollments/status",  // Updated to use the new endpoint
    CREATE_ENQUIRY: "/api/v1/enrollments/enquiry",
    GET_ENROLLMENT_STATUS: "/api/v1/enrollments/status",
    RESET_ENROLLMENT_STATUS_API: "/api/v1/enrollments/reset-status",
    
    // Program selection and admission
    CREATE_BASIC_ENQUIRY: "/api/v1/enrollment/select-program",
    SUBMIT_DETAILED_ENQUIRY: "/api/v1/enrollment/submit-enquiry",
    GET_ENROLLMENT_DETAILS: "/api/v1/enrollment/details",
    
    // Admin endpoints
    GET_ALL_ENROLLMENTS: "/api/v1/admin/enrollments",
    UPDATE_ENROLLMENT_STATUS: (id) => `/api/v1/admin/enrollments/${id}/status`,
    GET_ENROLLMENT_BY_ID: (id) => `/api/v1/admin/enrollments/${id}`
};

export const admin = {
    GET_REGISTERED_USERS_API: "/api/v1/admin/registered-users",
    GET_ENROLLED_STUDENTS_API: "/api/v1/admin/enrolled-students",
    GET_VERIFIED_STUDENTS: "/api/v1/admin/verified-students",
    GET_PHD_ENROLLED_STUDENTS_API: "/api/v1/admin/phd-enrolled-students",
    GET_PHD_ENROLLMENT_PAID_STUDENTS_API: "/api/v1/admin/phd-enrollment-paid-students",
    GET_PENDING_INSTRUCTORS_API: "/api/v1/admin/pending-instructors",
    APPROVE_INSTRUCTOR_API: "/api/v1/admin/approve-instructor",
    GET_ALL_INSTRUCTORS_API: "/api/v1/admin/all-instructors",
    GET_DASHBOARD_STATS_API: "/api/v1/admin/dashboard-stats",
    UPDATE_USER_STATUS_API: "/api/v1/admin/update-user-status",
    CREATE_BATCH_API: "/api/v1/admin/create-batch",
    LIST_BATCHES_API: "/api/v1/admin/batches",
    EXPORT_BATCHES_API: "/api/v1/admin/batches/export",
    CREATE_STUDENT_API: "/api/v1/admin/create-student",
    CREATE_USER_API: "/api/v1/admin/create-user",
    UPDATE_USER_API: (id) => `/api/v1/admin/users/${id}`,
    // User Types
    USER_TYPES_API: "/api/v1/admin/user-types",
    UPDATE_USER_TYPE: (id) => `/api/v1/admin/user-types/${id}`,
DELETE_USER_TYPE: (id) => `/api/v1/admin/user-types/${id}`,
    // Bulk Students
    STUDENTS_TEMPLATE_API: "/api/v1/admin/students/template",
    BULK_UPLOAD_STUDENTS_API: "/api/v1/admin/students/bulk-upload",
    // Batch Students management
    LIST_BATCH_STUDENTS_API: "/api/v1/admin/batches", // use `${LIST_BATCH_STUDENTS_API}/${batchId}/students`
    ADD_STUDENT_TO_BATCH_API: "/api/v1/admin/batches", // POST `${ADD_STUDENT_TO_BATCH_API}/${batchId}/students`
    REMOVE_STUDENT_FROM_BATCH_API: "/api/v1/admin/batches", // DELETE `${REMOVE_STUDENT_FROM_BATCH_API}/${batchId}/students/:studentId`
    // Batch Temp Students (not persisted as Users)
    LIST_TEMP_STUDENTS_IN_BATCH_API: "/api/v1/admin/batches", // GET `${LIST_TEMP_STUDENTS_IN_BATCH_API}/${batchId}/temp-students`
    ADD_TEMP_STUDENT_TO_BATCH_API: "/api/v1/admin/batches", // POST `${ADD_TEMP_STUDENT_TO_BATCH_API}/${batchId}/temp-students`
    REMOVE_TEMP_STUDENT_FROM_BATCH_API: "/api/v1/admin/batches", // DELETE `${REMOVE_TEMP_STUDENT_FROM_BATCH_API}/${batchId}/temp-students/:tempId`
    // Batch Trainers management
    LIST_BATCH_TRAINERS_API: "/api/v1/admin/batches", // GET `${LIST_BATCH_TRAINERS_API}/${batchId}/trainers`
    ADD_TRAINER_TO_BATCH_API: "/api/v1/admin/batches", // POST `${ADD_TRAINER_TO_BATCH_API}/${batchId}/trainers`
    REMOVE_TRAINER_FROM_BATCH_API: "/api/v1/admin/batches", // DELETE `${REMOVE_TRAINER_FROM_BATCH_API}/${batchId}/trainers/:trainerId`
    // Batch Courses management
    LIST_BATCH_COURSES_API: "/api/v1/admin/batches", // GET `${LIST_BATCH_COURSES_API}/${batchId}/courses`
    ADD_COURSE_TO_BATCH_API: "/api/v1/admin/batches", // POST `${ADD_COURSE_TO_BATCH_API}/${batchId}/courses`
    REMOVE_COURSE_FROM_BATCH_API: "/api/v1/admin/batches", // DELETE `${REMOVE_COURSE_FROM_BATCH_API}/${batchId}/courses/:courseId`
    // Batch Live Classes management
    ADD_LIVE_CLASS_TO_BATCH_API: "/api/v1/admin/batches", // POST `${ADD_LIVE_CLASS_TO_BATCH_API}/${batchId}/live-classes`
    // Batch Tasks management
    LIST_BATCH_TASKS_API: "/api/v1/admin/batches", // GET `${LIST_BATCH_TASKS_API}/${batchId}/tasks`
    CREATE_BATCH_TASK_API: "/api/v1/admin/batches", // POST `${CREATE_BATCH_TASK_API}/${batchId}/tasks`
    UPDATE_TASK_API: "/api/v1/admin/tasks", // PUT `${UPDATE_TASK_API}/${taskId}`
    DELETE_TASK_API: "/api/v1/admin/tasks", // DELETE `${DELETE_TASK_API}/${taskId}`
    GET_TASK_STATUSES_API: "/api/v1/admin/tasks", // GET `${GET_TASK_STATUSES_API}/${taskId}/statuses`
    GET_TASK_SUMMARY_API: "/api/v1/admin/tasks", // GET `${GET_TASK_SUMMARY_API}/${taskId}/summary`
    // Admin Reviews
    CREATE_ADMIN_REVIEW_API: "/api/v1/admin/reviews",
    // Google Calendar integration
    CREATE_MEET_LINK_API: "/api/v1/admin/calendar/create-meet",
    // Notifications
    CREATE_NOTIFICATION_API: "/api/v1/admin/notifications",
    LIST_NOTIFICATIONS_API: "/api/v1/admin/notifications",
    DELETE_NOTIFICATION_API: "/api/v1/admin/notifications", // DELETE `${...}/${id}`
};

// Batch Departments endpoints
export const batchDepartments = {
  BASE: "/api/v1/batch-departments",
};

export const admission = {
    GET_ALL_CONFIRMATIONS_API: "/api/v1/admission/confirmations",
    GET_CONFIRMATION_BY_ID_API: "/api/v1/admission/confirmations",
    CONFIRM_ADMISSION_API: "/api/v1/admission/confirmations",
    REJECT_ADMISSION_API: "/api/v1/admission/confirmations",
    GET_ADMISSION_STATS_API: "/api/v1/admission/stats",
};

export const installments = {
    CREATE_INSTALLMENT_PLAN_API: "/api/v1/installments/create-plan",
    GET_STUDENT_INSTALLMENTS_API: "/api/v1/installments/student",
    GET_INSTALLMENT_DETAILS_API: "/api/v1/installments/details",
    CREATE_INSTALLMENT_PAYMENT_ORDER_API: "/api/v1/installments/create-payment-order",
    VERIFY_INSTALLMENT_PAYMENT_API: "/api/v1/installments/verify-payment",
    SEND_PAYMENT_REMINDERS_API: "/api/v1/installments/send-reminders",
    GET_ALL_INSTALLMENTS_API: "/api/v1/installments/all",
    GET_INSTALLMENT_STATS_API: "/api/v1/installments/stats",
};

export const contact = {
    CONTACT_US_API: "/api/v1/reach/contact",
};

export const LEAVE_REQUESTS = {
  API: {
    CREATE_LEAVE_REQUEST: "/api/v1/leave-requests",
    GET_MY_LEAVE_REQUESTS: "/api/v1/leave-requests/my-requests",
    GET_ALL_LEAVE_REQUESTS: "/api/v1/leave-requests",
    UPDATE_LEAVE_REQUEST_STATUS: "/api/v1/leave-requests/:id/status"
  }
};

// University Endpoints
export const universityEndpoints = {
    // Student verification
    GET_ALL_VERIFIED_STUDENTS: "/api/v1/university/verified-students",
    VERIFY_STUDENT: "/api/v1/university/verify-student",
    
    // Enrolled students
    GET_ALL_ENROLLED_STUDENTS: "/api/v1/university/enrolled-students",
    ENROLL_STUDENT: "/api/v1/university/enroll-student",
    UPDATE_ENROLLMENT_STATUS: (id) => `/api/v1/university/enrolled-students/${id}/status`,
    
    // Student management
    GET_STUDENT_DETAILS: (id) => `/api/v1/university/students/${id}`,
    UPDATE_STUDENT_DETAILS: (id) => `/api/v1/university/students/${id}`,
    
    // Programs and batches
    GET_ALL_PROGRAMS: "/api/v1/university/programs",
    GET_ALL_BATCHES: "/api/v1/university/batches"
};

// Meeting endpoints
export const meetingEndpoints = {
    GET_ALL_MEETINGS: "/api/v1/meetings",
    GET_TODAYS_MEETINGS: "/api/v1/meetings/today",
    GET_MEETING_BY_ID: "/api/v1/meetings", // + /:id
    CREATE_MEETING: "/api/v1/meetings",
    UPDATE_MEETING: "/api/v1/meetings", // + /:id
    DELETE_MEETING: "/api/v1/meetings", // + /:id
};

// Meeting Type endpoints
export const meetingTypeEndpoints = {
    GET_ALL_MEETING_TYPES: "/api/v1/meeting-types",
    GET_ACTIVE_MEETING_TYPES: "/api/v1/meeting-types/active",
    GET_MEETING_TYPE_BY_ID: "/api/v1/meeting-types", // + /:id
    CREATE_MEETING_TYPE: "/api/v1/meeting-types",
    UPDATE_MEETING_TYPE: "/api/v1/meeting-types", // + /:id
    DELETE_MEETING_TYPE: "/api/v1/meeting-types", // + /:id
};

export const videoProtection = {
    GET_PROTECTED_VIDEO_STREAM: "/api/v1/video/stream",
    GET_VIDEO_SERVE: "/api/v1/video/serve",
    TRACK_VIDEO_PROGRESS: "/api/v1/video/progress",
    GET_VIDEO_ANALYTICS: "/api/v1/video/analytics",
};



// Admission Enquiry API endpoints
export const admissionEnquiry = {
  // Get all admission enquiries with optional filters
  GET_ALL_ENQUIRIES: "/api/v1/admission-enquiries",
  // Get enquiries by program type (UG/PG/PHD)
  GET_ENQUIRIES_BY_PROGRAM: "/api/v1/admission-enquiries/program",
  // Get single enquiry by ID
  GET_ENQUIRY_BY_ID: (id) => `/api/v1/admission-enquiries/${id}`,
  // Update enquiry status
  UPDATE_ENQUIRY_STATUS: (id) => `/api/v1/admission-enquiries/${id}/status`,
  // Process enquiry to admission
  PROCESS_TO_ADMISSION: (id) => `/api/v1/admission-enquiries/${id}/process-to-admission`,
  // Delete an enquiry
  DELETE_ENQUIRY: (id) => `/api/v1/admission-enquiries/${id}`,
  // Create a new enquiry (public endpoint)
  CREATE_ENQUIRY: "/api/v1/admission-enquiries"
};

// Legacy export for backward compatibility
export const admissionEnquiryEndpoints = {
  GET_ALL_ENQUIRIES_API: "/api/v1/admission-enquiries",
  GET_ENQUIRY_BY_ID: (id) => `/api/v1/admission-enquiries/${id}`,
  UPDATE_ENQUIRY_STATUS: (id) => `/api/v1/admission-enquiries/${id}/status`,
  DELETE_ENQUIRY: (id) => `/api/v1/admission-enquiries/${id}`,
};

// Enquiry API endpoints
export const ENQUIRY_API = {
  // Get all enquiries with optional query params
  GET_ENQUIRIES: "/api/v1/enquiries",
  // Get single enquiry by ID
  GET_ENQUIRY_BY_ID: (id) => `/api/v1/enquiries/${id}`,
  // Create new enquiry
  CREATE_ENQUIRY: "/api/v1/enquiries",
  // Update enquiry
  UPDATE_ENQUIRY: (id) => `/api/v1/enquiries/${id}`,
  // Delete enquiry
  DELETE_ENQUIRY: (id) => `/api/v1/enquiries/${id}`,
  // Get enquiry statistics
  GET_STATS: "/api/v1/enquiries/stats"
};



// Enquiry Reference API endpoints
export const ENQUIRY_REFERENCE_API = "/enquiry-references";

export const cart = {
  GET_CART_DETAILS_API: "/api/v1/cart",
  ADD_TO_CART_API: "/api/v1/cart/add",
  UPDATE_CART_ITEM_API: "/api/v1/cart/update",
  GET_CART_COUNT_API: "/api/v1/cart/count",
  REMOVE_FROM_CART_API: "/api/v1/cart/remove",
  CLEAR_CART_API: "/api/v1/cart/clear"
};

// Coursework (PhD Admin)
export const coursework = {
  GET_IMAGES_API: "/api/v1/coursework/images",
  UPDATE_IMAGES_API: "/api/v1/coursework/images",
  LIST_SLOTS_API: "/api/v1/coursework/slots",
  CREATE_SLOT_API: "/api/v1/coursework/slots",
  UPDATE_SLOT_API: "/api/v1/coursework/slots", // use `${...}/${id}`
  DELETE_SLOT_API: "/api/v1/coursework/slots", // use `${...}/${id}`
  TOGGLE_SLOT_API: "/api/v1/coursework/slots", // use `${...}/${id}/toggle`
  // Papers
  LIST_PAPERS_API: "/api/v1/coursework/papers",
  CREATE_PAPER_API: "/api/v1/coursework/papers",
  UPDATE_PAPER_API: "/api/v1/coursework/papers", // use `${...}/${id}`
  DELETE_PAPER_API: "/api/v1/coursework/papers", // use `${...}/${id}`
  TOGGLE_PAPER_API: "/api/v1/coursework/papers", // use `${...}/${id}/toggle`
  // Results
  LIST_RESULTS_API: "/api/v1/coursework/results",
  CREATE_RESULT_API: "/api/v1/coursework/results",
  UPDATE_RESULT_API: "/api/v1/coursework/results", // use `${...}/${id}`
  DELETE_RESULT_API: "/api/v1/coursework/results", // use `${...}/${id}`
  TOGGLE_RESULT_API: "/api/v1/coursework/results", // use `${...}/${id}/toggle`
};