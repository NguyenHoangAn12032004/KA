
-- Phase 5: Initial Data and Settings

-- Insert job categories
INSERT INTO job_categories (name, description, icon, color) VALUES
('Technology', 'Software development, IT, and tech roles', 'code', '#3B82F6'),
('Marketing', 'Digital marketing, content, and promotion roles', 'megaphone', '#EF4444'),
('Sales', 'Sales representatives and business development', 'trending-up', '#10B981'),
('Design', 'UI/UX, graphic design, and creative roles', 'palette', '#8B5CF6'),
('Finance', 'Accounting, financial analysis, and banking', 'dollar-sign', '#F59E0B'),
('Human Resources', 'HR management and recruitment', 'users', '#EC4899')
ON CONFLICT (name) DO NOTHING;

-- Insert skills
INSERT INTO skills (name, category) VALUES
('JavaScript', 'TECHNICAL'),
('Python', 'TECHNICAL'),
('Java', 'TECHNICAL'),
('React', 'TECHNICAL'),
('Node.js', 'TECHNICAL'),
('Communication', 'SOFT_SKILL'),
('Leadership', 'SOFT_SKILL'),
('Problem Solving', 'SOFT_SKILL'),
('English', 'LANGUAGE'),
('Vietnamese', 'LANGUAGE')
ON CONFLICT (name) DO NOTHING;

-- Insert system settings
INSERT INTO system_settings (key, value) VALUES
('max_file_upload_size', '10485760'),
('allowed_file_types', 'pdf,doc,docx,jpg,jpeg,png'),
('session_timeout_minutes', '30'),
('max_login_attempts', '5')
ON CONFLICT (key) DO NOTHING;

-- Update existing data
UPDATE users SET is_active = true WHERE is_active IS NULL;
UPDATE users SET email_notifications = true WHERE email_notifications IS NULL;
UPDATE users SET push_notifications = true WHERE push_notifications IS NULL;

-- Update profile completion for existing students
UPDATE student_profiles 
SET profile_completion = calculate_profile_completion(user_id)
WHERE profile_completion IS NULL OR profile_completion = 0;

COMMIT;
