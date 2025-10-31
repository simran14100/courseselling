 import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ACCOUNT_TYPE } from '../utils/constants';
import { setUser } from '../store/slices/profileSlice';
import { apiConnector } from '../services/apiConnector';
import Sidebar from '../components/common/Sidebar';

const Dashboard = ({ isEnrolledStudentView = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => ({
    user: state.profile.user,
    token: state.auth.token
  }));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // University status check removed as it's not implemented in the backend
    setLoading(false);

    // Redirect SuperAdmin to /dashboard/my-profile
    if (user?.accountType === ACCOUNT_TYPE.SUPER_ADMIN && window.location.pathname === '/dashboard') {
      navigate('/dashboard/my-profile', { replace: true });
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Determine the variant based on user's university status or explicit prop
  const sidebarVariant = isEnrolledStudentView || user?.isUniversityStudent ? 'EnrolledStudents' : 'default';

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar variant={sidebarVariant} />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto focus:outline-none" style={{ paddingTop: '120px' }}>
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

Dashboard.propTypes = {
  isEnrolledStudentView: PropTypes.bool
};

Dashboard.defaultProps = {
  isEnrolledStudentView: false
};

export default Dashboard;