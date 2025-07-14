-- Clean up applications with wrong studentId
-- Delete applications with the hardcoded test user ID

DELETE FROM "Application" 
WHERE "studentId" = '550e8400-e29b-41d4-a716-446655440000' 
   OR "studentId" = '550b6400-e29b-41d4-a716-44665440000';

-- Show remaining applications
SELECT 
    "id",
    "jobId", 
    "studentId",
    "status",
    "appliedAt"
FROM "Application"
ORDER BY "appliedAt" DESC;
