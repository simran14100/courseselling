import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FAQList from './FAQList';
import FAQForm from './FAQForm';
import Sidebar from '../../../common/Sidebar';

const FAQ = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

  // Common layout with sidebar
  const Layout = ({ children }) => (
    <div className="bg-white flex">
      <Sidebar 
        variant="admin" 
        isMobile={isMobile} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      <div 
        className="flex-1 pt-[120px] p-8" 
        style={{ marginLeft: isMobile ? 0 : 260 }}
      >
        {children}
      </div>
    </div>
  );

  // Show FAQList if we're at /admin/faqs or /admin/faqs/
  if (location.pathname === '/admin/faqs' || location.pathname === '/admin/faqs/') {
    return (
      <Layout>
        <FAQList />
      </Layout>
    );
  }
  
  // Show FAQForm for create and edit routes
  return (
    <Layout>
      <FAQForm />
    </Layout>
  );
};

export default FAQ;
