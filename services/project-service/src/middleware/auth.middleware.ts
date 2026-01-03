import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@taskforge/database';

const prisma = new PrismaClient();

export const authMiddleware = async (
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

        // For now, we'll decode the token manually
        // In production, verify with JWT
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
        });

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
            });
        }

        (req as any).user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
};
