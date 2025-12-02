// Define your API base URL
// Auto-detect production vs development
const getBaseURL = () => {
  const envURL = process.env.REACT_APP_BASE_URL;
  if (envURL) return `${envURL}/api/v1`;
  
  // Check if we're in production (not localhost)
  if (typeof window !== 'undefined' && 
      window.location.hostname !== 'localhost' && 
      window.location.hostname !== '127.0.0.1') {
    // Production: use relative URLs
    return '/api/v1';
  }
  // Development: use localhost
  return 'http://localhost:4000/api/v1';
};

const BASE_URL = getBaseURL();
console.log('Using BASE_URL:', BASE_URL);
// Authentication Endpoints
export const endpoints = {
  // Auth Endpoints
  SENDOTP_API: `${BASE_URL}/auth/sendotp`,
  SIGNUP_API: `${BASE_URL}/auth/signup`,
  LOGIN_API: `${BASE_URL}/auth/login`,
  RESETPASSTOKEN_API: `${BASE_URL}/auth/reset-password-token`,
  RESETPASSWORD_API: `${BASE_URL}/auth/reset-password`,
  
  // Profile Endpoints
  GET_USER_DETAILS: `${BASE_URL}/profile/getUserDetails`,
  GET_ENROLLED_COURSES: `${BASE_URL}/profile/getEnrolledCourses`,
  UPDATE_PROFILE: `${BASE_URL}/profile/updateProfile`,
  UPDATE_DISPLAY_PICTURE: `${BASE_URL}/profile/updateDisplayPicture`,
  
  // Course Endpoints
  GET_ALL_COURSES: `${BASE_URL}/course/getAllCourses`,
  COURSE_DETAILS_API: `${BASE_URL}/course/getCourseDetails`,
  EDIT_COURSE_API: `${BASE_URL}/course/editCourse`,
  COURSE_CATEGORIES_API: `${BASE_URL}/course/showAllCategories`,
  GET_ALL_CATEGORIES: `${BASE_URL}/course/categories`,
  
  // Fee Endpoints
  GET_STUDENT_FEES: `${BASE_URL}/api/v1/university/payments/fee-details`,
  INITIATE_PAYMENT: `${BASE_URL}/api/v1/university/payments`,
  VERIFY_PAYMENT: `${BASE_URL}/api/v1/university/payments/verify`,
  GET_PAYMENT_HISTORY: `${BASE_URL}/api/v1/university/payments`,
  
  // Add other endpoints as needed
};

export const categories = {
  CATEGORIES_API: `${BASE_URL}/course/showAllCategories`,
};

export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: `${BASE_URL}/profile/updateDisplayPicture`,
  UPDATE_PROFILE_API: `${BASE_URL}/profile/updateProfile`,
  CHANGE_PASSWORD_API: `${BASE_URL}/auth/changepassword`,
  DELETE_PROFILE_API: `${BASE_URL}/profile/deleteAccount`,
};

// Export the API connector
export const apiConnector = async (method, url, bodyData, headers, params) => {
  try {
    const response = await fetch(url, {
      method: method,
      body: bodyData ? JSON.stringify(bodyData) : null,
      headers: headers || {
        'Content-Type': 'application/json',
      },
      params: params || {},
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong');
    }

    return await response.json();
  } catch (error) {
    console.error('API CALL ERROR:', error);
    throw error;
  }
};

export default endpoints;
