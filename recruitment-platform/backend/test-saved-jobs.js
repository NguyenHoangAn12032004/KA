const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSavedJobs() {
  try {
    console.log('🔍 Testing SavedJob model...');
    
    // Test if SavedJob table exists
    const tableExists = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'saved_jobs';
    `;
    
    console.log('📊 SavedJob table exists:', tableExists.length > 0);
    
    if (tableExists.length === 0) {
      console.log('❌ saved_jobs table does not exist');
      console.log('🔧 Creating table...');
      
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "saved_jobs" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "jobId" TEXT NOT NULL,
          "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "saved_jobs_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "saved_jobs_userId_jobId_key" UNIQUE ("userId", "jobId")
        );
      `;
      
      console.log('✅ saved_jobs table created');
    }
    
    // Test SavedJob operations
    console.log('🧪 Testing SavedJob operations...');
    
    // Check if we can query the table
    const savedJobsCount = await prisma.savedJob.count();
    console.log('📊 Saved jobs count:', savedJobsCount);
    
    // List all saved jobs
    const savedJobs = await prisma.savedJob.findMany();
    console.log('📋 All saved jobs:', savedJobs);
    
    console.log('✅ SavedJob model test completed successfully');
    
  } catch (error) {
    console.error('❌ Error testing SavedJob:', error);
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSavedJobs();
