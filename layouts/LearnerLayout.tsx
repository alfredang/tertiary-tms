import React from 'react';
import Header from '../components/Header';
import AiChatbot from '../components/AiChatbot';
import { useLms } from '../hooks/useLms';
import { View } from '../types';
import WelcomeDashboard from '../components/WelcomeDashboard';
import CourseList from '../components/CourseList';
import CourseDetail from '../components/CourseDetail';
import CalendarView from '../components/CalendarView';

const TraineeLayout: React.FC = () => {
  const { currentView, selectedCourse } = useLms();

  const renderContent = () => {
    if (selectedCourse) {
      return <CourseDetail />;
    }
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
export default TraineeLayout;