import { MOCK_COURSES, MOCK_CALENDAR_EVENTS, MOCK_GRANT_APPLICATIONS, MOCK_JOB_POSTINGS } from '../constants';
import { Course, CalendarEvent, GrantApplication, AssessmentGrade, JobPosting, Assessment, Submission, LearnerProgress } from '../types';

const COURSES_KEY = 'lms_courses';
const CALENDAR_KEY = 'lms_calendar_events';
const GRANTS_KEY = 'lms_grant_applications';
const JOB_POSTINGS_KEY = 'lms_job_postings';
const SIMULATED_DELAY = 200; // Reduced delay for quicker UI feedback

// --- Helper Functions ---

const simulateApiCall = <T>(data: T): Promise<T> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(data), SIMULATED_DELAY);
    });
};

const getFromStorage = <T>(key: string): T | null => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return null;
    }
};

const saveToStorage = <T>(key: string, value: T): void => {
    try {
        const item = JSON.stringify(value);
        localStorage.setItem(key, item);
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
};

// --- Database Initialization ---

export const initializeDatabase = (): void => {
    if (!localStorage.getItem(COURSES_KEY)) {
        saveToStorage(COURSES_KEY, MOCK_COURSES);
    }
    if (!localStorage.getItem(CALENDAR_KEY)) {
        saveToStorage(CALENDAR_KEY, MOCK_CALENDAR_EVENTS);
    }
    if (!localStorage.getItem(GRANTS_KEY)) {
        saveToStorage(GRANTS_KEY, MOCK_GRANT_APPLICATIONS);
    }
    if (!localStorage.getItem(JOB_POSTINGS_KEY)) {
        saveToStorage(JOB_POSTINGS_KEY, MOCK_JOB_POSTINGS);
    }
};


// --- API Functions ---

export const apiGetCourses = async (): Promise<Course[]> => {
    const courses = getFromStorage<Course[]>(COURSES_KEY) || [];
    return simulateApiCall(courses);
};

export const apiGetCalendarEvents = async (): Promise<CalendarEvent[]> => {
    const events = getFromStorage<CalendarEvent[]>(CALENDAR_KEY) || [];
    return simulateApiCall(events);
};

export const apiGetGrantApplications = async (): Promise<GrantApplication[]> => {
    const grants = getFromStorage<GrantApplication[]>(GRANTS_KEY) || [];
    return simulateApiCall(grants);
};

export const apiAddCourse = async (courseData: Course): Promise<Course> => {
    let courses = getFromStorage<Course[]>(COURSES_KEY) || [];
    // The incoming courseData has everything set up, we just assign a real ID.
    const newCourse: Course = {
        ...courseData,
        id: `course_${Date.now()}`,
    };
    courses.push(newCourse);
    saveToStorage(COURSES_KEY, courses);
    return simulateApiCall(newCourse);
};


export const apiUpdateCourse = async (updatedCourse: Course): Promise<Course> => {
    // We read directly here to avoid simulated delay on read before write
    let courses = getFromStorage<Course[]>(COURSES_KEY) || [];
    const courseIndex = courses.findIndex(c => c.id === updatedCourse.id);
    
    if (courseIndex > -1) {
        courses[courseIndex] = updatedCourse;
        saveToStorage(COURSES_KEY, courses);
        return simulateApiCall(updatedCourse);
    } else {
        return Promise.reject(new Error(`Course with id ${updatedCourse.id} not found.`));
    }
};

export const apiDeleteCourse = async (courseId: string): Promise<void> => {
    let courses = getFromStorage<Course[]>(COURSES_KEY) || [];
    const updatedCourses = courses.filter(c => c.id !== courseId);
    
    if (courses.length === updatedCourses.length) {
        return Promise.reject(new Error(`Course with id ${courseId} not found for deletion.`));
    }
    
    saveToStorage(COURSES_KEY, updatedCourses);
    await simulateApiCall(null); // Simulate delay
};

export const apiToggleBookmark = async (courseId: string, subtopicId: string): Promise<Course> => {
    let courses = getFromStorage<Course[]>(COURSES_KEY) || [];
    const courseIndex = courses.findIndex(c => c.id === courseId);
    
    if (courseIndex > -1) {
        const course = courses[courseIndex];
        const bookmarks = course.bookmarkedSubtopics || [];
        const bookmarkIndex = bookmarks.indexOf(subtopicId);

        if (bookmarkIndex > -1) {
            bookmarks.splice(bookmarkIndex, 1); // Remove bookmark
        } else {
            bookmarks.push(subtopicId); // Add bookmark
        }
        
        course.bookmarkedSubtopics = bookmarks;
        courses[courseIndex] = course;
        saveToStorage(COURSES_KEY, courses);
        return simulateApiCall(course);
    } else {
        return Promise.reject(new Error(`Course with id ${courseId} not found.`));
    }
};

export const apiToggleSubtopicCompletion = async (courseId: string, learnerEmail: string, subtopicId: string): Promise<Course> => {
    let courses = getFromStorage<Course[]>(COURSES_KEY) || [];
    const courseIndex = courses.findIndex(c => c.id === courseId);

    if (courseIndex > -1) {
        const course = courses[courseIndex];
        const learnerIndex = course.learners?.findIndex(l => l.email === learnerEmail);

        if (course.learners && learnerIndex !== undefined && learnerIndex > -1) {
            const learner = course.learners[learnerIndex];
            const completed = learner.completedSubtopics || [];
            const subtopicIndex = completed.indexOf(subtopicId);

            if (subtopicIndex > -1) {
                completed.splice(subtopicIndex, 1); // Un-mark as complete
            } else {
                completed.push(subtopicId); // Mark as complete
            }
            learner.completedSubtopics = completed;

            // Recalculate progress
            const totalSubtopics = course.topics.reduce((sum, topic) => sum + topic.subtopics.length, 0);
            if (totalSubtopics > 0) {
                learner.progressPercent = Math.round((completed.length / totalSubtopics) * 100);
            } else {
                learner.progressPercent = 100; // No subtopics, so it's complete
            }

            course.learners[learnerIndex] = learner;
            courses[courseIndex] = course;
            saveToStorage(COURSES_KEY, courses);
            return simulateApiCall(course);
        } else {
             return Promise.reject(new Error(`Learner with email ${learnerEmail} not found in course ${courseId}.`));
        }
    } else {
        return Promise.reject(new Error(`Course with id ${courseId} not found.`));
    }
};


export const apiUpdateLearnerGrade = async (courseId: string, learnerEmail: string, assessmentId: string, status: AssessmentGrade['status']): Promise<Course> => {
    let courses = getFromStorage<Course[]>(COURSES_KEY) || [];
    const courseIndex = courses.findIndex(c => c.id === courseId);

    if (courseIndex > -1) {
        const course = courses[courseIndex];
        const learners = course.learners || [];
        const learnerIndex = learners.findIndex(l => l.email === learnerEmail);
        
        if(learnerIndex > -1) {
            const learner = learners[learnerIndex];
            const gradeIndex = learner.assessmentGrades.findIndex(g => g.assessmentId === assessmentId);

            if (gradeIndex > -1) {
                learner.assessmentGrades[gradeIndex].status = status;
            } else {
                // This case shouldn't happen with mock data, but is good practice
                learner.assessmentGrades.push({ assessmentId, status });
            }

            learners[learnerIndex] = learner;
            course.learners = learners;
            courses[courseIndex] = course;
            saveToStorage(COURSES_KEY, courses);
            return simulateApiCall(course);
        } else {
             return Promise.reject(new Error(`Learner with email ${learnerEmail} not found in course ${courseId}.`));
        }
    } else {
        return Promise.reject(new Error(`Course with id ${courseId} not found.`));
    }
};

export const apiUpdateAllLearnerGrades = async (courseId: string, learnerEmail: string, status: AssessmentGrade['status']): Promise<Course> => {
    let courses = getFromStorage<Course[]>(COURSES_KEY) || [];
    const courseIndex = courses.findIndex(c => c.id === courseId);

    if (courseIndex > -1) {
        const course = courses[courseIndex];
        const learnerIndex = course.learners?.findIndex(l => l.email === learnerEmail);
        
        if(course.learners && learnerIndex !== undefined && learnerIndex > -1) {
            const learner = course.learners[learnerIndex];
            
            // Update all assessment grades for this learner to the new overall status
            learner.assessmentGrades = learner.assessmentGrades.map(grade => ({
                ...grade,
                status: status,
            }));

            course.learners[learnerIndex] = learner;
            courses[courseIndex] = course;
            saveToStorage(COURSES_KEY, courses);
            return simulateApiCall(course);
        } else {
             return Promise.reject(new Error(`Learner with email ${learnerEmail} not found in course ${courseId}.`));
        }
    } else {
        return Promise.reject(new Error(`Course with id ${courseId} not found.`));
    }
};

export const apiUpdateAssessment = async (courseId: string, assessmentId: string, newStatus: Assessment['status'], newCode?: string): Promise<Course> => {
    let courses = getFromStorage<Course[]>(COURSES_KEY) || [];
    const courseIndex = courses.findIndex(c => c.id === courseId);

    if (courseIndex > -1) {
        const course = courses[courseIndex];
        const assessmentIndex = course.assessments?.findIndex(a => a.id === assessmentId);
        
        if (course.assessments && assessmentIndex !== undefined && assessmentIndex > -1) {
             course.assessments[assessmentIndex].status = newStatus;
             if (newCode) {
                course.assessments[assessmentIndex].accessCode = newCode;
             }
             courses[courseIndex] = course;
             saveToStorage(COURSES_KEY, courses);
             return simulateApiCall(course);
        } else {
            return Promise.reject(new Error(`Assessment with id ${assessmentId} not found in course ${courseId}.`));
        }
    } else {
        return Promise.reject(new Error(`Course with id ${courseId} not found.`));
    }
};

export const apiSubmitAssessment = async (courseId: string, learnerEmail: string, assessmentId: string, fileName: string): Promise<Course> => {
    let courses = getFromStorage<Course[]>(COURSES_KEY) || [];
    const courseIndex = courses.findIndex(c => c.id === courseId);

    if (courseIndex > -1) {
        const course = courses[courseIndex];
        const learnerIndex = course.learners?.findIndex(l => l.email === learnerEmail);

        if (course.learners && learnerIndex !== undefined && learnerIndex > -1) {
            const learner = course.learners[learnerIndex];
            const newSubmission: Submission = {
                assessmentId,
                fileName,
                submittedAt: new Date().toISOString(),
            };
            // Remove previous submission for the same assessment, if any
            learner.submissions = learner.submissions.filter(s => s.assessmentId !== assessmentId);
            learner.submissions.push(newSubmission);

            course.learners[learnerIndex] = learner;
            courses[courseIndex] = course;
            saveToStorage(COURSES_KEY, courses);
            return simulateApiCall(course);
        } else {
            return Promise.reject(new Error(`Learner with email ${learnerEmail} not found in course ${courseId}.`));
        }
    } else {
         return Promise.reject(new Error(`Course with id ${courseId} not found.`));
    }
};


export const apiUpdateGrantApplicationStatus = async (grantId: string, status: GrantApplication['status']): Promise<GrantApplication> => {
    let grants = getFromStorage<GrantApplication[]>(GRANTS_KEY) || [];
    const grantIndex = grants.findIndex(g => g.id === grantId);
    
    if (grantIndex > -1) {
        grants[grantIndex].status = status;
        saveToStorage(GRANTS_KEY, grants);
        return simulateApiCall(grants[grantIndex]);
    } else {
        return Promise.reject(new Error(`Grant application with id ${grantId} not found.`));
    }
};

export const apiGetJobPostings = async (): Promise<JobPosting[]> => {
    const jobs = getFromStorage<JobPosting[]>(JOB_POSTINGS_KEY) || [];
    return simulateApiCall(jobs);
};

export const apiUpdateLearnerDetailsInClass = async (courseId: string, learnerEmail: string, updatedLearner: LearnerProgress): Promise<Course> => {
    let courses = getFromStorage<Course[]>(COURSES_KEY) || [];
    const courseIndex = courses.findIndex(c => c.id === courseId);

    if (courseIndex > -1) {
        const course = courses[courseIndex];
        const learnerIndex = course.learners?.findIndex(l => l.email === learnerEmail);
        
        if (course.learners && learnerIndex !== undefined && learnerIndex > -1) {
            course.learners[learnerIndex] = updatedLearner;
            courses[courseIndex] = course;
            saveToStorage(COURSES_KEY, courses);
            return simulateApiCall(course);
        } else {
            return Promise.reject(new Error(`Learner with email ${learnerEmail} not found in course ${courseId}.`));
        }
    } else {
        return Promise.reject(new Error(`Course with id ${courseId} not found.`));
    }
};
