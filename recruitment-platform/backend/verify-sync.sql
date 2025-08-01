-- Verify job counts are synchronized
SELECT 
    j.id,
    j.title,
    j."applicationsCount" as stored_count,
    COUNT(a.id) as actual_count,
    CASE 
        WHEN j."applicationsCount" = COUNT(a.id) THEN '✅ SYNCED'
        ELSE '❌ MISMATCH'
    END as status
FROM jobs j 
LEFT JOIN applications a ON j.id = a."jobId" 
WHERE j.id IN ('job1', 'job2')
GROUP BY j.id, j.title, j."applicationsCount";

-- Show recent activity
SELECT 'Recent Applications' as activity_type, COUNT(*) as count
FROM applications 
WHERE "appliedAt" > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 'Recent Views' as activity_type, COUNT(*) as count
FROM job_views 
WHERE "viewedAt" > NOW() - INTERVAL '24 hours';
