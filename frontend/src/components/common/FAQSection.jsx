import React, { useState, useEffect } from 'react';
import { fetchAllFAQs } from '../../services/operations/faqAPI';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FAQSection = () => {
  const [faqs, setFaqs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFAQs = async () => {
      try {
        const result = await fetchAllFAQs();
        if (result && result.success) {
          setFaqs(result.data || []);
        }
      } catch (error) {
        console.error('Error loading FAQs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFAQs();
  }, []);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (loading) {
    return (
      <section className="py-12 bg-richblack-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Frequently Asked Questions</span>
            </h2>
            <div className="mt-8 text-lg text-richblack-300">Loading FAQs...</div>
          </div>
        </div>
      </section>
    );
  }

  if (faqs.length === 0) {
    return null; // Don't render anything if no FAQs
  }

  return (
    <section className="py-12 bg-richblack-900" id="faq">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Frequently Asked Questions</span>
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-richblack-300 sm:mt-4">
            Find answers to common questions about our courses and services.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={faq._id} 
                className="bg-richblack-800 rounded-lg overflow-hidden shadow-lg"
              >
                <button
                  className={`w-full px-6 py-4 text-left focus:outline-none transition-colors duration-200 ${
                    activeIndex === index ? 'bg-richblack-700' : 'hover:bg-richblack-700'
                  }`}
                  onClick={() => toggleFAQ(index)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-yellow-50">
                      {faq.question}
                    </h3>
                    <span className="text-yellow-50">
                      {activeIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                  </div>
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ${
                    activeIndex === index ? 'max-h-96 py-4' : 'max-h-0 py-0'
                  }`}
                >
                  <div className="pb-4 text-richblack-100">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
