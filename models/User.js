const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Notification Schema
const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['follow', 'like', 'comment', 'mention', 'system']
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    content: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    relatedItem: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'itemModel'
    },
    itemModel: {
        type: String,
        enum: ['Post', 'Comment', 'User']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// User Schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    displayName: {
        type: String,
        required: [true, 'Display name is required'],
        trim: true,
        minlength: [3, 'Display name must be at least 3 characters'],
        maxlength: [50, 'Display name cannot exceed 50 characters']
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9_]{3,30}$/, 'Username can only contain letters, numbers, and underscores']
    },
    avatar: {
        type: String,
        default: '/default-avatar.png'
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    jobTitle: {
        type: String,
        maxlength: [100, 'Job title cannot exceed 100 characters']
    },
    interests: [{
        type: String,
        trim: true
    }],
    skills: [{
        type: String,
        trim: true
    }],
    socialLinks: {
        linkedin: String,
        twitter: String,
        github: String,
        website: String
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    notifications: [notificationSchema],
    privacySettings: {
        profileVisibility: {
            type: String,
            enum: ['public', 'private', 'followers'],
            default: 'public'
        },
        emailVisibility: {
            type: Boolean,
            default: false
        },
        activityTracking: {
            type: Boolean,
            default: true
        }
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error(error);
    }
};

// Method to add notification
userSchema.methods.addNotification = async function(notification) {
    this.notifications.unshift(notification);
    if (this.notifications.length > 100) {
        this.notifications = this.notifications.slice(0, 100);
    }
    return this.save();
};

module.exports = mongoose.model('User', userSchema);