import { Router, raw } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Stripe webhook - must be before other middleware, needs raw body
router.post('/webhook', raw({ type: 'application/json' }), paymentController.webhook);

// All other routes require authentication
router.use(authenticateToken);

// Get Stripe publishable key (for frontend)
router.get('/config', paymentController.getPublishableKey);

// Calculate fees for an enrollment
router.post('/calculate-fees', paymentController.calculateFees);

// Create payment intent
router.post(
  '/create-intent',
  requireRole(UserRole.Learner, UserRole.Admin, UserRole.TrainingProvider),
  paymentController.createPaymentIntent
);

// Get payments for an enrollment
router.get('/enrollment/:enrollmentId', paymentController.getByEnrollment);

// Refund a payment (admin only)
router.post(
  '/:paymentId/refund',
  requireRole(UserRole.Admin, UserRole.TrainingProvider),
  paymentController.refund
);

export default router;
