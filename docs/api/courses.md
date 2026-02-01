# Courses API

Endpoints for managing courses and course runs.

## Courses

### List Courses

Get all courses with optional filtering.

```http
GET /api/courses
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category |
| `mode` | string | Filter by delivery mode |
| `status` | string | Filter by status (draft, published, archived) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

**Response (200 OK):**

```json
{
  "courses": [
    {
      "id": "uuid",
      "name": "Python Programming",
      "description": "Learn Python from scratch",
      "category": "Technical",
      "deliveryMode": "Blended",
      "durationHours": 40,
      "fee": 1500.00,
      "status": "Published",
      "topics": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

### Get Course

Get a single course by ID.

```http
GET /api/courses/:id
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "id": "uuid",
  "name": "Python Programming",
  "description": "Learn Python from scratch",
  "category": "Technical",
  "deliveryMode": "Blended",
  "durationHours": 40,
  "fee": 1500.00,
  "status": "Published",
  "ssgFundable": true,
  "skillsFutureEligible": true,
  "topics": [
    {
      "id": "uuid",
      "name": "Getting Started",
      "order": 1,
      "subtopics": [
        {
          "id": "uuid",
          "name": "Installing Python",
          "order": 1,
          "durationMinutes": 30
        }
      ]
    }
  ],
  "assessments": [
    {
      "id": "uuid",
      "name": "Final Assessment",
      "type": "Quiz",
      "passingScore": 70
    }
  ]
}
```

---

### Create Course

Create a new course (Admin only).

```http
POST /api/courses
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Python Programming",
  "description": "Learn Python from scratch",
  "category": "Technical",
  "deliveryMode": "Blended",
  "durationHours": 40,
  "fee": 1500.00,
  "ssgFundable": true,
  "skillsFutureEligible": true,
  "topics": [
    {
      "name": "Getting Started",
      "order": 1,
      "subtopics": [
        {
          "name": "Installing Python",
          "order": 1,
          "durationMinutes": 30,
          "content": "Step by step installation guide..."
        }
      ]
    }
  ]
}
```

**Response (201 Created):**

```json
{
  "id": "uuid",
  "name": "Python Programming",
  ...
}
```

---

### Update Course

Update an existing course (Admin only).

```http
PUT /api/courses/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** (partial update supported)

```json
{
  "name": "Python Programming Masterclass",
  "fee": 1800.00
}
```

---

### Delete Course

Delete a course (Admin only).

```http
DELETE /api/courses/:id
Authorization: Bearer <token>
```

**Response (204 No Content)**

---

## Course Runs

### List Course Runs

Get all course runs.

```http
GET /api/course-runs
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `courseId` | string | Filter by course |
| `status` | string | upcoming, ongoing, completed |
| `trainerId` | string | Filter by trainer |

**Response (200 OK):**

```json
{
  "courseRuns": [
    {
      "id": "uuid",
      "courseId": "uuid",
      "courseName": "Python Programming",
      "startDate": "2024-03-01",
      "endDate": "2024-03-15",
      "venue": "Training Room A",
      "trainer": {
        "id": "uuid",
        "name": "John Smith"
      },
      "capacity": 20,
      "enrolled": 15,
      "status": "Upcoming"
    }
  ]
}
```

---

### Get Upcoming Classes

Get upcoming course runs.

```http
GET /api/course-runs/upcoming
Authorization: Bearer <token>
```

---

### Get Ongoing Classes

Get currently running course runs.

```http
GET /api/course-runs/ongoing
Authorization: Bearer <token>
```

---

### Create Course Run

Schedule a new course run (Admin only).

```http
POST /api/course-runs
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "courseId": "uuid",
  "startDate": "2024-03-01",
  "endDate": "2024-03-15",
  "venue": "Training Room A",
  "trainerId": "uuid",
  "capacity": 20,
  "schedule": "Mon/Wed/Fri 9:00-17:00"
}
```

---

### Assign Trainer

Assign or change trainer for a course run.

```http
POST /api/course-runs/:id/assign-trainer
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "trainerId": "uuid"
}
```

---

## Error Responses

All endpoints may return these errors:

| Status | Description |
|--------|-------------|
| 400 | Invalid request data |
| 401 | Unauthorized |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 500 | Server error |

**Error Response Format:**

```json
{
  "error": "Not Found",
  "message": "Course not found",
  "statusCode": 404
}
```
