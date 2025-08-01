-- Check current view count discrepancies
SELECT 
    j.id,
    j.title,
    j."viewCount" as stored_views,
    COUNT(jv.id) as actual_views,
    CASE 
        WHEN j."viewCount" = COUNT(jv.id) THEN '✅ SYNCED'
        ELSE '❌ MISMATCH'
    END as status
FROM jobs j 
LEFT JOIN job_views jv ON j.id = jv."jobId" 
GROUP BY j.id, j.title, j."viewCount"
ORDER BY j.title
LIMIT 10;

-- Update all job view counts to match actual data
UPDATE jobs 
SET "viewCount" = (
    SELECT COUNT(*) 
    FROM job_views 
    WHERE job_views."jobId" = jobs.id
),
"updatedAt" = CURRENT_TIMESTAMP;

-- Verify the update worked
SELECT 
    j.id,
    j.title,
    j."viewCount" as updated_views,
    COUNT(jv.id) as actual_views,
    CASE 
        WHEN j."viewCount" = COUNT(jv.id) THEN '✅ SYNCED'
        ELSE '❌ STILL MISMATCH'
    END as status
FROM jobs j 
LEFT JOIN job_views jv ON j.id = jv."jobId" 
GROUP BY j.id, j.title, j."viewCount"
ORDER BY j.title
LIMIT 10;
