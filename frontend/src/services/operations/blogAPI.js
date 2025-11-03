import { apiConnector } from '../apiConnector';
import { toast } from 'react-hot-toast';

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

export const createBlog = async (data, token) => {
  try {
    const response = await apiConnector("POST", BLOG_API.CREATE_BLOG, data, {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message);
    }
    
    toast.success('Blog post created successfully');
    return response.data;
  } catch (error) {
    console.error('CREATE_BLOG_API ERROR:', error);
    toast.error(error.response?.data?.message || 'Failed to create blog post');
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
