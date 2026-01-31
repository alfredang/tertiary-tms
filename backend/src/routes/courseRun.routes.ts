import { Router } from 'express';
import { courseRunController } from '../controllers/courseRun.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Read operations - available to all authenticated users
router.get('/', courseRunController.getAll);
router.get('/upcoming', courseRunController.getUpcoming);
router.get('/ongoing', courseRunController.getOngoing);
router.get('/completed', courseRunController.getCompleted);
router.get('/:id', courseRunController.getById);

// Write operations - admin only
router.post(
  '/',
  requireRole(UserRole.Admin, UserRole.TrainingProvider),
  courseRunController.create
);
router.put(
  '/:id',
  requireRole(UserRole.Admin, UserRole.TrainingProvider),
  courseRunController.update
);
router.delete(
  '/:id',
  requireRole(UserRole.Admin, UserRole.TrainingProvider),
  courseRunController.delete
);
router.post(
  '/:id/assign-trainer',
  requireRole(UserRole.Admin, UserRole.TrainingProvider),
  courseRunController.assignTrainer
);

export default router;
