import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Icon, IconName } from '../common/Icon';
import Spinner from '../common/Spinner';
import { useLms } from '../../hooks/useLms';
import { LearnerProgress, AssessmentGrade, TpgStatus } from '../../types';

// Helper functions from AdminView for consistent styling and logic
const getStatusColor = (status: string) => {
    switch (status) {
        case 'Paid':
        case 'Claimed':
        case 'Approved':
        case 'C':
        case 'Competent':
        case 'Pass':
        case 'Success':
        case 'Successful':
        case 'Full Payment':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'Processing':
             return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'Pending':
        case 'In Progress':
        case 'Pending Assessment':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Overdue':
        case 'Rejected':
        case 'Unpaid':
        case 'NYC':
        case 'Not Yet Competent':
        case 'Fail':
        case 'Failed':
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const getOverallAssessmentStatus = (learner: LearnerProgress): 'C' | 'NYC' | 'Pending' => {
    if (!learner.assessmentGrades || learner.assessmentGrades.length === 0) {
        return 'Pending';
    }
    if (learner.assessmentGrades.some(g => g.status === 'NYC')) {
        return 'NYC';
    }
    if (learner.assessmentGrades.some(g => g.status === 'Pending')) {
        return 'Pending';
    }
    return 'C';
};

const PlaceholderView: React.FC<{ title: string }> = ({ title }) => (
    <div>
      <h2 className="text-3xl font-bold mb-6">{title}</h2>
      <Card className="p-6">
        <p className="text-subtle text-center py-12">
            Functionality for '{title}' will be available here.
        </p>
      </Card>
    </div>
);

export const ApplyNewGrantView: React.FC = () => {
    const { courses } = useLms();
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [selectedLearners, setSelectedLearners] = useState<Set<string>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
    
    const inputClasses = "block w-full px-3 py-2 text-on-surface bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";

    const upcomingClasses = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return courses.filter(c => new Date(c.startDate) >= now);
    }, [courses]);

    const selectedCourse = useMemo(() => {
        return courses.find(c => c.id === selectedCourseId);
    }, [courses, selectedCourseId]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked && selectedCourse?.learners) {
            const allLearnerEmails = new Set(selectedCourse.learners.map(l => l.email));
            setSelectedLearners(allLearnerEmails);
        } else {
            setSelectedLearners(new Set());
        }
    };

    const handleSelectLearner = (email: string) => {
        const newSelection = new Set(selectedLearners);
        if (newSelection.has(email)) {
            newSelection.delete(email);
        } else {
            newSelection.add(email);
        }
        setSelectedLearners(newSelection);
    };

    const handleSubmit = () => {
        if (selectedLearners.size === 0) {
            alert('Please select at least one learner to submit.');
            return;
        }
        setIsSubmitting(true);
        setSubmissionStatus(null);
        // Simulate API call to SSG
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmissionStatus(`Successfully submitted grant application for ${selectedLearners.size} learner(s).`);
            setSelectedLearners(new Set()); // Clear selection after submission
        }, 2000);
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Apply New Grant</h2>
            <Card className="p-6 mb-6">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="class-select-grant" className="block text-sm font-bold text-gray-700 mb-1">
                            1. Select an Upcoming Class
                        </label>
                        <select
                            id="class-select-grant"
                            value={selectedCourseId}
                            onChange={e => {
                                setSelectedCourseId(e.target.value);
                                setSelectedLearners(new Set());
                                setSubmissionStatus(null);
                            }}
                            className={inputClasses}
                        >
                            <option value="" disabled>-- Choose a class --</option>
                            {upcomingClasses.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.title} ({c.courseRunId})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedCourse && (
                        <div>
                             <h3 className="text-lg font-bold text-gray-800 mb-2">2. Select Learners for Submission</h3>
                             <p className="text-sm text-subtle mb-4">
                                Select one or more learners from the list below to include in the grant application to SSG.
                             </p>
                        </div>
                    )}
                </div>
            </Card>

            {selectedCourse && (
                 <Card className="p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                 <tr>
                                     <th scope="col" className="px-4 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={selectedCourse.learners ? selectedLearners.size === selectedCourse.learners.length && selectedLearners.size > 0 : false}
                                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                        />
                                     </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trainee ID</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Type</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact No.</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolment Date</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sponsorship</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grant Status</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grant ID</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim Status</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employer UEN</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employer Contact Name</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employer Contact Email</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employer Contact Number</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Discount</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Status</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bundle Code</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF Category</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF LOS Date</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF Contribution</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF Employed</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Training Partner UEN</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Training Partner Code</th>
                                 </tr>
                             </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                                {selectedCourse.learners && selectedCourse.learners.length > 0 ? (
                                    selectedCourse.learners.map(learner => {
                                        const overallStatus = getOverallAssessmentStatus(learner);
                                        const displayStatus = overallStatus === 'C' ? 'Competent' : overallStatus === 'NYC' ? 'Not Yet Competent' : 'Pending';
                                        const formatPhoneNumber = (num: LearnerProgress['contactNumber'] | LearnerProgress['employer']['contact']['contactNumber']) => {
                                            if (!num) return 'N/A';
                                            return `+${num.countryCode} ${num.phoneNumber}`;
                                        };
                                        return (
                                            <tr key={learner.email}>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedLearners.has(learner.email)}
                                                        onChange={() => handleSelectLearner(learner.email)}
                                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                                    />
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{learner.name}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.traineeId || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.idType?.type || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.dob ? new Date(learner.dob).toLocaleDateString() : 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.email}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatPhoneNumber(learner.contactNumber) || learner.tel}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.enrolmentDate ? new Date(learner.enrolmentDate).toLocaleDateString() : 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.sponsorshipType || learner.courseSponsorship}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(overallStatus)}`}>{displayStatus}</span></td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(learner.grantStatus)}`}>
                                                        {learner.grantStatus}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.grantId || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(learner.claimStatus)}`}>
                                                        {learner.claimStatus}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.employer?.uen || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.employer?.contact?.fullName || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.employer?.contact?.emailAddress || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatPhoneNumber(learner.employer?.contact?.contactNumber) || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">${learner.fees?.discount?.toFixed(2) || '0.00'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(learner.paymentStatus)}`}>
                                                        {learner.paymentStatus}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.bundle?.code || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.centralProvidentFund?.traineeCategory || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.centralProvidentFund?.letterOfSupportIssuanceDate ? new Date(learner.centralProvidentFund.letterOfSupportIssuanceDate).toLocaleDateString() : 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.centralProvidentFund?.didTraineeReceiveCPFContribution || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.centralProvidentFund?.isTraineeEmployedAtTimeofEnrolment || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.trainingPartner?.uen || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.trainingPartner?.code || 'N/A'}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={26} className="text-center text-subtle py-10">
                                            No learners are enrolled in this class yet.
                                        </td>
                                    </tr>
                                )}
                             </tbody>
                        </table>
                    </div>
                 </Card>
            )}

            {selectedCourse && (
                <div className="mt-6 flex justify-end items-center gap-4">
                    {submissionStatus && <p className="text-green-600 font-semibold">{submissionStatus}</p>}
                    <Button onClick={handleSubmit} disabled={isSubmitting || selectedLearners.size === 0}>
                        {isSubmitting ? <Spinner size="sm"/> : `Submit to SSG (${selectedLearners.size} selected)`}
                    </Button>
                </div>
            )}
        </div>
    );
};

export const ViewGrantStatusView: React.FC = () => {
    const { courses } = useLms();
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const inputClasses = "block w-full px-3 py-2 text-on-surface bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";

    // All classes should be available for viewing status, sorted by most recent start date
    const allClassOptions = useMemo(() => {
        return courses.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [courses]);

    const selectedCourse = useMemo(() => {
        return courses.find(c => c.id === selectedCourseId);
    }, [courses, selectedCourseId]);

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">View Grant Status</h2>
            <Card className="p-6 mb-6">
                <div>
                    <label htmlFor="class-select-status" className="block text-sm font-bold text-gray-700 mb-1">
                        Select a Class to View Statuses
                    </label>
                    <select
                        id="class-select-status"
                        value={selectedCourseId}
                        onChange={e => setSelectedCourseId(e.target.value)}
                        className={inputClasses}
                    >
                        <option value="" disabled>-- Choose any class --</option>
                        {allClassOptions.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.title} ({c.courseRunId})
                            </option>
                        ))}
                    </select>
                </div>
            </Card>

            {selectedCourse && (
                 <Card className="p-0">
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-bold">Grant Status for {selectedCourse.title}</h3>
                        <p className="text-subtle mt-1">Showing all enrolled learners and their grant application status.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                 <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trainee ID</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Type</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact No.</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolment Date</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sponsorship</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grant Status</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grant ID</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim Status</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employer UEN</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employer Contact Name</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employer Contact Email</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employer Contact Number</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Discount</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Status</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bundle Code</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF Category</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF LOS Date</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF Contribution</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF Employed</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Training Partner UEN</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Training Partner Code</th>
                                 </tr>
                             </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                                {selectedCourse.learners && selectedCourse.learners.length > 0 ? (
                                    selectedCourse.learners.map(learner => {
                                        const overallStatus = getOverallAssessmentStatus(learner);
                                        const displayStatus = overallStatus === 'C' ? 'Competent' : overallStatus === 'NYC' ? 'Not Yet Competent' : 'Pending';
                                        const formatPhoneNumber = (num: LearnerProgress['contactNumber'] | LearnerProgress['employer']['contact']['contactNumber']) => {
                                            if (!num) return 'N/A';
                                            return `+${num.countryCode} ${num.phoneNumber}`;
                                        };
                                        return (
                                            <tr key={learner.email}>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{learner.name}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.traineeId || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.idType?.type || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.dob ? new Date(learner.dob).toLocaleDateString() : 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.email}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatPhoneNumber(learner.contactNumber) || learner.tel}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.enrolmentDate ? new Date(learner.enrolmentDate).toLocaleDateString() : 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.sponsorshipType || learner.courseSponsorship}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(overallStatus)}`}>{displayStatus}</span></td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(learner.grantStatus)}`}>
                                                        {learner.grantStatus}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.grantId || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(learner.claimStatus)}`}>
                                                        {learner.claimStatus}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.employer?.uen || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.employer?.contact?.fullName || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.employer?.contact?.emailAddress || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatPhoneNumber(learner.employer?.contact?.contactNumber) || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">${learner.fees?.discount?.toFixed(2) || '0.00'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(learner.paymentStatus)}`}>
                                                        {learner.paymentStatus}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.bundle?.code || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.centralProvidentFund?.traineeCategory || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.centralProvidentFund?.letterOfSupportIssuanceDate ? new Date(learner.centralProvidentFund.letterOfSupportIssuanceDate).toLocaleDateString() : 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.centralProvidentFund?.didTraineeReceiveCPFContribution || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.centralProvidentFund?.isTraineeEmployedAtTimeofEnrolment || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.trainingPartner?.uen || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.trainingPartner?.code || 'N/A'}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={25} className="text-center text-subtle py-10">
                                            No learners are enrolled in this class.
                                        </td>
                                    </tr>
                                )}
                             </tbody>
                        </table>
                    </div>
                 </Card>
            )}
        </div>
    );
};
export const SubmitAssessmentView: React.FC = () => {
    const { courses, updateAllLearnerGrades } = useLms();
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);

    const inputClasses = "block w-full px-3 py-2 text-on-surface bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";

    const selectedCourse = useMemo(() => {
        return courses.find(c => c.id === selectedCourseId);
    }, [courses, selectedCourseId]);

    const handleGradeChange = (learnerEmail: string, newStatus: AssessmentGrade['status']) => {
        if (selectedCourseId) {
            updateAllLearnerGrades(selectedCourseId, learnerEmail, newStatus);
        }
    };

    const allLearnersGraded = useMemo(() => {
        if (!selectedCourse || !selectedCourse.learners) return false;
        if (selectedCourse.learners.length === 0) return false; // Can't submit an empty roster
        return selectedCourse.learners.every(learner => getOverallAssessmentStatus(learner) !== 'Pending');
    }, [selectedCourse]);

    const handleSubmitToTPG = () => {
        setIsSubmitting(true);
        setSubmissionStatus(null);
        // Simulate API call to TPG
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmissionStatus(`Successfully submitted assessment results for ${selectedCourse?.title} to TPG.`);
        }, 1500);
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Submit Assessment Results</h2>
            <Card className="p-6 mb-6">
                <div className="grid grid-cols-1">
                    <div>
                        <label htmlFor="class-select-assessment" className="block text-sm font-bold text-gray-700 mb-1">
                            1. Select a Class
                        </label>
                        <select
                            id="class-select-assessment"
                            value={selectedCourseId}
                            onChange={(e) => {
                                setSelectedCourseId(e.target.value);
                                setSubmissionStatus(null); // Reset status on class change
                            }}
                            className={inputClasses}
                        >
                            <option value="" disabled>-- Choose a class --</option>
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.title} ({c.courseRunId})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {selectedCourse && (
                <Card className="p-0 overflow-x-auto">
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-bold">Assessment Roster for "{selectedCourse.title}"</h3>
                        <p className="text-subtle mt-1">Update each learner's overall assessment status below. Changes are saved automatically.</p>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Learner Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall Assessment Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {selectedCourse.learners && selectedCourse.learners.length > 0 ? (
                                selectedCourse.learners.map(learner => {
                                    const overallStatus = getOverallAssessmentStatus(learner);
                                    
                                    return (
                                        <tr key={learner.email}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{learner.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={overallStatus}
                                                    onChange={(e) => handleGradeChange(learner.email, e.target.value as AssessmentGrade['status'])}
                                                    className={`w-full max-w-xs p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm ${getStatusColor(overallStatus)}`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="C">Competent</option>
                                                    <option value="NYC">Not Yet Competent</option>
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={2} className="text-center text-subtle py-10">
                                        No learners enrolled in this class.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                     <div className="p-4 border-t flex justify-end items-center gap-4">
                        {submissionStatus && <p className="text-green-600 text-sm font-semibold">{submissionStatus}</p>}
                        <Button
                            onClick={handleSubmitToTPG}
                            disabled={!allLearnersGraded || isSubmitting}
                        >
                            {isSubmitting ? <Spinner size="sm" /> : 'Submit to TPG'}
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};
export const ViewAssessmentsView: React.FC = () => {
    const { courses } = useLms();
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<{ courseTitle: string; courseRunId: string; learnerName: string; assessmentStatus: 'Competent' | 'Not Yet Competent' | 'Pending Assessment' }[] | null>(null);

    const inputClasses = "block w-full px-3 py-2 text-on-surface bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";

    const allClassOptions = useMemo(() => {
        return courses.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [courses]);

    // Effect to trigger fetch when courseId changes
    useEffect(() => {
        const handleFetchStatus = () => {
            const course = courses.find(c => c.id === selectedCourseId);
            if (!course) return;

            setIsLoading(true);
            setResults(null);

            // Simulate fetching data from TPG
            setTimeout(() => {
                const tpgResults = (course.learners || []).map(learner => {
                    const internalStatus = getOverallAssessmentStatus(learner);
                    let tpgStatus: 'Competent' | 'Not Yet Competent' | 'Pending Assessment';
                    switch (internalStatus) {
                        case 'C':
                            tpgStatus = 'Competent';
                            break;
                        case 'NYC':
                            tpgStatus = 'Not Yet Competent';
                            break;
                        default:
                            tpgStatus = 'Pending Assessment';
                    }
                    return {
                        courseTitle: course.title,
                        courseRunId: course.courseRunId,
                        learnerName: learner.name,
                        assessmentStatus: tpgStatus,
                    };
                });
                setResults(tpgResults);
                setIsLoading(false);
            }, 1500);
        };
        
        if (selectedCourseId) {
            handleFetchStatus();
        }
    }, [selectedCourseId, courses]);

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">View Assessments from TPG</h2>
            <Card className="p-6 mb-6">
                <div>
                    <label htmlFor="class-select-view-assessment" className="block text-sm font-bold text-gray-700 mb-1">
                        Select a Class to Retrieve Assessment Status
                    </label>
                    <select
                        id="class-select-view-assessment"
                        value={selectedCourseId}
                        onChange={e => setSelectedCourseId(e.target.value)}
                        className={inputClasses}
                    >
                        <option value="" disabled>-- Choose any class --</option>
                        {allClassOptions.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.title} ({c.courseRunId})
                            </option>
                        ))}
                    </select>
                </div>
            </Card>

            {isLoading && (
                <div className="flex justify-center py-10">
                    <Spinner size="lg" text="Retrieving data from TPG..." />
                </div>
            )}

            {results && (
                <Card className="p-0">
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-bold">Assessment Status for {courses.find(c=>c.id === selectedCourseId)?.title}</h3>
                        <p className="text-subtle mt-1">Showing official results retrieved from TPG.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Run ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Learner Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {results.length > 0 ? (
                                    results.map((result, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.courseTitle}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.courseRunId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.learnerName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(result.assessmentStatus)}`}>
                                                    {result.assessmentStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center text-subtle py-10">
                                            No assessment results found for this class.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};
export const ApplyNewClaimView: React.FC = () => {
    const { courses } = useLms();
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [selectedLearners, setSelectedLearners] = useState<Set<string>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);

    const inputClasses = "block w-full px-3 py-2 text-on-surface bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";

    const allClassOptions = useMemo(() => {
        return courses.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [courses]);

    const selectedCourse = useMemo(() => {
        return courses.find(c => c.id === selectedCourseId);
    }, [courses, selectedCourseId]);

    const eligibleLearners = useMemo(() => {
        if (!selectedCourse?.learners) return [];
        return selectedCourse.learners.filter(l => l.grantStatus === TpgStatus.Success);
    }, [selectedCourse]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allEligibleLearnerEmails = new Set(eligibleLearners.map(l => l.email));
            setSelectedLearners(allEligibleLearnerEmails);
        } else {
            setSelectedLearners(new Set());
        }
    };

    const handleSelectLearner = (email: string) => {
        const newSelection = new Set(selectedLearners);
        if (newSelection.has(email)) {
            newSelection.delete(email);
        } else {
            newSelection.add(email);
        }
        setSelectedLearners(newSelection);
    };

    const handleSubmit = () => {
        if (selectedLearners.size === 0) {
            alert('Please select at least one learner to submit a claim for.');
            return;
        }
        setIsSubmitting(true);
        setSubmissionStatus(null);
        // Simulate API call to SSG for claims
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmissionStatus(`Successfully submitted claim application for ${selectedLearners.size} learner(s).`);
            setSelectedLearners(new Set()); // Clear selection after submission
        }, 2000);
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Apply New Claim</h2>
            <Card className="p-6 mb-6">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="class-select-claim" className="block text-sm font-bold text-gray-700 mb-1">
                            1. Select a Class
                        </label>
                        <select
                            id="class-select-claim"
                            value={selectedCourseId}
                            onChange={e => {
                                setSelectedCourseId(e.target.value);
                                setSelectedLearners(new Set());
                                setSubmissionStatus(null);
                            }}
                            className={inputClasses}
                        >
                            <option value="" disabled>-- Choose a class --</option>
                            {allClassOptions.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.title} ({c.courseRunId})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedCourse && (
                        <div>
                             <h3 className="text-lg font-bold text-gray-800 mb-2">2. Select Learners for Claim Submission</h3>
                             <p className="text-sm text-subtle mb-4">
                                Only learners with a 'Success' grant status are shown. Select one or more to submit a claim to SSG.
                             </p>
                        </div>
                    )}
                </div>
            </Card>

            {selectedCourse && (
                 <Card className="p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                 <tr>
                                     <th scope="col" className="px-4 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={eligibleLearners.length > 0 && selectedLearners.size === eligibleLearners.length}
                                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                        />
                                     </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trainee ID</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Type</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact No.</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolment Date</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sponsorship</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grant Status</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grant ID</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim Status</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employer UEN</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employer Contact Name</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employer Contact Email</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employer Contact Number</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Discount</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Status</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bundle Code</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF Category</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF LOS Date</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF Contribution</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF Employed</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Training Partner UEN</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Training Partner Code</th>
                                 </tr>
                             </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                                {eligibleLearners.length > 0 ? (
                                    eligibleLearners.map(learner => {
                                        const overallStatus = getOverallAssessmentStatus(learner);
                                        const displayStatus = overallStatus === 'C' ? 'Competent' : overallStatus === 'NYC' ? 'Not Yet Competent' : 'Pending';
                                        const formatPhoneNumber = (num: LearnerProgress['contactNumber'] | LearnerProgress['employer']['contact']['contactNumber']) => {
                                            if (!num) return 'N/A';
                                            return `+${num.countryCode} ${num.phoneNumber}`;
                                        };
                                        return (
                                            <tr key={learner.email}>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedLearners.has(learner.email)}
                                                        onChange={() => handleSelectLearner(learner.email)}
                                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                                    />
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{learner.name}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.traineeId || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.idType?.type || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.dob ? new Date(learner.dob).toLocaleDateString() : 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.email}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatPhoneNumber(learner.contactNumber) || learner.tel}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.enrolmentDate ? new Date(learner.enrolmentDate).toLocaleDateString() : 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.sponsorshipType || learner.courseSponsorship}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(overallStatus)}`}>{displayStatus}</span></td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(learner.grantStatus)}`}>
                                                        {learner.grantStatus}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.grantId || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(learner.claimStatus)}`}>
                                                        {learner.claimStatus}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.employer?.uen || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.employer?.contact?.fullName || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.employer?.contact?.emailAddress || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatPhoneNumber(learner.employer?.contact?.contactNumber) || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">${learner.fees?.discount?.toFixed(2) || '0.00'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(learner.paymentStatus)}`}>
                                                        {learner.paymentStatus}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.bundle?.code || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.centralProvidentFund?.traineeCategory || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.centralProvidentFund?.letterOfSupportIssuanceDate ? new Date(learner.centralProvidentFund.letterOfSupportIssuanceDate).toLocaleDateString() : 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.centralProvidentFund?.didTraineeReceiveCPFContribution || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.centralProvidentFund?.isTraineeEmployedAtTimeofEnrolment || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.trainingPartner?.uen || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.trainingPartner?.code || 'N/A'}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={26} className="text-center text-subtle py-10">
                                            No learners with successful grants found in this class.
                                        </td>
                                    </tr>
                                )}
                             </tbody>
                        </table>
                    </div>
                 </Card>
            )}

            {selectedCourse && (
                <div className="mt-6 flex justify-end items-center gap-4">
                    {submissionStatus && <p className="text-green-600 font-semibold">{submissionStatus}</p>}
                    <Button onClick={handleSubmit} disabled={isSubmitting || selectedLearners.size === 0}>
                        {isSubmitting ? <Spinner size="sm"/> : `Submit Claim to SSG (${selectedLearners.size} selected)`}
                    </Button>
                </div>
            )}
        </div>
    );
};
export const ViewClaimStatusView: React.FC = () => {
    const { courses } = useLms();
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const inputClasses = "block w-full px-3 py-2 text-on-surface bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";

    const allClassOptions = useMemo(() => {
        return courses.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [courses]);

    const selectedCourse = useMemo(() => {
        return courses.find(c => c.id === selectedCourseId);
    }, [courses, selectedCourseId]);

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">View Claim Status</h2>
            <Card className="p-6 mb-6">
                <div>
                    <label htmlFor="class-select-claim-status" className="block text-sm font-bold text-gray-700 mb-1">
                        Select a Class to View Claim Statuses
                    </label>
                    <select
                        id="class-select-claim-status"
                        value={selectedCourseId}
                        onChange={e => setSelectedCourseId(e.target.value)}
                        className={inputClasses}
                    >
                        <option value="" disabled>-- Choose any class --</option>
                        {allClassOptions.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.title} ({c.courseRunId})
                            </option>
                        ))}
                    </select>
                </div>
            </Card>

            {selectedCourse && (
                 <Card className="p-0">
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-bold">Claim Status for {selectedCourse.title}</h3>
                        <p className="text-subtle mt-1">Showing all enrolled learners and their claim application status.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                 <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trainee ID</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Type</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Birth</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact No.</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolment Date</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sponsorship</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grant Status</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grant ID</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim Status</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employer UEN</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employer Contact Name</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employer Contact Email</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employer Contact Number</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Discount</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Status</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bundle Code</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF Category</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF LOS Date</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF Contribution</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF Employed</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Training Partner UEN</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Training Partner Code</th>
                                 </tr>
                             </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                                {selectedCourse.learners && selectedCourse.learners.length > 0 ? (
                                    selectedCourse.learners.map(learner => {
                                        const overallStatus = getOverallAssessmentStatus(learner);
                                        const displayStatus = overallStatus === 'C' ? 'Competent' : overallStatus === 'NYC' ? 'Not Yet Competent' : 'Pending';
                                        const formatPhoneNumber = (num: LearnerProgress['contactNumber'] | LearnerProgress['employer']['contact']['contactNumber']) => {
                                            if (!num) return 'N/A';
                                            return `+${num.countryCode} ${num.phoneNumber}`;
                                        };
                                        return (
                                            <tr key={learner.email}>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{learner.name}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.traineeId || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.idType?.type || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.dob ? new Date(learner.dob).toLocaleDateString() : 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.email}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatPhoneNumber(learner.contactNumber) || learner.tel}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.enrolmentDate ? new Date(learner.enrolmentDate).toLocaleDateString() : 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.sponsorshipType || learner.courseSponsorship}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(overallStatus)}`}>{displayStatus}</span></td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(learner.grantStatus)}`}>
                                                        {learner.grantStatus}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.grantId || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(learner.claimStatus)}`}>
                                                        {learner.claimStatus}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.employer?.uen || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.employer?.contact?.fullName || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.employer?.contact?.emailAddress || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatPhoneNumber(learner.employer?.contact?.contactNumber) || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">${learner.fees?.discount?.toFixed(2) || '0.00'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(learner.paymentStatus)}`}>
                                                        {learner.paymentStatus}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.bundle?.code || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.centralProvidentFund?.traineeCategory || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.centralProvidentFund?.letterOfSupportIssuanceDate ? new Date(learner.centralProvidentFund.letterOfSupportIssuanceDate).toLocaleDateString() : 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.centralProvidentFund?.didTraineeReceiveCPFContribution || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.centralProvidentFund?.isTraineeEmployedAtTimeofEnrolment || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.trainingPartner?.uen || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.trainingPartner?.code || 'N/A'}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={25} className="text-center text-subtle py-10">
                                            No learners are enrolled in this class.
                                        </td>
                                    </tr>
                                )}
                             </tbody>
                        </table>
                    </div>
                 </Card>
            )}
        </div>
    );
};


// --- Upload Course Runs View ---

interface SubmissionResult {
    courseRef: string;
    startDate: string;
    endDate: string;
    status: 'Success' | 'Failed';
    courseRunId?: string;
    error?: string;
}

export const UploadCourseRunsView: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<SubmissionResult[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileChange = (selectedFile: File | undefined | null) => {
        if (selectedFile) {
            if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || selectedFile.type === 'application/vnd.ms-excel') {
                setFile(selectedFile);
                setError(null);
            } else {
                setError('Invalid file type. Please upload an Excel file (.xlsx, .xls).');
                setFile(null);
            }
        }
    };

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isOver: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(isOver);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const droppedFile = e.dataTransfer.files?.[0];
        handleFileChange(droppedFile);
    };

    const handleSimulateUpload = () => {
        if (!file) return;

        setIsUploading(true);
        setSubmissionResult(null);

        // Simulate a network request to SSG
        setTimeout(() => {
            const mockResults: SubmissionResult[] = [
                { courseRef: 'TGS-2025053174', startDate: '05/09/2025', endDate: '08/09/2025', status: 'Success', courseRunId: Math.floor(1000000 + Math.random() * 9000000).toString() },
                { courseRef: 'TGS-2024081123', startDate: '29/08/2025', endDate: '03/09/2025', status: 'Success', courseRunId: Math.floor(1000000 + Math.random() * 9000000).toString() },
                { courseRef: 'CRS-Q-0041189-2', startDate: '25/09/2025', endDate: '27/09/2025', status: 'Failed', error: 'Trainer is not qualified for this course.' },
                { courseRef: 'CRS-Q-0041190-3', startDate: '10/10/2025', endDate: '14/10/2025', status: 'Success', courseRunId: Math.floor(1000000 + Math.random() * 9000000).toString() },
                { courseRef: 'TGS-2024070145', startDate: '15/11/2025', endDate: '18/11/2025', status: 'Failed', error: 'Course reference number is invalid or has expired.' },
            ];
            setSubmissionResult(mockResults);
            setIsUploading(false);
        }, 2500);
    };

    const resetView = () => {
        setFile(null);
        setSubmissionResult(null);
        setError(null);
    };

    const UploadStep = () => (
        <Card className="p-6">
            <div className="text-center mb-4">
                <h3 className="text-xl font-bold">Upload Course Runs</h3>
                <p className="text-subtle mt-1">Submit your course run details in bulk by uploading an Excel file.</p>
            </div>
            
            <div
                onDragOver={(e) => handleDragEvents(e, true)}
                onDragLeave={(e) => handleDragEvents(e, false)}
                onDrop={handleDrop}
                className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragOver ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".xlsx, .xls"
                    onChange={(e) => handleFileChange(e.target.files?.[0])}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                    <Icon name={IconName.Upload} className="w-12 h-12 mx-auto text-subtle" />
                    <p className="mt-2 font-semibold text-on-surface">
                        {file ? file.name : 'Drag & drop your file here, or click to browse'}
                    </p>
                    <p className="text-xs text-subtle mt-1">
                        XLSX or XLS file format
                    </p>
                </label>
            </div>
            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

            <div className="flex justify-between items-center mt-6">
                 <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => alert('Downloading SSG Course Run template...')}
                    leftIcon={<Icon name={IconName.FileExcel} className="w-4 h-4" />}
                >
                    Download Template
                </Button>
                <Button onClick={handleSimulateUpload} disabled={!file || isUploading}>
                    {isUploading ? <Spinner size="sm" /> : 'Submit to SSG'}
                </Button>
            </div>
        </Card>
    );

    const ResultsStep = () => (
        <Card>
            <div className="p-6 border-b">
                <h3 className="text-xl font-bold">Submission Results</h3>
                <p className="text-subtle mt-1">The following results were returned from SSG.</p>
            </div>
            <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course Ref Number</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SSG Course Run ID / Error</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {submissionResult?.map((result, index) => (
                            <tr key={index}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.courseRef}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{result.startDate} - {result.endDate}</td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${result.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {result.status}
                                    </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                    {result.status === 'Success' ? (
                                        <span className="font-mono text-gray-700">{result.courseRunId}</span>
                                    ) : (
                                        <span className="text-red-600">{result.error}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <div className="p-4 border-t text-right">
                <Button onClick={resetView}>Start a New Upload</Button>
            </div>
        </Card>
    );

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Upload Course Runs to SSG</h2>
            {isUploading ? (
                 <div className="flex justify-center py-20">
                    <Spinner size="lg" text="Submitting to SSG, this may take a moment..." />
                 </div>
            ) : submissionResult ? (
                <ResultsStep />
            ) : (
                <UploadStep />
            )}
        </div>
    );
};
