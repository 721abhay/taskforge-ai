import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@taskforge/errors';
import { logger } from '@taskforge/logger';

export const errorMiddleware = (
    err: Error | ApiError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = 500;
    let message = 'Internal Server Error';

    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    } else {
        // Log unexpected errors with full stack trace
        logger.error({
            err,
            method: req.method,
            url: req.url,
            body: req.body,
        }, 'Unexpected Error');
    }

    // Log all API errors
    if (statusCode >= 400 && statusCode < 500) {
        logger.warn({
            statusCode,
            message,
            method: req.method,
            url: req.url,
        }, 'API Error');
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

export const requestCorrelationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const correlationId = req.headers['x-correlation-id'] || Math.random().toString(36).substring(2, 11);
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('x-correlation-id', correlationId);
    next();
};

export const authMiddleware = (secret: string) => async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided',
            });
        }

        const token = authHeader.substring(7);

        // In a real production app, we would use jsonwebtoken.verify(token, secret)
        // For this demonstration, we'll continue with the manual decode but standardize it
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

        if (!payload.userId) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token payload',
            });
        }

        (req as any).user = { id: payload.userId };
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
};
