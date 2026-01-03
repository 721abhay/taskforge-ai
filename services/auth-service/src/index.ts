import express, { Application } from 'express';
import cors from 'cors';
import 'express-async-errors';
import { config } from './config';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middleware/error.middleware';

const app: Application = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'auth-service',
        timestamp: new Date().toISOString(),
    });
});

// Routes
app.use('/auth', authRoutes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`🔐 Auth Service running on port ${PORT}`);
    console.log(`📝 Environment: ${config.env}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    process.exit(0);
});

export default app;
