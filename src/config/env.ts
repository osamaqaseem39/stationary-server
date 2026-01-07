import dotenv from 'dotenv';

dotenv.config();

// Parse CORS origins - supports comma-separated string or array
const parseCorsOrigins = (): string[] => {
  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://stationary-website-gxp8.vercel.app',
    'https://stationary-website-sigma.vercel.app'
  ];

  if (process.env.CORS_ORIGIN) {
    // If CORS_ORIGIN is set, parse it as comma-separated string and merge with defaults
    const envOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
    return [...new Set([...defaultOrigins, ...envOrigins])]; // Remove duplicates
  }

  return defaultOrigins;
};

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/gbs-ecommerce',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  corsOrigin: parseCorsOrigins(),
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
};

