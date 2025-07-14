// Enhanced Backend Models and Types
// Recruitment Platform v2.0

// ================================
// ENUMS AND TYPES
// ================================

export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT', 
  COMPANY = 'COMPANY',
  UNIVERSITY = 'UNIVERSITY',
  HR_MANAGER = 'HR_MANAGER'
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEWED = 'INTERVIEWED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export enum JobType {
  INTERNSHIP = 'INTERNSHIP',
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  REMOTE = 'REMOTE',
  FREELANCE = 'FREELANCE'
}

export enum WorkMode {
  ONSITE = 'ONSITE',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID'
}

export enum ExperienceLevel {
  ENTRY = 'ENTRY',
  JUNIOR = 'JUNIOR',
  INTERMEDIATE = 'INTERMEDIATE',
  SENIOR = 'SENIOR',
  EXPERT = 'EXPERT'
}

export enum NotificationType {
  APPLICATION_SUBMITTED = 'APPLICATION_SUBMITTED',
  APPLICATION_STATUS_CHANGED = 'APPLICATION_STATUS_CHANGED',
  NEW_JOB_POSTED = 'NEW_JOB_POSTED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
  JOB_RECOMMENDATION = 'JOB_RECOMMENDATION',
  PROFILE_INCOMPLETE = 'PROFILE_INCOMPLETE'
}

export enum SkillCategory {
  TECHNICAL = 'TECHNICAL',
  SOFT_SKILL = 'SOFT_SKILL',
  LANGUAGE = 'LANGUAGE',
  CERTIFICATION = 'CERTIFICATION',
  TOOL = 'TOOL'
}

export enum FileType {
  RESUME = 'RESUME',
  PORTFOLIO = 'PORTFOLIO',
  CERTIFICATE = 'CERTIFICATE',
  COMPANY_LOGO = 'COMPANY_LOGO',
  PROFILE_PHOTO = 'PROFILE_PHOTO',
  VERIFICATION_DOC = 'VERIFICATION_DOC',
  PROJECT_FILE = 'PROJECT_FILE'
}

export enum InterviewType {
  PHONE = 'PHONE',
  VIDEO = 'VIDEO',
  ONSITE = 'ONSITE',
  TECHNICAL = 'TECHNICAL',
  HR_SCREENING = 'HR_SCREENING',
  PANEL = 'PANEL'
}

export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
  NO_SHOW = 'NO_SHOW'
}

export enum CompanySize {
  STARTUP_1_10 = 'STARTUP_1_10',
  SMALL_11_50 = 'SMALL_11_50',
  MEDIUM_51_200 = 'MEDIUM_51_200',
  LARGE_201_1000 = 'LARGE_201_1000',
  ENTERPRISE_1000_PLUS = 'ENTERPRISE_1000_PLUS'
}

// ================================
// ENHANCED INTERFACES
// ================================

export interface User {
  id: string;
  email: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  socialProvider?: string;
  socialId?: string;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  lastPasswordChange?: Date;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  emailNotifications: boolean;
  pushNotifications: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  
  // Relationships
  studentProfile?: StudentProfile;
  companyProfile?: CompanyProfile;
  universityProfile?: UniversityProfile;
  applications?: Application[];
  notifications?: Notification[];
  messagesSent?: Message[];
  messagesReceived?: Message[];
  refreshTokens?: RefreshToken[];
  userSessions?: UserSession[];
  fileUploads?: FileUpload[];
  auditLogs?: AuditLog[];
  activityLogs?: ActivityLog[];
  companyReviews?: CompanyReview[];
}

export interface StudentProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
  avatar?: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  gpa?: number;
  skills: string[];
  experience?: string;
  portfolio?: string;
  github?: string;
  linkedin?: string;
  resume?: string;
  
  // Extended profile data
  emergencyContact?: any;
  projects: any[];
  certifications: any[];
  languages: any[];
  
  // Employment preferences
  preferredJobTypes: JobType[];
  preferredWorkModes: WorkMode[];
  preferredLocations: string[];
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  availabilityDate?: Date;
  workAuthorization?: string;
  
  // Profile stats
  profileViews: number;
  profileCompletion: number;
  
  createdAt: Date;
  updatedAt: Date;
  users: User;
}

export interface CompanyProfile {
  id: string;
  userId: string;
  companyName: string;
  companySize?: CompanySize;
  industry?: string;
  website?: string;
  logo?: string;
  description?: string;
  foundedYear?: number;
  employeeCountRange?: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  city?: string;
  country: string;
  
  // Company culture & benefits
  benefits: any[];
  companyCulture: any;
  awards: any[];
  
  // Social links
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  
  // Verification
  isVerified: boolean;
  verificationDoc?: string;
  
  // Stats
  profileViews: number;
  followersCount: number;
  
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  
  // Relationships
  users: User;
  jobs?: Job[];
  interviews?: Interview[];
  companyReviews?: CompanyReview[];
}

export interface UniversityProfile {
  id: string;
  userId: string;
  universityName: string;
  universityCode?: string;
  establishmentYear?: number;
  universityType?: string;
  address?: string;
  city?: string;
  country: string;
  website?: string;
  logo?: string;
  description?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  faculties: any[];
  programs: any[];
  studentCount?: number;
  industryPartnerships: any[];
  placementRate?: number;
  isVerified: boolean;
  verificationDocuments: any[];
  createdAt: Date;
  updatedAt: Date;
  users: User;
}

export interface JobCategory {
  id: string;
  name: string;
  parentId?: string;
  parent?: JobCategory;
  children?: JobCategory[];
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  jobs?: Job[];
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description?: string;
  isVerified: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id: string;
  companyId: string;
  categoryId?: string;
  title: string;
  description: string;
  requirements: string[];
  benefits: string[];
  responsibilities: string[];
  jobType: JobType;
  workMode: WorkMode;
  experienceLevel: ExperienceLevel;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  applicationDeadline?: Date;
  maxApplications?: number;
  autoCloseDate?: Date;
  priorityLevel: number;
  requiredSkills: string[];
  preferredSkills: string[];
  tags: string[];
  screeningQuestions: any[];
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  
  // Relationships
  company: CompanyProfile;
  category?: JobCategory;
  applications?: Application[];
  interviews?: Interview[];
}

export interface Application {
  id: string;
  jobId: string;
  studentId: string;
  coverLetter?: string;
  customResume?: string;
  screeningAnswers: any;
  source?: string;
  referrerId?: string;
  status: ApplicationStatus;
  statusHistory: any[];
  hrNotes?: string;
  feedback?: string;
  rating?: number;
  appliedAt: Date;
  reviewedAt?: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relationships
  job: Job;
  student: User;
  referrer?: User;
  interviews?: Interview[];
}

export interface Interview {
  id: string;
  applicationId: string;
  companyId: string;
  jobId: string;
  title: string;
  description?: string;
  type: InterviewType;
  scheduledAt: Date;
  duration: number;
  location?: string;
  meetingLink?: string;
  interviewer?: string;
  interviewerEmail?: string;
  status: InterviewStatus;
  notes?: string;
  rating?: number;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relationships
  application: Application;
  company: CompanyProfile;
  job: Job;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  users: User;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  roomId?: string;
  content: string;
  messageType: string;
  fileUrl?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relationships
  sender: User;
  receiver?: User;
}

export interface CompanyReview {
  id: string;
  companyId: string;
  reviewerId: string;
  overallRating: number;
  workLifeBalance?: number;
  salaryBenefits?: number;
  careerDevelopment?: number;
  management?: number;
  title?: string;
  pros?: string;
  cons?: string;
  adviceToManagement?: string;
  employmentStatus?: string;
  jobTitle?: string;
  employmentDuration?: number;
  isApproved: boolean;
  isAnonymous: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relationships
  company: CompanyProfile;
  reviewer: User;
}

export interface FileUpload {
  id: string;
  userId: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileType: FileType;
  isPublic: boolean;
  downloadCount: number;
  metadata: any;
  virusScanStatus: string;
  virusScanResult?: any;
  createdAt: Date;
  updatedAt: Date;
  users: User;
}

export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  users: User;
}

export interface UserSession {
  id: string;
  userId: string;
  sessionToken: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: any;
  locationInfo?: any;
  isActive: boolean;
  expiresAt: Date;
  lastActivity: Date;
  createdAt: Date;
  users: User;
}

export interface AuditLog {
  id: string;
  userId?: string;
  tableName: string;
  recordId: string;
  operation: string;
  oldValues?: any;
  newValues?: any;
  changedFields?: string[];
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  user?: User;
}

export interface ActivityLog {
  id: string;
  userId?: string;
  activityType: string;
  entityType?: string;
  entityId?: string;
  metadata: any;
  ipAddress?: string;
  createdAt: Date;
  user?: User;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: any[];
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  config: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Analytics {
  id: string;
  metric: string;
  value: number;
  date: Date;
  userId?: string;
  jobId?: string;
  companyId?: string;
  metadata?: any;
  createdAt: Date;
}

// ================================
// REQUEST/RESPONSE TYPES
// ================================

export interface CreateUserRequest {
  email: string;
  password: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  universityName?: string;
}

export interface UpdateUserRequest {
  email?: string;
  isActive?: boolean;
  isVerified?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  requirements: string[];
  benefits?: string[];
  responsibilities?: string[];
  jobType: JobType;
  workMode: WorkMode;
  experienceLevel: ExperienceLevel;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  categoryId?: string;
  applicationDeadline?: Date;
  requiredSkills?: string[];
  preferredSkills?: string[];
  tags?: string[];
  screeningQuestions?: any[];
  isFeatured?: boolean;
}

export interface UpdateJobRequest {
  title?: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  responsibilities?: string[];
  jobType?: JobType;
  workMode?: WorkMode;
  experienceLevel?: ExperienceLevel;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  categoryId?: string;
  applicationDeadline?: Date;
  requiredSkills?: string[];
  preferredSkills?: string[];
  tags?: string[];
  screeningQuestions?: any[];
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface CreateApplicationRequest {
  jobId: string;
  coverLetter?: string;
  customResume?: string;
  screeningAnswers?: any;
  source?: string;
  referrerId?: string;
}

export interface UpdateApplicationRequest {
  status?: ApplicationStatus;
  hrNotes?: string;
  feedback?: string;
  rating?: number;
}

export interface CreateInterviewRequest {
  applicationId: string;
  title: string;
  description?: string;
  type: InterviewType;
  scheduledAt: Date;
  duration?: number;
  location?: string;
  meetingLink?: string;
  interviewer?: string;
  interviewerEmail?: string;
}

export interface UpdateInterviewRequest {
  title?: string;
  description?: string;
  type?: InterviewType;
  scheduledAt?: Date;
  duration?: number;
  location?: string;
  meetingLink?: string;
  interviewer?: string;
  interviewerEmail?: string;
  status?: InterviewStatus;
  notes?: string;
  rating?: number;
  feedback?: string;
}

export interface JobSearchFilters {
  keyword?: string;
  location?: string;
  jobType?: JobType[];
  workMode?: WorkMode[];
  experienceLevel?: ExperienceLevel[];
  salaryMin?: number;
  salaryMax?: number;
  categoryId?: string;
  skills?: string[];
  companyId?: string;
  postedWithin?: number; // days
  isFeatured?: boolean;
  sortBy?: 'relevance' | 'date' | 'salary' | 'company';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AnalyticsQuery {
  metrics: string[];
  startDate: Date;
  endDate: Date;
  groupBy?: 'day' | 'week' | 'month';
  filters?: {
    userId?: string;
    jobId?: string;
    companyId?: string;
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  totalCompanies: number;
  activeJobs: number;
  pendingApplications: number;
  todayRegistrations: number;
  todayApplications: number;
  applicationStatusBreakdown: Record<ApplicationStatus, number>;
  jobTypeBreakdown: Record<JobType, number>;
  monthlyTrend: Array<{
    date: string;
    users: number;
    jobs: number;
    applications: number;
  }>;
}

// ================================
// UTILITY TYPES
// ================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type CreateEntityRequest<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateEntityRequest<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  details?: any;
  timestamp: Date;
}
