const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const { v4: uuid } = require('uuid');
const prisma = new PrismaClient();

/**
 * Comprehensive test script for job view and application count functionality
 */
async function testJobViewAndApplicationCounts() {
  try {
    console.log('🔍 Starting comprehensive test of job view and application counts...');
    
    // Step 1: Get a job for testing
    console.log('\n1️⃣ Fetching a job for testing...');
    const job = await prisma.job.findFirst({
      where: { isActive: true },
      select: { 
        id: true, 
        title: true, 
        viewCount: true, 
        applicationsCount: true 
      }
    });
    
    if (!job) {
      console.error('❌ No active job found to test with');
      return;
    }
    
    console.log(`✅ Found job: "${job.title}" (${job.id})`);
    console.log(`   - Initial view count: ${job.viewCount}`);
    console.log(`   - Initial application count: ${job.applicationsCount}`);
    
    // Step 2: Test direct database insertion of job view
    console.log('\n2️⃣ Testing direct database insertion of job view...');
    
    const newJobView = await prisma.jobView.create({
      data: {
        id: uuid(),
        jobId: job.id,
        userId: null,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Script - Direct DB Test'
      }
    });
    
    console.log(`✅ Created job view record with ID: ${newJobView.id}`);
    
    // Check if view count was updated via trigger
    const jobAfterDirectViewInsert = await prisma.job.findUnique({
      where: { id: job.id },
      select: { viewCount: true }
    });
    
    console.log(`   - View count after direct insert: ${jobAfterDirectViewInsert.viewCount}`);
    console.log(`   - Expected increase: +1`);
    
    const viewTriggerWorking = jobAfterDirectViewInsert.viewCount > job.viewCount;
    console.log(`   ${viewTriggerWorking ? '✅' : '❌'} View count trigger: ${viewTriggerWorking ? 'Working' : 'Not working'}`);
    
    // Step 3: Test view count API endpoint
    console.log('\n3️⃣ Testing view count API endpoint...');
    
    try {
      const viewResponse = await axios.post(`http://localhost:5000/api/jobs/${job.id}/view`);
      
      console.log(`✅ API response: ${viewResponse.status}`);
      console.log(`   - Response data: ${JSON.stringify(viewResponse.data.data)}`);
      
      // Check if view count was incremented via API
      const jobAfterApiViewUpdate = await prisma.job.findUnique({
        where: { id: job.id },
        select: { viewCount: true }
      });
      
      console.log(`   - View count after API call: ${jobAfterApiViewUpdate.viewCount}`);
      console.log(`   - Expected count: ${jobAfterDirectViewInsert.viewCount + 1}`);
      
      const apiViewUpdateWorking = jobAfterApiViewUpdate.viewCount > jobAfterDirectViewInsert.viewCount;
      console.log(`   ${apiViewUpdateWorking ? '✅' : '❌'} API endpoint: ${apiViewUpdateWorking ? 'Working' : 'Not working'}`);
    } catch (error) {
      console.error(`   ❌ API test failed: ${error.message}`);
      if (error.response) {
        console.error(`   - Status: ${error.response.status}`);
        console.error(`   - Data: ${JSON.stringify(error.response.data)}`);
      }
    }
    
    // Step 4: Test application count trigger
    console.log('\n4️⃣ Testing application count trigger...');
    
    // Create a test user if needed
    let testUser = await prisma.user.findFirst({
      where: { email: 'test-user@example.com' }
    });
    
    if (!testUser) {
      console.log('   Creating test user...');
      testUser = await prisma.user.create({
        data: {
          id: uuid(),
          email: 'test-user@example.com',
          password: 'password',
          role: 'STUDENT',
          name: 'Test User'
        }
      });
      console.log(`   ✅ Created test user with ID: ${testUser.id}`);
    } else {
      console.log(`   ✅ Using existing test user with ID: ${testUser.id}`);
    }
    
    // Check current application count
    const initialApplications = await prisma.application.count({
      where: { jobId: job.id }
    });
    console.log(`   - Initial application count: ${initialApplications}`);
    
    // Create test application
    const testApplication = await prisma.application.create({
      data: {
        id: uuid(),
        jobId: job.id,
        studentId: testUser.id,
        coverLetter: 'Test application from automated test',
        status: 'PENDING',
        screeningAnswers: {}
      }
    });
    
    console.log(`   ✅ Created test application with ID: ${testApplication.id}`);
    
    // Check if application count was updated via trigger
    const jobAfterApplicationInsert = await prisma.job.findUnique({
      where: { id: job.id },
      select: { applicationsCount: true }
    });
    
    console.log(`   - Application count after insert: ${jobAfterApplicationInsert.applicationsCount}`);
    console.log(`   - Expected count: ${initialApplications + 1}`);
    
    const applicationTriggerWorking = jobAfterApplicationInsert.applicationsCount === initialApplications + 1;
    console.log(`   ${applicationTriggerWorking ? '✅' : '❌'} Application count trigger: ${applicationTriggerWorking ? 'Working' : 'Not working'}`);
    
    // Step 5: Test application removal trigger
    console.log('\n5️⃣ Testing application removal trigger...');
    
    // Delete test application
    await prisma.application.delete({
      where: { id: testApplication.id }
    });
    
    console.log(`   ✅ Deleted test application`);
    
    // Check if application count was updated via trigger
    const jobAfterApplicationDelete = await prisma.job.findUnique({
      where: { id: job.id },
      select: { applicationsCount: true }
    });
    
    console.log(`   - Application count after delete: ${jobAfterApplicationDelete.applicationsCount}`);
    console.log(`   - Expected count: ${initialApplications}`);
    
    const applicationDeleteTriggerWorking = jobAfterApplicationDelete.applicationsCount === initialApplications;
    console.log(`   ${applicationDeleteTriggerWorking ? '✅' : '❌'} Application delete trigger: ${applicationDeleteTriggerWorking ? 'Working' : 'Not working'}`);
    
    // Step 6: Verify counts match actual records
    console.log('\n6️⃣ Verifying counts match actual records...');
    
    const actualJobViews = await prisma.jobView.count({
      where: { jobId: job.id }
    });
    
    const actualApplications = await prisma.application.count({
      where: { jobId: job.id }
    });
    
    const finalJob = await prisma.job.findUnique({
      where: { id: job.id },
      select: { viewCount: true, applicationsCount: true }
    });
    
    console.log(`   Views - In job_views table: ${actualJobViews}, In jobs.viewCount: ${finalJob.viewCount}`);
    console.log(`   Applications - In applications table: ${actualApplications}, In jobs.applicationsCount: ${finalJob.applicationsCount}`);
    
    const viewCountsMatch = actualJobViews === finalJob.viewCount;
    const applicationCountsMatch = actualApplications === finalJob.applicationsCount;
    
    console.log(`   ${viewCountsMatch ? '✅' : '❌'} View counts match: ${viewCountsMatch ? 'Yes' : 'No'}`);
    console.log(`   ${applicationCountsMatch ? '✅' : '❌'} Application counts match: ${applicationCountsMatch ? 'Yes' : 'No'}`);
    
    // Step 7: Summary
    console.log('\n7️⃣ Test Summary:');
    console.log(`   - View count trigger: ${viewTriggerWorking ? '✅ Working' : '❌ Not working'}`);
    console.log(`   - View count API: ${apiViewUpdateWorking ? '✅ Working' : '❌ Not working'}`);
    console.log(`   - Application count insert trigger: ${applicationTriggerWorking ? '✅ Working' : '❌ Not working'}`);
    console.log(`   - Application count delete trigger: ${applicationDeleteTriggerWorking ? '✅ Working' : '❌ Not working'}`);
    console.log(`   - View counts match: ${viewCountsMatch ? '✅ Yes' : '❌ No'}`);
    console.log(`   - Application counts match: ${applicationCountsMatch ? '✅ Yes' : '❌ No'}`);
    
    const allTestsPassed = viewTriggerWorking && apiViewUpdateWorking && 
                          applicationTriggerWorking && applicationDeleteTriggerWorking && 
                          viewCountsMatch && applicationCountsMatch;
    
    if (allTestsPassed) {
      console.log('\n🎉 All tests passed! The job view and application count functionality is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Please review the results above and fix any issues.');
    }
    
  } catch (error) {
    console.error('\n❌ Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testJobViewAndApplicationCounts().then(() => {
  console.log('\n📝 Test script completed');
}); 