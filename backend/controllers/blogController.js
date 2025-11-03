const mongoose = require('mongoose');
const fs = require('fs');
const Blog = require('../models/Blog');
const BlogCategory = require('../models/BlogCategory');
const { uploadImageToCloudinary } = require('../utils/imageUploader');

// Create a new blog post
exports.createBlog = async (req, res) => {
    try {
        const {
            title,
            excerpt, 
            content, 
            category, 
            tags, 
            status, 
            featured, 
            metaTitle, 
            metaDescription
        } = req.body;
        
        const userId = req.user.id;
        
        // Handle file upload
        let imageUrl = '';
        if (req.files && req.files.image) {
            const imageFile = req.files.image;
            console.log('Image file received:', {
                name: imageFile.name,
                size: imageFile.size,
                mimetype: imageFile.mimetype,
                tempFilePath: imageFile.tempFilePath
            });

            try {
                // Read the file data
                const fileContent = fs.readFileSync(imageFile.tempFilePath);
                
                // Upload to Cloudinary
                const uploadResult = await uploadImageToCloudinary(
                    fileContent,
                    'blog-images',
                    800,
                    80
                );
                
                imageUrl = uploadResult.secure_url;
                console.log('Image uploaded to Cloudinary:', imageUrl);
                
                // Clean up the temp file
                fs.unlinkSync(imageFile.tempFilePath);
                
            } catch (uploadError) {
                console.error('Error uploading to Cloudinary:', uploadError);
                
                // Clean up the temp file if it exists
                if (imageFile.tempFilePath && fs.existsSync(imageFile.tempFilePath)) {
                    fs.unlinkSync(imageFile.tempFilePath);
                }
                
                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload image',
                    error: uploadError.message
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'Image is required',
                files: req.files
            });
        }

        // Parse tags if they're sent as a string
        let tagsArray = [];
        if (typeof tags === 'string') {
            try {
                tagsArray = JSON.parse(tags);
            } catch (e) {
                tagsArray = tags.split(',').map(tag => tag.trim());
            }
        } else if (Array.isArray(tags)) {
            tagsArray = tags;
        }

        // Generate a URL-friendly slug from the title
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Create blog post
        const blogData = {
            title,
            slug,
            excerpt,
            content,
            category,
            image: imageUrl,
            author: new mongoose.Types.ObjectId(userId),
            status: status || 'draft',
            featured: featured === 'true' || featured === true,
            tags: tagsArray,
            metaTitle: metaTitle || title,
            metaDescription: metaDescription || excerpt
        };

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
