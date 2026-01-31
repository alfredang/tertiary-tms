import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { CourseStatus, CourseType } from '@prisma/client';
import { courseService } from '../services/course.service';
import { AuthRequest } from '../middleware/auth.middleware';

const createCourseSchema = z.object({
  title: z.string().min(1),
  courseCode: z.string().min(1),
  tscTitle: z.string().optional(),
  tscCode: z.string().optional(),
  trainingHours: z.number().optional(),
  assessmentHours: z.number().optional(),
  difficulty: z.string().optional(),
  modeOfLearning: z.array(z.string()).optional(),
  courseType: z.nativeEnum(CourseType).optional(),
  courseFee: z.number().min(0),
  taxPercent: z.number().min(0).max(100).optional(),
  status: z.nativeEnum(CourseStatus).optional(),
  isWsqFunded: z.boolean().optional(),
  isSkillsFutureEligible: z.boolean().optional(),
  isPseaEligible: z.boolean().optional(),
  isMcesEligible: z.boolean().optional(),
  isIbfFunded: z.boolean().optional(),
  isUtapEligible: z.boolean().optional(),
});

const updateCourseSchema = createCourseSchema.partial();

const topicSchema = z.object({
  title: z.string().min(1),
  sortOrder: z.number().optional(),
});

const subtopicSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  sortOrder: z.number().optional(),
});

export const courseController = {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, courseType, search, page, limit } = req.query;

      const filters = {
        status: status as CourseStatus | undefined,
        courseType: courseType as CourseType | undefined,
        trainingProviderId: req.user?.trainingProviderId,
        search: search as string | undefined,
      };

      const pagination = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      };

      const result = await courseService.findAll(filters, pagination);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const course = await courseService.findById(id);

      res.json({
        success: true,
        data: course,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createCourseSchema.parse(req.body);

      const course = await courseService.create({
        ...data,
        trainingProvider: req.user?.trainingProviderId
          ? { connect: { id: req.user.trainingProviderId } }
          : undefined,
      });

      res.status(201).json({
        success: true,
        data: course,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateCourseSchema.parse(req.body);

      const course = await courseService.update(id, data);

      res.json({
        success: true,
        data: course,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await courseService.delete(id);

      res.json({
        success: true,
        message: 'Course deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Topic management
  async addTopic(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = topicSchema.parse(req.body);

      const topic = await courseService.addTopic(id, data);

      res.status(201).json({
        success: true,
        data: topic,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateTopic(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { topicId } = req.params;
      const data = topicSchema.partial().parse(req.body);

      const topic = await courseService.updateTopic(topicId, data);

      res.json({
        success: true,
        data: topic,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteTopic(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { topicId } = req.params;
      await courseService.deleteTopic(topicId);

      res.json({
        success: true,
        message: 'Topic deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Subtopic management
  async addSubtopic(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { topicId } = req.params;
      const data = subtopicSchema.parse(req.body);

      const subtopic = await courseService.addSubtopic(topicId, data);

      res.status(201).json({
        success: true,
        data: subtopic,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateSubtopic(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { subtopicId } = req.params;
      const data = subtopicSchema.partial().parse(req.body);

      const subtopic = await courseService.updateSubtopic(subtopicId, data);

      res.json({
        success: true,
        data: subtopic,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteSubtopic(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { subtopicId } = req.params;
      await courseService.deleteSubtopic(subtopicId);

      res.json({
        success: true,
        message: 'Subtopic deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

export default courseController;
