import { EnrollmentStatus, PaymentStatus, ClaimStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/index';
import { AppError } from '../middleware/error.middleware';

interface EnrollmentFilters {
  courseRunId?: string;
  learnerId?: string;
  enrollmentStatus?: EnrollmentStatus;
  paymentStatus?: PaymentStatus;
}

interface CreateEnrollmentData {
  courseRunId: string;
  learnerId: string;
  sponsorshipType?: 'SelfSponsored' | 'EmployerSponsored';
  paymentMode?: string;
  employer?: {
    uen?: string;
    companyName?: string;
    companyType?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
  };
}

export const enrollmentService = {
  async findAll(filters: EnrollmentFilters = {}) {
    const where: Prisma.EnrollmentWhereInput = {};

    if (filters.courseRunId) where.courseRunId = filters.courseRunId;
    if (filters.learnerId) where.learnerId = filters.learnerId;
    if (filters.enrollmentStatus) where.enrollmentStatus = filters.enrollmentStatus;
    if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;

    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        courseRun: {
          include: {
            course: true,
            trainer: true,
          },
        },
        learner: true,
        enrollmentFee: true,
        employer: true,
        assessmentGrades: {
          include: {
            assessment: true,
          },
        },
        submissions: true,
      },
      orderBy: { enrollmentDate: 'desc' },
    });

    return enrollments;
  },

  async findById(id: string) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        courseRun: {
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
          },
        },
        learner: true,
        enrollmentFee: true,
        employer: true,
        assessmentGrades: {
          include: {
            assessment: true,
          },
        },
        submissions: true,
        payments: true,
        fundingClaims: true,
      },
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    return enrollment;
  },

  async create(data: CreateEnrollmentData) {
    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: {
        courseRunId_learnerId: {
          courseRunId: data.courseRunId,
          learnerId: data.learnerId,
        },
      },
    });

    if (existing) {
      throw new AppError('Learner is already enrolled in this course run', 400);
    }

    // Get course run details for fee calculation
    const courseRun = await prisma.courseRun.findUnique({
      where: { id: data.courseRunId },
      include: { course: true },
    });

    if (!courseRun) {
      throw new AppError('Course run not found', 404);
    }

    // Create enrollment with fee record
    const enrollment = await prisma.enrollment.create({
      data: {
        courseRunId: data.courseRunId,
        learnerId: data.learnerId,
        sponsorshipType: data.sponsorshipType,
        paymentMode: data.paymentMode,
        enrollmentStatus: EnrollmentStatus.Enrolled,
        paymentStatus: PaymentStatus.Pending,
        enrollmentFee: {
          create: {
            totalCourseFee: courseRun.course.courseFee,
            netPayable: courseRun.course.courseFee,
          },
        },
        employer: data.employer
          ? {
              create: data.employer,
            }
          : undefined,
      },
      include: {
        courseRun: {
          include: { course: true },
        },
        learner: true,
        enrollmentFee: true,
        employer: true,
      },
    });

    // Create assessment grade records for all course assessments
    const assessments = await prisma.assessment.findMany({
      where: { courseId: courseRun.courseId },
    });

    if (assessments.length > 0) {
      await prisma.assessmentGrade.createMany({
        data: assessments.map((assessment) => ({
          enrollmentId: enrollment.id,
          assessmentId: assessment.id,
        })),
      });
    }

    return enrollment;
  },

  async update(id: string, data: Partial<Prisma.EnrollmentUpdateInput>) {
    const enrollment = await prisma.enrollment.update({
      where: { id },
      data,
      include: {
        courseRun: {
          include: { course: true },
        },
        learner: true,
        enrollmentFee: true,
      },
    });

    return enrollment;
  },

  async delete(id: string) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: { payments: true },
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    // Check if there are any completed payments
    const hasPaidPayments = enrollment.payments.some(
      (p) => p.status === PaymentStatus.Paid
    );

    if (hasPaidPayments) {
      throw new AppError('Cannot delete enrollment with completed payments', 400);
    }

    await prisma.enrollment.delete({
      where: { id },
    });
  },

  // Progress tracking
  async completeSubtopic(enrollmentId: string, subtopicId: string) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        courseRun: {
          include: {
            course: {
              include: {
                topics: {
                  include: { subtopics: true },
                },
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    const completedSubtopics = enrollment.completedSubtopics || [];
    if (!completedSubtopics.includes(subtopicId)) {
      completedSubtopics.push(subtopicId);
    }

    // Calculate progress percentage
    const totalSubtopics = enrollment.courseRun.course.topics.reduce(
      (sum, topic) => sum + topic.subtopics.length,
      0
    );
    const progressPercent =
      totalSubtopics > 0
        ? Math.round((completedSubtopics.length / totalSubtopics) * 100)
        : 0;

    const updated = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        completedSubtopics,
        progressPercent,
      },
    });

    return updated;
  },

  async toggleBookmark(enrollmentId: string, subtopicId: string) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    const bookmarkedSubtopics = enrollment.bookmarkedSubtopics || [];
    const index = bookmarkedSubtopics.indexOf(subtopicId);

    if (index === -1) {
      bookmarkedSubtopics.push(subtopicId);
    } else {
      bookmarkedSubtopics.splice(index, 1);
    }

    const updated = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { bookmarkedSubtopics },
    });

    return updated;
  },

  // Assessment grading
  async updateGrade(
    enrollmentId: string,
    assessmentId: string,
    status: 'Competent' | 'NotYetCompetent' | 'Pending',
    gradedById?: string
  ) {
    const grade = await prisma.assessmentGrade.update({
      where: {
        enrollmentId_assessmentId: {
          enrollmentId,
          assessmentId,
        },
      },
      data: {
        status,
        gradedAt: status !== 'Pending' ? new Date() : null,
        gradedById,
      },
    });

    return grade;
  },

  // Assessment submission
  async submitAssessment(
    enrollmentId: string,
    assessmentId: string,
    fileName: string,
    fileUrl: string
  ) {
    const submission = await prisma.assessmentSubmission.create({
      data: {
        enrollmentId,
        assessmentId,
        fileName,
        fileUrl,
      },
    });

    return submission;
  },
};

export default enrollmentService;
