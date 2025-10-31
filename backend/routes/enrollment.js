const express = require("express");
const router = express.Router();

// Import enrollment payment controllers
const {
    createEnrollmentOrder,
    verifyEnrollmentPayment,
    getEnrollmentStatus,
    resetEnrollmentStatus
} = require("../controllers/EnrollmentPayment");

// Import middleware
const { auth, isStudent, isAdmin } = require("../middlewares/auth");

// ********************************************************************************************************
//                                      Enrollment Payment routes
// ********************************************************************************************************

// Create enrollment fee payment order
router.post("/create-order", auth, isStudent, createEnrollmentOrder);

// Verify enrollment payment
router.post("/verify-payment", auth, isStudent, verifyEnrollmentPayment);

// Get enrollment payment status
router.get("/status", auth, isStudent, getEnrollmentStatus);

// Reset enrollment status (Admin only)
router.post("/reset-status", auth, isAdmin, resetEnrollmentStatus);

module.exports = router;