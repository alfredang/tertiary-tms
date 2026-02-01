# Course Management

This guide covers creating and managing courses in Lumina.

## Course Structure

A course in Lumina consists of:

- **Basic Information** - Name, description, category
- **Topics** - Main learning units
- **Subtopics** - Detailed lessons within topics
- **Assessments** - Quizzes and evaluations
- **Metadata** - Fees, duration, delivery mode

## Creating a Course

### Step 1: Basic Details

1. Navigate to **Courses** → **Add Course**
2. Enter the course information:

| Field | Description |
|-------|-------------|
| Course Name | Display name for the course |
| Description | Detailed course description |
| Category | Technical, Business, etc. |
| Delivery Mode | Classroom, Online, Blended |
| Duration | Total hours |
| Fee | Course fee in SGD |

### Step 2: Add Topics

Topics are the main learning units:

```
Introduction to Python
├── Topic 1: Getting Started
├── Topic 2: Data Types
├── Topic 3: Control Flow
└── Topic 4: Functions
```

For each topic, specify:

- Topic title
- Description
- Duration (hours)
- Order in course

### Step 3: Add Subtopics

Subtopics are detailed lessons:

```
Topic 1: Getting Started
├── 1.1 Installing Python
├── 1.2 IDE Setup
├── 1.3 Hello World
└── 1.4 Basic Syntax
```

For each subtopic:

- Title
- Content (rich text)
- Duration (minutes)
- Resources (optional)

### Step 4: Add Assessments

Assessments can be:

- **Quizzes** - Multiple choice questions
- **Assignments** - Practical tasks
- **Projects** - Capstone assessments

Configure:

- Assessment type
- Passing score
- Time limit (if applicable)
- Weightage in final grade

## Course Runs

A course run is a specific instance of a course with:

| Field | Description |
|-------|-------------|
| Start Date | When the class begins |
| End Date | When the class ends |
| Schedule | Days/times of sessions |
| Venue | Physical location or online |
| Trainer | Assigned instructor |
| Capacity | Maximum enrollments |

### Creating a Course Run

1. Go to **Course Runs** → **Create Run**
2. Select the course
3. Set the schedule:
   ```
   Start: 2024-03-01
   End: 2024-03-15
   Sessions: Mon/Wed/Fri 9:00-17:00
   ```
4. Assign a trainer
5. Set venue and capacity
6. Publish the run

## Course Categories

Default categories in Lumina:

- **Technical** - IT, programming, data
- **Business** - Management, finance
- **Soft Skills** - Communication, leadership
- **Compliance** - Regulatory training
- **Industry-Specific** - Healthcare, F&B, etc.

## Delivery Modes

| Mode | Description |
|------|-------------|
| Classroom | In-person training |
| Online | Virtual live sessions |
| E-Learning | Self-paced online |
| Blended | Combination of modes |
| On-the-Job | Workplace training |

## Course Status

| Status | Description |
|--------|-------------|
| Draft | Course being created |
| Published | Available for enrollment |
| Archived | No longer offered |

## Funding Eligibility

Configure funding eligibility per course:

- [ ] SSG Fundable
- [ ] SkillsFuture Credit eligible
- [ ] PSEA claimable
- [ ] UTAP eligible
- [ ] IBF certified

## Best Practices

!!! tip "Course Design Tips"
    - Keep topics focused on single learning objectives
    - Include practical exercises in subtopics
    - Balance theory and hands-on activities
    - Set realistic duration estimates

!!! warning "Avoid"
    - Overly long subtopics (break into smaller units)
    - Missing assessment criteria
    - Unclear learning outcomes
