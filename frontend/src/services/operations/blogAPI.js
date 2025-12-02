import { apiConnector } from '../apiConnector';
import { toast } from 'react-hot-toast';
import axios from 'axios';

// Define blog API endpoints
const BLOG_API = {
  CREATE_BLOG: '/api/v1/blog',
  GET_ALL_BLOGS: '/api/v1/blog',
  GET_BLOG_BY_ID: '/api/v1/blog',
  UPDATE_BLOG: '/api/v1/blog',
  DELETE_BLOG: '/api/v1/blog',
  CREATE_CATEGORY: '/api/v1/blog/categories/create',
  GET_ALL_CATEGORIES: '/api/v1/blog/categories/all',
  UPDATE_CATEGORY: '/api/v1/blog/categories',
  DELETE_CATEGORY: '/api/v1/blog/categories'
};

// Export all API functions
export const fetchAllBlogs = async (searchQuery = '', page = 1, limit = 10) => {
  try {
    const response = await apiConnector("GET", 
      `${BLOG_API.GET_ALL_BLOGS}?search=${searchQuery}&page=${page}&limit=${limit}`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data;
  } catch (error) {
    console.error('GET_ALL_BLOGS_API ERROR:', error);
    toast.error('Failed to fetch blog posts');
    throw error;
  }
};

/**
 * Create a new blog post with image upload
 * @param {FormData} formData - FormData containing blog post data and image file
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Created blog post data
 */
export const createBlog = async (formData, token) => {
  try {
    console.log('Creating blog with form data');
    
    // Log form data entries (except file content for readability)
    for (let [key, value] of formData.entries()) {
      if (key === 'image') {
        console.log(`${key}: [File] ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`${key}:`, value);
      }
    }

    // Create a new axios instance for file upload to avoid Content-Type header conflicts
    // Auto-detect API URL (production uses relative URLs, dev uses localhost)
    const getBaseURL = () => {
      if (process.env.REACT_APP_BASE_URL) return process.env.REACT_APP_BASE_URL;
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return ''; // Production: relative URLs
      }
      return 'http://localhost:4000'; // Development
    };
    
    const axiosInstance = axios.create({
      baseURL: getBaseURL(),
      withCredentials: true,
      headers: {
        'Authorization': `Bearer ${token}`,
        // Let the browser set the Content-Type with the correct boundary
      },
      timeout: 30000, // 30 seconds
    });

    // Make the request with the custom axios instance
    const response = await axiosInstance.post(
      BLOG_API.CREATE_BLOG,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create blog post');
    }

    console.log('Blog created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('CREATE_BLOG_API ERROR:', error);
    
    // Handle specific error cases
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error status:', error.response.status);
      
      if (error.response.status === 400) {
        throw new Error(error.response.data.message || 'Invalid data provided');
      } else if (error.response.status === 401) {
        throw new Error('Session expired. Please log in again.');
      } else if (error.response.status === 403) {
        throw new Error('You do not have permission to perform this action');
      } else if (error.response.status === 413) {
        throw new Error('File size is too large. Maximum size is 5MB.');
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
      throw new Error('No response from server. Please check your connection.');
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    throw error;
  }
};

export const fetchBlogById = async (id) => {
  try {
    const response = await apiConnector("GET", `${BLOG_API.GET_BLOG_BY_ID}/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data;
  } catch (error) {
    console.error('GET_BLOG_BY_ID_API ERROR:', error);
    toast.error('Failed to fetch blog post');
    throw error;
  }
};

export const updateBlog = async (id, data, token) => {
  try {
    const response = await apiConnector("PUT", `${BLOG_API.UPDATE_BLOG}/${id}`, data, {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    toast.success('Blog post updated successfully');
    return response.data;
  } catch (error) {
    console.error('UPDATE_BLOG_API ERROR:', error);
    toast.error(error.response?.data?.message || 'Failed to update blog post');
    throw error;
  }
};

export const deleteBlog = async (id, token) => {
  try {
    const response = await apiConnector("DELETE", `${BLOG_API.DELETE_BLOG}/${id}`, null, {
      Authorization: `Bearer ${token}`,
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    toast.success('Blog post deleted successfully');
    return response.data;
  } catch (error) {
    console.error('DELETE_BLOG_API ERROR:', error);
    toast.error(error.response?.data?.message || 'Failed to delete blog post');
    throw error;
  }
};

// Category APIs
export const createCategory = async (data, token) => {
  try {
    const response = await apiConnector("POST", BLOG_API.CREATE_CATEGORY, data, {
      Authorization: `Bearer ${token}`,
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    toast.success('Category created successfully');
    return response.data;
  } catch (error) {
    console.error('CREATE_CATEGORY_API ERROR:', error);
    toast.error(error.response?.data?.message || 'Failed to create category');
    throw error;
  }
};

export const fetchAllCategories = async () => {
  try {
    const response = await apiConnector("GET", BLOG_API.GET_ALL_CATEGORIES);
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    return response.data;
  } catch (error) {
    console.error('GET_ALL_CATEGORIES_API ERROR:', error);
    toast.error('Failed to fetch categories');
    throw error;
  }
};

export const updateCategory = async (id, data, token) => {
  try {
    const response = await apiConnector("PUT", `${BLOG_API.UPDATE_CATEGORY}/${id}`, data, {
      Authorization: `Bearer ${token}`,
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    toast.success('Category updated successfully');
    return response.data;
  } catch (error) {
    console.error('UPDATE_CATEGORY_API ERROR:', error);
    toast.error(error.response?.data?.message || 'Failed to update category');
    throw error;
  }
};

export const deleteCategory = async (id, token) => {
  try {
    const response = await apiConnector("DELETE", `${BLOG_API.DELETE_CATEGORY}/${id}`, null, {
      Authorization: `Bearer ${token}`,
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    toast.success('Category deleted successfully');
    return response.data;
  } catch (error) {
    console.error('DELETE_CATEGORY_API ERROR:', error);
    toast.error(error.response?.data?.message || 'Failed to delete category');
    throw error;
  }
};
