import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createFAQ, updateFAQ, fetchAllFAQs } from '../../../../services/operations/faqAPI';
import { showSuccess, showError } from '../../../../utils/toast';
import { FaArrowLeft, FaSave, FaSpinner, FaChevronRight } from 'react-icons/fa';

const FAQForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchFAQ = async () => {
        try {
          setLoading(true);
          const result = await fetchAllFAQs();
          if (result?.success) {
            const faq = result.data.find(faq => faq._id === id);
            if (faq) {
              setFormData({
                question: faq.question,
                answer: faq.answer,
              });
            } else {
              showError('FAQ not found');
              navigate('/admin/faqs');
            }
          }
        } catch (error) {
          console.error('Error fetching FAQ:', error);
          showError('Failed to load FAQ');
        } finally {
          setLoading(false);
        }
      };
      fetchFAQ();
    }
  }, [id, isEditMode, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.question.trim() || !formData.answer.trim()) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = isEditMode 
        ? await updateFAQ(id, formData, token)
        : await createFAQ(formData, token);

      if (result?.success) {
        showSuccess(`FAQ ${isEditMode ? 'updated' : 'created'} successfully`);
        navigate('/admin/faqs');
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} FAQ:`, error);
      showError(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} FAQ`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Styles
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1.5rem 1rem',
    },
    breadcrumb: {
      display: 'flex',
      marginBottom: '1.5rem',
    },
    breadcrumbList: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
    },
    breadcrumbItem: {
      display: 'inline-flex',
      alignItems: 'center',
    },
    breadcrumbLink: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#1a9a9a',  // Teal color from the image
      textDecoration: 'none',
      transition: 'color 0.2s',
      ':hover': {
        color: '#0d7d7d',  // Darker teal on hover
      },
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '0.5rem',
      border: '1px solid #e1e4e8',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
      padding: '1.5rem',
      marginBottom: '1.5rem',
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '1rem',
      marginBottom: '1.5rem',
      borderBottom: '1px solid #e5e7eb',
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '0.25rem',
    },
    backButton: {
      marginRight: '1rem',
      color: '#4b5563',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '0.25rem',
      transition: 'color 0.2s',
      ':hover': {
        color: '#1f2937',
      },
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#1a9a9a',  // Teal color for the title
      margin: 0,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    description: {
      fontSize: '0.875rem',
      color: '#4b5563',
      marginTop: '0.25rem',
    },
    formContainer: {
      backgroundColor: '#f8fafc',  // Light gray background
      borderRadius: '0.5rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      padding: '2rem',
      border: '1px solid #e1e4e8',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#1a9a9a',  // Teal color for labels
      marginBottom: '0.5rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    input: {
      display: 'block',
      width: '100%',
      borderRadius: '0.25rem',
      border: '1px solid #cbd5e1',
      padding: '0.75rem 1rem',
      fontSize: '0.9375rem',
      backgroundColor: '#ffffff',
      color: '#334155',
      marginTop: '0.25rem',
      transition: 'all 0.2s ease',
      ':focus': {
        outline: 'none',
        borderColor: '#1a9a9a',
        boxShadow: '0 0 0 3px rgba(26, 154, 154, 0.15)',
      },
    },
    textarea: {
      display: 'block',
      width: '100%',
      borderRadius: '0.25rem',
      border: '1px solid #cbd5e1',
      padding: '0.75rem 1rem',
      fontSize: '0.9375rem',
      backgroundColor: '#ffffff',
      color: '#334155',
      marginTop: '0.25rem',
      minHeight: '9rem',
      resize: 'vertical',
      lineHeight: '1.5',
      transition: 'all 0.2s ease',
      ':focus': {
        outline: 'none',
        borderColor: '#1a9a9a',
        boxShadow: '0 0 0 3px rgba(26, 154, 154, 0.15)',
      },
    },
    buttonGroup: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid #e1e4e8',
      marginTop: '1.5rem',
    },
    cancelButton: {
      padding: '0.625rem 1.25rem',
      fontSize: '0.9375rem',
      fontWeight: '600',
      borderRadius: '0.25rem',
      border: '1px solid #cbd5e1',
      backgroundColor: 'white',
      color: '#64748b',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      ':hover': {
        backgroundColor: '#f8fafc',
        borderColor: '#94a3b8',
      },
      ':focus': {
        outline: 'none',
        boxShadow: '0 0 0 3px rgba(100, 116, 139, 0.1)',
      },
      ':disabled': {
        opacity: 0.6,
        cursor: 'not-allowed',
      },
    },
    submitButton: {
      padding: '0.625rem 1.5rem',
      minWidth: '140px',
      fontSize: '0.9375rem',
      fontWeight: '600',
      borderRadius: '0.25rem',
      border: '1px solid #1a9a9a',
      backgroundColor: '#1a9a9a',
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      ':hover': {
        backgroundColor: '#158080',
        borderColor: '#158080',
        transform: 'translateY(-1px)',
      },
      ':focus': {
        outline: 'none',
        boxShadow: '0 0 0 3px rgba(26, 154, 154, 0.3)',
      },
      ':disabled': {
        opacity: 0.6,
        cursor: 'not-allowed',
        transform: 'none',
      },
    },
    spinner: {
      animation: 'spin 1s linear infinite',
      marginRight: '0.5rem',
    },
    helperText: {
      fontSize: '0.8125rem',
      color: '#64748b',
      marginTop: '0.375rem',
      fontStyle: 'italic',
    },
  };

  if (loading && isEditMode) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '16rem',
      }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          borderRadius: '9999px',
          border: '2px solid #0d9488',
          borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite',
        }}></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Breadcrumb */}
      <nav style={styles.breadcrumb} aria-label="Breadcrumb">
        <ol style={styles.breadcrumbList}>
          <li style={styles.breadcrumbItem}>
            <Link to="/admin/dashboard" style={styles.breadcrumbLink}>
              Dashboard
            </Link>
          </li>
          <li style={styles.breadcrumbItem}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <FaChevronRight style={{ width: '1rem', height: '1rem', color: '#9ca3af', margin: '0 0.5rem' }} />
              <Link to="/admin/faqs" style={styles.breadcrumbLink}>
                FAQs
              </Link>
            </span>
          </li>
          <li aria-current="page" style={styles.breadcrumbItem}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FaChevronRight style={{ width: '1rem', height: '1rem', color: '#9ca3af', margin: '0 0.5rem' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>
                {isEditMode ? 'Edit FAQ' : 'New FAQ'}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <button
              onClick={() => navigate(-1)}
              style={styles.backButton}
            >
              <FaArrowLeft style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
            <h1 style={styles.title}>
              {isEditMode ? 'Edit FAQ' : 'Create New FAQ'}
            </h1>
          </div>
          <p style={styles.description}>
            {isEditMode ? 'Update the question and answer below' : 'Fill in the details to create a new FAQ'}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/faqs')}
          style={{
            marginTop: '0.5rem',
            color: '#1a9a9a',
            display: 'flex',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9375rem',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            ':hover': {
              color: '#158080',
              textDecoration: 'underline',
            },
          }}
        >
          ← Back to FAQs
        </button>
      </div>

      <div style={styles.formContainer}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label htmlFor="question" style={styles.label}>
                Question <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                id="question"
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="e.g., How do I reset my password?"
                required
              />
              <p style={styles.helperText}>
                Enter a clear and concise question that users might ask.
              </p>
            </div>

            <div>
              <label htmlFor="answer" style={styles.label}>
                Answer <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                id="answer"
                name="answer"
                rows={6}
                value={formData.answer}
                onChange={handleInputChange}
                style={styles.textarea}
                placeholder="Provide a detailed and helpful answer..."
                required
              ></textarea>
              <p style={styles.helperText}>
                Provide a clear and comprehensive answer to the question.
              </p>
            </div>

            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => navigate('/admin/faqs')}
                style={styles.cancelButton}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner style={styles.spinner} />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <FaSave style={{ marginRight: '0.5rem' }} />
                    {isEditMode ? 'Update FAQ' : 'Create FAQ'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FAQForm;
