const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Custom log format
const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.metadata(),
    winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    defaultMeta: { service: 'aiguilt-api' },
    transports: [
        // Console transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message, metadata, stack }) => {
                    let log = `${timestamp} ${level}: ${message}`;
                    if (stack) log += `\n${stack}`;
                    if (metadata && Object.keys(metadata).length > 0) {
                        log += `\nMetadata: ${JSON.stringify(metadata, null, 2)}`;
                    }
                    return log;
                })
            )
        }),

        // Rotating file transport for errors
        new DailyRotateFile({
            filename: path.join(__dirname, '../logs/error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: '20m',
            maxFiles: '14d',
            zippedArchive: true
        }),

        // Rotating file transport for all logs
        new DailyRotateFile({
            filename: path.join(__dirname, '../logs/combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
            zippedArchive: true
        })
    ],
    // Handle exceptions and rejections
    exceptionHandlers: [
        new DailyRotateFile({
            filename: path.join(__dirname, '../logs/exceptions-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
            zippedArchive: true
        })
    ],
    rejectionHandlers: [
        new DailyRotateFile({
            filename: path.join(__dirname, '../logs/rejections-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
            zippedArchive: true
        })
    ]
});

// Add request logging middleware
logger.requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('HTTP Request', {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent')
        });
    });
    next();
};

// Add error logging middleware
logger.errorLogger = (err, req, res, next) => {
    logger.error('Unhandled Error', {
        error: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        user: req.user ? req.user._id : 'anonymous'
    });
    next(err);
};

module.exports = logger;