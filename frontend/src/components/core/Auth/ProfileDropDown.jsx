import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { VscDashboard, VscSignOut } from "react-icons/vsc";
import { FiBookOpen } from "react-icons/fi";
import { AiOutlineCaretDown } from "react-icons/ai";
import { ACCOUNT_TYPE } from '../../../utils/constants';
import { logout } from '../../../services/operations/authApi';

const ProfileDropDown = ({ mobile = false }) => {
    const { user } = useSelector((state) => state.profile);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();
    const isAdminLike = [ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN].includes(user?.accountType);
    
    // Debug logs
    useEffect(() => {
        console.log('🔍 [ProfileDropDown] User data:', user);
        if (user) {
            console.log('🔍 [ProfileDropDown] User name data:', {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                hasName: !!(user.firstName || user.lastName)
            });
        }
    }, [user]);
    
    // Helper function to get display name
    const getDisplayName = () => {
        if (!user) return 'User';
        
        // Log the user object for debugging
        console.log('🔍 [getDisplayName] User object:', user);
        
        // Check if we have a display name from the backend
        if (user.displayName) {
            return user.displayName;
        }
        
        // Fallback to first + last name
        const firstName = user.firstName || user.firstname || '';
        const lastName = user.lastName || user.lastname || '';
        
        if (firstName || lastName) {
            const name = `${firstName} ${lastName}`.trim();
            console.log('🔍 [getDisplayName] Generated name from firstName/lastName:', name);
            return name;
        }
        
        // Fallback to email username
        if (user.email) {
            const emailName = user.email.split('@')[0];
            console.log('🔍 [getDisplayName] Using email name:', emailName);
            return emailName;
        }
        
        // Final fallback
        console.log('🔍 [getDisplayName] No name found, using fallback');
        return 'User';
    };
    
    // Helper function to get initials
    const getInitials = () => {
        if (!user) return 'U';
        
        console.log('🔍 [getInitials] User object:', user);
        
        // If we have initials from the backend, use them
        if (user.initials) {
            console.log('🔍 [getInitials] Using initials from backend:', user.initials);
            return user.initials;
        }
        
        // Try to get from first and last name (case-insensitive)
        const firstName = user.firstName || user.firstname || '';
        const lastName = user.lastName || user.lastname || '';
        
        const first = firstName ? firstName[0] : '';
        const last = lastName ? lastName[0] : '';
        
        if (first || last) {
            const initials = `${first}${last}`.toUpperCase() || 'U';
            console.log('🔍 [getInitials] Generated initials from name:', initials);
            return initials;
        }
        
        // Fallback to email first character
        if (user.email) {
            const emailInitial = user.email[0].toUpperCase();
            console.log('🔍 [getInitials] Using email initial:', emailInitial);
            return emailInitial;
        }
        
        // Final fallback
        console.log('🔍 [getInitials] No initials found, using fallback');
        return 'U';
    };
    
    // Show "My Courses" only for Super Admin (hide for Instructor and Admin)
    const showMyCourses = user?.accountType === ACCOUNT_TYPE.SUPER_ADMIN;

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!isOpen) return;
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Close dropdown on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        // Use the logout operation function
        dispatch(logout(navigate));
        setIsOpen(false);
    };

    const getRoleDisplayName = (accountType) => {
        switch (accountType) {
            case ACCOUNT_TYPE.STUDENT:
                return "Student";
            case ACCOUNT_TYPE.INSTRUCTOR:
                return "Instructor";
            case ACCOUNT_TYPE.ADMIN:
                return "Admin";
            case ACCOUNT_TYPE.SUPER_ADMIN:
                return "Super Admin";
            case ACCOUNT_TYPE.STAFF:
                return "Staff";
            default:
                return "User";
        }
    };

    const getDashboardLink = () => {
        switch (user?.accountType) {
            case ACCOUNT_TYPE.STUDENT:  
                return "/dashboard/my-profile";
            case ACCOUNT_TYPE.INSTRUCTOR:
                return "/dashboard/my-profile";
            case ACCOUNT_TYPE.ADMIN:
            case ACCOUNT_TYPE.SUPER_ADMIN:
            case ACCOUNT_TYPE.STAFF:
                return "/admin/dashboard";
            default:
                return "/dashboard/my-profile";
        }
    };

    if (mobile) {
        return (
            <div className="w-full">
                <div className="flex items-center gap-3 p-4 border-b border-richblack-700 bg-richblack-800 rounded-lg mb-4">
                    <div className="w-12 h-12 rounded-full border-2 border-yellow-25 shadow-lg flex items-center justify-center bg-richblack-700 overflow-hidden">
                        {user?.image ? (
                            <img
                                src={user.image}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-yellow-25 font-bold text-xl">
                                {getInitials()}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-semibold text-richblack-25">
                            {getDisplayName()}
                            {user?.accountType === ACCOUNT_TYPE.STUDENT && user?.enrollmentFeePaid && (
                                <span className="ml-2 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full align-middle">Paid</span>
                            )}
                        </span>
                        <span className="text-sm text-yellow-25 font-medium">
                            {getRoleDisplayName(user?.accountType)}
                        </span>
                    </div>
                </div>
                
                <div className="flex flex-col gap-2">
                    <Link
                        to={getDashboardLink()}
                        className="flex items-center gap-3 px-4 py-3 text-richblack-100 hover:bg-richblack-700 hover:text-yellow-25 rounded-lg transition-all duration-300 font-medium"
                        onClick={() => setIsOpen(false)}
                    >
                        <VscDashboard className="text-lg" />
                        <span>Dashboard</span>
                    </Link>
                    {showMyCourses && (
                        <Link
                            to="/admin/my-courses"
                            className="flex items-center gap-3 px-4 py-3 text-richblack-100 hover:bg-richblack-700 hover:text-yellow-25 rounded-lg transition-all duration-300 font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            <FiBookOpen className="text-lg" />
                            <span>My Courses</span>
                        </Link>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-all duration-300 font-medium text-left w-full"
                    >
                        <VscSignOut className="text-lg" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-2 rounded-lg border border-[#009e5c] bg-white hover:bg-[#f9fefb] transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-[#009e5c]"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <div className="w-10 h-10 rounded-full border-2 border-[#009e5c] shadow group-hover:border-[#007a44] transition-all duration-300 bg-white flex items-center justify-center overflow-hidden">
                    {user?.image ? (
                        <img
                            src={user.image}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-[#009e5c] font-bold text-lg">
                            {getInitials()}
                        </span>
                    )}
                </div>
                <span className="text-gray-900 text-sm font-medium group-hover:text-[#009e5c] transition-colors duration-300">
                    {getDisplayName()}
                    {user?.accountType === ACCOUNT_TYPE.STUDENT && user?.enrollmentFeePaid && (
                        <span className="ml-2 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full align-middle">Paid</span>
                    )}
                </span>
                <AiOutlineCaretDown className={`text-base text-[#009e5c] group-hover:text-[#007a44] transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-xl shadow-2xl border border-[#009e5c] z-50 animate-fade-in">
                    <div className="p-4 border-b border-[#e0e0e0]">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full border-2 border-[#009e5c] shadow flex items-center justify-center bg-white overflow-hidden">
                                {user?.image ? (
                                    <img
                                        src={user.image}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-[#009e5c] font-bold text-xl">
                                        {getInitials()}
                                    </span>
                                )}
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-gray-900">
                                    {getDisplayName()}
                                    {user?.accountType === ACCOUNT_TYPE.STUDENT && user?.enrollmentFeePaid && (
                                        <span className="ml-2 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full align-middle">Paid</span>
                                    )}
                                </div>
                                <div className="text-xs text-[#009e5c] font-medium">
                                    {getRoleDisplayName(user?.accountType)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="py-2">
                        <Link
                            to={getDashboardLink()}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-[#f9fefb] hover:text-[#007a44] transition-all duration-300 font-medium rounded-lg"
                            onClick={() => setIsOpen(false)}
                        >
                            <VscDashboard className="text-lg text-[#009e5c] group-hover:text-[#007a44]" />
                            <span>Dashboard</span>
                        </Link>
                        {showMyCourses && (
                            <Link
                                to="/admin/my-courses"
                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-[#f9fefb] hover:text-[#007a44] transition-all duration-300 font-medium rounded-lg"
                                onClick={() => setIsOpen(false)}
                            >
                                <FiBookOpen className="text-lg text-[#009e5c] group-hover:text-[#007a44]" />
                                <span>My Courses</span>
                            </Link>
                        )}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 hover:text-red-700 transition-all duration-300 font-medium w-full text-left rounded-lg"
                        >
                            <VscSignOut className="text-lg text-red-500" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDropDown;