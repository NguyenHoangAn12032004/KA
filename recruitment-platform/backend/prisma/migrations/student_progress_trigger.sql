-- Function to calculate student progress metrics
CREATE OR REPLACE FUNCTION calculate_student_progress(student_profile_id TEXT)
RETURNS TABLE (
  total_projects INTEGER,
  total_skills INTEGER,
  total_certifications INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH project_count AS (
    SELECT COUNT(*) AS count
    FROM "student_projects"
    WHERE "studentId" = student_profile_id
  ),
  skill_count AS (
    SELECT 
      CASE 
        WHEN "skills" IS NULL THEN 0
        ELSE ARRAY_LENGTH("skills", 1)
      END AS count
    FROM "student_profiles"
    WHERE "id" = student_profile_id
  ),
  cert_count AS (
    SELECT COUNT(*) AS count
    FROM "student_certifications"
    WHERE "studentId" = student_profile_id
  )
  SELECT 
    project_count.count AS total_projects,
    skill_count.count AS total_skills,
    cert_count.count AS total_certifications
  FROM project_count, skill_count, cert_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update profile completion based on data completeness
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
DECLARE
  completion_score INTEGER := 0;
  has_basic_info BOOLEAN;
  has_education BOOLEAN;
  has_projects BOOLEAN;
  has_skills BOOLEAN;
  has_social_links BOOLEAN;
  education_count INTEGER;
  project_count INTEGER;
  skill_count INTEGER;
BEGIN
  -- Check basic info
  has_basic_info := (NEW."firstName" IS NOT NULL AND NEW."lastName" IS NOT NULL AND NEW."phone" IS NOT NULL);
  
  -- Check education
  SELECT COUNT(*) INTO education_count FROM "student_educations" WHERE "studentId" = NEW.id;
  has_education := (education_count > 0);
  
  -- Check projects
  SELECT COUNT(*) INTO project_count FROM "student_projects" WHERE "studentId" = NEW.id;
  has_projects := (project_count > 0);
  
  -- Check skills
  has_skills := (NEW."skills" IS NOT NULL AND ARRAY_LENGTH(NEW."skills", 1) > 0);
  
  -- Check social links
  has_social_links := (NEW."github" IS NOT NULL OR NEW."linkedin" IS NOT NULL OR NEW."portfolio" IS NOT NULL);
  
  -- Calculate completion score
  IF has_basic_info THEN completion_score := completion_score + 20; END IF;
  IF has_education THEN completion_score := completion_score + 20; END IF;
  IF has_projects THEN completion_score := completion_score + 20; END IF;
  IF has_skills THEN completion_score := completion_score + 20; END IF;
  IF has_social_links THEN completion_score := completion_score + 20; END IF;
  
  -- Update profile completion score
  NEW."profile_completion" := completion_score;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update profile completion on student profile changes
DROP TRIGGER IF EXISTS update_profile_completion_trigger ON "student_profiles";
CREATE TRIGGER update_profile_completion_trigger
BEFORE INSERT OR UPDATE ON "student_profiles"
FOR EACH ROW
EXECUTE FUNCTION update_profile_completion();

-- Comment explaining how to use the function
COMMENT ON FUNCTION calculate_student_progress(TEXT) IS 'Calculate progress metrics for a student profile including project count, skill count, and certification count'; 