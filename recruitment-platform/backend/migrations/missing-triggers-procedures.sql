-- ================================================
-- MISSING TRIGGERS AND PROCEDURES
-- Complete the database optimization with missing triggers
-- ================================================

-- Enable required extensions if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. COMPANY STATISTICS TRIGGERS
-- ================================================

-- Function to update company statistics when jobs change
CREATE OR REPLACE FUNCTION update_company_stats_on_job_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Refresh company statistics materialized view
    IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_company_stats') THEN
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_company_stats;
    END IF;
    
    -- Log the change
    INSERT INTO activity_logs (
        "userId", 
        "activityType", 
        "entityType", 
        "entityId", 
        data, 
        "createdAt"
    ) VALUES (
        'system'::uuid, 
        'COMPANY_STATS_UPDATE', 
        'JOB', 
        COALESCE(NEW.id, OLD.id), 
        json_build_object(
            'operation', TG_OP,
            'companyId', COALESCE(NEW."companyId", OLD."companyId")
        )::jsonb,
        NOW()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Company stats triggers
DROP TRIGGER IF EXISTS trg_update_company_stats_on_job_insert ON jobs;
CREATE TRIGGER trg_update_company_stats_on_job_insert
    AFTER INSERT ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_company_stats_on_job_change();

DROP TRIGGER IF EXISTS trg_update_company_stats_on_job_update ON jobs;
CREATE TRIGGER trg_update_company_stats_on_job_update
    AFTER UPDATE ON jobs
    FOR EACH ROW
    WHEN (OLD."isActive" IS DISTINCT FROM NEW."isActive" OR 
          OLD."publishedAt" IS DISTINCT FROM NEW."publishedAt")
    EXECUTE FUNCTION update_company_stats_on_job_change();

DROP TRIGGER IF EXISTS trg_update_company_stats_on_job_delete ON jobs;
CREATE TRIGGER trg_update_company_stats_on_job_delete
    AFTER DELETE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_company_stats_on_job_change();

-- ================================================
-- 2. APPLICATION STATUS TRACKING
-- ================================================

-- Create application status history table if not exists
CREATE TABLE IF NOT EXISTS application_status_history (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "applicationId" UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    "fromStatus"    VARCHAR(50),
    "toStatus"      VARCHAR(50) NOT NULL,
    notes           TEXT,
    "changedAt"     TIMESTAMP DEFAULT NOW(),
    "changedBy"     UUID REFERENCES users(id),
    "createdAt"     TIMESTAMP DEFAULT NOW()
);

-- Create index on application status history
CREATE INDEX IF NOT EXISTS idx_application_status_history_app_id 
    ON application_status_history("applicationId");
CREATE INDEX IF NOT EXISTS idx_application_status_history_changed_at 
    ON application_status_history("changedAt");

-- Function to track application status changes
CREATE OR REPLACE FUNCTION track_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert status history record
    INSERT INTO application_status_history (
        "applicationId",
        "fromStatus",
        "toStatus",
        notes,
        "changedAt"
    ) VALUES (
        NEW.id,
        OLD.status,
        NEW.status,
        'Status changed automatically',
        NOW()
    );
    
    -- Create notification for student
    INSERT INTO notifications (
        id,
        "userId",
        type,
        title,
        message,
        data,
        "isRead",
        "createdAt"
    ) VALUES (
        uuid_generate_v4(),
        NEW."studentId",
        'APPLICATION_STATUS_CHANGED',
        'Application Status Updated',
        'Your application status has been updated to: ' || NEW.status,
        json_build_object(
            'applicationId', NEW.id,
            'jobId', NEW."jobId",
            'oldStatus', OLD.status,
            'newStatus', NEW.status
        )::jsonb,
        false,
        NOW()
    );
    
    -- Log activity
    INSERT INTO activity_logs (
        "userId", 
        "activityType", 
        "entityType", 
        "entityId", 
        data, 
        "createdAt"
    ) VALUES (
        NEW."studentId", 
        'APPLICATION_STATUS_CHANGED', 
        'APPLICATION', 
        NEW.id, 
        json_build_object(
            'fromStatus', OLD.status,
            'toStatus', NEW.status,
            'jobId', NEW."jobId"
        )::jsonb,
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Application status tracking trigger
DROP TRIGGER IF EXISTS trg_track_application_status_change ON applications;
CREATE TRIGGER trg_track_application_status_change
    AFTER UPDATE ON applications
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION track_application_status_change();

-- ================================================
-- 3. INTERVIEW COMPUTED FIELDS
-- ================================================

-- Function to auto-populate companyId and jobId in interviews
CREATE OR REPLACE FUNCTION set_interview_computed_fields()
RETURNS TRIGGER AS $$
DECLARE
    app_record RECORD;
BEGIN
    -- Get application details to populate computed fields
    SELECT a."jobId", j."companyId"
    INTO app_record
    FROM applications a
    JOIN jobs j ON a."jobId" = j.id
    WHERE a.id = NEW."applicationId";
    
    -- Only set if found (should always be found due to FK constraint)
    IF app_record IS NOT NULL THEN
        NEW."jobId" := app_record."jobId";
        NEW."companyId" := app_record."companyId";
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Interview computed fields trigger (only if columns exist)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'interviews' 
        AND column_name IN ('jobId', 'companyId')
    ) THEN
        DROP TRIGGER IF EXISTS trg_set_interview_computed_fields ON interviews;
        CREATE TRIGGER trg_set_interview_computed_fields
            BEFORE INSERT ON interviews
            FOR EACH ROW
            EXECUTE FUNCTION set_interview_computed_fields();
    END IF;
END $$;

-- ================================================
-- 4. MATERIALIZED VIEW REFRESH TRIGGERS
-- ================================================

-- Function to refresh job statistics
CREATE OR REPLACE FUNCTION update_job_stats_on_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Refresh job statistics materialized view
    IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_job_stats') THEN
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_job_stats;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Job stats triggers
DROP TRIGGER IF EXISTS trg_update_job_stats_on_application_change ON applications;
CREATE TRIGGER trg_update_job_stats_on_application_change
    AFTER INSERT OR UPDATE OR DELETE ON applications
    FOR EACH STATEMENT
    EXECUTE FUNCTION update_job_stats_on_change();

-- ================================================
-- 5. NOTIFICATION TRIGGERS
-- ================================================

-- Function to send notifications on important events
CREATE OR REPLACE FUNCTION send_event_notifications()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle different table operations
    IF TG_TABLE_NAME = 'applications' THEN
        IF TG_OP = 'INSERT' THEN
            -- Notify company about new application
            INSERT INTO notifications (
                id,
                "userId",
                type,
                title,
                message,
                data,
                "isRead",
                "createdAt"
            )
            SELECT 
                uuid_generate_v4(),
                cp."userId",
                'APPLICATION_SUBMITTED',
                'New Job Application',
                'A new application has been submitted for your job: ' || j.title,
                json_build_object(
                    'applicationId', NEW.id,
                    'jobId', NEW."jobId",
                    'studentId', NEW."studentId"
                )::jsonb,
                false,
                NOW()
            FROM jobs j
            JOIN company_profiles cp ON j."companyId" = cp.id
            WHERE j.id = NEW."jobId";
        END IF;
    END IF;
    
    IF TG_TABLE_NAME = 'interviews' THEN
        IF TG_OP = 'INSERT' THEN
            -- Notify student about interview scheduling
            INSERT INTO notifications (
                id,
                "userId",
                type,
                title,
                message,
                data,
                "isRead",
                "createdAt"
            )
            SELECT 
                uuid_generate_v4(),
                a."studentId",
                'INTERVIEW_SCHEDULED',
                'Interview Scheduled',
                'An interview has been scheduled for: ' || NEW.title,
                json_build_object(
                    'interviewId', NEW.id,
                    'applicationId', NEW."applicationId",
                    'scheduledAt', NEW."scheduledAt"
                )::jsonb,
                false,
                NOW()
            FROM applications a
            WHERE a.id = NEW."applicationId";
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Event notification triggers
DROP TRIGGER IF EXISTS trg_notify_on_application_events ON applications;
CREATE TRIGGER trg_notify_on_application_events
    AFTER INSERT ON applications
    FOR EACH ROW
    EXECUTE FUNCTION send_event_notifications();

DROP TRIGGER IF EXISTS trg_notify_on_interview_events ON interviews;
CREATE TRIGGER trg_notify_on_interview_events
    AFTER INSERT ON interviews
    FOR EACH ROW
    EXECUTE FUNCTION send_event_notifications();

-- ================================================
-- 6. DATA CONSISTENCY TRIGGERS
-- ================================================

-- Function to ensure data consistency
CREATE OR REPLACE FUNCTION ensure_data_consistency()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate business rules and data consistency
    IF TG_TABLE_NAME = 'applications' THEN
        -- Ensure student can't apply to same job twice (handled by unique constraint)
        -- Ensure job is active when applying
        IF NEW.status = 'PENDING' THEN
            IF NOT EXISTS (
                SELECT 1 FROM jobs 
                WHERE id = NEW."jobId" AND "isActive" = true
            ) THEN
                RAISE EXCEPTION 'Cannot apply to inactive job';
            END IF;
        END IF;
    END IF;
    
    IF TG_TABLE_NAME = 'interviews' THEN
        -- Ensure interview is for valid application
        IF NOT EXISTS (
            SELECT 1 FROM applications 
            WHERE id = NEW."applicationId" 
            AND status IN ('SHORTLISTED', 'INTERVIEW_SCHEDULED')
        ) THEN
            RAISE EXCEPTION 'Interview can only be scheduled for shortlisted applications';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Data consistency triggers
DROP TRIGGER IF EXISTS trg_ensure_application_consistency ON applications;
CREATE TRIGGER trg_ensure_application_consistency
    BEFORE INSERT OR UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION ensure_data_consistency();

DROP TRIGGER IF EXISTS trg_ensure_interview_consistency ON interviews;
CREATE TRIGGER trg_ensure_interview_consistency
    BEFORE INSERT OR UPDATE ON interviews
    FOR EACH ROW
    EXECUTE FUNCTION ensure_data_consistency();

-- ================================================
-- 7. MISSING STORED PROCEDURES
-- ================================================

-- Enhanced data cleanup procedure
CREATE OR REPLACE FUNCTION cleanup_old_data_enhanced(days_to_keep INTEGER DEFAULT 90)
RETURNS TABLE(
    table_name TEXT,
    deleted_count INTEGER
) AS $$
DECLARE
    cutoff_date TIMESTAMP;
    result_record RECORD;
BEGIN
    cutoff_date := NOW() - (days_to_keep || ' days')::INTERVAL;
    
    -- Clean old job_views
    DELETE FROM job_views WHERE "viewedAt" < cutoff_date;
    GET DIAGNOSTICS result_record.deleted_count = ROW_COUNT;
    result_record.table_name := 'job_views';
    RETURN NEXT result_record;
    
    -- Clean old activity_logs
    DELETE FROM activity_logs WHERE "createdAt" < cutoff_date;
    GET DIAGNOSTICS result_record.deleted_count = ROW_COUNT;
    result_record.table_name := 'activity_logs';
    RETURN NEXT result_record;
    
    -- Clean expired refresh_tokens
    DELETE FROM refresh_tokens WHERE "expiresAt" < NOW();
    GET DIAGNOSTICS result_record.deleted_count = ROW_COUNT;
    result_record.table_name := 'refresh_tokens';
    RETURN NEXT result_record;
    
    -- Clean old notifications (read and older than 30 days)
    DELETE FROM notifications 
    WHERE "isRead" = true AND "createdAt" < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS result_record.deleted_count = ROW_COUNT;
    result_record.table_name := 'notifications';
    RETURN NEXT result_record;
    
    -- Log cleanup activity
    INSERT INTO activity_logs (
        "userId", 
        "activityType", 
        "entityType", 
        "entityId", 
        data, 
        "createdAt"
    ) VALUES (
        'system'::uuid, 
        'DATA_CLEANUP', 
        'SYSTEM', 
        'cleanup', 
        json_build_object('days_to_keep', days_to_keep, 'cutoff_date', cutoff_date)::jsonb,
        NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- Company metrics calculation procedure
CREATE OR REPLACE FUNCTION calculate_company_metrics_enhanced(company_id UUID)
RETURNS TABLE(
    total_jobs BIGINT,
    active_jobs BIGINT,
    total_applications BIGINT,
    pending_applications BIGINT,
    total_views BIGINT,
    unique_views BIGINT,
    avg_applications_per_job NUMERIC,
    success_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(job_stats.total_jobs, 0) as total_jobs,
        COALESCE(job_stats.active_jobs, 0) as active_jobs,
        COALESCE(app_stats.total_applications, 0) as total_applications,
        COALESCE(app_stats.pending_applications, 0) as pending_applications,
        COALESCE(view_stats.total_views, 0) as total_views,
        COALESCE(view_stats.unique_views, 0) as unique_views,
        CASE 
            WHEN COALESCE(job_stats.total_jobs, 0) > 0 
            THEN COALESCE(app_stats.total_applications, 0)::NUMERIC / job_stats.total_jobs
            ELSE 0
        END as avg_applications_per_job,
        CASE 
            WHEN COALESCE(app_stats.total_applications, 0) > 0 
            THEN COALESCE(app_stats.successful_applications, 0)::NUMERIC / app_stats.total_applications * 100
            ELSE 0
        END as success_rate
    FROM (
        SELECT 
            COUNT(*) as total_jobs,
            COUNT(*) FILTER (WHERE "isActive" = true) as active_jobs
        FROM jobs 
        WHERE "companyId" = company_id
    ) job_stats
    FULL OUTER JOIN (
        SELECT 
            COUNT(a.*) as total_applications,
            COUNT(*) FILTER (WHERE a.status = 'PENDING') as pending_applications,
            COUNT(*) FILTER (WHERE a.status = 'ACCEPTED') as successful_applications
        FROM applications a
        JOIN jobs j ON a."jobId" = j.id
        WHERE j."companyId" = company_id
    ) app_stats ON true
    FULL OUTER JOIN (
        SELECT 
            COUNT(jv.*) as total_views,
            COUNT(DISTINCT COALESCE(jv."userId"::text, jv."ipAddress")) as unique_views
        FROM job_views jv
        JOIN jobs j ON jv."jobId" = j.id
        WHERE j."companyId" = company_id
    ) view_stats ON true;
END;
$$ LANGUAGE plpgsql;

-- Job recommendation procedure (enhanced)
CREATE OR REPLACE FUNCTION get_job_recommendations_enhanced(
    student_id UUID,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE(
    job_id UUID,
    title TEXT,
    company_name TEXT,
    location TEXT,
    match_score NUMERIC,
    days_since_posted INTEGER,
    application_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH student_profile AS (
        SELECT 
            sp.skills,
            sp."preferredJobTypes",
            sp."preferredWorkModes", 
            sp."preferredLocations"
        FROM student_profiles sp
        WHERE sp."userId" = student_id
    ),
    job_matches AS (
        SELECT 
            j.id,
            j.title,
            cp."companyName",
            j.location,
            -- Calculate match score
            (
                -- Skills match (40% weight)
                CASE 
                    WHEN sp.skills && j."requiredSkills" THEN 0.4
                    ELSE 0
                END +
                -- Job type preference (20% weight)
                CASE 
                    WHEN j."jobType"::text = ANY(
                        SELECT unnest(enum_range(NULL::"JobType"))::text 
                        WHERE enum_range(NULL::"JobType") && sp."preferredJobTypes"
                    ) THEN 0.2
                    ELSE 0
                END +
                -- Work mode preference (20% weight)
                CASE 
                    WHEN j."workMode"::text = ANY(
                        SELECT unnest(enum_range(NULL::"WorkMode"))::text 
                        WHERE enum_range(NULL::"WorkMode") && sp."preferredWorkModes"
                    ) THEN 0.2
                    ELSE 0
                END +
                -- Location preference (20% weight)
                CASE 
                    WHEN j.location = ANY(sp."preferredLocations") THEN 0.2
                    ELSE 0
                END
            ) as score,
            EXTRACT(DAYS FROM (NOW() - j."createdAt"))::INTEGER as days_posted,
            COALESCE(app_count.count, 0) as app_count
        FROM jobs j
        JOIN company_profiles cp ON j."companyId" = cp.id
        CROSS JOIN student_profile sp
        LEFT JOIN (
            SELECT "jobId", COUNT(*) as count 
            FROM applications 
            GROUP BY "jobId"
        ) app_count ON j.id = app_count."jobId"
        WHERE j."isActive" = true
        AND j."publishedAt" IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM applications a 
            WHERE a."jobId" = j.id AND a."studentId" = student_id
        )
    )
    SELECT 
        jm.id::UUID,
        jm.title::TEXT,
        jm."companyName"::TEXT,
        jm.location::TEXT,
        ROUND(jm.score, 3)::NUMERIC,
        jm.days_posted,
        jm.app_count
    FROM job_matches jm
    WHERE jm.score > 0.1  -- Minimum 10% match
    ORDER BY jm.score DESC, jm.days_posted ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Database health monitoring procedure
CREATE OR REPLACE FUNCTION get_database_health_report()
RETURNS TABLE(
    category TEXT,
    metric TEXT,
    value TEXT,
    status TEXT
) AS $$
BEGIN
    -- Table sizes
    RETURN QUERY
    SELECT 
        'Table Sizes'::TEXT as category,
        t.tablename::TEXT as metric,
        pg_size_pretty(pg_total_relation_size(t.schemaname||'.'||t.tablename))::TEXT as value,
        CASE 
            WHEN pg_total_relation_size(t.schemaname||'.'||t.tablename) > 100*1024*1024 
            THEN 'WARNING'::TEXT
            ELSE 'OK'::TEXT
        END as status
    FROM pg_tables t
    WHERE t.schemaname = 'public'
    ORDER BY pg_total_relation_size(t.schemaname||'.'||t.tablename) DESC
    LIMIT 10;
    
    -- Active connections
    RETURN QUERY
    SELECT 
        'Connections'::TEXT,
        'Active Connections'::TEXT,
        COUNT(*)::TEXT,
        CASE 
            WHEN COUNT(*) > 50 THEN 'WARNING'::TEXT
            ELSE 'OK'::TEXT
        END
    FROM pg_stat_activity
    WHERE state = 'active';
    
    -- Materialized views status
    RETURN QUERY
    SELECT 
        'Materialized Views'::TEXT,
        mv.matviewname::TEXT,
        CASE WHEN mv.ispopulated THEN 'Populated' ELSE 'Not Populated' END::TEXT,
        CASE WHEN mv.ispopulated THEN 'OK' ELSE 'ERROR' END::TEXT
    FROM pg_matviews mv
    WHERE mv.schemaname = 'public';
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 8. TRIGGER STATUS REPORT
-- ================================================

-- Function to check trigger status
CREATE OR REPLACE FUNCTION get_trigger_status_report()
RETURNS TABLE(
    table_name TEXT,
    trigger_name TEXT,
    status TEXT,
    function_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.event_object_table::TEXT,
        t.trigger_name::TEXT,
        CASE 
            WHEN t.trigger_name IS NOT NULL THEN 'ACTIVE'
            ELSE 'MISSING'
        END::TEXT,
        t.action_statement::TEXT
    FROM information_schema.triggers t
    WHERE t.trigger_schema = 'public'
    ORDER BY t.event_object_table, t.trigger_name;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- COMPLETION MESSAGE
-- ================================================

DO $$ 
BEGIN 
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'MISSING TRIGGERS & PROCEDURES COMPLETED!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Added triggers:';
    RAISE NOTICE '✅ Company statistics triggers';
    RAISE NOTICE '✅ Application status tracking';
    RAISE NOTICE '✅ Interview computed fields';
    RAISE NOTICE '✅ Materialized view refresh triggers';
    RAISE NOTICE '✅ Event notification triggers';
    RAISE NOTICE '✅ Data consistency triggers';
    RAISE NOTICE '';
    RAISE NOTICE 'Added procedures:';
    RAISE NOTICE '✅ Enhanced data cleanup';
    RAISE NOTICE '✅ Company metrics calculation';
    RAISE NOTICE '✅ Job recommendations';
    RAISE NOTICE '✅ Database health monitoring';
    RAISE NOTICE '✅ Trigger status reporting';
    RAISE NOTICE '==============================================';
END $$; 