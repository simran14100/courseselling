import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import FAQList from './FAQList';
import FAQForm from './FAQForm';

const FAQ = () => {
  const navigate = useNavigate();
  
  React.useEffect(() => {
    if (window.location.pathname === '/admin/faqs') {
      navigate('/admin/faqs/');
    }
  }, [navigate]);
  
  return (
    <div className="min-h-screen bg-richblack-900">
      <Routes>
        <Route path="/" element={<FAQList />} />
        <Route path="/create" element={<FAQForm />} />
        <Route path="/edit/:id" element={<FAQForm />} />
      </Routes>
    </div>
  );
};

export default FAQ;
