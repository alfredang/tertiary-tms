
export enum UserRole {
  Learner = 'Learner',
  Trainer = 'Trainer',
  Admin = 'Admin',
  Developer = 'Developer',
  TrainingProvider = 'Training Provider',
}

export enum View {
  Dashboard = 'Dashboard',
  Courses = 'Courses',
  Calendar = 'Calendar',
  Create = 'Create',
  Profile = 'Profile',
  Analytics = 'Analytics',
  Admin = 'Admin',
  HelpAndSupport = 'HelpAndSupport',
  JobSearch = 'JobSearch',
}

export enum AdminPage {
  Dashboard = 'Dashboard',
  ClassManagement = 'Class Management',
  TpgManagement = 'TPG Management',
  // Class Management
  ViewCourses = 'View Courses',
  ViewTrainers = 'View Trainers',
  UpcomingClasses = 'Upcoming Classes',
  OngoingClasses = 'Ongoing Classes',
  CompletedClasses = 'Completed Classes',
  CreateNewClass = 'Create New Class',
  EditClass = 'Edit Class',
  EnrollLearners = 'Enroll Learners',
  AssignTrainer = 'Assign Trainer',
  // TPG Management
  ApplyNewGrant = 'Apply New Grant',
  ViewGrantStatus = 'View Grant Status',
  SubmitAssessment = 'Submit Assessment',
  ViewAssessments = 'View Assessments',
  ApplyNewClaim = 'Apply New Claim',
  ViewClaimStatus = 'View Claim Status',
  UploadCourseRuns = 'Upload Course Runs',
}

export interface AssessmentGrade {
  assessmentId: string;
  status: 'C' | 'NYC' | 'Pending';
}

export interface Submission {
    assessmentId: string;
    fileName: string;
    submittedAt: string;
}

export enum TpgStatus {
    Success = 'Success',
    Pending = 'Pending',
    Processing = 'Processing',
    Failed = 'Failed',
    NA = 'N/A',
}

export enum CompanyType {
    SME = 'SME',
    MNC = 'MNC',
    Government = 'Government',
    Startup = 'Startup',
    NA = 'N/A',
}

export enum PaymentMode {
    Cash = 'Cash',
    SkillsFutureCredit = 'SkillsFuture Credit',
    CompanySponsorship = 'Company Sponsorship',
}

export enum PaymentStatus {
    Paid = 'Paid',
    Unpaid = 'Unpaid',
    Pending = 'Pending',
    Overdue = 'Overdue',
    Failed = 'Failed',
    Processing = 'Processing',
    FullPayment = 'Full Payment',
}


export interface LearnerProgress {
  name: string;
  progressPercent: number;
  quizScore: number | null;
  tel: string;
  email: string;
  company: string;
  paymentStatus: PaymentStatus;
  assessmentGrades: AssessmentGrade[];
  submissions: Submission[];
  grantId: string | null;
  grantStatus: TpgStatus;
  claimStatus: TpgStatus;
  claimId: string | null;
  // Added for analytics
  gender: Gender;
  dob: string; // YYYY-MM-DD
  courseSponsorship: CourseSponsorship;
  ethnicity: Ethnicity;
  completedSubtopics?: string[];

  // Detailed enrollment fields
  traineeId?: string; // NRIC
  enrolmentDate?: string;
  sponsorshipType?: string;
  fees?: {
    totalCourseFee: number;
    grantAmount: number;
    discount: number;
    skillsFutureCreditClaim: number;
    cashPayment: number;
    invoiceNumber: string;
    receiptNumber: string;
  };
  bundle?: {
    code: string;
  };
  idType?: {
    type: string;
  };
  employer?: {
    uen: string;
    name?: string;
    type?: CompanyType;
    contact: {
      fullName: string;
      emailAddress: string;
      contactNumber: {
        areaCode: string;
        countryCode: string;
        phoneNumber: string;
      };
    };
  };
  contactNumber?: {
    areaCode: string;
    countryCode: string;
    phoneNumber: string;
  };
  centralProvidentFund?: {
    traineeCategory: string;
    letterOfSupportIssuanceDate: string;
    didTraineeReceiveCPFContribution: 'Yes' | 'No';
    isTraineeEmployedAtTimeofEnrolment: 'Yes' | 'No';
  };
  trainingPartner?: {
    uen: string;
    code: string;
  };
  // Fields for new learner form
  employmentStatus?: EmploymentStatus;
  nationality?: Nationality;
  paymentMode?: PaymentMode;
}

export interface Subtopic {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface Topic {
  id: string;
  title: string;
  subtopics: Subtopic[];
}

export enum AssessmentCategory {
    WrittenExam = 'Written Exam',
    OnlineExam = 'Online Exam',
    Project = 'Project',
    Assignments = 'Assignments',
    OralInterview = 'Oral Interview',
    Demonstration = 'Demonstration',
    PracticalExam = 'Practical Exam',
    RolePlay = 'Role Play',
    OralQuestioning = 'Oral Questioning',
}

export interface Assessment {
    id: string;
    title: string;
    category: AssessmentCategory;
    status: 'Draft' | 'Published';
    accessCode?: string;
    questions?: string;
    fileUrl?: string;
}

export enum ModeOfLearning {
  Physical = 'Physical',
  Virtual = 'Virtual',
  Hybrid = 'Hybrid',
}

export enum CourseType {
    WSQ = 'WSQ',
    IBF = 'IBF',
    NonWSQ = 'non-WSQ',
}

export enum ClassStatus {
  Confirmed = 'Confirmed',
  Pending = 'Pending',
  Cancelled = 'Cancelled',
  Reschedule = 'Reschedule',
}

export interface Course {
  id: string;
  title: string;
  imageUrl?: string;
  courseCode: string;
  tscTitle: string;
  tscCode: string;
  tscKnowledge: string;
  tscAbilities: string;
  courseRunId: string;
  daId?: string;
  learningOutcomes: string;
  trainer: string;
  trainingHours: number;
  assessmentHours: number;
  difficulty: string;
  modeOfLearning: ModeOfLearning[];
  courseType: CourseType;
  enrollmentStatus: 'enrolled' | 'not-enrolled';
  topics: Topic[];
  learners?: LearnerProgress[];
  quiz?: Quiz;
  status: 'Published' | 'Draft';
  courseFee: number;
  taxPercent: number;
  isWsqFunded: boolean;
  isSkillsFutureEligible: boolean;
  isPseaEligible: boolean;
  isMcesEligible: boolean;
  isIbfFunded: boolean;
  isUtapEligible: boolean;
  bookmarkedSubtopics?: string[];
  assessments?: Assessment[];
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  classStatus: ClassStatus;
  paymentStatus: PaymentStatus;
  learnerGuideUrl?: string;
  slidesUrl?: string;
  lessonPlanUrl?: string;
  assessmentPlanUrl?: string;
  facilitatorGuideUrl?: string;
  trainerSlidesUrl?: string;
  isLeaderboardEnabled?: boolean;
  certificateUrl?: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  type: 'quiz' | 'assignment' | 'lecture' | 'event';
  speaker?: string;
  eventType?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  topic: string;
  questions: QuizQuestion[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface GrantApplication {
    id: string;
    courseId: string;
    courseTitle: string;
    trainer: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}

export enum IconName {
  Dashboard, Courses, Calendar, Create, Profile, Logout, Chat, Close, Back, Trophy, Send, Spinner, Analytics, Edit, Delete, Add, Admin, Clock, Assignment, DollarSign, CheckCircle, InfoCircle, User,
  Bell, Library, Jobs, Telegram, WhatsApp, Gmail, Facebook, XTwitter,
  Filter,
  Sessions, Lessons, Bookmarks, Notes, Resources, FilePdf, Bookmark, BookmarkSolid,
  Logo,
  ClipboardCheck,
  QrCode,
  // Profile Dropdown Icons
  SwitchProfile, MyAccount, Help, PurchaseHistory, ReferAndEarn,
  // New Icons
  ChevronDown,
  LinkedIn,
  Search,
  Star,
  Infosys,
  HP,
  TigerAnalytics,
  Terrapay,
  ArrowUpRight,
  React,
  Python,
  Google,
  Meta,
  Agile,
  ProjectManagement,
  CloudComputing,
  ITService,
  DataScience,
  DevOps,
  CyberSecurity,
  CSM,
  CSPO,
  SAFe,
  ScrumAlliance,
  ScaledAgile,
  ScrumOrg,
  PMI,
  DigitalAttendance,
  ChatBubbles,
  DragHandle,
  Menu,
  Eye,
  EyeOff,
  // Fix: Added missing icon names for upload functionality.
  Upload,
  FileExcel,
  Minus,
  Download,
  Certificate,
}

// --- NEW ROLE-SPECIFIC PROFILES ---

export enum Gender {
    Male = 'Male',
    Female = 'Female',
    Other = 'Prefer not to say',
}

export enum EmploymentStatus {
    Employed = 'Employed',
    Unemployed = 'Unemployed',
    LookingForJob = 'Looking for Job',
}

export enum TrainerType {
    ACLP = 'ACLP',
    NonACLP = 'non-ACLP',
    DACE = 'DACE',
}

export enum TrainerStatus {
    Active = 'Active',
    Inactive = 'Inactive',
}

export enum Nationality {
    Singaporean = 'Singaporean',
    SingaporePR = 'Singapore PR',
    NonCitizen = 'Non Citizen',
}

export enum CourseSponsorship {
    SelfSponsored = 'Self-Sponsored',
    EmployerSponsored = 'Employer-Sponsored',
    NA = 'N/A',
}

export enum AgeGroup {
    Below20 = 'Below 20',
    '20-25' = '20-25',
    '26-30' = '26-30',
    '31-35' = '31-35',
    '36-40' = '36-40',
    '41-45' = '41-45',
    '46-50' = '46-50',
    '51-55' = '51-55',
    '56-60' = '56-60',
    '61-65' = '61-65',
    '66-70' = '66-70',
    Above70 = 'Above 70',
}

export const calculateAgeGroup = (dob: string): AgeGroup => {
    if (!dob) return AgeGroup.Below20; // Default fallback
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    if (age < 20) return AgeGroup.Below20;
    if (age <= 25) return AgeGroup['20-25'];
    if (age <= 30) return AgeGroup['26-30'];
    if (age <= 35) return AgeGroup['31-35'];
    if (age <= 40) return AgeGroup['36-40'];
    if (age <= 45) return AgeGroup['41-45'];
    if (age <= 50) return AgeGroup['46-50'];
    if (age <= 55) return AgeGroup['51-55'];
    if (age <= 60) return AgeGroup['56-60'];
    if (age <= 65) return AgeGroup['61-65'];
    if (age <= 70) return AgeGroup['66-70'];
    return AgeGroup.Above70;
};


export enum Qualification {
    ACLP = 'ACLP',
    DACE = 'DACE',
}

export enum Education {
    Diploma = 'Diploma',
    Degree = 'Degree',
    Master = 'Master',
    PhD = 'PhD',
}

export enum Ethnicity {
    Chinese = 'Chinese',
    Malay = 'Malay',
    Indian = 'Indian',
    Others = 'Others',
}

export interface WorkExperienceItem {
    id: string;
    jobTitle: string;
    company: string;
    startDate: string; // YYYY-MM
    endDate: string; // YYYY-MM or 'Present'
    description: string;
}

export interface LearnerProfile {
    name: string;
    tel: string;
    email: string;
    nric?: string;
    gender: Gender;
    company: string;
    employmentStatus: EmploymentStatus;
    profilePictureUrl: string;
    loginId: string;
    nationality: Nationality;
    courseSponsorship: CourseSponsorship;
    invoiceUrl?: string;
    receiptUrl?: string;
    ethnicity: Ethnicity;
    dob: string; // YYYY-MM-DD
    proFormaInvoiceUrl?: string;
}

export interface TrainerProfile {
    name: string;
    tel: string;
    email: string;
    gender: Gender;
    trainerType: TrainerType;
    status: TrainerStatus;
    areasOfExpertise: string[];
    profilePictureUrl: string;
    loginId: string;
    qualifications: Qualification[];
    education: Education[];
    workExperience: WorkExperienceItem[];
    linkedinUrl?: string;
    cvUrl?: string;
    certifications?: { id: string; name: string; url: string; }[];
}

export enum DeveloperType {
    DACE = 'DACE',
    DDDPL = 'DDDPL',
    NA = 'N/A',
}

export interface DeveloperProfile {
    name: string;
    tel: string;
    email: string;
    profilePictureUrl: string;
    loginId: string;
    qualifications: Qualification[];
    education: Education[];
    areasOfSpecialty: string[];
    workExperience: WorkExperienceItem[];
    cvUrl?: string;
    certifications?: { id: string; name: string; url: string; }[];
    developerType: DeveloperType;
    gender: Gender;
    linkedinUrl?: string;
}

export interface AdminProfile {
    name: string;
    tel: string;
    email: string;
    profilePictureUrl: string;
    loginId: string;
}

export interface TrainingProviderProfile {
    companyName: string;
    companyShortname: string;
    uen: string;
    companyAddress: string;
    contactPerson: {
        name: string;
        email: string;
        tel: string;
    };
    apiKeys: Record<string, string>;
    companyLogoUrl: string;
    invoiceTemplateUrl?: string;
    receiptTemplateUrl?: string;
    certificateTemplateUrl?: string;
    proFormaInvoiceTemplateUrl?: string;
    loginId: string;
    ssgCertFile?: string;
    ssgPrivateKeyFile?: string;
    ssgEncryptionKey?: string;
    adminSettings: {
        autoSendProFormaInvoice: boolean;
        autoSendConfirmationEmail: boolean;
        autoSendInvoiceOnGrantSuccess: boolean;
        autoSendReceiptOnPayment: boolean;
        autoSendCertificateOnCompletion: boolean;
        autoSendThankYouEmail: boolean;
    };
    integrations: {
        syncGoogleCalendar: boolean;
        syncMicrosoftCalendar: boolean;
        googleDrive: boolean;
        microsoftOneDrive: boolean;
    };
    securitySettings: {
        autoMaskSensitiveData: boolean;
        autoDeleteAfter6Months: boolean;
        enableDefaultOtp: boolean;
        defaultOtp: string;
        enableOtpLogin: boolean;
    };
    gamingSettings: {
        enableLeaderboard: boolean;
        enablePoints: boolean;
    };
    colorScheme: {
        primary: string;
    };
    fundingSettings: {
        normalFunding: 50 | 70;
        enhancedFunding: number;
        isGstRegistered: boolean;
        gstRate: number;
    };
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  area: string;
  description: string;
  url: string;
}
