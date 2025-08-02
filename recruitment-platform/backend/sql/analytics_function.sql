-- Drop existing function first
DROP FUNCTION IF EXISTS get_dashboard_analytics(integer);

-- Create function to calculate analytics from real data with trends
CREATE OR REPLACE FUNCTION get_dashboard_analytics(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    job_views_30d BIGINT,
    applications_30d BIGINT,
    interviews_30d BIGINT,
    total_users BIGINT,
    total_jobs BIGINT,
    total_applications BIGINT,
    total_companies BIGINT,
    job_views_trend NUMERIC,
    applications_trend NUMERIC,
    interviews_trend NUMERIC
) AS $$
DECLARE
    interval_text TEXT;
    prev_interval_text TEXT;
BEGIN
    interval_text := days_back || ' days';
    prev_interval_text := (days_back * 2) || ' days';
    
    RETURN QUERY
    EXECUTE format('
    WITH current_period AS (
        SELECT 
            COUNT(*) FILTER (WHERE source = ''job_views'') as job_views_curr,
            COUNT(*) FILTER (WHERE source = ''applications'') as applications_curr,
            COUNT(*) FILTER (WHERE source = ''interviews'') as interviews_curr
        FROM (
            SELECT ''job_views'' as source FROM job_views 
            WHERE "viewedAt" >= NOW() - INTERVAL ''%s''
            UNION ALL
            SELECT ''applications'' as source FROM applications 
            WHERE "appliedAt" >= NOW() - INTERVAL ''%s''
            UNION ALL
            SELECT ''interviews'' as source FROM interviews 
            WHERE "scheduledAt" >= NOW() - INTERVAL ''%s''
        ) combined
    ),
    previous_period AS (
        SELECT 
            COUNT(*) FILTER (WHERE source = ''job_views'') as job_views_prev,
            COUNT(*) FILTER (WHERE source = ''applications'') as applications_prev,
            COUNT(*) FILTER (WHERE source = ''interviews'') as interviews_prev
        FROM (
            SELECT ''job_views'' as source FROM job_views 
            WHERE "viewedAt" >= NOW() - INTERVAL ''%s'' 
            AND "viewedAt" < NOW() - INTERVAL ''%s''
            UNION ALL
            SELECT ''applications'' as source FROM applications 
            WHERE "appliedAt" >= NOW() - INTERVAL ''%s''
            AND "appliedAt" < NOW() - INTERVAL ''%s''
            UNION ALL
            SELECT ''interviews'' as source FROM interviews 
            WHERE "scheduledAt" >= NOW() - INTERVAL ''%s''
            AND "scheduledAt" < NOW() - INTERVAL ''%s''
        ) combined
    )
    SELECT 
        curr.job_views_curr::BIGINT,
        curr.applications_curr::BIGINT,
        curr.interviews_curr::BIGINT,
        (SELECT COUNT(*) FROM users WHERE role = ''STUDENT'')::BIGINT,
        (SELECT COUNT(*) FROM jobs WHERE "isActive" = true)::BIGINT,
        (SELECT COUNT(*) FROM applications)::BIGINT,
        (SELECT COUNT(*) FROM company_profiles)::BIGINT,
        CASE WHEN prev.job_views_prev > 0 THEN 
            ROUND((curr.job_views_curr - prev.job_views_prev) * 100.0 / prev.job_views_prev, 1)
        ELSE 0 END::NUMERIC,
        CASE WHEN prev.applications_prev > 0 THEN 
            ROUND((curr.applications_curr - prev.applications_prev) * 100.0 / prev.applications_prev, 1)
        ELSE 0 END::NUMERIC,
        CASE WHEN prev.interviews_prev > 0 THEN 
            ROUND((curr.interviews_curr - prev.interviews_prev) * 100.0 / prev.interviews_prev, 1)
        ELSE 0 END::NUMERIC
    FROM current_period curr, previous_period prev
    ', interval_text, interval_text, interval_text, 
       prev_interval_text, interval_text,
       prev_interval_text, interval_text,
       prev_interval_text, interval_text);
END;
$$ LANGUAGE plpgsql;
