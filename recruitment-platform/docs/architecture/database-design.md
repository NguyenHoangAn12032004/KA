# Database Design Document
# Hệ Thống Quản Lý Tuyển Dụng & Thực Tập Real-time

**Phiên bản**: 1.0  
**Ngày tạo**: July 12, 2025  
**Người tạo**: Database Architecture Team  

---

## 1. Database Overview

### 1.1 Database Strategy
**Multi-Database Architecture** với specialized databases cho different use cases:

- **PostgreSQL**: Primary transactional database
- **Redis**: Caching và real-time data
- **Elasticsearch**: Search và analytics
- **AWS S3**: File storage với metadata

### 1.2 Design Principles
- **ACID Compliance**: Ensure data consistency
- **Normalization**: 3NF compliance với selective denormalization
- **Scalability**: Horizontal scaling capability
- **Performance**: Optimized indexing strategy
- **Security**: Row-level security và encryption
- **Audit Trail**: Track all data changes

## 2. Entity Relationship Diagram (ERD)

### 2.1 Core Entities Overview
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Users    │────▶│  Companies  │◄────│    Jobs     │
│             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│Student      │     │Company      │     │Applications │
│Profiles     │     │Profiles     │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                       │
       │              ┌─────────────┐          │
       └─────────────▶│   Skills    │◄─────────┘
                      │             │
                      └─────────────┘
```

### 2.2 Detailed ERD
```sql
-- Core relationship structure
Users ||--o{ StudentProfiles : has
Users ||--o{ CompanyUsers : belongs_to
Companies ||--o{ Jobs : posts
Users ||--o{ Applications : submits
Jobs ||--o{ Applications : receives
Users ||--o{ UserSkills : has
Skills ||--o{ UserSkills : assigned_to
Skills ||--o{ JobSkills : required_for
Jobs ||--o{ JobSkills : requires
```

## 3. Schema Definition

### 3.1 Enums và Custom Types

```sql
-- User types
CREATE TYPE user_type_enum AS ENUM (
    'student',
    'company_recruiter', 
    'company_admin',
    'university_admin',
    'system_admin'
);

-- Job types
CREATE TYPE job_type_enum AS ENUM (
    'full_time',
    'part_time', 
    'internship',
    'contract',
    'freelance'
);

-- Experience levels
CREATE TYPE experience_level_enum AS ENUM (
    'entry_level',
    'mid_level',
    'senior_level',
    'executive'
);

-- Application status
CREATE TYPE application_status_enum AS ENUM (
    'draft',
    'submitted',
    'under_review',
    'phone_screen',
    'interview_scheduled',
    'interview_completed',
    'final_round',
    'offer_extended',
    'offer_accepted',
    'offer_declined',
    'hired',
    'rejected',
    'withdrawn'
);

-- Company sizes
CREATE TYPE company_size_enum AS ENUM (
    'startup',          -- 1-10 employees
    'small',           -- 11-50 employees  
    'medium',          -- 51-200 employees
    'large',           -- 201-1000 employees
    'enterprise'       -- 1000+ employees
);

-- Skill proficiency levels
CREATE TYPE proficiency_level_enum AS ENUM (
    'beginner',
    'intermediate', 
    'advanced',
    'expert'
);

-- Notification types
CREATE TYPE notification_type_enum AS ENUM (
    'application_status_changed',
    'new_job_match',
    'interview_scheduled',
    'message_received',
    'profile_viewed',
    'job_deadline_reminder',
    'system_announcement'
);
```

### 3.2 Core Tables

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- NULL for social login only users
    user_type user_type_enum NOT NULL,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    
    -- Profile Management
    profile_photo_url VARCHAR(500),
    profile_completion_score INTEGER DEFAULT 0 CHECK (profile_completion_score >= 0 AND profile_completion_score <= 100),
    
    -- Account Status
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deactivated')),
    
    -- Security
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(100),
    last_password_change TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    
    -- Privacy Settings
    profile_visibility VARCHAR(20) DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'companies_only')),
    allow_recruiter_contact BOOLEAN DEFAULT TRUE,
    allow_marketing_emails BOOLEAN DEFAULT TRUE,
    
    -- Audit Fields
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    created_by UUID,
    
    -- Indexes
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_status ON users(account_status) WHERE account_status = 'active';
```

#### Companies Table
```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    website VARCHAR(255),
    
    -- Visual Identity
    logo_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    brand_colors JSONB, -- {"primary": "#1976d2", "secondary": "#dc004e"}
    
    -- Business Details
    industry VARCHAR(100),
    company_size company_size_enum,
    founded_year INTEGER CHECK (founded_year >= 1800 AND founded_year <= EXTRACT(YEAR FROM NOW())),
    employee_count INTEGER,
    
    -- Contact Information
    headquarters_address JSONB,
    phone VARCHAR(20),
    email VARCHAR(255),
    
    -- Social Media
    social_links JSONB, -- {"linkedin": "url", "twitter": "url", "facebook": "url"}
    
    -- Company Culture
    culture_tags TEXT[], -- ["remote-friendly", "innovative", "fast-paced"]
    benefits TEXT[],     -- ["health-insurance", "flexible-hours", "learning-budget"]
    work_environment TEXT,
    mission_statement TEXT,
    
    -- Verification & Status
    verified BOOLEAN DEFAULT FALSE,
    verification_documents JSONB,
    subscription_plan VARCHAR(50) DEFAULT 'free',
    subscription_expires_at TIMESTAMP,
    
    -- Metrics
    total_jobs_posted INTEGER DEFAULT 0,
    total_hires INTEGER DEFAULT 0,
    avg_response_time INTEGER, -- in hours
    company_rating DECIMAL(3,2) DEFAULT 0.0,
    
    -- Audit Fields
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Indexes for companies table
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_size ON companies(company_size);
CREATE INDEX idx_companies_verified ON companies(verified) WHERE verified = TRUE;
CREATE INDEX idx_companies_name_search ON companies USING gin(to_tsvector('english', name));
```

#### Company Users (Many-to-Many relationship)
```sql
CREATE TABLE company_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    role VARCHAR(50) NOT NULL DEFAULT 'recruiter', -- recruiter, admin, owner
    permissions JSONB DEFAULT '[]'::jsonb, -- ["post_jobs", "view_analytics", "manage_users"]
    
    -- Employment Details
    job_title VARCHAR(100),
    department VARCHAR(100),
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit Fields
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    added_by UUID REFERENCES users(id),
    
    UNIQUE(company_id, user_id, is_active) -- Prevent duplicate active relationships
);

CREATE INDEX idx_company_users_company ON company_users(company_id);
CREATE INDEX idx_company_users_user ON company_users(user_id);
CREATE INDEX idx_company_users_active ON company_users(is_active) WHERE is_active = TRUE;
```

#### Student Profiles
```sql
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Academic Information
    university VARCHAR(255),
    university_id UUID, -- Reference to universities table if implemented
    degree_level VARCHAR(50), -- bachelor, master, phd
    major VARCHAR(100),
    minor VARCHAR(100),
    gpa DECIMAL(4,3) CHECK (gpa >= 0.0 AND gpa <= 4.0),
    graduation_date DATE,
    academic_year INTEGER,
    
    -- Career Preferences
    preferred_job_types job_type_enum[],
    preferred_locations JSONB, -- [{"city": "Ho Chi Minh City", "country": "Vietnam", "remote": true}]
    salary_expectations JSONB, -- {"min": 10000000, "max": 15000000, "currency": "VND", "period": "monthly"}
    preferred_company_sizes company_size_enum[],
    preferred_industries TEXT[],
    availability_date DATE,
    
    -- Professional Documents
    resume_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    cover_letter_template TEXT,
    
    -- Additional Information
    languages JSONB, -- [{"language": "English", "proficiency": "fluent"}, {"language": "Vietnamese", "proficiency": "native"}]
    certifications JSONB, -- [{"name": "AWS Solutions Architect", "issuer": "Amazon", "date": "2024-01-15", "url": "cert-url"}]
    achievements TEXT[],
    
    -- Preferences
    open_to_relocation BOOLEAN DEFAULT FALSE,
    visa_sponsorship_required BOOLEAN DEFAULT FALSE,
    part_time_availability BOOLEAN DEFAULT TRUE,
    internship_availability BOOLEAN DEFAULT TRUE,
    
    -- Audit Fields
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id)
);

CREATE INDEX idx_student_profiles_university ON student_profiles(university);
CREATE INDEX idx_student_profiles_graduation ON student_profiles(graduation_date);
CREATE INDEX idx_student_profiles_availability ON student_profiles(availability_date);
```

#### Skills Management
```sql
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50), -- technical, soft, language, tools
    description TEXT,
    popularity_score INTEGER DEFAULT 0, -- Based on demand
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    
    proficiency_level proficiency_level_enum NOT NULL,
    years_experience INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id), -- Verified by employer/colleague
    verified_at TIMESTAMP,
    
    -- Skill Context
    acquired_through VARCHAR(100), -- education, work, self-study, certification
    last_used DATE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, skill_id)
);

CREATE INDEX idx_user_skills_user ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill ON user_skills(skill_id);
CREATE INDEX idx_user_skills_proficiency ON user_skills(proficiency_level);
```

#### Jobs Table
```sql
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Basic Job Information
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL, -- SEO-friendly URL
    description TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    benefits TEXT,
    
    -- Job Classification
    job_type job_type_enum NOT NULL,
    experience_level experience_level_enum,
    department VARCHAR(100),
    employment_type VARCHAR(50) DEFAULT 'permanent', -- permanent, temporary, contract
    
    -- Location Information
    location JSONB NOT NULL, -- {"city": "HCMC", "address": "123 Street", "remote": true, "hybrid": false}
    remote_option BOOLEAN DEFAULT FALSE,
    hybrid_option BOOLEAN DEFAULT FALSE,
    relocation_assistance BOOLEAN DEFAULT FALSE,
    
    -- Compensation
    salary_range JSONB, -- {"min": 15000000, "max": 25000000, "currency": "VND", "period": "monthly", "negotiable": true}
    compensation_details JSONB, -- {"base_salary": true, "bonus": true, "equity": false, "benefits": [...]}
    
    -- Application Details
    application_deadline TIMESTAMP,
    start_date DATE,
    number_of_positions INTEGER DEFAULT 1,
    application_process TEXT,
    
    -- Job Status & Management
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'closed', 'expired')),
    priority_level INTEGER DEFAULT 1 CHECK (priority_level >= 1 AND priority_level <= 5),
    is_featured BOOLEAN DEFAULT FALSE,
    is_urgent BOOLEAN DEFAULT FALSE,
    
    -- SEO & Marketing
    meta_title VARCHAR(255),
    meta_description TEXT,
    tags TEXT[], -- ["javascript", "remote", "entry-level"]
    
    -- Analytics & Metrics
    view_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    
    -- Audit Fields
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP,
    closed_at TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    
    CONSTRAINT jobs_slug_company_unique UNIQUE(company_id, slug)
);

-- Indexes for jobs table
CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status) WHERE status = 'active';
CREATE INDEX idx_jobs_type ON jobs(job_type);
CREATE INDEX idx_jobs_location ON jobs USING gin(location);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_deadline ON jobs(application_deadline) WHERE application_deadline > NOW();
CREATE INDEX idx_jobs_search ON jobs USING gin(to_tsvector('english', title || ' ' || description));
```

#### Job Skills (Many-to-Many)
```sql
CREATE TABLE job_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    
    is_required BOOLEAN DEFAULT TRUE, -- required vs preferred
    proficiency_level proficiency_level_enum,
    years_experience_required INTEGER DEFAULT 0,
    importance_weight INTEGER DEFAULT 1 CHECK (importance_weight >= 1 AND importance_weight <= 5),
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(job_id, skill_id)
);

CREATE INDEX idx_job_skills_job ON job_skills(job_id);
CREATE INDEX idx_job_skills_skill ON job_skills(skill_id);
CREATE INDEX idx_job_skills_required ON job_skills(is_required);
```

#### Applications Table
```sql
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Application Content
    cover_letter TEXT,
    resume_file_url VARCHAR(500),
    additional_documents JSONB, -- [{"name": "Portfolio", "url": "file-url", "type": "pdf"}]
    
    -- Application Answers
    application_answers JSONB, -- [{"question_id": "q1", "question": "Why interested?", "answer": "Because..."}]
    
    -- Status Management
    status application_status_enum DEFAULT 'submitted',
    status_history JSONB DEFAULT '[]'::jsonb, -- [{"status": "submitted", "timestamp": "...", "changed_by": "uuid", "note": "..."}]
    
    -- Evaluation
    recruiter_rating INTEGER CHECK (recruiter_rating >= 1 AND recruiter_rating <= 5),
    recruiter_notes TEXT,
    internal_notes TEXT, -- Not visible to candidate
    match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
    
    -- Interview Information
    interview_scheduled_at TIMESTAMP,
    interview_completed_at TIMESTAMP,
    interview_feedback JSONB,
    
    -- Offer Information
    offer_extended_at TIMESTAMP,
    offer_details JSONB, -- {"salary": 20000000, "start_date": "2025-09-01", "benefits": [...]}
    offer_response_deadline TIMESTAMP,
    offer_accepted_at TIMESTAMP,
    
    -- Timestamps
    applied_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    withdrawn_at TIMESTAMP,
    
    -- Source Tracking
    application_source VARCHAR(100), -- website, email, referral, linkedin
    referred_by UUID REFERENCES users(id),
    
    UNIQUE(job_id, applicant_id) -- Prevent duplicate applications
);

-- Indexes for applications table
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_applicant ON applications(applicant_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_applied_at ON applications(applied_at DESC);
CREATE INDEX idx_applications_company ON applications(job_id) 
    INCLUDE (status, applied_at); -- Covering index for recruiter queries
```

### 3.3 Communication & Messaging

#### Conversations Table
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Related Application (if applicable)
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    
    -- Participants
    participant_1_id UUID NOT NULL REFERENCES users(id),
    participant_2_id UUID NOT NULL REFERENCES users(id),
    
    -- Conversation State
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
    subject VARCHAR(255),
    
    -- Metadata
    last_message_at TIMESTAMP DEFAULT NOW(),
    last_message_preview TEXT,
    
    -- Audit Fields
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT conversations_participants_check CHECK (participant_1_id != participant_2_id),
    UNIQUE(application_id, participant_1_id, participant_2_id)
);

CREATE INDEX idx_conversations_participants ON conversations(participant_1_id, participant_2_id);
CREATE INDEX idx_conversations_application ON conversations(application_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
```

#### Messages Table
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    
    -- Message Content
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system')),
    attachments JSONB, -- [{"name": "resume.pdf", "url": "file-url", "size": 1024576}]
    
    -- Message State
    edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    
    -- Read Status (for each participant)
    read_by_participant_1 BOOLEAN DEFAULT FALSE,
    read_by_participant_2 BOOLEAN DEFAULT FALSE,
    read_at_1 TIMESTAMP,
    read_at_2 TIMESTAMP,
    
    -- Audit Fields
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_unread ON messages(conversation_id) 
    WHERE read_by_participant_1 = FALSE OR read_by_participant_2 = FALSE;
```

### 3.4 Notifications System

#### Notifications Table
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification Content
    type notification_type_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Rich Data
    data JSONB, -- Context-specific data for the notification
    action_url VARCHAR(500), -- Deep link to relevant page
    
    -- Delivery & Status
    delivered_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP,
    clicked_at TIMESTAMP,
    
    -- Channels
    sent_via_email BOOLEAN DEFAULT FALSE,
    sent_via_push BOOLEAN DEFAULT FALSE,
    sent_via_sms BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
    expires_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_expires ON notifications(expires_at) WHERE expires_at IS NOT NULL;
```

### 3.5 Analytics & Tracking

#### User Activity Log
```sql
CREATE TABLE user_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    
    -- Activity Details
    activity_type VARCHAR(100) NOT NULL, -- page_view, job_search, application_submit, etc.
    activity_data JSONB, -- Context-specific data
    
    -- Request Information
    ip_address INET,
    user_agent TEXT,
    referer_url VARCHAR(500),
    page_url VARCHAR(500),
    
    -- Geographic Information
    country VARCHAR(100),
    city VARCHAR(100),
    
    -- Timing
    created_at TIMESTAMP DEFAULT NOW(),
    duration_seconds INTEGER -- For activities with duration
);

-- Partitioned by month for performance
CREATE INDEX idx_activity_log_user_date ON user_activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_log_type ON user_activity_log(activity_type);
CREATE INDEX idx_activity_log_session ON user_activity_log(session_id);
```

#### Job Analytics
```sql
CREATE TABLE job_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    
    -- Daily Metrics
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    applications INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    
    -- Source Tracking
    traffic_sources JSONB, -- {"direct": 50, "search": 30, "linkedin": 20}
    
    -- Search Keywords
    search_keywords JSONB, -- ["javascript developer", "react developer"]
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(job_id, date)
);

CREATE INDEX idx_job_analytics_job_date ON job_analytics(job_id, date DESC);
CREATE INDEX idx_job_analytics_date ON job_analytics(date);
```

## 4. Database Optimization

### 4.1 Indexing Strategy

#### Primary Indexes
```sql
-- Search performance indexes
CREATE INDEX idx_jobs_fulltext_search ON jobs 
    USING gin(to_tsvector('english', title || ' ' || coalesce(description, '')));

CREATE INDEX idx_companies_fulltext_search ON companies 
    USING gin(to_tsvector('english', name || ' ' || coalesce(description, '')));

-- Geospatial indexes for location-based search
CREATE INDEX idx_jobs_location_gin ON jobs USING gin(location);

-- Performance indexes for dashboard queries
CREATE INDEX idx_applications_recruiter_dashboard ON applications(job_id, status, applied_at DESC)
    INCLUDE (applicant_id, recruiter_rating);

-- Notification delivery indexes
CREATE INDEX idx_notifications_delivery ON notifications(user_id, delivered_at DESC)
    WHERE read_at IS NULL;
```

#### Composite Indexes
```sql
-- Multi-column indexes for common query patterns
CREATE INDEX idx_jobs_active_type_location ON jobs(status, job_type, (location->>'city'))
    WHERE status = 'active';

CREATE INDEX idx_user_skills_verification ON user_skills(user_id, verified, proficiency_level);

CREATE INDEX idx_applications_company_status ON applications
    USING btree(job_id, status, applied_at DESC)
    INCLUDE (applicant_id, match_score);
```

### 4.2 Partitioning Strategy

#### Time-based Partitioning
```sql
-- Partition user_activity_log by month
CREATE TABLE user_activity_log_y2025m07 PARTITION OF user_activity_log
    FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');

CREATE TABLE user_activity_log_y2025m08 PARTITION OF user_activity_log
    FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');

-- Auto-create monthly partitions
CREATE OR REPLACE FUNCTION create_monthly_partition(table_name text, start_date date)
RETURNS void AS $$
DECLARE
    partition_name text;
    end_date date;
BEGIN
    end_date := start_date + interval '1 month';
    partition_name := table_name || '_y' || EXTRACT(year FROM start_date) || 'm' || 
                     LPAD(EXTRACT(month FROM start_date)::text, 2, '0');
    
    EXECUTE format('CREATE TABLE %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
                   partition_name, table_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;
```

### 4.3 Query Optimization

#### Materialized Views
```sql
-- Job recommendations materialized view
CREATE MATERIALIZED VIEW job_recommendations AS
SELECT 
    j.id as job_id,
    sp.user_id,
    -- Calculate match score based on skills, location, preferences
    (
        -- Skills match (40% weight)
        (SELECT COUNT(*) * 0.4 FROM job_skills js 
         JOIN user_skills us ON js.skill_id = us.skill_id 
         WHERE js.job_id = j.id AND us.user_id = sp.user_id) +
        
        -- Location match (30% weight)
        CASE WHEN (j.location->>'city') = ANY(
            SELECT jsonb_array_elements_text(sp.preferred_locations->'cities')
        ) THEN 0.3 ELSE 0 END +
        
        -- Job type match (20% weight)
        CASE WHEN j.job_type = ANY(sp.preferred_job_types) THEN 0.2 ELSE 0 END +
        
        -- Experience level match (10% weight)
        CASE WHEN j.experience_level = 'entry_level' THEN 0.1 ELSE 0 END
    ) * 100 as match_score,
    
    j.created_at,
    NOW() as calculated_at
FROM jobs j
JOIN student_profiles sp ON TRUE
WHERE j.status = 'active'
  AND j.application_deadline > NOW()
  AND sp.user_id IN (SELECT id FROM users WHERE user_type = 'student');

-- Refresh recommendations daily
CREATE INDEX idx_job_recommendations_user_score ON job_recommendations(user_id, match_score DESC);
```

#### Database Functions
```sql
-- Function to update profile completion score
CREATE OR REPLACE FUNCTION update_profile_completion_score(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    completion_score INTEGER := 0;
    user_record RECORD;
    student_record RECORD;
BEGIN
    -- Get user basic info
    SELECT * INTO user_record FROM users WHERE id = user_uuid;
    
    -- Basic profile completion (40 points)
    IF user_record.first_name IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF user_record.last_name IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF user_record.phone IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF user_record.profile_photo_url IS NOT NULL THEN completion_score := completion_score + 10; END IF;
    IF user_record.email_verified = TRUE THEN completion_score := completion_score + 15; END IF;
    
    -- Student-specific completion (60 points)
    IF user_record.user_type = 'student' THEN
        SELECT * INTO student_record FROM student_profiles WHERE user_id = user_uuid;
        
        IF student_record IS NOT NULL THEN
            IF student_record.university IS NOT NULL THEN completion_score := completion_score + 10; END IF;
            IF student_record.major IS NOT NULL THEN completion_score := completion_score + 10; END IF;
            IF student_record.graduation_date IS NOT NULL THEN completion_score := completion_score + 10; END IF;
            IF student_record.resume_url IS NOT NULL THEN completion_score := completion_score + 15; END IF;
            
            -- Skills (15 points)
            IF (SELECT COUNT(*) FROM user_skills WHERE user_id = user_uuid) >= 5 THEN
                completion_score := completion_score + 15;
            ELSIF (SELECT COUNT(*) FROM user_skills WHERE user_id = user_uuid) >= 3 THEN
                completion_score := completion_score + 10;
            ELSIF (SELECT COUNT(*) FROM user_skills WHERE user_id = user_uuid) >= 1 THEN
                completion_score := completion_score + 5;
            END IF;
        END IF;
    END IF;
    
    -- Update the score
    UPDATE users SET 
        profile_completion_score = completion_score,
        updated_at = NOW()
    WHERE id = user_uuid;
    
    RETURN completion_score;
END;
$$ LANGUAGE plpgsql;
```

## 5. Data Security & Privacy

### 5.1 Row Level Security (RLS)
```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY users_own_data ON users 
    FOR ALL USING (id = current_setting('app.current_user_id')::UUID);

-- Students can view their own profiles, recruiters can view applicant profiles
CREATE POLICY student_profiles_access ON student_profiles 
    FOR SELECT USING (
        user_id = current_setting('app.current_user_id')::UUID OR
        EXISTS (
            SELECT 1 FROM applications a 
            JOIN jobs j ON a.job_id = j.id 
            JOIN company_users cu ON cu.company_id = j.company_id
            WHERE a.applicant_id = student_profiles.user_id 
            AND cu.user_id = current_setting('app.current_user_id')::UUID
        )
    );
```

### 5.2 Data Encryption
```sql
-- Encrypt sensitive fields
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to encrypt PII data
CREATE OR REPLACE FUNCTION encrypt_pii(data text) 
RETURNS text AS $$
BEGIN
    RETURN encode(encrypt(data::bytea, current_setting('app.encryption_key'), 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql;

-- Function to decrypt PII data
CREATE OR REPLACE FUNCTION decrypt_pii(encrypted_data text) 
RETURNS text AS $$
BEGIN
    RETURN convert_from(decrypt(decode(encrypted_data, 'base64'), current_setting('app.encryption_key'), 'aes'), 'utf8');
END;
$$ LANGUAGE plpgsql;
```

### 5.3 Audit Trail
```sql
-- Audit table for tracking changes
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log(table_name, record_id, operation, old_values, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), 
                current_setting('app.current_user_id', true)::UUID);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log(table_name, record_id, operation, old_values, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW),
                current_setting('app.current_user_id', true)::UUID);
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log(table_name, record_id, operation, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW),
                current_setting('app.current_user_id', true)::UUID);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER users_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER applications_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON applications
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

## 6. Database Maintenance

### 6.1 Backup Strategy
```sql
-- Automated backup script (to be run via cron)
-- Full backup daily at 2 AM
pg_dump --host=localhost --port=5432 --username=postgres --format=custom --verbose --file="/backups/recruitment_platform_$(date +%Y%m%d).backup" recruitment_platform

-- Point-in-time recovery setup
archive_mode = on
archive_command = 'cp %p /archive/%f'
wal_level = replica
```

### 6.2 Performance Monitoring
```sql
-- Query to identify slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 20;

-- Index usage analysis
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY n_distinct DESC;

-- Table size monitoring
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;
```

### 6.3 Data Cleanup Procedures
```sql
-- Cleanup old notifications (keep 3 months)
DELETE FROM notifications 
WHERE created_at < NOW() - INTERVAL '3 months'
  AND read_at IS NOT NULL;

-- Archive old job applications (move to archive table after 2 years)
CREATE TABLE applications_archive (LIKE applications INCLUDING ALL);

INSERT INTO applications_archive 
SELECT * FROM applications 
WHERE applied_at < NOW() - INTERVAL '2 years';

DELETE FROM applications 
WHERE applied_at < NOW() - INTERVAL '2 years';

-- Cleanup expired user sessions
DELETE FROM user_sessions 
WHERE expires_at < NOW();
```

---

**Document Owner**: Database Architecture Team  
**Reviewed By**: Security Team, Backend Team  
**Next Review Date**: August 12, 2025
