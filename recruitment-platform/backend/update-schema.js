#!/usr/bin/env node

/**
 * Prisma Schema Update Script
 * Updates the existing schema.prisma with new fields and tables
 */

const fs = require('fs');
const path = require('path');

const SCHEMA_PATH = path.join(__dirname, 'prisma', 'schema.prisma');
const BACKUP_PATH = path.join(__dirname, 'prisma', 'schema.prisma.backup');

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function backupCurrentSchema() {
  if (fs.existsSync(SCHEMA_PATH)) {
    fs.copyFileSync(SCHEMA_PATH, BACKUP_PATH);
    log('✅ Current schema backed up');
  }
}

function updateSchema() {
  const updatedSchema = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Enhanced enums
enum UserRole {
  ADMIN
  STUDENT
  COMPANY
  UNIVERSITY
  HR_MANAGER
}

enum ApplicationStatus {
  PENDING
  REVIEWING
  SHORTLISTED
  INTERVIEW_SCHEDULED
  INTERVIEWED
  ACCEPTED
  REJECTED
  WITHDRAWN
}

enum JobType {
  INTERNSHIP
  FULL_TIME
  PART_TIME
  CONTRACT
  REMOTE
  FREELANCE
}

enum WorkMode {
  ONSITE
  REMOTE
  HYBRID
}

enum ExperienceLevel {
  ENTRY
  JUNIOR
  INTERMEDIATE
  SENIOR
  EXPERT
}

enum NotificationType {
  APPLICATION_SUBMITTED
  APPLICATION_STATUS_CHANGED
  NEW_JOB_POSTED
  INTERVIEW_SCHEDULED
  MESSAGE_RECEIVED
  SYSTEM_ANNOUNCEMENT
  JOB_RECOMMENDATION
  PROFILE_INCOMPLETE
}

enum SkillCategory {
  TECHNICAL
  SOFT_SKILL
  LANGUAGE
  CERTIFICATION
  TOOL
}

enum FileType {
  RESUME
  PORTFOLIO
  CERTIFICATE
  COMPANY_LOGO
  PROFILE_PHOTO
  VERIFICATION_DOC
  PROJECT_FILE
}

enum InterviewType {
  PHONE
  VIDEO
  ONSITE
  TECHNICAL
  HR_SCREENING
  PANEL
}

enum InterviewStatus {
  SCHEDULED
  COMPLETED
  CANCELLED
  RESCHEDULED
  NO_SHOW
}

enum CompanySize {
  STARTUP_1_10
  SMALL_11_50
  MEDIUM_51_200
  LARGE_201_1000
  ENTERPRISE_1000_PLUS
}

// Enhanced User model
model User {
  id          String   @id @default(uuid())
  email       String   @unique
  password    String?
  role        UserRole
  
  // Account status
  isActive    Boolean  @default(true)
  isVerified  Boolean  @default(false)
  
  // Social login
  socialProvider String?
  socialId       String?
  
  // Security
  twoFactorSecret    String?
  twoFactorEnabled   Boolean  @default(false)
  lastPasswordChange DateTime?
  failedLoginAttempts Int     @default(0)
  lockedUntil        DateTime?
  
  // Preferences
  emailNotifications Boolean @default(true)
  pushNotifications  Boolean @default(true)
  
  // Timestamps
  lastLogin  DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  deletedAt  DateTime?
  
  // Relationships
  studentProfile StudentProfile?
  applications   Application[]
  notifications  Notification[]
  fileUploads    FileUpload[]
  auditLogs      AuditLog[]
  activityLogs   ActivityLog[]
  referredApplications Application[] @relation("ApplicationReferrer")

  @@map("users")
}

// Enhanced StudentProfile model
model StudentProfile {
  id       String @id @default(uuid())
  userId   String @unique
  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Basic info
  firstName       String
  lastName        String
  phone           String?
  dateOfBirth     DateTime?
  avatar          String?
  
  // Education
  university      String?
  major           String?
  graduationYear  Int?
  gpa             Float?
  
  // Professional info
  skills          String[]  @default([])
  experience      String?
  portfolio       String?
  github          String?
  linkedin        String?
  resume          String?
  
  // Extended profile data
  emergencyContact    Json?
  projects           Json      @default("[]")
  certifications     Json      @default("[]")
  languages          Json      @default("[]")
  
  // Employment preferences
  preferredLocations    String[]      @default([])
  expectedSalaryMin     Int?
  expectedSalaryMax     Int?
  availabilityDate      DateTime?
  workAuthorization     String?
  
  // Profile stats
  profileViews       Int @default(0)
  profileCompletion  Int @default(0)
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@map("student_profiles")
}

// Job Categories
model JobCategory {
  id          String    @id @default(uuid())
  name        String    @unique
  parentId    String?
  parent      JobCategory? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    JobCategory[] @relation("CategoryHierarchy")
  description String?
  icon        String?
  color       String?
  isActive    Boolean   @default(true)
  sortOrder   Int       @default(0)
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  jobs        Job[]

  @@map("job_categories")
}

// Skills Master
model Skill {
  id          String        @id @default(uuid())
  name        String        @unique
  category    SkillCategory
  description String?
  isVerified  Boolean       @default(false)
  usageCount  Int           @default(0)
  
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@map("skills")
}

// Enhanced Job model
model Job {
  id                String           @id @default(uuid())
  companyId         String
  categoryId        String?
  category          JobCategory?     @relation(fields: [categoryId], references: [id])
  
  // Basic job info
  title             String
  description       String
  requirements      String[]         @default([])
  benefits          String[]         @default([])
  responsibilities  String[]         @default([])
  
  // Job details
  jobType           JobType?
  workMode          WorkMode?
  experienceLevel   ExperienceLevel?
  location          String
  
  // Compensation
  salaryMin         Int?
  salaryMax         Int?
  currency          String           @default("VND")
  
  // Application settings
  applicationDeadline DateTime?
  maxApplications   Int?
  autoCloseDate     DateTime?
  priorityLevel     Int              @default(1)
  
  // Skills and tags
  requiredSkills    String[]         @default([])
  preferredSkills   String[]         @default([])
  tags              String[]         @default([])
  
  // Screening
  screeningQuestions Json            @default("[]")
  
  // Status
  isActive          Boolean          @default(true)
  isFeatured        Boolean          @default(false)
  viewCount         Int              @default(0)
  
  // Timestamps
  publishedAt       DateTime?
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
  deletedAt         DateTime?

  // Relationships
  applications      Application[]

  @@map("jobs")
}

// Enhanced Application model
model Application {
  id              String              @id @default(uuid())
  jobId           String
  job             Job                 @relation(fields: [jobId], references: [id], onDelete: Cascade)
  studentId       String
  student         User                @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  // Application content
  coverLetter     String?
  customResume    String?
  
  // Screening
  screeningAnswers Json               @default("{}")
  
  // Source tracking
  source          String?
  referrerId      String?
  referrer        User?               @relation("ApplicationReferrer", fields: [referrerId], references: [id])
  
  // Status tracking
  status          ApplicationStatus   @default(PENDING)
  statusHistory   Json                @default("[]")
  
  // HR notes and feedback
  hrNotes         String?
  feedback        String?
  rating          Int?
  
  // Timeline
  appliedAt       DateTime            @default(now())
  reviewedAt      DateTime?
  respondedAt     DateTime?
  
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  @@unique([jobId, studentId])
  @@map("applications")
}

// Notifications
model Notification {
  id          String             @id @default(uuid())
  userId      String
  user        User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type        NotificationType
  title       String
  message     String
  data        Json?
  
  isRead      Boolean            @default(false)
  readAt      DateTime?
  
  createdAt   DateTime           @default(now())

  @@index([userId, isRead, createdAt])
  @@map("notifications")
}

// File Uploads
model FileUpload {
  id              String            @id @default(uuid())
  userId          String
  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  originalName    String
  fileName        String
  filePath        String
  fileSize        BigInt
  mimeType        String
  fileType        FileType
  isPublic        Boolean           @default(false)
  downloadCount   Int               @default(0)
  
  metadata        Json              @default("{}")
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  @@map("file_uploads")
}

// Audit Logs
model AuditLog {
  id           String   @id @default(uuid())
  userId       String?
  user         User?    @relation(fields: [userId], references: [id])
  
  tableName    String
  recordId     String
  operation    String
  oldValues    Json?
  newValues    Json?
  changedFields String[]
  ipAddress    String?
  userAgent    String?
  
  createdAt    DateTime @default(now())

  @@map("audit_logs")
}

// Activity Logs
model ActivityLog {
  id           String   @id @default(uuid())
  userId       String?
  user         User?    @relation(fields: [userId], references: [id])
  
  activityType String
  entityType   String?
  entityId     String?
  
  metadata     Json     @default("{}")
  ipAddress    String?
  
  createdAt    DateTime @default(now())

  @@index([userId, activityType, createdAt])
  @@map("activity_logs")
}

// System Settings
model SystemSetting {
  id    String @id @default(uuid())
  key   String @unique
  value String
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("system_settings")
}`;

  fs.writeFileSync(SCHEMA_PATH, updatedSchema);
  log('✅ Schema updated successfully');
}

function generatePrismaClient() {
  const { execSync } = require('child_process');
  
  try {
    log('🔄 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit', cwd: __dirname });
    log('✅ Prisma client generated successfully');
  } catch (error) {
    log('❌ Failed to generate Prisma client');
    log('Run manually: npx prisma generate');
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'update':
        backupCurrentSchema();
        updateSchema();
        generatePrismaClient();
        log('🎉 Schema update completed!');
        break;
        
      case 'backup':
        backupCurrentSchema();
        break;
        
      case 'generate':
        generatePrismaClient();
        break;
        
      default:
        console.log(`
Prisma Schema Update Tool

Usage:
  node update-schema.js update     Update schema with new fields and generate client
  node update-schema.js backup     Backup current schema
  node update-schema.js generate   Generate Prisma client only

The update command will:
1. Backup current schema to schema.prisma.backup
2. Update schema.prisma with new fields and tables
3. Generate new Prisma client

Note: Run database migration BEFORE updating the schema in production.
        `);
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  backupCurrentSchema,
  updateSchema,
  generatePrismaClient
};
