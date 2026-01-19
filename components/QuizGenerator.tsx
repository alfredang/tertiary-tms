
import React, { useState } from 'react';
import { useLms } from '../hooks/useLms';
import { generateQuiz } from '../services/geminiService';
import { Button } from './common/Button';
import Spinner from './common/Spinner';
import { Card } from './common/Card';
import { Quiz } from '../types';

const QuizGenerator: React.FC = () => {
  const { courses, addQuizToCourse } = useLms();
  const [topic, setTopic] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedQuiz, setLocalGeneratedQuiz] = useState<Quiz | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [promptTemplate, setPromptTemplate] = useState('');

  const handleGenerateQuiz = async () => {
    if (!selectedCourseId) {
      setError('Please select a course.');
      return;
    }
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setLocalGeneratedQuiz(null);

    const course = courses.find(c => c.id === selectedCourseId);
    let processedPrompt = promptTemplate;
    if (course) {
        processedPrompt = processedPrompt.replace(/{{course\.title}}/g, course.title);
    }
    processedPrompt = processedPrompt.replace(/{{topic}}/g, topic);

    try {
      const quiz = await generateQuiz(topic, processedPrompt);
      if (quiz) {
        await addQuizToCourse(selectedCourseId, quiz);
        setLocalGeneratedQuiz(quiz);
        // Find course from local state which should be up to date
        const course = courses.find(c => c.id === selectedCourseId);
        setSuccessMessage(`Quiz successfully generated and added to "${course?.title}"!`);
      } else {
        setError('Failed to generate quiz. The AI model might be unavailable.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
        <h3 className="text-2xl font-bold mb-6">Generate a Quiz for a Course</h3>
        <div className="space-y-6">
          <div>
            <label htmlFor="course-select" className="block text-lg font-medium text-gray-700">
              1. Select Course
            </label>
            <select
              id="course-select"
              value={selectedCourseId}
              onChange={e => setSelectedCourseId(e.target.value)}
              className="mt-1 block w-full px-4 py-2 text-on-surface bg-surface border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
            >
              <option value="" disabled>-- Choose a course --</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="topic" className="block text-lg font-medium text-gray-700">
              2. Quiz Topic
            </label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g., 'React Hooks' or 'JavaScript Promises'"
              className="mt-1 block w-full px-4 py-2 text-on-surface bg-surface border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
            />
          </div>
           <div>
                <label htmlFor="prompt-template-quiz" className="block text-lg font-medium text-gray-700">
                    3. Prompt Template / Instruction (Optional)
                </label>
                <textarea
                    id="prompt-template-quiz"
                    value={promptTemplate}
                    onChange={e => setPromptTemplate(e.target.value)}
                    placeholder="e.g., 'Focus on practical application questions.' or 'Ensure the options are tricky.'"
                    className="mt-1 block w-full px-4 py-2 text-on-surface bg-surface border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm h-24"
                />
                <p className="mt-2 text-xs text-subtle">
                    Available variables: <code className="bg-gray-200 px-1 rounded-md">{'{'}{'{'}course.title{'}'}{'}'}</code>, <code className="bg-gray-200 px-1 rounded-md">{'{'}{'{'}topic{'}'}{'}'}</code>
                </p>
            </div>
          <Button onClick={handleGenerateQuiz} disabled={isLoading || !selectedCourseId}>
            {isLoading ? 'Generating...' : 'Generate Quiz'}
          </Button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {successMessage && <p className="text-green-600 font-semibold mt-2">{successMessage}</p>}
        </div>

      {isLoading && (
        <div className="mt-8 flex justify-center">
            <Spinner text="The AI is creating your quiz..." />
        </div>
       )}

      {generatedQuiz && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-4">Generated Quiz Preview: {generatedQuiz.topic}</h3>
          <Card className="p-6 space-y-4">
            {generatedQuiz.questions.map((q, index) => (
              <div key={index} className="p-4 border rounded-md bg-gray-50">
                <p className="font-semibold">{index + 1}. {q.question}</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-subtle">
                  {q.options.map((opt, i) => (
                    <li key={i} className={opt === q.correctAnswer ? '!text-green-600 font-bold' : ''}>
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Card>
        </div>
      )}
    </Card>
  );
};

export default QuizGenerator;
