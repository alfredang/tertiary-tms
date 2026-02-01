# Configuration

This guide covers all configuration options for Lumina.

## Environment Variables

### Backend Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Yes | Secret key for access tokens |
| `JWT_REFRESH_SECRET` | Yes | Secret key for refresh tokens |
| `STRIPE_SECRET_KEY` | No | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret |
| `PORT` | No | Server port (default: 3001) |
| `NODE_ENV` | No | Environment mode (development/production) |
| `FRONTEND_URL` | Yes | Frontend URL for CORS |

### Frontend Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | No | Google Gemini API key for AI features |
| `VITE_API_URL` | No | Backend API URL (default: http://localhost:3001/api) |
| `VITE_USE_REAL_BACKEND` | No | Enable real backend (default: true) |

## JWT Configuration

JWT tokens are configured in `backend/src/config/jwt.config.ts`:

```typescript
export const jwtConfig = {
  accessSecret: process.env.JWT_ACCESS_SECRET || 'default-access-secret',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  accessExpiry: '15m',   // Access token expires in 15 minutes
  refreshExpiry: '7d',   // Refresh token expires in 7 days
};
```

!!! warning "Security Note"
    Always use strong, unique secrets in production. Never use default values.

## Stripe Configuration

Configure Stripe in `backend/src/config/stripe.config.ts`:

```typescript
export const stripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  currency: 'sgd',
};
```

### Setting Up Stripe Webhooks

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Add an endpoint: `https://your-backend-url/api/payments/webhook`
3. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Database Configuration

Lumina uses Prisma ORM with PostgreSQL. The database schema is defined in `backend/prisma/schema.prisma`.

### Using Neon (Recommended for Production)

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string
3. Add pooler suffix for connection pooling:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

### Using Local PostgreSQL

1. Create a new database:
   ```bash
   createdb lumina_dev
   ```

2. Set the connection string:
   ```env
   DATABASE_URL="postgresql://localhost:5432/lumina_dev"
   ```

## Role-Based Access Control

Lumina supports five user roles:

| Role | Permissions |
|------|-------------|
| `Learner` | View courses, enroll, track progress |
| `Trainer` | Manage assigned classes, grade assessments |
| `Admin` | Full access to courses, users, enrollments |
| `Developer` | API access, system configuration |
| `TrainingProvider` | Multi-tenant administration |

Roles are enforced in `backend/src/middleware/rbac.middleware.ts`.

## Singapore Funding Configuration

Funding rules are defined in `backend/src/utils/feeCalculator.ts`:

```typescript
const FUNDING_RATES = {
  SSG_STANDARD: 0.50,      // 50% subsidy
  SSG_ENHANCED: 0.70,      // 70% for SMEs/40+
  SKILLSFUTURE_MAX: 500,   // Max $500
  UTAP_RATE: 0.50,         // 50% up to $250/year
  UTAP_MAX_ANNUAL: 250,
};
```

Adjust these rates based on current government policies.

## CORS Configuration

CORS is configured in `backend/src/app.ts`:

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
```

For multiple allowed origins, modify the configuration:

```typescript
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-domain.com'],
  credentials: true,
}));
```
