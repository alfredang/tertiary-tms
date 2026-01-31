import { Router } from 'express';
import authRoutes from './auth.routes.js';
import courseRoutes from './course.routes.js';
import courseRunRoutes from './courseRun.routes.js';
import enrollmentRoutes from './enrollment.routes.js';
import paymentRoutes from './payment.routes.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/course-runs', courseRunRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/payments', paymentRoutes);

export default router;
