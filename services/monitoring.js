const promClient = require('prom-client');
const responseTime = require('response-time');

// Create a Registry to store metrics
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new promClient.Gauge({
    name: 'websocket_active_connections',
    help: 'Number of active WebSocket connections'
});

const databaseOperations = new promClient.Counter({
    name: 'database_operations_total',
    help: 'Total number of database operations',
    labelNames: ['operation', 'collection']
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeConnections);
register.registerMetric(databaseOperations);

// Middleware to track request duration and counts
const metricsMiddleware = responseTime((req, res, time) => {
    if (req.url !== '/metrics') {
        const route = req.route ? req.route.path : req.url;
        httpRequestDuration.observe(
            { method: req.method, route, status_code: res.statusCode },
            time / 1000
        );
        httpRequestTotal.inc({
            method: req.method,
            route,
            status_code: res.statusCode
        });
    }
});

module.exports = {
    register,
    metricsMiddleware,
    metrics: {
        activeConnections,
        databaseOperations
    }
};