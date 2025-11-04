const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth, isAdmin } = require('../middlewares/auth');
const { 
    createBlog, 
    getAllBlogs, 
    getBlogById, 
    updateBlog, 
    deleteBlog,
    createBlogCategory,
    getAllBlogCategories
} = require('../controllers/blogController');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Blog routes
router.post(
    '/',
    auth,
    isAdmin,
    upload.single('image'),
    createBlog
);

// Backward compatible route
router.post(
    '/create',
    auth,
    isAdmin,
    upload.single('image'),
    createBlog
);

router.get('/', getAllBlogs);
router.get('/:id', getBlogById);

// Protected routes (require admin authentication)
router.put(
    '/:id',
    auth,
    isAdmin,
    upload.single('image'),
    updateBlog
);

router.delete(
    '/:id',
    auth,
    isAdmin,
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
