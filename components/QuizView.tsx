

import React, { useState } from 'react';
import { useLms } from '../hooks/useLms';
import { Button } from './common/Button';
import { Quiz } from '../types';

interface QuizViewProps {
  quiz: Quiz;
}

const QuizView: React.FC<QuizViewProps> = ({ quiz }) => {
  const { addPoints, trainingProviderProfile } = useLms();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  if (!quiz) {
    return <p className="text-subtle">No quiz available.</p>;
  }

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmit = () => {
    let currentScore = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        currentScore++;
      }
    });
    const finalScore = (currentScore / quiz.questions.length) * 100;
    setScore(finalScore);
    if (trainingProviderProfile.gamingSettings.enablePoints) {
      addPoints(currentScore * 10); // 10 points per correct answer
    }
    setSubmitted(true);
  };
  
  const getOptionClasses = (option: string, questionIndex: number, correctAnswer: string) => {
      if (!submitted) return 'hover:bg-gray-100';
      if (option === correctAnswer) return 'bg-green-100 border-green-500 text-green-800';
      if (answers[questionIndex] === option && option !== correctAnswer) return 'bg-red-100 border-red-500 text-red-800';
      return 'border-gray-300';
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">{quiz.topic} Quiz</h3>
      {submitted ? (
        <div className="text-center p-6 bg-blue-50 rounded-lg">
          <h4 className="text-2xl font-bold text-primary">Quiz Complete!</h4>
          <p className="text-lg mt-2">Your score: <span className="font-bold">{score.toFixed(0)}%</span></p>
          {trainingProviderProfile.gamingSettings.enablePoints && (
            <p className="text-lg mt-1">You earned <span className="font-bold text-secondary">{score / 10 * 10}</span> points!</p>
          )}
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="space-y-6">
            {quiz.questions.map((q, index) => (
              <div key={index}>
                <p className="font-semibold mb-2">{index + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map(option => (
                    <label key={option} className={`block p-3 rounded-md border transition-colors duration-200 cursor-pointer ${getOptionClasses(option, index, q.correctAnswer)}`}>
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        onChange={() => handleAnswerChange(index, option)}
                        className="mr-2"
                        disabled={submitted}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Button type="submit" className="mt-6 w-full" disabled={submitted}>
            Submit Answers
          </Button>
        </form>
      )}
    </div>
  );
};

export default QuizView;