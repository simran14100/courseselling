import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getAllCategories } from '../services/operations/categoryAPI';

const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories();
        if (response && response.success) {
          setCategories(response.categories || []);
        } else {
          toast.error('Failed to load categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Error loading categories. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div 
        className="d-flex justify-content-center align-items-center" 
        style={{ 
          minHeight: '60vh',
          background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)',
          padding: '120px 0'
        }}
      >
        <div 
          className="spinner-border" 
          role="status" 
          style={{ 
            width: '3rem', 
            height: '3rem', 
            color: ED_TEAL 
          }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="page-wrapper" 
      style={{ 
        padding: '120px 0 80px',
        background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)',
        minHeight: '100vh'
      }}
    >
      <div className="container">
        <div className="row justify-content-center mb-5">
          <div className="col-lg-8 text-center">
            <h2 
              className="section-title mb-3" 
              style={{
                fontSize: '42px',
                fontWeight: '700',
                color: '#1a1a1a',
                marginBottom: '12px'
              }}
            >
              All Course Categories
            </h2>
            <p 
              className="text-muted" 
              style={{ 
                fontSize: '16px',
                color: '#6b7280'
              }}
            >
              Browse through our wide range of course categories to find what interests you
            </p>
          </div>
        </div>

        <div className="row g-4">
          {categories.length > 0 ? (
            categories.map((category, index) => (
              <div key={category._id} className="col-xl-4 col-lg-6 col-md-6">
                <motion.div
                  className="h-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.1,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.3 }
                  }}
                  style={{
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.3s ease',
                    background: 'white',
                    height: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                  }}
                >
                  <div className="p-5 d-flex flex-column h-100">
                    <div className="d-flex align-items-center mb-4">
                      <div 
                        className="d-flex align-items-center justify-content-center rounded-circle me-4"
                        style={{
                          width: '70px',
                          height: '70px',
                          background: `linear-gradient(135deg, ${ED_TEAL} 0%, ${ED_TEAL_DARK} 100%)`,
                          color: 'white',
                          fontSize: '28px'
                        }}
                      >
                        <i className={category.icon || 'fas fa-book'}></i>
                      </div>
                      <div>
                        <h3 
                          className="mb-1" 
                          style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#1a1a1a'
                          }}
                        >
                          {category.name}
                        </h3>
                        <span 
                          className="badge rounded-pill"
                          style={{
                            background: 'rgba(7, 166, 152, 0.1)',
                            color: ED_TEAL,
                            padding: '6px 12px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}
                        >
                          {category.courseCount || 0} {category.courseCount === 1 ? 'Course' : 'Courses'}
                        </span>
                      </div>
                    </div>
                    
                    <p 
                      className="mb-4" 
                      style={{
                        color: '#6b7280',
                        fontSize: '15px',
                        lineHeight: '1.6',
                        flex: 1
                      }}
                    >
                      {category.description || 'Explore our courses in this category'}
                    </p>
                    
                    <div className="mt-auto pt-3">
                      <Link 
                        to={`/courses?category=${category._id}`}
                        className="d-flex align-items-center text-decoration-none"
                        style={{ 
                          color: ED_TEAL,
                          fontWeight: '600',
                          fontSize: '15px',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = ED_TEAL_DARK;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = ED_TEAL;
                        }}
                      >
                        View Courses <i className="fas fa-arrow-right ms-2" style={{ fontSize: '12px' }}></i>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5">
              <div className="empty-state">
                <i className="fa-regular fa-folder-open fa-3x mb-3" style={{ color: '#ddd' }}></i>
                <h4>No categories found</h4>
                <p className="text-muted">There are no categories available at the moment.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
