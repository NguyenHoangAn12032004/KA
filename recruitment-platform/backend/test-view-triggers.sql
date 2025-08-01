-- Create some test job views to verify real-time synchronization
INSERT INTO job_views ("jobId", "userId", "ipAddress", "userAgent", "viewedAt")
VALUES 
  ('8d31a545-546f-4f88-b240-94a854003b3f', NULL, '192.168.1.100', 'Test Browser 1', NOW()),
  ('8d31a545-546f-4f88-b240-94a854003b3f', NULL, '192.168.1.101', 'Test Browser 2', NOW()),
  ('job1', NULL, '192.168.1.102', 'Test Browser 3', NOW());

-- Check if the triggers update the view counts automatically
SELECT 
    j.id,
    j.title,
    j."viewCount" as stored_views_before,
    COUNT(jv.id) as actual_views_after
FROM jobs j 
LEFT JOIN job_views jv ON j.id = jv."jobId" 
WHERE j.id IN ('8d31a545-546f-4f88-b240-94a854003b3f', 'job1')
GROUP BY j.id, j.title, j."viewCount";
