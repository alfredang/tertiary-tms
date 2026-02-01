# Authentication API

Lumina uses JWT (JSON Web Tokens) for authentication.

## Overview

| Token Type | Expiry | Storage |
|------------|--------|---------|
| Access Token | 15 minutes | Memory/localStorage |
| Refresh Token | 7 days | httpOnly cookie |

## Endpoints

### Register

Create a new user account.

```http
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "Learner"
}
```

**Response (201 Created):**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "Learner"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**

| Status | Description |
|--------|-------------|
| 400 | Invalid input data |
| 409 | Email already registered |

---

### Login

Authenticate and receive tokens.

```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "Learner"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

The refresh token is set as an httpOnly cookie.

**Errors:**

| Status | Description |
|--------|-------------|
| 401 | Invalid credentials |
| 404 | User not found |

---

### Refresh Token

Get a new access token using the refresh token.

```http
POST /api/auth/refresh
```

The refresh token is automatically sent via cookie.

**Response (200 OK):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**

| Status | Description |
|--------|-------------|
| 401 | Invalid or expired refresh token |

---

### Get Current User

Get the authenticated user's profile.

```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "Learner",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Errors:**

| Status | Description |
|--------|-------------|
| 401 | Unauthorized (missing or invalid token) |

---

### Logout

Invalidate the refresh token.

```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "message": "Logged out successfully"
}
```

---

## Token Usage

### Access Token

Include in Authorization header:

```http
GET /api/protected-resource
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Token Payload

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "Learner",
  "trainingProviderId": "uuid or null",
  "iat": 1704067200,
  "exp": 1704068100
}
```

## Role-Based Access

Different roles have different permissions:

| Role | Description |
|------|-------------|
| `Learner` | Basic access, can enroll in courses |
| `Trainer` | Can manage assigned classes |
| `Admin` | Full management access |
| `Developer` | API and system access |
| `TrainingProvider` | Multi-tenant admin |

Endpoints that require specific roles will return:

```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

## Code Examples

### JavaScript/TypeScript

```typescript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
  credentials: 'include' // Important for cookies
});

const { accessToken, user } = await response.json();

// Use access token
const data = await fetch('/api/courses', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### cURL

```bash
# Login
curl -X POST https://api.example.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  -c cookies.txt

# Use access token
curl https://api.example.com/api/courses \
  -H "Authorization: Bearer eyJhbG..."
```

## Security Best Practices

!!! warning "Security Notes"
    - Never store access tokens in localStorage for sensitive applications
    - Always use HTTPS in production
    - Implement token rotation for long sessions
    - Log out users on suspected compromise
