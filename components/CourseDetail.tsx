
import React, { useState } from 'react';
import { useLms } from '../hooks/useLms';
import { Button } from './common/Button';
import { Icon, IconName } from './common/Icon';
import { Card } from './common/Card';
import QuizView from './QuizView';
import { Topic, UserRole, Course, Assessment, LearnerProgress, LearnerProfile } from '../types';
import GradingView from './GradingView';

// --- Reusable Components ---

const toId = (label: string) => label.toLowerCase().replace(/ /g, '-');

const ContentSection: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <Card className={`p-6 ${className}`}>
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        {children}
    </Card>
);

// --- Helper function for course completion logic ---
const isCourseCompleted = (learner: LearnerProgress, course: Course): boolean => {
    if (!learner || !course.assessments || course.assessments.length === 0) {
        return false;
    }
    // Learner must have a grade for every assessment
    if (learner.assessmentGrades.length < course.assessments.length) {
        return false;
    }
    // And all grades must be 'C'
    return learner.assessmentGrades.every(grade => grade.status === 'C');
};


// --- New Leaderboard Component ---
const Leaderboard: React.FC<{ course: Course }> = ({ course }) => {
    const { learnerProfile } = useLms();
    const currentUserEmail = learnerProfile.email;

    if (!course.learners || course.learners.length === 0) {
        return (
            <ContentSection title="Game Leaderboard">
                <p className="text-subtle text-center py-4">
                    No learners enrolled yet. Be the first!
                </p>
            </ContentSection>
        );
    }

    const totalTasks = course.topics.reduce((sum, topic) => sum + topic.subtopics.length, 0);

    const leaderboardData = course.learners
        .map(learner => {
            const completedTasks = Math.floor((learner.progressPercent / 100) * totalTasks);
            const score = completedTasks * 10;
            return {
                name: learner.name,
                email: learner.email,
                score,
            };
        })
        .sort((a, b) => b.score - a.score);

    const currentUserData = leaderboardData.find(l => l.email === currentUserEmail);
    const currentUserRank = leaderboardData.findIndex(l => l.email === currentUserEmail) + 1;

    return (
        <ContentSection title="Game Leaderboard">
            {currentUserData && (
                <div className="p-4 bg-primary/10 rounded-lg mb-4 flex justify-between items-center">
                    <div>
                        <p className="text-sm font-semibold text-primary">Your Score</p>
                        <p className="text-3xl font-bold text-primary">{currentUserData.score} Points</p>
                    </div>
                    <div className="text-right">
                         <p className="text-sm font-semibold text-primary">Your Rank</p>
                        <p className="text-3xl font-bold text-primary">#{currentUserRank}</p>
                    </div>
                </div>
            )}
            <ol className="space-y-2">
                {leaderboardData.map((learner, index) => (
                    <li key={learner.email} className={`flex items-center p-3 rounded-md transition-colors ${learner.email === currentUserEmail ? 'bg-indigo-100 border border-primary' : 'bg-gray-50'}`}>
                        <span className="font-bold text-lg w-8">{index + 1}</span>
                        <div className="flex-grow">
                            <p className="font-semibold">{learner.name}</p>
                        </div>
                        <span className="font-bold text-primary">{learner.score} pts</span>
                    </li>
                ))}
            </ol>
        </ContentSection>
    );
};

// --- NEW INTERACTIVE ASSESSMENT SECTION ---

const AssessmentsSection: React.FC = () => {
    const { selectedCourse, role, updateAssessment, submitAssessment, learnerProfile } = useLms();
    const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
    const [isResubmitting, setIsResubmitting] = useState<Record<string, boolean>>({});

    if (!selectedCourse || !selectedCourse.assessments || selectedCourse.assessments.length === 0) {
        return null;
    }
    
    // Use logged-in user for submission logic
    const currentUser = selectedCourse.learners?.find(l => l.email === learnerProfile.email);

    const handlePublish = (assessmentId: string) => {
        updateAssessment(selectedCourse.id, assessmentId, 'Published');
    };
    
    const handleFileChange = (assessmentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFiles(prev => ({ ...prev, [assessmentId]: e.target.files![0] }));
        }
    };
    
    const handleSubmit = (assessmentId: string) => {
        const file = selectedFiles[assessmentId];
        if (file && currentUser) {
            submitAssessment(selectedCourse.id, currentUser.email, assessmentId, file.name);
            alert(`Submitted '${file.name}' for assessment.`);
            setIsResubmitting(prev => ({ ...prev, [assessmentId]: false }));
        }
    };
    
    const renderLearnerAssessment = (assessment: Assessment, learner: LearnerProgress) => {
        const submission = learner.submissions.find(s => s.assessmentId === assessment.id);
        const canResubmit = isResubmitting[assessment.id];

        if (assessment.status === 'Draft') {
            return <p className="text-subtle text-center py-2">This assessment is not yet open for submission.</p>;
        }
        
        if (submission && !canResubmit) {
             return (
                <div className="bg-green-50 p-3 rounded-md border border-green-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-green-800">Submitted: {submission.fileName}</p>
                            <p className="text-xs text-green-600">On: {new Date(submission.submittedAt).toLocaleString()}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setIsResubmitting(prev => ({...prev, [assessment.id]: true}))}>
                            Resubmit
                        </Button>
                    </div>
                </div>
            );
        }

        return (
             <div>
                {assessment.fileUrl && (
                    <div className="mb-4">
                        <a href={assessment.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border hover:bg-gray-100 transition-colors">
                            <Icon name={IconName.FilePdf} className="w-8 h-8 text-red-600 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-on-surface">Download Assessment Questions</p>
                                <p className="text-xs text-subtle">{assessment.fileUrl.split('/').pop()}</p>
                            </div>
                        </a>
                    </div>
                )}
                <p className="mb-2 text-subtle">{canResubmit ? "Select a new file to replace your previous submission." : "The assessment is now open. Please upload your submission."}</p>
                <div className="flex items-center gap-2">
                    <div className="relative flex-grow">
                        <input 
                            type="file"
                            id={`file-upload-${assessment.id}`}
                            onChange={(e) => handleFileChange(assessment.id, e)}
                            className="hidden"
                            accept=".doc,.docx,.pdf"
                        />
                         <label htmlFor={`file-upload-${assessment.id}`} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                            <Icon name={IconName.Upload} className="w-4 h-4 text-subtle" />
                            <span className="truncate">{selectedFiles[assessment.id]?.name || "Choose file..."}</span>
                        </label>
                    </div>
                    <Button onClick={() => handleSubmit(assessment.id)} disabled={!selectedFiles[assessment.id]}>
                        {canResubmit ? 'Submit Again' : 'Submit'}
                    </Button>
                </div>
             </div>
        );
    };

    const renderTrainerAssessment = (assessment: Assessment) => {
         if (assessment.status === 'Published') {
            return (
                <div className="bg-blue-50 p-3 rounded-md border border-blue-200 text-center">
                    <p className="text-sm font-semibold text-blue-800">Assessment is Live</p>
                    <p className="text-xs text-blue-600">Learners can now submit their work.</p>
                </div>
            );
        }
        return <Button onClick={() => handlePublish(assessment.id)}>Publish Assessment</Button>;
    };

    return (
        <ContentSection title="Assessment">
            <ul className="space-y-4">
                {selectedCourse.assessments.map(assessment => (
                    <li key={assessment.id} className="p-4 bg-gray-100/60 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                                <Icon name={IconName.ClipboardCheck} className="w-5 h-5 text-primary mr-3" />
                                <span className="font-semibold">{assessment.title}</span>
                            </div>
                            <span className="text-sm font-medium bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">{assessment.category}</span>
                        </div>
                         {role === UserRole.Learner ? (currentUser ? renderLearnerAssessment(assessment, currentUser) : null) : renderTrainerAssessment(assessment)}
                    </li>
                ))}
            </ul>
        </ContentSection>
    );
};

// --- NEW CERTIFICATE SECTION ---
const CertificateSection: React.FC = () => {
    const { selectedCourse } = useLms();

    if (!selectedCourse || !selectedCourse.certificateUrl) {
        return null;
    }

    return (
        <ContentSection title="Certificate of Completion">
            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                <Icon name={IconName.Certificate} className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-green-800">Congratulations!</h4>
                <p className="text-green-700 mt-1 mb-4">You have successfully completed this course.</p>
                <a href={selectedCourse.certificateUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary">
                        <Icon name={IconName.Download} className="w-5 h-5 mr-2" />
                        Download Your Certificate
                    </Button>
                </a>
            </div>
        </ContentSection>
    );
};


// --- Learner / Trainer View Components ---

const CourseInfoPanel: React.FC<{course: Course}> = ({ course }) => {
    const totalDuration = course.trainingHours + course.assessmentHours;
    
    const DetailRow = ({ label, value }: { label: string, value: string | number }) => (
        <div className="flex justify-between items-start gap-4">
            <p className="text-subtle flex-shrink-0">{label}</p>
            <p className="font-semibold text-on-surface text-right">{value}</p>
        </div>
    );

    return (
         <div className="p-6 border-b">
            <h3 className="font-bold text-lg text-on-surface mb-6">Course Details</h3>
            <div className="space-y-4 text-sm">
                <DetailRow label="Course Title" value={course.title} />
                <DetailRow label="TGS Ref" value={course.courseCode} />
                <DetailRow label="TSC Title" value={course.tscTitle} />
                <DetailRow label="TSC Code" value={course.tscCode} />
                <DetailRow label="Course Run ID" value={course.courseRunId} />
                <DetailRow label="Digital Attendance ID" value={course.daId || 'N/A'} />
                
                <div className="pt-4">
                    <p className="font-semibold text-subtle mb-3">Course Duration</p>
                    <div className="space-y-3">
                         <div className="flex justify-between items-baseline">
                            <p className="text-subtle">Training Hours:</p>
                            <p className="font-semibold text-on-surface">{course.trainingHours}</p>
                        </div>
                         <div className="flex justify-between items-baseline">
                            <p className="text-subtle">Assessment Hours:</p>
                            <p className="font-semibold text-on-surface">{course.assessmentHours}</p>
                        </div>
                        <div className="flex justify-between items-baseline font-bold pt-2 border-t">
                            <p className="text-on-surface">Total Duration:</p>
                            <p className="text-on-surface">{totalDuration}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


interface CourseSidebarProps {
    role: UserRole;
    onSetGradingView: (isGrading: boolean) => void;
    selectedCourse: Course;
    onMobileItemClick?: () => void;
}

type NavItem = { type: 'link'; label: string; icon: IconName } | { type: 'separator' };


const CourseSidebar: React.FC<CourseSidebarProps> = ({ role, onSetGradingView, selectedCourse, onMobileItemClick }) => {
    const { learnerProfile } = useLms();
    const [activeItem, setActiveItem] = useState('Lesson');
    
    // Find the current learner's progress within this specific course
    const currentUserInCourse = selectedCourse.learners?.find(l => l.email === learnerProfile.email);
    const isCompleted = currentUserInCourse ? isCourseCompleted(currentUserInCourse, selectedCourse) : false;


    const handleItemClick = (label: string) => {
        if (label === 'Grading') {
            onSetGradingView(true);
        } else {
            onSetGradingView(false); 
            setActiveItem(label);
            
            let targetId = toId(label);
            if (label === 'Lesson' || label === 'Lessons') targetId = 'lessons'; 
            else if (label === 'Assessment' || label === 'Assessments') targetId = 'assessments';
            else if (label === 'Certificate') targetId = 'certificate';
            
            const element = document.getElementById(targetId);
            if (element) {
                const yOffset = -90; // Offset for sticky header
                const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({top: y, behavior: 'smooth'});
            }
        }
        if (onMobileItemClick) {
            onMobileItemClick();
        }
    };
    
    const learnerNavItems: NavItem[] = [
        { type: 'link', label: "Digital Attendance", icon: IconName.DigitalAttendance },
        { type: 'link', label: "Lesson Plan", icon: IconName.Library },
        { type: 'link', label: "Learner Guide", icon: IconName.FilePdf },
        { type: 'link', label: "Learner Slides", icon: IconName.FilePdf },
        { type: 'link', label: "Lesson", icon: IconName.Lessons },
        { type: 'link', label: "TRAQOM Survey", icon: IconName.Create },
        { type: 'link', label: "Assessment", icon: IconName.ClipboardCheck },
    ];
    
    if (isCompleted && selectedCourse.certificateUrl) {
        learnerNavItems.push({ type: 'link', label: "Certificate", icon: IconName.Certificate });
    }

    let trainerNavItems: NavItem[] = [
        { type: 'link', label: "Digital Attendance", icon: IconName.DigitalAttendance },
        { type: 'link', label: "Lesson Plan", icon: IconName.Library },
        { type: 'link', label: "Learner Guide", icon: IconName.FilePdf },
        { type: 'link', label: "Assessment Plan", icon: IconName.ClipboardCheck },
        { type: 'link', label: "Facilitator Guide", icon: IconName.FilePdf },
        { type: 'link', label: "Learner Slides", icon: IconName.FilePdf },
        { type: 'link', label: "Trainer Slides", icon: IconName.FilePdf },
        { type: 'separator' },
        { type: 'link', label: "Lesson", icon: IconName.Lessons },
        { type: 'link', label: "TRAQOM Survey", icon: IconName.Create },
        { type: 'link', label: "Assessment", icon: IconName.ClipboardCheck },
        { type: 'link', label: "Grading", icon: IconName.Edit },
    ];

    if (role === UserRole.Developer || role === UserRole.TrainingProvider) {
        // Developers don't see attendance, surveys, or grading, but manage all documents
        trainerNavItems = trainerNavItems.filter(item => 
            item.type === 'separator' || 
            (item.label !== "Digital Attendance" && item.label !== "TRAQOM Survey" && item.label !== "Grading")
        );
    } else if (role === UserRole.Trainer) {
        // Trainers see attendance, but not surveys or learner-specific slides
        trainerNavItems = trainerNavItems.filter(item => 
            item.type === 'separator' || 
            (item.label !== "TRAQOM Survey" && item.label !== "Learner Slides")
        );
    }

    const navItems = role === UserRole.Trainer || role === UserRole.Developer || role === UserRole.TrainingProvider ? trainerNavItems : learnerNavItems;

    return (
        <>
             {(role === UserRole.Learner || role === UserRole.Trainer || role === UserRole.Developer || role === UserRole.TrainingProvider) && <CourseInfoPanel course={selectedCourse} />}
            <ul className="space-y-1 p-2">
                {navItems.map((item, index) => {
                    if (item.type === 'separator') {
                        return <li key={`sep-${index}`}><div className="border-t my-2 mx-4" /></li>;
                    }
                    
                    return (
                        <li key={item.label}>
                            <a 
                                href={`#${toId(item.label)}`} 
                                onClick={(e) => { e.preventDefault(); handleItemClick(item.label); }}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-md font-semibold transition-colors ${activeItem === item.label ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100'}`}
                            >
                                <Icon name={item.icon} className="w-5 h-5" />
                                <span>{item.label}</span>
                            </a>
                        </li>
                    );
                })}
            </ul>
        </>
    );
};


interface TopicAccordionProps {
    topic: Topic;
    progress: number;
    bookmarkedSubtopics: Set<string>;
    onToggleBookmark: (e: React.MouseEvent, subtopicId: string) => void;
    role: UserRole;
    completedSubtopics: Set<string>;
    onToggleCompletion: (subtopicId: string) => void;
}

const TopicAccordion: React.FC<TopicAccordionProps> = ({ topic, progress, bookmarkedSubtopics, onToggleBookmark, role, completedSubtopics, onToggleCompletion }) => {
    const [isOpen, setIsOpen] = React.useState(true);
    const displayTitle = topic.title.replace('Module', 'Learning Unit');

    return (
        <Card>
            <button 
                className="w-full text-left p-4 flex justify-between items-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex-grow">
                    <h4 className="font-bold text-lg">{displayTitle}</h4>
                     {role === UserRole.Learner && (
                        <div className="flex items-center mt-2">
                            <p className="text-sm font-bold text-green-600 w-12">{progress.toFixed(0)}%</p>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{width: `${progress}%`}}></div>
                            </div>
                        </div>
                     )}
                </div>
                <Icon name={IconName.ChevronDown} className={`w-5 h-5 ml-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="px-4 pb-2">
                    <ul className="border-t border-gray-200 divide-y divide-gray-200">
                        {topic.subtopics.map(subtopic => {
                            const isBookmarked = bookmarkedSubtopics.has(subtopic.id);
                            const isCompleted = completedSubtopics.has(subtopic.id);
                            return (
                                <li key={subtopic.id} className="flex items-center justify-between py-3">
                                    <label htmlFor={`subtopic-complete-${subtopic.id}`} className="flex items-center flex-grow cursor-pointer group">
                                        {role === UserRole.Learner && (
                                            <input
                                                id={`subtopic-complete-${subtopic.id}`}
                                                type="checkbox"
                                                checked={isCompleted}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    onToggleCompletion(subtopic.id);
                                                }}
                                                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary mr-3 flex-shrink-0"
                                                aria-label={`Mark '${subtopic.title}' as complete`}
                                            />
                                        )}
                                        <Icon name={IconName.FilePdf} className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                        <span className={`font-medium text-gray-800 group-hover:text-primary transition-colors ${isCompleted ? 'line-through text-gray-500' : ''}`}>{subtopic.title}</span>
                                    </label>
                                    <button
                                        onClick={(e) => onToggleBookmark(e, subtopic.id)}
                                        className={`p-2 rounded-full transition-colors flex-shrink-0 ${isBookmarked ? 'text-primary bg-primary/10' : 'text-subtle hover:text-primary hover:bg-gray-100'}`}
                                        aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                                    >
                                        <Icon name={isBookmarked ? IconName.BookmarkSolid : IconName.Bookmark} className="w-5 h-5" />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </Card>
    );
}

const UnifiedCourseDetailView: React.FC = () => {
    const { selectedCourse, toggleBookmark, role, isCourseMenuOpen, setIsCourseMenuOpen, toggleSubtopicCompletion, setEditingCourse, trainingProviderProfile, learnerProfile } = useLms();
    const [isGradingView, setIsGradingView] = useState(false);
    const [isLessonsOpen, setIsLessonsOpen] = useState(true);
    const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
    const [isTraqomOpen, setIsTraqomOpen] = useState(false);

    if (!selectedCourse) return null;

    const currentUser = selectedCourse.learners?.find(l => l.email === learnerProfile.email);
    const isCompleted = currentUser ? isCourseCompleted(currentUser, selectedCourse) : false;
    
    const handleToggleBookmark = (e: React.MouseEvent, subtopicId: string) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark(selectedCourse.id, subtopicId);
    };

    const handleToggleCompletion = (subtopicId: string) => {
        if (currentUser) {
            toggleSubtopicCompletion(selectedCourse.id, currentUser.email, subtopicId);
        }
    };

    if (role === UserRole.Trainer && isGradingView) {
        return <GradingView onBack={() => setIsGradingView(false)} />;
    }

    const bookmarkedSubtopics = new Set(selectedCourse.bookmarkedSubtopics || []);
    const completedSubtopics = new Set(currentUser?.completedSubtopics || []);
    
    const traqomSurveyLink = 'https://ssgtraqom.qualtrics.com/jfe/form/SV_3K9i7rTJ9OLsauW?Q_CHL=qr';
    const traqomQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(traqomSurveyLink)}`;

    const attendanceLink = selectedCourse.daId ? `https://www.myskillsfuture.gov.sg/api/take-attendance/${selectedCourse.daId}` : null;
    const attendanceQrCodeUrl = attendanceLink ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(attendanceLink)}` : null;

    const isTrainerSlidesExternal = selectedCourse.trainerSlidesUrl?.startsWith('http');

    const sharedContent = (
         <>
            {(role === UserRole.Learner || role === UserRole.Trainer) && (
                <div id={toId("Digital Attendance")}>
                    <Card className="p-0 overflow-hidden">
                        <button
                            className="w-full text-left p-6 flex justify-between items-center"
                            onClick={() => setIsAttendanceOpen(!isAttendanceOpen)}
                            aria-expanded={isAttendanceOpen}
                        >
                            <h3 className="text-xl font-bold">Digital Attendance</h3>
                            <Icon name={isAttendanceOpen ? IconName.Minus : IconName.Add} className="w-6 h-6 text-primary flex-shrink-0" />
                        </button>
                        {isAttendanceOpen && (
                            <div className="px-6 pb-6 border-t">
                                <div className="pt-4">
                                    {attendanceLink && attendanceQrCodeUrl ? (
                                        <div className="flex flex-col items-center gap-4 text-center">
                                            <p className="text-subtle">
                                                Please scan the QR code or use the link below to mark your attendance.
                                            </p>
                                            <img 
                                                src={attendanceQrCodeUrl}
                                                alt="Digital Attendance QR Code"
                                                className="rounded-lg shadow-md"
                                            />
                                            <div className="w-full max-w-md">
                                                <div className="p-2 bg-gray-100 rounded-md flex items-center gap-2">
                                                    <a 
                                                        href={attendanceLink}
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:underline truncate"
                                                    >
                                                        {attendanceLink}
                                                    </a>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="!flex-shrink-0"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(attendanceLink);
                                                            alert('Link copied to clipboard!');
                                                        }}
                                                    >
                                                        Copy Link
                                                    </Button>
                                                </div>
                                                 <p className="text-sm text-gray-500 mt-2">
                                                    DA ID: <span className="font-semibold text-gray-700">{selectedCourse.daId}</span>
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-subtle text-center">Digital Attendance ID not available for this class.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            )}
            <div id={toId("Lesson Plan")}>
                <ContentSection title="Lesson Plan">
                    {selectedCourse.lessonPlanUrl ? (
                        <a href={selectedCourse.lessonPlanUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border hover:bg-gray-100 transition-colors">
                            <Icon name={IconName.FilePdf} className="w-8 h-8 text-red-600 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-on-surface">{selectedCourse.lessonPlanUrl.split('/').pop()}</p>
                                <p className="text-xs text-subtle">Click to view or download the lesson plan</p>
                            </div>
                        </a>
                    ) : (
                        <p className="text-subtle">The lesson plan for this course will be displayed here.</p>
                    )}
                </ContentSection>
            </div>

            <div id={toId("Learner Guide")}>
                <ContentSection title="Learner Guide">
                    {selectedCourse.learnerGuideUrl ? (
                        <a href={selectedCourse.learnerGuideUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border hover:bg-gray-100 transition-colors">
                            <Icon name={IconName.FilePdf} className="w-8 h-8 text-red-600 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-on-surface">{selectedCourse.learnerGuideUrl.split('/').pop()}</p>
                                <p className="text-xs text-subtle">Click to view or download the guide</p>
                            </div>
                        </a>
                    ) : (
                        <p className="text-subtle">The learner guide for this course will be displayed here.</p>
                    )}
                </ContentSection>
            </div>
            
            { (role === UserRole.Trainer || role === UserRole.Developer || role === UserRole.TrainingProvider) && (
                <div id={toId("Facilitator Guide")}>
                    <ContentSection title="Facilitator Guide">
                        {selectedCourse.facilitatorGuideUrl ? (
                            <a href={selectedCourse.facilitatorGuideUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border hover:bg-gray-100 transition-colors">
                                <Icon name={IconName.FilePdf} className="w-8 h-8 text-red-600 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-on-surface">{selectedCourse.facilitatorGuideUrl.split('/').pop()}</p>
                                    <p className="text-xs text-subtle">Click to view or download the guide</p>
                                </div>
                            </a>
                        ) : (
                            <p className="text-subtle">The facilitator guide for this course will be displayed here.</p>
                        )}
                    </ContentSection>
                </div>
            )}
            
            {role !== UserRole.Trainer && (
                <div id={toId("Learner Slides")}>
                    <ContentSection title="Learner Slides">
                        {selectedCourse.slidesUrl ? (
                             <a href={selectedCourse.slidesUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border hover:bg-gray-100 transition-colors">
                                <Icon name={IconName.FilePdf} className="w-8 h-8 text-red-600 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-on-surface">{selectedCourse.slidesUrl.split('/').pop()}</p>
                                    <p className="text-xs text-subtle">Click to view or download the slides</p>
                                </div>
                            </a>
                        ) : (
                             <p className="text-subtle">The learner slides for this course will be displayed here.</p>
                        )}
                    </ContentSection>
                </div>
            )}

            {(role === UserRole.Trainer || role === UserRole.Developer || role === UserRole.TrainingProvider) && (
                <div id={toId("Trainer Slides")}>
                    <ContentSection title="Trainer Slides">
                        {selectedCourse.trainerSlidesUrl ? (
                            <a href={selectedCourse.trainerSlidesUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border hover:bg-gray-100 transition-colors">
                                <Icon name={isTrainerSlidesExternal ? IconName.ArrowUpRight : IconName.FilePdf} className="w-8 h-8 text-orange-600 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-on-surface">{isTrainerSlidesExternal ? "Online Slides" : selectedCourse.trainerSlidesUrl.split('/').pop()}</p>
                                    <p className="text-xs text-subtle">{isTrainerSlidesExternal ? 'Click to view presentation online' : 'Click to view or download the trainer slides'}</p>
                                </div>
                            </a>
                        ) : (
                            <p className="text-subtle">The trainer slides for this course will be displayed here.</p>
                        )}
                    </ContentSection>
                </div>
            )}

            <div id="lessons">
                 <Card className="p-0 overflow-hidden">
                    <button className="w-full text-left p-6 flex justify-between items-center" onClick={() => setIsLessonsOpen(!isLessonsOpen)} aria-expanded={isLessonsOpen}>
                        <h3 className="text-xl font-bold">Lesson</h3>
                        <Icon name={IconName.ChevronDown} className={`w-5 h-5 transition-transform duration-200 ${isLessonsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isLessonsOpen && (
                        <div className="px-6 pb-6 space-y-4 border-t pt-4">
                            {selectedCourse.topics.map(topic => {
                                const topicCompletedCount = topic.subtopics.filter(st => completedSubtopics.has(st.id)).length;
                                const topicProgress = topic.subtopics.length > 0 ? (topicCompletedCount / topic.subtopics.length) * 100 : 0;
                                
                                return (
                                    <TopicAccordion 
                                        key={topic.id} 
                                        topic={topic} 
                                        progress={topicProgress} 
                                        bookmarkedSubtopics={bookmarkedSubtopics} 
                                        onToggleBookmark={handleToggleBookmark}
                                        role={role}
                                        completedSubtopics={completedSubtopics}
                                        onToggleCompletion={handleToggleCompletion}
                                    />
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>
            {role === UserRole.Learner && (
                <div id={toId("TRAQOM Survey")}>
                    <Card className="p-0 overflow-hidden">
                        <button
                            className="w-full text-left p-6 flex justify-between items-center"
                            onClick={() => setIsTraqomOpen(!isTraqomOpen)}
                            aria-expanded={isTraqomOpen}
                        >
                            <h3 className="text-xl font-bold">TRAQOM Survey</h3>
                            <Icon name={isTraqomOpen ? IconName.Minus : IconName.Add} className="w-6 h-6 text-primary flex-shrink-0" />
                        </button>
                        {isTraqomOpen && (
                            <div className="px-6 pb-6 border-t">
                                <div className="pt-4 flex flex-col items-center gap-4 text-center">
                                    <p className="text-subtle">
                                        Your feedback is important. Please scan the QR code or use the link below to complete the survey.
                                    </p>
                                    <img 
                                        src={traqomQrCodeUrl}
                                        alt="TRAQOM Survey QR Code"
                                        className="rounded-lg shadow-md"
                                    />
                                    <div className="w-full max-w-md">
                                        <div className="p-2 bg-gray-100 rounded-md flex items-center gap-2">
                                            <a 
                                                href={traqomSurveyLink}
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:underline truncate"
                                            >
                                                {traqomSurveyLink}
                                            </a>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="!flex-shrink-0"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(traqomSurveyLink);
                                                    alert('Link copied to clipboard!');
                                                }}
                                            >
                                                Copy Link
                                            </Button>
                                        </div>
                                         <p className="text-sm text-gray-500 mt-2">
                                            Course Run ID: <span className="font-semibold text-gray-700">{selectedCourse.courseRunId}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            )}
            
            {(role === UserRole.Trainer || role === UserRole.Developer || role === UserRole.TrainingProvider) && (
                <div id={toId("Assessment Plan")}>
                    <ContentSection title="Assessment Plan">
                        {selectedCourse.assessmentPlanUrl ? (
                            <a href={selectedCourse.assessmentPlanUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border hover:bg-gray-100 transition-colors">
                                <Icon name={IconName.FilePdf} className="w-8 h-8 text-red-600 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-on-surface">{selectedCourse.assessmentPlanUrl.split('/').pop()}</p>
                                    <p className="text-xs text-subtle">Click to view or download the assessment plan</p>
                                </div>
                            </a>
                        ) : (
                            <p className="text-subtle">The assessment plan for this course will be displayed here.</p>
                        )}
                    </ContentSection>
                </div>
            )}
            <div id="assessments">
               <AssessmentsSection />
            </div>

            {role === UserRole.Learner && isCompleted && selectedCourse.certificateUrl && (
                <div id="certificate">
                    <CertificateSection />
                </div>
            )}
            
            {role === UserRole.Learner && trainingProviderProfile.gamingSettings.enableLeaderboard && selectedCourse.isLeaderboardEnabled && (
                <Leaderboard course={selectedCourse} />
            )}
        </>
    );

    return (
        <div className="relative">
            {/* Mobile Sidebar (Overlay) */}
            {isCourseMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
                    onClick={() => setIsCourseMenuOpen(false)}
                    role="dialog"
                    aria-modal="true"
                >
                    <div 
                        className="absolute left-0 top-0 h-full w-72 max-w-[calc(100%-3rem)] bg-surface shadow-xl animate-slide-in-left flex flex-col" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 flex justify-between items-center border-b flex-shrink-0">
                            <h3 className="font-bold">Course Menu</h3>
                            <button onClick={() => setIsCourseMenuOpen(false)} className="p-2 -mr-2 text-gray-600 hover:text-gray-900">
                                <Icon name={IconName.Close} className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="overflow-y-auto">
                            <CourseSidebar 
                                role={role} 
                                onSetGradingView={setIsGradingView} 
                                selectedCourse={selectedCourse} 
                                onMobileItemClick={() => setIsCourseMenuOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="lg:grid lg:grid-cols-4 lg:gap-8">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block lg:col-span-1">
                    <Card className="sticky top-24">
                        <CourseSidebar role={role} onSetGradingView={setIsGradingView} selectedCourse={selectedCourse} />
                    </Card>
                </aside>
                
                {/* Main Content */}
                <main className="lg:col-span-3 space-y-6">
                    {(role === UserRole.Developer || role === UserRole.TrainingProvider) && (
                        <Card className="!p-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">{selectedCourse.title}</h2>
                                <p className="text-subtle font-mono">{selectedCourse.courseCode}</p>
                            </div>
                            <Button onClick={() => setEditingCourse(selectedCourse)} leftIcon={<Icon name={IconName.Edit} className="w-4 h-4"/>}>
                                Edit Course
                            </Button>
                        </Card>
                    )}
                    {sharedContent}
                </main>
            </div>
        </div>
    );
};


const CourseDetail: React.FC = () => {
    const { role } = useLms();
    
    // Developer and TrainingProvider see the full unified view
    if (role === UserRole.Developer || role === UserRole.TrainingProvider) {
        return <UnifiedCourseDetailView />;
    }

    // Learner and Trainer see their respective tailored views
    return <UnifiedCourseDetailView />;
};

export default CourseDetail;