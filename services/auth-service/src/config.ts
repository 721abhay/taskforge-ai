import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: parseInt(process.env.AUTH_SERVICE_PORT || '5001', 10),
    env: process.env.NODE_ENV || 'development',

    database: {
        url: process.env.DATABASE_URL || 'postgresql://taskforge:taskforge_dev_password@localhost:5432/taskforge_dev',
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_change_in_production',
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },

    bcrypt: {
        saltRounds: 10,
    },

    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
    },
};
