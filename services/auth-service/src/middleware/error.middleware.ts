import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error:', err);

    // Zod validation errors
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: err.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            })),
        });
    }

    // Custom error messages
    if (err.message) {
        const statusCode = err.message.includes('not found') ? 404 :
            err.message.includes('already exists') ? 409 :
                err.message.includes('Invalid') || err.message.includes('expired') ? 401 :
                    400;

        return res.status(statusCode).json({
            success: false,
            message: err.message,
        });
    }

    // Default error
    return res.status(500).json({
        success: false,
        message: 'Internal server error',
    });
};
