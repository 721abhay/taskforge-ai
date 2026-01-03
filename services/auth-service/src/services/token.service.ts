import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export class TokenService {
    /**
     * Generate access token
     */
    static generateAccessToken(payload: TokenPayload): string {
        return jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn,
        });
    }

    /**
     * Generate refresh token
     */
    static generateRefreshToken(payload: TokenPayload): string {
        return jwt.sign(payload, config.jwt.refreshSecret, {
            expiresIn: config.jwt.refreshExpiresIn,
        });
    }

    /**
     * Generate both access and refresh tokens
     */
    static generateTokenPair(payload: TokenPayload): TokenPair {
        return {
            accessToken: this.generateAccessToken(payload),
            refreshToken: this.generateRefreshToken(payload),
        };
    }

    /**
     * Verify access token
     */
    static verifyAccessToken(token: string): TokenPayload {
        try {
            return jwt.verify(token, config.jwt.secret) as TokenPayload;
        } catch (error) {
            throw new Error('Invalid or expired access token');
        }
    }

    /**
     * Verify refresh token
     */
    static verifyRefreshToken(token: string): TokenPayload {
        try {
            return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
        } catch (error) {
            throw new Error('Invalid or expired refresh token');
        }
    }

    /**
     * Decode token without verification (for debugging)
     */
    static decode(token: string): any {
        return jwt.decode(token);
    }
}
