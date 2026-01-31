import { CourseStatus, CourseType, Prisma } from '@prisma/client';
import { prisma } from '../config/index';
import { AppError } from '../middleware/error.middleware';

interface CourseFilters {
  status?: CourseStatus;
  courseType?: CourseType;
  trainingProviderId?: string;
  search?: string;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
}

export const courseService = {
  async findAll(filters: CourseFilters = {}, pagination: PaginationOptions = {}) {
    const { status, courseType, trainingProviderId, search } = filters;
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CourseWhereInput = {};

    if (status) where.status = status;
    if (courseType) where.courseType = courseType;
    if (trainingProviderId) where.trainingProviderId = trainingProviderId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { courseCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          topics: {
            include: {
              subtopics: true,
            },
            orderBy: { sortOrder: 'asc' },
          },
          assessments: true,
          _count: {
            select: { courseRuns: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.course.count({ where }),
    ]);

    return {
      data: courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id: string) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        topics: {
          include: {
            subtopics: {
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
        assessments: true,
        courseRuns: {
          include: {
            trainer: true,
            enrollments: {
              include: {
                learner: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    return course;
  },

  async create(data: Prisma.CourseCreateInput) {
    const course = await prisma.course.create({
      data,
      include: {
        topics: {
          include: { subtopics: true },
        },
        assessments: true,
      },
    });

    return course;
  },

  async update(id: string, data: Prisma.CourseUpdateInput) {
    const course = await prisma.course.update({
      where: { id },
      data,
      include: {
        topics: {
          include: { subtopics: true },
        },
        assessments: true,
      },
    });

    return course;
  },

  async delete(id: string) {
    // Check if course has any course runs
    const courseRuns = await prisma.courseRun.count({
      where: { courseId: id },
    });

    if (courseRuns > 0) {
      throw new AppError('Cannot delete course with existing course runs', 400);
    }

    await prisma.course.delete({
      where: { id },
    });
  },

  // Topic management
  async addTopic(courseId: string, data: { title: string; sortOrder?: number }) {
    const topic = await prisma.topic.create({
      data: {
        courseId,
        title: data.title,
        sortOrder: data.sortOrder || 0,
      },
      include: { subtopics: true },
    });

    return topic;
  },

  async updateTopic(topicId: string, data: { title?: string; sortOrder?: number }) {
    const topic = await prisma.topic.update({
      where: { id: topicId },
      data,
      include: { subtopics: true },
    });

    return topic;
  },

  async deleteTopic(topicId: string) {
    await prisma.topic.delete({
      where: { id: topicId },
    });
  },

  // Subtopic management
  async addSubtopic(
    topicId: string,
    data: {
      title: string;
      content?: string;
      imageUrl?: string;
      videoUrl?: string;
      sortOrder?: number;
    }
  ) {
    const subtopic = await prisma.subtopic.create({
      data: {
        topicId,
        ...data,
      },
    });

    return subtopic;
  },

  async updateSubtopic(
    subtopicId: string,
    data: {
      title?: string;
      content?: string;
      imageUrl?: string;
      videoUrl?: string;
      sortOrder?: number;
    }
  ) {
    const subtopic = await prisma.subtopic.update({
      where: { id: subtopicId },
      data,
    });

    return subtopic;
  },

  async deleteSubtopic(subtopicId: string) {
    await prisma.subtopic.delete({
      where: { id: subtopicId },
    });
  },
};

export default courseService;
