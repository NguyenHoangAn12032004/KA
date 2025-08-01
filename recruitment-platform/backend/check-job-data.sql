-- Check actual data for job1
SELECT id, title, "applicationsCount", "viewCount" FROM jobs WHERE id = 'job1';

-- Check actual applications count
SELECT COUNT(*) as actual_applications FROM applications WHERE "jobId" = 'job1';

-- Check actual job views count  
SELECT COUNT(*) as actual_views FROM job_views WHERE "jobId" = 'job1';

-- Show discrepancies
SELECT 
    j.id,
    j.title,
    j."applicationsCount" as stored_app_count,
    COUNT(DISTINCT a.id) as actual_app_count,
    j."viewCount" as stored_view_count,
    COUNT(DISTINCT jv.id) as actual_view_count
FROM jobs j
LEFT JOIN applications a ON j.id = a."jobId"
LEFT JOIN job_views jv ON j.id = jv."jobId"
WHERE j.id = 'job1'
GROUP BY j.id, j.title, j."applicationsCount", j."viewCount";
