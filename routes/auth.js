const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'Username or email already exists'
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            membershipTier: 'free'
        });

        await user.save();

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    membershipTier: user.membershipTier
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error creating user'
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    membershipTier: user.membershipTier
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error logging in'
        });
    }
});

// Logout user
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({
        status: 'success',
        message: 'Logged out successfully'
    });
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Not authenticated'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    membershipTier: user.membershipTier,
                    profilePicture: user.profilePicture,
                    bio: user.bio
                }
            }
        });
    } catch (error) {
        res.status(401).json({
            status: 'error',
            message: 'Invalid token'
        });
    }
});

// Update membership tier
router.patch('/membership', async (req, res) => {
    try {
        const { tier } = req.body;
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Not authenticated'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        user.membershipTier = tier;
        await user.save();

        res.json({
            status: 'success',
            data: {
                membershipTier: user.membershipTier
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error updating membership'
        });
    }
});

module.exports = router;