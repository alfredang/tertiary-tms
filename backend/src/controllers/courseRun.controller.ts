import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { ClassStatus } from '@prisma/client';
import { courseRunService } from '../services/courseRun.service';
import { AuthRequest } from '../middleware/auth.middleware';

const createCourseRunSchema = z.object({
  courseId: z.string().uuid(),
  courseRunId: z.string().min(1),
  trainerId: z.string().uuid().optional(),
  daId: z.string().optional(),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
  classStatus: z.nativeEnum(ClassStatus).optional(),
  isLeaderboardEnabled: z.boolean().optional(),
});

const updateCourseRunSchema = z.object({
  trainerId: z.string().uuid().optional().nullable(),
  daId: z.string().optional(),
  startDate: z
    .string()
    .transform((s) => new Date(s))
    .optional(),
  endDate: z
    .string()
    .transform((s) => new Date(s))
    .optional(),
  classStatus: z.nativeEnum(ClassStatus).optional(),
  isLeaderboardEnabled: z.boolean().optional(),
  certificateUrl: z.string().url().optional(),
});

export const courseRunController = {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { courseId, trainerId, classStatus } = req.query;

      const filters = {
        courseId: courseId as string | undefined,
        trainerId: trainerId as string | undefined,
        trainingProviderId: req.user?.trainingProviderId,
        classStatus: classStatus as ClassStatus | undefined,
      };

      const courseRuns = await courseRunService.findAll(filters);

      res.json({
        success: true,
        data: courseRuns,
      });
    } catch (error) {
      next(error);
    }
  },

  async getUpcoming(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const courseRuns = await courseRunService.findUpcoming(
        req.user?.trainingProviderId
      );

      res.json({
        success: true,
        data: courseRuns,
      });
    } catch (error) {
      next(error);
    }
  },

  async getOngoing(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const courseRuns = await courseRunService.findOngoing(
        req.user?.trainingProviderId
      );

      res.json({
        success: true,
        data: courseRuns,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCompleted(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const courseRuns = await courseRunService.findCompleted(
        req.user?.trainingProviderId
      );

      res.json({
        success: true,
        data: courseRuns,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const courseRun = await courseRunService.findById(id);

      res.json({
        success: true,
        data: courseRun,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createCourseRunSchema.parse(req.body);

      const courseRun = await courseRunService.create({
        ...data,
        trainingProviderId: req.user?.trainingProviderId,
      });

      res.status(201).json({
        success: true,
        data: courseRun,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateCourseRunSchema.parse(req.body);

      const courseRun = await courseRunService.update(id, data);

      res.json({
        success: true,
        data: courseRun,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await courseRunService.delete(id);

      res.json({
        success: true,
        message: 'Course run deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async assignTrainer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { trainerId } = req.body;

      if (!trainerId) {
        res.status(400).json({
          success: false,
          error: 'Trainer ID is required',
        });
        return;
      }

      const courseRun = await courseRunService.assignTrainer(id, trainerId);

      res.json({
        success: true,
        data: courseRun,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default courseRunController;
