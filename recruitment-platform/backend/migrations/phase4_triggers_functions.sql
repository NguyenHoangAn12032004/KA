
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

-- ================================
-- BỔ SUNG: Bảng saved_jobs và trigger đồng bộ dashboard sinh viên
-- ================================

-- 1. Tạo bảng saved_jobs
CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, job_id)
);

-- 2. Trigger cập nhật analytics khi sinh viên lưu hoặc bỏ lưu việc làm
CREATE OR REPLACE FUNCTION update_saved_jobs_analytics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Tăng số lượng job_saved cho user trong analytics
        INSERT INTO analytics (metric, value, date, user_id, job_id, created_at)
        VALUES ('job_saved', 1, CURRENT_DATE, NEW.student_id, NEW.job_id, NOW())
        ON CONFLICT (metric, date, user_id, job_id, company_id) DO UPDATE
        SET value = analytics.value + 1;
    ELSIF TG_OP = 'DELETE' THEN
        -- Giảm số lượng job_saved cho user trong analytics
        UPDATE analytics
        SET value = GREATEST(value - 1, 0)
        WHERE metric = 'job_saved' AND date = CURRENT_DATE AND user_id = OLD.student_id AND job_id = OLD.job_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS saved_jobs_analytics_trigger ON saved_jobs;
CREATE TRIGGER saved_jobs_analytics_trigger
    AFTER INSERT OR DELETE ON saved_jobs
    FOR EACH ROW EXECUTE FUNCTION update_saved_jobs_analytics();

-- 3. Trigger cập nhật analytics khi sinh viên xem việc làm (job_view)
-- ================================
-- TẠO LẠI TRIGGER CHO activity_logs
-- ================================

CREATE OR REPLACE FUNCTION update_job_view_analytics()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.activitytype = 'job_view' AND NEW.entitytype = 'job' THEN
        INSERT INTO analytics (metric, value, date, userid, jobid, createdat)
        VALUES ('job_view', 1, CURRENT_DATE, NEW.userid, NEW.entityid, NOW())
        ON CONFLICT (metric, date, userid, jobid, companyid) DO UPDATE
        SET value = analytics.value + 1;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS job_view_analytics_trigger ON activity_logs;
CREATE TRIGGER job_view_analytics_trigger
    AFTER INSERT ON activity_logs
    FOR EACH ROW EXECUTE FUNCTION update_job_view_analytics();

-- 4. Trigger cập nhật analytics khi sinh viên ứng tuyển (application_submit)
CREATE OR REPLACE FUNCTION update_application_analytics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO analytics (metric, value, date, user_id, job_id, created_at)
        VALUES ('application_submit', 1, CURRENT_DATE, NEW.student_id, NEW.job_id, NOW())
        ON CONFLICT (metric, date, user_id, job_id, company_id) DO UPDATE
        SET value = analytics.value + 1;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE analytics
        SET value = GREATEST(value - 1, 0)
        WHERE metric = 'application_submit' AND date = CURRENT_DATE AND user_id = OLD.student_id AND job_id = OLD.job_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS application_analytics_trigger ON applications;
CREATE TRIGGER application_analytics_trigger
    AFTER INSERT OR DELETE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_application_analytics();

-- 5. Trigger cập nhật analytics khi có phỏng vấn mới (interview)
CREATE OR REPLACE FUNCTION update_interview_analytics()
RETURNS TRIGGER AS $$
DECLARE
    student_id UUID;
BEGIN
    -- Lấy student_id từ application
    SELECT student_id INTO student_id FROM applications WHERE id = NEW.application_id;
    IF student_id IS NOT NULL THEN
        INSERT INTO analytics (metric, value, date, user_id, job_id, company_id, created_at)
        VALUES ('interview', 1, CURRENT_DATE, student_id, NEW.job_id, NEW.company_id, NOW())
        ON CONFLICT (metric, date, user_id, job_id, company_id) DO UPDATE
        SET value = analytics.value + 1;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS interview_analytics_trigger ON interviews;
CREATE TRIGGER interview_analytics_trigger
    AFTER INSERT ON interviews
    FOR EACH ROW EXECUTE FUNCTION update_interview_analytics();

-- ================================
-- Kết thúc bổ sung trigger đồng bộ dashboard sinh viên
-- ================================

-- ================================
-- TẠO LẠI PROCEDURE DASHBOARD SINH VIÊN
-- ================================

CREATE OR REPLACE FUNCTION get_student_dashboard_data(student_id_param TEXT)
RETURNS TABLE (
    viewed_job_id TEXT,
    viewed_at TIMESTAMP,
    saved_job_id TEXT,
    saved_at TIMESTAMP,
    applied_job_id TEXT,
    applied_at TIMESTAMP,
    interview_id TEXT,
    interview_title TEXT,
    interview_status TEXT,
    interview_scheduled_at TIMESTAMP
) AS $$
BEGIN
    -- Việc làm đã xem
    RETURN QUERY
    SELECT
        al.entityid AS viewed_job_id,
        al.createdat AS viewed_at,
        NULL::TEXT AS saved_job_id,
        NULL::TIMESTAMP AS saved_at,
        NULL::TEXT AS applied_job_id,
        NULL::TIMESTAMP AS applied_at,
        NULL::TEXT AS interview_id,
        NULL::TEXT AS interview_title,
        NULL::TEXT AS interview_status,
        NULL::TIMESTAMP AS interview_scheduled_at
    FROM activity_logs al
    WHERE al.userid = student_id_param AND al.activitytype = 'job_view' AND al.entitytype = 'job'

    UNION ALL
    -- Việc làm đã lưu
    SELECT
        NULL::TEXT AS viewed_job_id,
        NULL::TIMESTAMP AS viewed_at,
        sj.jobid AS saved_job_id,
        sj.savedat AS saved_at,
        NULL::TEXT AS applied_job_id,
        NULL::TIMESTAMP AS applied_at,
        NULL::TEXT AS interview_id,
        NULL::TEXT AS interview_title,
        NULL::TEXT AS interview_status,
        NULL::TIMESTAMP AS interview_scheduled_at
    FROM saved_jobs sj
    WHERE sj.userid = student_id_param

    UNION ALL
    -- Việc làm đã ứng tuyển
    SELECT
        NULL::TEXT AS viewed_job_id,
        NULL::TIMESTAMP AS viewed_at,
        NULL::TEXT AS saved_job_id,
        NULL::TIMESTAMP AS saved_at,
        a.jobid AS applied_job_id,
        a.createdat AS applied_at,
        NULL::TEXT AS interview_id,
        NULL::TEXT AS interview_title,
        NULL::TEXT AS interview_status,
        NULL::TIMESTAMP AS interview_scheduled_at
    FROM applications a
    WHERE a.userid = student_id_param

    UNION ALL
    -- Phỏng vấn
    SELECT
        NULL::TEXT AS viewed_job_id,
        NULL::TIMESTAMP AS viewed_at,
        NULL::TEXT AS saved_job_id,
        NULL::TIMESTAMP AS saved_at,
        NULL::TEXT AS applied_job_id,
        NULL::TIMESTAMP AS applied_at,
        i.id AS interview_id,
        i.title AS interview_title,
        i.status AS interview_status,
        i.scheduledat AS interview_scheduled_at
    FROM interviews i
    JOIN applications a ON i.applicationid = a.id
    WHERE a.userid = student_id_param;
END;
$$ LANGUAGE plpgsql;
-- ================================
-- Kết thúc procedure tổng hợp dashboard sinh viên
-- ================================

-- Trigger for real-time candidate status updates
CREATE OR REPLACE FUNCTION candidate_status_update_trigger()
RETURNS TRIGGER AS $$
DECLARE
    company_id UUID;
BEGIN
    -- Get company ID from the job
    SELECT j.company_id INTO company_id
    FROM jobs j
    WHERE j.id = NEW.job_id;

    -- Update analytics
    INSERT INTO analytics (
        metric,
        value,
        date,
        user_id,
        job_id,
        company_id,
        metadata,
        created_at
    )
    VALUES (
        'status_change',
        1,
        CURRENT_DATE,
        NEW.student_id,
        NEW.job_id,
        company_id,
        jsonb_build_object(
            'old_status', OLD.status,
            'new_status', NEW.status,
            'changed_at', NOW()
        ),
        NOW()
    );

    -- Create notification for student
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        data,
        created_at
    )
    VALUES (
        NEW.student_id,
        'APPLICATION_STATUS_CHANGED',
        'Trạng thái ứng tuyển đã được cập nhật',
        CASE NEW.status
            WHEN 'PENDING' THEN 'Hồ sơ của bạn đang chờ xử lý'
            WHEN 'REVIEWING' THEN 'Hồ sơ của bạn đang được xem xét'
            WHEN 'SHORTLISTED' THEN 'Chúc mừng! Bạn đã vào danh sách ứng viên tiềm năng'
            WHEN 'INTERVIEW_SCHEDULED' THEN 'Bạn đã được lên lịch phỏng vấn'
            WHEN 'INTERVIEWED' THEN 'Cập nhật sau phỏng vấn'
            WHEN 'ACCEPTED' THEN 'Chúc mừng! Bạn đã được chấp nhận'
            WHEN 'REJECTED' THEN 'Rất tiếc, hồ sơ của bạn chưa phù hợp'
            ELSE 'Trạng thái ứng tuyển đã được cập nhật'
        END,
        jsonb_build_object(
            'job_id', NEW.job_id,
            'old_status', OLD.status,
            'new_status', NEW.status
        ),
        NOW()
    );

    -- Update status history
    NEW.status_history = (
        SELECT jsonb_agg(x)
        FROM (
            SELECT *
            FROM jsonb_array_elements(OLD.status_history)
            UNION ALL
            SELECT jsonb_build_object(
                'status', NEW.status,
                'timestamp', NOW(),
                'note', NEW.hr_notes
            )
        ) x
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS candidate_status_update ON applications;
CREATE TRIGGER candidate_status_update
    BEFORE UPDATE OF status ON applications
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION candidate_status_update_trigger();

-- Trigger to sync job view counts correctly from job_views table
CREATE OR REPLACE FUNCTION sync_job_view_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the jobs table with the correct view count
    UPDATE "jobs"
    SET "viewCount" = (
        SELECT COUNT(*)
        FROM "job_views"
        WHERE "jobId" = NEW."jobId"
    )
    WHERE "id" = NEW."jobId";
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_sync_job_view_counts ON "job_views";

-- Create the new trigger
CREATE TRIGGER trigger_sync_job_view_counts
AFTER INSERT OR DELETE ON "job_views"
FOR EACH ROW
EXECUTE FUNCTION sync_job_view_counts();

-- Trigger to sync job application counts
CREATE OR REPLACE FUNCTION sync_job_application_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the jobs table with the correct application count
    UPDATE "jobs"
    SET "applicationsCount" = (
        SELECT COUNT(*)
        FROM "applications"
        WHERE "jobId" = CASE
            WHEN TG_OP = 'DELETE' THEN OLD."jobId"
            ELSE NEW."jobId"
        END
    )
    WHERE "id" = CASE
        WHEN TG_OP = 'DELETE' THEN OLD."jobId"
        ELSE NEW."jobId"
    END;
    
    RETURN NULL; -- For AFTER triggers, return value is ignored
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_sync_job_application_counts ON "applications";

-- Create the new trigger
CREATE TRIGGER trigger_sync_job_application_counts
AFTER INSERT OR DELETE ON "applications"
FOR EACH ROW
EXECUTE FUNCTION sync_job_application_counts();

COMMIT;
