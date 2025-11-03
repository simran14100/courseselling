const express = require('express');
const router = express.Router();
const { auth, isInstructor, isAdmin, isSuperAdmin } = require('../middlewares/auth');
const { 
    createBlog, 
    getAllBlogs, 
    getBlogById, 
    updateBlog, 
    deleteBlog,
    createBlogCategory,
    getAllBlogCategories
} = require('../controllers/blogController');

// Blog routes
router.post(
    '/',
    auth,
    isInstructor,
    createBlog
);

// Keep the /create route for backward compatibility
router.post(
    '/create',
    auth,
    isInstructor,
    createBlog
);

router.get('/', getAllBlogs);
router.get('/:id', getBlogById);

// Protected routes (require authentication)
router.put(
    '/:id',
    auth,
    isInstructor,
    updateBlog
);

router.delete(
    '/:id',
    auth,
    isInstructor,
    deleteBlog
);

// Blog Category routes
router.post(
    '/categories/create',
    auth,
    (req, res, next) => {
        // Allow both Admin and Instructor roles
        if (req.user.accountType === 'Admin' || req.user.accountType === 'Instructor') {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to perform this action'
            });
        }
    },
    createBlogCategory
);

router.get('/categories/all', getAllBlogCategories);

module.exports = router;
