const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Helper function to check if a string contains SQL injection patterns
const containsSqlInjection = (str) => {
    const sqlPatterns = [
        /(\s*([\0\b\'\"\n\r\t\%\_\\]*\s*(((select\s*.+\s*from\s*.+)|(insert\s*.+\s*into\s*.+)|(update\s*.+\s*set\s*.+)|(delete\s*.+\s*from\s*.+)|(drop\s*.+)|(truncate\s*.+)|(alter\s*.+)|(exec\s*.+)|(\s*(all|any|not|and|between|in|like|or|some|contains|containsall|containskey)\s*.+[\=\>\<=\!\~]+.*))))/i,
        /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
        /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
        /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
        /((\%27)|(\'))union/i
    ];
    return sqlPatterns.some(pattern => pattern.test(str));
};

// Helper function to check if an object contains NoSQL injection patterns
const containsNoSqlInjection = (obj) => {
    const noSqlOperators = ['$', '{$'];
    const checkValue = (value) => {
        if (typeof value === 'string') {
            return noSqlOperators.some(op => value.includes(op));
        }
        if (typeof value === 'object' && value !== null) {
            return Object.keys(value).some(key => key.startsWith('$')) ||
                   Object.values(value).some(v => checkValue(v));
        }
        return false;
    };
    return checkValue(obj);
};

// Helper function to check if a string contains email header injection patterns
const containsEmailHeaderInjection = (str) => {
    const headerInjectionPatterns = [
        /[\n\r]/,
        /Content-Type:/i,
        /MIME-Version:/i,
        /Subject:/i,
        /To:/i,
        /From:/i,
        /Cc:/i,
        /Bcc:/i
    ];
    return headerInjectionPatterns.some(pattern => pattern.test(str));
};

// Validation chains
const authValidation = {
    register: [
        body('email')
            .isEmail()
            .normalizeEmail()
            .custom(value => {
                if (containsEmailHeaderInjection(value)) {
                    throw new Error('Invalid email format');
                }
                return true;
            }),
        body('password')
            .isLength({ min: 8 })
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            .custom(value => {
                if (containsSqlInjection(value)) {
                    throw new Error('Invalid password format');
                }
                return true;
            }),
        body('username')
            .trim()
            .isLength({ min: 3 })
            .escape()
            .custom(value => {
                if (containsSqlInjection(value)) {
                    throw new Error('Invalid username format');
                }
                return true;
            })
    ],
    login: [
        body('email')
            .isEmail()
            .normalizeEmail()
            .custom(value => {
                if (containsEmailHeaderInjection(value)) {
                    throw new Error('Invalid email format');
                }
                return true;
            }),
        body('password')
            .notEmpty()
            .custom(value => {
                if (containsSqlInjection(value)) {
                    throw new Error('Invalid password format');
                }
                return true;
            })
    ]
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
    // Check for NoSQL injection in request body
    if (containsNoSqlInjection(req.body)) {
        return res.status(400).json({ message: 'Invalid input detected' });
    }

    // Check for NoSQL injection in query parameters
    if (containsNoSqlInjection(req.query)) {
        return res.status(400).json({ message: 'Invalid query parameters' });
    }

    // Check for NoSQL injection in URL parameters
    if (containsNoSqlInjection(req.params)) {
        return res.status(400).json({ message: 'Invalid URL parameters' });
    }

    next();
};

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    }
    next();
};

// File upload validation
const validateFileUpload = (allowedTypes) => (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: 'No files were uploaded' });
    }

    const file = req.files.file;
    const fileType = file.mimetype;

    if (!allowedTypes.includes(fileType)) {
        return res.status(400).json({ message: 'Invalid file type' });
    }

    // Check for malicious file extensions
    const dangerousExtensions = ['.php', '.jsp', '.asp', '.aspx', '.exe', '.dll', '.js'];
    if (dangerousExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
        return res.status(400).json({ message: 'File type not allowed' });
    }

    next();
};

// Path traversal prevention
const preventPathTraversal = (req, res, next) => {
    const path = req.params[0] || req.query.path || '';
    if (path.includes('../') || path.includes('..\\')) {
        return res.status(400).json({ message: 'Invalid path' });
    }
    next();
};

module.exports = {
    authValidation,
    sanitizeInput,
    handleValidationErrors,
    validateFileUpload,
    preventPathTraversal
};
