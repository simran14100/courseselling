import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const BlogLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine the current page title based on the path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.endsWith('/create')) return 'Create New Blog Post';
    if (path.includes('/edit/')) return 'Edit Blog Post';
    if (path.endsWith('/categories')) return 'Blog Categories';
    if (path.endsWith('/blogs') || path.endsWith('/blogs/')) return 'Blog Posts';
    return 'Blog Management';
  };

  return (
    <div style={{
      padding: '1.5rem',
      minHeight: '100vh',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{
        maxWidth: '72rem',
        margin: '0 auto'
      }}>
        {!location.pathname.endsWith('/blogs') && !location.pathname.endsWith('/blogs/') && (
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#2563eb',
              marginBottom: '1.5rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              ':hover': {
                color: '#1e40af'
              },
              transition: 'color 0.2s'
            }}
          >
            <FiArrowLeft style={{ fontSize: '1.125rem' }} />
            <span style={{ fontWeight: 500 }}>Back</span>
          </button>
        )}
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '2rem'
          }}>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1.5rem'
            }}>
              {getPageTitle()}
            </h1>
            <div style={{
              borderTop: '1px solid #e5e7eb',
              paddingTop: '1.5rem'
            }}>
              {children}
            </div>
          </div>
        </div>
        
        <div style={{
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <p>Blog Management System</p>
        </div>
      </div>
    </div>
  );
};

export default BlogLayout;
