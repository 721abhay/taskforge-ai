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
        service: 'analytics-service',
        timestamp: new Date().toISOString(),
    });
});

// Analytics endpoints
app.get('/api/analytics/project/:projectId', async (req, res) => {
    const { projectId } = req.params;

    // In production, we'd query the DB for:
    // 1. Task history for burndown
    // 2. Member activity for velocity
    // 3. Status changes for bottleneck detection

    res.json({
        success: true,
        data: {
            completionRate: 68,
            velocity: 14.2,
            predictedFinishDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            burnDown: [
                { date: '2026-01-01', remaining: 100 },
                { date: '2026-01-02', remaining: 82 },
                { date: '2026-01-03', remaining: 68 },
            ],
            taskDistribution: {
                TODO: 8,
                IN_PROGRESS: 4,
                IN_REVIEW: 2,
                DONE: 15
            },
            teamPerformance: [
                { name: 'John Doe', tasksCompleted: 12, velocity: 4.5 },
                { name: 'Jane Smith', tasksCompleted: 8, velocity: 3.8 }
            ]
        }
    });
});

// Error handling
app.use(errorMiddleware);

const PORT = process.env.ANALYTICS_SERVICE_PORT || 5005;
app.listen(PORT, () => {
    logger.info(`📊 Analytics Service running on port ${PORT}`);
});

export default app;
