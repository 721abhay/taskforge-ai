import dotenv from 'dotenv';

dotenv.config();

export const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '4000', 10),

    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: process.env.CORS_CREDENTIALS === 'true',
    },

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },

    services: {
        auth: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
        project: process.env.PROJECT_SERVICE_URL || 'http://localhost:5002',
        task: process.env.TASK_SERVICE_URL || 'http://localhost:5003',
        collaboration: process.env.COLLABORATION_SERVICE_URL || 'http://localhost:5004',
        ai: process.env.AI_SERVICE_URL || 'http://localhost:8000',
        analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:5005',
        notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5007',
        integration: process.env.INTEGRATION_SERVICE_URL || 'http://localhost:5006',
    },

    logging: {
        level: process.env.LOG_LEVEL || 'info',
        prettyPrint: process.env.PRETTY_LOGS === 'true',
    },
};
