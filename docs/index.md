# Welcome to Lumina

<div align="center">
<h2>AI-Powered Training Management System</h2>
<p>Designed for Singapore's Education Sector</p>
</div>

---

## Overview

**Lumina** is a comprehensive Training Management System built specifically for Singapore's training providers. It streamlines the entire learning lifecycle from course creation to certification, with built-in support for Singapore's government funding schemes.

## Key Features

- **Multi-Tenant Architecture** - Support multiple training providers on a single platform
- **Role-Based Access Control** - Learners, Trainers, Admins, and Developers
- **Course Management** - Create courses, topics, subtopics, and assessments
- **Class Scheduling** - Manage course runs with trainers and venues
- **Smart Enrollment** - Automated fee calculations with funding deductions
- **Payment Processing** - Stripe integration for secure payments
- **Singapore Funding Support** - SSG, SkillsFuture Credit, PSEA, MCES, UTAP, IBF
- **AI-Powered Learning** - Gemini AI integration for personalized learning paths
- **Progress Tracking** - Monitor learner progress and assessment results

## Live Demo

| Component | URL |
|-----------|-----|
| **Frontend** | [https://tertiary-tms.vercel.app](https://tertiary-tms.vercel.app) |
| **Backend API** | [https://backend-brown-gamma-63.vercel.app](https://backend-brown-gamma-63.vercel.app) |

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@tertiary.edu.sg` | `admin123` |
| Trainer | `john.smith@tertiary.edu.sg` | `trainer123` |
| Learner | `alice@example.com` | `learner123` |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Authentication | JWT |
| Payments | Stripe |
| AI | Google Gemini |
| Hosting | Vercel, Neon |

## Quick Links

- [Installation Guide](getting-started/installation.md)
- [API Reference](api/authentication.md)
- [Deployment Guide](deployment/vercel.md)
- [Contributing](contributing.md)
