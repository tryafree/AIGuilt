require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');const { initializeSocket } = require('./services/socketService');

// After creating your HTTP server
const server = http.createServer(app);
const io = initializeSocket(server);

// Update your server startup
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const jwt = require('jsonwebtoken'); 
const http = require('http');
const socketService = require('./services/socket');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const pageRoutes = require('./routes/pages');
const activityRoutes = require('./routes/activities');

const securityMiddleware = require('./middleware/security');
const { rateLimiters } = require('./middleware/rateLimit');
const sessionSecurity = require('./middleware/session');

const app = express();
const server = http.createServer(app);
const io = socketService.init(server);

// Middleware to make io accessible in routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Apply basic security middleware
securityMiddleware.basic.forEach(middleware => app.use(middleware));

// Apply production security middleware
if (process.env.NODE_ENV === 'production') {
    securityMiddleware.production.forEach(middleware => app.use(middleware));
}

// Configure CORS
app.use(cors(securityMiddleware.cors));

// Parse cookies
app.use(cookieParser());

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimiters.api;
app.use('/api/', limiter);

// Apply rate limiters
app.use('/api/auth', rateLimiters.auth);
app.use('/api/upload', rateLimiters.upload);
app.use('/api/search', rateLimiters.search);

// Security headers middleware
app.use((req, res, next) => {
    // Basic security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Content Security Policy
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' " + (process.env.API_URL || 'http://localhost:3000') + "; " +
        "frame-ancestors 'none'; " +
        "form-action 'self';"
    );
    
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions Policy
    res.setHeader('Permissions-Policy', 
        'geolocation=(), ' +
        'microphone=(), ' +
        'camera=(), ' +
        'payment=(), ' +
        'usb=(), ' +
        'battery=(), ' +
        'document-domain=()'
    );
    
    next();
});

// Debug middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request Body:', req.body);
    }
    if (req.cookies && Object.keys(req.cookies).length > 0) {
        console.log('Cookies:', req.cookies);
    }
    next();
});

// Protected route middleware
const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            return res.redirect('/login.html?error=unauthorized');
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user still exists
        const User = require('./models/User');
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            res.clearCookie('token');
            return res.redirect('/login.html?error=user_not_found');
        }

        // Check if user changed password after token was issued
        if (user.passwordChangedAt && decoded.iat < user.passwordChangedAt.getTime() / 1000) {
            res.clearCookie('token');
            return res.redirect('/login.html?error=password_changed');
        }

        // Check if token has been invalidated
        if (user.invalidatedTokens && user.invalidatedTokens.includes(token)) {
            res.clearCookie('token');
            return res.redirect('/login.html?error=token_invalidated');
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Protected route error:', error);
        res.clearCookie('token');
        return res.redirect('/login.html?error=invalid_token');
    }
};

// Protected routes
app.use(['/dashboard', '/profile'], protectRoute);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/activities', activityRoutes);
app.use('/', pageRoutes);

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve indexfeedver.html as the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'indexfeedver.html'));
});

// Handle all other routes by serving indexfeedver.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'indexfeedver.html'));
});

// Handle 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Error handling middleware
app.use(securityMiddleware.errorHandler);

// MongoDB connection with retry logic
function connectToMongoDB() {
    console.log('Attempting to connect to MongoDB...');
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(async () => {
        console.log('Connected to MongoDB successfully');
        try {
            await createTestUser();
        } catch (error) {
            console.error('Error in startup tasks:', error);
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectToMongoDB, 5000);
    });
}

// Create test user on startup
const bcrypt = require('bcryptjs');

async function createTestUser() {
    try {
        const User = require('./models/User');
        const testUser = await User.findOne({ email: 'test@example.com' });
        if (!testUser) {
            console.log('Creating test user...');
            const hashedPassword = await bcrypt.hash('TestPassword123!', 12);
            const newUser = new User({
                username: 'testuser',
                email: 'test@example.com',
                password: hashedPassword
            });
            await newUser.save();
            console.log('Test user created successfully');
        } else {
            console.log('Test user already exists');
        }
    } catch (error) {
        console.error('Error creating/updating test user:', error);
    }
}

// Start cleanup of expired sessions
sessionSecurity.cleanupSessions();

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectToMongoDB();
});

// Handle server shutdown
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    });
});
