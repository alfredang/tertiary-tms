import React from 'react';
import { useLms } from '../hooks/useLms';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { Icon, IconName } from './common/Icon';
import { AssessmentGrade } from '../types';

interface GradingViewProps {
    onBack: () => void;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'C': return 'bg-green-100 text-green-800 border-green-200';
        case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'NYC': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const GradingView: React.FC<GradingViewProps> = ({ onBack }) => {
    const { selectedCourse, updateLearnerGrade } = useLms();

    if (!selectedCourse) {
        return <div>Error: No course selected for grading.</div>;
    }

    const assessments = selectedCourse.assessments || [];
    const learners = selectedCourse.learners || [];

    const handleStatusChange = (learnerEmail: string, assessmentId: string, newStatus: AssessmentGrade['status']) => {
        updateLearnerGrade(selectedCourse.id, learnerEmail, assessmentId, newStatus);
    };

    return (
        <div>
            <Button
                variant="ghost"
                onClick={onBack}
                leftIcon={<Icon name={IconName.Back} className="w-5 h-5" />}
                className="mb-4"
            >
                Back to Course Details
            </Button>
            <h2 className="text-3xl font-bold mb-2">Grading Roster</h2>
            <p className="text-xl text-primary font-semibold mb-6">{selectedCourse.title}</p>

            <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    {(learners.length > 0 && assessments.length > 0) ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">Learner Name</th>
                                    {assessments.map(assessment => (
                                        <th key={assessment.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {assessment.title}
                                            <span className="block text-gray-400 font-normal">{assessment.category}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {learners.map(learner => (
                                    <tr key={learner.email}>
                                        <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white font-medium text-gray-900 z-10 border-r">
                                            {learner.name}
                                        </td>
                                        {assessments.map(assessment => {
                                            const grade = learner.assessmentGrades.find(g => g.assessmentId === assessment.id);
                                            const status = grade ? grade.status : 'Pending';
                                            const submission = learner.submissions.find(s => s.assessmentId === assessment.id);
                                            
                                            return (
                                                <td key={assessment.id} className="px-6 py-4 whitespace-nowrap align-top">
                                                     <div className="space-y-2">
                                                        {submission ? (
                                                            <div className="p-2 bg-gray-50 rounded-md border">
                                                                <div className="flex items-start gap-2">
                                                                    <Icon name={IconName.FilePdf} className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                                                                    <div>
                                                                        <p className="font-semibold text-sm leading-tight break-all">{submission.fileName}</p>
                                                                        <p className="text-xs text-subtle">
                                                                            {new Date(submission.submittedAt).toLocaleString()}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <a 
                                                                    href={`/mock-data/submissions/${submission.fileName}`} 
                                                                    download
                                                                    className="inline-flex items-center gap-1.5 mt-2 px-2 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-md hover:bg-primary/20 transition-colors"
                                                                >
                                                                    <Icon name={IconName.Download} className="w-3 h-3" /> 
                                                                    Download
                                                                </a>
                                                            </div>
                                                        ) : (
                                                             <div className="text-sm text-subtle italic text-center py-2 h-[84px] flex items-center justify-center">Not Submitted</div>
                                                        )}
                                                        
                                                        <select
                                                            value={status}
                                                            onChange={(e) => handleStatusChange(learner.email, assessment.id, e.target.value as AssessmentGrade['status'])}
                                                            className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm ${getStatusColor(status)}`}
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="C">Competent</option>
                                                            <option value="NYC">Not Yet Competent</option>
                                                        </select>
                                                    </div>
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-subtle py-10">
                            {learners.length === 0 ? "No learners are enrolled in this class yet." : "No assessments have been added to this course."}
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default GradingView;
