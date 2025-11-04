import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUpload, FiX, FiPlus, FiTag, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-hot-toast';
import { 
  fetchAllCategories, 
  fetchBlogById, 
  createBlog, 
  updateBlog 
} from '../../../../services/operations/blogAPI';

// Inline styles
const styles = {
  form: {
    width: '100%',
    maxWidth: '56rem',
    margin: '0 auto',
    padding: '1.5rem'
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  formLabel: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 500,
    color: '#374151',
    fontSize: '0.875rem'
  },
  formControl: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
  },
  formControlFocus: {
    borderColor: '#3b82f6',
    outline: 'none',
    boxShadow: '0 0 0 0.2rem rgba(59, 130, 246, 0.25)'
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    border: '1px solid transparent'
  },
  buttonPrimary: {
    backgroundColor: '#3b82f6',
    color: 'white',
    ':hover': {
      backgroundColor: '#2563eb'
    }
  },
  buttonSecondary: {
    backgroundColor: '#e5e7eb',
    color: '#1f2937',
    border: '1px solid #d1d5db',
    marginLeft: '0.5rem',
    ':hover': {
      backgroundColor: '#d1d5db'
    }
  }
};

export default function BlogForm({ isEditMode = false }) {
  console.log('BLOG_FORM - Component mounting...', { isEditMode });
  
  console.log('BlogForm rendering in', isEditMode ? 'edit' : 'create', 'mode');
  
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();
  const { blogId } = useParams();

  console.log('Form state - isEditMode:', isEditMode, 'blogId:', blogId);
  console.log('User from Redux:', user);
  console.log('Auth token exists:', !!token);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  console.log('Form state - isLoading:', isLoading, 'error:', error);
  
  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
    status: 'draft',
    featured: false,
    metaTitle: '',
    metaDescription: '',
    image: null,
    imagePreview: ''
  });

  // Load categories
  const loadCategories = async () => {
    try {
      const response = await fetchAllCategories();
      if (response && response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    }
  };

  // Load categories
  useEffect(() => {
    console.log('Fetching categories...');
    const getCategories = async () => {
      try {
        const response = await fetchAllCategories();
        console.log('Categories API response:', response);
        
        if (response && response.data) {
          console.log('Categories loaded:', response.data);
          setCategories(response.data);
          
          if (!isEditMode && response.data.length > 0) {
            console.log('Setting default category:', response.data[0]._id);
            setFormData(prev => ({
              ...prev,
              category: response.data[0]._id
            }));
          }
        } else {
          console.warn('No categories data received');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please try again later.');
        toast.error('Failed to load categories');
      }
    };

    getCategories();
  }, [isEditMode]);

  // Reset success modal state on component mount
  useEffect(() => {
    setShowSuccessModal(false);
  }, []);

  // Load blog data if in edit mode
  useEffect(() => {
    if (isEditMode && blogId) {
      console.log('Fetching blog data for edit, blogId:', blogId);
      const fetchAndSetBlogData = async () => {
        try {
          const response = await fetchBlogById(blogId);
          const blogData = response.data;
          
          if (blogData) {
            setFormData({
              title: blogData.title || '',
              slug: blogData.slug || '',
              content: blogData.content || '',
              excerpt: blogData.excerpt || '',
              categories: blogData.categories || [],
              tags: blogData.tags || [],
              status: blogData.status || 'draft',
              featured: blogData.featured || false,
              metaTitle: blogData.metaTitle || '',
              metaDescription: blogData.metaDescription || '',
              image: blogData.image || null,
              imagePreview: blogData.image?.url || ''
            });
          }
        } catch (error) {
          console.error('Error fetching blog post:', error);
          toast.error('Failed to load blog post');
        } finally {
          setIsLoading(false);
        }
      };

      fetchAndSetBlogData();
    } else {
      console.log('Not in edit mode, setting loading to false');
      setIsLoading(false);
    }
  }, [isEditMode, blogId, token]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle content changes in the rich text editor
  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file (JPEG, PNG, etc.)');
        e.target.value = ''; // Clear the file input
        return;
      }
      
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('Image size should be less than 5MB');
        e.target.value = ''; // Clear the file input
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: file, // Store the actual file object
          imagePreview: reader.result // Store the preview URL
        }));
      };
      reader.onerror = () => {
        toast.error('Error reading the image file');
        e.target.value = ''; // Clear the file input
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle tag input
  const handleTagInput = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Create FormData and append all fields
      const formDataToSend = new FormData();
      
      // Required fields
      formDataToSend.append('title', formData.title || '');
      formDataToSend.append('content', formData.content || '');
      
      // Optional fields with fallbacks
      formDataToSend.append('excerpt', formData.excerpt || '');
      formDataToSend.append('category', formData.category || '');
      formDataToSend.append('status', formData.status || 'draft');
      formDataToSend.append('featured', formData.featured || false);
      formDataToSend.append('metaTitle', formData.metaTitle || formData.title || '');
      formDataToSend.append('metaDescription', formData.metaDescription || formData.excerpt || '');
      
      // Handle tags - ensure it's an array
      const tagsArray = Array.isArray(formData.tags) ? formData.tags : [];
      formDataToSend.append('tags', JSON.stringify(tagsArray));
      
      // Handle image file - this is required
      if (!formData.image) {
        toast.error('Please select an image for the blog post');
        setIsLoading(false);
        return;
      }
      
      // Append the image file
      formDataToSend.append('image', formData.image);
      
      // Log form data (excluding file content for readability)
      console.log('Form data prepared for submission:');
      for (let [key, value] of formDataToSend.entries()) {
        if (key === 'image') {
          console.log(`${key}:`, value.name, `(${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}:`, value);
        }
      }

      if (isEditMode) {
        await updateBlog(blogId, formDataToSend, token);
        toast.success('Blog post updated successfully');
      } else {
        await createBlog(formDataToSend, token);
        setShowSuccessModal(true);
      }
      
      navigate('/admin/blogs');
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error(error.response?.data?.message || 'Failed to save blog');
    } finally {
      setIsLoading(false);
    }
  };

  // Debug logs
  console.log('Rendering BlogForm with state:', {
    isLoading,
    error,
    formData,
    categories: categories?.length,
    isEditMode
  });

  // Loading state
  if (isLoading) {
    console.log('Rendering loading state');
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    console.error('Error in BlogForm:', error);
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">An error occurred</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error.message || error.toString()}</p>
              <pre className="mt-2 text-xs overflow-auto p-2 bg-red-100 rounded">
                {error.stack || 'No stack trace available'}
              </pre>
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '56rem',
      margin: '0 auto',
      padding: '1.5rem',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: '1.5rem'
      }}>
        {isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}
      </h2>
      
      <form 
        onSubmit={handleSubmit} 
        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        encType="multipart/form-data"
      >
        {/* Title */}
        <div>
          <label 
            htmlFor="title" 
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '0.25rem'
            }}
          >
            Title <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              outline: 'none',
              ':focus': {
                borderColor: '#3b82f6',
                boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)'
              }
            }}
            placeholder="Enter blog title"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label 
            htmlFor="excerpt" 
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '0.25rem'
            }}
          >
            Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            rows="2"
            style={{
              width: '100%',
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              outline: 'none',
              ':focus': {
                borderColor: '#3b82f6',
                boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)'
              }
            }}
            placeholder="A short summary of your blog post"
          />
        </div>

        {/* Content */}
        <div>
          <label 
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '0.25rem'
            }}
          >
            Content <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div style={{
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            overflow: 'hidden'
          }}>
            <ReactQuill
              value={formData.content}
              onChange={handleContentChange}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['link', 'image'],
                  ['clean']
                ],
              }}
              style={{
                height: '16rem',
                border: 'none',
                borderRadius: '0.375rem'
              }}
            />
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
          gap: '1.5rem',
          '@media (min-width: 768px)': {
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'
          }
        }}>
          {/* Category */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '0.25rem'
            }}>
              Category <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  outline: 'none',
                  ':hover': {
                    borderColor: '#9ca3af'
                  }
                }}
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              >
                {categories.find(cat => cat._id === formData.category)?.name || 'Select a category'}
                {isCategoryOpen ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              
              {isCategoryOpen && (
                <div style={{
                  position: 'absolute',
                  zIndex: 10,
                  marginTop: '0.25rem',
                  width: '100%',
                  backgroundColor: 'white',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  borderRadius: '0.375rem',
                  padding: '0.25rem 0'
                }}>
                  {categories.map((category) => (
                    <div
                      key={category._id}
                      style={{
                        padding: '0.5rem 1rem',
                        ':hover': {
                          backgroundColor: '#f3f4f6',
                          cursor: 'pointer'
                        }
                      }}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          category: category._id
                        }));
                        setIsCategoryOpen(false);
                      }}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label 
              htmlFor="status" 
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '0.25rem'
              }}
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                outline: 'none',
                backgroundColor: 'white',
                ':focus': {
                  borderColor: '#3b82f6',
                  boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)'
                }
              }}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#374151',
            marginBottom: '0.25rem'
          }}>
            Tags
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInput}
              style={{
                flex: 1,
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                outline: 'none',
                ':focus': {
                  borderColor: '#3b82f6',
                  boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)'
                }
              }}
              placeholder="Add tags (press Enter to add)"
            />
            <button
              type="button"
              onClick={() => {
                if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
                  setFormData(prev => ({
                    ...prev,
                    tags: [...prev.tags, tagInput.trim()]
                  }));
                  setTagInput('');
                }
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ':hover': {
                  backgroundColor: '#2563eb'
                },
                ':focus': {
                  outline: 'none',
                  boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)'
                }
              }}
            >
              <FiPlus />
            </button>
          </div>
          
          {formData.tags.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginTop: '0.5rem'
            }}>
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.25rem 0.625rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    backgroundColor: '#dbeafe',
                    color: '#1e40af'
                  }}
                >
                  {tag}
                  <button
                    type="button"
                    style={{
                      marginLeft: '0.375rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '1rem',
                      width: '1rem',
                      borderRadius: '9999px',
                      backgroundColor: '#bfdbfe',
                      color: '#1e40af',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      ':hover': {
                        backgroundColor: '#93c5fd'
                      },
                      ':focus': {
                        outline: 'none',
                        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)'
                      }
                    }}
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <FiX style={{ width: '0.75rem', height: '0.75rem' }} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#374151',
            marginBottom: '0.25rem'
          }}>
            Featured Image
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: '0.25rem'
          }}>
            <label style={{
              cursor: 'pointer',
              backgroundColor: 'white',
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151',
              ':hover': {
                backgroundColor: '#f9fafb'
              },
              ':focus': {
                outline: 'none',
                boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)'
              }
            }}>
              <span>Upload Image</span>
              <input
                type="file"
                name="image"
                required
                style={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  padding: 0,
                  margin: '-1px',
                  overflow: 'hidden',
                  clip: 'rect(0, 0, 0, 0)',
                  whiteSpace: 'nowrap',
                  borderWidth: 0
                }}
                onChange={handleImageChange}
                accept="image/*"
              />
            </label>
            {formData.imagePreview && (
              <div style={{
                marginLeft: '1rem',
                position: 'relative'
              }}>
                <img
                  src={formData.imagePreview}
                  alt="Preview"
                  style={{
                    height: '4rem',
                    width: '4rem',
                    objectFit: 'cover',
                    borderRadius: '0.25rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      image: null,
                      imagePreview: ''
                    }));
                  }}
                  style={{
                    position: 'absolute',
                    top: '-0.5rem',
                    right: '-0.5rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    borderRadius: '9999px',
                    padding: '0.25rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ':hover': {
                      backgroundColor: '#dc2626'
                    },
                    ':focus': {
                      outline: 'none',
                      boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.5)'
                    }
                  }}
                >
                  <FiX style={{ width: '0.75rem', height: '0.75rem' }} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SEO Settings */}
       

        {/* Featured */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: '1rem'
        }}>
          <input
            type="checkbox"
            id="featured"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
            style={{
              height: '1rem',
              width: '1rem',
              color: '#3b82f6',
              borderColor: '#d1d5db',
              borderRadius: '0.25rem',
              ':focus': {
                '--tw-ring-offset-shadow': 'var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width, 0px) var(--tw-ring-offset-color, #fff)',
                '--tw-ring-shadow': 'var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width, 0px)) var(--tw-ring-color)',
                '--tw-ring-opacity': '1',
                '--tw-ring-color': 'rgba(59, 130, 246, var(--tw-ring-opacity))',
                '--tw-ring-offset-width': '2px',
                'box-shadow': 'var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000)',
                borderColor: '#3b82f6'
              }
            }}
          />
          <label 
            htmlFor="featured" 
            style={{
              marginLeft: '0.5rem',
              fontSize: '0.875rem',
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            Mark as featured post
          </label>
        </div>

        {/* Success Modal */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '28rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#111827',
              marginBottom: '1rem'
            }}>
              Blog Post Created Successfully!
            </h3>
            <p style={{
              color: '#4b5563',
              marginBottom: '1.5rem'
            }}>
              Your blog post has been created successfully. Would you like to create another post?
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem'
            }}>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/admin/blogs');
                }}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontWeight: 500,
                  cursor: 'pointer',
                  ':hover': {
                    backgroundColor: '#f9fafb'
                  }
                }}
              >
                No, Go to Blogs
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  // Reset form for new post
                  setFormData({
                    title: '',
                    excerpt: '',
                    content: '',
                    category: '',
                    image: null,
                    imagePreview: '',
                    tags: [],
                    status: 'draft',
                    featured: false,
                    metaTitle: '',
                    metaDescription: ''
                  });
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  ':hover': {
                    backgroundColor: '#2563eb'
                  }
                }}
              >
                Yes, Create Another
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.75rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e5e7eb',
        marginTop: '1.5rem'
      }}>
          <button
            type="button"
            onClick={() => {
              setShowSuccessModal(false);
              navigate('/admin/blogs');
            }}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151',
              backgroundColor: 'white',
              cursor: 'pointer',
              ':hover': {
                backgroundColor: '#f9fafb'
              },
              ':focus': {
                outline: 'none',
                boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)'
              }
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid transparent',
              borderRadius: '0.375rem',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'white',
              backgroundColor: isLoading ? '#93c5fd' : '#3b82f6',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.2s',
              ':hover': !isLoading ? {
                backgroundColor: '#2563eb'
              } : {},
              ':focus': {
                outline: 'none',
                boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)'
              }
            }}
          >
            {isLoading ? (
              'Saving...'
            ) : isEditMode ? (
              'Update Post'
            ) : (
              'Publish Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

