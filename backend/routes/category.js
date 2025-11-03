const express = require('express');
const router = express.Router();
const { auth, isInstructor, isAdmin, isStudent } = require("../middlewares/auth");
const {
  createCategory,
  showAllCategories,
  categoryPageDetails,
  deleteCategory,
} = require("../controllers/Category");

// Public routes
router.get("/categories", showAllCategories);
router.get("/category/:categoryId", categoryPageDetails);

// Protected routes (require authentication)
router.post("/category", auth, isInstructor, createCategory);
router.delete("/category/:categoryId", auth, isAdmin, deleteCategory);

module.exports = router;
