import { apiConnector } from "../apiConnector";
import { profile } from "../apis";
import { showError, showLoading, showSuccess, dismissToast } from "../../utils/toast";

// GET /api/v1/profile/assignments
export async function getStudentAssignments(token) {
  try {
    console.log('Fetching assignments with token:', token ? 'token exists' : 'no token');
    
    // Use apiConnector which will automatically handle the base URL and authentication
    const response = await apiConnector(
      'GET',
      profile.STUDENT_ASSIGNMENTS_API,
      null, // body
      {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      null, // params
      false, // skipAuth
      true   // withCredentials
    );
    
    console.log('Assignments API response:', response);
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to load assignments");
    }
    
    // Ensure we return an array
    const data = Array.isArray(response.data.data) ? response.data.data : [];
    console.log('Returning assignments data:', data);
    return data;
  } catch (err) {
    console.error('Error in getStudentAssignments:', {
      message: err.message,
      response: err.response?.data,
      stack: err.stack
    });
    showError(err?.response?.data?.message || err.message || "Failed to load assignments");
    throw err;
  }
}

// GET /api/v1/profile/assignments/:taskId
export async function getAssignmentDetail(taskId, token) {
  try {
    const url = `${profile.STUDENT_ASSIGNMENT_DETAIL_API}/${taskId}`;
    console.log('Fetching assignment detail:', url);
    
    const response = await apiConnector(
      'GET',
      url,
      null, // body
      {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      null, // params
      false, // skipAuth
      true   // withCredentials
    );
    
    console.log('Assignment detail response:', response);
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to load assignment");
    }
    
    return response.data.data;
  } catch (err) {
    console.error('Error in getAssignmentDetail:', {
      message: err.message,
      stack: err.stack
    });
    showError(err.message || "Failed to load assignment");
    throw err;
  }
}

// POST /api/v1/profile/assignments/:taskId/submit (multipart)
export async function submitAssignment({ taskId, token, submissionText, links = [], files = [] }) {
  try {
    const url = `${profile.STUDENT_ASSIGNMENT_SUBMIT_API}/${taskId}/submit`;
    console.log('Submitting assignment:', { taskId, submissionText, links, files: files?.length || 0 });
    
    const formData = new FormData();
    formData.append('submissionText', submissionText);
    
    // Add links as JSON array
    if (links && links.length > 0) {
      formData.append('links', JSON.stringify(links));
    }
    
    // Add files if any
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }
    
    const response = await apiConnector(
      'POST',
      url,
      formData,
      {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type header - let the browser set it with the correct boundary
      },
      null, // params
      false, // skipAuth
      true   // withCredentials
    );
    
    console.log('Submit assignment response:', response);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to submit assignment');
    }
    
    showSuccess("Assignment submitted successfully");
    return response.data.data;
  } catch (err) {
    showError(err?.response?.data?.message || err.message || "Failed to submit assignment");
    throw err;
  }
}
