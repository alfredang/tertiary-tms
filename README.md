# Lumina

<div align="center">

![Lumina Logo](https://img.shields.io/badge/Lumina-Training%20Management%20System-6366f1?style=for-the-badge&logo=graduation-cap&logoColor=white)

**AI-Powered Training Management System for Singapore's Education Sector**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-success?style=for-the-badge&logo=vercel)](https://tertiary-tms.vercel.app)
[![API](https://img.shields.io/badge/API-Backend-blue?style=for-the-badge&logo=express)](https://backend-brown-gamma-63.vercel.app)
[![Documentation](https://img.shields.io/badge/Docs-GitHub%20Pages-orange?style=for-the-badge&logo=readthedocs)](https://alfredang.github.io/lumina)

</div>

---

## Tech Stack

<div align="center">

![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.10-2D3748?style=flat-square&logo=prisma&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-14.18-008CDD?style=flat-square&logo=stripe&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel&logoColor=white)
![Neon](https://img.shields.io/badge/Neon-Serverless%20Postgres-00E5CC?style=flat-square&logo=postgresql&logoColor=white)

</div>

---

## Overview

**Lumina** is a comprehensive Training Management System designed specifically for Singapore's training providers. It streamlines the entire learning lifecycle from course creation to certification, with built-in support for Singapore's government funding schemes.

### Key Features

- **Multi-Tenant Architecture** - Support multiple training providers on a single platform
- **Role-Based Access Control** - Learners, Trainers, Admins, and Developers
- **Course Management** - Create courses, topics, subtopics, and assessments
- **Class Scheduling** - Manage course runs with trainers and venues
- **Smart Enrollment** - Automated fee calculations with funding deductions
- **Payment Processing** - Stripe integration for secure payments
- **Singapore Funding Support** - SSG, SkillsFuture Credit, PSEA, MCES, UTAP, IBF
- **AI-Powered Learning** - Gemini AI integration for personalized learning paths
- **Progress Tracking** - Monitor learner progress and assessment results

---

## Live Demo

| Component | URL |
|-----------|-----|
| Frontend | [https://tertiary-tms.vercel.app](https://tertiary-tms.vercel.app) |
| Backend API | [https://backend-brown-gamma-63.vercel.app](https://backend-brown-gamma-63.vercel.app) |

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@tertiary.edu.sg` | `admin123` |
| Trainer | `john.smith@tertiary.edu.sg` | `trainer123` |
| Learner | `alice@example.com` | `learner123` |

---

## Architecture

```
lumina/
├── src/                    # React Frontend
│   ├── components/         # UI Components
│   ├── context/            # React Context (State Management)
│   ├── services/           # API Client & Services
│   ├── types.ts            # TypeScript Definitions
│   └── constants.ts        # Application Constants
│
├── backend/                # Node.js Backend
│   ├── src/
│   │   ├── config/         # Database, JWT, Stripe configs
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, RBAC, validation
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic layer
│   │   └── utils/          # Fee calculator, validators
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── api/
│       └── index.ts        # Vercel serverless entry
│
└── docs/                   # MkDocs Documentation
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or [Neon](https://neon.tech) account)
- Stripe account (for payments)
- Gemini API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/alfredang/lumina.git
   cd lumina
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Configure environment variables**

   Create `backend/.env`:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

   # JWT
   JWT_ACCESS_SECRET="your-access-secret-key"
   JWT_REFRESH_SECRET="your-refresh-secret-key"

   # Stripe
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."

   # Server
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL="http://localhost:3000"
   ```

   Create `.env` in root:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   ```

5. **Set up the database**
   ```bash
   cd backend
   npx prisma migrate dev
   npm run db:seed
   ```

6. **Start development servers**

   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run dev
   ```

   Terminal 2 (Frontend):
   ```bash
   npm run dev
   ```

7. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Deployment

### Deploy to Vercel

#### Frontend

1. Import the repository in Vercel
2. Set the root directory to `/`
3. Add environment variable:
   - `GEMINI_API_KEY`

#### Backend

1. Create a new Vercel project for the backend
2. Set the root directory to `backend`
3. Add environment variables:
   - `DATABASE_URL`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `FRONTEND_URL`

### Database Setup (Neon)

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string
3. Add it as `DATABASE_URL` in your backend environment
4. Run migrations:
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```

---

## API Reference

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login and get tokens |
| `/api/auth/refresh` | POST | Refresh access token |
| `/api/auth/me` | GET | Get current user profile |

### Courses

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/courses` | GET | List all courses |
| `/api/courses/:id` | GET | Get course details |
| `/api/courses` | POST | Create new course (Admin) |
| `/api/courses/:id` | PUT | Update course (Admin) |
| `/api/courses/:id` | DELETE | Delete course (Admin) |

### Course Runs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/course-runs` | GET | List all course runs |
| `/api/course-runs/upcoming` | GET | Get upcoming classes |
| `/api/course-runs/ongoing` | GET | Get ongoing classes |
| `/api/course-runs` | POST | Create course run |

### Enrollments

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/enrollments` | POST | Create enrollment |
| `/api/enrollments/:id/calculate-fees` | POST | Calculate fees with funding |
| `/api/enrollments/:id/progress` | PUT | Update learning progress |

### Payments

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payments/create-intent` | POST | Create Stripe PaymentIntent |
| `/api/payments/confirm` | POST | Confirm payment |
| `/api/payments/webhook` | POST | Stripe webhook handler |

---

## Singapore Funding Support

Lumina supports automatic calculation and integration with Singapore's training funding schemes:

| Funding | Description | Rate |
|---------|-------------|------|
| **SSG Grant** | SkillsFuture Singapore subsidy | 50-70% |
| **SkillsFuture Credit** | Citizens 25+ individual credit | Up to $500 |
| **PSEA** | Post-Secondary Education Account | Variable |
| **MCES** | Mid-Career Enhanced Subsidy (40+) | 70% |
| **UTAP** | NTUC Union Training Assistance | 50% (up to $250/year) |
| **IBF** | Institute of Banking & Finance | Course-specific |

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with love for Singapore's training industry**

[![GitHub](https://img.shields.io/badge/GitHub-alfredang-181717?style=flat-square&logo=github)](https://github.com/alfredang)

</div>
