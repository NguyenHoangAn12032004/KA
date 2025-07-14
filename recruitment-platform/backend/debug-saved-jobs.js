const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugSavedJobs() {
  try {
    console.log('🔍 Debugging saved jobs...');
    
    // 1. Check if table exists and structure
    const tables = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'saved_jobs'
      ORDER BY ordinal_position;
    `;
    
    console.log('📊 saved_jobs table structure:', tables);
    
    // 2. Check foreign key constraints
    const constraints = await prisma.$queryRaw`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'saved_jobs';
    `;
    
    console.log('🔗 Constraints:', constraints);
    
    // 3. Test basic operations
    console.log('🧪 Testing basic operations...');
    
    // Get all users
    const users = await prisma.user.findMany({ take: 3 });
    console.log('👥 Available users:', users.length);
    
    // Get all jobs  
    const jobs = await prisma.job.findMany({ take: 3 });
    console.log('💼 Available jobs:', jobs.length);
    
    if (users.length > 0 && jobs.length > 0) {
      const testUserId = users[0].id;
      const testJobId = jobs[0].id;
      
      console.log('🧪 Testing with:', { testUserId, testJobId });
      
      // Try to create a saved job
      const savedJob = await prisma.savedJob.create({
        data: {
          userId: testUserId,
          jobId: testJobId
        }
      });
      
      console.log('✅ Saved job created:', savedJob);
      
      // Try to fetch it back
      const fetchedSavedJob = await prisma.savedJob.findUnique({
        where: {
          userId_jobId: {
            userId: testUserId,
            jobId: testJobId
          }
        },
        include: {
          user: { select: { email: true } },
          job: { select: { title: true } }
        }
      });
      
      console.log('📋 Fetched saved job:', fetchedSavedJob);
      
      // Clean up
      await prisma.savedJob.delete({
        where: { id: savedJob.id }
      });
      
      console.log('🧹 Cleaned up test data');
    }
    
    console.log('✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugSavedJobs();
