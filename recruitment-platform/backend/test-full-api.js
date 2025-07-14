const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testSavedJobsAPI() {
  try {
    console.log('🧪 Testing Saved Jobs API...');
    
    // 1. Test health check
    console.log('\n1. Testing health check...');
    try {
      const healthResponse = await axios.get(`${API_BASE}/health`);
      console.log('✅ Health check passed:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
    }
    
    // 2. Test get jobs
    console.log('\n2. Testing get jobs...');
    try {
      const jobsResponse = await axios.get(`${API_BASE}/jobs`);
      console.log('✅ Jobs API working, found', jobsResponse.data.data?.length || 0, 'jobs');
      
      if (jobsResponse.data.data && jobsResponse.data.data.length > 0) {
        const testJobId = jobsResponse.data.data[0].id;
        console.log('🎯 Using test job ID:', testJobId);
        
        // 3. Test save job
        console.log('\n3. Testing save job...');
        try {
          const saveResponse = await axios.post(`${API_BASE}/saved-jobs`, {
            jobId: testJobId
          });
          console.log('✅ Save job successful:', saveResponse.data);
          
          // 4. Test get saved jobs
          console.log('\n4. Testing get saved jobs...');
          const getSavedResponse = await axios.get(`${API_BASE}/saved-jobs`);
          console.log('✅ Get saved jobs successful:', getSavedResponse.data);
          
          // 5. Test check if job is saved
          console.log('\n5. Testing check saved status...');
          const checkResponse = await axios.get(`${API_BASE}/saved-jobs/check/${testJobId}`);
          console.log('✅ Check saved status:', checkResponse.data);
          
          // 6. Test remove saved job
          console.log('\n6. Testing remove saved job...');
          const removeResponse = await axios.delete(`${API_BASE}/saved-jobs/${testJobId}`);
          console.log('✅ Remove saved job successful:', removeResponse.data);
          
          // 7. Verify removal
          console.log('\n7. Verifying removal...');
          const finalCheckResponse = await axios.get(`${API_BASE}/saved-jobs/check/${testJobId}`);
          console.log('✅ Final check:', finalCheckResponse.data);
          
        } catch (saveError) {
          console.log('❌ Save job failed:', saveError.response?.data || saveError.message);
        }
        
      } else {
        console.log('❌ No jobs available for testing');
      }
      
    } catch (jobsError) {
      console.log('❌ Jobs API failed:', jobsError.response?.data || jobsError.message);
    }
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Add delay to ensure server is running
setTimeout(() => {
  testSavedJobsAPI();
}, 2000);

console.log('⏳ Waiting for server to start...');
