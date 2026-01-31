import { ClassStatus, PaymentStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/index.js';
import { AppError } from '../middleware/error.middleware.js';

interface CourseRunFilters {
  courseId?: string;
  trainerId?: string;
  trainingProviderId?: string;
  classStatus?: ClassStatus;
  startDateFrom?: Date;
  startDateTo?: Date;
}

interface CreateCourseRunData {
  courseId: string;
  trainingProviderId?: string;
  trainerId?: string;
  courseRunId: string;
  daId?: string;
  startDate: Date;
  endDate: Date;
  classStatus?: ClassStatus;
  isLeaderboardEnabled?: boolean;
}

export const courseRunService = {
  async findAll(filters: CourseRunFilters = {}) {
    const where: Prisma.CourseRunWhereInput = {};

    if (filters.courseId) where.courseId = filters.courseId;
    if (filters.trainerId) where.trainerId = filters.trainerId;
    if (filters.trainingProviderId) where.trainingProviderId = filters.trainingProviderId;
    if (filters.classStatus) where.classStatus = filters.classStatus;

    if (filters.startDateFrom || filters.startDateTo) {
      where.startDate = {};
      if (filters.startDateFrom) where.startDate.gte = filters.startDateFrom;
      if (filters.startDateTo) where.startDate.lte = filters.startDateTo;
    }

    const courseRuns = await prisma.courseRun.findMany({
      where,
      include: {
        course: true,
        trainer: true,
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    return courseRuns;
  },

  async findUpcoming(trainingProviderId?: string) {
    const now = new Date();
    const where: Prisma.CourseRunWhereInput = {
      startDate: { gt: now },
      classStatus: { not: ClassStatus.Cancelled },
    };

    if (trainingProviderId) {
      where.trainingProviderId = trainingProviderId;
    }

    return this.findAll(where as CourseRunFilters);
  },

  async findOngoing(trainingProviderId?: string) {
    const now = new Date();
    const where: Prisma.CourseRunWhereInput = {
      startDate: { lte: now },
      endDate: { gte: now },
      classStatus: ClassStatus.Confirmed,
    };

    if (trainingProviderId) {
      where.trainingProviderId = trainingProviderId;
    }

    const courseRuns = await prisma.courseRun.findMany({
      where,
      include: {
        course: true,
        trainer: true,
        enrollments: {
          include: {
            learner: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
    });

    return courseRuns;
  },

  async findCompleted(trainingProviderId?: string) {
    const now = new Date();
    const where: Prisma.CourseRunWhereInput = {
      endDate: { lt: now },
    };

    if (trainingProviderId) {
      where.trainingProviderId = trainingProviderId;
    }

    const courseRuns = await prisma.courseRun.findMany({
      where,
      include: {
        course: true,
        trainer: true,
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { endDate: 'desc' },
    });

    return courseRuns;
  },

  async findById(id: string) {
    const courseRun = await prisma.courseRun.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            topics: {
              include: { subtopics: true },
            },
            assessments: true,
          },
        },
        trainer: true,
        enrollments: {
          include: {
            learner: true,
            enrollmentFee: true,
            assessmentGrades: {
              include: { assessment: true },
            },
            submissions: true,
          },
        },
      },
    });

    if (!courseRun) {
      throw new AppError('Course run not found', 404);
    }

    return courseRun;
  },

  async create(data: CreateCourseRunData) {
    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    const courseRun = await prisma.courseRun.create({
      data: {
        courseId: data.courseId,
        trainingProviderId: data.trainingProviderId,
        trainerId: data.trainerId,
        courseRunId: data.courseRunId,
        daId: data.daId,
        startDate: data.startDate,
        endDate: data.endDate,
        classStatus: data.classStatus || ClassStatus.Pending,
        isLeaderboardEnabled: data.isLeaderboardEnabled || false,
      },
      include: {
        course: true,
        trainer: true,
      },
    });

    return courseRun;
  },

  async update(id: string, data: Partial<Prisma.CourseRunUpdateInput>) {
    const courseRun = await prisma.courseRun.update({
      where: { id },
      data,
      include: {
        course: true,
        trainer: true,
      },
    });

    return courseRun;
  },

  async delete(id: string) {
    const courseRun = await prisma.courseRun.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: { payments: true },
        },
      },
    });

    if (!courseRun) {
      throw new AppError('Course run not found', 404);
    }

    // Check for paid enrollments
    const hasPaidEnrollments = courseRun.enrollments.some((e) =>
      e.payments.some((p) => p.status === PaymentStatus.Paid)
    );

    if (hasPaidEnrollments) {
      throw new AppError('Cannot delete course run with paid enrollments', 400);
    }

    await prisma.courseRun.delete({
      where: { id },
    });
  },

  async assignTrainer(courseRunId: string, trainerId: string) {
    // Verify trainer exists
    const trainer = await prisma.trainerProfile.findUnique({
      where: { id: trainerId },
    });

    if (!trainer) {
      throw new AppError('Trainer not found', 404);
    }

    const courseRun = await prisma.courseRun.update({
      where: { id: courseRunId },
      data: { trainerId },
      include: {
        course: true,
        trainer: true,
      },
    });

    return courseRun;
  },
};

export default courseRunService;
