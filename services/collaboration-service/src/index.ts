import express, { Application } from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import 'express-async-errors';
import pinoHttp from 'pino-http';
import { logger } from '@taskforge/logger';
import { errorMiddleware, requestCorrelationMiddleware } from '@taskforge/middleware';

const app: Application = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(requestCorrelationMiddleware);
app.use(pinoHttp({ logger }));
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

const projectUsers: Record<string, Set<string>> = {};

// Socket.io
io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);

    socket.on('join-project', ({ projectId, userId, fullName }) => {
        socket.join(`project:${projectId}`);

        if (!projectUsers[projectId]) {
            projectUsers[projectId] = new Set();
        }
        projectUsers[projectId].add(fullName);

        // Broadcast updated user list
        io.to(`project:${projectId}`).emit('presence-update', Array.from(projectUsers[projectId]));

        logger.info(`User ${fullName} joined project: ${projectId}`);

        // Clean up on disconnect
        socket.on('disconnect', () => {
            projectUsers[projectId].delete(fullName);
            io.to(`project:${projectId}`).emit('presence-update', Array.from(projectUsers[projectId]));
            logger.info(`User ${fullName} left project: ${projectId}`);
        });
    });

    socket.on('send-message', (data) => {
        const { projectId, message, userId, fullName } = data;
        const messageData = {
            id: Math.random().toString(36).substring(2, 11),
            projectId,
            message,
            userId,
            fullName,
            timestamp: new Date().toISOString()
        };

        io.to(`project:${projectId}`).emit('new-message', messageData);
        logger.info(`Message sent in project ${projectId} by ${fullName}`);
    });

    socket.on('typing', (data) => {
        socket.to(`project:${data.projectId}`).emit('user-typing', data);
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'collaboration-service',
        timestamp: new Date().toISOString(),
    });
});

// Error handling
app.use(errorMiddleware);

const PORT = process.env.COLLABORATION_SERVICE_PORT || 5004;
server.listen(PORT, () => {
    logger.info(`🌐 Collaboration Service running on port ${PORT}`);
});

export { io };
export default app;
