/*
  Warnings:

  - You are about to drop the column `applied_at` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `hr_notes` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `referrer_id` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `responded_at` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `reviewed_at` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `screening_answers` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `status_history` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `application_deadline` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `auto_close_date` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `is_featured` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `max_applications` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `preferred_skills` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `priority_level` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `published_at` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `required_skills` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `salary_max` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `salary_min` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `screening_questions` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `view_count` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `availability_date` on the `student_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `certifications` on the `student_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `emergency_contact` on the `student_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `expected_salary_max` on the `student_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `expected_salary_min` on the `student_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `languages` on the `student_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `preferred_locations` on the `student_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `profile_completion` on the `student_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `profile_views` on the `student_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `projects` on the `student_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `work_authorization` on the `student_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `email_notifications` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `failed_login_attempts` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_login` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_password_change` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `locked_until` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `push_notifications` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `social_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `social_provider` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `two_factor_enabled` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `two_factor_secret` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "LanguageProficiency" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'NATIVE');

-- AlterTable
ALTER TABLE "applications" DROP COLUMN "applied_at",
DROP COLUMN "hr_notes",
DROP COLUMN "referrer_id",
DROP COLUMN "responded_at",
DROP COLUMN "reviewed_at",
DROP COLUMN "screening_answers",
DROP COLUMN "source",
DROP COLUMN "status_history";

-- AlterTable
ALTER TABLE "company_profiles" ADD COLUMN     "email" TEXT,
ADD COLUMN     "founded" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "application_deadline",
DROP COLUMN "auto_close_date",
DROP COLUMN "category_id",
DROP COLUMN "deleted_at",
DROP COLUMN "is_featured",
DROP COLUMN "max_applications",
DROP COLUMN "preferred_skills",
DROP COLUMN "priority_level",
DROP COLUMN "published_at",
DROP COLUMN "required_skills",
DROP COLUMN "salary_max",
DROP COLUMN "salary_min",
DROP COLUMN "screening_questions",
DROP COLUMN "view_count",
ADD COLUMN     "applicationsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "qualifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "reportingTo" TEXT;

-- AlterTable
ALTER TABLE "student_profiles" DROP COLUMN "availability_date",
DROP COLUMN "certifications",
DROP COLUMN "emergency_contact",
DROP COLUMN "expected_salary_max",
DROP COLUMN "expected_salary_min",
DROP COLUMN "languages",
DROP COLUMN "preferred_locations",
DROP COLUMN "profile_completion",
DROP COLUMN "profile_views",
DROP COLUMN "projects",
DROP COLUMN "work_authorization";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "deleted_at",
DROP COLUMN "email_notifications",
DROP COLUMN "failed_login_attempts",
DROP COLUMN "last_login",
DROP COLUMN "last_password_change",
DROP COLUMN "locked_until",
DROP COLUMN "push_notifications",
DROP COLUMN "social_id",
DROP COLUMN "social_provider",
DROP COLUMN "two_factor_enabled",
DROP COLUMN "two_factor_secret";

-- CreateTable
CREATE TABLE "saved_jobs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_educations" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "fieldOfStudy" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "current" BOOLEAN NOT NULL DEFAULT false,
    "gpa" DOUBLE PRECISION,
    "achievements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_educations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_experiences" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "current" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "achievements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_projects" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "technologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "current" BOOLEAN NOT NULL DEFAULT false,
    "githubUrl" TEXT,
    "liveUrl" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_languages" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "proficiency" "LanguageProficiency" NOT NULL,
    "certification" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_certifications" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "credentialId" TEXT,
    "credentialUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "saved_jobs_userId_jobId_key" ON "saved_jobs"("userId", "jobId");

-- AddForeignKey
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_educations" ADD CONSTRAINT "student_educations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_experiences" ADD CONSTRAINT "student_experiences_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_projects" ADD CONSTRAINT "student_projects_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_languages" ADD CONSTRAINT "student_languages_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_certifications" ADD CONSTRAINT "student_certifications_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Function to calculate profile completion
CREATE OR REPLACE FUNCTION calc_profile_completion()
RETURNS TRIGGER AS $$
DECLARE
  filled_fields INT := 0;
  total_fields INT := 8; -- Adjust this if you want to count more/less fields
BEGIN
  IF NEW."firstName" IS NOT NULL AND LENGTH(TRIM(NEW."firstName")) > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF NEW."lastName" IS NOT NULL AND LENGTH(TRIM(NEW."lastName")) > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF NEW."phone" IS NOT NULL AND LENGTH(TRIM(NEW."phone")) > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF NEW."university" IS NOT NULL AND LENGTH(TRIM(NEW."university")) > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF NEW."major" IS NOT NULL AND LENGTH(TRIM(NEW."major")) > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF NEW."gpa" IS NOT NULL THEN filled_fields := filled_fields + 1; END IF;
  IF NEW."linkedin" IS NOT NULL AND LENGTH(TRIM(NEW."linkedin")) > 0 THEN filled_fields := filled_fields + 1; END IF;
  IF NEW."github" IS NOT NULL AND LENGTH(TRIM(NEW."github")) > 0 THEN filled_fields := filled_fields + 1; END IF;
  NEW.profile_completion := ROUND((filled_fields::NUMERIC / total_fields) * 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update profile_completion on insert or update
DROP TRIGGER IF EXISTS trg_profile_completion ON "student_profiles";
CREATE TRIGGER trg_profile_completion
BEFORE INSERT OR UPDATE ON "student_profiles"
FOR EACH ROW EXECUTE FUNCTION calc_profile_completion();
