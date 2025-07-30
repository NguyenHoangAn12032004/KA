-- ================================================
-- BASIC DATABASE OPTIMIZATION
-- Compatible with current schema structure
-- ================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ================================================
-- PERFORMANCE INDEXES (Current Schema)
-- ================================================

-- User indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_gin 
    ON users USING gin(email gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_active 
    ON users(role, "isActive");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at 
    ON users("createdAt");

-- Company profile indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_profiles_name_gin 
    ON company_profiles USING gin("companyName" gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_profiles_industry 
    ON company_profiles(industry) WHERE industry IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_profiles_verified 
    ON company_profiles("isVerified") WHERE "isVerified" = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_profiles_location 
    ON company_profiles(city, country);

-- Job indexes  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_title_gin 
    ON jobs USING gin(title gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_active_published 
    ON jobs("isActive", "publishedAt") WHERE "isActive" = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_company_active 
    ON jobs("companyId", "isActive");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_location_type 
    ON jobs(location, "jobType", "workMode");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_salary 
    ON jobs("salaryMin", "salaryMax") WHERE "salaryMin" IS NOT NULL;

-- Application indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_student_status 
    ON applications("studentId", status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_job_status 
    ON applications("jobId", status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_applied_at 
    ON applications("appliedAt");

-- JobView indexes for analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_job_views_job_date 
    ON job_views("jobId", "viewedAt");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_job_views_user_date 
    ON job_views("userId", "viewedAt") WHERE "userId" IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_job_views_ip_date 
    ON job_views("ipAddress", "viewedAt") WHERE "ipAddress" IS NOT NULL;

-- Activity log indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_user_type 
    ON activity_logs("userId", "activityType");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_created_at 
    ON activity_logs("createdAt");

-- Notification indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_read 
    ON notifications("userId", "isRead");
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created_at 
    ON notifications("createdAt");

-- ================================================
-- MATERIALIZED VIEWS FOR STATISTICS
-- ================================================

-- Company Statistics View
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_company_stats AS
SELECT 
    cp.id as company_id,
    cp."companyName" as company_name,
    cp.industry,
    cp.city,
    cp."isVerified" as is_verified,
    COALESCE(job_stats.total_jobs, 0) as total_jobs,
    COALESCE(job_stats.active_jobs, 0) as active_jobs,
    COALESCE(view_stats.total_views, 0) as total_views,
    COALESCE(view_stats.unique_views, 0) as unique_views,
    COALESCE(app_stats.total_applications, 0) as total_applications,
    job_stats.latest_job_posted,
    view_stats.latest_view,
    CURRENT_TIMESTAMP as last_updated
FROM company_profiles cp
LEFT JOIN (
    SELECT 
        "companyId",
        COUNT(*) as total_jobs,
        COUNT(*) FILTER (WHERE "isActive" = true) as active_jobs,
        MAX("publishedAt") as latest_job_posted
    FROM jobs 
    GROUP BY "companyId"
) job_stats ON cp.id = job_stats."companyId"
LEFT JOIN (
    SELECT 
        j."companyId",
        COUNT(jv.*) as total_views,
        COUNT(DISTINCT COALESCE(jv."userId"::text, jv."ipAddress")) as unique_views,
        MAX(jv."viewedAt") as latest_view
    FROM job_views jv
    JOIN jobs j ON jv."jobId" = j.id
    GROUP BY j."companyId"
) view_stats ON cp.id = view_stats."companyId"
LEFT JOIN (
    SELECT 
        j."companyId",
        COUNT(a.*) as total_applications
    FROM applications a
    JOIN jobs j ON a."jobId" = j.id
    GROUP BY j."companyId"
) app_stats ON cp.id = app_stats."companyId";

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_company_stats_id 
    ON mv_company_stats(company_id);
CREATE INDEX IF NOT EXISTS idx_mv_company_stats_industry 
    ON mv_company_stats(industry);
CREATE INDEX IF NOT EXISTS idx_mv_company_stats_active_jobs 
    ON mv_company_stats(active_jobs DESC);
CREATE INDEX IF NOT EXISTS idx_mv_company_stats_views 
    ON mv_company_stats(total_views DESC);

-- Job Statistics View
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_job_stats AS
SELECT 
    j.id as job_id,
    j.title,
    j."companyId" as company_id,
    j."jobType" as job_type,
    j."isActive" as is_active,
    j."publishedAt" as published_at,
    COALESCE(app_stats.total_applications, 0) as total_applications,
    COALESCE(app_stats.pending_applications, 0) as pending_applications,
    COALESCE(view_stats.total_views, 0) as total_views,
    COALESCE(view_stats.unique_views, 0) as unique_views,
    view_stats.latest_view,
    app_stats.latest_application,
    CURRENT_TIMESTAMP as last_updated
FROM jobs j
LEFT JOIN (
    SELECT 
        "jobId",
        COUNT(*) as total_applications,
        COUNT(*) FILTER (WHERE status = 'PENDING') as pending_applications,
        MAX("appliedAt") as latest_application
    FROM applications
    GROUP BY "jobId"
) app_stats ON j.id = app_stats."jobId"
LEFT JOIN (
    SELECT 
        "jobId",
        COUNT(*) as total_views,
        COUNT(DISTINCT COALESCE("userId"::text, "ipAddress")) as unique_views,
        MAX("viewedAt") as latest_view
    FROM job_views
    GROUP BY "jobId"
) view_stats ON j.id = view_stats."jobId";

-- Create indexes on job stats view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_job_stats_id 
    ON mv_job_stats(job_id);
CREATE INDEX IF NOT EXISTS idx_mv_job_stats_company 
    ON mv_job_stats(company_id);
CREATE INDEX IF NOT EXISTS idx_mv_job_stats_applications 
    ON mv_job_stats(total_applications DESC);

-- ================================================
-- BASIC FUNCTIONS AND PROCEDURES
-- ================================================

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_company_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_company_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_job_stats;
END;
$$ LANGUAGE plpgsql;

-- Function to get trending companies (basic version)
CREATE OR REPLACE FUNCTION get_trending_companies_basic(
    p_limit integer DEFAULT 10
)
RETURNS TABLE (
    company_id text,
    company_name text,
    total_views bigint,
    active_jobs bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mcs.company_id::text,
        mcs.company_name::text,
        mcs.total_views,
        mcs.active_jobs
    FROM mv_company_stats mcs
    WHERE mcs.active_jobs > 0
    ORDER BY mcs.total_views DESC, mcs.active_jobs DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old data (basic version)
CREATE OR REPLACE FUNCTION cleanup_old_data_basic(
    p_days_to_keep integer DEFAULT 90
)
RETURNS integer AS $$
DECLARE
    deleted_count integer := 0;
    cutoff_date timestamp;
BEGIN
    cutoff_date := CURRENT_TIMESTAMP - (p_days_to_keep || ' days')::interval;
    
    -- Clean old job views
    DELETE FROM job_views 
    WHERE "viewedAt" < cutoff_date;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Clean old activity logs
    DELETE FROM activity_logs 
    WHERE "createdAt" < cutoff_date;
    
    -- Clean expired refresh tokens
    DELETE FROM refresh_tokens 
    WHERE "expiresAt" < CURRENT_TIMESTAMP;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- DATABASE HEALTH VIEW
-- ================================================

CREATE OR REPLACE VIEW v_database_health AS
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_stat_get_tuples_inserted(c.oid) as inserts,
    pg_stat_get_tuples_updated(c.oid) as updates,
    pg_stat_get_tuples_deleted(c.oid) as deletes,
    pg_stat_get_live_tuples(c.oid) as live_tuples,
    pg_stat_get_dead_tuples(c.oid) as dead_tuples
FROM pg_tables pt
JOIN pg_class c ON c.relname = pt.tablename
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ================================================
-- FINAL SETUP
-- ================================================

-- Grant permissions
GRANT SELECT ON mv_company_stats TO PUBLIC;
GRANT SELECT ON mv_job_stats TO PUBLIC;
GRANT SELECT ON v_database_health TO PUBLIC;

-- Refresh materialized views
SELECT refresh_company_stats();

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'BASIC DATABASE OPTIMIZATION COMPLETED!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Features enabled:';
    RAISE NOTICE '✅ Performance indexes created';
    RAISE NOTICE '✅ Materialized views for statistics';
    RAISE NOTICE '✅ Basic stored procedures';
    RAISE NOTICE '✅ Database health monitoring';
    RAISE NOTICE '==============================================';
END $$; 