import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { EnrollmentStatus, PaymentStatus, GradeStatus } from '@prisma/client';
import { enrollmentService } from '../services/enrollment.service';
import { AuthRequest } from '../middleware/auth.middleware';

const createEnrollmentSchema = z.object({
  courseRunId: z.string().uuid(),
  learnerId: z.string().uuid(),
  sponsorshipType: z.enum(['SelfSponsored', 'EmployerSponsored']).optional(),
  paymentMode: z.string().optional(),
  employer: z
    .object({
      uen: z.string().optional(),
      companyName: z.string().optional(),
      companyType: z.string().optional(),
      contactName: z.string().optional(),
      contactEmail: z.string().email().optional(),
      contactPhone: z.string().optional(),
    })
    .optional(),
});

const updateEnrollmentSchema = z.object({
  enrollmentStatus: z.nativeEnum(EnrollmentStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  paymentMode: z.string().optional(),
  quizScore: z.number().min(0).max(100).optional(),
});

const gradeSchema = z.object({
  status: z.enum(['Competent', 'NotYetCompetent', 'Pending']),
});

export const enrollmentController = {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { courseRunId, learnerId, enrollmentStatus, paymentStatus } = req.query;

      const filters = {
        courseRunId: courseRunId as string | undefined,
        learnerId: learnerId as string | undefined,
        enrollmentStatus: enrollmentStatus as EnrollmentStatus | undefined,
        paymentStatus: paymentStatus as PaymentStatus | undefined,
      };

      const enrollments = await enrollmentService.findAll(filters);

      res.json({
        success: true,
        data: enrollments,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const enrollment = await enrollmentService.findById(id);

      res.json({
        success: true,
        data: enrollment,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyEnrollments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
        return;
      }

      // Get learner profile for current user
      const enrollments = await enrollmentService.findAll({
        // Filter by learner - this would need the learner profile ID
        // For now, we'll return all and filter can be improved
      });

      res.json({
        success: true,
        data: enrollments,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createEnrollmentSchema.parse(req.body);
      const enrollment = await enrollmentService.create(data);

      res.status(201).json({
        success: true,
        data: enrollment,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateEnrollmentSchema.parse(req.body);

      const enrollment = await enrollmentService.update(id, data);

      res.json({
        success: true,
        data: enrollment,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await enrollmentService.delete(id);

      res.json({
        success: true,
        message: 'Enrollment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Progress tracking
  async completeSubtopic(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id, subtopicId } = req.params;
      const enrollment = await enrollmentService.completeSubtopic(id, subtopicId);

      res.json({
        success: true,
        data: enrollment,
      });
    } catch (error) {
      next(error);
    }
  },

  async toggleBookmark(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id, subtopicId } = req.params;
      const enrollment = await enrollmentService.toggleBookmark(id, subtopicId);

      res.json({
        success: true,
        data: enrollment,
      });
    } catch (error) {
      next(error);
    }
  },

  // Grading
  async updateGrade(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id, assessmentId } = req.params;
      const { status } = gradeSchema.parse(req.body);

      const grade = await enrollmentService.updateGrade(
        id,
        assessmentId,
        status,
        req.user?.sub
      );

      res.json({
        success: true,
        data: grade,
      });
    } catch (error) {
      next(error);
    }
  },

  // Assessment submission
  async submitAssessment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id, assessmentId } = req.params;
      const { fileName, fileUrl } = req.body;

      const submission = await enrollmentService.submitAssessment(
        id,
        assessmentId,
        fileName,
        fileUrl
      );

      res.status(201).json({
        success: true,
        data: submission,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default enrollmentController;
