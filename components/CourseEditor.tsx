import React, { useState } from 'react';
import { useLms } from '../hooks/useLms';
import { Course, Topic, Subtopic, Assessment, AssessmentCategory, IconName, ModeOfLearning, CourseType, UserRole } from '../types';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { Icon } from './common/Icon';
import Spinner from './common/Spinner';
import { generateCourseImage } from '../services/geminiService';

const inputGhostClasses = (isTitle: boolean) => 
    `flex-grow border border-transparent hover:border-gray-300 focus:border-gray-300 rounded-md px-2 py-1 bg-transparent hover:bg-gray-50 focus:bg-gray-50 focus:outline-none w-full transition-colors ${isTitle ? 'font-bold text-xl' : 'text-base'}`;

// Sub-component for an editable Learning Unit (Topic)
const EditableTopicAccordion: React.FC<{
    topic: Topic;
    onUpdateTitle: (topicId: string, newTitle: string) => void;
    onDelete: (topicId: string) => void;
    onAddSubtopic: (topicId: string) => void;
    onUpdateSubtopic: (topicId: string, subtopicId: string, newTitle: string) => void;
    onDeleteSubtopic: (topicId: string, subtopicId: string) => void;
    // Drag-and-drop props for subtopics
    draggedSubtopic: { topicId: string; subtopicId: string } | null;
    dropTargetSubtopic: { topicId: string; subtopicId: string } | null;
    onSubtopicDragStart: (e: React.DragEvent, topicId: string, subtopicId: string) => void;
    onSubtopicDrop: (e: React.DragEvent, topicId: string, subtopicId: string) => void;
    onSubtopicDragOver: (e: React.DragEvent, topicId: string, subtopicId: string) => void;
    onSubtopicDragLeave: (e: React.DragEvent) => void;
    onSubtopicDragEnd: (e: React.DragEvent) => void;
    // Drag-and-drop props for the topic itself
    onSelfDragStart: (e: React.DragEvent) => void;
    onSelfDragEnd: (e: React.DragEvent) => void;
}> = ({ 
    topic, onUpdateTitle, onDelete, onAddSubtopic, onUpdateSubtopic, onDeleteSubtopic,
    draggedSubtopic, dropTargetSubtopic, onSubtopicDragStart, onSubtopicDrop, onSubtopicDragOver, onSubtopicDragLeave, onSubtopicDragEnd,
    onSelfDragStart, onSelfDragEnd
}) => {
    const [isSubtopicsOpen, setSubtopicsOpen] = useState(true);
    
    return (
        <Card className="p-0 overflow-hidden bg-white">
            {/* Learning Unit Header */}
            <div className="p-4 flex items-center justify-between gap-2 bg-gray-50 border-b">
                <div
                    draggable
                    onDragStart={onSelfDragStart}
                    onDragEnd={onSelfDragEnd}
                    className="cursor-grab p-1"
                >
                    <Icon name={IconName.DragHandle} className="w-5 h-5 text-gray-400" />
                </div>
                 <input 
                    type="text" 
                    value={topic.title}
                    onChange={e => onUpdateTitle(topic.id, e.target.value)}
                    className={inputGhostClasses(true)}
                    placeholder="Learning Unit Title (e.g., Introduction to React)"
                />
                <div className="flex items-center ml-auto flex-shrink-0">
                    <button onClick={() => setSubtopicsOpen(!isSubtopicsOpen)} className="p-1.5 text-subtle hover:bg-gray-200 rounded-full">
                        <Icon name={IconName.ChevronDown} className={`w-5 h-5 transition-transform ${isSubtopicsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <button onClick={() => onDelete(topic.id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-full">
                        <Icon name={IconName.Delete} className="w-5 h-5"/>
                    </button>
                </div>
            </div>

            {/* Subtopics (Topics within Learning Unit) */}
            {isSubtopicsOpen && (
                <div className="px-4 pb-4">
                    <ul className="pt-2 space-y-2">
                        {topic.subtopics.map(subtopic => (
                            <li 
                                key={subtopic.id}
                                onDragOver={(e) => onSubtopicDragOver(e, topic.id, subtopic.id)}
                                onDragLeave={onSubtopicDragLeave}
                                onDrop={(e) => onSubtopicDrop(e, topic.id, subtopic.id)}
                                className={`relative flex items-center justify-between p-1 rounded-md group transition-all duration-200 ${
                                    draggedSubtopic?.subtopicId === subtopic.id ? 'opacity-30' : 'hover:bg-gray-100/70'
                                } ${
                                    dropTargetSubtopic?.subtopicId === subtopic.id ? 'pt-2 border-t-2 border-primary' : 'border-t-2 border-transparent'
                                }`}
                            >
                                <div
                                    draggable
                                    onDragStart={(e) => onSubtopicDragStart(e, topic.id, subtopic.id)}
                                    onDragEnd={onSubtopicDragEnd}
                                    className="cursor-grab p-1"
                                >
                                    <Icon name={IconName.DragHandle} className="w-5 h-5 text-gray-400" />
                                </div>
                                <Icon name={IconName.FilePdf} className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                                <input 
                                    type="text"
                                    value={subtopic.title}
                                    onChange={e => onUpdateSubtopic(topic.id, subtopic.id, e.target.value)}
                                    className={inputGhostClasses(false)}
                                    placeholder="Topic title"
                                />
                                <button onClick={() => onDeleteSubtopic(topic.id, subtopic.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Icon name={IconName.Delete} className="w-4 h-4"/>
                                </button>
                            </li>
                        ))}
                         <li className="pt-2">
                            <Button size="sm" variant="ghost" onClick={() => onAddSubtopic(topic.id)} leftIcon={<Icon name={IconName.Add} className="w-4 h-4"/>}>
                                Add Topic
                            </Button>
                        </li>
                    </ul>
                </div>
            )}
        </Card>
    );
};


const CourseEditor: React.FC = () => {
    const { editingCourse, setEditingCourse, addCourse, updateCourse, role } = useLms();
    
    if (!editingCourse) {
        return <div className="flex items-center justify-center h-full"><Spinner text="Loading course editor..." /></div>;
    }

    const [course, setCourse] = useState<Course>(editingCourse);
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    
    // Drag and Drop state for Topics (Learning Units)
    const [draggedTopicId, setDraggedTopicId] = useState<string | null>(null);
    const [dropTargetTopicId, setDropTargetTopicId] = useState<string | null>(null);

    // Drag and Drop state for Subtopics
    const [draggedSubtopic, setDraggedSubtopic] = useState<{ topicId: string; subtopicId: string } | null>(null);
    const [dropTargetSubtopic, setDropTargetSubtopic] = useState<{ topicId: string; subtopicId: string } | null>(null);

    const isNewCourse = !course.id;

    const isTrainerSlidesUrl = course.trainerSlidesUrl && (course.trainerSlidesUrl.startsWith('http://') || course.trainerSlidesUrl.startsWith('https://'));
    const [trainerSlideInputType, setTrainerSlideInputType] = useState<'upload' | 'link'>(isTrainerSlidesUrl ? 'link' : 'upload');

    // --- Topic Drag Handlers ---
    const handleTopicDragStart = (e: React.DragEvent, topicId: string) => {
        setDraggedTopicId(topicId);
        e.dataTransfer.effectAllowed = 'move';
    };
    const handleTopicDragOver = (e: React.DragEvent, topicId: string) => {
        e.preventDefault();
        if (topicId !== draggedTopicId) {
            setDropTargetTopicId(topicId);
        }
    };
    const handleTopicDragLeave = () => {
        setDropTargetTopicId(null);
    };
    const handleTopicDrop = (e: React.DragEvent, dropTargetTopicId: string) => {
        e.preventDefault();
        if (!draggedTopicId || draggedTopicId === dropTargetTopicId) return;

        const fromIndex = course.topics.findIndex(t => t.id === draggedTopicId);
        const toIndex = course.topics.findIndex(t => t.id === dropTargetTopicId);

        if (fromIndex !== -1 && toIndex !== -1) {
            const newTopics = [...course.topics];
            const [removed] = newTopics.splice(fromIndex, 1);
            newTopics.splice(toIndex, 0, removed);
            setCourse(prev => ({ ...prev, topics: newTopics }));
        }
    };
    const handleTopicDragEnd = () => {
        setDraggedTopicId(null);
        setDropTargetTopicId(null);
    };

    // --- Subtopic Drag Handlers ---
    const handleSubtopicDragStart = (e: React.DragEvent, topicId: string, subtopicId: string) => {
        e.stopPropagation();
        setDraggedSubtopic({ topicId, subtopicId });
        e.dataTransfer.effectAllowed = 'move';
    };
    const handleSubtopicDragOver = (e: React.DragEvent, topicId: string, subtopicId: string) => {
        e.stopPropagation();
        e.preventDefault();
        if (draggedSubtopic && draggedSubtopic.topicId === topicId && draggedSubtopic.subtopicId !== subtopicId) {
            setDropTargetSubtopic({ topicId, subtopicId });
        }
    };
    const handleSubtopicDragLeave = (e: React.DragEvent) => {
        e.stopPropagation();
        setDropTargetSubtopic(null);
    };
    const handleSubtopicDrop = (e: React.DragEvent, dropTargetTopicId: string, dropTargetSubtopicId: string) => {
        e.stopPropagation();
        e.preventDefault();
        if (!draggedSubtopic || draggedSubtopic.topicId !== dropTargetTopicId || draggedSubtopic.subtopicId === dropTargetSubtopicId) return;

        setCourse(prev => {
            const newTopics = [...prev.topics];
            const topicIndex = newTopics.findIndex(t => t.id === draggedSubtopic.topicId);
            if (topicIndex === -1) return prev;

            const topic = { ...newTopics[topicIndex] };
            const newSubtopics = [...topic.subtopics];

            const fromIndex = newSubtopics.findIndex(st => st.id === draggedSubtopic.subtopicId);
            const toIndex = newSubtopics.findIndex(st => st.id === dropTargetSubtopicId);

            if (fromIndex !== -1 && toIndex !== -1) {
                const [removed] = newSubtopics.splice(fromIndex, 1);
                newSubtopics.splice(toIndex, 0, removed);
                topic.subtopics = newSubtopics;
                newTopics[topicIndex] = topic;
                return { ...prev, topics: newTopics };
            }
            return prev;
        });
    };
    const handleSubtopicDragEnd = (e: React.DragEvent) => {
        e.stopPropagation();
        setDraggedSubtopic(null);
        setDropTargetSubtopic(null);
    };

    const handleCourseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'number') {
            setCourse({ ...course, [name]: parseFloat(value) || 0 });
        } else {
            setCourse({ ...course, [name]: value });
        }
    };

    const handleModeOfLearningChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        const mode = value as ModeOfLearning;
        
        setCourse(prev => {
            const currentModes = prev.modeOfLearning || [];
            if (checked) {
                return { ...prev, modeOfLearning: [...new Set([...currentModes, mode])] };
            } else {
                return { ...prev, modeOfLearning: currentModes.filter(m => m !== mode) };
            }
        });
    };

    const handleRegenerateImage = async () => {
        setIsGeneratingImage(true);
        const newImageUrl = await generateCourseImage(course.title, course.learningOutcomes);
        if (newImageUrl) {
            setCourse({ ...course, imageUrl: newImageUrl });
        } else {
            alert("Failed to generate a new image. Please try again.");
        }
        setIsGeneratingImage(false);
    };

    const handleSaveCourse = async () => {
        setIsSaving(true);
        try {
            if (isNewCourse) {
                const createdCourse = await addCourse(course);
                setCourse(createdCourse);
            } else {
                await updateCourse(course);
            }
            setEditingCourse(null);
        } catch (error) {
            console.error("Failed to save course", error);
        } finally {
            setIsSaving(false);
        }
    };
    
    const addTopic = () => {
        const newTopic: Topic = { id: `t_${Date.now()}`, title: 'New Learning Unit', subtopics: [] };
        setCourse({ ...course, topics: [...course.topics, newTopic] });
    };

    const updateTopicTitle = (topicId: string, newTitle: string) => {
        setCourse(prev => ({ ...prev, topics: prev.topics.map(t => t.id === topicId ? { ...t, title: newTitle } : t) }));
    };
    
    const deleteTopic = (topicId: string) => {
        setCourse(prev => ({ ...prev, topics: prev.topics.filter(t => t.id !== topicId) }));
    };

    const addSubtopic = (topicId: string) => {
        const newSubtopic: Subtopic = { id: `st_${Date.now()}`, title: 'New Topic', content: '' };
        setCourse(prev => ({
            ...prev,
            topics: prev.topics.map(t => t.id === topicId ? { ...t, subtopics: [...t.subtopics, newSubtopic] } : t)
        }));
    };

    const updateSubtopic = (topicId: string, subtopicId: string, newTitle: string) => {
        setCourse(prev => ({
            ...prev,
            topics: prev.topics.map(t => t.id === topicId ? { ...t, subtopics: t.subtopics.map(st => st.id === subtopicId ? { ...st, title: newTitle } : st) } : t)
        }));
    };
    
    const deleteSubtopic = (topicId: string, subtopicId: string) => {
        setCourse(prev => ({
            ...prev,
            topics: prev.topics.map(t => t.id === topicId ? { ...t, subtopics: t.subtopics.filter(st => st.id !== subtopicId) } : t)
        }));
    };

    const handleAddAssessment = () => {
        const newAssessment: Assessment = { id: `asm_${Date.now()}`, title: 'New Assessment', category: AssessmentCategory.PracticalExam, status: 'Draft' };
        setCourse(prev => ({ ...prev, assessments: [...(prev.assessments || []), newAssessment] }));
    };
    
    const handleUpdateAssessment = (id: string, field: 'title' | 'category' | 'fileUrl', value: string) => {
         setCourse(prev => ({...prev, assessments: prev.assessments?.map(a => a.id === id ? {...a, [field]: value} : a) }));
    }

    const handleDeleteAssessment = (assessmentId: string) => {
        setCourse(prev => ({ ...prev, assessments: prev.assessments?.filter(a => a.id !== assessmentId) }));
    };

    const handleAssessmentFileChange = (e: React.ChangeEvent<HTMLInputElement>, assessmentId: string) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const mockUrl = `/mock-data/assessments/${file.name}`;
            handleUpdateAssessment(assessmentId, 'fileUrl', mockUrl);
        }
    };


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'learnerGuideUrl' | 'slidesUrl' | 'lessonPlanUrl' | 'facilitatorGuideUrl' | 'assessmentPlanUrl' | 'trainerSlidesUrl') => {
        if (e.target.files && e.target.files[0]) {
            // In a real app, you would upload the file and get a URL.
            // For this mock, we'll just store the file name to simulate it.
            const mockUrl = `/mock-data/${e.target.files[0].name}`;
            setCourse(prev => ({ ...prev, [field]: mockUrl }));
        }
    };

    const inputClasses = "block w-full px-3 py-2 text-on-surface bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold">Edit Course</h2>
                <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button variant="ghost" onClick={() => setEditingCourse(null)}>Cancel</Button>
                    <Button onClick={handleSaveCourse} disabled={isSaving}>
                        {isSaving ? <Spinner size="sm" /> : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {/* Main two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Column: Course Details */}
                <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4">Course Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Course Image</label>
                                <div className="relative aspect-video bg-gray-200 rounded-md overflow-hidden">
                                    <img 
                                        src={course.imageUrl || `https://picsum.photos/seed/${course.id || 'new'}/400/225`} 
                                        alt={course.title} 
                                        className="w-full h-full object-cover" 
                                    />
                                    {isGeneratingImage && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <Spinner text="Generating..." />
                                        </div>
                                    )}
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="w-full mt-2" 
                                    onClick={handleRegenerateImage}
                                    disabled={isGeneratingImage}
                                >
                                    {isGeneratingImage ? 'Generating...' : 'Regenerate Image with AI'}
                                </Button>
                            </div>

                            <div>
                                <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-1">Course Title</label>
                                <input type="text" id="title" name="title" value={course.title} onChange={handleCourseChange} className={inputClasses} placeholder="e.g. React for Beginners"/>
                            </div>
                             <div>
                                <label htmlFor="courseCode" className="block text-sm font-bold text-gray-700 mb-1">Course Code</label>
                                <input type="text" id="courseCode" name="courseCode" value={course.courseCode} onChange={handleCourseChange} className={inputClasses} placeholder="e.g. CRS-Q-0041188-1"/>
                            </div>
                            <div>
                                <label htmlFor="tscTitle" className="block text-sm font-bold text-gray-700 mb-1">TSC Title</label>
                                <input type="text" id="tscTitle" name="tscTitle" value={course.tscTitle} onChange={handleCourseChange} className={inputClasses} placeholder="e.g. Web Development"/>
                            </div>
                            <div>
                                <label htmlFor="tscCode" className="block text-sm font-bold text-gray-700 mb-1">TSC Code</label>
                                <input type="text" id="tscCode" name="tscCode" value={course.tscCode} onChange={handleCourseChange} className={inputClasses} placeholder="e.g. ICT-DIT-3011-1.1"/>
                            </div>
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Duration</label>
                                <div className="space-y-2 border border-gray-200 p-3 rounded-md bg-gray-50/50">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="trainingHours" className="block text-xs font-medium text-gray-600 mb-1">Training Hours</label>
                                            <input type="number" id="trainingHours" name="trainingHours" value={course.trainingHours} onChange={handleCourseChange} className={inputClasses} />
                                        </div>
                                        <div>
                                            <label htmlFor="assessmentHours" className="block text-xs font-medium text-gray-600 mb-1">Assessment Hours</label>
                                            <input type="number" id="assessmentHours" name="assessmentHours" value={course.assessmentHours} onChange={handleCourseChange} className={inputClasses} />
                                        </div>
                                    </div>
                                    <div className="pt-2 text-right">
                                        <p className="text-sm font-bold text-gray-800">
                                            Total Duration: <span className="text-primary font-bold">{course.trainingHours + course.assessmentHours} hours</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Mode of Learning</label>
                                <div className="flex flex-col space-y-2">
                                    {(Object.values(ModeOfLearning)).map((mode) => (
                                         <div key={mode} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`mode-${mode}`}
                                                name="modeOfLearning"
                                                value={mode}
                                                checked={course.modeOfLearning.includes(mode)}
                                                onChange={handleModeOfLearningChange}
                                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                            />
                                            <label htmlFor={`mode-${mode}`} className="ml-3 block text-sm text-gray-900">
                                                {mode}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="courseType" className="block text-sm font-bold text-gray-700 mb-2">Course Type</label>
                                <select 
                                    id="courseType" 
                                    name="courseType" 
                                    value={course.courseType} 
                                    onChange={handleCourseChange} 
                                    className={inputClasses}
                                >
                                    {Object.values(CourseType).map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Content Sections */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4">Learning Outcomes</h3>
                        <textarea id="learningOutcomes" name="learningOutcomes" value={course.learningOutcomes} onChange={handleCourseChange} className={`${inputClasses} h-32`} placeholder="Describe the key learning outcomes..."/>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4">Lesson Plan</h3>
                        <div>
                            <label htmlFor="lessonPlanUpload" className="block text-sm font-bold text-gray-700 mb-1">Upload Lesson Plan (PDF)</label>
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border">
                                <Icon name={IconName.FilePdf} className="w-5 h-5 text-gray-500" />
                                <span className="text-sm text-subtle flex-grow truncate">{course.lessonPlanUrl ? course.lessonPlanUrl.split('/').pop() : 'No lesson plan uploaded.'}</span>
                                <Button variant="ghost" size="sm" onClick={() => document.getElementById('lessonPlanUpload')?.click()}>
                                    <Icon name={IconName.Upload} className="w-4 h-4 mr-1"/> Upload
                                </Button>
                                <input 
                                    type="file" 
                                    id="lessonPlanUpload" 
                                    className="hidden" 
                                    accept=".pdf"
                                    onChange={(e) => handleFileChange(e, 'lessonPlanUrl')} 
                                />
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4">Learner Guide</h3>
                        <div>
                            <label htmlFor="learnerGuideUpload" className="block text-sm font-bold text-gray-700 mb-1">Upload Learner Guide (PDF)</label>
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border">
                                <Icon name={IconName.FilePdf} className="w-5 h-5 text-gray-500" />
                                <span className="text-sm text-subtle flex-grow truncate">{course.learnerGuideUrl ? course.learnerGuideUrl.split('/').pop() : 'No guide uploaded.'}</span>
                                <Button variant="ghost" size="sm" onClick={() => document.getElementById('learnerGuideUpload')?.click()}>
                                    <Icon name={IconName.Upload} className="w-4 h-4 mr-1"/> Upload
                                </Button>
                                <input 
                                    type="file" 
                                    id="learnerGuideUpload" 
                                    className="hidden" 
                                    accept=".pdf"
                                    onChange={(e) => handleFileChange(e, 'learnerGuideUrl')} 
                                />
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4">Facilitator Guide</h3>
                        <div>
                            <label htmlFor="facilitatorGuideUpload" className="block text-sm font-bold text-gray-700 mb-1">Upload Facilitator Guide (PDF)</label>
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border">
                                <Icon name={IconName.FilePdf} className="w-5 h-5 text-gray-500" />
                                <span className="text-sm text-subtle flex-grow truncate">{course.facilitatorGuideUrl ? course.facilitatorGuideUrl.split('/').pop() : 'No guide uploaded.'}</span>
                                <Button variant="ghost" size="sm" onClick={() => document.getElementById('facilitatorGuideUpload')?.click()}>
                                    <Icon name={IconName.Upload} className="w-4 h-4 mr-1"/> Upload
                                </Button>
                                <input 
                                    type="file" 
                                    id="facilitatorGuideUpload" 
                                    className="hidden" 
                                    accept=".pdf"
                                    onChange={(e) => handleFileChange(e, 'facilitatorGuideUrl')} 
                                />
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4">Assessment Plan</h3>
                        <div>
                            <label htmlFor="assessmentPlanUpload" className="block text-sm font-bold text-gray-700 mb-1">Upload Assessment Plan (PDF)</label>
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border">
                                <Icon name={IconName.FilePdf} className="w-5 h-5 text-gray-500" />
                                <span className="text-sm text-subtle flex-grow truncate">{course.assessmentPlanUrl ? course.assessmentPlanUrl.split('/').pop() : 'No assessment plan uploaded.'}</span>
                                <Button variant="ghost" size="sm" onClick={() => document.getElementById('assessmentPlanUpload')?.click()}>
                                    <Icon name={IconName.Upload} className="w-4 h-4 mr-1"/> Upload
                                </Button>
                                <input 
                                    type="file" 
                                    id="assessmentPlanUpload" 
                                    className="hidden" 
                                    accept=".pdf"
                                    onChange={(e) => handleFileChange(e, 'assessmentPlanUrl')} 
                                />
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4">Learner Slides</h3>
                        <div>
                            <label htmlFor="slidesUpload" className="block text-sm font-bold text-gray-700 mb-1">Upload Learner Slides (PDF)</label>
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border">
                                <Icon name={IconName.FilePdf} className="w-5 h-5 text-gray-500" />
                                <span className="text-sm text-subtle flex-grow truncate">{course.slidesUrl ? course.slidesUrl.split('/').pop() : 'No slides uploaded.'}</span>
                                <Button variant="ghost" size="sm" onClick={() => document.getElementById('slidesUpload')?.click()}>
                                    <Icon name={IconName.Upload} className="w-4 h-4 mr-1"/> Upload
                                </Button>
                                <input 
                                    type="file" 
                                    id="slidesUpload" 
                                    className="hidden" 
                                    accept=".pdf"
                                    onChange={(e) => handleFileChange(e, 'slidesUrl')} 
                                />
                            </div>
                        </div>
                    </Card>
                     <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4">Trainer Slides</h3>
                        <div className="flex gap-6 mb-4">
                             <div className="flex items-center">
                                <input type="radio" id="trainer-slide-upload" name="trainerSlideType" value="upload" checked={trainerSlideInputType === 'upload'} onChange={() => setTrainerSlideInputType('upload')} className="h-4 w-4 text-primary focus:ring-primary border-gray-300"/>
                                <label htmlFor="trainer-slide-upload" className="ml-2 block text-sm font-medium text-gray-700">Upload PPT</label>
                            </div>
                             <div className="flex items-center">
                                <input type="radio" id="trainer-slide-link" name="trainerSlideType" value="link" checked={trainerSlideInputType === 'link'} onChange={() => setTrainerSlideInputType('link')} className="h-4 w-4 text-primary focus:ring-primary border-gray-300"/>
                                <label htmlFor="trainer-slide-link" className="ml-2 block text-sm font-medium text-gray-700">Link to Google Slides</label>
                            </div>
                        </div>

                        {trainerSlideInputType === 'upload' ? (
                            <div>
                                <label htmlFor="trainerSlidesUpload" className="block text-sm font-bold text-gray-700 mb-1">Upload Trainer Slides (PPT/PPTX)</label>
                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border">
                                    <Icon name={IconName.FilePdf} className="w-5 h-5 text-gray-500" />
                                    <span className="text-sm text-subtle flex-grow truncate">{course.trainerSlidesUrl && !isTrainerSlidesUrl ? course.trainerSlidesUrl.split('/').pop() : 'No file uploaded.'}</span>
                                    <Button variant="ghost" size="sm" onClick={() => document.getElementById('trainerSlidesUpload')?.click()}>
                                        <Icon name={IconName.Upload} className="w-4 h-4 mr-1"/> Upload
                                    </Button>
                                    <input 
                                        type="file" 
                                        id="trainerSlidesUpload" 
                                        className="hidden" 
                                        accept=".ppt,.pptx"
                                        onChange={(e) => handleFileChange(e, 'trainerSlidesUrl')} 
                                    />
                                </div>
                            </div>
                        ) : (
                             <div>
                                <label htmlFor="trainerSlidesUrl" className="block text-sm font-bold text-gray-700 mb-1">Trainer Slides URL</label>
                                <input 
                                    type="url"
                                    id="trainerSlidesUrl"
                                    name="trainerSlidesUrl"
                                    value={isTrainerSlidesUrl ? course.trainerSlidesUrl : ''}
                                    onChange={handleCourseChange}
                                    className={inputClasses}
                                    placeholder="https://docs.google.com/presentation/..."
                                />
                            </div>
                        )}
                    </Card>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold px-1">Lesson</h3>
                        {course.topics.map(topic => (
                           <div
                                key={topic.id}
                                onDragOver={(e) => handleTopicDragOver(e, topic.id)}
                                onDragLeave={handleTopicDragLeave}
                                onDrop={(e) => handleTopicDrop(e, topic.id)}
                                className={`transition-opacity ${draggedTopicId === topic.id ? 'opacity-30' : ''}`}
                           >
                                <div className={`h-2 transition-all duration-200 ${dropTargetTopicId === topic.id ? 'border-t-4 border-primary' : 'border-t-0'}`}></div>
                                <EditableTopicAccordion 
                                    topic={topic}
                                    onUpdateTitle={updateTopicTitle}
                                    onDelete={deleteTopic}
                                    onAddSubtopic={addSubtopic}
                                    onUpdateSubtopic={updateSubtopic}
                                    onDeleteSubtopic={deleteSubtopic}
                                    onSelfDragStart={(e) => handleTopicDragStart(e, topic.id)}
                                    onSelfDragEnd={handleTopicDragEnd}
                                    draggedSubtopic={draggedSubtopic}
                                    dropTargetSubtopic={dropTargetSubtopic}
                                    onSubtopicDragStart={handleSubtopicDragStart}
                                    onSubtopicDrop={handleSubtopicDrop}
                                    onSubtopicDragOver={handleSubtopicDragOver}
                                    onSubtopicDragLeave={handleSubtopicDragLeave}
                                    onSubtopicDragEnd={handleSubtopicDragEnd}
                               />
                           </div>
                        ))}
                         <Button variant="ghost" onClick={addTopic} className="w-full !py-3 !text-lg !font-semibold border-2 border-dashed !border-gray-300 hover:!border-primary !text-subtle hover:!text-primary">
                            + Add Learning Unit
                        </Button>
                    </div>

                    <div className="space-y-4">
                         <h3 className="text-xl font-bold px-1">Assessment</h3>
                         <div className="space-y-4">
                            {(course.assessments || []).map(assessment => (
                                <Card key={assessment.id} className="p-4 relative group">
                                    <button onClick={() => handleDeleteAssessment(assessment.id)} className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <Icon name={IconName.Delete} className="w-4 h-4" />
                                    </button>
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <Icon name={IconName.ClipboardCheck} className="w-5 h-5 text-primary flex-shrink-0 hidden sm:block" />
                                        <input 
                                            type="text" 
                                            value={assessment.title}
                                            onChange={(e) => handleUpdateAssessment(assessment.id, 'title', e.target.value)}
                                            className={`${inputGhostClasses(false)} !font-semibold flex-grow`}
                                            placeholder="Assessment Title"
                                        />
                                        <select 
                                            value={assessment.category}
                                            onChange={(e) => handleUpdateAssessment(assessment.id, 'category', e.target.value)}
                                            className="text-sm font-medium bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full border-transparent focus:border-indigo-300 focus:ring-indigo-300 w-full sm:w-auto"
                                        >
                                            {Object.values(AssessmentCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>
                                    <div className="mt-4 pt-4 border-t">
                                        <label htmlFor={`assessment-upload-${assessment.id}`} className="block text-sm font-bold text-gray-700 mb-1">Assessment File (e.g., Word Doc)</label>
                                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border">
                                            <Icon name={IconName.FilePdf} className="w-5 h-5 text-gray-500" />
                                            <span className="text-sm text-subtle flex-grow truncate">{assessment.fileUrl ? assessment.fileUrl.split('/').pop() : 'No file uploaded.'}</span>
                                            <Button variant="ghost" size="sm" onClick={() => document.getElementById(`assessment-upload-${assessment.id}`)?.click()}>
                                                <Icon name={IconName.Upload} className="w-4 h-4 mr-1"/> Upload
                                            </Button>
                                            <input 
                                                type="file" 
                                                id={`assessment-upload-${assessment.id}`} 
                                                className="hidden" 
                                                accept=".doc,.docx,.pdf"
                                                onChange={(e) => handleAssessmentFileChange(e, assessment.id)} 
                                            />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {course.assessments?.length === 0 && <p className="text-subtle text-center py-4">No assessments added yet.</p>}
                            <Button variant="ghost" onClick={handleAddAssessment} className="w-full !py-3 !text-lg !font-semibold border-2 border-dashed !border-gray-300 hover:!border-primary !text-subtle hover:!text-primary">
                               + Add Assessment
                            </Button>
                         </div>
                    </div>
                    
                    { (role === UserRole.Admin || role === UserRole.TrainingProvider) && (
                        <Card className="p-6">
                            <h3 className="text-xl font-bold mb-4">Pricing & Funding</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="courseFee" className="block text-sm font-bold text-gray-700 mb-1">Course Fee ($)</label>
                                    <input type="number" id="courseFee" name="courseFee" value={course.courseFee} onChange={handleCourseChange} className={inputClasses} placeholder="e.g. 500"/>
                                </div>
                                <div>
                                    <label htmlFor="taxPercent" className="block text-sm font-bold text-gray-700 mb-1">Tax / GST (%)</label>
                                    <input type="number" id="taxPercent" name="taxPercent" value={course.taxPercent} onChange={handleCourseChange} className={inputClasses} placeholder="e.g. 9"/>
                                </div>
                            </div>
                        </Card>
                    )}
                    
                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-4">Course Settings</h3>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md border">
                            <div>
                                <p className="font-semibold text-sm">Enable Gaming Leaderboard</p>
                                <p className="text-xs text-subtle">Allow learners to see a competitive leaderboard for this course.</p>
                            </div>
                            <button
                                onClick={() => setCourse(prev => ({...prev, isLeaderboardEnabled: !(prev.isLeaderboardEnabled ?? false) }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${(course.isLeaderboardEnabled ?? false) ? 'bg-primary' : 'bg-gray-200'}`}
                                aria-pressed={course.isLeaderboardEnabled ?? false}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${(course.isLeaderboardEnabled ?? false) ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CourseEditor;