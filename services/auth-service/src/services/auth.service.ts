import { PrismaClient, User } from '@taskforge/database';
import { PasswordService } from './password.service';
import { TokenService, TokenPair } from './token.service';

const prisma = new PrismaClient();

export interface RegisterInput {
    email: string;
    password: string;
    fullName: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        fullName: string;
        role: string;
        avatarUrl: string | null;
    };
    tokens: TokenPair;
}

export class AuthService {
    /**
     * Register a new user
     */
    static async register(input: RegisterInput): Promise<AuthResponse> {
        const { email, password, fullName } = input;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Validate password strength
        const passwordValidation = PasswordService.validate(password);
        if (!passwordValidation.valid) {
            throw new Error(passwordValidation.errors.join(', '));
        }

        // Hash password
        const passwordHash = await PasswordService.hash(password);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                fullName,
                role: 'MEMBER',
            },
        });

        // Generate tokens
        const tokens = TokenService.generateTokenPair({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // Create session
        await prisma.session.create({
            data: {
                userId: user.id,
                token: tokens.refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
            tokens,
        };
    }

    /**
     * Login user
     */
    static async login(input: LoginInput): Promise<AuthResponse> {
        const { email, password } = input;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new Error('Invalid email or password');
        }

        if (!user.isActive) {
            throw new Error('Account is deactivated');
        }

        // Verify password
        if (!user.passwordHash) {
            throw new Error('Password not set. Please use OAuth login.');
        }

        const isPasswordValid = await PasswordService.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // Generate tokens
        const tokens = TokenService.generateTokenPair({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // Create session
        await prisma.session.create({
            data: {
                userId: user.id,
                token: tokens.refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
            tokens,
        };
    }

    /**
     * Refresh access token
     */
    static async refreshToken(refreshToken: string): Promise<TokenPair> {
        // Verify refresh token
        const payload = TokenService.verifyRefreshToken(refreshToken);

        // Check if session exists
        const session = await prisma.session.findFirst({
            where: {
                token: refreshToken,
                userId: payload.userId,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });

        if (!session) {
            throw new Error('Invalid or expired refresh token');
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
        });

        if (!user || !user.isActive) {
            throw new Error('User not found or deactivated');
        }

        // Generate new tokens
        const tokens = TokenService.generateTokenPair({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // Update session with new refresh token
        await prisma.session.update({
            where: { id: session.id },
            data: {
                token: tokens.refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        return tokens;
    }

    /**
     * Logout user
     */
    static async logout(refreshToken: string): Promise<void> {
        await prisma.session.deleteMany({
            where: { token: refreshToken },
        });
    }

    /**
     * Get user by ID
     */
    static async getUserById(userId: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id: userId },
        });
    }

    /**
     * Verify access token and get user
     */
    static async verifyToken(accessToken: string): Promise<User> {
        const payload = TokenService.verifyAccessToken(accessToken);

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
        });

        if (!user || !user.isActive) {
            throw new Error('User not found or deactivated');
        }

        return user;
    }
}
