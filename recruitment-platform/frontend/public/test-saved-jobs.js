// Test script for StudentDashboard functionality
// To run this in browser console after loading the dashboard

const testSavedJobsFlow = async () => {
  console.log('🧪 Testing Saved Jobs Flow...');
  
  try {
    // Test 1: Check API connection
    console.log('\n1️⃣ Testing API connection...');
    const healthResponse = await fetch('http://localhost:5000/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ API Health:', healthData);
    
    // Test 2: Get jobs
    console.log('\n2️⃣ Testing get jobs...');
    const jobsResponse = await fetch('http://localhost:5000/api/jobs');
    const jobsData = await jobsResponse.json();
    console.log('✅ Jobs loaded:', jobsData.data?.length || 0);
    
    if (jobsData.data && jobsData.data.length > 0) {
      const testJobId = jobsData.data[0].id;
      console.log('🎯 Using test job:', testJobId);
      
      // Test 3: Save job
      console.log('\n3️⃣ Testing save job...');
      const saveResponse = await fetch('http://localhost:5000/api/saved-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: testJobId })
      });
      const saveData = await saveResponse.json();
      console.log('✅ Job saved:', saveData);
      
      // Test 4: Get saved jobs
      console.log('\n4️⃣ Testing get saved jobs...');
      const getSavedResponse = await fetch('http://localhost:5000/api/saved-jobs');
      const getSavedData = await getSavedResponse.json();
      console.log('✅ Saved jobs:', getSavedData);
      
      // Test 5: Remove saved job
      console.log('\n5️⃣ Testing remove saved job...');
      const removeResponse = await fetch(`http://localhost:5000/api/saved-jobs/${testJobId}`, {
        method: 'DELETE'
      });
      const removeData = await removeResponse.json();
      console.log('✅ Job removed:', removeData);
    }
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Auto-run if in browser
if (typeof window !== 'undefined') {
  console.log('🔄 Test script loaded. Run testSavedJobsFlow() to test functionality.');
}
