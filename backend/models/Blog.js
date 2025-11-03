const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    slug: {
        type: String,
        required: [true, 'Slug is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    excerpt: {
        type: String,
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Content is required']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BlogCategory',
        required: [true, 'Category is required']
    },
    image: {
        type: String,
        required: [true, 'Image is required']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    featured: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    metaTitle: String,
    metaDescription: String,
    publishedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create text index for search
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Pre-save hook to generate slug
blogSchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.slug = this.title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
    }
    next();
});

module.exports = mongoose.model('Blog', blogSchema);
