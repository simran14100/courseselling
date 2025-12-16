import { showSuccess, showError, showLoading, dismissToast } from "../../utils/toast"
import { apiConnector } from "../apiConnector"
import { payment } from "../apis"
import { clearCart } from "../../store/slices/cartSlice"
import { setPaymentLoading } from "../../store/slices/courseSlice"
const BASE_URL = process.env.REACT_APP_BASE_URL;


const { CAPTURE_PAYMENT_API, VERIFY_PAYMENT_API, SEND_PAYMENT_SUCCESS_EMAIL_API } = payment;



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

// Buy the Course
export async function buyCourse(
  token,
  courses,
  user_details,
  navigate,
  dispatch,
  userType = 'Student' // Default to Student if not provided
) {
  const toastId = showLoading("Processing your request...");
  
  try {
    // First check enrollment status before proceeding
    let enrollmentStatus;
    try {
      console.log('Checking enrollment status before payment...');
      enrollmentStatus = await apiConnector(
        "GET", 
        "/api/v1/enrollments/status",
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );
      
      console.log('Enrollment status response:', enrollmentStatus.data);
      
      // If user is a student, check all enrollment requirements
      if (userType === 'Student') {
        const { enrollmentFeePaid, enrollmentStatus: status } = enrollmentStatus.data;
        const isEnrollmentComplete = status === 'Approved';
        
        if (!enrollmentFeePaid || !isEnrollmentComplete) {
          console.log('Enrollment requirements not met, redirecting to enrollment page');
          dismissToast(toastId);
          showError("Please complete your enrollment process first");
          
          // Determine the appropriate redirect message
          let message = 'Please complete your enrollment to continue with your purchase';
          if (!enrollmentFeePaid) {
            message = 'Please complete your enrollment fee payment to continue with your purchase';
          } else if (!isEnrollmentComplete) {
            message = 'Please complete your enrollment process to continue with your purchase';
          }
          
          navigate("/enrollment-payment", { 
            state: { 
              from: window.location.pathname,
              message,
              redirectReason: 'enrollment_required',
              userStatus: enrollmentStatus.data,
              requirements: {
                enrollmentFeePaid,
                enrollmentComplete: isEnrollmentComplete
              }
            },
            replace: true
          });
          return Promise.reject(new Error('Enrollment requirements not met'));
        }
      }
    } catch (enrollmentError) {
      console.error("Error checking enrollment status:", enrollmentError);
      // If we can't verify enrollment status, we'll still check with the backend
      // The backend will make the final decision
    }

    // Loading the script of Razorpay SDK
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!res) {
      showError("Razorpay SDK failed to load. Check your Internet Connection.");
      return;
    }

    console.log("Token used in payment:", token);
    console.log("User type:", userType);

    try {
      // Initiating the Order in Backend
      const orderResponse = await apiConnector("POST", CAPTURE_PAYMENT_API, 
        { courses },
        {
          Authorization: `Bearer ${token}`,
        }
      );
      
      console.log("Order response:", orderResponse);
      
      // Check if the order was created successfully
      if (!orderResponse.data.success) {
        // If enrollment fee is required, handle the redirect
        if (orderResponse.data.enrollmentFeeRequired) {
          throw {
            response: {
              status: 403,
              data: {
                enrollmentFeeRequired: true,
                message: 'Please complete your enrollment fee payment first',
                userStatus: orderResponse.data.userStatus || {}
              }
            }
          };
        }
        throw new Error(orderResponse.data.message || "Failed to create payment order");
      }
      
      console.log("PAYMENT RESPONSE FROM BACKEND............", orderResponse.data);
      
      // Opening the Razorpay SDK
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY,
        currency: orderResponse.data.data.currency,
        amount: orderResponse.data.data.amount,
        order_id: orderResponse.data.data.id,
        name: "CourseWebmok",
        description: `Payment for ${courses.length} course${courses.length > 1 ? 's' : ''}`,
        image: `${BASE_URL}/logo.png`,
        prefill: user_details,
        handler: function (response) {
          // Handle successful payment
          verifyPayment({...response, courses}, token, navigate, dispatch);
        },
        theme: {
          color: '#4338ca',
        },
        modal: {
          ondismiss: function() {
            showError("Payment window closed. If any amount was deducted, it will be refunded.");
            dispatch(setPaymentLoading(false));
          },
          escape: true,
          backdropclose: false,
        },
      };

      // Log the Razorpay key for debugging
      console.log("Razorpay Key used:", process.env.REACT_APP_RAORPAY_KEY);
      
      // Open Razorpay payment modal
      const paymentObject = new window.Razorpay(options);
      
      // Add event listeners for payment flow
      paymentObject.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        showError(`Payment failed: ${response.error?.description || 'Unknown error'}`);
        dispatch(setPaymentLoading(false));
      });
      
      paymentObject.on('payment.authorized', function (response) {
        console.log('Payment authorized:', response);
      });
      
      // Open the payment modal
      paymentObject.open();
      
      return orderResponse;
    } catch (error) {
      console.error("Error in payment processing:", error);
      dismissToast(toastId);
      
      // Handle 403 Forbidden - Enrollment requirements not met
      if (error.response?.status === 403) {
        const responseData = error.response?.data || {};
        console.log('Enrollment requirements not met:', responseData);
        
        // Determine the appropriate message based on the response
        let message = 'Please complete your enrollment to continue with your purchase';
        let redirectTo = '/enrollment-payment';
        
        if (responseData.enrollmentFeeRequired) {
          message = 'Please complete your enrollment fee payment to continue with your purchase';
          redirectTo = '/enrollment-payment';
        } else if (responseData.enrollmentIncomplete) {
          message = 'Please complete your enrollment process before purchasing courses';
          redirectTo = '/dashboard/enroll';
        }
        
        showError(message);
        navigate(redirectTo, { 
          state: { 
            from: window.location.pathname,
            message,
            redirectReason: 'enrollment_required',
            userStatus: responseData.userStatus || {},
            requirements: {
              enrollmentFeePaid: responseData.userStatus?.enrollmentFeePaid,
              enrollmentComplete: responseData.userStatus?.enrollmentStatus === 'Approved'
            }
          },
          replace: true
        });
        return Promise.reject(new Error('Enrollment requirements not met'));
      }
      
      // For other errors, show a generic error message
      showError(error.response?.data?.message || 'Failed to process payment');
      return Promise.reject(error);
    }
  } catch (outerError) {
    console.log("PAYMENT API ERROR............", outerError);
    
    // Handle enrollment fee required error from backend
    if (outerError.response?.status === 403 && outerError.response?.data?.enrollmentFeeRequired) {
      console.log('Enrollment fee required, redirecting to enrollment page');
      dismissToast(toastId);
      
      const message = outerError.response?.data?.message || 'Please complete your enrollment fee payment to continue with your purchase';
      
      // Use window.location.href for a hard redirect to ensure the page fully reloads
      window.location.href = `${process.env.PUBLIC_URL || ''}/enrollment-payment?from=${encodeURIComponent(window.location.pathname)}&message=${encodeURIComponent(message)}`;
      return;
    }
    
    // For other errors, show the error message
    showError(outerError.response?.data?.message || "Could not process payment. Please try again.");
    
    // If there's a redirect URL in the error response, use it
    if (outerError.response?.data?.redirectTo) {
      setTimeout(() => {
        window.location.href = `${process.env.PUBLIC_URL || ''}${outerError.response.data.redirectTo}`;
      }, 2000);
    }
  } finally {
    dismissToast(toastId);
  }
}

// Verify the Payment
export async function verifyPayment(bodyData, token, navigate, dispatch) {
  const toastId = showLoading("Verifying payment...");
  dispatch(setPaymentLoading(true));
  
  try {
    const response = await apiConnector("POST", VERIFY_PAYMENT_API, bodyData, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    showSuccess("Payment Successful!");
    dispatch(clearCart());
    
    // Redirect to my-courses page after successful payment
    navigate("/dashboard/enrolled-courses");
    
  } catch (error) {
    console.log("PAYMENT VERIFY ERROR............", error);
    showError(error.response?.data?.message || "Payment verification failed");
    
    // If there's an enrollment requirement, redirect to enrollment page
    if (error.response?.data?.enrollmentFeeRequired) {
      navigate("/enrollment-payment", { 
        state: { 
          from: window.location.pathname,
          message: 'Please complete your enrollment fee payment',
          redirectReason: 'enrollment_required'
        },
        replace: true
      });
    }
    
    throw error; // Re-throw the error for the caller to handle
  } finally {
    dismissToast(toastId);
    dispatch(setPaymentLoading(false));
  }
}

// Send the Payment Success Email
async function sendPaymentSuccessEmail(response, amount, token) {
  try {
    await apiConnector(
      "POST",
      SEND_PAYMENT_SUCCESS_EMAIL_API,
      {
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        amount,
      },
      {
        Authorization: `Bearer ${token}`,
      }
    )
  } catch (error) {
    console.log("PAYMENT SUCCESS EMAIL ERROR............", error)
  }
}