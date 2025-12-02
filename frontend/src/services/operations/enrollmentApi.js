import { showSuccess, showError, showLoading, dismissToast } from "../../utils/toast"
import { setUser } from "../../store/slices/profileSlice"
import { apiConnector } from "../apiConnector"
import { enrollment } from "../apis"

const {
  CREATE_ENROLLMENT_ORDER_API,
  VERIFY_ENROLLMENT_PAYMENT_API,
  GET_ENROLLMENT_STATUS_API,
  RESET_ENROLLMENT_STATUS_API,
} = enrollment

console.log('Frontend Razorpay Key (at import):', process.env.REACT_APP_RAZORPAY_KEY);

// Load the Razorpay SDK from the CDN
function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = src
    script.onload = () => {
      resolve(true)
    }
    script.onerror = () => {
      resolve(false)
    }
    document.body.appendChild(script)
  })
}

// Buy the Enrollment
// @param {string} token - User authentication token
// @param {object} user - User object from Redux store
// @param {function} navigate - Navigation function from react-router
// @param {function} dispatch - Redux dispatch function
// @param {string} returnTo - Optional path to navigate after successful payment
export async function buyEnrollment(token, user, navigate, dispatch, returnTo = null) {
  const toastId = showLoading("Loading...")
  try {
    // Loading the script of Razorpay SDK
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js")

    if (!res) {
      showError("Razorpay SDK failed to load. Check your Internet Connection.")
      return Promise.reject(new Error('Razorpay SDK failed to load'));
    }
    console.log("Razorpay Key in Frontend:", process.env.REACT_APP_RAZORPAY_KEY);
    console.log("Token used in enrollment payment:", token);
    // Note: We're removing the frontend check for enrollmentFeePaid
    // to ensure the payment flow can proceed and let the backend handle the verification

    // Store the current path for redirection after payment
    const currentPath = window.location.pathname;
    
    // Initiating the Order in Backend
    const orderResponse = await apiConnector(
      "POST",
      CREATE_ENROLLMENT_ORDER_API,
      { returnUrl: currentPath }, // Send current URL for post-payment redirect
      {
        Authorization: `Bearer ${token}`
      }
    )

    console.log("ENROLLMENT ORDER RESPONSE FROM BACKEND............", orderResponse);

    const backendData = orderResponse.data; // Axios wraps backend response in .data
    if (!backendData.success) {
      throw new Error(backendData.message);
    }

    const orderData = backendData.data;
    if (!orderData || !orderData.orderId || !orderData.amount || !orderData.currency) {
      throw new Error("Order data missing from backend response");
    }

    // Opening the Razorpay SDK
    console.log('Frontend Razorpay Key (before opening Razorpay):', orderData.key);
    
    if (!orderData.key) {
      throw new Error("Razorpay key not found in the order response");
    }

    // Create a local reference to dispatch that will be available in the handler
    const paymentHandler = async (response) => {
      let verificationToast;
      try {
        // Show loading state
        verificationToast = showLoading("Verifying payment...");
        
        // Get the current path for redirection if needed
        const currentPath = window.location.pathname;
        console.log('Current path for potential redirection:', currentPath);
        
        // Call the verification function with all required parameters
        const verificationResponse = await verifyEnrollmentPayment(
          {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            // Include the current path as returnTo if not already set
            returnTo: returnTo || currentPath
          },
          token,
          navigate, // Pass the navigate function
          dispatch,
          returnTo || currentPath // Pass the returnTo parameter or current path
        );
        
        const result = verificationResponse || {};
        
        // If we get here, verification was successful
        console.log("Payment verification result:", result);
        
        // Dismiss the loading toast when done
        dismissToast(verificationToast);
        
        // Refresh user data to update the UI
        try {
          const userResponse = await apiConnector(
            "GET",
            "/api/v1/profile/getUserDetails",
            null,
            { Authorization: `Bearer ${token}` }
          );
          
          if (userResponse.data.success && userResponse.data.user) {
            dispatch(setUser(userResponse.data.user));
          }
        } catch (refreshError) {
          console.error("Error refreshing user data:", refreshError);
        }
      } catch (error) {
        console.error("Error in payment handler:", error);
        showError(error.message || "Error processing payment");
      }
    };

    const options = {
      key: orderData.key, // Use the key from backend response
      currency: orderData.currency,
      amount: orderData.amount, // Amount is already in paise from backend
      order_id: orderData.orderId,
      name: "WebMok",
      description: "Thank you for paying the Enrollment Fee.",
      prefill: {
        name: `${user.firstName} ${user.lastName}`.trim() || 'Customer',
        email: user.email,
      },
      handler: paymentHandler,
      theme: {
        color: '#4f46e5', // Indigo-600
      },
      modal: {
        ondismiss: function() {
          console.log('Payment modal dismissed');
          dismissToast(toastId);
        }
      }
    };
    
    console.log('Razorpay options:', {
      key: options.key ? '***key-set***' : 'missing',
      amount: options.amount,
      currency: options.currency,
      order_id: options.order_id
    });

    const paymentObject = new window.Razorpay(options)

    paymentObject.open()
    paymentObject.on("payment.failed", function (response) {
      showError("Oops! Payment Failed.")
      console.log(response.error)
    })
  } catch (error) {
    console.error("ENROLLMENT PAYMENT API ERROR:", error);
    showError(error.message || "Could not process payment. Please try again.");
    return Promise.reject(error);
  } finally {
    dismissToast(toastId);
  }
}

// Verify the Enrollment Payment
export const verifyEnrollmentPayment = async (razorpayResponse, token, navigate, dispatch, returnTo = null) => {
  const toastId = showLoading("Verifying Payment...")
  
  try {
    if (!dispatch || typeof dispatch !== 'function') {
      throw new Error('Dispatch function is required for verification')
    }

    const requestData = { 
      razorpay_order_id: razorpayResponse.razorpay_order_id,
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_signature: razorpayResponse.razorpay_signature,
      currentPath: window.location.pathname
    }

    console.log("VERIFY ENROLLMENT PAYMENT REQUEST............", requestData)

    const response = await apiConnector(
      "POST", 
      VERIFY_ENROLLMENT_PAYMENT_API, 
      requestData, 
      {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    )

    console.log("VERIFY ENROLLMENT PAYMENT RESPONSE FROM BACKEND............", response)

    const backendData = response.data; // Axios wraps backend response in .data
    if (!backendData.success) {
      throw new Error(backendData.message || 'Failed to verify payment')
    }

    // Update user data in the store
    if (backendData.data) {
      // The backend is sending the user data directly in backendData.data
      console.log("Updating user data in Redux store:", backendData.data);
      
      // Store the payment timestamp in session storage to prevent race conditions
      const paymentTimestamp = Date.now();
      sessionStorage.setItem('lastEnrollmentPayment', paymentTimestamp.toString());
      
      // Also store in localStorage for persistence across page refreshes
      localStorage.setItem('lastEnrollmentPayment', paymentTimestamp.toString());
      
      // Ensure we have all required user properties with defaults
      const userData = backendData.data.user || backendData.data;
      
      // Create a normalized user object with all required fields
      const normalizedUser = {
        ...userData,
        _id: userData._id || userData.id,
        firstName: userData.firstName || userData.firstname || '',
        lastName: userData.lastName || userData.lastname || '',
        email: userData.email || '',
        accountType: userData.accountType || 'Student',
        // Force these values since we know the payment was successful
        enrollmentFeePaid: true,
        paymentStatus: 'Completed',
        enrollmentStatus: 'Approved',
        // Add flags to prevent the enrollment fee error toast
        _justPaidEnrollmentFee: true,
        _paymentTimestamp: paymentTimestamp,
        _preventEnrollmentFeeToast: true, // Additional flag to prevent toast
        image: userData.image || `https://api.dicebear.com/5.x/initials/svg?seed=${userData.firstName || userData.firstname || 'U'} ${userData.lastName || userData.lastname || ''}`.trim()
      };
      
      console.log('Processed enrollment payment with user data:', {
        paymentTimestamp,
        normalizedUser: {
          ...normalizedUser,
          // Don't log the entire user object to keep the console clean
          _id: normalizedUser._id,
          email: normalizedUser.email,
          enrollmentFeePaid: normalizedUser.enrollmentFeePaid,
          _justPaidEnrollmentFee: normalizedUser._justPaidEnrollmentFee,
          _preventEnrollmentFeeToast: normalizedUser._preventEnrollmentFeeToast
        }
      });
      
      console.log("Normalized user data for Redux:", normalizedUser);
      
      // Update Redux store
      dispatch(setUser(normalizedUser));
      
      // Update local storage to persist the state
      try {
        // Update user data in localStorage
        const currentUser = JSON.parse(localStorage.getItem("user") || '{}');
        const updatedUser = {
          ...currentUser,
          ...normalizedUser,
          // Ensure these critical fields are set
          enrollmentFeePaid: true,
          paymentStatus: 'Completed',
          enrollmentStatus: 'Approved'
        };
        
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        // Get the token from localStorage
        const token = localStorage.getItem("token");
        
        // If token exists and is a JWT (starts with 'eyJ' for JWT), don't try to parse it as JSON
        if (token && token.startsWith('eyJ')) {
          // Token is a JWT string, not a JSON object
          // We don't need to modify it, just make sure the user data is updated
          console.log('Token is a JWT string, skipping user data update in token');
        } else if (token) {
          // Token might be a JSON string that can be parsed
          try {
            const tokenData = JSON.parse(token);
            if (tokenData && typeof tokenData === 'object') {
              // Update user data in token if it exists
              if (tokenData.user) {
                tokenData.user = {
                  ...tokenData.user,
                  ...updatedUser
                };
                localStorage.setItem("token", JSON.stringify(tokenData));
              }
            }
          } catch (e) {
            console.warn('Token is not a valid JSON object, skipping user data update in token');
          }
        }
      } catch (e) {
        console.error("Error updating local storage:", e);
      }
    } else {
      // If no user data in response, fetch fresh data
      try {
        console.log("No user data in payment response, fetching fresh data...");
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
        
        console.log("Fetched fresh user data:", userResponse.data);
        
        if (userResponse.data.success && (userResponse.data.data || userResponse.data.user)) {
          const userData = userResponse.data.data || userResponse.data.user;
          const normalizedUser = {
            ...userData,
            firstName: userData.firstName || userData.firstname || '',
            lastName: userData.lastName || userData.lastname || '',
            email: userData.email || '',
            accountType: userData.accountType || 'Student',
            image: userData.image || `https://api.dicebear.com/5.x/initials/svg?seed=${userData.firstName || userData.firstname || 'U'} ${userData.lastName || userData.lastname || ''}`.trim()
          };
          
          console.log("Normalized user data from refresh:", normalizedUser);
          dispatch(setUser(normalizedUser));
          
          // Update local storage
          try {
            const currentUser = JSON.parse(localStorage.getItem("user") || '{}');
            localStorage.setItem("user", JSON.stringify({
              ...currentUser,
              ...normalizedUser
            }));
          } catch (e) {
            console.error("Error updating local storage:", e);
          }
        }
      } catch (refreshError) {
        console.error("Error refreshing user data after payment:", refreshError);
      }
    }

    showSuccess("Enrollment Payment Successful! You can now access all courses.")
    
    // Store the payment timestamp to prevent duplicate toasts
    const paymentTimestamp = Date.now();
    sessionStorage.setItem('lastEnrollmentPayment', paymentTimestamp.toString());
    localStorage.setItem('lastEnrollmentPayment', paymentTimestamp.toString());
    
    // Get the return URL from the response or use the one passed in
    const returnUrl = backendData.data?.returnTo || returnTo || '/dashboard/enrolled-courses';
    
    console.log(`Payment verified successfully. Preparing to redirect to: ${returnUrl}`);
    
    // Use a small timeout to allow the success message to be seen
    setTimeout(() => {
      try {
        // If we have a navigate function, use it
        if (typeof navigate === 'function') {
          console.log('Navigating to:', returnUrl);
          navigate(returnUrl);
        } else {
          console.log('No navigate function, using window.location.href');
          window.location.href = returnUrl;
        }
      } catch (navError) {
        console.error('Navigation error, falling back to window.location:', navError);
        window.location.href = returnUrl;
      }
    }, 1000);
    
    // Just in case any parent component needs to know verification was successful
    return { success: true, message: "Payment verified successfully" };
    
  } catch (error) {
    console.error("ENROLLMENT PAYMENT VERIFY ERROR:", error)
    showError(error.message || "Could not verify payment. Please try again.")
    
    // If verification fails but we have a payment ID, we should still update the UI
    if (razorpayResponse.razorpay_payment_id) {
      try {
        // Try to refresh user data in case the payment was successful but verification failed
        const userResponse = await apiConnector(
          "GET",
          "/api/v1/profile/getUserDetails",
          null,
          { Authorization: `Bearer ${token}` }
        )
        
        if (userResponse.data.success && userResponse.data.user) {
          dispatch(setUser(userResponse.data.user))
        }
      } catch (refreshError) {
        console.error("Error refreshing user data after payment error:", refreshError)
      }
    }
  } finally {
    dismissToast(toastId);
  }
}

// Get enrollment status
export async function getEnrollmentStatus(token) {
  try {
    const response = await apiConnector(
      "GET",
      GET_ENROLLMENT_STATUS_API,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    )

    console.log("ENROLLMENT STATUS RESPONSE............", response)

    if (!response.success) {
      throw new Error(response.message)
    }

    return response.data
  } catch (error) {
    console.log("GET ENROLLMENT STATUS ERROR............", error)
    throw error
  }
} 

export async function fetchEnrolledStudents(token, page = 1, limit = 10, search = "", dispatch = null, navigate = null) {
  try {
    const response = await apiConnector("GET", 
      `/api/v1/admin/enrolled-students?page=${page}&limit=${limit}&search=${search}`, 
      null, 
      { Authorization: `Bearer ${token}` }
    )
    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    return response.data.data
  } catch (error) {
    console.error("Error fetching enrolled students:", error)
    if (error.response?.data?.message?.includes("already paid") || 
        error.response?.data?.message?.includes("already completed") ||
        error.message?.includes("already paid") ||
        error.message?.includes("already completed")) {
      showSuccess("Enrollment already completed")
      
      try {
        // Auto-detect API URL
        const apiBase = process.env.REACT_APP_BASE_URL || 
          (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' 
            ? '' 
            : 'http://localhost:4000');
        const userResponse = await apiConnector(
          "GET",
          `${apiBase}/api/v1/profile/getUserDetails`,
          null,
          {
            Authorization: `Bearer ${token}`
          }
        )
        
        if (userResponse.data.success && dispatch) {
          dispatch(setUser(userResponse.data.user))
        }
      } catch (refreshError) {
        console.error("Error refreshing user data:", refreshError)
      }
      
      if (navigate) {
        navigate("/dashboard/enrolled-courses")
      }
      return
    }
    
    showError(error.response?.data?.message || error.message || "Failed to fetch enrolled students. Please try again")
    throw error
  }
}

/**
 * Reset enrollment status for a user (Admin only)
 * @param {string} token - Admin auth token
 * @param {string} userId - ID of the user to reset
 * @returns {Promise<Object>} Response from the server
 */
export async function resetEnrollmentStatus(token, userId) {
  const toastId = showLoading("Resetting enrollment status...")
  try {
    const response = await apiConnector(
      "POST",
      RESET_ENROLLMENT_STATUS_API,
      { userId },
      {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    )

    dismissToast(toastId)
    showSuccess("Enrollment status reset successfully")
    return response.data
  } catch (error) {
    console.error("Error resetting enrollment status:", error)
    dismissToast(toastId)
    showError(
      error.response?.data?.message ||
        "Failed to reset enrollment status. Please try again."
    )
    throw error
  }
}

/**
 * Check if a student can enroll (hasn't paid enrollment fee yet)
 * @param {string} token - User auth token
 * @returns {Promise<boolean>} True if student can enroll, false otherwise
 */
export async function canEnroll(token) {
  try {
    const response = await apiConnector(
      "GET",
      GET_ENROLLMENT_STATUS_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    )
    
    // If enrollment fee is already paid, return false
    return !response.data.data?.enrollmentFeePaid
  } catch (error) {
    console.error("Error checking enrollment status:", error)
    // If there's an error, allow the user to proceed to the payment page
    // where they'll see a more specific error message
    return true
  }
}