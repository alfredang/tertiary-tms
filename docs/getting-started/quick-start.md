# Quick Start

Get up and running with Lumina in minutes.

## Demo Credentials

After installation and seeding, use these credentials to explore:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@tertiary.edu.sg` | `admin123` |
| Trainer | `john.smith@tertiary.edu.sg` | `trainer123` |
| Learner | `alice@example.com` | `learner123` |

## As an Admin

### Create a Course

1. Log in as Admin
2. Navigate to **Courses** in the sidebar
3. Click **Add Course**
4. Fill in the course details:
   - Course name and description
   - Category and delivery mode
   - Duration and fees
5. Add topics and subtopics
6. Save the course

### Schedule a Course Run

1. Go to **Course Runs**
2. Click **Create Run**
3. Select the course
4. Set dates, venue, and capacity
5. Assign a trainer
6. Publish the course run

### Manage Enrollments

1. Go to **Enrollments**
2. View pending enrollments
3. Approve or reject applications
4. Track payment status

## As a Trainer

### View Assigned Classes

1. Log in as Trainer
2. Dashboard shows your upcoming classes
3. Click a class to view enrolled learners

### Grade Assessments

1. Go to **Assessments**
2. Select a class
3. Enter grades for each learner
4. Submit grades

## As a Learner

### Browse Courses

1. Log in as Learner
2. Navigate to **Browse Courses**
3. Use filters to find courses:
   - Category
   - Delivery mode
   - Price range

### Enroll in a Course

1. Click on a course
2. Select a class schedule
3. Apply funding (if eligible):
   - SkillsFuture Credit
   - PSEA
   - UTAP
4. Complete payment

### Track Progress

1. Go to **My Learning**
2. View enrolled courses
3. Track completion progress
4. Access course materials

## Payment Flow

1. **Select Class** - Choose a course run to enroll
2. **Apply Funding** - System calculates eligible subsidies
3. **View Fee Breakdown** - See gross fee, GST, funding, net payable
4. **Make Payment** - Secure checkout via Stripe
5. **Confirmation** - Receive enrollment confirmation

## Fee Calculation Example

For a $1,000 course with SSG funding:

| Item | Amount |
|------|--------|
| Gross Course Fee | $1,000.00 |
| GST (9%) | $90.00 |
| **Total with GST** | **$1,090.00** |
| SSG Grant (50%) | -$545.00 |
| SkillsFuture Credit | -$200.00 |
| **Net Payable** | **$345.00** |

## Next Steps

- [User Guide](../user-guide/overview.md) - Detailed feature documentation
- [API Reference](../api/authentication.md) - For developers
- [Deployment](../deployment/vercel.md) - Deploy your own instance
