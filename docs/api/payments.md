# Payments API

Endpoints for payment processing with Stripe integration.

## Endpoints

### Create Payment Intent

Create a Stripe PaymentIntent for an enrollment.

```http
POST /api/payments/create-intent
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "enrollmentId": "uuid",
  "amount": 490.50,
  "currency": "sgd",
  "description": "Python Programming - March 2024"
}
```

**Response (200 OK):**

```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "amount": 49050,
  "currency": "sgd"
}
```

!!! note
    The `amount` in the response is in cents (49050 = $490.50).

---

### Confirm Payment

Confirm a payment after Stripe checkout.

```http
POST /api/payments/confirm
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "paymentIntentId": "pi_xxx",
  "enrollmentId": "uuid"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "payment": {
    "id": "uuid",
    "amount": 490.50,
    "status": "succeeded",
    "enrollmentId": "uuid"
  }
}
```

---

### Get Payment

Get payment details.

```http
GET /api/payments/:id
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "id": "uuid",
  "enrollmentId": "uuid",
  "amount": 490.50,
  "currency": "SGD",
  "status": "succeeded",
  "stripePaymentIntentId": "pi_xxx",
  "createdAt": "2024-02-15T10:30:00Z",
  "metadata": {
    "courseName": "Python Programming",
    "learnerName": "Alice Wong"
  }
}
```

---

### List Payments

Get all payments (Admin only).

```http
GET /api/payments
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status |
| `startDate` | string | Filter from date |
| `endDate` | string | Filter to date |
| `enrollmentId` | string | Filter by enrollment |

**Response (200 OK):**

```json
{
  "payments": [
    {
      "id": "uuid",
      "amount": 490.50,
      "status": "succeeded",
      "enrollmentId": "uuid",
      "learnerName": "Alice Wong",
      "courseName": "Python Programming",
      "createdAt": "2024-02-15T10:30:00Z"
    }
  ],
  "summary": {
    "total": 25,
    "succeeded": 23,
    "pending": 1,
    "failed": 1,
    "totalAmount": 12500.00
  }
}
```

---

### Refund Payment

Process a refund (Admin only).

```http
POST /api/payments/:id/refund
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "amount": 490.50,
  "reason": "Course cancelled"
}
```

For partial refund:

```json
{
  "amount": 245.25,
  "reason": "Early withdrawal - 50% refund"
}
```

**Response (200 OK):**

```json
{
  "refundId": "re_xxx",
  "amount": 490.50,
  "status": "succeeded",
  "paymentId": "uuid"
}
```

---

### Stripe Webhook

Handle Stripe webhook events.

```http
POST /api/payments/webhook
Stripe-Signature: <signature>
Content-Type: application/json
```

**Handled Events:**

| Event | Action |
|-------|--------|
| `payment_intent.succeeded` | Update enrollment to Paid |
| `payment_intent.payment_failed` | Log failure, notify admin |
| `charge.refunded` | Update payment status |
| `charge.dispute.created` | Flag for review |

**Response (200 OK):**

```json
{
  "received": true
}
```

---

### Calculate Fees

Calculate fees with funding breakdown.

```http
POST /api/payments/calculate-fees
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "courseId": "uuid",
  "learnerId": "uuid",
  "fundingOptions": {
    "useSkillsFuture": true,
    "skillsFutureAmount": 200.00,
    "usePsea": false,
    "useUtap": true,
    "useMces": false
  }
}
```

**Response (200 OK):**

```json
{
  "grossCourseFee": 1500.00,
  "discount": 0,
  "discountedFee": 1500.00,
  "gstAmount": 135.00,
  "totalWithGst": 1635.00,
  "fundingBreakdown": {
    "ssgGrant": 817.50,
    "ssgRate": 0.50,
    "skillsFutureCredit": 200.00,
    "pseaClaim": 0,
    "mcesClaim": 0,
    "utapClaim": 127.00,
    "ibfFunding": 0
  },
  "netPayable": 490.50
}
```

---

## Payment Status

| Status | Description |
|--------|-------------|
| `pending` | Payment initiated |
| `processing` | Being processed by Stripe |
| `succeeded` | Payment successful |
| `failed` | Payment failed |
| `refunded` | Fully refunded |
| `partially_refunded` | Partially refunded |
| `disputed` | Under dispute |

## Stripe Test Cards

For testing in development:

| Card | Result |
|------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0025 0000 3155 | 3D Secure required |
| 4000 0000 0000 9995 | Insufficient funds |

Use any future expiry date and any 3-digit CVC.

## Frontend Integration

```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_...');

async function handlePayment(enrollmentId: string, amount: number) {
  // Create payment intent
  const { clientSecret } = await api.post('/payments/create-intent', {
    enrollmentId,
    amount
  });

  // Get Stripe instance
  const stripe = await stripePromise;

  // Confirm payment
  const { error, paymentIntent } = await stripe.confirmCardPayment(
    clientSecret,
    {
      payment_method: {
        card: cardElement,
        billing_details: { name: 'Alice Wong' }
      }
    }
  );

  if (error) {
    console.error(error.message);
  } else if (paymentIntent.status === 'succeeded') {
    // Confirm with backend
    await api.post('/payments/confirm', {
      paymentIntentId: paymentIntent.id,
      enrollmentId
    });
  }
}
```

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Invalid payment data |
| 401 | Unauthorized |
| 402 | Payment required/failed |
| 404 | Payment not found |
| 409 | Already paid |
