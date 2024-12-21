const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploads/avatars');
    },
    filename: function(req, file, cb) {
        cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 2 // 2MB limit
    },
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
});

// Get current user profile
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.put('/profile', protect, upload.single('avatar'), async (req, res) => {
    try {
        const { 
            displayName, 
            jobTitle, 
            bio, 
            interests, 
            socialLinks, 
            skills, 
            privacySettings 
        } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate and update display name
        if (displayName) {
            if (displayName.length < 3 || displayName.length > 50) {
                return res.status(400).json({ message: 'Display name must be between 3 and 50 characters' });
            }
            user.displayName = displayName;
        }

        // Update job title
        if (jobTitle) {
            if (jobTitle.length > 100) {
                return res.status(400).json({ message: 'Job title must be less than 100 characters' });
            }
            user.jobTitle = jobTitle;
        }

        // Update bio
        if (bio) {
            if (bio.length > 500) {
                return res.status(400).json({ message: 'Bio must be less than 500 characters' });
            }
            user.bio = bio;
        }

        // Update interests
        if (interests && Array.isArray(interests)) {
            const validInterests = interests.slice(0, 10); // Limit to 10 interests
            user.interests = validInterests;
        }

        // Update social links
        if (socialLinks && typeof socialLinks === 'object') {
            const validSocialLinks = {};
            const platforms = ['linkedin', 'twitter', 'github', 'website'];
            platforms.forEach(platform => {
                if (socialLinks[platform]) {
                    // Basic URL validation
                    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
                    if (urlRegex.test(socialLinks[platform])) {
                        validSocialLinks[platform] = socialLinks[platform];
                    }
                }
            });
            user.socialLinks = validSocialLinks;
        }

        // Update skills
        if (skills && Array.isArray(skills)) {
            const validSkills = skills.slice(0, 20).map(skill => 
                skill.trim().substring(0, 50) // Limit skill length
            );
            user.skills = validSkills;
        }

        // Update privacy settings
        if (privacySettings && typeof privacySettings === 'object') {
            const allowedSettings = [
                'profileVisibility', 
                'emailVisibility', 
                'activityTracking'
            ];
            const updatedPrivacySettings = {};
            
            allowedSettings.forEach(setting => {
                if (privacySettings.hasOwnProperty(setting)) {
                    updatedPrivacySettings[setting] = privacySettings[setting];
                }
            });

            user.privacySettings = {
                ...user.privacySettings,
                ...updatedPrivacySettings
            };
        }

        // Handle profile picture upload
        if (req.file) {
            user.avatar = `/uploads/avatars/${req.file.filename}`;
        }

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            profile: {
                displayName: user.displayName,
                jobTitle: user.jobTitle,
                bio: user.bio,
                interests: user.interests,
                socialLinks: user.socialLinks,
                avatar: user.avatar,
                privacySettings: user.privacySettings
            }
        });
    } catch (error) {
        console.error('Comprehensive profile update error:', error);
        res.status(500).json({ 
            message: 'Failed to update profile', 
            error: error.message 
        });
    }
});
// Delete account
router.delete('/', protect, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user._id);
        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0)
        });
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ message: 'Failed to delete account' });
    }
});

module.exports = router;
