# Enrollments

This guide covers the enrollment process in Lumina.

## Enrollment Lifecycle

```
┌─────────┐     ┌─────────┐     ┌──────────┐     ┌──────┐
│  Draft  │ ──► │ Pending │ ──► │ Approved │ ──► │ Paid │
└─────────┘     └─────────┘     └──────────┘     └──────┘
                     │                                │
                     ▼                                ▼
                ┌──────────┐                   ┌───────────┐
                │ Rejected │                   │ Completed │
                └──────────┘                   └───────────┘
```

## For Learners

### Enrolling in a Course

1. **Browse Courses**
   - Navigate to course catalog
   - Use filters (category, mode, price)
   - Click on course for details

2. **Select Course Run**
   - View available schedules
   - Check trainer and venue
   - Confirm dates work for you

3. **Apply Funding**
   - System checks eligibility
   - Select applicable funding:
     - SkillsFuture Credit
     - PSEA
     - UTAP
   - View fee breakdown

4. **Complete Payment**
   - Review final amount
   - Enter payment details
   - Receive confirmation

### Tracking Enrollment Status

| Status | Meaning |
|--------|---------|
| Draft | Enrollment started but not submitted |
| Pending | Awaiting admin approval |
| Approved | Approved, pending payment |
| Paid | Payment confirmed |
| In Progress | Currently attending |
| Completed | Successfully finished |
| Rejected | Application rejected |
| Cancelled | Enrollment cancelled |

### Cancellation Policy

- **Before Approval**: No charge
- **After Approval, Before Payment**: No charge
- **After Payment**:
  - 14+ days before start: 80% refund
  - 7-13 days before start: 50% refund
  - Less than 7 days: No refund

## For Administrators

### Managing Enrollments

1. Navigate to **Enrollments**
2. Filter by:
   - Status
   - Course
   - Date range
   - Payment status

### Approving Enrollments

1. Click on pending enrollment
2. Review learner details
3. Verify funding applications
4. Click **Approve** or **Reject**

!!! note
    Rejected enrollments should include a reason for transparency.

### Processing Payments

For manual payments (bank transfer, cheque):

1. Select enrollment
2. Click **Record Payment**
3. Enter payment details:
   - Amount
   - Date
   - Reference number
4. Confirm to update status

### Bulk Operations

Select multiple enrollments to:

- Approve all
- Send reminders
- Export to CSV

## Fee Calculation

### Components

| Component | Description |
|-----------|-------------|
| Gross Fee | Base course fee |
| GST | 9% of gross fee |
| Discount | Promotional discounts |
| SSG Grant | Government subsidy |
| SkillsFuture | Individual credit |
| PSEA | Education account |
| **Net Payable** | Final amount due |

### Example Calculation

```
Course Fee:          $1,000.00
Discount (10%):       -$100.00
                    ──────────
Subtotal:              $900.00
GST (9%):              +$81.00
                    ──────────
Total:                 $981.00

Funding:
- SSG Grant (50%):    -$490.50
- SF Credit:          -$200.00
                    ──────────
Net Payable:           $290.50
```

## Progress Tracking

### Completion Criteria

An enrollment is marked complete when:

1. All subtopics completed
2. All assessments passed
3. Attendance requirement met

### Progress Indicators

| Indicator | Meaning |
|-----------|---------|
| 0-25% | Just started |
| 26-50% | In progress |
| 51-75% | More than halfway |
| 76-99% | Almost complete |
| 100% | Completed |

## Notifications

Automatic notifications sent for:

- Enrollment confirmation
- Payment reminders
- Approval/rejection
- Class reminders (1 week, 1 day before)
- Completion certificate

## Reports

Available enrollment reports:

- **Enrollment Summary** - By status, course, period
- **Payment Report** - Revenue, outstanding, refunds
- **Completion Report** - Pass rates, dropout rates
- **Funding Report** - Claims by type
