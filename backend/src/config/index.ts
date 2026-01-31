import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Storage
  storageType: process.env.STORAGE_TYPE || 'local',
  uploadDir: process.env.UPLOAD_DIR || './uploads',

  // AWS S3
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'ap-southeast-1',
    s3Bucket: process.env.AWS_S3_BUCKET,
  },

  // SSG API
  ssg: {
    apiUrl: process.env.SSG_API_URL || 'https://api.ssg-wsg.sg',
    apiKey: process.env.SSG_API_KEY,
    certPath: process.env.SSG_CERT_PATH,
    privateKeyPath: process.env.SSG_PRIVATE_KEY_PATH,
  },
};

export { jwtConfig } from './jwt';
export { stripe, stripeConfig } from './stripe';
export { prisma } from './database';

export default config;
