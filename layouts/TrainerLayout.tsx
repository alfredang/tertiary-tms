

import React from 'react';
import Header from '../components/Header';
import AiChatbot from '../components/AiChatbot';
import { useLms } from '../hooks/useLms';
import { View } from '../types';
import WelcomeDashboard from '../components/WelcomeDashboard';
import CourseList from '../components/CourseList';
import CalendarView from '../components/CalendarView';
import CourseDetail from '../components/CourseDetail';
import CreateView from '../components/CreateView';
import ProfileView from '../components/ProfileView';
import HelpAndSupportView from '../components/HelpAndSupportView';
import { Icon, IconName } from '../components/common/Icon';

const TrainerLayout: React.FC = () => {
  const { currentView, selectedCourse, createViewKey, setIsCourseMenuOpen } = useLms();

  const renderContent = () => {
    if (currentView === View.Profile) {
      return <ProfileView />;
    }
    if (currentView === View.HelpAndSupport) {
      return <HelpAndSupportView />;
    }
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
      case View.Create:
        return <CreateView key={createViewKey} />;
      default:
        return <WelcomeDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-on-surface">
      <Header />
      {selectedCourse && (
        <div className="lg:hidden flex items-center gap-4 px-4 sm:px-6 py-3 border-b border-gray-200 bg-surface">
            <button onClick={() => setIsCourseMenuOpen(true)} className="p-2 -ml-2 text-gray-600 hover:text-gray-900">
                <Icon name={IconName.Menu} className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold truncate">{selectedCourse.title}</h2>
        </div>
      )}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
      <AiChatbot />
    </div>
  );
};
export default TrainerLayout;
