// import React, { useState, useEffect } from 'react';
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import { apiConnector } from '../services/apiConnector';
// import { toast } from 'react-hot-toast';
// import { formatDate } from '../utils/formatDate';

// const BlogDetails = () => {
//   const { blogId } = useParams();
//   const [blog, setBlog] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchBlogDetails = async () => {
//       try {
//         setIsLoading(true);
//         const response = await apiConnector('GET', `/api/v1/blog/${blogId}`);
        
//         if (response?.data?.success) {
//           setBlog(response.data.data);
//         } else {
//           throw new Error(response?.data?.message || 'Failed to fetch blog details');
//         }
//       } catch (error) {
//         console.error('Error fetching blog details:', error);
//         toast.error(error.message || 'Failed to load blog post');
//         navigate('/blog');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     if (blogId) {
//       fetchBlogDetails();
//     }
//   }, [blogId, navigate]);

//   const getImageUrl = (image) => {
//     if (!image) return 'https://via.placeholder.com/800x400?text=No+Image+Available';
    
//     if (typeof image === 'string') {
//       return image.startsWith('http') ? image : `${process.env.REACT_APP_BASE_URL || 'http://localhost:4000'}${image}`;
//     } 
    
//     if (image?.url) {
//       return image.url.startsWith('http') ? image.url : `${process.env.REACT_APP_BASE_URL || 'http://localhost:4000'}${image.url}`;
//     }
    
//     return 'https://via.placeholder.com/800x400?text=No+Image+Available';
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="spinner-border text-primary" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//           <p className="mt-2">Loading blog post...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!blog) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold mb-4">Blog post not found</h2>
//           <Link to="/blog" className="text-blue-600 hover:underline">
//             ← Back to all blogs
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-4xl mx-auto">
//         <article className="bg-white rounded-lg shadow-md overflow-hidden">
//           {/* Blog Image */}
//           <div className="h-96 overflow-hidden">
//             <img
//               src={getImageUrl(blog.image)}
//               alt={blog.title}
//               className="w-full h-full object-cover"
//               onError={(e) => {
//                 e.target.onerror = null;
//                 e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Available';
//               }}
//             />
//           </div>
          
//           {/* Blog Content */}
//           <div className="p-6 md:p-8">
//             <div className="flex items-center text-sm text-gray-500 mb-4">
//               <span className="mr-4">
//                 <i className="far fa-calendar-alt mr-1"></i> {formatDate(blog.createdAt)}
//               </span>
//               {blog.category && (
//                 <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
//                   {blog.category.name || 'Uncategorized'}
//                 </span>
//               )}
//             </div>
            
//             <h1 className="text-3xl font-bold text-gray-900 mb-4">{blog.title}</h1>
            
//             <div 
//               className="prose max-w-none text-gray-700 mb-8"
//               dangerouslySetInnerHTML={{ __html: blog.content }}
//             />
            
//             <div className="mt-8 pt-6 border-t border-gray-200">
//               <Link 
//                 to="/blog" 
//                 className="inline-flex items-center text-blue-600 hover:text-blue-800"
//               >
//                 <i className="fas fa-arrow-left mr-2"></i>
//                 Back to all blogs
//               </Link>
//             </div>
//           </div>
//         </article>
//       </div>
//     </div>
//   );
// };

// export default BlogDetails;
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiConnector } from '../services/apiConnector';
import { toast } from 'react-hot-toast';
import { formatDate } from '../utils/formatDate';

const BlogDetails = () => {
  const { blogId } = useParams();
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        setIsLoading(true);
        const response = await apiConnector('GET', `/api/v1/blog/${blogId}`);
        
        if (response?.data?.success) {
          setBlog(response.data.data);
        } else {
          throw new Error(response?.data?.message || 'Failed to fetch blog details');
        }
      } catch (error) {
        console.error('Error fetching blog details:', error);
        toast.error(error.message || 'Failed to load blog post');
        navigate('/blog');
      } finally {
        setIsLoading(false);
      }
    };

    if (blogId) {
      fetchBlogDetails();
    }
  }, [blogId, navigate]);

  const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/800x400?text=No+Image+Available';
    
    if (typeof image === 'string') {
      return image.startsWith('http') ? image : `${process.env.REACT_APP_BASE_URL || 'http://localhost:4000'}${image}`;
    } 
    
    if (image?.url) {
      return image.url.startsWith('http') ? image.url : `${process.env.REACT_APP_BASE_URL || 'http://localhost:4000'}${image.url}`;
    }
    
    return 'https://via.placeholder.com/800x400?text=No+Image+Available';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative inline-flex">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-12 rounded-lg shadow-lg max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-exclamation-circle text-4xl text-red-600"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Blog Post Not Found</h2>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
          <Link 
            to="/blog" 
            className="inline-flex items-center px-6 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors duration-200"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to All Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <Link 
          to="/blog" 
          className="inline-flex items-center text-gray-600 hover:text-teal-500 transition-colors duration-200"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          <span className="font-medium">Back to All Blogs</span>
        </Link>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column - Blog Image (Sticky on Desktop) */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={getImageUrl(blog.image)}
                alt={blog.title}
                className="w-full h-auto object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
                }}
              />
            </div>
            
            {/* Category Badge */}
            {blog.category && (
              <div className="mt-4">
                <span className="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-full shadow-sm border border-gray-200">
                  <i className="fas fa-tag mr-2 text-teal-500"></i>
                  {blog.category.name || 'Uncategorized'}
                </span>
              </div>
            )}
          </div>

          {/* Right Column - Blog Content */}
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center">
                <i className="far fa-calendar-alt mr-2 text-teal-500"></i>
                <span>{formatDate(blog.createdAt)}</span>
              </div>
              
              <div className="flex items-center">
                <i className="far fa-clock mr-2 text-teal-500"></i>
                <span>5 min read</span>
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {blog.title}
            </h1>
            
            {/* Content */}
            <div 
              className="prose prose-lg max-w-none text-gray-700
                         prose-headings:text-gray-900 prose-headings:font-bold 
                         prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3
                         prose-h3:text-xl prose-h3:mt-5 prose-h3:mb-2
                         prose-p:mb-4 prose-p:text-gray-600 prose-p:leading-relaxed
                         prose-a:text-teal-500 prose-a:no-underline hover:prose-a:underline
                         prose-strong:text-gray-900 prose-strong:font-semibold
                         prose-ul:my-4 prose-ol:my-4
                         prose-li:text-gray-600 prose-li:my-2
                         prose-blockquote:border-l-4 prose-blockquote:border-teal-500 
                         prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
                         prose-code:text-teal-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                         prose-img:rounded-lg prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
            
            {/* Footer Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <Link 
                  to="/blog" 
                  className="inline-flex items-center px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  All Blog Posts
                </Link>
                
                <div className="flex items-center gap-3">
                  <button 
                    className="p-2.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-teal-50 hover:text-teal-500 transition-colors duration-200 border border-gray-200"
                    title="Share"
                  >
                    <i className="fas fa-share-alt"></i>
                  </button>
                  <button 
                    className="p-2.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors duration-200 border border-gray-200"
                    title="Like"
                  >
                    <i className="far fa-heart"></i>
                  </button>
                  <button 
                    className="p-2.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-500 transition-colors duration-200 border border-gray-200"
                    title="Bookmark"
                  >
                    <i className="far fa-bookmark"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;