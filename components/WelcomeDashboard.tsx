
import React from 'react';
import { useLms } from '../hooks/useLms';
import DashboardCourseCard from './DashboardCourseCard';
import { UserRole } from '../types';

const WelcomeDashboard: React.FC = () => {
    const { courses, role } = useLms();
    
    const getDashboardConfig = () => {
        switch (role) {
            case UserRole.Trainer:
                return {
                    title: 'My Assigned Classes',
                    courses: courses.filter(c => c.trainer === 'John Smith') // Mocking logged-in user
                };
            case UserRole.Learner:
                return {
                    title: 'My Courses',
                    courses: courses.filter(c => c.enrollmentStatus === 'enrolled')
                };
            default: // Fallback for Developer
                return {
                    title: 'Course Management',
                    courses: courses
                };
        }
    };
    
    const { title: myCoursesTitle, courses: relevantCourses } = getDashboardConfig();

    return (
        <div>
            <div className="mb-12">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-on-surface">
                        {myCoursesTitle}
                    </h2>
                    <a href="#" className="font-semibold text-sm text-primary hover:underline">
                        View All
                    </a>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relevantCourses.map(course => (
                        <DashboardCourseCard key={course.id} course={course} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default WelcomeDashboard;
