import express, { Application } from 'express';
import cors from 'cors';
import 'express-async-errors';
import pinoHttp from 'pino-http';
import { logger } from '@taskforge/logger';
import { errorMiddleware, requestCorrelationMiddleware } from '@taskforge/middleware';

const app: Application = express();

// Middleware
app.use(requestCorrelationMiddleware);
app.use(pinoHttp({ logger }));
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'notification-service',
        timestamp: new Date().toISOString(),
    });
});

// For now, in-app notifications endpoint
app.post('/api/notifications', async (req, res) => {
    logger.info('Received notification request', req.body);
    // Logic to save to DB and emit websocket if possible
    res.json({ success: true, message: 'Notification queued' });
});

// Error handling
app.use(errorMiddleware);

const PORT = process.env.NOTIFICATION_SERVICE_PORT || 5005;
app.listen(PORT, () => {
    logger.info(`🔔 Notification Service running on port ${PORT}`);
});

export default app;
