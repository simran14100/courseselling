import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiPlus, FiEye } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllBlogs, deleteBlog } from '../../../../services/operations/blogAPI';
import { setLoading } from '../../../../store/slices/profileSlice';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../../../../components/common/ConfirmationModal';

export default function BlogList() {
  console.log('BlogList component rendering...');
  
  const [blogs, setBlogs] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 10;
  
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  console.log('User from Redux store:', user);
  console.log('Auth token exists:', !!token);

  const loadBlogs = async () => {
    console.log('Loading blogs with query:', { searchQuery, currentPage });
    try {
      dispatch(setLoading(true));
      console.log('Calling fetchAllBlogs API...');
      const response = await fetchAllBlogs(searchQuery, currentPage);
      console.log('API Response:', response);
      
      if (response && response.data) {
        console.log('Blogs data received:', response.data);
        setBlogs(response.data);
      } else {
        console.warn('No data received from fetchAllBlogs');
      }
    } catch (error) {
      console.error('Error loading blogs:', error);
      toast.error('Failed to load blogs');
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    loadBlogs();
  }, [searchQuery, currentPage]);

  const handleDelete = async () => {
    try {
      dispatch(setLoading(true));
      await deleteBlog(blogToDelete, token);
      toast.success('Blog post deleted successfully');
      loadBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog post');
    } finally {
      setShowDeleteModal(false);
      dispatch(setLoading(false));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    loadBlogs();
  };

  // Pagination logic
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(blogs.length / blogsPerPage);

  console.log('Rendering BlogList with blogs:', blogs);
  
  if (!user) {
    console.log('No user found, redirecting to login');
    return <div>Please log in to view this page.</div>;
  }

  if (user.accountType !== 'Admin' && user.accountType !== 'SuperAdmin') {
    console.log('User not authorized to view this page');
    return <div>You do not have permission to view this page.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-richblack-800">Blog Posts</h2>
        <button
          onClick={() => navigate('/admin/blogs/create')}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-richblack-900 rounded-lg hover:bg-yellow-100 transition-colors"
        >
          <FiPlus className="text-lg" />
          <span>New Post</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-richblack-100">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-richblack-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-richblack-200">
            <thead className="bg-richblack-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-richblack-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-richblack-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-richblack-200">
              {currentBlogs.length > 0 ? (
                currentBlogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-richblack-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-md object-cover" 
                            src={blog.image} 
                            alt={blog.title} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-richblack-900">{blog.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-richblack-900">
                        {blog.category?.name || 'Uncategorized'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        blog.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : blog.status === 'draft' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-richblack-500">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <FiEye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/blogs/edit/${blog._id}`)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit"
                        >
                          <FiEdit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setBlogToDelete(blog._id);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-richblack-500">
                    No blog posts found. Create your first post!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-richblack-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-richblack-300 text-sm font-medium rounded-md text-richblack-700 bg-white hover:bg-richblack-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-richblack-300 text-sm font-medium rounded-md text-richblack-700 bg-white hover:bg-richblack-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-richblack-700">
                  Showing <span className="font-medium">{indexOfFirstBlog + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastBlog, blogs.length)}
                  </span>{' '}
                  of <span className="font-medium">{blogs.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-richblack-300 bg-white text-sm font-medium text-richblack-500 hover:bg-richblack-50"
                  >
                    <span className="sr-only">Previous</span>
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-richblack-300 text-richblack-700 hover:bg-richblack-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-richblack-300 bg-white text-sm font-medium text-richblack-500 hover:bg-richblack-50"
                  >
                    <span className="sr-only">Next</span>
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        modalData={{
          text1: 'Delete Blog Post',
          text2: 'Are you sure you want to delete this blog post? This action cannot be undone.',
          btn1Text: 'Delete',
          btn2Text: 'Cancel',
          btn1Handler: handleDelete,
          btn2Handler: () => setShowDeleteModal(false),
        }}
        modalOpen={showDeleteModal}
        setModalOpen={setShowDeleteModal}
      />
    </div>
  );
}
