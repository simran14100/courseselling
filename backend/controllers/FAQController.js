const FAQ = require("../models/FAQ");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// Create a new FAQ
exports.createFAQ = async (req, res) => {
  try {
    const { question, answer } = req.body;
    
    // Validate input
    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Create new FAQ
    const newFAQ = await FAQ.create({
      question,
      answer,
    });

    return res.status(201).json({
      success: true,
      message: "FAQ created successfully",
      data: newFAQ,
    });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create FAQ",
      error: error.message,
    });
  }
};

// Get all FAQs
exports.getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({}).sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      data: faqs,
    });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch FAQs",
      error: error.message,
    });
  }
};

// Update FAQ
exports.updateFAQ = async (req, res) => {
  try {
    const { faqId } = req.params;
    const updates = req.body;

    if (!faqId) {
      return res.status(400).json({
        success: false,
        message: "FAQ ID is required",
      });
    }

    const updatedFAQ = await FAQ.findByIdAndUpdate(
      faqId,
      { $set: updates },
      { new: true }
    );

    if (!updatedFAQ) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "FAQ updated successfully",
      data: updatedFAQ,
    });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update FAQ",
      error: error.message,
    });
  }
};

// Delete FAQ
exports.deleteFAQ = async (req, res) => {
  try {
    const { faqId } = req.params;

    if (!faqId) {
      return res.status(400).json({
        success: false,
        message: "FAQ ID is required",
      });
    }

    const deletedFAQ = await FAQ.findByIdAndDelete(faqId);

    if (!deletedFAQ) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "FAQ deleted successfully",
      data: deletedFAQ,
    });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete FAQ",
      error: error.message,
    });
  }
};
