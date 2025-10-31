

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { showError } from '../utils/toast';
import { apiConnector } from '../services/apiConnector';
import { profile } from '../services/apis';
import { VscPlay, VscBook, VscCalendar, VscPerson, VscEye, VscChevronRight } from 'react-icons/vsc';
import DashboardLayout from '../components/common/DashboardLayout';

const { GET_ENROLLED_COURSES_API } = profile;

const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';
const ED_TEAL_LIGHT = '#e6f7f5';
const BORDER = '#e0e0e0';
const TEXT_DARK = '#191A1F';
const TEXT_LIGHT = '#666666';
const BG_LIGHT = '#f8fafc';

const COURSE_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#6b7280">Course Image</text></svg>`
  );

export default function ActiveCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();

  // Format duration like: 1m 26s, 52s, 1h 45m
  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '—';
    const s = Math.floor(seconds % 60);
    const m = Math.floor((seconds / 60) % 60);
    const h = Math.floor(seconds / 3600);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        
        // Using native fetch API
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL || 'http://localhost:4000'}/api/v1/profile/getEnrolledCourses`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
          }
        );

        const data = await response.json();
        console.log("Enrolled courses response:", data);
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch enrolled courses');
        }
        
        if (data.success) {
          setEnrolledCourses(Array.isArray(data.data) ? data.data : []);
        } else {
          throw new Error(data.message || 'No courses found');
        }
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        
        let errorMessage = "Failed to load enrolled courses. ";
        
        // Handle fetch API errors
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          errorMessage = "Unable to connect to the server. Please check your internet connection.";
        } 
        // Handle JSON parsing errors
        else if (error.name === 'SyntaxError') {
          errorMessage = "Error processing server response. Please try again later.";
          console.error('JSON Parse Error:', error);
        }
        // Handle our custom errors
        else if (error.message) {
          errorMessage = error.message;
        }
        
        showError(errorMessage);
        setEnrolledCourses([]); // Reset to empty array on error
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchEnrolledCourses();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleCourseClick = (courseId) => {
    navigate(`/viewcourse/${courseId}`);
  };

  if (!token) {
    return (
      <DashboardLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 'calc(100vh - 80px)',
          padding: '20px',
          backgroundColor: BG_LIGHT
        }}>
          <div style={{ 
            textAlign: 'center', 
            maxWidth: '400px',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}>
            <VscBook style={{ 
              width: '64px', 
              height: '64px', 
              color: ED_TEAL, 
              margin: '0 auto 1rem' 
            }} />
            <h1 style={{ 
              fontSize: '1.75rem', 
              fontWeight: '700', 
              color: TEXT_DARK, 
              marginBottom: '1rem' 
            }}>
              Active Courses
            </h1>
            <p style={{ 
              fontSize: '1rem', 
              color: TEXT_LIGHT, 
              marginBottom: '1.5rem',
              lineHeight: '1.5'
            }}>
              Please login to view your enrolled courses.
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: ED_TEAL,
                color: 'white',
                fontWeight: '600',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '16px',
                boxShadow: '0 4px 6px rgba(7, 166, 152, 0.2)'
              }}
              onMouseOver={(e) => {
                e.target.style.background = ED_TEAL_DARK;
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 12px rgba(7, 166, 152, 0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = ED_TEAL;
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px rgba(7, 166, 152, 0.2)';
              }}
            >
              Login to Continue
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 'calc(100vh - 80px)',
          backgroundColor: BG_LIGHT
        }}>
          <div style={{ 
            textAlign: 'center',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}>
            <div 
              style={{ 
                width: '40px',
                height: '40px',
                border: `4px solid ${ED_TEAL_LIGHT}`,
                borderTop: `4px solid ${ED_TEAL}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }}
            ></div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: TEXT_DARK, 
              marginBottom: '0.5rem' 
            }}>
              Loading Your Courses
            </h2>
            <p style={{ color: TEXT_LIGHT, fontSize: '16px' }}>We're preparing your learning journey...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <DashboardLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 'calc(100vh - 80px)',
          padding: '20px',
          backgroundColor: BG_LIGHT
        }}>
          <div style={{ 
            textAlign: 'center', 
            maxWidth: '400px',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}>
            <VscBook style={{ 
              width: '64px', 
              height: '64px', 
              color: ED_TEAL, 
              margin: '0 auto 1rem' 
            }} />
            <h1 style={{ 
              fontSize: '1.75rem', 
              fontWeight: '700', 
              color: TEXT_DARK, 
              marginBottom: '1rem' 
            }}>
              No Courses Yet
            </h1>
            <p style={{ 
              fontSize: '1rem', 
              color: TEXT_LIGHT, 
              marginBottom: '1.5rem',
              lineHeight: '1.5'
            }}>
              You haven't enrolled in any courses yet. Explore our catalog to start learning.
            </p>
            <button
              onClick={() => navigate('/catalog/all')}
              style={{
                background: ED_TEAL,
                color: 'white',
                fontWeight: '600',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '16px',
                boxShadow: '0 4px 6px rgba(7, 166, 152, 0.2)'
              }}
              onMouseOver={(e) => {
                e.target.style.background = ED_TEAL_DARK;
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 12px rgba(7, 166, 152, 0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = ED_TEAL;
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px rgba(7, 166, 152, 0.2)';
              }}
            >
              Browse Courses
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ 
        // maxWidth: '1200px', 
        width: '80%',
        marginLeft: '100px', 
        padding: '10px',
        minHeight: 'calc(100vh - 80px)',
        backgroundColor: BG_LIGHT
      }}>
        <div style={{ 
          marginBottom: '24px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <h1 style={{ 
            fontSize: '1.75rem', 
            fontWeight: '700', 
            color: TEXT_DARK, 
            marginBottom: '0.5rem' 
          }}>
            My Learning
          </h1>
          <p style={{ 
            color: TEXT_LIGHT,
            fontSize: '1rem'
          }}>
            Continue your learning journey from where you left off
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            backgroundColor: ED_TEAL_LIGHT,
            borderBottom: `1px solid ${BORDER}`
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: TEXT_DARK,
              margin: 0
            }}>
              Enrolled Courses ({enrolledCourses.length})
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              color: ED_TEAL,
              fontSize: '14px',
              fontWeight: '500'
            }}>
              <span>Sorted by: Recent</span>
              <VscChevronRight style={{ marginLeft: '4px' }} />
            </div>
          </div>

          <div style={{ padding: '0' }}>
            {enrolledCourses.map((course, idx) => {
              const progress = Math.min(100, Math.max(0, course.progressPercentage || 0));
              return (
                <div 
                  key={course._id}
                  onClick={() => handleCourseClick(course._id)}
                  style={{ 
                    display: 'flex',
                    padding: '20px 24px',
                    borderBottom: idx < enrolledCourses.length - 1 ? `1px solid ${BORDER}` : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'white'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = ED_TEAL_LIGHT;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  {/* Course thumbnail */}
                  <div style={{ 
                    width: '160px', 
                    height: '90px', 
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    marginRight: '20px',
                    position: 'relative'
                  }}>
                    <img 
                      src={course.thumbnail || COURSE_PLACEHOLDER}
                      alt={course.courseName}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = COURSE_PLACEHOLDER; }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    }}>
                      <VscPlay style={{ color: 'white', width: '24px', height: '24px' }} />
                    </div>
                  </div>

                  {/* Course details */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: TEXT_DARK, 
                      margin: '0 0 8px 0',
                      lineHeight: '1.4'
                    }}>
                      {course.courseName}
                    </h3>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: '12px',
                      fontSize: '14px',
                      color: TEXT_LIGHT
                    }}>
                      <VscPerson style={{ marginRight: '6px' }} />
                      <span style={{ marginRight: '16px' }}>
                        {course.instructor?.firstName || 'Instructor'} {course.instructor?.lastName || ''}
                      </span>
                      <VscCalendar style={{ marginRight: '6px' }} />
                      <span>{formatDuration(course.durationInSeconds)}</span>
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        fontSize: '14px',
                        color: TEXT_LIGHT,
                        marginBottom: '6px'
                      }}>
                        <span>Your progress</span>
                        <span style={{ fontWeight: '600', color: ED_TEAL }}>{progress}% Complete</span>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: '8px', 
                        backgroundColor: ED_TEAL_LIGHT, 
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${progress}%`, 
                          height: '100%', 
                          backgroundColor: ED_TEAL, 
                          borderRadius: '4px',
                          transition: 'width 0.5s ease'
                        }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Continue button */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    paddingLeft: '20px'
                  }}>
                    <button style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: ED_TEAL,
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = ED_TEAL_DARK;
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = ED_TEAL;
                    }}
                    >
                      <VscPlay style={{ marginRight: '6px' }} />
                      Continue
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .course-item {
            flex-direction: column !important;
          }
          
          .course-thumbnail {
            width: 100% !important;
            height: 160px !important;
            margin-right: 0 !important;
            margin-bottom: 16px;
          }
          
          .continue-button {
            width: 100%;
            margin-top: 16px;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}