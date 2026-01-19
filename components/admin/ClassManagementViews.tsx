import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useLms } from '../../hooks/useLms';
import { Course, LearnerProgress, ModeOfLearning, TpgStatus, AdminPage, Ethnicity, Gender, EmploymentStatus, Nationality, calculateAgeGroup, CourseSponsorship, CompanyType, ClassStatus, PaymentStatus } from '../../types';
import { MOCK_TRAINERS } from '../../constants';
import { Icon, IconName } from '../common/Icon';
import Spinner from '../common/Spinner';

// Reusable parts
const inputClasses = "block w-full px-3 py-2 text-on-surface bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";
const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <div className="space-y-4">{children}</div>
    </Card>
);


// --- MAIN FORM VIEW FOR CREATING/EDITING ---

interface ClassManagerViewProps {
    courseToEdit?: Course | null;
}

export const ClassManagerView: React.FC<ClassManagerViewProps> = ({ courseToEdit }) => {
    const { addCourse, updateCourse, courses, setAdminPage, allLearners } = useLms();
    
    const isEditMode = !!courseToEdit;
    const title = isEditMode ? 'Edit Class' : 'Create New Class';

    // State for the form fields
    const [templateCourseId, setTemplateCourseId] = useState<string>('');
    const [courseRunId, setCourseRunId] = useState('');
    const [daId, setDaId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [assignedTrainer, setAssignedTrainer] = useState<string>('');
    const [mode, setMode] = useState<ModeOfLearning>(ModeOfLearning.Virtual);
    const [classStatus, setClassStatus] = useState<ClassStatus>(ClassStatus.Pending);
    const [enrolledLearners, setEnrolledLearners] = useState<LearnerProgress[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [learnerSearch, setLearnerSearch] = useState('');

    const enrolledEmails = useMemo(() => new Set(enrolledLearners.map(l => l.email)), [enrolledLearners]);

    const searchResults = useMemo(() => {
        if (!learnerSearch) return [];
        return allLearners.filter(learner =>
            !enrolledEmails.has(learner.email) &&
            (learner.name.toLowerCase().includes(learnerSearch.toLowerCase()) || learner.email.toLowerCase().includes(learnerSearch.toLowerCase()))
        );
    }, [learnerSearch, allLearners, enrolledEmails]);

    const handleAddLearner = (learner: LearnerProgress) => {
        setEnrolledLearners(prev => [...prev, learner]);
        setLearnerSearch('');
    };

    const handleRemoveLearner = (email: string) => {
        setEnrolledLearners(prev => prev.filter(l => l.email !== email));
    };


    useEffect(() => {
        if (courseToEdit) {
            // Find the base course template to link it
            const template = courses.find(c => c.courseCode === courseToEdit.courseCode && c.title === courseToEdit.title);
            setTemplateCourseId(template?.id || '');
            setCourseRunId(courseToEdit.courseRunId);
            setDaId(courseToEdit.daId || '');
            setStartDate(courseToEdit.startDate);
            setEndDate(courseToEdit.endDate);
            setAssignedTrainer(courseToEdit.trainer);
            setMode(courseToEdit.modeOfLearning?.[0] || ModeOfLearning.Virtual);
            setClassStatus(courseToEdit.classStatus || ClassStatus.Pending);
            setEnrolledLearners(courseToEdit.learners || []);
        }
    }, [courseToEdit, courses]);

    const handleCancel = () => {
        setAdminPage(AdminPage.Dashboard);
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            const templateCourse = courses.find(c => c.id === templateCourseId);
            if (!templateCourse || !courseRunId || !startDate || !endDate || !assignedTrainer) {
                alert("Please fill in all required fields.");
                setIsSaving(false);
                return;
            }

            const classRunData = {
                ...templateCourse,
                courseRunId,
                daId,
                startDate,
                endDate,
                trainer: assignedTrainer,
                modeOfLearning: [mode],
                classStatus,
                learners: enrolledLearners, // This will be updated with the context learners
            };

            if (isEditMode && courseToEdit) {
                const updatedCourseRun: Course = { ...courseToEdit, ...classRunData };
                await updateCourse(updatedCourseRun);
                alert(`Successfully updated class: ${templateCourse.title} (${courseRunId})`);
            } else {
                 const newCourseRun: Course = {
                    ...classRunData,
                    id: `course_${Date.now()}`,
                     learners: enrolledLearners.map(l => ({
                        ...l,
                        progressPercent: 0, quizScore: null, assessmentGrades: [], submissions: [],
                        grantStatus: TpgStatus.NA, claimStatus: TpgStatus.NA, grantId: null,
                    })),
                    enrollmentStatus: 'not-enrolled',
                    // Fix: Changed string 'Pending' to enum PaymentStatus.Pending to match the type definition for course payment status.
                    paymentStatus: PaymentStatus.Pending,
                };
                await addCourse(newCourseRun);
                alert(`Successfully created new class: ${templateCourse.title} (${courseRunId})`);
            }
            setAdminPage(AdminPage.Dashboard);
        } catch (error) {
            console.error("Failed to save class", error);
            alert("Failed to save class. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">{title}</h2>
                <div>
                    <Button variant="ghost" onClick={handleCancel} className="mr-2">Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSaving || !templateCourseId}>
                        {isSaving ? <Spinner size="sm" /> : (isEditMode ? 'Save Changes' : 'Create Class')}
                    </Button>
                </div>
            </div>
            
            <div className="space-y-6">
                 <FormSection title="1. Select Course">
                    <select id="course-template" value={templateCourseId} onChange={e => setTemplateCourseId(e.target.value)} className={inputClasses} disabled={isEditMode}>
                        <option value="" disabled>Select a course template</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.courseCode})</option>)}
                    </select>
                     {isEditMode && <p className="text-xs text-subtle">Course template cannot be changed when editing a class.</p>}
                </FormSection>
                
                <FormSection title="2. Class Details">
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Course Run ID *</label>
                            <input type="text" value={courseRunId} onChange={e => setCourseRunId(e.target.value)} className={inputClasses} placeholder="e.g., CRN-2025-001" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Class Status</label>
                            <select value={classStatus} onChange={e => setClassStatus(e.target.value as ClassStatus)} className={inputClasses}>
                                {Object.values(ClassStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Mode of Learning</label>
                            <select value={mode} onChange={e => setMode(e.target.value as ModeOfLearning)} className={inputClasses}>
                                {Object.values(ModeOfLearning).map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Digital Attendance ID</label>
                            <input type="text" value={daId} onChange={e => setDaId(e.target.value)} className={inputClasses} placeholder="e.g., RA415175" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Start Date *</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClasses} />
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">End Date *</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClasses} />
                        </div>
                    </div>
                </FormSection>

                <FormSection title="3. Assign Trainer">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Assign Trainer *</label>
                        <select value={assignedTrainer} onChange={e => setAssignedTrainer(e.target.value)} className={inputClasses}>
                            <option value="" disabled>Select a trainer</option>
                            {MOCK_TRAINERS.map(t => <option key={t.loginId} value={t.name}>{t.name}</option>)}
                        </select>
                    </div>
                </FormSection>

                <FormSection title="4. Enroll Learners">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Add Learners</label>
                        <div className="relative">
                            <Icon name={IconName.Search} className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search existing learners by name or email..."
                                value={learnerSearch}
                                onChange={e => setLearnerSearch(e.target.value)}
                                className={`${inputClasses} pl-9`}
                            />
                        </div>
                        <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                            {searchResults.slice(0, 5).map(learner => (
                                <div key={learner.email} className="p-2 flex justify-between items-center bg-gray-50 rounded-md">
                                    <div>
                                        <p className="font-semibold text-sm">{learner.name}</p>
                                        <p className="text-xs text-subtle">{learner.email}</p>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => handleAddLearner(learner)}>Add</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-2 mt-4">Enrolled Learners ({enrolledLearners.length})</h4>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {enrolledLearners.length > 0 ? (
                                enrolledLearners.map(learner => (
                                    <div key={learner.email} className="p-2 flex justify-between items-center bg-blue-50 rounded-md">
                                        <div>
                                            <p className="font-semibold text-sm">{learner.name}</p>
                                            <p className="text-xs text-subtle">{learner.email}</p>
                                        </div>
                                        <Button size="sm" variant="danger" onClick={() => handleRemoveLearner(learner.email)}>Remove</Button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-subtle py-4 text-sm">No learners enrolled yet.</p>
                            )}
                        </div>
                    </div>
                </FormSection>
            </div>
        </div>
    );
};


// --- ENROLL LEARNERS VIEW ---

const FormInput: React.FC<{ label: string; name: string; value: any; onChange: (e: any) => void; type?: string; required?: boolean; children?: React.ReactNode }> = 
({ label, name, value, onChange, type = 'text', required = false, children }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children ? (
            <select name={name} value={value} onChange={onChange} className={inputClasses}>{children}</select>
        ) : (
            <input type={type} name={name} value={value} onChange={onChange} className={inputClasses} />
        )}
    </div>
);

const AddLearnerForm: React.FC<{ onSave: (newLearner: LearnerProgress) => void; onCancel: () => void; }> = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState<any>({
        name: '', tel: '', email: '', dob: '', traineeId: '',
        ethnicity: Ethnicity.Chinese, gender: Gender.Male, company: '', employmentStatus: EmploymentStatus.Employed, nationality: Nationality.Singaporean,
        courseSponsorship: CourseSponsorship.SelfSponsored, employer: { name: '', contact: { fullName: '', emailAddress: '', phoneNumber: '' }, type: CompanyType.NA }, centralProvidentFund: { didTraineeReceiveCPFContribution: 'No' }
    });
    const [showNric, setShowNric] = useState(false);
    const [showDob, setShowDob] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [outer, inner] = name.split('.');
            if (inner.includes('_')) { // handle employer contact
                const [contactKey, subKey] = inner.split('_');
                 setFormData((prev: any) => ({ ...prev, [outer]: { ...prev[outer], [contactKey]: {...prev[outer][contactKey], [subKey]: value} }}));
            } else {
                 setFormData((prev: any) => ({ ...prev, [outer]: { ...prev[outer], [inner]: value } }));
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.dob || !formData.traineeId || !formData.nationality || !formData.courseSponsorship) {
            alert("Please fill in all mandatory fields marked with *");
            return;
        }

        const newLearner: LearnerProgress = {
            ...formData,
            progressPercent: 0, quizScore: null, paymentStatus: 'Unpaid', assessmentGrades: [], submissions: [],
            grantId: null, grantStatus: TpgStatus.NA, claimStatus: TpgStatus.NA,
        };
        onSave(newLearner);
    };

    const MaskedInput: React.FC<{ name: 'traineeId' | 'dob', label: string, isVisible: boolean, onToggle: () => void, required?: boolean }> = 
        ({ name, label, isVisible, onToggle, required }) => (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
            <div className="relative">
                <input type={name === 'dob' ? 'date' : 'text'} name={name} value={formData[name]} onChange={handleChange} className={`${inputClasses} ${!isVisible ? 'blur-sm' : ''}`} readOnly={!isVisible}/>
                <button type="button" onClick={onToggle} className="absolute inset-y-0 right-0 pr-3 flex items-center text-subtle">
                    <Icon name={isVisible ? IconName.EyeOff : IconName.Eye} className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
    
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormInput label="Name as per NRIC" name="name" value={formData.name} onChange={handleChange} required />
                <FormInput label="Telephone" name="tel" value={formData.tel} onChange={handleChange} />
                <FormInput label="Email" name="email" value={formData.email} onChange={handleChange} />
                <MaskedInput name="dob" label="DOB" isVisible={showDob} onToggle={() => setShowDob(!showDob)} required />
                <MaskedInput name="traineeId" label="NRIC" isVisible={showNric} onToggle={() => setShowNric(!showNric)} required />
                <FormInput label="Race" name="ethnicity" value={formData.ethnicity} onChange={handleChange}><>{Object.values(Ethnicity).map(e => <option key={e} value={e}>{e}</option>)}</></FormInput>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Age Group</label><input type="text" value={formData.dob ? calculateAgeGroup(formData.dob) : 'N/A'} readOnly className={`${inputClasses} bg-gray-100`}/></div>
                <FormInput label="Gender" name="gender" value={formData.gender} onChange={handleChange}><>{Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}</></FormInput>
                <FormInput label="Company" name="company" value={formData.company} onChange={handleChange} />
                <FormInput label="Employment Status" name="employmentStatus" value={formData.employmentStatus} onChange={handleChange}><>{Object.values(EmploymentStatus).map(s => <option key={s} value={s}>{s}</option>)}</></FormInput>
                <FormInput label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} required><>{Object.values(Nationality).map(n => <option key={n} value={n}>{n}</option>)}</></FormInput>
            </div>
            
            <div className="border-t pt-4">
                <FormInput label="Course Sponsorship" name="courseSponsorship" value={formData.courseSponsorship} onChange={handleChange} required>
                    <>{Object.values(CourseSponsorship).map(s => <option key={s} value={s}>{s}</option>)}</>
                </FormInput>
            </div>

            {formData.courseSponsorship === CourseSponsorship.EmployerSponsored && (
                 <div className="p-4 border border-blue-200 bg-blue-50 rounded-md space-y-4">
                    <h4 className="font-bold text-blue-800">Employer Sponsorship Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         <FormInput label="Company Name" name="employer.name" value={formData.employer.name} onChange={handleChange} required/>
                         <FormInput label="Company Contact Person" name="employer.contact_fullName" value={formData.employer.contact.fullName} onChange={handleChange} required/>
                         <FormInput label="Company Contact Email" name="employer.contact_emailAddress" value={formData.employer.contact.emailAddress} onChange={handleChange} required/>
                         <FormInput label="Company Contact Tel" name="employer.contact_phoneNumber" value={formData.employer.contact.phoneNumber} onChange={handleChange} required/>
                         <FormInput label="Company Type" name="employer.type" value={formData.employer.type} onChange={handleChange} required><>{Object.values(CompanyType).map(t=><option key={t} value={t}>{t}</option>)}</></FormInput>
                         <FormInput label="CPF Contribution" name="centralProvidentFund.didTraineeReceiveCPFContribution" value={formData.centralProvidentFund.didTraineeReceiveCPFContribution} onChange={handleChange} required><><option value="Yes">Yes</option><option value="No">No</option></></FormInput>
                    </div>
                 </div>
            )}

            <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSubmit}>Save Learner</Button>
            </div>
        </div>
    );
};


export const EnrollLearnersView: React.FC = () => {
    const { courses, allLearners, addLearner, enrollLearnerInClass, unenrollLearnerFromClass } = useLms();
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddingLearner, setIsAddingLearner] = useState(false);

    const selectedCourse = useMemo(() => courses.find(c => c.id === selectedCourseId), [courses, selectedCourseId]);
    const enrolledEmails = useMemo(() => new Set(selectedCourse?.learners?.map(l => l.email) || []), [selectedCourse]);

    const searchResults = useMemo(() => {
        if (!searchQuery) return [];
        return allLearners.filter(learner => 
            !enrolledEmails.has(learner.email) &&
            (learner.name.toLowerCase().includes(searchQuery.toLowerCase()) || learner.email.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [searchQuery, allLearners, enrolledEmails]);

    const handleSaveNewLearner = async (newLearner: LearnerProgress) => {
        try {
            const createdLearner = await addLearner(newLearner);
            if (selectedCourseId) {
                await enrollLearnerInClass(selectedCourseId, createdLearner.email);
            }
            alert(`Successfully created and enrolled ${createdLearner.name}.`);
            setIsAddingLearner(false);
        } catch (error) {
            alert("Failed to create learner. Please try again.");
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Enroll Learners</h2>
            
            <Card className="p-6 mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-1">1. Select a Class to Manage Enrollment</label>
                <select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} className={inputClasses}>
                    <option value="" disabled>-- Choose a class --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.courseRunId})</option>)}
                </select>
            </Card>

            {isAddingLearner ? (
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Add New Learner Profile</h3>
                        <Button variant="ghost" onClick={() => setIsAddingLearner(false)}>Cancel</Button>
                    </div>
                    <AddLearnerForm 
                        onSave={handleSaveNewLearner}
                        onCancel={() => setIsAddingLearner(false)} 
                    />
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4">Add Learners to Class</h3>
                        <div className="relative">
                            <Icon name={IconName.Search} className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text" 
                                placeholder="Search existing learners by name or email..." 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className={`${inputClasses} pl-9`} 
                                disabled={!selectedCourseId}
                            />
                        </div>
                        <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
                            {searchResults.map(learner => (
                                <div key={learner.email} className="p-2 flex justify-between items-center bg-gray-50 rounded-md">
                                    <div>
                                        <p className="font-semibold text-sm">{learner.name}</p>
                                        <p className="text-xs text-subtle">{learner.email}</p>
                                    </div>
                                    <Button size="sm" variant="ghost" onClick={() => enrollLearnerInClass(selectedCourseId, learner.email)}>Enroll</Button>
                                </div>
                            ))}
                        </div>
                        <div className="text-center p-4 border-2 border-dashed rounded-md mt-4">
                            <p className="text-subtle text-sm mb-2">Can't find a learner?</p>
                            <Button size="sm" onClick={() => setIsAddingLearner(true)} disabled={!selectedCourseId}>
                                + Add New Learner Profile
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4">Currently Enrolled ({selectedCourse?.learners?.length || 0})</h3>
                        <div className="max-h-[22rem] overflow-y-auto space-y-2">
                            {selectedCourse && selectedCourse.learners && selectedCourse.learners.length > 0 ? (
                                selectedCourse.learners.map(learner => (
                                    <div key={learner.email} className="p-2 flex justify-between items-center bg-blue-50 rounded-md">
                                        <div>
                                            <p className="font-semibold text-sm">{learner.name}</p>
                                            <p className="text-xs text-subtle">{learner.email}</p>
                                        </div>
                                        <Button size="sm" variant="danger" onClick={() => unenrollLearnerFromClass(selectedCourseId, learner.email)}>Remove</Button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-subtle py-10">Select a class to see enrolled learners.</p>
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export const AssignTrainerView: React.FC = () => {
    const { courses, updateCourse } = useLms();
    const allTrainers = MOCK_TRAINERS;

    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [selectedTrainerName, setSelectedTrainerName] = useState<string>('');
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const selectedCourse = useMemo(() => {
        return courses.find(c => c.id === selectedCourseId);
    }, [courses, selectedCourseId]);

    // Effect to update the trainer dropdown when a course is selected
    useEffect(() => {
        if (selectedCourse) {
            setSelectedTrainerName(selectedCourse.trainer);
        } else {
            setSelectedTrainerName('');
        }
    }, [selectedCourse]);

    const handleAssignTrainer = async () => {
        if (!selectedCourse || !selectedTrainerName) {
            setStatusMessage("Please select both a class and a trainer.");
            return;
        }

        setIsLoading(true);
        setStatusMessage(null);

        try {
            const updatedCourse = { ...selectedCourse, trainer: selectedTrainerName };
            await updateCourse(updatedCourse);
            setStatusMessage(`Successfully assigned ${selectedTrainerName} to ${selectedCourse.title}.`);
            
            setTimeout(() => setStatusMessage(null), 3000);

        } catch (error) {
            console.error("Failed to assign trainer:", error);
            setStatusMessage("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Assign Trainer to a Class</h2>
            <Card className="p-6 max-w-2xl mx-auto">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="class-select" className="block text-lg font-bold text-gray-700 mb-2">
                            1. Select a Class
                        </label>
                        <select
                            id="class-select"
                            value={selectedCourseId}
                            onChange={e => setSelectedCourseId(e.target.value)}
                            className={inputClasses}
                        >
                            <option value="" disabled>-- Choose a class --</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.title} ({course.courseRunId})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedCourse && (
                        <>
                            <div className="p-4 bg-gray-50 rounded-md border text-sm">
                                <p className="text-subtle">Current Trainer</p>
                                <p className="font-semibold text-lg">{selectedCourse.trainer || 'Not Assigned'}</p>
                            </div>

                            <div>
                                <label htmlFor="trainer-select" className="block text-lg font-bold text-gray-700 mb-2">
                                    2. Assign a New Trainer
                                </label>
                                <select
                                    id="trainer-select"
                                    value={selectedTrainerName}
                                    onChange={e => setSelectedTrainerName(e.target.value)}
                                    className={inputClasses}
                                >
                                    <option value="" disabled>-- Choose a trainer --</option>
                                    {allTrainers.map(trainer => (
                                        <option key={trainer.loginId} value={trainer.name}>
                                            {trainer.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Button
                                onClick={handleAssignTrainer}
                                disabled={isLoading || !selectedCourseId || !selectedTrainerName || selectedTrainerName === selectedCourse.trainer}
                                className="w-full"
                            >
                                {isLoading ? <Spinner size="sm" /> : 'Assign Trainer'}
                            </Button>

                            {statusMessage && (
                                <p className="text-center font-semibold text-green-600">
                                    {statusMessage}
                                </p>
                            )}
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
};