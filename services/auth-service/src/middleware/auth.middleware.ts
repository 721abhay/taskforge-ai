import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided',
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token and get user
        const user = await AuthService.verifyToken(token);

        // Attach user to request
        (req as any).user = user;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
};
