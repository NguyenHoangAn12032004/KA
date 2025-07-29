-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN     "profile_completion" INTEGER DEFAULT 0;

-- Tạo bảng job_views mới nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS "job_views" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_views_pkey" PRIMARY KEY ("id")
);

-- Đảm bảo cột viewCount tồn tại trong bảng jobs
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'viewCount') THEN
        ALTER TABLE "jobs" ADD COLUMN "viewCount" INTEGER DEFAULT 0;
    END IF;
END $$;

-- Đảm bảo cột applicationsCount tồn tại trong bảng jobs
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'applicationsCount') THEN
        ALTER TABLE "jobs" ADD COLUMN "applicationsCount" INTEGER DEFAULT 0;
    END IF;
END $$;

-- Tạo trigger để tự động cập nhật viewCount trong bảng jobs
CREATE OR REPLACE FUNCTION update_job_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "jobs"
    SET "viewCount" = (SELECT COUNT(*) FROM "job_views" WHERE "jobId" = NEW."jobId")
    WHERE "id" = NEW."jobId";
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Xóa trigger nếu đã tồn tại để tránh lỗi
DROP TRIGGER IF EXISTS trigger_update_job_view_count ON "job_views";

-- Tạo trigger mới
CREATE TRIGGER trigger_update_job_view_count
AFTER INSERT ON "job_views"
FOR EACH ROW
EXECUTE FUNCTION update_job_view_count();

-- Tạo trigger để tự động cập nhật applicationsCount trong bảng jobs
CREATE OR REPLACE FUNCTION update_job_applications_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "jobs"
    SET "applicationsCount" = (SELECT COUNT(*) FROM "applications" WHERE "jobId" = NEW."jobId")
    WHERE "id" = NEW."jobId";
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Xóa trigger nếu đã tồn tại để tránh lỗi
DROP TRIGGER IF EXISTS trigger_update_job_applications_count ON "applications";

-- Tạo trigger mới
CREATE TRIGGER trigger_update_job_applications_count
AFTER INSERT ON "applications"
FOR EACH ROW
EXECUTE FUNCTION update_job_applications_count();

-- Tạo trigger để cập nhật applicationsCount khi xóa ứng dụng
CREATE OR REPLACE FUNCTION update_job_applications_count_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "jobs"
    SET "applicationsCount" = (SELECT COUNT(*) FROM "applications" WHERE "jobId" = OLD."jobId")
    WHERE "id" = OLD."jobId";
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Xóa trigger nếu đã tồn tại để tránh lỗi
DROP TRIGGER IF EXISTS trigger_update_job_applications_count_on_delete ON "applications";

-- Tạo trigger mới
CREATE TRIGGER trigger_update_job_applications_count_on_delete
AFTER DELETE ON "applications"
FOR EACH ROW
EXECUTE FUNCTION update_job_applications_count_on_delete();

-- AddForeignKey
ALTER TABLE "job_views" ADD CONSTRAINT "job_views_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add sample users
INSERT INTO users (id, email, password, role, "isActive", "isVerified", "createdAt", "updatedAt")
VALUES
  ('usr1', 'student1@example.com', '$2a$10$XXX', 'STUDENT', true, true, NOW(), NOW()),
  ('usr2', 'student2@example.com', '$2a$10$XXX', 'STUDENT', true, true, NOW(), NOW()),
  ('usr3', 'student3@example.com', '$2a$10$XXX', 'STUDENT', true, true, NOW(), NOW()),
  ('usr4', 'student4@example.com', '$2a$10$XXX', 'STUDENT', true, true, NOW(), NOW()),
  ('usr5', 'student5@example.com', '$2a$10$XXX', 'STUDENT', true, true, NOW(), NOW());

-- Add student profiles
INSERT INTO student_profiles (
  id, "userId", "firstName", "lastName", phone, university, major, "graduationYear",
  skills, experience, "createdAt", "updatedAt"
)
VALUES
  (
    'sp1', 'usr1', 'Minh', 'Nguyễn', '0901234567', 'Đại học Bách Khoa Hà Nội',
    'Kỹ thuật phần mềm', 2024,
    ARRAY['JavaScript', 'React', 'Node.js'], 'Thực tập tại FPT Software', NOW(), NOW()
  ),
  (
    'sp2', 'usr2', 'Hương', 'Trần', '0901234568', 'Đại học Công nghệ - ĐHQGHN',
    'Khoa học máy tính', 2024,
    ARRAY['Python', 'Machine Learning', 'SQL'], 'Nghiên cứu về AI', NOW(), NOW()
  ),
  (
    'sp3', 'usr3', 'Đức', 'Lê', '0901234569', 'Đại học FPT',
    'An toàn thông tin', 2023,
    ARRAY['Java', 'Spring Boot', 'Security'], 'Phát triển ứng dụng bảo mật', NOW(), NOW()
  ),
  (
    'sp4', 'usr4', 'Anh', 'Phạm', '0901234570', 'Học viện Công nghệ Bưu chính Viễn thông',
    'IoT', 2024,
    ARRAY['C++', 'Arduino', 'IoT'], 'Dự án IoT thông minh', NOW(), NOW()
  ),
  (
    'sp5', 'usr5', 'Thảo', 'Vũ', '0901234571', 'Đại học Ngoại thương',
    'Thương mại điện tử', 2023,
    ARRAY['Digital Marketing', 'SEO', 'Content'], 'Marketing Online', NOW(), NOW()
  );

-- Add company profile
INSERT INTO company_profiles (
  id, "userId", "companyName", "companySize", industry, website, "contactPerson",
  phone, address, city, country, "isVerified", "createdAt", "updatedAt"
)
VALUES (
  'comp1', 'usr1', 'Tech Solutions Vietnam', '100-500', 'Software',
  'https://techsolutions.vn', 'HR Manager', '0909123456',
  '123 Cách Mạng Tháng 8', 'Ho Chi Minh City', 'Vietnam',
  true, NOW(), NOW()
);

-- Add jobs
INSERT INTO jobs (
  id, "companyId", title, description, requirements, benefits,
  "jobType", "workMode", "experienceLevel", location,
  "salaryMin", "salaryMax", "isActive", "createdAt", "updatedAt"
)
VALUES
  (
    'job1', 'comp1', 'Frontend Developer',
    'Phát triển ứng dụng web với React',
    ARRAY['Có kinh nghiệm với React', 'Hiểu biết về REST API'],
    ARRAY['Lương thưởng hấp dẫn', 'Môi trường năng động'],
    'FULL_TIME', 'HYBRID', 'JUNIOR',
    'Ho Chi Minh City', 15000000, 25000000,
    true, NOW(), NOW()
  ),
  (
    'job2', 'comp1', 'Backend Developer',
    'Phát triển API và microservices',
    ARRAY['Kinh nghiệm Node.js', 'Hiểu biết về database'],
    ARRAY['Chế độ đãi ngộ tốt', 'Cơ hội thăng tiến'],
    'FULL_TIME', 'ONSITE', 'INTERMEDIATE',
    'Ha Noi', 20000000, 35000000,
    true, NOW(), NOW()
  );

-- Add applications
INSERT INTO applications (
  id, "jobId", "studentId", "status", "statusHistory",
  "appliedAt", "createdAt", "updatedAt"
)
VALUES
  (
    'app1', 'job1', 'usr1', 'PENDING',
    '[{"status": "PENDING", "timestamp": "2024-01-20T00:00:00Z"}]',
    '2024-01-20T00:00:00Z', NOW(), NOW()
  ),
  (
    'app2', 'job1', 'usr2', 'REVIEWING',
    '[{"status": "PENDING", "timestamp": "2024-01-19T00:00:00Z"}, {"status": "REVIEWING", "timestamp": "2024-01-20T00:00:00Z"}]',
    '2024-01-19T00:00:00Z', NOW(), NOW()
  ),
  (
    'app3', 'job2', 'usr3', 'SHORTLISTED',
    '[{"status": "PENDING", "timestamp": "2024-01-18T00:00:00Z"}, {"status": "REVIEWING", "timestamp": "2024-01-19T00:00:00Z"}, {"status": "SHORTLISTED", "timestamp": "2024-01-20T00:00:00Z"}]',
    '2024-01-18T00:00:00Z', NOW(), NOW()
  ),
  (
    'app4', 'job2', 'usr4', 'INTERVIEW_SCHEDULED',
    '[{"status": "PENDING", "timestamp": "2024-01-17T00:00:00Z"}, {"status": "REVIEWING", "timestamp": "2024-01-18T00:00:00Z"}, {"status": "SHORTLISTED", "timestamp": "2024-01-19T00:00:00Z"}, {"status": "INTERVIEW_SCHEDULED", "timestamp": "2024-01-20T00:00:00Z"}]',
    '2024-01-17T00:00:00Z', NOW(), NOW()
  ),
  (
    'app5', 'job1', 'usr5', 'ACCEPTED',
    '[{"status": "PENDING", "timestamp": "2024-01-16T00:00:00Z"}, {"status": "REVIEWING", "timestamp": "2024-01-17T00:00:00Z"}, {"status": "SHORTLISTED", "timestamp": "2024-01-18T00:00:00Z"}, {"status": "INTERVIEW_SCHEDULED", "timestamp": "2024-01-19T00:00:00Z"}, {"status": "ACCEPTED", "timestamp": "2024-01-20T00:00:00Z"}]',
    '2024-01-16T00:00:00Z', NOW(), NOW()
  );

-- Add interviews
INSERT INTO interviews (
  id, "applicationId", "companyId", "jobId", title,
  description, type, "scheduledAt", duration,
  "createdAt", "updatedAt"
)
VALUES
  (
    'int1', 'app4', 'comp1', 'job2',
    'Phỏng vấn kỹ thuật Backend Developer',
    'Đánh giá kiến thức về Node.js và database',
    'TECHNICAL', '2024-01-25T09:00:00Z', 60,
    NOW(), NOW()
  );
