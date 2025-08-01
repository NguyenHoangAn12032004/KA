-- Comprehensive Database Synchronization Script
-- This script will create proper triggers and procedures to maintain accurate counts
-- and fix all existing data discrepancies

-- 1. First, let's fix the current data discrepancies
-- Recalculate all applications counts
UPDATE jobs 
SET "applicationsCount" = (
    SELECT COUNT(*) 
    FROM applications 
    WHERE applications."jobId" = jobs.id
);

-- Recalculate all view counts  
UPDATE jobs 
SET "viewCount" = (
    SELECT COUNT(*) 
    FROM job_views 
    WHERE job_views."jobId" = jobs.id
);

-- 2. Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_job_applications_count_trigger ON applications;
DROP TRIGGER IF EXISTS update_job_views_count_trigger ON job_views;

-- 3. Create improved trigger functions

-- Applications count trigger function
CREATE OR REPLACE FUNCTION update_job_applications_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE jobs 
        SET "applicationsCount" = "applicationsCount" + 1,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = NEW."jobId";
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE jobs 
        SET "applicationsCount" = GREATEST("applicationsCount" - 1, 0),
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = OLD."jobId";
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' AND OLD."jobId" != NEW."jobId" THEN
        -- Handle job change (rare case)
        UPDATE jobs 
        SET "applicationsCount" = GREATEST("applicationsCount" - 1, 0),
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = OLD."jobId";
        
        UPDATE jobs 
        SET "applicationsCount" = "applicationsCount" + 1,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = NEW."jobId";
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Job views count trigger function
CREATE OR REPLACE FUNCTION update_job_views_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE jobs 
        SET "viewCount" = "viewCount" + 1,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = NEW."jobId";
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE jobs 
        SET "viewCount" = GREATEST("viewCount" - 1, 0),
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = OLD."jobId";
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Create the triggers
CREATE TRIGGER update_job_applications_count_trigger
    AFTER INSERT OR DELETE OR UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_job_applications_count();

CREATE TRIGGER update_job_views_count_trigger
    AFTER INSERT OR DELETE ON job_views
    FOR EACH ROW EXECUTE FUNCTION update_job_views_count();

-- 5. Create a procedure to manually sync all counts (for maintenance)
CREATE OR REPLACE FUNCTION sync_all_job_counts()
RETURNS TABLE(job_id text, old_app_count integer, new_app_count integer, old_view_count integer, new_view_count integer) AS $$
BEGIN
    RETURN QUERY
    WITH count_updates AS (
        SELECT 
            j.id as job_id,
            j."applicationsCount" as old_app_count,
            COALESCE(app_counts.count, 0) as new_app_count,
            j."viewCount" as old_view_count,
            COALESCE(view_counts.count, 0) as new_view_count
        FROM jobs j
        LEFT JOIN (
            SELECT "jobId", COUNT(*) as count
            FROM applications
            GROUP BY "jobId"
        ) app_counts ON j.id = app_counts."jobId"
        LEFT JOIN (
            SELECT "jobId", COUNT(*) as count
            FROM job_views
            GROUP BY "jobId"
        ) view_counts ON j.id = view_counts."jobId"
    )
    UPDATE jobs 
    SET 
        "applicationsCount" = count_updates.new_app_count,
        "viewCount" = count_updates.new_view_count,
        "updatedAt" = CURRENT_TIMESTAMP
    FROM count_updates
    WHERE jobs.id = count_updates.job_id
    RETURNING count_updates.*;
END;
$$ LANGUAGE plpgsql;

-- 6. Run the sync function to fix all existing data
SELECT * FROM sync_all_job_counts();

-- 7. Verify the fix for job1
SELECT 
    j.id,
    j.title,
    j."applicationsCount" as stored_app_count,
    COUNT(DISTINCT a.id) as actual_app_count,
    j."viewCount" as stored_view_count,
    COUNT(DISTINCT jv.id) as actual_view_count,
    CASE 
        WHEN j."applicationsCount" = COUNT(DISTINCT a.id) THEN '✅ SYNCED'
        ELSE '❌ MISMATCH'
    END as app_status,
    CASE 
        WHEN j."viewCount" = COUNT(DISTINCT jv.id) THEN '✅ SYNCED'
        ELSE '❌ MISMATCH'
    END as view_status
FROM jobs j
LEFT JOIN applications a ON j.id = a."jobId"
LEFT JOIN job_views jv ON j.id = jv."jobId"
WHERE j.id = 'job1'
GROUP BY j.id, j.title, j."applicationsCount", j."viewCount";

-- 8. Show all jobs with their current counts
SELECT 
    j.id,
    j.title,
    j."applicationsCount",
    j."viewCount",
    j."isActive"
FROM jobs j
ORDER BY j."createdAt" DESC
LIMIT 10;
