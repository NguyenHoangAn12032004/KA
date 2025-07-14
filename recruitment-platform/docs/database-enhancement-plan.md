# DATABASE ANALYSIS & ENHANCEMENT PLAN
# Hệ Thống Quản Lý Tuyển Dụng & Thực Tập Real-time

**Phiên bản**: 2.0  
**Ngày tạo**: July 12, 2025  
**Người phân tích**: Database Architecture Team  

---

## 1. PHÂN TÍCH HIỆN TRẠNG DATABASE

### 1.1 Đánh giá Schema Hiện tại
✅ **Điểm mạnh**:
- Cấu trúc cơ bản đầy đủ cho MVP
- Relationships được thiết kế đúng
- Enums định nghĩa rõ ràng
- Primary keys và foreign keys hợp lý

❌ **Thiếu sót quan trọng**:
- Thiếu các bảng quản lý session và audit
- Không có bảng quản lý file uploads
- Thiếu bảng cho university profiles
- Không có triggers và procedures
- Thiếu indexes cho performance
- Không có soft delete mechanism
- Thiếu bảng quản lý permissions
- Không có real-time tracking tables

### 1.2 Gaps Analysis dựa trên Requirements

#### Missing Tables từ Business Requirements:
1. **UniversityProfile** - Quản lý thông tin trường đại học
2. **FileUpload** - Quản lý files (resume, certificates, etc.)
3. **AuditLog** - Tracking mọi thay đổi quan trọng
4. **UserSession** - Quản lý phiên đăng nhập
5. **Permission & Role** - RBAC system chi tiết
6. **CompanyReview** - Đánh giá công ty
7. **JobCategory** - Phân loại công việc
8. **Skill** - Master data cho skills
9. **Location** - Master data cho địa điểm
10. **EmailTemplate** - Quản lý email templates
11. **SystemLog** - Logging hệ thống

#### Missing Fields trong Existing Tables:
- User: socialId, twoFactorSecret, lastPasswordChange, loginAttempts
- StudentProfile: emergencyContact, portfolio projects details
- CompanyProfile: foundedYear, employees range, company benefits
- Job: priority level, auto-close conditions
- Application: screening questions answers

## 2. ĐỀ XUẤT SCHEMA MỞ RỘNG

### 2.1 Bảng mới cần thêm

```sql
-- University Profiles
CREATE TABLE university_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    university_name VARCHAR(255) NOT NULL,
    university_code VARCHAR(50) UNIQUE,
    establishment_year INTEGER,
    university_type VARCHAR(50), -- public, private, international
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Vietnam',
    website VARCHAR(255),
    logo VARCHAR(500),
    description TEXT,
    
    -- Contact info
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    
    -- Academic info
    faculties JSONB DEFAULT '[]',
    programs JSONB DEFAULT '[]',
    student_count INTEGER,
    
    -- Partnership info
    industry_partnerships JSONB DEFAULT '[]',
    placement_rate DECIMAL(5,2),
    
    -- Verification
    is_verified BOOLEAN DEFAULT false,
    verification_documents JSONB DEFAULT '[]',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- File Management
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- resume, portfolio, certificate, etc.
    is_public BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Security
    virus_scan_status VARCHAR(20) DEFAULT 'pending', -- pending, clean, infected
    virus_scan_result JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logging
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skills Master Data
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL, -- technical, soft, language
    description TEXT,
    is_verified BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job Categories
CREATE TABLE job_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    parent_id UUID REFERENCES job_categories(id),
    description TEXT,
    icon VARCHAR(255),
    color VARCHAR(7), -- hex color
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Locations Master Data  
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- country, city, district
    parent_id UUID REFERENCES locations(id),
    code VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company Reviews
CREATE TABLE company_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Ratings (1-5 scale)
    overall_rating DECIMAL(2,1) NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    work_life_balance DECIMAL(2,1) CHECK (work_life_balance >= 1 AND work_life_balance <= 5),
    salary_benefits DECIMAL(2,1) CHECK (salary_benefits >= 1 AND salary_benefits <= 5),
    career_development DECIMAL(2,1) CHECK (career_development >= 1 AND career_development <= 5),
    management DECIMAL(2,1) CHECK (management >= 1 AND management <= 5),
    
    -- Review content
    title VARCHAR(200),
    pros TEXT,
    cons TEXT,
    advice_to_management TEXT,
    
    -- Employment info
    employment_status VARCHAR(50), -- current, former
    job_title VARCHAR(100),
    employment_duration INTEGER, -- months
    
    -- Status
    is_approved BOOLEAN DEFAULT false,
    is_anonymous BOOLEAN DEFAULT true,
    helpful_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(company_id, reviewer_id) -- One review per user per company
);

-- User Sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(500) NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    location_info JSONB,
    
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email Templates
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSONB DEFAULT '[]', -- Available template variables
    
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Real-time Activity Tracking
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    activity_type VARCHAR(50) NOT NULL, -- login, job_view, application_submit
    entity_type VARCHAR(50), -- job, application, company
    entity_id UUID,
    
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Configuration
CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_enabled BOOLEAN DEFAULT false,
    config JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 Cập nhật Existing Tables

```sql
-- Add missing fields to existing tables
ALTER TABLE users ADD COLUMN social_provider VARCHAR(50);
ALTER TABLE users ADD COLUMN social_id VARCHAR(255);
ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN last_password_change TIMESTAMP;
ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN locked_until TIMESTAMP;
ALTER TABLE users ADD COLUMN email_notifications BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN push_notifications BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP; -- Soft delete

ALTER TABLE student_profiles ADD COLUMN emergency_contact JSONB;
ALTER TABLE student_profiles ADD COLUMN projects JSONB DEFAULT '[]';
ALTER TABLE student_profiles ADD COLUMN certifications JSONB DEFAULT '[]';
ALTER TABLE student_profiles ADD COLUMN languages JSONB DEFAULT '[]';
ALTER TABLE student_profiles ADD COLUMN availability_date DATE;
ALTER TABLE student_profiles ADD COLUMN work_authorization VARCHAR(50);

ALTER TABLE company_profiles ADD COLUMN founded_year INTEGER;
ALTER TABLE company_profiles ADD COLUMN employee_count_range VARCHAR(20);
ALTER TABLE company_profiles ADD COLUMN benefits JSONB DEFAULT '[]';
ALTER TABLE company_profiles ADD COLUMN company_culture JSONB DEFAULT '{}';
ALTER TABLE company_profiles ADD COLUMN awards JSONB DEFAULT '[]';
ALTER TABLE company_profiles ADD COLUMN deleted_at TIMESTAMP; -- Soft delete

ALTER TABLE jobs ADD COLUMN category_id UUID REFERENCES job_categories(id);
ALTER TABLE jobs ADD COLUMN priority_level INTEGER DEFAULT 1; -- 1=low, 5=high
ALTER TABLE jobs ADD COLUMN auto_close_date TIMESTAMP;
ALTER TABLE jobs ADD COLUMN screening_questions JSONB DEFAULT '[]';
ALTER TABLE jobs ADD COLUMN deleted_at TIMESTAMP; -- Soft delete

ALTER TABLE applications ADD COLUMN screening_answers JSONB DEFAULT '{}';
ALTER TABLE applications ADD COLUMN source VARCHAR(50); -- direct, referral, job_board
ALTER TABLE applications ADD COLUMN referrer_id UUID REFERENCES users(id);
```

## 3. DATABASE TRIGGERS & PROCEDURES

### 3.1 Audit Triggers

```sql
-- Function to handle audit logging
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, table_name, record_id, operation, old_values, ip_address)
        VALUES (
            current_setting('app.user_id', true)::uuid,
            TG_TABLE_NAME,
            OLD.id,
            TG_OP,
            row_to_json(OLD),
            current_setting('app.ip_address', true)::inet
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, table_name, record_id, operation, old_values, new_values, changed_fields, ip_address)
        VALUES (
            current_setting('app.user_id', true)::uuid,
            TG_TABLE_NAME,
            NEW.id,
            TG_OP,
            row_to_json(OLD),
            row_to_json(NEW),
            array(SELECT key FROM jsonb_each(to_jsonb(NEW)) WHERE to_jsonb(NEW)->>key != to_jsonb(OLD)->>key),
            current_setting('app.ip_address', true)::inet
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, table_name, record_id, operation, new_values, ip_address)
        VALUES (
            current_setting('app.user_id', true)::uuid,
            TG_TABLE_NAME,
            NEW.id,
            TG_OP,
            row_to_json(NEW),
            current_setting('app.ip_address', true)::inet
        );
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers for important tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_applications AFTER INSERT OR UPDATE OR DELETE ON applications
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_jobs AFTER INSERT OR UPDATE OR DELETE ON jobs
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

### 3.2 Business Logic Triggers

```sql
-- Auto-update job view count
CREATE OR REPLACE FUNCTION increment_job_views()
RETURNS trigger AS $$
BEGIN
    IF NEW.activity_type = 'job_view' AND NEW.entity_type = 'job' THEN
        UPDATE jobs 
        SET view_count = view_count + 1 
        WHERE id = NEW.entity_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_view_counter 
    AFTER INSERT ON activity_logs
    FOR EACH ROW EXECUTE FUNCTION increment_job_views();

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_student_profiles_timestamp BEFORE UPDATE ON student_profiles
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Notification trigger when application status changes
CREATE OR REPLACE FUNCTION notify_application_status_change()
RETURNS trigger AS $$
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (
            NEW.student_id,
            'APPLICATION_STATUS_CHANGED',
            'Application Status Updated',
            'Your application status has been changed to ' || NEW.status,
            jsonb_build_object(
                'application_id', NEW.id,
                'job_id', NEW.job_id,
                'old_status', OLD.status,
                'new_status', NEW.status
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER application_status_notification
    AFTER UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION notify_application_status_change();
```

### 3.3 Stored Procedures for Business Logic

```sql
-- Calculate user profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    completion_score INTEGER := 0;
    student_rec RECORD;
BEGIN
    SELECT * INTO student_rec FROM student_profiles WHERE user_id = user_id_param;
    
    IF student_rec IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Basic info (20 points)
    IF student_rec.first_name IS NOT NULL AND student_rec.last_name IS NOT NULL THEN
        completion_score := completion_score + 10;
    END IF;
    IF student_rec.phone IS NOT NULL THEN
        completion_score := completion_score + 5;
    END IF;
    IF student_rec.avatar IS NOT NULL THEN
        completion_score := completion_score + 5;
    END IF;
    
    -- Education (25 points)
    IF student_rec.university IS NOT NULL THEN
        completion_score := completion_score + 10;
    END IF;
    IF student_rec.major IS NOT NULL THEN
        completion_score := completion_score + 10;
    END IF;
    IF student_rec.graduation_year IS NOT NULL THEN
        completion_score := completion_score + 5;
    END IF;
    
    -- Skills and experience (30 points)
    IF array_length(student_rec.skills, 1) > 0 THEN
        completion_score := completion_score + 15;
    END IF;
    IF student_rec.experience IS NOT NULL THEN
        completion_score := completion_score + 15;
    END IF;
    
    -- Resume and portfolio (25 points)
    IF student_rec.resume IS NOT NULL THEN
        completion_score := completion_score + 15;
    END IF;
    IF student_rec.portfolio IS NOT NULL THEN
        completion_score := completion_score + 10;
    END IF;
    
    RETURN completion_score;
END;
$$ LANGUAGE plpgsql;

-- Get job recommendations for a student
CREATE OR REPLACE FUNCTION get_job_recommendations(student_id_param UUID, limit_param INTEGER DEFAULT 10)
RETURNS TABLE (
    job_id UUID,
    title VARCHAR,
    company_name VARCHAR,
    match_score INTEGER,
    match_reasons TEXT[]
) AS $$
DECLARE
    student_skills TEXT[];
    student_prefs RECORD;
BEGIN
    -- Get student preferences
    SELECT preferred_job_types, preferred_work_modes, preferred_locations, skills
    INTO student_prefs
    FROM student_profiles 
    WHERE user_id = student_id_param;
    
    IF student_prefs IS NULL THEN
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        j.id,
        j.title,
        cp.company_name,
        (
            -- Skills match (40%)
            (CASE WHEN array_length(array(SELECT unnest(j.required_skills) INTERSECT SELECT unnest(student_prefs.skills)), 1) > 0
             THEN array_length(array(SELECT unnest(j.required_skills) INTERSECT SELECT unnest(student_prefs.skills)), 1) * 40 / array_length(j.required_skills, 1)
             ELSE 0 END) +
            
            -- Job type match (30%)
            (CASE WHEN j.job_type = ANY(student_prefs.preferred_job_types) THEN 30 ELSE 0 END) +
            
            -- Work mode match (20%)
            (CASE WHEN j.work_mode = ANY(student_prefs.preferred_work_modes) THEN 20 ELSE 0 END) +
            
            -- Location match (10%)
            (CASE WHEN j.location = ANY(student_prefs.preferred_locations) OR 'Remote' = ANY(student_prefs.preferred_locations) THEN 10 ELSE 0 END)
        )::INTEGER as match_score,
        
        array(
            SELECT reason FROM (
                SELECT 'Skills match: ' || array_to_string(array(SELECT unnest(j.required_skills) INTERSECT SELECT unnest(student_prefs.skills)), ', ') as reason
                WHERE array_length(array(SELECT unnest(j.required_skills) INTERSECT SELECT unnest(student_prefs.skills)), 1) > 0
                
                UNION ALL
                
                SELECT 'Preferred job type: ' || j.job_type::text as reason
                WHERE j.job_type = ANY(student_prefs.preferred_job_types)
                
                UNION ALL
                
                SELECT 'Preferred work mode: ' || j.work_mode::text as reason
                WHERE j.work_mode = ANY(student_prefs.preferred_work_modes)
                
                UNION ALL
                
                SELECT 'Preferred location: ' || j.location as reason
                WHERE j.location = ANY(student_prefs.preferred_locations)
            ) reasons
        ) as match_reasons
        
    FROM jobs j
    JOIN company_profiles cp ON j.company_id = cp.id
    WHERE j.is_active = true
    AND j.application_deadline > CURRENT_TIMESTAMP
    AND NOT EXISTS (
        SELECT 1 FROM applications a WHERE a.job_id = j.id AND a.student_id = student_id_param
    )
    ORDER BY match_score DESC
    LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- Generate analytics data
CREATE OR REPLACE FUNCTION generate_daily_analytics()
RETURNS VOID AS $$
BEGIN
    -- User registrations
    INSERT INTO analytics (metric, value, date, metadata)
    SELECT 
        'user_registrations',
        COUNT(*),
        CURRENT_DATE,
        jsonb_build_object('role_breakdown', jsonb_object_agg(role, count))
    FROM (
        SELECT role, COUNT(*) as count
        FROM users 
        WHERE DATE(created_at) = CURRENT_DATE
        GROUP BY role
    ) role_counts;
    
    -- Job views
    INSERT INTO analytics (metric, value, date)
    SELECT 
        'job_views',
        COUNT(*),
        CURRENT_DATE
    FROM activity_logs 
    WHERE DATE(created_at) = CURRENT_DATE
    AND activity_type = 'job_view';
    
    -- Applications submitted
    INSERT INTO analytics (metric, value, date)
    SELECT 
        'applications_submitted',
        COUNT(*),
        CURRENT_DATE
    FROM applications 
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Jobs posted
    INSERT INTO analytics (metric, value, date)
    SELECT 
        'jobs_posted',
        COUNT(*),
        CURRENT_DATE
    FROM jobs 
    WHERE DATE(created_at) = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;
```

## 4. PERFORMANCE OPTIMIZATION

### 4.1 Indexes

```sql
-- User search optimization
CREATE INDEX idx_users_email_active ON users(email) WHERE is_active = true;
CREATE INDEX idx_users_role_active ON users(role, is_active);

-- Job search optimization
CREATE INDEX idx_jobs_search ON jobs USING GIN(title, description);
CREATE INDEX idx_jobs_active_published ON jobs(is_active, published_at) WHERE is_active = true;
CREATE INDEX idx_jobs_location ON jobs(location) WHERE is_active = true;
CREATE INDEX idx_jobs_type_mode ON jobs(job_type, work_mode) WHERE is_active = true;
CREATE INDEX idx_jobs_skills ON jobs USING GIN(required_skills);

-- Application queries
CREATE INDEX idx_applications_student_status ON applications(student_id, status);
CREATE INDEX idx_applications_job_status ON applications(job_id, status);
CREATE INDEX idx_applications_applied_at ON applications(applied_at DESC);

-- Notification queries
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- Analytics queries
CREATE INDEX idx_analytics_metric_date ON analytics(metric, date DESC);
CREATE INDEX idx_activity_logs_user_type ON activity_logs(user_id, activity_type, created_at DESC);

-- Full-text search
CREATE INDEX idx_student_profiles_search ON student_profiles USING GIN(
    to_tsvector('english', 
        COALESCE(first_name, '') || ' ' || 
        COALESCE(last_name, '') || ' ' || 
        COALESCE(university, '') || ' ' || 
        COALESCE(major, '') || ' ' ||
        array_to_string(skills, ' ')
    )
);
```

### 4.2 Partitioning for Large Tables

```sql
-- Partition analytics table by date
CREATE TABLE analytics_partitioned (
    LIKE analytics INCLUDING ALL
) PARTITION BY RANGE (date);

-- Create monthly partitions
CREATE TABLE analytics_y2025m07 PARTITION OF analytics_partitioned
    FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');

-- Activity logs partitioning
CREATE TABLE activity_logs_partitioned (
    LIKE activity_logs INCLUDING ALL
) PARTITION BY RANGE (created_at);
```

## 5. IMPLEMENTATION ROADMAP

### Phase 1: Core Schema Updates (Week 1-2)
- [ ] Add missing tables (UniversityProfile, FileUpload, Skills, etc.)
- [ ] Update existing tables with new fields
- [ ] Create basic indexes
- [ ] Implement audit triggers

### Phase 2: Business Logic Implementation (Week 3-4)
- [ ] Stored procedures for recommendations
- [ ] Profile completion calculations
- [ ] Analytics generation procedures
- [ ] Notification triggers

### Phase 3: Performance & Advanced Features (Week 5-6)
- [ ] Full-text search implementation
- [ ] Partitioning for large tables
- [ ] Advanced analytics procedures
- [ ] Real-time features support

### Phase 4: Testing & Optimization (Week 7-8)
- [ ] Performance testing
- [ ] Load testing
- [ ] Query optimization
- [ ] Documentation completion

## 6. MONITORING & MAINTENANCE

### 6.1 Database Health Monitoring
```sql
-- Query performance monitoring view
CREATE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC;

-- Table size monitoring
CREATE VIEW table_sizes AS
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;
```

### 6.2 Automated Maintenance
```sql
-- Daily maintenance procedure
CREATE OR REPLACE FUNCTION daily_maintenance()
RETURNS VOID AS $$
BEGIN
    -- Generate analytics
    PERFORM generate_daily_analytics();
    
    -- Clean old sessions
    DELETE FROM user_sessions 
    WHERE expires_at < CURRENT_TIMESTAMP - INTERVAL '7 days';
    
    -- Clean old notifications (keep 30 days)
    DELETE FROM notifications 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    -- Update statistics
    ANALYZE;
    
    -- Log maintenance completion
    INSERT INTO system_settings (key, value) 
    VALUES ('last_maintenance', CURRENT_TIMESTAMP::text)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
END;
$$ LANGUAGE plpgsql;
```

---

**Tóm tắt**: Database đã được phân tích toàn diện và đề xuất mở rộng với 15+ bảng mới, triggers tự động, stored procedures và optimization strategy. Ưu tiên sử dụng database-level logic để đảm bảo data consistency và performance.
