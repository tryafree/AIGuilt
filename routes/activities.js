const express = require('express');
const { protect } = require('../middleware/auth');
const Activity = require('../models/Activity');
const router = express.Router();

// Get user activities
router.get('/', protect, async (req, res) => {
    try {
        const activities = await Activity.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(activities);
    } catch (error) {
        console.error('Get activities error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create activity
router.post('/', protect, async (req, res) => {
    try {
        const { type, description, metadata } = req.body;
        const activity = new Activity({
            user: req.user._id,
            type,
            description,
            metadata
        });
        await activity.save();
        
        // Emit socket event for real-time updates
        req.io.to(`user:${req.user._id}`).emit('newActivity', activity);
        
        res.json(activity);
    } catch (error) {
        console.error('Create activity error:', error);
        res.status(500).json({ message: 'Failed to create activity' });
    }
});

module.exports = router;
