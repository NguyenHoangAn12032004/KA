const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAPI() {
  try {
    console.log('🧪 Testing Saved Jobs API logic...');
    
    // Test user ID that we're using
    const testUserId = '550e8400-e29b-41d4-a716-446655440000';
    
    // Check if test user exists
    let testUser = await prisma.user.findUnique({
      where: { id: testUserId }
    });
    
    if (!testUser) {
      console.log('👤 Creating test user...');
      testUser = await prisma.user.create({
        data: {
          id: testUserId,
          email: 'test@student.com',
          password: 'test123',
          role: 'STUDENT',
          isActive: true,
          isVerified: true
        }
      });
      console.log('✅ Test user created');
    } else {
      console.log('✅ Test user exists');
    }
    
    // Check if we have any jobs
    const jobsCount = await prisma.job.count();
    console.log('📊 Jobs in database:', jobsCount);
    
    if (jobsCount === 0) {
      console.log('❌ No jobs found. Need to create sample jobs first.');
      return;
    }
    
    // Get first job for testing
    const firstJob = await prisma.job.findFirst();
    console.log('🎯 Testing with job:', firstJob.title);
    
    // Test saving a job
    console.log('💾 Testing save job...');
    const savedJob = await prisma.savedJob.create({
      data: {
        userId: testUserId,
        jobId: firstJob.id
      },
      include: {
        job: {
          include: {
            company_profiles: {
              select: {
                companyName: true,
                logo: true,
                city: true,
                industry: true
              }
            }
          }
        }
      }
    });
    
    console.log('✅ Job saved successfully:', savedJob.id);
    
    // Test getting saved jobs
    console.log('🔍 Testing get saved jobs...');
    const savedJobs = await prisma.savedJob.findMany({
      where: {
        userId: testUserId
      },
      include: {
        job: {
          include: {
            company_profiles: {
              select: {
                companyName: true,
                logo: true,
                city: true,
                industry: true
              }
            }
          }
        }
      },
      orderBy: {
        savedAt: 'desc'
      }
    });
    
    console.log('📋 Found saved jobs:', savedJobs.length);
    console.log('📋 Saved jobs data:', savedJobs);
    
    // Test removing saved job
    console.log('🗑️ Testing remove saved job...');
    await prisma.savedJob.delete({
      where: {
        userId_jobId: {
          userId: testUserId,
          jobId: firstJob.id
        }
      }
    });
    
    console.log('✅ Saved job removed successfully');
    
    // Verify removal
    const finalCount = await prisma.savedJob.count();
    console.log('📊 Final saved jobs count:', finalCount);
    
    console.log('✅ All API tests passed!');
    
  } catch (error) {
    console.error('❌ Error in API test:', error);
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();
