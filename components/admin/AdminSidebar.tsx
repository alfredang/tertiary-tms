

import React from 'react';
import { useLms } from '../../hooks/useLms';
import { AdminPage } from '../../types';

interface NavSectionProps {
    title: string;
    children: React.ReactNode;
}

const NavSection: React.FC<NavSectionProps> = ({ title, children }) => (
    <div>
        <h3 className="px-3 text-xs font-semibold uppercase text-gray-500 tracking-wider">{title}</h3>
        <div className="mt-2 space-y-1" role="group" aria-labelledby={`${title}-heading`}>
            {children}
        </div>
    </div>
);

interface AdminSidebarProps {
    onNavigate?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onNavigate }) => {
    const { adminPage, setAdminPage, setEditingCourse } = useLms();

    const NavItem: React.FC<{ page: AdminPage; isSubItem?: boolean; label?: string }> = ({ page, isSubItem = false, label }) => (
        <a
            href="#"
            onClick={(e) => {
                e.preventDefault();
                setEditingCourse(null); // Clear editing state on navigation
                setAdminPage(page);
                if (onNavigate) {
                    onNavigate();
                }
            }}
            className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isSubItem ? 'pl-8' : ''
            } ${
                adminPage === page
                ? 'bg-primary/10 text-primary'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
        >
            {label || page}
        </a>
    );
    
    return (
        <nav className="space-y-6 p-4">
            <NavItem page={AdminPage.Dashboard} label="Admin Dashboard" />

            <NavSection title="Class Management">
                <NavItem page={AdminPage.ViewCourses} isSubItem />
                <NavItem page={AdminPage.ViewTrainers} isSubItem />
                <NavItem page={AdminPage.UpcomingClasses} isSubItem />
                <NavItem page={AdminPage.OngoingClasses} isSubItem />
                <NavItem page={AdminPage.CompletedClasses} isSubItem />
                <NavItem page={AdminPage.CreateNewClass} isSubItem />
                <NavItem page={AdminPage.EnrollLearners} isSubItem />
                <NavItem page={AdminPage.AssignTrainer} isSubItem />
            </NavSection>
            
            <NavSection title="TPG Management">
                <NavItem page={AdminPage.ApplyNewGrant} isSubItem />
                <NavItem page={AdminPage.ViewGrantStatus} isSubItem />
                <NavItem page={AdminPage.SubmitAssessment} isSubItem />
                <NavItem page={AdminPage.ViewAssessments} isSubItem />
                <NavItem page={AdminPage.ApplyNewClaim} isSubItem />
                <NavItem page={AdminPage.ViewClaimStatus} isSubItem />
                <NavItem page={AdminPage.UploadCourseRuns} isSubItem />
            </NavSection>
        </nav>
    );
};

export default AdminSidebar;