# User Guide Overview

Lumina is designed to serve multiple user roles in the training ecosystem. This guide covers the key features and workflows for each role.

## User Roles

### Learner

Learners are individuals who enroll in courses to acquire new skills.

**Key Features:**

- Browse and search courses
- Enroll in course runs
- Apply for government funding
- Track learning progress
- Complete assessments
- View certificates

### Trainer

Trainers are instructors who deliver courses and assess learners.

**Key Features:**

- View assigned classes
- Access class rosters
- Mark attendance
- Grade assessments
- Submit learner evaluations

### Admin

Administrators manage the training operations.

**Key Features:**

- Create and manage courses
- Schedule course runs
- Assign trainers
- Manage enrollments
- Process payments
- Generate reports

### Training Provider

Training providers manage their organization's presence on the platform.

**Key Features:**

- Organization settings
- Trainer management
- Course catalog management
- Financial reports
- Funding claim submissions

## Core Modules

### Course Management

Courses are organized in a hierarchical structure:

```
Course
├── Topic 1
│   ├── Subtopic 1.1
│   └── Subtopic 1.2
├── Topic 2
│   └── Subtopic 2.1
└── Assessment
```

### Enrollment Lifecycle

```
Draft → Pending → Approved → Paid → In Progress → Completed
                     ↓
                  Rejected
```

### Payment Processing

Lumina integrates with Stripe for secure payment processing:

1. Enrollment created with fee calculation
2. Payment intent generated
3. Learner completes Stripe checkout
4. Webhook confirms payment
5. Enrollment status updated

### Government Funding

Lumina automates Singapore government funding calculations:

| Funding | Eligibility | Rate |
|---------|-------------|------|
| SSG Grant | WSQ courses | 50-70% |
| SkillsFuture Credit | Citizens 25+ | Up to $500 |
| PSEA | Students 16-30 | Balance-dependent |
| MCES | Citizens 40+ | 70% |
| UTAP | NTUC members | 50% up to $250/year |
| IBF | Finance sector | Course-specific |

## Navigation

The sidebar provides access to all modules based on user role:

**Learner View:**
- Dashboard
- Browse Courses
- My Learning
- Certificates

**Admin View:**
- Dashboard
- Courses
- Course Runs
- Enrollments
- Trainers
- Learners
- Payments
- Reports

## Next Steps

- [Courses](courses.md) - Managing courses
- [Enrollments](enrollments.md) - Enrollment workflows
- [Payments](payments.md) - Payment processing
