import React from 'react';
import Header from '../components/Header';
import AiChatbot from '../components/AiChatbot';
import { useLms } from '../hooks/useLms';
import { View } from '../types';
import WelcomeDashboard from '../components/WelcomeDashboard';
import CourseList from '../components/CourseList';
import CalendarView from '../components/CalendarView';
import CourseDetail from '../components/CourseDetail';

const TrainerLayout: React.FC = () => {
  const { currentView, selectedCourse } = useLms();

  const renderContent = () => {
    // If a course is selected, show the detailed view.
    // The CourseDetail component itself will handle toggling the grading view.
    if (selectedCourse) {
      return <CourseDetail />;
    }

    // Default views when no course is selected
    switch (currentView) {
      case View.Dashboard:
        return <WelcomeDashboard />;
      case View.Courses:
        return <CourseList />;
      case View.Calendar:
        return <CalendarView />;
      default:
        return <WelcomeDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-on-surface">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
      <AiChatbot />
    </div>
  );
};
export default TrainerLayout;