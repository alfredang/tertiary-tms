import { Router } from 'express';
import { enrollmentController } from '../controllers/enrollment.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Enrollments - Read operations
router.get('/', enrollmentController.getAll);
router.get('/my', enrollmentController.getMyEnrollments);
router.get('/:id', enrollmentController.getById);

// Enrollments - Write operations (admin and learners)
router.post(
  '/',
  requireRole(UserRole.Admin, UserRole.TrainingProvider, UserRole.Learner),
  enrollmentController.create
);
router.put(
  '/:id',
  requireRole(UserRole.Admin, UserRole.TrainingProvider),
  enrollmentController.update
);
router.delete(
  '/:id',
  requireRole(UserRole.Admin, UserRole.TrainingProvider),
  enrollmentController.delete
);

// Progress tracking (learners)
router.post(
  '/:id/complete-subtopic/:subtopicId',
  requireRole(UserRole.Learner),
  enrollmentController.completeSubtopic
);
router.post(
  '/:id/bookmark/:subtopicId',
  requireRole(UserRole.Learner),
  enrollmentController.toggleBookmark
);

// Assessment submission (learners)
router.post(
  '/:id/assessments/:assessmentId/submit',
  requireRole(UserRole.Learner),
  enrollmentController.submitAssessment
);

// Grading (trainers and admins)
router.put(
  '/:id/assessments/:assessmentId/grade',
  requireRole(UserRole.Trainer, UserRole.Admin, UserRole.TrainingProvider),
  enrollmentController.updateGrade
);

export default router;
