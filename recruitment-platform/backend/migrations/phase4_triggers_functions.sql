
-- Phase 4: Triggers and Functions

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    changed_fields TEXT[];
BEGIN
    IF TG_OP = 'DELETE' THEN
        old_data = to_jsonb(OLD);
        INSERT INTO audit_logs (
            table_name, record_id, operation, old_values, created_at
        ) VALUES (
            TG_TABLE_NAME, OLD.id::TEXT, TG_OP, old_data, NOW()
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        old_data = to_jsonb(OLD);
        new_data = to_jsonb(NEW);
        
        SELECT array_agg(key) INTO changed_fields
        FROM jsonb_each(old_data) o
        WHERE NOT (new_data ? o.key AND new_data->>o.key = o.value);
        
        INSERT INTO audit_logs (
            table_name, record_id, operation, old_values, new_values, changed_fields, created_at
        ) VALUES (
            TG_TABLE_NAME, NEW.id::TEXT, TG_OP, old_data, new_data, changed_fields, NOW()
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        new_data = to_jsonb(NEW);
        INSERT INTO audit_logs (
            table_name, record_id, operation, new_values, created_at
        ) VALUES (
            TG_TABLE_NAME, NEW.id::TEXT, TG_OP, new_data, NOW()
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers
DROP TRIGGER IF EXISTS audit_users_trigger ON users;
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_jobs_trigger ON jobs;
CREATE TRIGGER audit_jobs_trigger
    AFTER INSERT OR UPDATE OR DELETE ON jobs
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_applications_trigger ON applications;
CREATE TRIGGER audit_applications_trigger
    AFTER INSERT OR UPDATE OR DELETE ON applications
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Profile completion calculation function
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    completion_score INTEGER := 0;
    profile_record RECORD;
BEGIN
    SELECT sp.* INTO profile_record
    FROM student_profiles sp
    WHERE sp.user_id = user_id_param;
    
    IF profile_record IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Calculate completion based on filled fields
    IF profile_record.first_name IS NOT NULL AND profile_record.first_name != '' THEN
        completion_score := completion_score + 5;
    END IF;
    IF profile_record.last_name IS NOT NULL AND profile_record.last_name != '' THEN
        completion_score := completion_score + 5;
    END IF;
    IF profile_record.phone IS NOT NULL AND profile_record.phone != '' THEN
        completion_score := completion_score + 5;
    END IF;
    IF profile_record.university IS NOT NULL AND profile_record.university != '' THEN
        completion_score := completion_score + 10;
    END IF;
    IF profile_record.major IS NOT NULL AND profile_record.major != '' THEN
        completion_score := completion_score + 10;
    END IF;
    IF array_length(profile_record.skills, 1) > 0 THEN
        completion_score := completion_score + 15;
    END IF;
    IF profile_record.resume IS NOT NULL AND profile_record.resume != '' THEN
        completion_score := completion_score + 20;
    END IF;
    IF profile_record.linkedin IS NOT NULL AND profile_record.linkedin != '' THEN
        completion_score := completion_score + 5;
    END IF;
    IF array_length(profile_record.preferred_locations, 1) > 0 THEN
        completion_score := completion_score + 10;
    END IF;
    
    RETURN LEAST(completion_score, 100);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update profile completion
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.profile_completion := calculate_profile_completion(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_student_profile_completion ON student_profiles;
CREATE TRIGGER update_student_profile_completion
    BEFORE UPDATE ON student_profiles
    FOR EACH ROW EXECUTE FUNCTION update_profile_completion();

COMMIT;
