-- Test view trigger functionality with proper UUID
INSERT INTO job_views (id, "jobId", "ipAddress", "userAgent", "viewedAt") 
VALUES (gen_random_uuid()::text, '8d31a545-546f-4f88-b240-94a854003b3f', '192.168.1.100', 'Test Browser', NOW());

-- Check the updated count
SELECT id, title, "viewCount" FROM jobs WHERE id = '8d31a545-546f-4f88-b240-94a854003b3f';
