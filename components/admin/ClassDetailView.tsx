import React, { useState, useEffect } from 'react';
import { Course, LearnerProgress, TpgStatus, PaymentMode, PaymentStatus } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { useLms } from '../../hooks/useLms';
import { Icon, IconName } from '../common/Icon';

// Helper functions for consistent styling and logic, moved here for reusability
export const getStatusColor = (status: string) => {
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
        case 'Confirmed':
            return 'bg-green-100 text-green-800';
        case 'Processing':
        case 'Reschedule':
             return 'bg-blue-100 text-blue-800';
        case 'Pending':
        case 'In Progress':
            return 'bg-yellow-100 text-yellow-800';
        case 'Overdue':
        case 'Rejected':
        case 'Unpaid':
        case 'NYC':
        case 'Not Yet Competent':
        case 'Fail':
        case 'Failed':
        case 'Cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export const getOverallAssessmentStatus = (learner: LearnerProgress): 'C' | 'NYC' | 'Pending' => {
    if (!learner.assessmentGrades || learner.assessmentGrades.length === 0) {
        return 'Pending';
    }
    // Rule: if ANY assessment is NYC, overall is NYC.
    if (learner.assessmentGrades.some(g => g.status === 'NYC')) {
        return 'NYC';
    }
    // Rule: if ALL assessments are C, overall is C.
    if (learner.assessmentGrades.every(g => g.status === 'C')) {
        return 'C';
    }
    // Otherwise, it's pending.
    return 'Pending';
};

const getAgeGroup = (dob: string): 'Above 40' | 'Below 40' | 'N/A' => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age > 40 ? 'Above 40' : 'Below 40';
};

const inputClasses = "block w-full px-3 py-2 text-on-surface bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";

const EditLearnerModal: React.FC<{ learner: LearnerProgress; course: Course; onSave: (updatedLearner: LearnerProgress) => void; onClose: () => void }> = ({ learner, course, onSave, onClose }) => {
    const [formData, setFormData] = useState(learner);

    useEffect(() => {
        setFormData(learner);
    }, [learner]);

    const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            fees: {
                ...prev.fees!,
                [name]: parseFloat(value) || 0,
            }
        }));
    };

    const handleStringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            fees: {
                ...prev.fees!,
                [name]: value,
            }
        }));
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const { totalCourseFee, grantAmount, discount } = formData.fees || { totalCourseFee: 0, grantAmount: 0, discount: 0 };
    const gst = (totalCourseFee - discount) * (course.taxPercent / 100);
    const netFee = totalCourseFee - grantAmount - discount + gst;

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => onClose()} role="dialog" aria-modal="true">
            <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold">Edit Learner Details</h2>
                    <p className="text-subtle">{learner.name}</p>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div><label className="block text-sm font-bold text-gray-700 mb-1">Total Course Fee</label><input type="number" name="totalCourseFee" value={formData.fees?.totalCourseFee || 0} onChange={handleFeeChange} className={inputClasses} /></div>
                        <div><label className="block text-sm font-bold text-gray-700 mb-1">Grant Amount</label><input type="number" name="grantAmount" value={formData.fees?.grantAmount || 0} onChange={handleFeeChange} className={inputClasses} /></div>
                        <div><label className="block text-sm font-bold text-gray-700 mb-1">Discount</label><input type="number" name="discount" value={formData.fees?.discount || 0} onChange={handleFeeChange} className={inputClasses} /></div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-md grid grid-cols-2 gap-4">
                        <div><p className="text-sm text-subtle">GST ({course.taxPercent}%)</p><p className="font-bold text-lg">${gst.toFixed(2)}</p></div>
                        <div><p className="text-sm text-subtle">Net Fee Payable</p><p className="font-bold text-lg text-primary">${netFee.toFixed(2)}</p></div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-bold text-gray-700 mb-1">SkillsFuture Credit Claim</label><input type="number" name="skillsFutureCreditClaim" value={formData.fees?.skillsFutureCreditClaim || 0} onChange={handleFeeChange} className={inputClasses} /></div>
                        <div><label className="block text-sm font-bold text-gray-700 mb-1">Cash Payment</label><input type="number" name="cashPayment" value={formData.fees?.cashPayment || 0} onChange={handleFeeChange} className={inputClasses} /></div>
                        <div><label className="block text-sm font-bold text-gray-700 mb-1">Payment Mode</label><select name="paymentMode" value={formData.paymentMode || ''} onChange={handleSelectChange} className={inputClasses}><option value="" disabled>Select</option>{Object.values(PaymentMode).map(m=><option key={m} value={m}>{m}</option>)}</select></div>
                        <div><label className="block text-sm font-bold text-gray-700 mb-1">Payment Status</label><select name="paymentStatus" value={formData.paymentStatus} onChange={handleSelectChange} className={inputClasses}>{Object.values(PaymentStatus).map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                        <div><label className="block text-sm font-bold text-gray-700 mb-1">Invoice #</label><input type="text" name="invoiceNumber" value={formData.fees?.invoiceNumber || ''} onChange={handleStringChange} className={inputClasses} /></div>
                        <div><label className="block text-sm font-bold text-gray-700 mb-1">Receipt #</label><input type="text" name="receiptNumber" value={formData.fees?.receiptNumber || ''} onChange={handleStringChange} className={inputClasses} /></div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => onClose()}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </div>
            </Card>
        </div>
    );
};


const ClassDetailView: React.FC<{ course: Course; onBack: () => void }> = ({ course, onBack }) => {
    const { updateLearnerDetailsInClass } = useLms();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingLearner, setEditingLearner] = useState<LearnerProgress | null>(null);

    const learners = course.learners || [];
    const totalLearners = learners.length;

    const successfulGrants = learners.filter(l => l.grantStatus === TpgStatus.Success).length;
    const successfulClaims = learners.filter(l => l.claimStatus === TpgStatus.Success).length;
    const competentLearners = learners.filter(l => getOverallAssessmentStatus(l) === 'C').length;
    
    const handleEditClick = (learner: LearnerProgress) => {
        setEditingLearner(learner);
        setIsEditModalOpen(true);
    };

    const handleSaveLearner = async (updatedLearner: LearnerProgress) => {
        try {
            await updateLearnerDetailsInClass(course.id, updatedLearner.email, updatedLearner);
            setIsEditModalOpen(false);
            setEditingLearner(null);
        } catch (error) {
            console.error("Failed to save learner details:", error);
            alert("An error occurred while saving. Please try again.");
        }
    };

    return (
        <div>
            <Button variant="ghost" onClick={onBack} className="mb-4">
                &larr; Back to List
            </Button>
            <h2 className="text-3xl font-bold mb-2">Class Details</h2>
            <p className="text-xl text-primary font-semibold mb-6">{course.title}</p>

            <Card className="p-6 mb-8">
                <h3 className="text-xl font-bold mb-4">Operational Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
                    <div><p className="text-sm text-subtle">Trainer</p><p className="font-semibold">{course.trainer}</p></div>
                    <div><p className="text-sm text-subtle">Start Date</p><p className="font-semibold">{new Date(course.startDate).toLocaleDateString()}</p></div>
                    <div><p className="text-sm text-subtle">Mode</p><p className="font-semibold">{course.modeOfLearning.join(', ')}</p></div>
                    <div><p className="text-sm text-subtle">Overall Assessment</p><p className="font-semibold">{`${competentLearners}/${totalLearners}`}</p></div>
                    <div><p className="text-sm text-subtle">TGS Ref</p><p className="font-semibold">{course.courseCode}</p></div>
                    <div><p className="text-sm text-subtle">Course Run ID</p><p className="font-semibold">{course.courseRunId}</p></div>
                    <div><p className="text-sm text-subtle">Overall Grant Status</p><p className="font-semibold">{`${successfulGrants}/${totalLearners}`}</p></div>
                    <div><p className="text-sm text-subtle">Overall Claim Status</p><p className="font-semibold">{`${successfulClaims}/${totalLearners}`}</p></div>
                </div>
            </Card>

            <h3 className="text-2xl font-bold mb-4">Enrolled Learners</h3>
            <Card className="p-0 overflow-x-auto">
                {(course.learners && course.learners.length > 0) ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Learner</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sponsorship</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nationality</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age Group</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Details</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grant ID</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim ID</th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {course.learners.map(learner => {
                                const overallStatus = getOverallAssessmentStatus(learner);
                                const displayStatus = overallStatus === 'C' ? 'Competent' : overallStatus === 'NYC' ? 'Not Yet Competent' : 'Pending';
                                const ageGroup = getAgeGroup(learner.dob);
                                return (
                                    <tr key={learner.name}>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            <p className="font-medium text-gray-900">{learner.name}</p>
                                            <p className="text-gray-500">{learner.email}</p>
                                            <p className="text-gray-500">{learner.tel}</p>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.company}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.courseSponsorship}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{learner.nationality || 'N/A'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{ageGroup}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <p>{learner.paymentMode || 'N/A'}</p>
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(learner.paymentStatus)}`}>
                                                {learner.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(overallStatus)}`}>{displayStatus}</span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{learner.grantId || 'N/A'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{learner.claimId || 'N/A'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                            <Button size="sm" variant="ghost" onClick={() => handleEditClick(learner)} leftIcon={<Icon name={IconName.Edit} className="w-4 h-4"/>}>
                                                Edit
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center text-subtle py-10">No learners are enrolled in this course yet.</p>
                )}
            </Card>

            {isEditModalOpen && editingLearner && (
                <EditLearnerModal 
                    learner={editingLearner}
                    course={course}
                    onSave={handleSaveLearner}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
        </div>
    );
}

export default ClassDetailView;
