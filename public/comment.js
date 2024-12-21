const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: true,
        enum: ['spam', 'harassment', 'inappropriate', 'other']
    },
    description: String,
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'rejected'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
    // ... existing fields ...
    reports: [reportSchema],
    moderationStatus: {
        type: String,
        enum: ['active', 'flagged', 'hidden', 'deleted'],
        default: 'active'
    },
    moderatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    moderationReason: String,
    moderatedAt: Date
});