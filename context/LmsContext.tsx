import React, { createContext, useState, ReactNode, useMemo } from 'react';
// Fix: Added LearnerProgress and TrainingProviderProfile to imports
import { UserRole, View, Course, Quiz, CalendarEvent, GrantApplication, AssessmentGrade, AdminPage, Assessment, LearnerProgress, TrainingProviderProfile, LearnerProfile, TrainerProfile, DeveloperProfile, AdminProfile } from '../types';
import { apiGetCourses, apiGetCalendarEvents, apiUpdateCourse, apiAddCourse, apiGetGrantApplications, apiUpdateGrantApplicationStatus, apiToggleBookmark, apiUpdateLearnerGrade, apiUpdateAssessment, apiSubmitAssessment, apiDeleteCourse, apiUpdateAllLearnerGrades, apiToggleSubtopicCompletion, apiUpdateLearnerDetailsInClass } from '../services/apiService';
import { resetTutorChat } from '../services/geminiService';
// Fix: Import ALL_MOCK_LEARNERS and MOCK_TRAINING_PROVIDER_PROFILE
import { ALL_MOCK_LEARNERS, MOCK_ADMIN_PROFILE, MOCK_DEVELOPER_PROFILE, MOCK_LEARNER_PROFILE, MOCK_TRAINERS, MOCK_TRAINING_PROVIDER_PROFILE } from '../constants';

type UserProfile = LearnerProfile | TrainerProfile | DeveloperProfile | AdminProfile | { name: string; profilePictureUrl?: string; };

interface LmsContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentView: View;
  setCurrentView: (view: View) => void;
  adminPage: AdminPage;
  setAdminPage: (page: AdminPage) => void;
  courses: Course[];
  calendarEvents: CalendarEvent[];
  grantApplications: GrantApplication[];
  selectedCourse: Course | null;
  setSelectedCourse: (course: Course | null) => void;
  editingCourse: Course | null;
  setEditingCourse: (course: Course | null) => void;
  gamificationPoints: number;
  addPoints: (points: number) => void;
  isChatOpen: boolean;
  toggleChat: () => void;
  resetInAppChat: () => void;
  addCourse: (newCourse: Course) => Promise<Course>;
  updateCourse: (updatedCourse: Course) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  addQuizToCourse: (courseId: string, quiz: Quiz) => Promise<void>;
  enrollInCourse: (courseId: string) => Promise<void>;
  toggleBookmark: (courseId: string, subtopicId: string) => Promise<void>;
  toggleSubtopicCompletion: (courseId: string, learnerEmail: string, subtopicId: string) => Promise<void>;
  updateLearnerGrade: (courseId: string, learnerEmail: string, assessmentId: string, status: AssessmentGrade['status']) => Promise<void>;
  updateAllLearnerGrades: (courseId: string, learnerEmail: string, status: AssessmentGrade['status']) => Promise<void>;
  updateAssessment: (courseId: string, assessmentId: string, newStatus: Assessment['status'], newCode?: string) => Promise<void>;
  submitAssessment: (courseId: string, learnerEmail: string, assessmentId: string, fileName: string) => Promise<void>;
  updateGrantApplicationStatus: (grantId: string, status: GrantApplication['status']) => Promise<void>;
  isLoginModalOpen: boolean;
  setLoginModalOpen: (isOpen: boolean) => void;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (selectedRole: UserRole) => void;
  logout: () => void;
  handleNavigation: (view: View) => void;
  createViewKey: number;
  resetCreateView: () => void;
  adminViewKey: number;
  resetAdminView: () => void;
  trainingProviderProfile: TrainingProviderProfile;
  currentUserProfile: UserProfile | null;
  // Fix: Add learner management properties
  allLearners: LearnerProgress[];
  addLearner: (newLearner: LearnerProgress) => Promise<LearnerProgress>;
  enrollLearnerInClass: (courseId: string, learnerEmail: string) => Promise<void>;
  unenrollLearnerFromClass: (courseId: string, learnerEmail: string) => Promise<void>;
  updateLearnerDetailsInClass: (courseId: string, learnerEmail: string, updatedLearner: LearnerProgress) => Promise<void>;
  
  // Profiles
  learnerProfile: LearnerProfile;
  trainerProfiles: TrainerProfile[];
  developerProfile: DeveloperProfile;
  adminProfile: AdminProfile;

  // Updaters
  updateLearnerProfile: (profile: LearnerProfile) => void;
  updateTrainerProfile: (profile: TrainerProfile) => void;
  updateDeveloperProfile: (profile: DeveloperProfile) => void;
  updateAdminProfile: (profile: AdminProfile) => void;
  updateTrainingProviderProfile: (profile: TrainingProviderProfile) => void;

  // UI State
  isCourseMenuOpen: boolean;
  setIsCourseMenuOpen: (isOpen: boolean) => void;
}

export const LmsContext = createContext<LmsContextType | undefined>(undefined);

export const LmsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(UserRole.Learner);
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [adminPage, setAdminPage] = useState<AdminPage>(AdminPage.Dashboard);
  const [courses, setCourses] = useState<Course[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [grantApplications, setGrantApplications] = useState<GrantApplication[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [gamificationPoints, setGamificationPoints] = useState(150);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [createViewKey, setCreateViewKey] = useState(Date.now());
  const [adminViewKey, setAdminViewKey] = useState(Date.now());
  // Fix: Add state for all learners
  const [allLearners, setAllLearners] = useState<LearnerProgress[]>(ALL_MOCK_LEARNERS);
  const [isCourseMenuOpen, setIsCourseMenuOpen] = useState(false);
  
  // Profile States
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile>(MOCK_LEARNER_PROFILE);
  const [trainerProfiles, setTrainerProfiles] = useState<TrainerProfile[]>(MOCK_TRAINERS);
  const [developerProfile, setDeveloperProfile] = useState<DeveloperProfile>(MOCK_DEVELOPER_PROFILE);
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(MOCK_ADMIN_PROFILE);
  const [trainingProviderProfile, setTrainingProviderProfile] = useState<TrainingProviderProfile>(MOCK_TRAINING_PROVIDER_PROFILE);

  const currentUserProfile = useMemo(() => {
    switch (role) {
      case UserRole.Learner:
        return learnerProfile;
      case UserRole.Trainer:
        // Find 'John Smith' as used elsewhere in mock logic
        return trainerProfiles.find(t => t.name === 'John Smith') || trainerProfiles[0];
      case UserRole.Developer:
        return developerProfile;
      case UserRole.Admin:
        return adminProfile;
      case UserRole.TrainingProvider:
        return {
          name: trainingProviderProfile.contactPerson.name,
          profilePictureUrl: trainingProviderProfile.companyLogoUrl,
        };
      default:
        return null;
    }
  }, [role, learnerProfile, trainerProfiles, developerProfile, adminProfile, trainingProviderProfile]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const [fetchedCourses, fetchedEvents, fetchedGrants] = await Promise.all([
            apiGetCourses(),
            apiGetCalendarEvents(),
            apiGetGrantApplications(),
        ]);
        setCourses(fetchedCourses);
        setCalendarEvents(fetchedEvents);
        setGrantApplications(fetchedGrants);
    } catch (error) {
        console.error("Failed to fetch initial data", error);
    } finally {
        setIsLoading(false);
    }
  };

  const login = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setIsLoggedIn(true);
    fetchData();
  };

  const logout = () => {
    setIsLoggedIn(false);
    resetInAppChat();
    setRole(UserRole.Learner);
    setCurrentView(View.Dashboard);
    setSelectedCourse(null);
    setEditingCourse(null);
    setIsCourseMenuOpen(false);
    setCourses([]);
    setCalendarEvents([]);
    setGrantApplications([]);
  };

  const handleNavigation = (view: View) => {
    setCurrentView(view);
    setSelectedCourse(null);
    setEditingCourse(null);
    setIsCourseMenuOpen(false);
     if (view !== View.Admin) {
        setAdminPage(AdminPage.Dashboard); // Reset admin page when navigating away
    }
  };

  const enrollInCourse = async (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
        const updatedCourse = { ...course, enrollmentStatus: 'enrolled' as const };
        await apiUpdateCourse(updatedCourse);
        // Efficient state update
        setCourses(prev => prev.map(c => c.id === courseId ? updatedCourse : c));
    }
  };

  const addQuizToCourse = async (courseId: string, quiz: Quiz) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
        const updatedCourse = { ...course, quiz };
        await apiUpdateCourse(updatedCourse);
        // Efficient state update
        setCourses(prev => prev.map(c => c.id === courseId ? updatedCourse : c));
        if (selectedCourse?.id === courseId) {
            setSelectedCourse(updatedCourse);
        }
    }
  };

  const addCourse = async (newCourseData: Course) => {
    const createdCourse = await apiAddCourse(newCourseData);
    setCourses(prev => [...prev, createdCourse]);
    return createdCourse;
  };

  const updateCourse = async (courseToUpdate: Course) => {
    await apiUpdateCourse(courseToUpdate);
    // Efficient state update
    setCourses(prev => prev.map(c => c.id === courseToUpdate.id ? courseToUpdate : c));
  };
  
  const deleteCourse = async (courseId: string) => {
    await apiDeleteCourse(courseId);
    setCourses(prev => prev.filter(c => c.id !== courseId));
  };
  
  const toggleBookmark = async (courseId: string, subtopicId: string) => {
    const updatedCourse = await apiToggleBookmark(courseId, subtopicId);
    setCourses(prevCourses => prevCourses.map(c => c.id === courseId ? updatedCourse : c));
    if (selectedCourse?.id === courseId) {
        setSelectedCourse(updatedCourse);
    }
  };

  const toggleSubtopicCompletion = async (courseId: string, learnerEmail: string, subtopicId: string) => {
    const updatedCourse = await apiToggleSubtopicCompletion(courseId, learnerEmail, subtopicId);
    setCourses(prevCourses => prevCourses.map(c => c.id === courseId ? updatedCourse : c));
    if (selectedCourse?.id === courseId) {
        setSelectedCourse(updatedCourse);
    }
  };

  const updateGrantApplicationStatus = async (grantId: string, status: GrantApplication['status']) => {
    await apiUpdateGrantApplicationStatus(grantId, status);
    const updatedGrants = await apiGetGrantApplications();
    setGrantApplications(updatedGrants);
  };

  const updateLearnerGrade = async (courseId: string, learnerEmail: string, assessmentId: string, status: AssessmentGrade['status']) => {
      const updatedCourse = await apiUpdateLearnerGrade(courseId, learnerEmail, assessmentId, status);
      setCourses(prevCourses => prevCourses.map(c => c.id === courseId ? updatedCourse : c));
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(updatedCourse);
      }
  };

  const updateAllLearnerGrades = async (courseId: string, learnerEmail: string, status: AssessmentGrade['status']) => {
      const updatedCourse = await apiUpdateAllLearnerGrades(courseId, learnerEmail, status);
      setCourses(prevCourses => prevCourses.map(c => c.id === courseId ? updatedCourse : c));
  };

  const updateAssessment = async (courseId: string, assessmentId: string, newStatus: Assessment['status'], newCode?: string) => {
      const updatedCourse = await apiUpdateAssessment(courseId, assessmentId, newStatus, newCode);
      setCourses(prevCourses => prevCourses.map(c => c.id === courseId ? updatedCourse : c));
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(updatedCourse);
      }
  };

  const submitAssessment = async (courseId: string, learnerEmail: string, assessmentId: string, fileName: string) => {
      const updatedCourse = await apiSubmitAssessment(courseId, learnerEmail, assessmentId, fileName);
      setCourses(prevCourses => prevCourses.map(c => c.id === courseId ? updatedCourse : c));
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(updatedCourse);
      }
  };

  const updateLearnerDetailsInClass = async (courseId: string, learnerEmail: string, updatedLearner: LearnerProgress) => {
    const updatedCourse = await apiUpdateLearnerDetailsInClass(courseId, learnerEmail, updatedLearner);
    setCourses(prevCourses => prevCourses.map(c => c.id === courseId ? updatedCourse : c));
    // Also update the selectedCourse if it's the one being edited
    if (selectedCourse?.id === courseId) {
        setSelectedCourse(updatedCourse);
    }
  };

  const addPoints = (points: number) => {
    setGamificationPoints(prev => prev + points);
  };
  
  const toggleChat = () => setIsChatOpen(prev => !prev);
  const resetInAppChat = () => resetTutorChat();
  const resetCreateView = () => setCreateViewKey(Date.now());
  const resetAdminView = () => setAdminViewKey(Date.now());
    
  // Fix: Add learner management functions
  const addLearner = async (newLearner: LearnerProgress): Promise<LearnerProgress> => {
    // In a real app, this would call an API. Here we simulate it by updating state.
    setAllLearners(prev => {
        // Prevent duplicates
        if (prev.find(l => l.email === newLearner.email)) {
            return prev;
        }
        return [...prev, newLearner];
    });
    return Promise.resolve(newLearner); // Simulate async operation
  };

  const enrollLearnerInClass = async (courseId: string, learnerEmail: string) => {
    const course = courses.find(c => c.id === courseId);
    // Use the state version of allLearners
    const learnerDetails = allLearners.find(l => l.email === learnerEmail);

    if (course && learnerDetails && !course.learners?.some(l => l.email === learnerEmail)) {
      const newLearnerForCourse = { ...learnerDetails }; // Copy learner details
      const updatedCourse = {
        ...course,
        learners: [...(course.learners || []), newLearnerForCourse],
      };
      await apiUpdateCourse(updatedCourse);
      setCourses(prev => prev.map(c => (c.id === courseId ? updatedCourse : c)));
    }
  };

  const unenrollLearnerFromClass = async (courseId: string, learnerEmail: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course?.learners) {
      const updatedLearners = course.learners.filter(l => l.email !== learnerEmail);
      const updatedCourse = { ...course, learners: updatedLearners };
      await apiUpdateCourse(updatedCourse);
      setCourses(prev => prev.map(c => (c.id === courseId ? updatedCourse : c)));
    }
  };

  // Profile Updaters
  const updateLearnerProfile = (profile: LearnerProfile) => setLearnerProfile(profile);
  const updateTrainerProfile = (profile: TrainerProfile) => setTrainerProfiles(prev => prev.map(p => p.loginId === profile.loginId ? profile : p));
  const updateDeveloperProfile = (profile: DeveloperProfile) => setDeveloperProfile(profile);
  const updateAdminProfile = (profile: AdminProfile) => setAdminProfile(profile);
  const updateTrainingProviderProfile = (profile: TrainingProviderProfile) => setTrainingProviderProfile(profile);

  const value = {
    role,
    setRole,
    currentView,
    setCurrentView,
    adminPage,
    setAdminPage,
    courses,
    calendarEvents,
    grantApplications,
    selectedCourse,
    setSelectedCourse,
    editingCourse,
    setEditingCourse,
    gamificationPoints,
    addPoints,
    isChatOpen,
    toggleChat,
    resetInAppChat,
    addCourse,
    updateCourse,
    deleteCourse,
    addQuizToCourse,
    enrollInCourse,
    toggleBookmark,
    toggleSubtopicCompletion,
    updateLearnerGrade,
    updateAllLearnerGrades,
    updateAssessment,
    submitAssessment,
    updateGrantApplicationStatus,
    updateLearnerDetailsInClass,
    isLoginModalOpen,
    setLoginModalOpen,
    isLoggedIn,
    isLoading,
    login,
    logout,
    handleNavigation,
    createViewKey,
    resetCreateView,
    adminViewKey,
    resetAdminView,
    trainingProviderProfile,
    currentUserProfile,
    // Fix: Add new values to context
    allLearners,
    addLearner,
    enrollLearnerInClass,
    unenrollLearnerFromClass,
    // Profiles and Updaters
    learnerProfile,
    trainerProfiles,
    developerProfile,
    adminProfile,
    updateLearnerProfile,
    updateTrainerProfile,
    updateDeveloperProfile,
    updateAdminProfile,
    updateTrainingProviderProfile,
    // UI State
    isCourseMenuOpen,
    setIsCourseMenuOpen,
  };

  return <LmsContext.Provider value={value}>{children}</LmsContext.Provider>;
};
