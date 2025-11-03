import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaChevronRight } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { deleteFAQ, fetchAllFAQs } from '../../../../services/operations/faqAPI';
import { showSuccess, showError } from '../../../../utils/toast';
import { useNavigate, Link } from 'react-router-dom';

const FAQList = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const result = await fetchAllFAQs();
      if (result && result.success) {
        setFaqs(result.data);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      showError('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        const result = await deleteFAQ(id, token);
        if (result && result.success) {
          showSuccess('FAQ deleted successfully');
          fetchFAQs();
        }
      } catch (error) {
        console.error('Error deleting FAQ:', error);
        showError('Failed to delete FAQ');
      }
    }
  };

  // Styles
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '3rem auto 0', // Added top margin of 2rem
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
      color: '#1a9a9a',
      textDecoration: 'none',
      transition: 'color 0.2s',
      ':hover': {
        color: '#0d7d7d',
      },
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '1.5rem',
    },
    headerContent: {
      display: 'flex',
      flexDirection: 'column',
      '@media (min-width: 768px)': {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1e293b',
      margin: 0,
      marginBottom: '0.25rem',
    },
    subtitle: {
      fontSize: '0.875rem',
      color: '#64748b',
      margin: 0,
    },
    addButton: {
      marginTop: '1rem',
      backgroundColor: '#1a9a9a',
      color: 'white',
      fontWeight: '500',
      padding: '0.5rem 1rem',
      borderRadius: '0.375rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      border: 'none',
      cursor: 'pointer',
      ':hover': {
        backgroundColor: '#158080',
      },
      '@media (min-width: 768px)': {
        marginTop: 0,
      },
    },
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    tableHeader: {
      backgroundColor: '#f8fafc',
    },
    tableHeaderCell: {
      padding: '0.75rem 1.5rem',
      textAlign: 'left',
      fontSize: '0.75rem',
      fontWeight: '500',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    tableRow: {
      transition: 'background-color 0.2s ease',
      ':hover': {
        backgroundColor: '#f8fafc',
      },
    },
    tableCell: {
      padding: '1rem 1.5rem',
      verticalAlign: 'top',
      borderBottom: '1px solid #e2e8f0',
    },
    questionText: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#1e293b',
      margin: 0,
    },
    answerText: {
      fontSize: '0.875rem',
      color: '#64748b',
      margin: 0,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },
    actionButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#1a9a9a',
      cursor: 'pointer',
      marginLeft: '1rem',
      transition: 'color 0.2s ease',
      padding: '0.25rem',
      ':hover': {
        color: '#0d7d7d',
      },
    },
    deleteButton: {
      color: '#ef4444',
      ':hover': {
        color: '#dc2626',
      },
    },
    emptyState: {
      padding: '3rem 1.5rem',
      textAlign: 'center',
    },
    emptyText: {
      color: '#64748b',
      marginBottom: '0.5rem',
    },
    createButton: {
      color: '#1a9a9a',
      fontWeight: '500',
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      transition: 'color 0.2s ease',
      ':hover': {
        color: '#0d7d7d',
      },
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '16rem',
    },
    spinner: {
      width: '3rem',
      height: '3rem',
      borderRadius: '50%',
      border: '2px solid #1a9a9a',
      borderTopColor: 'transparent',
      animation: 'spin 1s linear infinite',
    },
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
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
          <li aria-current="page">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FaChevronRight style={{ width: '1rem', height: '1rem', color: '#9ca3af', margin: '0 0.5rem' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>FAQs</span>
            </div>
          </li>
        </ol>
      </nav>

      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>Frequently Asked Questions</h1>
            <p style={styles.subtitle}>Manage your frequently asked questions and answers</p>
          </div>
          <button
            onClick={() => navigate('/admin/faqs/create')}
            style={styles.addButton}
          >
            <FaPlus style={{ marginRight: '0.5rem' }} /> Add New FAQ
          </button>
        </div>
      </div>
      
      <div style={styles.tableContainer}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ ...styles.table, ...{ minWidth: '100%' } }}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={{ ...styles.tableHeaderCell, textAlign: 'left' }}>Question</th>
                <th style={{ ...styles.tableHeaderCell, textAlign: 'left' }}>Answer Preview</th>
                <th style={{ ...styles.tableHeaderCell, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {faqs.length > 0 ? (
                faqs.map((faq) => (
                  <tr key={faq._id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <div style={styles.questionText}>{faq.question}</div>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.answerText}>
                        {faq.answer}
                      </div>
                    </td>
                    <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                      <button
                        onClick={() => navigate(`/admin/faqs/edit/${faq._id}`)}
                        style={styles.actionButton}
                        title="Edit FAQ"
                      >
                        <FaEdit style={{ width: '1rem', height: '1rem' }} />
                      </button>
                      <button
                        onClick={() => handleDelete(faq._id)}
                        style={{ ...styles.actionButton, ...styles.deleteButton }}
                        title="Delete FAQ"
                      >
                        <FaTrash style={{ width: '1rem', height: '1rem' }} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ ...styles.emptyState, textAlign: 'center', padding: '3rem 1.5rem' }}>
                    <div style={styles.emptyText}>No FAQs found</div>
                    <button
                      onClick={() => navigate('/admin/faqs/create')}
                      style={styles.createButton}
                    >
                      <FaPlus style={{ marginRight: '0.25rem' }} /> Create your first FAQ
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FAQList;
