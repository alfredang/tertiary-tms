/**
 * Database Seed Script
 *
 * Populates the database with initial data for development and testing.
 * Run with: npm run db:seed
 */

import { PrismaClient, UserRole, TrainerType, TrainerStatus, CourseType, CourseStatus, ClassStatus, PaymentStatus, EnrollmentStatus, AssessmentCategory, SponsorshipType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create Training Provider
  const trainingProvider = await prisma.trainingProvider.upsert({
    where: { uen: '202312345A' },
    update: {},
    create: {
      companyName: 'Tertiary Training Academy',
      companyShortname: 'TTA',
      uen: '202312345A',
      companyAddress: '123 Training Street, Singapore 123456',
      contactPersonName: 'John Admin',
      contactPersonEmail: 'admin@tertiary.edu.sg',
      contactPersonTel: '+65 9123 4567',
      colorScheme: {
        primary: '#2563eb',
        secondary: '#1e40af',
        accent: '#3b82f6',
      },
    },
  });

  console.log('Created training provider:', trainingProvider.companyName);

  // Create Admin User
  const adminPasswordHash = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@tertiary.edu.sg' },
    update: {},
    create: {
      email: 'admin@tertiary.edu.sg',
      passwordHash: adminPasswordHash,
      role: UserRole.Admin,
      trainingProviderId: trainingProvider.id,
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('Created admin user:', adminUser.email);

  // Create Trainers
  const trainerPasswordHash = await bcrypt.hash('trainer123', 12);

  const trainersData = [
    {
      email: 'john.smith@tertiary.edu.sg',
      name: 'John Smith',
      tel: '+65 9111 1111',
      gender: 'Male',
      trainerType: TrainerType.ACLP,
      areasOfExpertise: ['React', 'TypeScript', 'Frontend Development'],
    },
    {
      email: 'jane.doe@tertiary.edu.sg',
      name: 'Jane Doe',
      tel: '+65 9222 2222',
      gender: 'Female',
      trainerType: TrainerType.DACE,
      areasOfExpertise: ['Python', 'Data Science', 'Machine Learning'],
    },
    {
      email: 'alex.ray@tertiary.edu.sg',
      name: 'Alex Ray',
      tel: '+65 9333 3333',
      gender: 'Male',
      trainerType: TrainerType.NonACLP,
      areasOfExpertise: ['AI/ML', 'Generative AI', 'Deep Learning'],
    },
  ];

  const trainers = [];
  for (const trainer of trainersData) {
    const user = await prisma.user.upsert({
      where: { email: trainer.email },
      update: {},
      create: {
        email: trainer.email,
        passwordHash: trainerPasswordHash,
        role: UserRole.Trainer,
        trainingProviderId: trainingProvider.id,
        isActive: true,
        emailVerified: true,
      },
    });

    const profile = await prisma.trainerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        trainingProviderId: trainingProvider.id,
        name: trainer.name,
        tel: trainer.tel,
        gender: trainer.gender,
        trainerType: trainer.trainerType,
        status: TrainerStatus.Active,
        areasOfExpertise: trainer.areasOfExpertise,
      },
    });

    trainers.push(profile);
    console.log('Created trainer:', trainer.name);
  }

  // Create Learners
  const learnerPasswordHash = await bcrypt.hash('learner123', 12);

  const learnersData = [
    { email: 'alice@example.com', name: 'Alice Tan', nric: 'S1234567A', gender: 'Female', dob: new Date('1990-05-15'), nationality: 'Singaporean' },
    { email: 'bob@example.com', name: 'Bob Lee', nric: 'S2345678B', gender: 'Male', dob: new Date('1985-03-22'), nationality: 'Singaporean' },
    { email: 'charlie@example.com', name: 'Charlie Wong', nric: 'S3456789C', gender: 'Male', dob: new Date('1992-08-10'), nationality: 'Singaporean' },
    { email: 'diana@example.com', name: 'Diana Lim', nric: 'S4567890D', gender: 'Female', dob: new Date('1980-11-30'), nationality: 'Singaporean' },
    { email: 'ethan@example.com', name: 'Ethan Ng', nric: 'S5678901E', gender: 'Male', dob: new Date('1988-01-25'), nationality: 'Singaporean' },
  ];

  const learners = [];
  for (const learner of learnersData) {
    const user = await prisma.user.upsert({
      where: { email: learner.email },
      update: {},
      create: {
        email: learner.email,
        passwordHash: learnerPasswordHash,
        role: UserRole.Learner,
        trainingProviderId: trainingProvider.id,
        isActive: true,
        emailVerified: true,
      },
    });

    const profile = await prisma.learnerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        trainingProviderId: trainingProvider.id,
        name: learner.name,
        nric: learner.nric,
        gender: learner.gender,
        dob: learner.dob,
        nationality: learner.nationality,
        courseSponsorship: SponsorshipType.SelfSponsored,
      },
    });

    learners.push(profile);
    console.log('Created learner:', learner.name);
  }

  // Create Courses
  const coursesData = [
    {
      title: 'React for Beginners',
      courseCode: 'RC101',
      trainingHours: 24,
      assessmentHours: 4,
      difficulty: 'Beginner',
      modeOfLearning: ['Virtual'],
      courseType: CourseType.WSQ,
      courseFee: 500,
      taxPercent: 9,
      status: CourseStatus.Published,
      isWsqFunded: true,
      isSkillsFutureEligible: true,
      topics: [
        {
          title: 'Introduction to React',
          subtopics: [
            { title: 'What is React?', content: 'React is a JavaScript library for building user interfaces.' },
            { title: 'Setting up Development Environment', content: 'Learn how to set up your development environment for React.' },
          ],
        },
        {
          title: 'Components and Props',
          subtopics: [
            { title: 'Functional Components', content: 'Learn about functional components in React.' },
            { title: 'Props and State', content: 'Understanding props and state management.' },
          ],
        },
      ],
      assessments: [
        { title: 'React Basics Quiz', category: AssessmentCategory.OnlineExam },
        { title: 'Build a Todo App', category: AssessmentCategory.Project },
      ],
    },
    {
      title: 'Advanced TypeScript',
      courseCode: 'TS201',
      trainingHours: 32,
      assessmentHours: 6,
      difficulty: 'Intermediate',
      modeOfLearning: ['Physical'],
      courseType: CourseType.WSQ,
      courseFee: 800,
      taxPercent: 9,
      status: CourseStatus.Published,
      isWsqFunded: true,
      isSkillsFutureEligible: true,
      isMcesEligible: true,
      topics: [
        {
          title: 'TypeScript Fundamentals',
          subtopics: [
            { title: 'Type System', content: 'Understanding TypeScript type system.' },
            { title: 'Interfaces and Types', content: 'Learn about interfaces and type aliases.' },
          ],
        },
      ],
      assessments: [
        { title: 'TypeScript Assessment', category: AssessmentCategory.WrittenExam },
      ],
    },
    {
      title: 'Generative AI Fundamentals',
      courseCode: 'AI101',
      trainingHours: 40,
      assessmentHours: 8,
      difficulty: 'Intermediate',
      modeOfLearning: ['Virtual', 'Physical'],
      courseType: CourseType.NonWSQ,
      courseFee: 1200,
      taxPercent: 9,
      status: CourseStatus.Published,
      isSkillsFutureEligible: true,
      topics: [
        {
          title: 'Introduction to AI',
          subtopics: [
            { title: 'What is Generative AI?', content: 'Overview of generative AI technologies.' },
            { title: 'Large Language Models', content: 'Understanding LLMs like GPT and Claude.' },
          ],
        },
      ],
      assessments: [
        { title: 'AI Project Presentation', category: AssessmentCategory.Demonstration },
      ],
    },
  ];

  const courses = [];
  for (const courseData of coursesData) {
    const { topics, assessments, ...courseInfo } = courseData;

    const course = await prisma.course.create({
      data: {
        ...courseInfo,
        trainingProviderId: trainingProvider.id,
        topics: {
          create: topics.map((topic, tIndex) => ({
            title: topic.title,
            sortOrder: tIndex,
            subtopics: {
              create: topic.subtopics.map((subtopic, sIndex) => ({
                title: subtopic.title,
                content: subtopic.content,
                sortOrder: sIndex,
              })),
            },
          })),
        },
        assessments: {
          create: assessments.map((assessment) => ({
            title: assessment.title,
            category: assessment.category,
            status: CourseStatus.Published,
          })),
        },
      },
      include: {
        topics: { include: { subtopics: true } },
        assessments: true,
      },
    });

    courses.push(course);
    console.log('Created course:', course.title);
  }

  // Create Course Runs
  const now = new Date();
  const courseRuns = [];

  // Ongoing course run for React
  const reactCourseRun = await prisma.courseRun.create({
    data: {
      courseId: courses[0].id,
      trainingProviderId: trainingProvider.id,
      trainerId: trainers[0].id,
      courseRunId: 'RC101-2024-001',
      startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Started 7 days ago
      endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // Ends in 14 days
      classStatus: ClassStatus.Confirmed,
    },
  });
  courseRuns.push(reactCourseRun);
  console.log('Created course run:', reactCourseRun.courseRunId);

  // Upcoming course run for TypeScript
  const tsCourseRun = await prisma.courseRun.create({
    data: {
      courseId: courses[1].id,
      trainingProviderId: trainingProvider.id,
      trainerId: trainers[0].id,
      courseRunId: 'TS201-2024-001',
      startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // Starts in 30 days
      endDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000), // Ends in 45 days
      classStatus: ClassStatus.Pending,
    },
  });
  courseRuns.push(tsCourseRun);
  console.log('Created course run:', tsCourseRun.courseRunId);

  // Create Enrollments for React course
  for (let i = 0; i < 3; i++) {
    const enrollment = await prisma.enrollment.create({
      data: {
        courseRunId: reactCourseRun.id,
        learnerId: learners[i].id,
        enrollmentStatus: EnrollmentStatus.Enrolled,
        paymentStatus: PaymentStatus.Paid,
        progressPercent: Math.floor(Math.random() * 50) + 20, // 20-70%
        enrollmentFee: {
          create: {
            totalCourseFee: 500,
            grantAmount: 250, // 50% WSQ funding
            skillsFutureCreditClaim: 100,
            gstAmount: 45,
            netPayable: 195,
            cashPayment: 195,
          },
        },
      },
    });

    // Create assessment grades
    for (const assessment of courses[0].assessments) {
      await prisma.assessmentGrade.create({
        data: {
          enrollmentId: enrollment.id,
          assessmentId: assessment.id,
        },
      });
    }

    console.log('Created enrollment for:', learners[i].name);
  }

  console.log('\nSeed completed successfully!');
  console.log('\nTest Credentials:');
  console.log('Admin: admin@tertiary.edu.sg / admin123');
  console.log('Trainer: john.smith@tertiary.edu.sg / trainer123');
  console.log('Learner: alice@example.com / learner123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
