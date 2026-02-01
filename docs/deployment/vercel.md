# Deploy to Vercel

This guide covers deploying Lumina to Vercel.

## Prerequisites

- [Vercel account](https://vercel.com)
- [GitHub account](https://github.com) (recommended)
- Neon database (see [Database Setup](database.md))

## Architecture

Lumina is deployed as two separate Vercel projects:

```
┌─────────────────────────────────────────────────┐
│                    Vercel                        │
├─────────────────────┬───────────────────────────┤
│   Frontend Project  │    Backend Project        │
│   (React + Vite)    │    (Express + Prisma)     │
│                     │                           │
│   tertiary-tms      │   backend-xxx             │
│   .vercel.app       │   .vercel.app             │
└─────────────────────┴───────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Neon Database  │
                    │   (PostgreSQL)  │
                    └─────────────────┘
```

## Deploy Frontend

### Option 1: Import from GitHub

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `/` (leave empty)
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   | Name | Value |
   |------|-------|
   | `GEMINI_API_KEY` | Your Gemini API key |

6. Click **Deploy**

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# For production
vercel --prod
```

## Deploy Backend

### Step 1: Create Backend Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import the same repository
4. Configure:
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: Leave empty

### Step 2: Add Environment Variables

Add these variables in Vercel settings:

| Name | Value | Description |
|------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | Neon connection string |
| `JWT_ACCESS_SECRET` | `your-secret-key` | Access token secret |
| `JWT_REFRESH_SECRET` | `your-secret-key` | Refresh token secret |
| `STRIPE_SECRET_KEY` | `sk_test_...` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe webhook secret |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | Frontend URL |
| `NODE_ENV` | `production` | Environment mode |

### Step 3: Deploy

Click **Deploy** or run:

```bash
cd backend
vercel --prod
```

## Vercel Configuration

### Frontend (vercel.json in root)

Not required for standard Vite setup.

### Backend (backend/vercel.json)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/api" }
  ]
}
```

### Backend Entry Point (backend/api/index.ts)

```typescript
import app from '../src/app';
export default app;
```

## Post-Deployment Setup

### 1. Run Database Migrations

```bash
cd backend
DATABASE_URL="your-neon-url" npx prisma migrate deploy
```

### 2. Seed Database

```bash
DATABASE_URL="your-neon-url" npm run db:seed
```

### 3. Configure Stripe Webhooks

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-backend.vercel.app/api/payments/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

### 4. Update Frontend API URL

If using environment-based API URL, add to frontend Vercel project:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://your-backend.vercel.app/api` |

## Troubleshooting

### Common Issues

**Build Fails - Prisma Client**

Ensure `prisma generate` runs before build:

```json
{
  "scripts": {
    "build": "prisma generate && tsc"
  }
}
```

**Module Not Found**

Check `tsconfig.json`:
- Use `"module": "CommonJS"` for Vercel
- Ensure `rootDir` includes `api` folder

**Database Connection Issues**

- Verify `DATABASE_URL` includes `?sslmode=require`
- Check Neon project is active
- Verify IP allowlist if applicable

**CORS Errors**

Update `FRONTEND_URL` in backend environment to match actual frontend domain.

### Checking Logs

1. Go to Vercel Dashboard
2. Select project
3. Click **Deployments**
4. Select deployment
5. Click **Functions** tab
6. View logs

## Automatic Deployments

With GitHub integration:

- **Production**: Deploys on push to `main` branch
- **Preview**: Deploys on pull requests

To disable automatic deployments:
1. Go to Project Settings
2. Git → Production Branch
3. Disable "Automatically deploy..."

## Custom Domain

1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS:
   - A Record: `76.76.21.21`
   - CNAME: `cname.vercel-dns.com`

4. Wait for SSL certificate (automatic)

## Live URLs

After deployment:

| Component | URL |
|-----------|-----|
| Frontend | [https://tertiary-tms.vercel.app](https://tertiary-tms.vercel.app) |
| Backend | [https://backend-brown-gamma-63.vercel.app](https://backend-brown-gamma-63.vercel.app) |
