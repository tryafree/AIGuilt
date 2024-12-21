const helmet = require('helmet');

// CSP directives configuration
const cspConfig = {
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", process.env.API_URL || 'http://localhost:3000'],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
    }
};

// Security middleware configuration
const securityMiddleware = {
    // Basic security headers
    basic: [
        // Enable helmet with default settings
        helmet(),

        // Custom CSP configuration
        helmet.contentSecurityPolicy(cspConfig),

        // Custom security headers
        (req, res, next) => {
            // HSTS with preload
            res.setHeader(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains; preload'
            );

            // Prevent clickjacking
            res.setHeader('X-Frame-Options', 'DENY');

            // Enable XSS filter
            res.setHeader('X-XSS-Protection', '1; mode=block');

            // Prevent MIME type sniffing
            res.setHeader('X-Content-Type-Options', 'nosniff');

            // Referrer policy
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

            // Feature policy
            res.setHeader(
                'Permissions-Policy',
                'geolocation=(), microphone=(), camera=(), payment=()'
            );

            next();
        }
    ],

    // Production-only security headers
    production: [
        (req, res, next) => {
            if (process.env.NODE_ENV === 'production') {
                // Force HTTPS
                if (!req.secure) {
                    return res.redirect(301, `https://${req.headers.host}${req.url}`);
                }

                // HSTS with longer max age
                res.setHeader(
                    'Strict-Transport-Security',
                    'max-age=63072000; includeSubDomains; preload'
                );

                // Stricter CSP in production
                const productionCsp = {
                    ...cspConfig,
                    directives: {
                        ...cspConfig.directives,
                        scriptSrc: ["'self'"], // Remove unsafe-inline and unsafe-eval
                        upgradeInsecureRequests: [], // Force HTTPS
                        blockAllMixedContent: [] // Block mixed content
                    }
                };
                helmet.contentSecurityPolicy(productionCsp)(req, res, next);
            } else {
                next();
            }
        }
    ],

    // CORS configuration
    cors: {
        origin: process.env.ALLOWED_ORIGINS ? 
            process.env.ALLOWED_ORIGINS.split(',') : 
            ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        maxAge: 86400 // 24 hours
    },

    // Error handler that doesn't leak sensitive information
    errorHandler: (err, req, res, next) => {
        console.error(err.stack);

        // Don't leak error details in production
        const message = process.env.NODE_ENV === 'production' ?
            'Internal Server Error' :
            err.message;

        res.status(err.status || 500).json({
            message,
            error: process.env.NODE_ENV === 'production' ? {} : err
        });
    }
};

module.exports = securityMiddleware;
