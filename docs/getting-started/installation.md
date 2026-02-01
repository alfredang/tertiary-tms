# Installation

This guide will help you set up Lumina on your local development environment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **PostgreSQL 14+** - Or a [Neon](https://neon.tech) account for serverless Postgres
- **Git** - [Download Git](https://git-scm.com/)

Optional (for full functionality):

- **Stripe Account** - For payment processing
- **Google Gemini API Key** - For AI features

## Clone the Repository

```bash
git clone https://github.com/alfredang/lumina.git
cd lumina
```

## Install Dependencies

### Frontend

```bash
npm install
```

### Backend

```bash
cd backend
npm install
```

## Set Up Environment Variables

### Backend Configuration

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your credentials:

```env
# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# JWT Secrets
JWT_ACCESS_SECRET="your-super-secret-access-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# Stripe (optional)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

### Frontend Configuration

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY="your-gemini-api-key"
```

## Initialize the Database

Run Prisma migrations to create the database schema:

```bash
cd backend
npx prisma migrate dev
```

Seed the database with sample data:

```bash
npm run db:seed
```

## Start Development Servers

### Option 1: Run Separately

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run dev
```

### Option 2: Run with Concurrently

If you prefer running both from a single terminal, you can use `concurrently`:

```bash
npm install -g concurrently
concurrently "cd backend && npm run dev" "npm run dev"
```

## Verify Installation

1. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)
2. You should see the Lumina login page
3. Log in with one of the demo credentials:
   - Admin: `admin@tertiary.edu.sg` / `admin123`
   - Learner: `alice@example.com` / `learner123`

## Next Steps

- [Configuration Guide](configuration.md) - Customize Lumina for your needs
- [Quick Start](quick-start.md) - Learn the basics of using Lumina
