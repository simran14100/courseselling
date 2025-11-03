import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCourses } from '../services/operations/courseDetailsAPI';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useInView } from 'react-intersection-observer';

const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';

const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        const allCoursesData = await getAllCourses();
        if (allCoursesData && Array.isArray(allCoursesData)) {
          setCourses(allCoursesData);
          setFilteredCourses(allCoursesData);
        } else {
          setCourses([]);
          setFilteredCourses([]);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error('Failed to load courses. Please try again later.');
        setCourses([]);
        setFilteredCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllCourses();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const results = courses.filter(course => 
        course.courseName?.toLowerCase().includes(query) ||
        course.courseDescription?.toLowerCase().includes(query) ||
        course.category?.name?.toLowerCase().includes(query) ||
        course.instructor?.firstName?.toLowerCase().includes(query) ||
        course.instructor?.lastName?.toLowerCase().includes(query)
      );
      setFilteredCourses(results);
    }
  }, [searchQuery, courses]);

  const getCourseThumbnail = (course) => {
    if (course.thumbnail) {
      return course.thumbnail;
    }
    const defaultImages = [
      "/assets/img/service/course-img-4.png",
      "/assets/img/service/course-img-5.png",
      "/assets/img/service/course-img-6.png",
      "/assets/img/service/course-img-7.png"
    ];
    return defaultImages[Math.floor(Math.random() * defaultImages.length)];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0 Hours";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}.${Math.round(minutes / 60 * 10)} Hours`;
    }
    return `${minutes} Minutes`;
  };

  return (
    <div 
      className="min-h-screen" 
      style={{ 
        marginTop: '120px', 
        padding: '60px 0',
        background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)'
      }}
    >
      <div className="container">
        {/* Section Heading with animation */}
        <div ref={ref} className="section-heading mb-5 text-center">
          <motion.h4 
            className="sub-heading mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ 
              color: '#000000', 
              textTransform: 'none', 
              fontWeight: 'normal',
              fontSize: '16px',
              letterSpacing: '0.5px'
            }}
          >
            <span className="heading-icon" style={{ marginRight: '8px' }}>
              <i className="fa-sharp fa-solid fa-bolt" style={{ color: ED_TEAL }}></i>
            </span>
            Explore Our Collection
          </motion.h4>
          <motion.h2 
            className="section-title mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ 
              fontSize: '42px', 
              fontWeight: '700',
              color: '#1a1a1a',
              marginBottom: '12px'
            }}
          >
            All Courses
          </motion.h2>
          <motion.p 
            className="desc text-muted"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            style={{ 
              fontSize: '16px',
              maxWidth: '600px',
              margin: '0 auto',
              color: '#666'
            }}
          >
            Discover a wide range of courses designed to help you achieve your learning goals
          </motion.p>
        </div>

        {/* Enhanced Search Bar */}
        <motion.div 
          className="course-search-box mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="search-form position-relative">
                <input
                  type="text"
                  className="form-control shadow-sm"
                  placeholder="Search for courses, instructors, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ 
                    padding: '18px 60px 18px 25px', 
                    borderRadius: '50px',
                    border: '2px solid #e8e8e8',
                    fontSize: '15px',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = ED_TEAL; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e8e8e8'; }}
                />
                <button 
                  className="search-btn position-absolute" 
                  style={{
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: ED_TEAL,
                    border: 'none',
                    borderRadius: '50%',
                    width: '45px',
                    height: '45px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = ED_TEAL_DARK; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ED_TEAL; }}
                >
                  <i className="fa-solid fa-magnifying-glass" style={{ color: 'white' }}></i>
                </button>
              </div>
              {searchQuery && (
                <div className="mt-3 text-center text-muted" style={{ fontSize: '14px' }}>
                  Found {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-5">
            <div 
              className="spinner-border" 
              role="status" 
              style={{ width: '3rem', height: '3rem', color: ED_TEAL }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3" style={{ color: '#666', fontSize: '16px' }}>Loading courses...</p>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="row g-4">
            {filteredCourses.map((course, index) => (
              <div key={course._id} className="col-xl-4 col-lg-6 col-md-6 mb-4">
                <motion.div 
                  className="course-item bg-white overflow-hidden h-100"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.05,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  whileHover={{ 
                    y: -10,
                    transition: { duration: 0.3 }
                  }}
                  style={{
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                  }}
                >
                  {/* Course Image Section */}
                  <div className="position-relative overflow-hidden">
                    <motion.div 
                      className="overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4 }}
                      style={{ height: '220px' }}
                    >
                      <img 
                        src={getCourseThumbnail(course)}
                        alt={course.courseName}
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                      />
                    </motion.div>
                    
                    {/* Level Badge */}
                    <span 
                      className="position-absolute text-white fw-semibold shadow"
                      style={{
                        top: '16px',
                        right: '16px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: '12px',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        letterSpacing: '0.5px',
                        zIndex: 2
                      }}
                    >
                      {course.level || 'All Levels'}
                    </span>
                    
                    {/* Category Badge with Gradient Overlay */}
                    <div 
                      className="position-absolute w-100"
                      style={{
                        bottom: 0,
                        left: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                        padding: '24px 20px 16px'
                      }}
                    >
                      <span 
                        className="text-white fw-medium d-inline-block"
                        style={{
                          background: 'rgba(7, 166, 152, 0.95)',
                          fontSize: '13px',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          backdropFilter: 'blur(8px)'
                        }}
                      >
                        {course.category?.name || 'Uncategorized'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Course Content */}
                  <div 
                    className="d-flex flex-column flex-fill" 
                    style={{ padding: '24px' }}
                  >
                    {/* Course Stats */}
                    <div 
                      className="d-flex align-items-center justify-content-between mb-3" 
                      style={{ 
                        fontSize: '13px', 
                        color: '#6b7280'
                      }}
                    >
                      <span className="d-flex align-items-center">
                        <i 
                          className="fas fa-user-graduate" 
                          style={{ color: ED_TEAL, fontSize: '14px', marginRight: '6px' }}
                        ></i>
                        {course.studentsEnrolled?.length || 0} Students
                      </span>
                    
                    </div>
                    
                    {/* Course Title */}
                    <h3 
                      className="mb-2" 
                      style={{ 
                        fontSize: '20px', 
                        fontWeight: '700',
                        color: '#1a1a1a',
                        lineHeight: '1.4',
                        minHeight: '56px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        transition: 'color 0.3s ease'
                      }}
                    >
                      <Link 
                        to={`/courses/${course._id}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = ED_TEAL; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#1a1a1a'; }}
                      >
                        {course.courseName}
                      </Link>
                    </h3>
                    
                    
                    
                    {/* Instructor & Price Section */}
                    <div 
                      className="pt-1 mt-0 d-flex align-items-center justify-content-between" 
                      style={{ borderTop: '1px solid #f3f4f6' }}
                    >
                      <div className="d-flex align-items-center">
                        <div 
                          className="overflow-hidden"
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            border: '2px solid #f3f4f6',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                            marginRight: '12px',
                            flexShrink: 0
                          }}
                        >
                          <img 
                            src={course.instructor?.image || '/assets/img/author/author-1.jpg'}
                            alt={course.instructor?.firstName || 'Instructor'}
                            className="w-100 h-100"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <div>
                          <h6 
                            className="mb-0" 
                            style={{ 
                              fontSize: '14px', 
                              fontWeight: '600', 
                              color: '#1a1a1a' 
                            }}
                          >
                            {course.instructor?.firstName} {course.instructor?.lastName || 'Instructor'}
                          </h6>
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                            Instructor
                          </span>
                        </div>
                      </div>
                      <div className="text-end">
                        {course.price > 0 ? (
                          <span 
                            className="d-block fw-bold" 
                            style={{ 
                              fontSize: '22px', 
                              color: '#FF6B35', 
                              lineHeight: '1' 
                            }}
                          >
                            ₹ {course.price}
                          </span>
                        ) : (
                          <span 
                            className="d-block fw-bold" 
                            style={{ 
                              fontSize: '22px', 
                              color: '#10b981', 
                              lineHeight: '1' 
                            }}
                          >
                            Free
                          </span>
                        )}
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                          <i 
                            className="fas fa-star" 
                            style={{ color: '#fbbf24', fontSize: '11px' }}
                          ></i> 4.9 (24)
                        </div>
                      </div>
                    </div>
                    
                    {/* View Details Button */}
                    <div className="bottom-content">
                                            <span className="price">₹{course.price || "Free"}</span>
                                            <Link 
                                              to={`/course/${course._id}`} 
                                              className="course-btn" 
                                              style={{
                                                color: '#191A1F',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                padding: '5px 20px',
                                                border: '1px solid #E0E5EB',
                                                borderRadius: '100px',
                                                textDecoration: 'none',
                                                transition: 'all 0.3s ease',
                                                cursor: 'pointer'
                                              }}
                                              onMouseEnter={(e) => {
                                                e.target.style.border = '1px solid #07A698';
                                              }}
                                              onMouseLeave={(e) => {
                                                e.target.style.border = '1px solid #E0E5EB';
                                              }}
                                            >
                                              View Details
                                            </Link>
                                          </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="text-center py-5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="empty-state" style={{ padding: '60px 20px' }}>
              <div 
                className="mb-4 mx-auto d-flex align-items-center justify-content-center"
                style={{
                  width: '120px',
                  height: '120px',
                  background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                  borderRadius: '50%'
                }}
              >
                <i 
                  className="fa-regular fa-folder-open" 
                  style={{ fontSize: '48px', color: '#9ca3af' }}
                ></i>
              </div>
              <h4 
                className="mb-3" 
                style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#1a1a1a' 
                }}
              >
                No courses found
              </h4>
              <p 
                className="text-muted mx-auto" 
                style={{ 
                  fontSize: '16px', 
                  maxWidth: '400px', 
                  color: '#6b7280' 
                }}
              >
                {searchQuery 
                  ? 'No courses match your search. Try different keywords.' 
                  : 'No courses available at the moment. Check back soon!'
                }
              </p>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="btn mt-4"
                  style={{
                    background: ED_TEAL,
                    color: 'white',
                    padding: '12px 28px',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = ED_TEAL_DARK; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ED_TEAL; }}
                >
                  Clear Search
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AllCourses;