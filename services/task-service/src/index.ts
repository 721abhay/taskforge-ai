import express, { Application } from 'express';
import cors from 'cors';
import 'express-async-errors';
import pinoHttp from 'pino-http';
import { logger } from '@taskforge/logger';
import { errorMiddleware, requestCorrelationMiddleware } from '@taskforge/middleware';
import taskRoutes from './routes/task.routes';

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
        service: 'task-service',
        timestamp: new Date().toISOString(),
    });
});

// Routes
app.use('/', taskRoutes);

// Error handling
app.use(errorMiddleware);

const PORT = process.env.TASK_SERVICE_PORT || 5003;
app.listen(PORT, () => {
    logger.info(`✅ Task Service running on port ${PORT}`);
});

export default app;
