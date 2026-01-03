import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import 'express-async-errors';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
}));

// Compression
app.use(compression());

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
  });
});

// API version
app.get('/api/v1', (req: Request, res: Response) => {
  res.json({
    name: 'TaskForge AI API',
    version: '1.0.0',
    description: 'Enterprise-grade AI-powered project management platform',
    endpoints: {
      auth: '/api/v1/auth',
      organizations: '/api/v1/organizations',
      projects: '/api/v1/projects',
      tasks: '/api/v1/tasks',
      ai: '/api/v1/ai',
      integrations: '/api/v1/integrations',
    },
  });
});

// Service proxies
const serviceProxy = (serviceName: string, serviceUrl: string) => {
  return createProxyMiddleware({
    target: serviceUrl,
    changeOrigin: true,
    pathRewrite: {
      [`^/api/v1/${serviceName}`]: '',
    },
    onProxyReq: (proxyReq, req, res) => {
      logger.info(`Proxying ${req.method} ${req.path} to ${serviceName}`);
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error for ${serviceName}:`, err);
      res.status(503).json({
        error: 'Service Unavailable',
        message: `${serviceName} is currently unavailable`,
      });
    },
  });
};

// Route to services
app.use('/api/v1/auth', serviceProxy('auth', config.services.auth));
app.use('/api/v1/projects', serviceProxy('projects', config.services.project));
app.use('/api/v1/tasks', serviceProxy('tasks', config.services.task));
app.use('/api/v1/comments', serviceProxy('collaboration', config.services.collaboration));
app.use('/api/v1/ai', serviceProxy('ai', config.services.ai));
app.use('/api/v1/integrations', serviceProxy('integrations', config.services.integration));
app.use('/api/v1/analytics', serviceProxy('analytics', config.services.analytics));

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`🚀 API Gateway running on port ${PORT}`);
  logger.info(`📝 Environment: ${config.env}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;
