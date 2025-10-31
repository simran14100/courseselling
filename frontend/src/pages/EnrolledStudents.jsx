import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getEnrolledStudents } from '../services/operations/adminApi';
import DashboardLayout from '../components/common/DashboardLayout';

const TAWKTO_GREEN = '#009e5c';

export default function EnrolledStudents() {
  const { token } = useSelector((state) => state.auth);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courses, setCourses] = useState([]);
  const [coursesError, setCoursesError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('all');

  useEffect(() => {
    async function fetchEnrolledStudents() {
      setLoading(true);
      setError(null);
      try {
        const { items } = await getEnrolledStudents(token, { 
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          includeAdminCreated: true
        });
        setStudents(items || []);
      } catch (err) {
        setError('Failed to load enrolled students');
        console.error('Error fetching enrolled students:', err);
      } finally {
        setLoading(false);
      }
    }
    
    const timer = setTimeout(() => {
      fetchEnrolledStudents();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [token, searchTerm, currentPage, itemsPerPage]);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  // Filter students based on search term
  const filteredStudents = students.filter(student => {
    if (!student) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      (student.firstName?.toLowerCase().includes(searchLower) || '') ||
      (student.lastName?.toLowerCase().includes(searchLower) || '') ||
      (student.email?.toLowerCase().includes(searchLower) || '')
    );
  });

  // Get current students for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  return (
    <DashboardLayout>
      <div style={{
        padding: '24px',
        backgroundColor: '#f5f7fa',
        minHeight: 'calc(100vh - 64px)',
        boxSizing: 'border-box'
      }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Enrolled Students</h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {currentStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By Admin</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full"
                                src={student.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'U'
                                )}&background=random`}
                                alt=""
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {student.firstName} {student.lastName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.phone || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            student.enrollmentFeePaid && student.paymentStatus === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {student.enrollmentFeePaid && student.paymentStatus === 'Completed'
                              ? 'Enrolled'
                              : 'Pending Enrollment'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.createdByAdmin ? 'Yes' : 'No'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No students found</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastItem, filteredStudents.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredStudents.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">First</span>
                        «
                      </button>
                      <button
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        ‹
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNum
                                ? 'z-10 bg-green-50 border-green-500 text-green-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>
                        ›
                      </button>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Last</span>
                        »
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      
      
      {/* Filter Section */}
      {/* <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        padding: '24px',
        marginBottom: '32px',
        marginTop: '20px'

      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#374151',
            display: 'flex',
            alignItems: 'center'
          }}>
                         <svg style={{ width: '20px', height: '20px', marginRight: '8px', color: '#07A698' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter by Course:
          </label>
          {loadingCourses ? (
                         <div style={{ display: 'flex', alignItems: 'center', color: '#07A698', fontWeight: '600' }}>
              <div style={{
                width: '16px',
                height: '16px',
                                 border: '2px solid #07A698',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '8px'
              }}></div>
              Loading courses...
            </div>
          ) : coursesError ? (
            <span style={{ color: '#ef4444', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
              <svg style={{ width: '20px', height: '20px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {coursesError}
            </span>
          ) : (
            <select
              style={{
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#374151',
                backgroundColor: 'white',
                minWidth: '200px',
                outline: 'none'
              }}
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.courseName}</option>
              ))}
            </select>
          )}
        </div>
        </div>
         */}
      {/* Table Section */}
      {/* {(() => {
        if (loadingCourses) {
          return (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              padding: '48px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                                 border: '3px solid #07A698',
                borderTop: '3px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
                             <p style={{ fontSize: '18px', color: '#07A698', fontWeight: '600', margin: '0 0 8px 0' }}>Loading courses...</p>
              <p style={{ color: '#6b7280', margin: '0' }}>Please wait while we fetch the data</p>
            </div>
          );
        } else if (coursesError) {
          return (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              padding: '48px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#fef2f2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <svg style={{ width: '32px', height: '32px', color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
          </div>
              <p style={{ fontSize: '18px', color: '#ef4444', fontWeight: '600', margin: '0 0 8px 0' }}>{coursesError}</p>
              <p style={{ color: '#6b7280', margin: '0' }}>Please try refreshing the page</p>
          </div>
          );
        } else {
          return (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                                         <tr style={{ background: 'linear-gradient(135deg, #07A698 0%, #059a8c 100%)' }}>
                      <th style={{ padding: '16px 24px', textAlign: 'left', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Student Name</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Email Address</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Courses Enrolled</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Total Courses</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                        <td colSpan={4} style={{ padding: '48px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{
                              width: '64px',
                              height: '64px',
                              backgroundColor: '#f3f4f6',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: '16px'
                            }}>
                              <svg style={{ width: '32px', height: '32px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <p style={{ fontSize: '20px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>No enrolled students found</p>
                            <p style={{ color: '#6b7280', margin: '0' }}>There are currently no students enrolled in the selected course.</p>
                          </div>
                        </td>
                  </tr>
                ) : (
                      filteredStudents.map((student, index) => (
                        <tr key={student._id} style={{ 
                          borderBottom: '1px solid #f3f4f6',
                          backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb'
                        }}>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                                                 background: 'linear-gradient(135deg, #07A698 0%, #059a8c 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '12px'
                              }}>
                                <span style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>
                                  {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p style={{ fontWeight: '600', color: '#111827', margin: '0' }}>{student.firstName} {student.lastName}</p>
                                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>Student ID: {student._id?.slice(-6)}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <svg style={{ width: '16px', height: '16px', color: '#9ca3af', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span style={{ color: '#374151' }}>{student.email}</span>
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {courses.filter(course => {
                                const students = course.studentsEnrolled;
                                if (Array.isArray(students)) {
                                  return students.some(s => s._id === student._id);
                                } else if (students && typeof students === 'object') {
                                  return Object.values(students).some(s => s._id === student._id);
                                } else {
                                  return false;
                                }
                              }).map(course => (
                                <span key={course._id} style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '4px 12px',
                                  borderRadius: '16px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                 backgroundColor: '#07A698',
                                  color: 'white'
                                }}>
                                  {course.courseName}
                                </span>
                              ))}
                            </div>
                      </td>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                backgroundColor: '#dbeafe',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '8px'
                              }}>
                                <span style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '14px' }}>
                                  {courses.filter(course => {
                                    const students = course.studentsEnrolled;
                                    if (Array.isArray(students)) {
                                      return students.some(s => s._id === student._id);
                                    } else if (students && typeof students === 'object') {
                                      return Object.values(students).some(s => s._id === student._id);
                                    } else {
                                      return false;
                                    }
                                  }).length}
                                </span>
                              </div>
                              <span style={{ color: '#374151', fontWeight: '500' }}>courses</span>
                            </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
      </div>
    </div>
          );
        }
      })()} */}
      
             <style>
         {`
           @keyframes spin {
             0% { transform: rotate(0deg); }
             100% { transform: rotate(360deg); }
           }
         `}
       </style>
       </div>
     </DashboardLayout>
  );
} 