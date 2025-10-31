

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { showError, showSuccess, showLoading, dismissToast } from '../utils/toast';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaLock } from 'react-icons/fa';
import { buyEnrollment } from '../services/operations/enrollmentApi';
import { apiConnector } from '../services/apiConnector';
import { setUser } from '../store/slices/profileSlice';

// Color constants
const ED_TEAL = "#07A698";
const ED_TEAL_DARK = "#059a8c";
const BG_LIGHT = "#f8fafc";
const TEXT_DARK = "#1e293b";
const TEXT_LIGHT = "#64748b";
const BORDER_COLOR = "#e2e8f0";
const SUCCESS_GREEN = "#16a34a";
const ERROR_RED = "#dc2626";
const WARNING_YELLOW = "#f59e0b";

const EnrollmentPayment = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed, alreadyPaid

  // Handle redirection after successful payment
  useEffect(() => {
    if (paymentStatus === 'success') {
      const timer = setTimeout(() => {
        navigate('/dashboard/cart/checkout');
      }, 1500); // Redirect after 1.5 seconds to show success message
      
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, navigate]);

  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      try {
        if (!token) {
          navigate('/login');
          return;
        }

        // Handle non-student users without showing a toast
        if (user?.accountType !== 'Student') {
          setPaymentStatus('not_allowed');
          return;
        }

        // Always fetch fresh user data from the backend
        const userResponse = await apiConnector(
          "GET",
          "/api/v1/profile/getUserDetails",
          null,
          { 
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        );

        if (userResponse.data.success && userResponse.data.user) {
          const userData = userResponse.data.user;
          
          // Ensure we have all required user fields
          const completeUserData = {
            ...user,  // Keep existing user data
            ...userData, // Update with new data
            // Ensure required fields are present
            firstName: userData.firstName || user?.firstName || '',
            lastName: userData.lastName || user?.lastName || '',
            email: userData.email || user?.email || '',
            accountType: userData.accountType || user?.accountType || 'Student',
            enrollmentFeePaid: userData.enrollmentFeePaid || false
          };
          
          dispatch(setUser(completeUserData));
          
          // Check enrollment status from the fresh data
          if (completeUserData.enrollmentFeePaid) {
            setPaymentStatus('alreadyPaid');
          } else {
            setPaymentStatus('pending');
          }
        } else {
          setPaymentStatus('pending');
        }

        // Check for redirect message in URL
        const searchParams = new URLSearchParams(window.location.search);
        const message = searchParams.get('message');
        if (message) {
          showError(decodeURIComponent(message));
        }

        // Check for redirect message in state
        if (routerLocation.state?.message) {
          showError(routerLocation.state.message);
        }
      } catch (error) {
        console.error('Error checking enrollment status:', error);
        showError('Failed to check enrollment status');
      } finally {
        setLoading(false);
      }
    };

    checkEnrollmentStatus();
    setPaymentStatus('pending');
  }, [token, user, navigate]);

  const handleEnrollmentPayment = async () => {
    const toastId = showLoading("Initiating payment...");
    try {
      setLoading(true);
      setPaymentStatus('processing');

      // First, check if the user is allowed to make a payment
      if (user?.accountType !== 'Student') {
        showError('Only students can make enrollment payments');
        setPaymentStatus('not_allowed');
        return;
      }

      // Use the checkout path for redirection after payment
      const checkoutPath = '/dashboard/cart/checkout';
      
      // Proceed with payment
      await buyEnrollment(
        token, 
        user, 
        null, // Don't pass navigate to prevent navigation
        dispatch, 
        checkoutPath // Redirect to checkout after payment
      );

      // After payment attempt, refresh user data to get the latest status
      // This is a fallback in case the payment handler doesn't update the UI
      try {
        const updatedUserResponse = await apiConnector(
          "GET",
          "/api/v1/profile/getUserDetails",
          null,
          { 
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        );

        if (updatedUserResponse.data.success && updatedUserResponse.data.user) {
          const userData = updatedUserResponse.data.user;
          
          // Ensure we have all required user fields
          const completeUserData = {
            ...user,  // Keep existing user data
            ...userData, // Update with new data
            // Ensure required fields are present
            firstName: userData.firstName || user?.firstName || '',
            lastName: userData.lastName || user?.lastName || '',
            email: userData.email || user?.email || '',
            accountType: userData.accountType || user?.accountType || 'Student',
            enrollmentFeePaid: userData.enrollmentFeePaid || false
          };
          
          dispatch(setUser(completeUserData));
          
          // Update payment status based on the actual database state
          if (completeUserData.enrollmentFeePaid) {
            setPaymentStatus('success');
            showSuccess("Enrollment payment successful! You can now access all courses.");
          } else {
            // This should not happen if the payment was successful, but handle it just in case
            setPaymentStatus('pending');
            showError("Payment verification in progress. Please refresh the page to check your status.");
          }
        }
      } catch (refreshError) {
        console.error("Error refreshing user data after payment:", refreshError);
        // Don't throw here, as the payment might still have been successful
      }
      
      // Update the UI to reflect successful payment
      // No automatic navigation - stay on the same page
      // The user can continue to browse or navigate as they wish
      
    } catch (error) {
      console.error("ENROLLMENT PAYMENT ERROR:", error);
      setPaymentStatus('pending');
      
      // Handle already paid case from error response
      if (error?.response?.data?.alreadyPaid || 
          error?.message?.includes('already paid') || 
          error?.message?.includes('already completed') ||
          error?.response?.data?.message?.includes('already paid') ||
          error?.response?.data?.message?.includes('already completed')) {
            
        // Refresh user data to ensure we have the latest status
        try {
          const userResponse = await apiConnector(
            "GET",
            "/api/v1/profile/getUserDetails",
            null,
            { Authorization: `Bearer ${token}` }
          );
          
          if (userResponse.data.success && userResponse.data.user) {
            const userData = userResponse.data.user;
            dispatch(setUser(userData));
            
            if (userData.enrollmentFeePaid) {
              setPaymentStatus('alreadyPaid');
              showSuccess('Your enrollment is already complete.');
              return;
            }
          }
        } catch (refreshError) {
          console.error("Error refreshing user data:", refreshError);
        }
      }
      
      // For other errors, show error message
      showError(error.response?.data?.message || error.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
      dismissToast(toastId);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: BG_LIGHT,
      padding: '48px 16px',
      marginTop:'8rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '640px',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        border: `1px solid ${BORDER_COLOR}`
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            color: TEXT_DARK,
            fontSize: '32px',
            fontWeight: '800',
            marginBottom: '8px'
          }}>Enrollment Payment</h1>
          <p style={{
            color: TEXT_LIGHT,
            fontSize: '18px',
            fontWeight: '500'
          }}>Complete your enrollment to access all courses</p>
        </div>

        {/* Status Indicator */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          {paymentStatus === 'success' ? (
            <FaCheckCircle style={{
              color: SUCCESS_GREEN,
              fontSize: '48px',
              marginBottom: '12px'
            }} />
          ) : paymentStatus === 'failed' ? (
            <FaTimesCircle style={{
              color: ERROR_RED,
              fontSize: '48px',
              marginBottom: '12px'
            }} />
          ) : loading ? (
            <FaSpinner style={{
              color: WARNING_YELLOW,
              fontSize: '48px',
              marginBottom: '12px',
              animation: 'spin 1s linear infinite'
            }} />
          ) : (
            <FaLock style={{
              color: ED_TEAL,
              fontSize: '48px',
              marginBottom: '12px'
            }} />
          )}
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: paymentStatus === 'success' ? SUCCESS_GREEN :
                  paymentStatus === 'failed' ? ERROR_RED :
                  paymentStatus === 'processing' ? WARNING_YELLOW : ED_TEAL
          }}>
            {paymentStatus === 'success' ? 'Payment Successful!' :
             paymentStatus === 'failed' ? 'Payment Failed' :
             loading ? 'Processing Payment...' : 'Ready to Pay'}
          </h2>
        </div>

        <div style={{
          height: '1px',
          backgroundColor: BORDER_COLOR,
          margin: '8px 0'
        }} />

        {/* Payment Details */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          border: `1px solid ${BORDER_COLOR}`
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{ color: TEXT_LIGHT }}>Enrollment Fee:</span>
            <span style={{ color: TEXT_DARK, fontWeight: '600' }}>₹1,000</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{ color: TEXT_LIGHT }}>Payment Method:</span>
            <span style={{ color: TEXT_DARK }}>Razorpay</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{ color: TEXT_LIGHT }}>Currency:</span>
            <span style={{ color: TEXT_DARK }}>INR</span>
          </div>
        </div>

        {/* Benefits */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          border: `1px solid ${BORDER_COLOR}`
        }}>
          <h3 style={{
            color: TEXT_DARK,
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '8px'
          }}>What you'll get:</h3>
          <ul style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            color: TEXT_LIGHT
          }}>
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: SUCCESS_GREEN, marginRight: '8px' }}>✓</span>
              Access to all courses
            </li>
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: SUCCESS_GREEN, marginRight: '8px' }}>✓</span>
              Course certificates
            </li>
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: SUCCESS_GREEN, marginRight: '8px' }}>✓</span>
              24/7 support
            </li>
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: SUCCESS_GREEN, marginRight: '8px' }}>✓</span>
              Lifetime access
            </li>
          </ul>
        </div>

        {/* Payment Action */}
        <div style={{ marginTop: '16px' }}>
          {paymentStatus === 'pending' && (
            <button
              onClick={handleEnrollmentPayment}
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '700',
                backgroundColor: loading ? WARNING_YELLOW : ED_TEAL,
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.8 : 1,
                ':hover': {
                  backgroundColor: loading ? WARNING_YELLOW : ED_TEAL_DARK
                }
              }}
            >
              {loading ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                  Processing...
                </div>
              ) : (
                'Pay ₹1,000 Enrollment Fee'

              )}
            </button>
          )}

          {paymentStatus === 'success' && (
            <div style={{
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              border: `1px solid ${SUCCESS_GREEN}20`
            }}>
              <FaCheckCircle style={{
                color: SUCCESS_GREEN,
                fontSize: '36px',
                margin: '0 auto 8px'
              }} />
              <p style={{
                color: SUCCESS_GREEN,
                fontWeight: '600',
                marginBottom: '10px'
              }}>Payment Successful!</p>
              <p style={{
                color: TEXT_LIGHT,
                fontSize: '14px',
                margin: 0
              }}>You will be redirected to your cart checkout...</p>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                textAlign: 'center',
                padding: '16px',
                backgroundColor: '#fef2f2',
                borderRadius: '12px',
                border: `1px solid ${ERROR_RED}20`
              }}>
                <FaTimesCircle style={{
                  color: ERROR_RED,
                  fontSize: '36px',
                  margin: '0 auto 8px'
                }} />
                <p style={{
                  color: ERROR_RED,
                  fontWeight: '600'
                }}>Payment Failed</p>
              </div>
              <button
                onClick={handleEnrollmentPayment}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '700',
                  backgroundColor: ERROR_RED,
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease',
                  ':hover': {
                    backgroundColor: '#b91c1c'
                  }
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {paymentStatus === 'alreadyPaid' && (
            <div style={{
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              border: `1px solid ${SUCCESS_GREEN}20`
            }}>
              <FaCheckCircle style={{
                color: SUCCESS_GREEN,
                fontSize: '36px',
                margin: '0 auto 8px'
              }} />
              <p style={{
                color: SUCCESS_GREEN,
                fontWeight: '600'
              }}>Enrollment fee already paid!</p>
              <button
                style={{
                  marginTop: '16px',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  backgroundColor: ED_TEAL,
                  color: 'white',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/dashboard/my-profile')}
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <p style={{
            fontSize: '12px',
            color: TEXT_LIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}>
            <span>🔒</span> Your payment is secured by Razorpay
          </p>
        </div>
      </div>

      {/* Add global spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EnrollmentPayment;