

import React, { useState } from 'react';
import Header from '../components/Header';
import AiChatbot from '../components/AiChatbot';
import { useLms } from '../hooks/useLms';
import { AdminPage, View } from '../types';
import AdminDashboard from '../components/AdminView';
import CourseList from '../components/CourseList';
import CreateView from '../components/CreateView';
import CourseEditor from '../components/CourseEditor';
import AdminSidebar from '../components/admin/AdminSidebar';
import ViewTrainers from '../components/admin/ViewTrainers';
import CompletedClasses from '../components/admin/CompletedClasses';
import ProfileView from '../components/ProfileView';
import HelpAndSupportView from '../components/HelpAndSupportView';
import { ClassManagerView, EnrollLearnersView, AssignTrainerView } from '../components/admin/ClassManagementViews';
import { ApplyNewClaimView, ApplyNewGrantView, SubmitAssessmentView, UploadCourseRunsView, ViewAssessmentsView, ViewClaimStatusView, ViewGrantStatusView } from '../components/admin/GrantManagementViews';
import { Icon, IconName } from '../components/common/Icon';
import { Card } from '../components/common/Card';
import OngoingClasses from '../components/admin/OngoingClasses';

// --- NEW MANAGEMENT DASHBOARD COMPONENT ---

interface NavBoxProps {
    title: AdminPage;
    description: string;
    icon: IconName;
    page: AdminPage;
}

const NavBox: React.FC<NavBoxProps> = ({ title, description, icon, page }) => {
    const { setAdminPage } = useLms();
    return (
        <Card 
            className="p-6 text-center flex flex-col items-center justify-center h-full"
            onClick={() => setAdminPage(page)}
        >
            <Icon name={icon} className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-sm text-subtle flex-grow">{description}</p>
        </Card>
    );
};

interface ManagementDashboardProps {
    type: 'class' | 'tpg';
}

const ManagementDashboard: React.FC<ManagementDashboardProps> = ({ type }) => {
    const classManagementLinks: NavBoxProps[] = [
        { title: AdminPage.ViewCourses, description: "Browse and manage all course templates.", icon: IconName.Library, page: AdminPage.ViewCourses },
        { title: AdminPage.ViewTrainers, description: "View details and assignments for all trainers.", icon: IconName.User, page: AdminPage.ViewTrainers },
        { title: AdminPage.UpcomingClasses, description: "See all scheduled upcoming classes.", icon: IconName.Calendar, page: AdminPage.UpcomingClasses },
        { title: AdminPage.OngoingClasses, description: "Monitor classes that are currently in session.", icon: IconName.Clock, page: AdminPage.OngoingClasses },
        { title: AdminPage.CompletedClasses, description: "Review past classes and their records.", icon: IconName.ClipboardCheck, page: AdminPage.CompletedClasses },
        { title: AdminPage.CreateNewClass, description: "Schedule a new class run from a course template.", icon: IconName.Add, page: AdminPage.CreateNewClass },
        { title: AdminPage.EnrollLearners, description: "Add or remove learners from a specific class.", icon: IconName.Profile, page: AdminPage.EnrollLearners },
        { title: AdminPage.AssignTrainer, description: "Assign or change the trainer for a class.", icon: IconName.SwitchProfile, page: AdminPage.AssignTrainer },
    ];

    const tpgManagementLinks: NavBoxProps[] = [
        { title: AdminPage.ApplyNewGrant, description: "Submit new grant applications to SSG for learners.", icon: IconName.Send, page: AdminPage.ApplyNewGrant },
        { title: AdminPage.ViewGrantStatus, description: "Check the status of submitted grant applications.", icon: IconName.Search, page: AdminPage.ViewGrantStatus },
        { title: AdminPage.SubmitAssessment, description: "Submit learner assessment results to TPG.", icon: IconName.Upload, page: AdminPage.SubmitAssessment },
        { title: AdminPage.ViewAssessments, description: "View official assessment results from TPG.", icon: IconName.ClipboardCheck, page: AdminPage.ViewAssessments },
        { title: AdminPage.ApplyNewClaim, description: "Submit new claims to SSG for learners.", icon: IconName.DollarSign, page: AdminPage.ApplyNewClaim },
        { title: AdminPage.ViewClaimStatus, description: "Check the status of submitted claims.", icon: IconName.InfoCircle, page: AdminPage.ViewClaimStatus },
        { title: AdminPage.UploadCourseRuns, description: "Bulk upload new course runs via Excel to SSG.", icon: IconName.FileExcel, page: AdminPage.UploadCourseRuns },
    ];

    const isClass = type === 'class';
    const title = isClass ? 'Class Management' : 'TPG Management';
    const links = isClass ? classManagementLinks : tpgManagementLinks;
    
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {links.map(link => (
                    <NavBox key={link.title} {...link} />
                ))}
            </div>
        </div>
    );
};


const AdminLayout: React.FC = () => {
  const { currentView, adminPage, setAdminPage, editingCourse, adminViewKey } = useLms();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (currentView === View.Profile || currentView === View.HelpAndSupport) {
    const FullWidthContent = () => {
        switch(currentView) {
            case View.Profile: return <ProfileView />;
            case View.HelpAndSupport: return <HelpAndSupportView />;
            default: return null;
        }
    }
    return (
        <div className="min-h-screen bg-background font-sans text-on-surface">
            <Header />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <FullWidthContent />
            </main>
            <AiChatbot />
        </div>
    );
  }

  const renderContent = () => {
    // The Course Content Editor (Developer view) takes precedence if triggered
    if (editingCourse && adminPage !== AdminPage.EditClass) {
        return <CourseEditor />;
    }
    
    // Handle top-level navigation from Header
    if (currentView === View.Create) {
        return <CreateView />;
    }
    
    // Handle sidebar navigation
    switch (adminPage) {
        case AdminPage.Dashboard:
            return <AdminDashboard key={adminViewKey} />;
        case AdminPage.ClassManagement:
            return <ManagementDashboard type="class" />;
        case AdminPage.TpgManagement:
            return <ManagementDashboard type="tpg" />;
        case AdminPage.ViewCourses:
            return <CourseList />;
        case AdminPage.ViewTrainers:
            return <ViewTrainers />;
        case AdminPage.UpcomingClasses:
             return <AdminDashboard key={adminViewKey} />; // This content is on the dashboard
        case AdminPage.OngoingClasses:
            return <OngoingClasses />;
        case AdminPage.CompletedClasses:
            return <CompletedClasses />;
        // The ClassManagerView handles Create and Edit flows
        case AdminPage.CreateNewClass:
            return <ClassManagerView />;
        case AdminPage.EditClass:
             return <ClassManagerView courseToEdit={editingCourse} />;
        case AdminPage.EnrollLearners:
            return <EnrollLearnersView />;
        case AdminPage.AssignTrainer:
            return <AssignTrainerView />;
        // TPG Management
        case AdminPage.ApplyNewGrant:
            return <ApplyNewGrantView />;
        case AdminPage.ViewGrantStatus:
            return <ViewGrantStatusView />;
        case AdminPage.SubmitAssessment:
            return <SubmitAssessmentView />;
        case AdminPage.ViewAssessments:
            return <ViewAssessmentsView />;
        case AdminPage.ApplyNewClaim:
            return <ApplyNewClaimView />;
        case AdminPage.ViewClaimStatus:
            return <ViewClaimStatusView />;
        case AdminPage.UploadCourseRuns:
            return <UploadCourseRunsView />;
        default:
            return <AdminDashboard key={adminViewKey} />;
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-on-surface">
      <Header />
       {/* Mobile header and sidebar toggle */}
      <div className="lg:hidden flex items-center gap-4 px-4 sm:px-6 py-3 border-b border-gray-200">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-gray-600 hover:text-gray-900">
            <Icon name={IconName.Menu} className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold">{adminPage}</h2>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 z-40 lg:hidden" 
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" aria-hidden="true" onClick={() => setIsSidebarOpen(false)}></div>

            {/* Sidebar Panel */}
            <div 
                className="relative flex flex-col w-72 max-w-[calc(100%-3rem)] h-full bg-surface shadow-xl"
            >
                <div className="p-4 flex justify-between items-center border-b">
                    <h3 className="font-bold">Admin Menu</h3>
                    <button onClick={() => setIsSidebarOpen(false)} className="p-2 -mr-2 text-gray-600 hover:text-gray-900">
                        <Icon name={IconName.Close} className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <AdminSidebar onNavigate={() => setIsSidebarOpen(false)} />
                </div>
            </div>
        </div>
      )}

      <div className="container mx-auto flex flex-col lg:flex-row gap-8 px-4 sm:px-6 lg:px-8 py-8">
        <aside className="hidden lg:block w-full lg:w-1/4 lg:flex-shrink-0">
            <Card className="sticky top-24">
                <AdminSidebar />
            </Card>
        </aside>
        <main className="flex-1 min-w-0">
            {renderContent()}
        </main>
      </div>
      <AiChatbot />
    </div>
  );
};
export default AdminLayout;