# Tertiary Training Management System (TMS)

A comprehensive training management system for managing courses, learners, trainers, and enrollments with support for Singapore government funding programs.

## Features

- **Multi-Role Support**: Learner, Trainer, Admin, Developer, Training Provider
- **Course Management**: Create and manage courses with topics, subtopics, and assessments
- **Class Scheduling**: Schedule course runs with trainer assignment
- **Enrollment & Payments**: Full enrollment workflow with Stripe payment integration
- **Government Funding**: Support for SkillsFuture, PSEA, MCES, UTAP, IBF, and SSG grants
- **Progress Tracking**: Track learner progress, quiz scores, and assessment grades
- **AI-Powered Features**: Quiz generation, content creation, and tutoring chatbot

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS
- Vite
- Google Gemini AI Integration

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL with Prisma ORM
- JWT Authentication
- Stripe Payments

## Project Structure

```
tertiary-tms/
├── components/          # React components
├── context/            # React context (state management)
├── hooks/              # Custom React hooks
├── layouts/            # Role-based layouts
├── services/           # API services (Gemini, API client)
├── backend/            # Express API server
│   ├── prisma/         # Database schema
│   ├── src/
│   │   ├── config/     # Configuration files
│   │   ├── controllers/# Request handlers
│   │   ├── middleware/ # Auth, RBAC, validation
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic
│   │   └── utils/      # Utilities (fee calculator)
│   └── package.json
├── App.tsx             # Main app component
├── types.ts            # TypeScript type definitions
└── constants.ts        # Mock data and constants
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Stripe account (for payments)
- Google AI API key (for AI features)

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` with your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   VITE_API_URL=http://localhost:3001/api
   VITE_USE_REAL_BACKEND=true
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your database and API credentials:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/tertiary_tms"
   JWT_SECRET=your-secret-key
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

3. Set up the database:
   ```bash
   npm run db:push      # Create tables
   npm run db:seed      # Seed with sample data
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Test Credentials

After running the seed script:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tertiary.edu.sg | admin123 |
| Trainer | john.smith@tertiary.edu.sg | trainer123 |
| Learner | alice@example.com | learner123 |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - List courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Course Runs
- `GET /api/course-runs` - List course runs
- `GET /api/course-runs/upcoming` - Upcoming classes
- `GET /api/course-runs/ongoing` - Ongoing classes
- `POST /api/course-runs` - Create course run

### Enrollments
- `GET /api/enrollments` - List enrollments
- `POST /api/enrollments` - Create enrollment
- `POST /api/enrollments/:id/complete-subtopic/:subtopicId` - Mark complete

### Payments
- `POST /api/payments/calculate-fees` - Calculate fees with funding
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/webhook` - Stripe webhook handler

## Government Funding Support

The system supports Singapore government training subsidies:

| Funding | Description |
|---------|-------------|
| SSG Grant | 50-70% subsidy for WSQ courses |
| SkillsFuture Credit | $500 credit for Singapore Citizens 25+ |
| PSEA | Post-Secondary Education Account for students |
| MCES | Mid-Career Enhanced Subsidy (70% for 40+) |
| UTAP | NTUC Union Training Assistance Programme |
| IBF | Institute of Banking & Finance funding |

## License

MIT
