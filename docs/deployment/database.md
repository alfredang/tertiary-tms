# Database Setup

This guide covers setting up PostgreSQL for Lumina using Neon.

## Why Neon?

[Neon](https://neon.tech) is a serverless PostgreSQL platform that offers:

- **Serverless**: Scales to zero, pay only for usage
- **Branching**: Create database branches for testing
- **Generous Free Tier**: 0.5 GB storage, 190 compute hours
- **Edge-Compatible**: Works well with Vercel

## Create Neon Project

### Step 1: Sign Up

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub, Google, or email

### Step 2: Create Project

1. Click **Create Project**
2. Enter project name: `lumina`
3. Select region closest to your users
4. Click **Create Project**

### Step 3: Get Connection String

After project creation, you'll see the connection details:

```
postgresql://user:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

Copy this for your `DATABASE_URL`.

## Configure Prisma

### Connection String

Add to `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### Prisma Schema

The schema is at `backend/prisma/schema.prisma`:

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

!!! note "Binary Targets"
    The `rhel-openssl-3.0.x` target is required for Vercel deployment.

## Run Migrations

### Development

```bash
cd backend

# Create migration
npx prisma migrate dev --name init

# Apply migration
npx prisma migrate dev
```

### Production

```bash
# Apply migrations without creating new ones
npx prisma migrate deploy
```

## Seed Database

Run the seed script to populate initial data:

```bash
cd backend
npm run db:seed
```

This creates:

- Training provider
- Admin, Trainer, and Learner users
- Sample courses with topics and subtopics
- Sample enrollments

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tertiary.edu.sg | admin123 |
| Trainer | john.smith@tertiary.edu.sg | trainer123 |
| Learner | alice@example.com | learner123 |

## Database Schema

Key tables:

```
┌─────────────────────┐
│  TrainingProvider   │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
┌────────┐   ┌─────────┐
│  User  │   │ Course  │
└────┬───┘   └────┬────┘
     │            │
     │       ┌────┴────┐
     │       ▼         ▼
     │   ┌───────┐  ┌───────┐
     │   │ Topic │  │CourseRun
     │   └───┬───┘  └───┬───┘
     │       │          │
     │       ▼          │
     │   ┌──────────┐   │
     │   │ Subtopic │   │
     │   └──────────┘   │
     │                  │
     └──────────────────┤
                        ▼
                  ┌────────────┐
                  │ Enrollment │
                  └─────┬──────┘
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
        ┌──────────┐       ┌──────────┐
        │ Payment  │       │  Fees    │
        └──────────┘       └──────────┘
```

## Prisma Studio

View and edit data with Prisma Studio:

```bash
cd backend
npx prisma studio
```

Opens at `http://localhost:5555`

## Backup & Restore

### Neon Backups

Neon automatically backs up your data. To restore:

1. Go to Neon Dashboard
2. Select project
3. Click **Branches**
4. Create branch from point-in-time

### Manual Backup

```bash
pg_dump "$DATABASE_URL" > backup.sql
```

### Restore

```bash
psql "$DATABASE_URL" < backup.sql
```

## Connection Pooling

For high-traffic applications, use Neon's connection pooler:

```env
# Pooled connection (port 5432 → 5432 with -pooler suffix)
DATABASE_URL="postgresql://user:pass@ep-xxx-xxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

## Troubleshooting

### Connection Timeout

```
Error: P1001: Can't reach database server
```

**Solutions:**
- Check DATABASE_URL is correct
- Verify Neon project is active
- Check network/firewall settings

### SSL Required

```
Error: SSL connection required
```

**Solution:** Add `?sslmode=require` to connection string

### Prisma Client Generation

```
Error: Prisma Client not generated
```

**Solution:**
```bash
npx prisma generate
```

### Migration Conflicts

```
Error: Migration failed to apply
```

**Solution:**
```bash
# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# Or manually resolve
npx prisma migrate resolve --applied "migration_name"
```

## Alternative: Local PostgreSQL

For local development without Neon:

### macOS (Homebrew)

```bash
brew install postgresql@16
brew services start postgresql@16
createdb lumina_dev
```

### Docker

```bash
docker run -d \
  --name lumina-db \
  -e POSTGRES_DB=lumina \
  -e POSTGRES_USER=lumina \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:16
```

Connection string:
```env
DATABASE_URL="postgresql://lumina:password@localhost:5432/lumina"
```
