const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Store for invalidated tokens
const invalidatedTokens = new Set();

// Store for user sessions
const userSessions = new Map();

const sessionSecurity = {
    // Verify and validate JWT token
    verifyToken: async (req, res, next) => {
        try {
            const token = req.cookies.token;

            if (!token) {
                return res.status(401).json({ message: 'No token, authorization denied' });
            }

            // Check if token has been invalidated
            if (invalidatedTokens.has(token)) {
                return res.status(401).json({ message: 'Token has been invalidated' });
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Check if user exists
            const user = await User.findById(decoded.userId).select('-password');
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Check if token matches the current session
            const currentSession = userSessions.get(decoded.userId);
            if (!currentSession || currentSession !== token) {
                return res.status(401).json({ message: 'Session expired' });
            }

            req.user = user;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            }
            return res.status(401).json({ message: 'Token is not valid' });
        }
    },

    // Create new session
    createSession: (userId, token) => {
        // Invalidate any existing session for the user
        const existingToken = userSessions.get(userId);
        if (existingToken) {
            invalidatedTokens.add(existingToken);
        }

        // Set new session
        userSessions.set(userId, token);
    },

    // Invalidate session
    invalidateSession: (token) => {
        if (token) {
            invalidatedTokens.add(token);
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userSessions.delete(decoded.userId);
            } catch (error) {
                // Token verification failed, but we still add it to invalidated tokens
                console.error('Error decoding token during invalidation:', error);
            }
        }
    },

    // Clean up expired tokens periodically
    cleanupSessions: () => {
        setInterval(() => {
            invalidatedTokens.forEach(token => {
                try {
                    jwt.verify(token, process.env.JWT_SECRET);
                } catch (error) {
                    if (error.name === 'TokenExpiredError') {
                        invalidatedTokens.delete(token);
                    }
                }
            });
        }, 24 * 60 * 60 * 1000); // Run daily
    },

    // Refresh token
    refreshToken: async (req, res, next) => {
        try {
            const oldToken = req.cookies.token;
            
            if (!oldToken) {
                return res.status(401).json({ message: 'No token provided' });
            }

            // Verify old token
            const decoded = jwt.verify(oldToken, process.env.JWT_SECRET);
            
            // Check if user exists
            const user = await User.findById(decoded.userId).select('-password');
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Generate new token
            const newToken = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            // Invalidate old token
            sessionSecurity.invalidateSession(oldToken);

            // Create new session
            sessionSecurity.createSession(user._id, newToken);

            // Set new cookie
            res.cookie('token', newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });

            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    }
};

// Initialize session cleanup
sessionSecurity.cleanupSessions();

module.exports = sessionSecurity;
