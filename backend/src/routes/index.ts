import { Router } from 'express';
import authRoutes from './auth.routes';
import courseRoutes from './course.routes';
import courseRunRoutes from './courseRun.routes';
import enrollmentRoutes from './enrollment.routes';
import paymentRoutes from './payment.routes';

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
