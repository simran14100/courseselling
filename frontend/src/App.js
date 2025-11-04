import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './store';
import { debugLocalStorage } from './utils/localStorage';
import { ACCOUNT_TYPE } from './utils/constants';
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Catalog from "./pages/Catalog";
import EnrollmentPayment from "./pages/EnrollmentPayment";
import AdminDashboard from "./pages/AdminDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import AdmissionConfirmation from "./pages/AdmissionConfirmation";
import PaymentInstallments from "./pages/PaymentInstallments";
import AllCourses from "./pages/AllCourses";
import Categories from "./pages/Categories";
import AdminProfile from './pages/AdminProfile';
import Settings from "./components/common/setting/Settings";
import AdminLayout from './components/common/AdminLayout';
import Sidebar from './components/common/Sidebar';
import MyCourses from './pages/MyCourses';
import LiveClasses from './pages/LiveClasses';
import EnrolledStudents from './pages/EnrolledStudents';
import TokenManager from './components/common/TokenManager';

import AllUsers from './components/core/Admin/UserManagement/User/AllUser';
import Category from "./pages/Category";

import Cart from './pages/Cart';
import ActiveCourses from './pages/ActiveCourses';



import Assignments from "./pages/Assignments";
import AssignmentDetail from './pages/AssignmentDetail';
import AdminNotifications from './pages/AdminNotifications';
import Notifications from './pages/Notifications';
import Blog from './pages/Admin/Blog';
import BlogDetails from './pages/BlogDetails';




import EditCourse from './components/core/EditCourse';
import CourseViewer from './pages/CourseViewer';
import ViewCourse from './pages/ViewCourse';
import CourseDetails from './pages/CourseDetails';
import Checkout from './pages/Checkout';
import CreateCategory from './components/core/Admin/Category/createCategory';
import AllCategories from "./components/core/Admin/Category/allCategory";
import SubCategory from "./components/core/Admin/SubCategory/SubCategory";
import AllSubCategory from "./components/core/Admin/SubCategory/AllSubCategory";
import CreateCourse from './components/core/Admin/Course/createCourse';
import NewUser from './components/core/Admin/UserManagement/User/NewUser';
import AllCourse from './components/core/Admin/Course/AllCourse';
import CreateBatch from './components/core/Admin/BatchManagement/CreateBatch';
import AllBatches from './components/core/Admin/BatchManagement/AllBatches';
import EditPage from './components/core/Admin/BatchManagement/EditPage';
import CreateStudent from './components/core/Admin/StudentManagement/CreateStudent';
import CreateStudentsLanding from './components/core/Admin/StudentManagement/CreateStudentsLanding';
import BulkUploadStudents from './components/core/Admin/StudentManagement/BulkUploadStudents';
import CreateUserType from './components/core/Admin/UserManagement/UserType/CreateUserType';
import AllUserTypes from './components/core/Admin/UserManagement/UserType/AllUserTypes';
import AdminMyCourses from './pages/AdminMyCourses';
import FAQ from './components/core/Admin/FAQ/FAQ';


import BatchDepartments from './components/core/Admin/BatchManagement/BatchDepartments';

import DashboardLayout from './components/common/DashboardLayout';




// Debug Redux store on app start
console.log("App starting - Redux store state:", store.getState());
console.log("App starting - localStorage debug:");
debugLocalStorage();

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useSelector((state) => state.profile);
  const authState = useSelector((state) => state.auth);
  
  // Debug logging
  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - Auth State:', authState);
  console.log('ProtectedRoute - Allowed Roles:', allowedRoles);
  
  if (!user) {
    console.log('ProtectedRoute - No user found, redirecting to login');
    return <Login />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.accountType)) {
    console.log('ProtectedRoute - User role not allowed, redirecting to profile');
    // Redirect to appropriate dashboard based on user role
    const redirectPath = 
      user.accountType === ACCOUNT_TYPE.STUDENT ? '/dashboard/my-profile' :
      user.accountType === ACCOUNT_TYPE.INSTRUCTOR ? '/dashboard/instructor' :
      user.accountType === ACCOUNT_TYPE.ADMIN ? '/admin/dashboard' :
      '/dashboard';
    
    return <Navigate to={redirectPath} replace />;
  }
  
  console.log('ProtectedRoute - Access granted');
  return children;
}

function AppRoutes() {
  const { user } = useSelector((state) => state.profile);
  
  // Inline layout to use centralized Sidebar with UG/PG variant
  const UGPGInlineLayout = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    useEffect(() => {
      const check = () => setIsMobile(window.innerWidth <= 1024);
      check();
      window.addEventListener('resize', check);
      const openHandler = () => setIsSidebarOpen(true);
      const toggleHandler = () => setIsSidebarOpen(prev => !prev);
      window.addEventListener('dashboard:openSidebar', openHandler);
      window.addEventListener('dashboard:toggleSidebar', toggleHandler);
      return () => {
        window.removeEventListener('resize', check);
        window.removeEventListener('dashboard:openSidebar', openHandler);
        window.removeEventListener('dashboard:toggleSidebar', toggleHandler);
      };
    }, []);
    return (
      <div className="bg-white flex">
        <Sidebar variant="ugpg" isMobile={isMobile} isOpen={isSidebarOpen || !isMobile} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 pt-[120px] p-8" style={{ marginLeft: isMobile ? 0 : 260 }}>
          <Outlet />
        </div>
      </div>
    );
  };
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/courses" element={<AllCourses />} />
      <Route path="/categories" element={<Categories />} />
      
      <Route path="/category/:categoryId" element={<Category />} />
      <Route path="/catalog/:catalogName" element={<Catalog />} />
      <Route path="/courses/:courseId" element={<CourseDetails />} />
      <Route path="/enrollment-payment" element={<EnrollmentPayment />} />
      <Route path="/course/:courseId" element={<CourseViewer />} />
      <Route path="/course/:courseId/:sectionId/:subsectionId" element={<CourseViewer />} />

      {/* Alternate routes to keep legacy ViewCourse page accessible */}
      <Route path="/viewcourse/:courseId" element={<ViewCourse />} />
      <Route path="/viewcourse/:courseId/:sectionId/:subsectionId" element={<ViewCourse />} />
      
      {/* Blog Routes */}
      <Route path="/blog/:blogId" element={<BlogDetails />} />

      {/* Dashboard Routes - Common for all authenticated users */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard isEnrolledStudentView={window.location.pathname.startsWith('/dashboard/accounts')} />
        </ProtectedRoute>
      }>
        <Route path="my-profile" element={<AdminProfile />} />
        <Route path="settings" element={<Settings />} />
        
        {/* Student Routes */}
        {user?.accountType === ACCOUNT_TYPE.STUDENT && (
          <>
            <Route path="my-courses" element={<MyCourses />} />
            <Route path="enrolled-courses" element={<ActiveCourses />} />
            <Route path="live-classes" element={<LiveClasses />} />
            <Route path="enrolled-students" element={<EnrolledStudents />} />
            <Route path="admission-confirmation" element={<AdmissionConfirmation />} />
            {/* <Route path="new-registration" element={<NewRegistration />} /> */}
            <Route path="notifications" element={<Notifications />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="assignments/:assignmentId" element={<AssignmentDetail />} />
          </>
        )}
        
        
        {/* Cart routes - Accessible to Students, Admins, and SuperAdmins */}
        {[ACCOUNT_TYPE.STUDENT, ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.SUPER_ADMIN].includes(user?.accountType) && (
          <>
          <Route path="cart">
  <Route index element={<Cart />} />
  <Route 
    path="checkout" 
    element={
      <DashboardLayout>
        <Checkout />
      </DashboardLayout>
    } 
  />
</Route>
            {/* <Route path="cart" element={<Cart />} />
            <Route path="cart/checkout" element={<Checkout />} /> */}
          </>
        )}

        {/* Instructor Routes */}
        {user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
          <>
            <Route path="instructor" element={<InstructorDashboard />} />
            <Route path="my-courses" element={<MyCourses />} />
            {/* <Route path="add-course" element={<AddCourse />} /> */}
            <Route path="edit-course/:courseId" element={<EditCourse />} />
          </>
        )}
      </Route>

      {/* Admin Routes */}
      {[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.SUPER_ADMIN].includes(user?.accountType) && (
        <>
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/users/*" element={<AllUsers />} />
          <Route path="admin/notifications" element={<AdminNotifications />} />
          <Route path="admin/blogs/*" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <Blog />
            </ProtectedRoute>
          } />
        </>
      )}

      {/* Admin Routes (Admin + Instructor + SuperAdmin) */}
      {(user?.accountType === ACCOUNT_TYPE.ADMIN || user?.accountType === ACCOUNT_TYPE.INSTRUCTOR || user?.accountType === ACCOUNT_TYPE.SUPER_ADMIN) && (
        <>
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/notifications" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <AdminNotifications />
            </ProtectedRoute>
          } />
          
          {/* Category Management */}
          <Route path="/admin/categories/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <CreateCategory />
            </ProtectedRoute>
          } />
          <Route path="/admin/categories/allCategories" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <AllCategories />
            </ProtectedRoute>
          } />
          
          {/* Sub Category Management */}
          <Route path="/admin/subcategories/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <SubCategory />
            </ProtectedRoute>
          } />
          <Route path="/admin/subcategories/allSubCategories" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <AllSubCategory />
            </ProtectedRoute>
          } />
          
          {/* Course Management */}
          <Route path="/admin/course/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <CreateCourse />
            </ProtectedRoute>
          } />
          <Route path="/admin/course/edit/:courseId" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <EditCourse />
            </ProtectedRoute>
          } />
          <Route path="/admin/my-courses" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <AdminMyCourses />
            </ProtectedRoute>
          } />
          <Route path="/admin/course/scromCourse" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <div>Create Scrom Course Page</div>
            </ProtectedRoute>
          } />
          <Route path="/admin/course/allScromCourses" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <div>All Scrom Courses Page</div>
            </ProtectedRoute>
          } />
          <Route path="/admin/course/allCourses" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
             <AllCourse />
            </ProtectedRoute>
          } />
          
          {/* FAQ Management */}
          <Route path="/admin/faqs/*" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <FAQ />
            </ProtectedRoute>
          } />
          
          {/* Blog Management */}
          <Route path="/admin/blogs/*" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <Blog />
            </ProtectedRoute>
          } />
          
          {/* Batch Management */}
          <Route path="/admin/batches/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <CreateBatch />
            </ProtectedRoute>
          } />
          <Route path="/admin/batches/departments" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <BatchDepartments />
            </ProtectedRoute>
          } />
          <Route path="/admin/batches" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <AllBatches />
            </ProtectedRoute>
          } />
          <Route path="/admin/batches/:batchId/edit" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <EditPage />
            </ProtectedRoute>
          } />
          
          {/* Student Management */}
          {/* <Route path="/admin/students/admission" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN]}>
              <AdmissionConfirmation />
            </ProtectedRoute>
          } /> */}
          <Route path="/admin/students/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <CreateStudentsLanding />
            </ProtectedRoute>
          } />
          <Route path="/admin/students/create/single" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <CreateStudent />
            </ProtectedRoute>
          } />
          <Route path="/admin/students/create/multiple" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <BulkUploadStudents />
            </ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <EnrolledStudents />
            </ProtectedRoute>
          } />
          
          {/* User Management */}
          <Route path="/admin/users/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <NewUser/>
            </ProtectedRoute>
          } />
          <Route path="/admin/user-types/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <CreateUserType />
            </ProtectedRoute>
          } />
          <Route path="/admin/user-types" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <AllUserTypes />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={<Navigate to="/admin/all-users" replace />} />
          <Route path="/admin/all-users" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <AllUsers />
            </ProtectedRoute>
          } />
        </>
      )}

      {/* Content-manager limited Admin-like Routes */}
      {user?.accountType === ACCOUNT_TYPE.CONTENT_MANAGER && (
        <>
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.CONTENT_MANAGER, ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Course Management (Content-manager) */}
          <Route path="/admin/course/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.CONTENT_MANAGER, ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <CreateCourse />
            </ProtectedRoute>
          } />
          <Route path="/admin/course/allCourses" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.CONTENT_MANAGER, ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <AllCourse />
            </ProtectedRoute>
          } />

          {/* Batch Management (Content-manager) */}
          <Route path="/admin/batches/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.CONTENT_MANAGER, ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <CreateBatch />
            </ProtectedRoute>
          } />
          <Route path="/admin/batches" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.CONTENT_MANAGER, ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <AllBatches />
            </ProtectedRoute>
          } />
          <Route path="/admin/batches/:batchId/edit" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.CONTENT_MANAGER, ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <EditPage />
            </ProtectedRoute>
          } />
        </>
      )}

      {/* Instructor Routes */}
      {user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
        <>
          {/* Add instructor-specific routes here */}
        </>
      )}
    </Routes>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <div className="flex min-h-screen flex-col">
            <TokenManager />
            <Navbar />
            <main className="flex-1">
              <AppRoutes />
            </main>
            {/* <Footer /> */}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  maxWidth: 450,
                  marginTop: 80,
                  zIndex: 99999
                }
              }}
            />
          </div>
        </Router>
      </PersistGate>
    </Provider>
  );
}

export default App;