# Enrollments API

Endpoints for managing enrollments.

## Endpoints

### List Enrollments

Get enrollments (filtered by user role).

```http
GET /api/enrollments
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status |
| `courseRunId` | string | Filter by course run |
| `learnerId` | string | Filter by learner (admin only) |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response (200 OK):**

```json
{
  "enrollments": [
    {
      "id": "uuid",
      "learnerId": "uuid",
      "learnerName": "Alice Wong",
      "courseRunId": "uuid",
      "courseName": "Python Programming",
      "status": "Paid",
      "enrollmentDate": "2024-02-15",
      "fees": {
        "grossFee": 1500.00,
        "gstAmount": 135.00,
        "netPayable": 490.50
      },
      "progress": 45
    }
  ],
  "pagination": {...}
}
```

---

### Get Enrollment

Get a single enrollment.

```http
GET /api/enrollments/:id
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "id": "uuid",
  "learnerId": "uuid",
  "learner": {
    "id": "uuid",
    "name": "Alice Wong",
    "email": "alice@example.com"
  },
  "courseRun": {
    "id": "uuid",
    "courseName": "Python Programming",
    "startDate": "2024-03-01",
    "endDate": "2024-03-15",
    "trainer": "John Smith"
  },
  "status": "Paid",
  "enrollmentDate": "2024-02-15",
  "fees": {
    "grossFee": 1500.00,
    "discount": 0,
    "gstAmount": 135.00,
    "totalWithGst": 1635.00,
    "funding": {
      "ssgGrant": 817.50,
      "skillsFutureCredit": 200.00,
      "psea": 0,
      "utap": 127.00
    },
    "netPayable": 490.50
  },
  "progress": {
    "completed": 18,
    "total": 40,
    "percentage": 45
  },
  "completedSubtopics": ["uuid1", "uuid2", ...],
  "assessmentResults": [...]
}
```

---

### Create Enrollment

Create a new enrollment.

```http
POST /api/enrollments
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "courseRunId": "uuid",
  "learnerId": "uuid",
  "fundingOptions": {
    "useSkillsFuture": true,
    "skillsFutureAmount": 200.00,
    "usePsea": false,
    "useUtap": true
  }
}
```

**Response (201 Created):**

```json
{
  "id": "uuid",
  "status": "Pending",
  ...
}
```

---

### Calculate Fees

Calculate fees with funding for an enrollment.

```http
POST /api/enrollments/:id/calculate-fees
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "fundingOptions": {
    "useSkillsFuture": true,
    "skillsFutureAmount": 200.00,
    "usePsea": false,
    "useUtap": true
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

### Update Progress

Update learner's progress (mark subtopic complete).

```http
PUT /api/enrollments/:id/progress
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "subtopicId": "uuid",
  "completed": true
}
```

**Response (200 OK):**

```json
{
  "progress": {
    "completed": 19,
    "total": 40,
    "percentage": 47.5
  }
}
```

---

### Complete Subtopic

Mark a subtopic as completed.

```http
POST /api/enrollments/:id/complete-subtopic/:subtopicId
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "message": "Subtopic marked as complete",
  "progress": 47.5
}
```

---

### Approve Enrollment

Approve a pending enrollment (Admin only).

```http
POST /api/enrollments/:id/approve
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "id": "uuid",
  "status": "Approved",
  ...
}
```

---

### Reject Enrollment

Reject a pending enrollment (Admin only).

```http
POST /api/enrollments/:id/reject
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "reason": "Prerequisite not met"
}
```

---

### Cancel Enrollment

Cancel an enrollment.

```http
POST /api/enrollments/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "reason": "Personal circumstances"
}
```

---

## Enrollment Status

| Status | Description |
|--------|-------------|
| `Draft` | Enrollment started, not submitted |
| `Pending` | Awaiting approval |
| `Approved` | Approved, awaiting payment |
| `Paid` | Payment confirmed |
| `InProgress` | Currently attending |
| `Completed` | Successfully completed |
| `Rejected` | Application rejected |
| `Cancelled` | Cancelled by learner/admin |
| `Withdrawn` | Withdrawn after starting |

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Invalid enrollment data |
| 401 | Unauthorized |
| 403 | Cannot access this enrollment |
| 404 | Enrollment not found |
| 409 | Already enrolled in this course run |
