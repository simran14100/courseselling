const BlogCategory = require('../models/BlogCategory');
const { validationResult } = require('express-validator');

// @desc    Get all blog categories
// @route   GET /api/v1/blog/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const categories = await BlogCategory.find({ isActive: true })
            .sort({ name: 1 })
            .select('-__v');
            
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        console.error('Error getting blog categories:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Create a blog category
// @route   POST /api/v1/blog/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, description } = req.body;
        
        // Check if category already exists
        let category = await BlogCategory.findOne({ name });
        if (category) {
            return res.status(400).json({
                success: false,
                message: 'Category already exists'
            });
        }

        // Create slug from name
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Log the user object for debugging
        console.log('User from request:', req.user);
        
        // Create new category with proper user ID
        category = new BlogCategory({
            name,
            slug,
            description: description || '',
            createdBy: req.user._id || req.user.id  // Try both possible ID fields
        });
        
        console.log('Creating category with data:', category);

        await category.save();

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Error creating blog category:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating category',
            error: error.message
        });
    }
};
