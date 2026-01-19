import React from 'react';
import { Course, UserRole } from '../types';
import { useLms } from '../hooks/useLms';
import { Card } from './common/Card';
import { Icon, IconName } from './common/Icon';
import { Button } from './common/Button';
import CircularProgressBar from './CircularProgressBar';

interface EnrolledCourseListItemProps {
    course: Course;
}

const CourseStat: React.FC<{ icon: IconName; text: string | number }> = ({ icon, text }) => (
    <span className="flex items-center text-sm text-subtle">
        <Icon name={icon} className="w-4 h-4 mr-1.5 text-green-500" />
        {text}
    </span>
);

const EnrolledCourseListItem: React.FC<EnrolledCourseListItemProps> = ({ course }) => {
    const { setSelectedCourse, role } = useLms();
    // Simulate getting the specific user's progress. In a real app, this would come from the user's data.
    const progress = course.learners?.find(l => l.name === "Alice Johnson")?.progressPercent ?? 0;
    const totalHours = course.trainingHours + course.assessmentHours;

    return (
        <Card 
            className="!p-0 !shadow-lg hover:!shadow-xl !-translate-y-0 hover:!scale-[1.01]" 
            onClick={() => setSelectedCourse(course)}
        >
            <div className="flex flex-col md:flex-row">
                <img 
                    src={course.imageUrl || `https://picsum.photos/seed/${course.id}/300/200`} 
                    alt={course.title} 
                    className="w-full md:w-52 h-40 md:h-auto object-cover rounded-t-xl md:rounded-l-xl md:rounded-r-none"
                />
                <div className="p-4 flex-1 flex flex-col md:flex-row md:items-center">
                    <div className="flex-1 mb-4 md:mb-0">
                        <h3 className="text-lg font-bold hover:text-primary transition-colors">{course.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                           <CourseStat icon={IconName.CheckCircle} text={`${totalHours}+ hrs`} />
                           <CourseStat icon={IconName.CheckCircle} text={`${course.assessments?.length || 0} Assessments`} />
                           <CourseStat icon={IconName.CheckCircle} text={course.difficulty} />
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 md:pl-4">
                        <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-1 rounded">
                            {course.modeOfLearning.join(' / ')}
                        </span>
                        {role === UserRole.Learner && <CircularProgressBar percentage={progress} />}
                        <Button variant="ghost" className="!border !border-gray-800 !font-semibold hover:!bg-gray-800 hover:!text-white">
                            {progress < 100 ? 'Resume Learning' : 'Revise Course'}
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default EnrolledCourseListItem;