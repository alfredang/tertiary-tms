import { Router } from 'express';
import { courseController } from '../controllers/course.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireRole, requirePermission } from '../middleware/rbac.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Course CRUD
router.get('/', courseController.getAll);
router.get('/:id', courseController.getById);
router.post(
  '/',
  requireRole(UserRole.Admin, UserRole.Developer, UserRole.TrainingProvider),
  courseController.create
);
router.put(
  '/:id',
  requireRole(UserRole.Admin, UserRole.Developer, UserRole.TrainingProvider),
  courseController.update
);
router.delete(
  '/:id',
  requireRole(UserRole.Admin, UserRole.TrainingProvider),
  courseController.delete
);

// Topic management
router.post(
  '/:id/topics',
  requireRole(UserRole.Admin, UserRole.Developer, UserRole.TrainingProvider),
  courseController.addTopic
);
router.put(
  '/topics/:topicId',
  requireRole(UserRole.Admin, UserRole.Developer, UserRole.TrainingProvider),
  courseController.updateTopic
);
router.delete(
  '/topics/:topicId',
  requireRole(UserRole.Admin, UserRole.Developer, UserRole.TrainingProvider),
  courseController.deleteTopic
);

// Subtopic management
router.post(
  '/topics/:topicId/subtopics',
  requireRole(UserRole.Admin, UserRole.Developer, UserRole.TrainingProvider),
  courseController.addSubtopic
);
router.put(
  '/subtopics/:subtopicId',
  requireRole(UserRole.Admin, UserRole.Developer, UserRole.TrainingProvider),
  courseController.updateSubtopic
);
router.delete(
  '/subtopics/:subtopicId',
  requireRole(UserRole.Admin, UserRole.Developer, UserRole.TrainingProvider),
  courseController.deleteSubtopic
);

export default router;
