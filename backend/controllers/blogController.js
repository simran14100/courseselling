const mongoose = require('mongoose');
const fs = require('fs');
const Blog = require('../models/Blog');
const BlogCategory = require('../models/BlogCategory');
const { uploadImageToCloudinary } = require('../utils/imageUploader');

// Create a new blog post
exports.createBlog = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Uploaded file:', req.file);
        
        // Helper function to parse stringified fields
        const parseIfString = (value) => {
            if (!value) return value;
            if (typeof value === 'string') {
                try {
                    return JSON.parse(value);
                } catch (e) {
                    return value;
                }
            }
            return value;
        };

        // Parse form data
        const formData = {
            title: req.body.title,
            excerpt: req.body.excerpt,
            content: req.body.content,
            category: req.body.category,
            tags: parseIfString(req.body.tags) || [],
            status: req.body.status || 'draft',
            featured: req.body.featured === 'true' || req.body.featured === true,
            metaTitle: req.body.metaTitle || '',
            metaDescription: req.body.metaDescription || ''
        };

        const { title, content } = formData;
        
        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required fields',
                receivedData: formData // For debugging
            });
        }
        
        // Check if image is uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Image is required for blog posts'
            });
        }

        console.log('Processing uploaded file:', {
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        });

        let imageUrl;
        try {
            // Convert buffer to base64 for Cloudinary
            const base64Data = req.file.buffer.toString('base64');
            const dataUri = `data:${req.file.mimetype};base64,${base64Data}`;
            
            // Upload to Cloudinary with a folder and transformations
            const uploadResult = await uploadImageToCloudinary(
                dataUri,
                'blog-images',
                800,
                80
            );
            
            if (!uploadResult || !uploadResult.secure_url) {
                throw new Error('Failed to upload image to Cloudinary');
            }
            
            imageUrl = {
                public_id: uploadResult.public_id,
                url: uploadResult.secure_url
            };
            
            console.log('Image uploaded to Cloudinary:', imageUrl);
        } catch (error) {
            console.error('Error uploading image to Cloudinary:', error);
            return res.status(500).json({
                success: false,
                message: 'Error uploading image to Cloudinary',
                error: error.message
            });
        }

        // Generate a URL-friendly slug from the title
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Ensure we have a valid author ID
        const authorId = req.user?.id || req.user?._id;
        if (!authorId) {
            return res.status(400).json({
                success: false,
                message: 'User not authenticated or invalid user ID'
            });
        }

        // Create blog post data with proper defaults
        const blogData = {
            title: formData.title,
            content: formData.content,
            excerpt: formData.excerpt || formData.content.substring(0, 200) + '...',
            category: formData.category || null,
            tags: Array.isArray(formData.tags) ? formData.tags : 
                 (formData.tags ? [formData.tags] : []),
            status: formData.status || 'draft',
            featured: formData.featured || false,
            slug,
            image: imageUrl,
            author: authorId,  // Use the properly extracted author ID
            metaTitle: formData.metaTitle || formData.title,
            metaDescription: formData.metaDescription || formData.excerpt || ''
        };
        
        console.log('Processed blog data:', JSON.stringify(blogData, null, 2));
        console.log('Author ID:', authorId);

        console.log('Creating blog post with data:', JSON.stringify(blogData, null, 2));
        
        const blog = await Blog.create(blogData);

        res.status(201).json({
            success: true,
            message: 'Blog post created successfully',
            data: blog
        });
    } catch (error) {
        console.error('Error creating blog post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create blog post',
            error: error.message
        });
    }
};

// Get all blog posts
exports.getAllBlogs = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, category, search } = req.query;
        const query = {};

        if (status) query.status = status;
        if (category) query.category = category;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const blogs = await Blog.find(query)
            .populate('category', 'name slug')
            .populate('author', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Blog.countDocuments(query);

        res.status(200).json({
            success: true,
            data: blogs,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch blog posts',
            error: error.message
        });
    }
};

// Get single blog post by ID or slug
exports.getBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await (mongoose.Types.ObjectId.isValid(id) 
            ? Blog.findById(id)
            : Blog.findOne({ slug: id }))
            .populate('category', 'name slug')
            .populate('author', 'firstName lastName email');

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        res.status(200).json({
            success: true,
            data: blog
        });
    } catch (error) {
        console.error('Error fetching blog post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch blog post',
            error: error.message
        });
    }
};

// Update blog post
exports.updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        
        // Convert tags string to array if provided
        if (updateData.tags && typeof updateData.tags === 'string') {
            updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
        }

        // If imageUrl is provided in the update, use it
        if (updateData.imageUrl) {
            updateData.image = updateData.imageUrl;
            delete updateData.imageUrl; // Remove the temporary field
        }

        const blog = await Blog.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Blog post updated successfully',
            data: blog
        });
    } catch (error) {
        console.error('Error updating blog post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update blog post',
            error: error.message
        });
    }
};

// Delete blog post
exports.deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findByIdAndDelete(id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Blog post deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting blog post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete blog post',
            error: error.message
        });
    }
};

// Blog Category Controllers
exports.createBlogCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        console.log('Creating blog category with data:', { name, description, createdBy: req.user?.id });
        
        const category = await BlogCategory.create({
            name,
            description,
            createdBy: req.user?.id || req.user?._id
        });

        res.status(201).json({
            success: true,
            message: 'Blog category created successfully',
            data: category
        });
    } catch (error) {
        console.error('Error creating blog category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create blog category',
            error: error.message,
            user: req.user // Log the user object for debugging
        });
    }
};

exports.getAllBlogCategories = async (req, res) => {
    try {
        const categories = await BlogCategory.find({ isActive: true })
            .populate('createdBy', 'firstName lastName')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching blog categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch blog categories',
            error: error.message
        });
    }
};
