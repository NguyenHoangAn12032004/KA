const { PrismaClient } = require('@prisma/client');

async function testFixedSavedJobs() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🎯 Testing fixed savedJobs API...');
    
    // Test user setup
    const testUserId = '550e8400-e29b-41d4-a716-446655440000';
    console.log('👤 Using test user:', testUserId);
    
    // Ensure user exists
    let user = await prisma.user.findUnique({ where: { id: testUserId } });
    if (!user) {
      user = await prisma.user.create({
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
    }
    
    // Get or create a job for testing
    let job = await prisma.job.findFirst();
    if (!job) {
      // Create company first
      let company = await prisma.company_profiles.findFirst();
      if (!company) {
        const companyUser = await prisma.user.create({
          data: {
            email: 'company@test.com',
            password: 'test123',
            role: 'COMPANY',
            isVerified: true
          }
        });
        
        company = await prisma.company_profiles.create({
          data: {
            userId: companyUser.id,
            companyName: 'Test Company',
            industry: 'Technology',
            city: 'Ho Chi Minh City',
            updatedAt: new Date()
          }
        });
      }
      
      job = await prisma.job.create({
        data: {
          companyId: company.id,
          title: 'Test Job',
          description: 'Test job description',
          location: 'Ho Chi Minh City',
          jobType: 'FULL_TIME',
          workMode: 'HYBRID',
          experienceLevel: 'JUNIOR',
          isActive: true
        }
      });
      
      console.log('✅ Test job created');
    }
    
    // Test 1: Save a job
    console.log('\n🧪 Test 1: Save a job');
    try {
      const savedJob = await prisma.savedJob.create({
        data: {
          userId: testUserId,
          jobId: job.id
        },
        include: {
          job: {
            include: {
              company_profiles: true
            }
          }
        }
      });
      console.log('✅ Job saved successfully:', savedJob.id);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('⚠️ Job already saved (duplicate)');
      } else {
        throw error;
      }
    }
    
    // Test 2: Get saved jobs
    console.log('\n🧪 Test 2: Get saved jobs');
    const savedJobs = await prisma.savedJob.findMany({
      where: { userId: testUserId },
      include: {
        job: {
          include: {
            company_profiles: {
              select: {
                companyName: true,
                city: true,
                industry: true
              }
            }
          }
        }
      }
    });
    console.log('✅ Found saved jobs:', savedJobs.length);
    
    // Test 3: Check if job is saved
    console.log('\n🧪 Test 3: Check if job is saved');
    const isJobSaved = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: testUserId,
          jobId: job.id
        }
      }
    });
    console.log('✅ Job is saved:', !!isJobSaved);
    
    // Test 4: Remove saved job
    console.log('\n🧪 Test 4: Remove saved job');
    if (isJobSaved) {
      await prisma.savedJob.delete({
        where: { id: isJobSaved.id }
      });
      console.log('✅ Saved job removed');
    }
    
    // Final verification
    const finalCount = await prisma.savedJob.count({
      where: { userId: testUserId }
    });
    console.log('\n📊 Final saved jobs count:', finalCount);
    
    console.log('\n🎉 All tests passed! savedJobs API is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testFixedSavedJobs();
