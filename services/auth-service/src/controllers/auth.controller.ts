import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validator';

export class AuthController {
    /**
     * Register a new user
     * POST /auth/register
     */
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            // Validate input
            const input = registerSchema.parse(req.body);

            // Register user
            const result = await AuthService.register(input);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Login user
     * POST /auth/login
     */
    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            // Validate input
            const input = loginSchema.parse(req.body);

            // Login user
            const result = await AuthService.login(input);

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Refresh access token
     * POST /auth/refresh
     */
    static async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            // Validate input
            const { refreshToken } = refreshTokenSchema.parse(req.body);

            // Refresh token
            const tokens = await AuthService.refreshToken(refreshToken);

            res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                data: { tokens },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Logout user
     * POST /auth/logout
     */
    static async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;

            if (refreshToken) {
                await AuthService.logout(refreshToken);
            }

            res.status(200).json({
                success: true,
                message: 'Logout successful',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get current user
     * GET /auth/me
     */
    static async me(req: Request, res: Response, next: NextFunction) {
        try {
            // User is already attached to req by auth middleware
            const user = (req as any).user;

            res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        fullName: user.fullName,
                        role: user.role,
                        avatarUrl: user.avatarUrl,
                        timezone: user.timezone,
                        preferences: user.preferences,
                        createdAt: user.createdAt,
                    },
                },
            });
        } catch (error) {
            next(error);
        }
    }
}
