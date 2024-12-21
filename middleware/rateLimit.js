const rateLimit = require('express-rate-limit');

// Helper function to get client IP
const getClientIp = (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0] || 
           req.connection.remoteAddress;
};

// Configure rate limiters
const rateLimiters = {
    // General API rate limiter
    api: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later',
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: getClientIp
    }),

    // Authentication rate limiter (more strict)
    auth: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // Limit each IP to 5 login attempts per windowMs
        message: 'Too many login attempts, please try again later',
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: getClientIp
    }),

    // File upload rate limiter
    upload: rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 10, // Limit each IP to 10 uploads per hour
        message: 'Too many file uploads, please try again later',
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: getClientIp
    }),

    // Search rate limiter
    search: rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 30, // Limit each IP to 30 searches per 5 minutes
        message: 'Too many search requests, please try again later',
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: getClientIp
    }),

    // Custom rate limiter factory
    createCustomLimiter: (options) => {
        return rateLimit({
            windowMs: options.windowMs || 15 * 60 * 1000,
            max: options.max || 100,
            message: options.message || 'Too many requests, please try again later',
            standardHeaders: true,
            legacyHeaders: false,
            keyGenerator: getClientIp,
            skip: options.skip || (() => false),
            handler: options.handler || ((req, res) => {
                res.status(429).json({
                    message: options.message || 'Too many requests, please try again later'
                });
            })
        });
    }
};

// Endpoint-specific rate limiters
const endpointLimiters = {
    // Posts endpoints
    posts: rateLimiters.createCustomLimiter({
        windowMs: 15 * 60 * 1000,
        max: 50,
        message: 'Too many post requests, please try again later'
    }),

    // Comments endpoints
    comments: rateLimiters.createCustomLimiter({
        windowMs: 15 * 60 * 1000,
        max: 30,
        message: 'Too many comment requests, please try again later'
    }),

    // User profile updates
    profile: rateLimiters.createCustomLimiter({
        windowMs: 60 * 60 * 1000,
        max: 10,
        message: 'Too many profile update requests, please try again later'
    })
};

// Dynamic rate limiter based on user role
const createRoleLimiter = (defaultMax) => {
    const limiter = rateLimiters.createCustomLimiter({
        max: defaultMax,
        skip: (req) => {
            // Skip rate limiting for admin users
            if (req.user && req.user.role === 'admin') {
                return true;
            }
            // Apply different limits based on user role
            if (req.user && req.user.role === 'premium') {
                limiter.max = defaultMax * 2;
            }
            return false;
        }
    });
    return limiter;
};

module.exports = {
    rateLimiters,
    endpointLimiters,
    createRoleLimiter
};
