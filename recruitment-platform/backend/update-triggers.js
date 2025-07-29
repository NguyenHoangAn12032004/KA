const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

/**
 * Script to update database triggers for job views and application counts
 */
async function updateDatabaseTriggers() {
  try {
    console.log('🔄 Updating database triggers for job view and application counts...');
    
    // Read the trigger SQL from file
    const triggerFilePath = path.join(__dirname, 'migrations', 'phase4_triggers_functions.sql');
    const triggerSQL = fs.readFileSync(triggerFilePath, 'utf8');
    
    console.log('📄 Read trigger SQL file successfully');
    
    // Split into sections and extract job view and application count triggers
    const jobViewTriggerSQL = `
-- Trigger to sync job view counts correctly from job_views table
CREATE OR REPLACE FUNCTION sync_job_view_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the jobs table with the correct view count
    UPDATE "jobs"
    SET "viewCount" = (
        SELECT COUNT(*)
        FROM "job_views"
        WHERE "jobId" = NEW."jobId"
    )
    WHERE "id" = NEW."jobId";
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_sync_job_view_counts ON "job_views";

-- Create the new trigger
CREATE TRIGGER trigger_sync_job_view_counts
AFTER INSERT OR DELETE ON "job_views"
FOR EACH ROW
EXECUTE FUNCTION sync_job_view_counts();
    `;
    
    const applicationTriggerSQL = `
-- Trigger to sync job application counts
CREATE OR REPLACE FUNCTION sync_job_application_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the jobs table with the correct application count
    UPDATE "jobs"
    SET "applicationsCount" = (
        SELECT COUNT(*)
        FROM "applications"
        WHERE "jobId" = CASE
            WHEN TG_OP = 'DELETE' THEN OLD."jobId"
            ELSE NEW."jobId"
        END
    )
    WHERE "id" = CASE
        WHEN TG_OP = 'DELETE' THEN OLD."jobId"
        ELSE NEW."jobId"
    END;
    
    RETURN NULL; -- For AFTER triggers, return value is ignored
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_sync_job_application_counts ON "applications";

-- Create the new trigger
CREATE TRIGGER trigger_sync_job_application_counts
AFTER INSERT OR DELETE ON "applications"
FOR EACH ROW
EXECUTE FUNCTION sync_job_application_counts();
    `;
    
    console.log('📝 Executing job view trigger SQL...');
    await prisma.$executeRawUnsafe(jobViewTriggerSQL);
    console.log('✅ Job view trigger updated successfully');
    
    console.log('📝 Executing application count trigger SQL...');
    await prisma.$executeRawUnsafe(applicationTriggerSQL);
    console.log('✅ Application count trigger updated successfully');
    
    // Execute sync script to update all job counts
    console.log('📊 Syncing all job counts...');
    await require('./scripts/update-job-counts');
    
    console.log('\n🎉 All database triggers have been updated successfully!');
  } catch (error) {
    console.error('❌ Error updating database triggers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update function
updateDatabaseTriggers().then(() => {
  console.log('📝 Script completed');
}); 