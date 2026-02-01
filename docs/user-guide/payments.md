# Payments

This guide covers payment processing in Lumina using Stripe.

## Payment Flow

```
┌────────────┐     ┌────────────┐     ┌────────────┐
│  Checkout  │ ──► │   Stripe   │ ──► │  Webhook   │
│   Button   │     │  Checkout  │     │  Handler   │
└────────────┘     └────────────┘     └────────────┘
                          │                  │
                          ▼                  ▼
                   ┌────────────┐     ┌────────────┐
                   │  Payment   │     │ Enrollment │
                   │ Confirmed  │     │  Updated   │
                   └────────────┘     └────────────┘
```

## For Learners

### Making a Payment

1. Complete enrollment application
2. Wait for admin approval
3. Click **Pay Now** on approved enrollment
4. Review fee breakdown
5. Enter card details
6. Complete 3D Secure if required
7. Receive confirmation

### Accepted Payment Methods

- Credit/Debit Cards (Visa, Mastercard, AMEX)
- PayNow (coming soon)
- Bank Transfer (manual processing)

### Payment Confirmation

After successful payment:

- Email confirmation sent
- Enrollment status updates to "Paid"
- Course materials become accessible

### Refund Requests

To request a refund:

1. Go to **My Enrollments**
2. Select the enrollment
3. Click **Request Refund**
4. Provide reason
5. Wait for admin review

## For Administrators

### Viewing Payments

Navigate to **Payments** to see:

- All transactions
- Pending payments
- Failed payments
- Refunds

### Payment Status

| Status | Description |
|--------|-------------|
| Pending | Payment initiated, not completed |
| Succeeded | Payment confirmed |
| Failed | Payment failed |
| Refunded | Full refund processed |
| Partially Refunded | Partial refund issued |

### Manual Payments

For offline payments:

1. Go to **Enrollments**
2. Select the enrollment
3. Click **Record Manual Payment**
4. Enter:
   - Payment method (Bank Transfer, Cheque)
   - Amount
   - Reference number
   - Date

### Processing Refunds

1. Go to **Payments**
2. Find the transaction
3. Click **Refund**
4. Enter refund amount (full or partial)
5. Add reason
6. Confirm

!!! warning "Refund Policy"
    Refunds are processed to the original payment method. Allow 5-10 business days for the refund to appear.

## Fee Calculation

### Components

```typescript
interface FeeCalculation {
  grossCourseFee: number;      // Base fee
  discount: number;            // Promotional discount
  discountedFee: number;       // After discount
  gstAmount: number;           // 9% GST
  totalWithGst: number;        // Fee + GST
  fundingBreakdown: {
    ssgGrant: number;          // Government subsidy
    skillsFutureCredit: number; // SF Credit applied
    pseaClaim: number;         // PSEA applied
    mcesClaim: number;         // MCES applied
    utapClaim: number;         // UTAP applied
    ibfFunding: number;        // IBF applied
  };
  netPayable: number;          // Final amount
}
```

### GST Rules

- 9% GST applies to course fees
- SSG grants calculated on total (including GST)
- SkillsFuture Credit applied after GST

### Funding Order

Funding is applied in this order:

1. SSG Grant (percentage of total)
2. MCES (if eligible, replaces SSG rate)
3. SkillsFuture Credit
4. PSEA
5. UTAP
6. IBF

## Stripe Integration

### Test Mode

For testing, use Stripe test cards:

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0025 0000 3155 | Requires 3DS |

### Webhook Events

Lumina listens for:

| Event | Action |
|-------|--------|
| `payment_intent.succeeded` | Update enrollment to Paid |
| `payment_intent.payment_failed` | Log failure, notify admin |
| `charge.refunded` | Update payment status |

### Security

- All payments processed through Stripe
- No card data stored on Lumina servers
- PCI DSS compliant
- 3D Secure supported

## Reports

### Payment Reports

- **Daily Summary** - Transactions by day
- **Revenue Report** - Monthly revenue breakdown
- **Outstanding Payments** - Unpaid enrollments
- **Refund Report** - All refunds with reasons

### Export Options

Reports can be exported as:

- CSV
- PDF
- Excel

## Troubleshooting

### Common Issues

**Payment Failed**
- Check card details
- Ensure sufficient funds
- Contact bank if blocked

**Webhook Not Receiving**
- Verify webhook URL
- Check Stripe dashboard for delivery status
- Review server logs

**Refund Not Appearing**
- Allow 5-10 business days
- Check original payment method
- Contact support if delayed
