#!/usr/bin/env node

/**
 * Database Migration Script - Phase Implementation
 * Recruitment Platform v2.0
 * 
 * This script implements the database enhancement in phases to ensure
 * zero-downtime migration and proper testing at each step.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/recruitment_platform',
  MIGRATION_DIR: path.join(__dirname, 'migrations'),
  BACKUP_DIR: path.join(__dirname, 'backups'),
  LOG_FILE: path.join(__dirname, 'migration.log')
};

// Utility functions
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(CONFIG.LOG_FILE, logMessage + '\n');
}

function executeSQL(sqlFile) {
  log(`Executing SQL file: ${sqlFile}`);
  try {
    execSync(`psql "${CONFIG.DATABASE_URL}" -f "${sqlFile}"`, { stdio: 'inherit' });
    log(`✅ Successfully executed: ${sqlFile}`);
  } catch (error) {
    log(`❌ Error executing ${sqlFile}: ${error.message}`);
    throw error;
  }
}

function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(CONFIG.BACKUP_DIR, `backup_${timestamp}.sql`);
  
  log('Creating database backup...');
  try {
    if (!fs.existsSync(CONFIG.BACKUP_DIR)) {
      fs.mkdirSync(CONFIG.BACKUP_DIR, { recursive: true });
    }
    
    execSync(`pg_dump "${CONFIG.DATABASE_URL}" > "${backupFile}"`, { stdio: 'inherit' });
    log(`✅ Backup created: ${backupFile}`);
    return backupFile;
  } catch (error) {
    log(`❌ Backup failed: ${error.message}`);
    throw error;
  }
}

// Migration phases
const PHASES = {
  1: {
    name: 'Core Schema Updates',
    description: 'Add new columns to existing tables',
    files: ['phase1_core_schema.sql']
  },
  2: {
    name: 'New Tables Creation',
    description: 'Create new tables for enhanced functionality',
    files: ['phase2_new_tables.sql']
  },
  3: {
    name: 'Indexes and Constraints',
    description: 'Add performance indexes and foreign key constraints',
    files: ['phase3_indexes_constraints.sql']
  },
  4: {
    name: 'Triggers and Functions',
    description: 'Implement audit triggers and business logic functions',
    files: ['phase4_triggers_functions.sql']
  },
  5: {
    name: 'Initial Data and Settings',
    description: 'Insert master data and system settings',
    files: ['phase5_initial_data.sql']
  }
};

// Create individual phase migration files
function createPhaseMigrations() {
  log('Creating phase migration files...');

  // Phase 1: Core Schema Updates
  const phase1SQL = `
-- Phase 1: Core Schema Updates
-- Add new columns to existing tables

-- Update users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS social_provider VARCHAR(50),
ADD COLUMN IF NOT EXISTS social_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255),
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP,
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Update student_profiles table
ALTER TABLE student_profiles 
ADD COLUMN IF NOT EXISTS emergency_contact JSONB,
ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS preferred_locations TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS expected_salary_min INTEGER,
ADD COLUMN IF NOT EXISTS expected_salary_max INTEGER,
ADD COLUMN IF NOT EXISTS availability_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS work_authorization VARCHAR(100),
ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_completion INTEGER DEFAULT 0;

-- Update applications table
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS screening_answers JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS source VARCHAR(100),
ADD COLUMN IF NOT EXISTS referrer_id UUID,
ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS hr_notes TEXT,
ADD COLUMN IF NOT EXISTS feedback TEXT,
ADD COLUMN IF NOT EXISTS rating INTEGER,
ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP;

-- Update jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS salary_min INTEGER,
ADD COLUMN IF NOT EXISTS salary_max INTEGER,
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'VND',
ADD COLUMN IF NOT EXISTS application_deadline TIMESTAMP,
ADD COLUMN IF NOT EXISTS max_applications INTEGER,
ADD COLUMN IF NOT EXISTS auto_close_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS priority_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS required_skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS screening_questions JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS category_id UUID;

COMMIT;
`;

  // Phase 2: New Tables Creation
  const phase2SQL = `
-- Phase 2: New Tables Creation

-- Create enums first
DO $$
BEGIN
    CREATE TYPE "JobType" AS ENUM ('INTERNSHIP', 'FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE', 'FREELANCE');
    CREATE TYPE "WorkMode" AS ENUM ('ONSITE', 'REMOTE', 'HYBRID');
    CREATE TYPE "ExperienceLevel" AS ENUM ('ENTRY', 'JUNIOR', 'INTERMEDIATE', 'SENIOR', 'EXPERT');
    CREATE TYPE "NotificationType" AS ENUM (
        'APPLICATION_SUBMITTED', 
        'APPLICATION_STATUS_CHANGED', 
        'NEW_JOB_POSTED', 
        'INTERVIEW_SCHEDULED', 
        'MESSAGE_RECEIVED', 
        'SYSTEM_ANNOUNCEMENT', 
        'JOB_RECOMMENDATION', 
        'PROFILE_INCOMPLETE'
    );
    CREATE TYPE "SkillCategory" AS ENUM ('TECHNICAL', 'SOFT_SKILL', 'LANGUAGE', 'CERTIFICATION', 'TOOL');
    CREATE TYPE "FileType" AS ENUM ('RESUME', 'PORTFOLIO', 'CERTIFICATE', 'COMPANY_LOGO', 'PROFILE_PHOTO', 'VERIFICATION_DOC', 'PROJECT_FILE');
    CREATE TYPE "InterviewType" AS ENUM ('PHONE', 'VIDEO', 'ONSITE', 'TECHNICAL', 'HR_SCREENING', 'PANEL');
    CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW');
    CREATE TYPE "CompanySize" AS ENUM ('STARTUP_1_10', 'SMALL_11_50', 'MEDIUM_51_200', 'LARGE_201_1000', 'ENTERPRISE_1000_PLUS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Job Categories
CREATE TABLE IF NOT EXISTS job_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    parent_id UUID REFERENCES job_categories(id),
    description TEXT,
    icon VARCHAR(255),
    color VARCHAR(7),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Skills Master
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    category "SkillCategory" NOT NULL,
    description TEXT,
    is_verified BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type "NotificationType" NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- File Uploads
CREATE TABLE IF NOT EXISTS file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_name VARCHAR(500) NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    file_type "FileType" NOT NULL,
    is_public BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    table_name VARCHAR(255) NOT NULL,
    record_id VARCHAR(255) NOT NULL,
    operation VARCHAR(20) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    activity_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    created_at TIMESTAMP DEFAULT NOW()
);

-- System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMIT;
`;

  // Phase 3: Indexes and Constraints
  const phase3SQL = `
-- Phase 3: Indexes and Constraints

-- Add foreign key for job categories
ALTER TABLE jobs 
ADD CONSTRAINT IF NOT EXISTS fk_jobs_category_id 
FOREIGN KEY (category_id) REFERENCES job_categories(id);

-- Add foreign key for application referrer
ALTER TABLE applications 
ADD CONSTRAINT IF NOT EXISTS fk_applications_referrer_id 
FOREIGN KEY (referrer_id) REFERENCES users(id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_category_id ON jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);

CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON notifications(user_id, is_read, created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_type_created ON activity_logs(user_id, activity_type, created_at);

COMMIT;
`;

  // Phase 4: Triggers and Functions
  const phase4SQL = `
-- Phase 4: Triggers and Functions

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    changed_fields TEXT[];
BEGIN
    IF TG_OP = 'DELETE' THEN
        old_data = to_jsonb(OLD);
        INSERT INTO audit_logs (
            table_name, record_id, operation, old_values, created_at
        ) VALUES (
            TG_TABLE_NAME, OLD.id::TEXT, TG_OP, old_data, NOW()
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        old_data = to_jsonb(OLD);
        new_data = to_jsonb(NEW);
        
        SELECT array_agg(key) INTO changed_fields
        FROM jsonb_each(old_data) o
        WHERE NOT (new_data ? o.key AND new_data->>o.key = o.value);
        
        INSERT INTO audit_logs (
            table_name, record_id, operation, old_values, new_values, changed_fields, created_at
        ) VALUES (
            TG_TABLE_NAME, NEW.id::TEXT, TG_OP, old_data, new_data, changed_fields, NOW()
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        new_data = to_jsonb(NEW);
        INSERT INTO audit_logs (
            table_name, record_id, operation, new_values, created_at
        ) VALUES (
            TG_TABLE_NAME, NEW.id::TEXT, TG_OP, new_data, NOW()
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers
DROP TRIGGER IF EXISTS audit_users_trigger ON users;
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_jobs_trigger ON jobs;
CREATE TRIGGER audit_jobs_trigger
    AFTER INSERT OR UPDATE OR DELETE ON jobs
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_applications_trigger ON applications;
CREATE TRIGGER audit_applications_trigger
    AFTER INSERT OR UPDATE OR DELETE ON applications
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Profile completion calculation function
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    completion_score INTEGER := 0;
    profile_record RECORD;
BEGIN
    SELECT sp.* INTO profile_record
    FROM student_profiles sp
    WHERE sp.user_id = user_id_param;
    
    IF profile_record IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Calculate completion based on filled fields
    IF profile_record.first_name IS NOT NULL AND profile_record.first_name != '' THEN
        completion_score := completion_score + 5;
    END IF;
    IF profile_record.last_name IS NOT NULL AND profile_record.last_name != '' THEN
        completion_score := completion_score + 5;
    END IF;
    IF profile_record.phone IS NOT NULL AND profile_record.phone != '' THEN
        completion_score := completion_score + 5;
    END IF;
    IF profile_record.university IS NOT NULL AND profile_record.university != '' THEN
        completion_score := completion_score + 10;
    END IF;
    IF profile_record.major IS NOT NULL AND profile_record.major != '' THEN
        completion_score := completion_score + 10;
    END IF;
    IF array_length(profile_record.skills, 1) > 0 THEN
        completion_score := completion_score + 15;
    END IF;
    IF profile_record.resume IS NOT NULL AND profile_record.resume != '' THEN
        completion_score := completion_score + 20;
    END IF;
    IF profile_record.linkedin IS NOT NULL AND profile_record.linkedin != '' THEN
        completion_score := completion_score + 5;
    END IF;
    IF array_length(profile_record.preferred_locations, 1) > 0 THEN
        completion_score := completion_score + 10;
    END IF;
    
    RETURN LEAST(completion_score, 100);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update profile completion
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.profile_completion := calculate_profile_completion(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_student_profile_completion ON student_profiles;
CREATE TRIGGER update_student_profile_completion
    BEFORE UPDATE ON student_profiles
    FOR EACH ROW EXECUTE FUNCTION update_profile_completion();

COMMIT;
`;

  // Phase 5: Initial Data
  const phase5SQL = `
-- Phase 5: Initial Data and Settings

-- Insert job categories
INSERT INTO job_categories (name, description, icon, color) VALUES
('Technology', 'Software development, IT, and tech roles', 'code', '#3B82F6'),
('Marketing', 'Digital marketing, content, and promotion roles', 'megaphone', '#EF4444'),
('Sales', 'Sales representatives and business development', 'trending-up', '#10B981'),
('Design', 'UI/UX, graphic design, and creative roles', 'palette', '#8B5CF6'),
('Finance', 'Accounting, financial analysis, and banking', 'dollar-sign', '#F59E0B'),
('Human Resources', 'HR management and recruitment', 'users', '#EC4899')
ON CONFLICT (name) DO NOTHING;

-- Insert skills
INSERT INTO skills (name, category) VALUES
('JavaScript', 'TECHNICAL'),
('Python', 'TECHNICAL'),
('Java', 'TECHNICAL'),
('React', 'TECHNICAL'),
('Node.js', 'TECHNICAL'),
('Communication', 'SOFT_SKILL'),
('Leadership', 'SOFT_SKILL'),
('Problem Solving', 'SOFT_SKILL'),
('English', 'LANGUAGE'),
('Vietnamese', 'LANGUAGE')
ON CONFLICT (name) DO NOTHING;

-- Insert system settings
INSERT INTO system_settings (key, value) VALUES
('max_file_upload_size', '10485760'),
('allowed_file_types', 'pdf,doc,docx,jpg,jpeg,png'),
('session_timeout_minutes', '30'),
('max_login_attempts', '5')
ON CONFLICT (key) DO NOTHING;

-- Update existing data
UPDATE users SET is_active = true WHERE is_active IS NULL;
UPDATE users SET email_notifications = true WHERE email_notifications IS NULL;
UPDATE users SET push_notifications = true WHERE push_notifications IS NULL;

-- Update profile completion for existing students
UPDATE student_profiles 
SET profile_completion = calculate_profile_completion(user_id)
WHERE profile_completion IS NULL OR profile_completion = 0;

COMMIT;
`;

  // Write phase files
  const phases = [
    { file: 'phase1_core_schema.sql', content: phase1SQL },
    { file: 'phase2_new_tables.sql', content: phase2SQL },
    { file: 'phase3_indexes_constraints.sql', content: phase3SQL },
    { file: 'phase4_triggers_functions.sql', content: phase4SQL },
    { file: 'phase5_initial_data.sql', content: phase5SQL }
  ];

  if (!fs.existsSync(CONFIG.MIGRATION_DIR)) {
    fs.mkdirSync(CONFIG.MIGRATION_DIR, { recursive: true });
  }

  phases.forEach(phase => {
    const filePath = path.join(CONFIG.MIGRATION_DIR, phase.file);
    fs.writeFileSync(filePath, phase.content);
    log(`✅ Created: ${phase.file}`);
  });
}

async function runPhase(phaseNumber) {
  const phase = PHASES[phaseNumber];
  if (!phase) {
    throw new Error(`Phase ${phaseNumber} not found`);
  }

  log(`\n🚀 Starting Phase ${phaseNumber}: ${phase.name}`);
  log(`Description: ${phase.description}`);

  for (const file of phase.files) {
    const filePath = path.join(CONFIG.MIGRATION_DIR, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Migration file not found: ${filePath}`);
    }
    executeSQL(filePath);
  }

  log(`✅ Phase ${phaseNumber} completed successfully`);
}

async function runAllPhases() {
  log('🔄 Starting complete database migration...');
  
  // Create backup first
  const backupFile = createBackup();
  
  try {
    // Run all phases
    for (let i = 1; i <= 5; i++) {
      await runPhase(i);
    }
    
    log('\n🎉 All migration phases completed successfully!');
    log('Database has been enhanced with all new features.');
    
  } catch (error) {
    log(`\n❌ Migration failed: ${error.message}`);
    log(`💾 Backup available at: ${backupFile}`);
    log('To restore backup: psql "YOUR_DATABASE_URL" < backup_file.sql');
    throw error;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'create-files':
        createPhaseMigrations();
        log('✅ Migration files created successfully');
        break;
        
      case 'run':
        const phaseNumber = parseInt(args[1]);
        if (phaseNumber) {
          await runPhase(phaseNumber);
        } else {
          await runAllPhases();
        }
        break;
        
      case 'backup':
        createBackup();
        break;
        
      default:
        console.log(`
Database Migration Tool - Recruitment Platform v2.0

Usage:
  node migrate.js create-files    Create migration files for all phases
  node migrate.js run            Run all migration phases
  node migrate.js run [phase]    Run specific phase (1-5)
  node migrate.js backup         Create database backup

Phases:
  1. Core Schema Updates
  2. New Tables Creation  
  3. Indexes and Constraints
  4. Triggers and Functions
  5. Initial Data and Settings

Environment Variables:
  DATABASE_URL - PostgreSQL connection string
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
  createPhaseMigrations,
  runPhase,
  runAllPhases,
  createBackup
};
