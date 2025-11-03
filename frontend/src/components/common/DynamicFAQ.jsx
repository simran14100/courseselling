import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DynamicFAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/v1/faq');
        if (response.data.success) {
          setFaqs(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching FAQs:', err);
        setError('Failed to load FAQs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading FAQs...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>{error}</div>;
  }

  if (faqs.length === 0) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>No FAQs available.</div>;
  }

  return (
    <div className="faq-accordion">
      <div className="accordion" id="accordionExample">
        {faqs.map((faq, index) => (
          <div 
            key={faq._id} 
            className="accordion-item" 
            style={{ 
              border: '1px solid #E8ECF0', 
              borderRadius: '10px', 
              marginBottom: '15px', 
              overflow: 'hidden' 
            }}
          >
            <h2 className="accordion-header" id={`heading${index}`}>
              <button 
                className={`accordion-button ${activeIndex === index ? '' : 'collapsed'}`} 
                type="button" 
                onClick={() => toggleAccordion(index)}
                aria-expanded={activeIndex === index ? 'true' : 'false'}
                aria-controls={`collapse${index}`}
                style={{
                  backgroundColor: '#ffffff',
                  border: 'none',
                  padding: '20px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#191A1F',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  outline: 'none',
                  boxShadow: 'none'
                }}
              >
                <span style={{
                  backgroundColor: '#07A698',
                  color: '#ffffff',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  flexShrink: 0
                }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                {faq.question}
              </button>
            </h2>
            <div 
              id={`collapse${index}`} 
              className={`accordion-collapse collapse ${activeIndex === index ? 'show' : ''}`} 
              aria-labelledby={`heading${index}`}
              data-bs-parent="#accordionExample"
            >
              <div className="accordion-body" style={{
                padding: '20px',
                backgroundColor: '#f8f9fa',
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#666',
                borderTop: '1px solid #E8ECF0'
              }}>
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DynamicFAQ;
