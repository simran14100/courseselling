const express = require("express");
const { 
  createFAQ, 
  getAllFAQs, 
  updateFAQ, 
  deleteFAQ 
} = require("../controllers/FAQController");
const { auth, isAdmin } = require("../middlewares/auth");

const router = express.Router();

// Public routes
router.get("/", getAllFAQs);

// Protected Admin routes
router.post("/create", auth, isAdmin, createFAQ);
router.put("/:faqId", auth, isAdmin, updateFAQ);
router.delete("/:faqId", auth, isAdmin, deleteFAQ);

module.exports = router;
