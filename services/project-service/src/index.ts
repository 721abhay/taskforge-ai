import express, { Application } from 'express';
import cors from 'cors';
import 'express-async-errors';
import pinoHttp from 'pino-http';
import { logger } from '@taskforge/logger';
import { errorMiddleware, requestCorrelationMiddleware } from '@taskforge/middleware';
import projectRoutes from './routes/project.routes';

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
        service: 'project-service',
        timestamp: new Date().toISOString(),
    });
});

// Routes
app.use('/', projectRoutes);

// Error handling
app.use(errorMiddleware);

const PORT = process.env.PROJECT_SERVICE_PORT || 5002;
app.listen(PORT, () => {
    logger.info(`📁 Project Service running on port ${PORT}`);
});

export default app;
