const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        maxlength: [2000, 'Post content cannot exceed 2000 characters']
    },
    media: [{
        type: String
    }],
    visibility: {
        type: String,
        enum: ['public', 'private', 'followers'],
        default: 'public'
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    mentions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    hashtags: [{
        type: String,
        trim: true
    }],
    edited: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for better query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ visibility: 1 });

module.exports = mongoose.model('Post', postSchema);