-- Enhanced Database Migration Script
-- Recruitment Platform v2.0 Complete Database Schema
-- Date: $(date)

-- ================================================
-- 1. CREATE ENUMS
-- ================================================

-- Update existing enums and add new ones
DO $$
BEGIN
    -- Update UserRole enum
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'HR_MANAGER';
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'UNIVERSITY';
    
    -- Create new enums
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
    CREATE TYPE "VirusScanStatus" AS ENUM ('PENDING', 'CLEAN', 'INFECTED', 'FAILED');
    CREATE TYPE "EmploymentStatus" AS ENUM ('CURRENT', 'FORMER', 'INTERN', 'CONTRACTOR');
    CREATE TYPE "CompanySize" AS ENUM ('STARTUP_1_10', 'SMALL_11_50', 'MEDIUM_51_200', 'LARGE_201_1000', 'ENTERPRISE_1000_PLUS');
    CREATE TYPE "InterviewType" AS ENUM ('PHONE', 'VIDEO', 'ONSITE', 'TECHNICAL', 'HR_SCREENING', 'PANEL');
    CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ================================================
-- 2. UPDATE EXISTING TABLES
-- ================================================

-- Update users table with new fields
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

-- Update student_profiles table with extensive new fields
ALTER TABLE student_profiles 
ADD COLUMN IF NOT EXISTS emergency_contact JSONB,
ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS preferred_job_types "JobType"[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_work_modes "WorkMode"[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_locations TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS expected_salary_min INTEGER,
ADD COLUMN IF NOT EXISTS expected_salary_max INTEGER,
ADD COLUMN IF NOT EXISTS availability_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS work_authorization VARCHAR(100),
ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_completion INTEGER DEFAULT 0;

-- Update applications table with new fields
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS screening_answers JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS source VARCHAR(100),
ADD COLUMN IF NOT EXISTS referrer_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS hr_notes TEXT,
ADD COLUMN IF NOT EXISTS feedback TEXT,
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP;

-- Update jobs table with new fields
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS job_type "JobType",
ADD COLUMN IF NOT EXISTS work_mode "WorkMode",
ADD COLUMN IF NOT EXISTS experience_level "ExperienceLevel",
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

-- ================================================
-- 3. CREATE NEW TABLES
-- ================================================

-- Company Profiles
CREATE TABLE IF NOT EXISTS company_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    company_size "CompanySize",
    industry VARCHAR(255),
    website VARCHAR(500),
    logo VARCHAR(500),
    description TEXT,
    founded_year INTEGER,
    employee_count_range VARCHAR(50),
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Vietnam',
    benefits JSONB DEFAULT '[]',
    company_culture JSONB DEFAULT '{}',
    awards JSONB DEFAULT '[]',
    linkedin VARCHAR(500),
    facebook VARCHAR(500),
    twitter VARCHAR(500),
    is_verified BOOLEAN DEFAULT false,
    verification_doc VARCHAR(500),
    profile_views INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- University Profiles
CREATE TABLE IF NOT EXISTS university_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    university_name VARCHAR(255) NOT NULL,
    university_code VARCHAR(50) UNIQUE,
    establishment_year INTEGER,
    university_type VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Vietnam',
    website VARCHAR(500),
    logo VARCHAR(500),
    description TEXT,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    faculties JSONB DEFAULT '[]',
    programs JSONB DEFAULT '[]',
    student_count INTEGER,
    industry_partnerships JSONB DEFAULT '[]',
    placement_rate DECIMAL(5,2),
    is_verified BOOLEAN DEFAULT false,
    verification_documents JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

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

-- Locations Master
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    parent_id UUID REFERENCES locations(id),
    code VARCHAR(10),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Interviews
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type "InterviewType" NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    duration INTEGER DEFAULT 60,
    location TEXT,
    meeting_link VARCHAR(500),
    interviewer VARCHAR(255),
    interviewer_email VARCHAR(255),
    status "InterviewStatus" DEFAULT 'SCHEDULED',
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
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

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id),
    room_id VARCHAR(255),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    file_url VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Company Reviews
CREATE TABLE IF NOT EXISTS company_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    overall_rating DECIMAL(2,1) NOT NULL,
    work_life_balance DECIMAL(2,1),
    salary_benefits DECIMAL(2,1),
    career_development DECIMAL(2,1),
    management DECIMAL(2,1),
    title VARCHAR(255),
    pros TEXT,
    cons TEXT,
    advice_to_management TEXT,
    employment_status "EmploymentStatus",
    job_title VARCHAR(255),
    employment_duration INTEGER,
    is_approved BOOLEAN DEFAULT false,
    is_anonymous BOOLEAN DEFAULT true,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, reviewer_id)
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
    virus_scan_status "VirusScanStatus" DEFAULT 'PENDING',
    virus_scan_result JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Refresh Tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(500) NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    location_info JSONB,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
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

-- Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    subject VARCHAR(500) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Feature Flags
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_enabled BOOLEAN DEFAULT false,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Analytics
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric VARCHAR(255) NOT NULL,
    value INTEGER NOT NULL,
    date DATE NOT NULL,
    user_id UUID,
    job_id UUID,
    company_id UUID,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(metric, date, user_id, job_id, company_id)
);

-- ================================================
-- 4. ADD FOREIGN KEY CONSTRAINTS
-- ================================================

-- Add foreign key for job categories
ALTER TABLE jobs 
ADD CONSTRAINT fk_jobs_category_id 
FOREIGN KEY (category_id) REFERENCES job_categories(id);

-- ================================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- ================================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Job indexes
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_category_id ON jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_salary_range ON jobs(salary_min, salary_max);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);

-- Application indexes
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON notifications(user_id, is_read, created_at);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_type_created ON activity_logs(user_id, activity_type, created_at);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_metric_date ON analytics(metric, date);

-- ================================================
-- 6. CREATE AUDIT TRIGGERS
-- ================================================

-- Function to log audit trail
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
        
        -- Get changed fields
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

-- Create audit triggers for important tables
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_jobs_trigger
    AFTER INSERT OR UPDATE OR DELETE ON jobs
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_applications_trigger
    AFTER INSERT OR UPDATE OR DELETE ON applications
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_company_profiles_trigger
    AFTER INSERT OR UPDATE OR DELETE ON company_profiles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ================================================
-- 7. CREATE BUSINESS LOGIC FUNCTIONS
-- ================================================

-- Function to calculate profile completion
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
    
    -- Basic info (30 points)
    IF profile_record.first_name IS NOT NULL AND profile_record.first_name != '' THEN
        completion_score := completion_score + 5;
    END IF;
    IF profile_record.last_name IS NOT NULL AND profile_record.last_name != '' THEN
        completion_score := completion_score + 5;
    END IF;
    IF profile_record.phone IS NOT NULL AND profile_record.phone != '' THEN
        completion_score := completion_score + 5;
    END IF;
    IF profile_record.date_of_birth IS NOT NULL THEN
        completion_score := completion_score + 5;
    END IF;
    IF profile_record.avatar IS NOT NULL AND profile_record.avatar != '' THEN
        completion_score := completion_score + 10;
    END IF;
    
    -- Education (25 points)
    IF profile_record.university IS NOT NULL AND profile_record.university != '' THEN
        completion_score := completion_score + 10;
    END IF;
    IF profile_record.major IS NOT NULL AND profile_record.major != '' THEN
        completion_score := completion_score + 10;
    END IF;
    IF profile_record.graduation_year IS NOT NULL THEN
        completion_score := completion_score + 5;
    END IF;
    
    -- Professional (25 points)
    IF array_length(profile_record.skills, 1) > 0 THEN
        completion_score := completion_score + 10;
    END IF;
    IF profile_record.resume IS NOT NULL AND profile_record.resume != '' THEN
        completion_score := completion_score + 15;
    END IF;
    
    -- Links (10 points)
    IF profile_record.linkedin IS NOT NULL AND profile_record.linkedin != '' THEN
        completion_score := completion_score + 5;
    END IF;
    IF profile_record.github IS NOT NULL AND profile_record.github != '' THEN
        completion_score := completion_score + 5;
    END IF;
    
    -- Preferences (10 points)
    IF array_length(profile_record.preferred_job_types, 1) > 0 THEN
        completion_score := completion_score + 5;
    END IF;
    IF array_length(profile_record.preferred_locations, 1) > 0 THEN
        completion_score := completion_score + 5;
    END IF;
    
    RETURN completion_score;
END;
$$ LANGUAGE plpgsql;

-- Function to update profile completion automatically
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.profile_completion := calculate_profile_completion(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update profile completion
CREATE TRIGGER update_student_profile_completion
    BEFORE UPDATE ON student_profiles
    FOR EACH ROW EXECUTE FUNCTION update_profile_completion();

-- Function for job recommendations
CREATE OR REPLACE FUNCTION get_job_recommendations(user_id_param UUID, limit_param INTEGER DEFAULT 10)
RETURNS TABLE(
    job_id UUID,
    title VARCHAR,
    company_name VARCHAR,
    match_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH user_profile AS (
        SELECT sp.skills, sp.preferred_job_types, sp.preferred_locations, sp.major
        FROM student_profiles sp
        WHERE sp.user_id = user_id_param
    ),
    job_scores AS (
        SELECT 
            j.id,
            j.title,
            cp.company_name,
            (
                -- Skill match (40%)
                CASE 
                    WHEN array_length(j.required_skills, 1) > 0 THEN
                        (array_length(array(SELECT unnest(j.required_skills) INTERSECT SELECT unnest(up.skills)), 1)::DECIMAL / 
                         array_length(j.required_skills, 1)::DECIMAL) * 0.4
                    ELSE 0.2
                END +
                -- Job type match (30%)
                CASE 
                    WHEN j.job_type = ANY(up.preferred_job_types) THEN 0.3
                    ELSE 0
                END +
                -- Location match (20%)
                CASE 
                    WHEN j.location = ANY(up.preferred_locations) THEN 0.2
                    ELSE 0.1
                END +
                -- Major relevance (10%)
                CASE 
                    WHEN LOWER(j.title) LIKE '%' || LOWER(up.major) || '%' THEN 0.1
                    ELSE 0.05
                END
            ) AS score
        FROM jobs j
        CROSS JOIN user_profile up
        JOIN company_profiles cp ON j.company_id = cp.id
        WHERE j.is_active = true
          AND j.application_deadline > NOW()
          AND NOT EXISTS (
              SELECT 1 FROM applications a 
              WHERE a.job_id = j.id AND a.student_id = user_id_param
          )
    )
    SELECT js.id, js.title, js.company_name, ROUND(js.score, 3)
    FROM job_scores js
    ORDER BY js.score DESC
    LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 8. INSERT INITIAL DATA
-- ================================================

-- Insert job categories
INSERT INTO job_categories (name, description, icon, color) VALUES
('Technology', 'Software development, IT, and tech roles', 'code', '#3B82F6'),
('Marketing', 'Digital marketing, content, and promotion roles', 'megaphone', '#EF4444'),
('Sales', 'Sales representatives and business development', 'trending-up', '#10B981'),
('Design', 'UI/UX, graphic design, and creative roles', 'palette', '#8B5CF6'),
('Finance', 'Accounting, financial analysis, and banking', 'dollar-sign', '#F59E0B'),
('Human Resources', 'HR management and recruitment', 'users', '#EC4899'),
('Operations', 'Operations management and logistics', 'settings', '#6B7280'),
('Customer Service', 'Support and customer relations', 'headphones', '#14B8A6')
ON CONFLICT (name) DO NOTHING;

-- Insert skills
INSERT INTO skills (name, category) VALUES
('JavaScript', 'TECHNICAL'),
('Python', 'TECHNICAL'),
('Java', 'TECHNICAL'),
('React', 'TECHNICAL'),
('Node.js', 'TECHNICAL'),
('SQL', 'TECHNICAL'),
('Communication', 'SOFT_SKILL'),
('Leadership', 'SOFT_SKILL'),
('Problem Solving', 'SOFT_SKILL'),
('Teamwork', 'SOFT_SKILL'),
('English', 'LANGUAGE'),
('Japanese', 'LANGUAGE'),
('Korean', 'LANGUAGE'),
('AWS Certification', 'CERTIFICATION'),
('Google Analytics', 'TOOL'),
('Figma', 'TOOL')
ON CONFLICT (name) DO NOTHING;

-- Insert email templates
INSERT INTO email_templates (name, subject, html_content, text_content, variables) VALUES
('welcome_student', 'Welcome to Recruitment Platform!', 
 '<h1>Welcome {{firstName}}!</h1><p>Thank you for joining our platform.</p>', 
 'Welcome {{firstName}}! Thank you for joining our platform.',
 '["firstName", "email"]'),
('application_submitted', 'Application Submitted Successfully', 
 '<h1>Application Submitted</h1><p>Your application for {{jobTitle}} has been submitted.</p>', 
 'Your application for {{jobTitle}} has been submitted.',
 '["jobTitle", "companyName", "firstName"]'),
('interview_scheduled', 'Interview Scheduled', 
 '<h1>Interview Scheduled</h1><p>Your interview for {{jobTitle}} is scheduled for {{interviewDate}}.</p>', 
 'Your interview for {{jobTitle}} is scheduled for {{interviewDate}}.',
 '["jobTitle", "companyName", "interviewDate", "interviewTime"]')
ON CONFLICT (name) DO NOTHING;

-- Insert system settings
INSERT INTO system_settings (key, value) VALUES
('max_file_upload_size', '10485760'), -- 10MB
('allowed_file_types', 'pdf,doc,docx,jpg,jpeg,png'),
('session_timeout_minutes', '30'),
('max_login_attempts', '5'),
('password_min_length', '8'),
('notification_batch_size', '100')
ON CONFLICT (key) DO NOTHING;

-- ================================================
-- 9. CREATE STORED PROCEDURES FOR ANALYTICS
-- ================================================

-- Daily analytics aggregation procedure
CREATE OR REPLACE FUNCTION aggregate_daily_analytics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
BEGIN
    -- User registrations
    INSERT INTO analytics (metric, value, date, created_at)
    SELECT 
        'user_registrations',
        COUNT(*),
        target_date,
        NOW()
    FROM users 
    WHERE DATE(created_at) = target_date
    ON CONFLICT (metric, date, user_id, job_id, company_id) DO UPDATE 
    SET value = EXCLUDED.value;
    
    -- Job applications
    INSERT INTO analytics (metric, value, date, created_at)
    SELECT 
        'job_applications',
        COUNT(*),
        target_date,
        NOW()
    FROM applications 
    WHERE DATE(created_at) = target_date
    ON CONFLICT (metric, date, user_id, job_id, company_id) DO UPDATE 
    SET value = EXCLUDED.value;
    
    -- Job posts
    INSERT INTO analytics (metric, value, date, created_at)
    SELECT 
        'job_posts',
        COUNT(*),
        target_date,
        NOW()
    FROM jobs 
    WHERE DATE(created_at) = target_date
    ON CONFLICT (metric, date, user_id, job_id, company_id) DO UPDATE 
    SET value = EXCLUDED.value;
    
    -- Profile views
    INSERT INTO analytics (metric, value, date, created_at)
    SELECT 
        'profile_views',
        COUNT(*),
        target_date,
        NOW()
    FROM activity_logs 
    WHERE activity_type = 'profile_view' 
      AND DATE(created_at) = target_date
    ON CONFLICT (metric, date, user_id, job_id, company_id) DO UPDATE 
    SET value = EXCLUDED.value;
    
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 10. FINAL UPDATES AND VALIDATIONS
-- ================================================

-- Update existing data where needed
UPDATE users SET is_active = true WHERE is_active IS NULL;
UPDATE users SET is_verified = false WHERE is_verified IS NULL;
UPDATE users SET email_notifications = true WHERE email_notifications IS NULL;
UPDATE users SET push_notifications = true WHERE push_notifications IS NULL;

-- Set default values for new fields in existing records
UPDATE student_profiles 
SET profile_completion = calculate_profile_completion(user_id)
WHERE profile_completion = 0;

-- Create initial analytics data for today
SELECT aggregate_daily_analytics(CURRENT_DATE);

COMMIT;
