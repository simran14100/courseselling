// Import the required modules
const express = require("express")
const router = express.Router()
const {
  capturePayment,
  verifyPayment,
  sendPaymentSuccessEmail,
  getRazorpayKey,
} = require("../controllers/Payment")
const { auth, isStudent } = require("../middlewares/auth")
const { checkEnrollmentFee } = require("../middlewares/checkEnrollmentFee")

// Apply enrollment fee check to all payment routes except enrollment payment
router.post("/capturePayment", auth, isStudent, checkEnrollmentFee, capturePayment)
router.post("/verifyPayment", auth, isStudent, checkEnrollmentFee, verifyPayment)
router.post(
  "/sendPaymentSuccessEmail",
  auth,
  isStudent,
  checkEnrollmentFee,
  sendPaymentSuccessEmail
)

// Public route to get Razorpay key
router.get("/getRazorpayKey", getRazorpayKey);
// router.post("/verifySignature", verifySignature)

module.exports = router
