import app from './app';
import { config, prisma } from './config/index';

const PORT = config.port;

// For Vercel serverless deployment
export default app;

// For local development
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  async function main() {
    try {
      // Test database connection
      await prisma.$connect();
      console.log('Connected to database');

      // Start server
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${config.nodeEnv}`);
        console.log(`API URL: http://localhost:${PORT}/api`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\nShutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
  });

  main();
}
