
import React, { useState } from 'react';
import { useLms } from '../hooks/useLms';
import { generateProgressAnalysis, AnalyticsResult } from '../services/geminiService';
import { Button } from './common/Button';
import { Card } from './common/Card';
import Spinner from './common/Spinner';
import { Course } from '../types';

const AnalyticsView: React.FC = () => {
    const { courses } = useLms();
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [analysis, setAnalysis] = useState<AnalyticsResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateAnalysis = async () => {
        if (!selectedCourseId) {
            setError('Please select a course first.');
            return;
        }
        const course = courses.find(c => c.id === selectedCourseId);
        if (!course) {
            setError('Could not find selected course.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const result = await generateProgressAnalysis(course);
            if (result) {
                setAnalysis(result);
            } else {
                setError('Failed to generate analysis. The AI model may be unavailable or there is no learner data for this course.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const selectedCourse = courses.find(c => c.id === selectedCourseId);
    
    const calculateAverage = (learners: Course['learners'], key: 'progressPercent' | 'quizScore'): number => {
        if (!learners || learners.length === 0) return 0;
        
        const validLearners = key === 'quizScore' ? learners.filter(l => l.quizScore !== null) : learners;
        if (validLearners.length === 0) return NaN;

        const total = validLearners.reduce((acc, l) => acc + (l[key] ?? 0), 0);
        return Math.round(total / validLearners.length);
    }
    
    const avgProgress = calculateAverage(selectedCourse?.learners, 'progressPercent');
    const avgScore = calculateAverage(selectedCourse?.learners, 'quizScore');

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Learner Progress Analytics</h2>
            <Card className="p-6 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
                    <div className="flex-grow">
                        <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-1">
                            Select a Course
                        </label>
                        <select
                            id="course-select"
                            value={selectedCourseId}
                            onChange={(e) => {
                                setSelectedCourseId(e.target.value);
                                setAnalysis(null);
                                setError(null);
                            }}
                            className="block w-full px-4 py-2 text-on-surface bg-surface border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="" disabled>-- Choose a course --</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.title}</option>
                            ))}
                        </select>
                    </div>
                    <Button onClick={handleGenerateAnalysis} disabled={isLoading || !selectedCourseId} className="self-start sm:self-end">
                        {isLoading ? 'Analyzing...' : 'Generate AI Analysis'}
                    </Button>
                </div>
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </Card>

            {selectedCourse && !analysis && !isLoading && (
                 <Card className="p-6 mb-8">
                    <h3 className="text-xl font-bold mb-4">{selectedCourse.title} - At a Glance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-3xl font-bold">{selectedCourse.learners?.length ?? 0}</p>
                            <p className="text-subtle">Enrolled Learners</p>
                        </div>
                        <div>
                             <p className="text-3xl font-bold">{avgProgress}%</p>
                            <p className="text-subtle">Avg. Progress</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold">{isNaN(avgScore) ? 'N/A' : `${avgScore}%`}</p>
                            <p className="text-subtle">Avg. Quiz Score</p>
                        </div>
                    </div>
                 </Card>
            )}

            {isLoading && (
                <div className="mt-8 flex justify-center">
                    <Spinner text="AI is analyzing learner data..." size="lg" />
                </div>
            )}

            {analysis && (
                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-2xl font-bold mb-3 text-primary">Overall Summary</h3>
                        <p>{analysis.summary}</p>
                    </Card>

                    {analysis.strugglingLearners.length > 0 ? (
                        <Card className="p-6">
                            <h3 className="text-2xl font-bold mb-3 text-red-600">Learners Needing Attention</h3>
                            <ul className="space-y-3">
                                {analysis.strugglingLearners.map((learner, index) => (
                                    <li key={index} className="p-3 bg-red-50 rounded-md border border-red-200">
                                        <p className="font-bold">{learner.name}</p>
                                        <p className="text-sm text-subtle">{learner.reason}</p>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    ) : (
                         <Card className="p-6 bg-green-50 border border-green-200">
                            <h3 className="text-2xl font-bold mb-3 text-green-600">Great News!</h3>
                            <p>No learners appear to be struggling based on the current data. Keep up the great work!</p>
                        </Card>
                    )}

                    <Card className="p-6">
                        <h3 className="text-2xl font-bold mb-3 text-secondary">Trainer Recommendations</h3>
                        <ul className="list-disc list-inside space-y-2">
                            {analysis.recommendations.map((rec, index) => (
                                <li key={index}>{rec}</li>
                            ))}
                        </ul>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AnalyticsView;