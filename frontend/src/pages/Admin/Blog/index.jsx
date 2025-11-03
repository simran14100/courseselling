import React from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import BlogList from '../../../components/core/Admin/Blog/BlogList';
import BlogForm from '../../../components/core/Admin/Blog/BlogForm';
import BlogCategories from '../../../components/core/Admin/Blog/BlogCategories';
import BlogLayout from '../../../components/core/Admin/Blog/BlogLayout';

const TestComponent = () => {
  console.log('TEST - Test component rendering');
  return <div style={{ padding: '20px', backgroundColor: '#f0f0f0', border: '1px solid #ccc' }}>
    <h2>Test Component Rendered</h2>
    <p>If you see this, routing is working correctly.</p>
  </div>;
};

// Wrapper components to include the layout
const BlogListPage = () => (
  <BlogLayout>
    <div>
      <h2>Blog List</h2>
      <BlogList />
    </div>
  </BlogLayout>
);

const CreateBlogPage = () => (
  <BlogLayout>
    <div>
      <h2>Create New Post</h2>
      <BlogForm />
    </div>
  </BlogLayout>
);

const EditBlogPage = () => (
  <BlogLayout>
    <div>
      <h2>Edit Post</h2>
      <BlogForm isEditMode={true} />
    </div>
  </BlogLayout>
);

const CategoriesPage = () => (
  <BlogLayout>
    <div>
      <h2>Categories</h2>
      <BlogCategories />
    </div>
  </BlogLayout>
);

const TestPage = () => (
  <BlogLayout>
    <TestComponent />
  </BlogLayout>
);

const Blog = () => {
  const location = useLocation();
  const params = useParams();
  
  // Debug: Log the current path and route matches
  React.useEffect(() => {
    console.log('Blog - Current path:', location.pathname);
    console.log('Blog - Params:', params);
  }, [location.pathname, params]);

  return (
    <Routes>
      <Route path="/" element={<BlogListPage />} />
      <Route path="create" element={<CreateBlogPage />} />
      <Route path="edit/:blogId" element={<EditBlogPage />} />
      <Route path="categories" element={<CategoriesPage />} />
      <Route path="test" element={<TestPage />} />
      <Route path="*" element={<Navigate to="/admin/blogs" replace />} />
    </Routes>
  );
};

export default Blog;
