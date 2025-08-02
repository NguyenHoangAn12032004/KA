-- Analytics Triggers and Procedures
-- Tự động theo dõi các sự kiện analytics

-- Function để thêm analytics record
CREATE OR REPLACE FUNCTION track_analytics_event(
    p_metric VARCHAR,
    p_user_id VARCHAR DEFAULT NULL,
    p_job_id VARCHAR DEFAULT NULL,
    p_company_id VARCHAR DEFAULT NULL,
    p_value INTEGER DEFAULT 1,
    p_metadata JSONB DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    today_date DATE;
    analytics_id VARCHAR;
BEGIN
    -- Lấy ngày hôm nay
    today_date := CURRENT_DATE;
    
    -- Tạo ID duy nhất
    analytics_id := p_metric || '_' || today_date || '_' || 
                   COALESCE(p_user_id, 'null') || '_' || 
                   COALESCE(p_job_id, 'null') || '_' || 
                   COALESCE(p_company_id, 'null');
    
    -- Insert hoặc update analytics record
    INSERT INTO analytics (id, metric, value, date, "userId", "jobId", "companyId", metadata, "createdAt")
    VALUES (analytics_id, p_metric, p_value, today_date, p_user_id, p_job_id, p_company_id, p_metadata, NOW())
    ON CONFLICT (id) 
    DO UPDATE SET 
        value = analytics.value + p_value,
        metadata = COALESCE(p_metadata, analytics.metadata);
        
EXCEPTION
    WHEN OTHERS THEN
        -- Log error nhưng không fail transaction
        RAISE NOTICE 'Error in track_analytics_event: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Trigger cho job views (khi viewCount tăng)
CREATE OR REPLACE FUNCTION track_job_view() RETURNS TRIGGER AS $$
BEGIN
    -- Chỉ track khi viewCount thực sự tăng
    IF NEW."viewCount" > OLD."viewCount" THEN
        PERFORM track_analytics_event(
            'job_view',
            NULL, -- Không có userId trong job view thông thường
            NEW.id,
            NEW."companyId",
            NEW."viewCount" - OLD."viewCount"
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger cho khi có application mới
CREATE OR REPLACE FUNCTION track_application_submit() RETURNS TRIGGER AS $$
BEGIN
    PERFORM track_analytics_event(
        'application_submit',
        NEW."userId",
        NEW."jobId",
        (SELECT "companyId" FROM jobs WHERE id = NEW."jobId"),
        1
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger cho khi có interview mới
CREATE OR REPLACE FUNCTION track_interview() RETURNS TRIGGER AS $$
DECLARE
    app_record RECORD;
BEGIN
    -- Lấy thông tin application
    SELECT a."userId", a."jobId", j."companyId"
    INTO app_record
    FROM applications a
    JOIN jobs j ON a."jobId" = j.id
    WHERE a.id = NEW."applicationId";
    
    IF FOUND THEN
        PERFORM track_analytics_event(
            'interview',
            app_record."userId",
            app_record."jobId",
            app_record."companyId",
            1
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger cho saved jobs
CREATE OR REPLACE FUNCTION track_job_saved() RETURNS TRIGGER AS $$
BEGIN
    PERFORM track_analytics_event(
        'job_saved',
        NEW."userId",
        NEW."jobId",
        (SELECT "companyId" FROM jobs WHERE id = NEW."jobId"),
        1
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS job_view_analytics_trigger ON jobs;
DROP TRIGGER IF EXISTS application_analytics_trigger ON applications;
DROP TRIGGER IF EXISTS interview_analytics_trigger ON interviews;
DROP TRIGGER IF EXISTS saved_job_analytics_trigger ON "savedJobs";

-- Create triggers
CREATE TRIGGER job_view_analytics_trigger
    AFTER UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION track_job_view();

CREATE TRIGGER application_analytics_trigger
    AFTER INSERT ON applications
    FOR EACH ROW
    EXECUTE FUNCTION track_application_submit();

CREATE TRIGGER interview_analytics_trigger
    AFTER INSERT ON interviews
    FOR EACH ROW
    EXECUTE FUNCTION track_interview();

CREATE TRIGGER saved_job_analytics_trigger
    AFTER INSERT ON "savedJobs"
    FOR EACH ROW
    EXECUTE FUNCTION track_job_saved();

-- Function để đồng bộ dữ liệu analytics cũ
CREATE OR REPLACE FUNCTION sync_historical_analytics() RETURNS VOID AS $$
DECLARE
    rec RECORD;
BEGIN
    -- Sync job views từ viewCount hiện tại
    FOR rec IN 
        SELECT id, "companyId", "viewCount", "createdAt"::date as created_date
        FROM jobs 
        WHERE "viewCount" > 0
    LOOP
        PERFORM track_analytics_event(
            'job_view',
            NULL,
            rec.id,
            rec."companyId",
            rec."viewCount"
        );
    END LOOP;
    
    -- Sync applications
    FOR rec IN
        SELECT "userId", "jobId", j."companyId", a."createdAt"::date as created_date
        FROM applications a
        JOIN jobs j ON a."jobId" = j.id
    LOOP
        PERFORM track_analytics_event(
            'application_submit',
            rec."userId",
            rec."jobId",
            rec."companyId",
            1
        );
    END LOOP;
    
    -- Sync interviews
    FOR rec IN
        SELECT a."userId", a."jobId", j."companyId", i."createdAt"::date as created_date
        FROM interviews i
        JOIN applications a ON i."applicationId" = a.id
        JOIN jobs j ON a."jobId" = j.id
    LOOP
        PERFORM track_analytics_event(
            'interview',
            rec."userId",
            rec."jobId",
            rec."companyId",
            1
        );
    END LOOP;
    
    -- Sync saved jobs
    FOR rec IN
        SELECT "userId", "jobId", j."companyId", s."createdAt"::date as created_date
        FROM "savedJobs" s
        JOIN jobs j ON s."jobId" = j.id
    LOOP
        PERFORM track_analytics_event(
            'job_saved',
            rec."userId",
            rec."jobId",
            rec."companyId",
            1
        );
    END LOOP;
    
    RAISE NOTICE 'Historical analytics sync completed';
END;
$$ LANGUAGE plpgsql;

-- Chạy sync dữ liệu cũ
SELECT sync_historical_analytics();

COMMIT;
