const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const { v4: uuid } = require('uuid');
const prisma = new PrismaClient();

/**
 * Comprehensive test for job view functionality
 * Tests both the direct database interaction and the API endpoint
 */
async function testJobViewFunctionality() {
  try {
    console.log('🔍 Starting comprehensive job view test...\n');

    // 1. Get a job to test with
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

    console.log(`📋 Testing with job: "${job.title}" (${job.id})`);
    console.log(`   - Initial view count: ${job.viewCount}`);
    
    // Save initial counts for comparison
    const initialViewCount = job.viewCount;
    const initialViewRecords = await prisma.jobView.count({
      where: { jobId: job.id }
    });
    
    console.log(`   - Initial records in job_views: ${initialViewRecords}\n`);

    // 2. Test direct database insertion
    console.log('🔄 Testing direct database insertion...');
    
    const newView = await prisma.jobView.create({
      data: {
        id: uuid(),
        jobId: job.id,
        userId: null,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Script - Direct DB Test'
      }
    });
    
    console.log(`   ✅ Created job view record with ID: ${newView.id}`);
    
    // Check if view count was incremented via trigger
    const jobAfterDirectInsert = await prisma.job.findUnique({
      where: { id: job.id },
      select: { viewCount: true }
    });
    
    console.log(`   - View count after direct insert: ${jobAfterDirectInsert.viewCount}`);
    
    const directInsertWorked = jobAfterDirectInsert.viewCount > initialViewCount;
    console.log(`   ${directInsertWorked ? '✅' : '❌'} Database trigger: ${directInsertWorked ? 'Working' : 'Not working'}\n`);

    // 3. Test API endpoint
    console.log('🔄 Testing API endpoint...');
    
    let apiCallWorked = false; // Default value
    
    try {
      const response = await axios.post(`http://localhost:5000/api/jobs/${job.id}/view`);
      
      console.log(`   ✅ API response: ${response.status}`);
      console.log(`   - Response data:`, response.data);
      
      // Check if the viewCount was incremented again
      const jobAfterApiCall = await prisma.job.findUnique({
        where: { id: job.id },
        select: { viewCount: true }
      });
      
      console.log(`   - View count after API call: ${jobAfterApiCall.viewCount}`);
      
      apiCallWorked = jobAfterApiCall.viewCount > jobAfterDirectInsert.viewCount;
      console.log(`   ${apiCallWorked ? '✅' : '❌'} API endpoint: ${apiCallWorked ? 'Working' : 'Not working'}\n`);
    } catch (error) {
      console.error(`   ❌ API test failed:`, error.message);
      if (error.response) {
        console.error(`   - Status: ${error.response.status}`);
        console.error(`   - Data:`, error.response.data);
      }
      console.log('\n');
    }

    // 4. Verify records in job_views table
    console.log('🔄 Verifying records in job_views table...');
    
    const finalViewRecords = await prisma.jobView.count({
      where: { jobId: job.id }
    });
    
    console.log(`   - Initial records: ${initialViewRecords}`);
    console.log(`   - Final records: ${finalViewRecords}`);
    console.log(`   - New records added: ${finalViewRecords - initialViewRecords}`);
    
    const recordsAdded = finalViewRecords > initialViewRecords;
    console.log(`   ${recordsAdded ? '✅' : '❌'} Record creation: ${recordsAdded ? 'Working' : 'Not working'}\n`);

    // 5. Final job status
    const finalJob = await prisma.job.findUnique({
      where: { id: job.id },
      select: { 
        viewCount: true,
        applicationsCount: true
      }
    });
    
    console.log('📊 Final job status:');
    console.log(`   - Initial view count: ${initialViewCount}`);
    console.log(`   - Final view count: ${finalJob.viewCount}`);
    console.log(`   - Increase: ${finalJob.viewCount - initialViewCount}`);
    
    // 6. Summary
    console.log('\n📝 Test summary:');
    console.log(`   - Direct database insertion: ${directInsertWorked ? 'PASS ✅' : 'FAIL ❌'}`);
    console.log(`   - API endpoint: ${apiCallWorked ? 'PASS ✅' : 'FAIL ❌'}`);
    console.log(`   - Record creation: ${recordsAdded ? 'PASS ✅' : 'FAIL ❌'}`);
    
    const allPassed = directInsertWorked && apiCallWorked && recordsAdded;
    console.log(`\n${allPassed ? '🎉 All tests passed!' : '❌ Some tests failed!'}`);
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testJobViewFunctionality(); 