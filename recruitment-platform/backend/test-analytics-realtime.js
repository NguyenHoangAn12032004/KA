const axios = require('axios');
const io = require('socket.io-client');

const API_BASE_URL = 'http://localhost:5000';
const SOCKET_URL = 'http://localhost:5000';

// Test tokens (replace with actual tokens)
const STUDENT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NjNlMjU5MS02MjNjLTQ3MDEtYjVmMy1jYmRhMzllY2IyM2EiLCJlbWFpbCI6InVzZXIyQGV4YW1wbGUuY29tIiwicm9sZSI6IlNUVURFTlQiLCJpYXQiOjE3NTQxMDI1NTksImV4cCI6MTc1NDcwNzM1OX0.pry1JKc18Y8DV-J_adHyyd1k72-uSsN7jtJnwK4qJkc';
const STUDENT_USER_ID = '963e2591-623c-4701-b5f3-cbda39ecb23a';
const COMPANY_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxZjI0YmJlMC0yNTY2LTRmOTUtODU5OC1mODA0NzUzNWVjMjIiLCJlbWFpbCI6ImNvbXBhbnlAZXhhbXBsZS5jb20iLCJyb2xlIjoiQ09NUEFOWSIsImNvbXBhbnlJZCI6ImNvbXAtMTc1Mzg0NDYyMjI2NiIsImlhdCI6MTczMzc4MTgxNywiZXhwIjoxNzM0Mzg2NjE3fQ.QjyNMLKE9BBYTKKnKy9qgY7vd1VQfFr4_lNtmGaGTF0';

async function testAnalyticsRealtime() {
  console.log('🧪 Testing Analytics Real-time Updates...\n');

  // Connect to Socket.IO
  const studentSocket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    auth: { token: STUDENT_TOKEN }
  });

  const analyticsSocket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    auth: { token: STUDENT_TOKEN }
  });

  let analyticsUpdateReceived = false;
  let dashboardStatsUpdateReceived = false;

  // Listen for analytics updates
  analyticsSocket.on('connect', () => {
    console.log('📡 Analytics socket connected:', analyticsSocket.id);
    analyticsSocket.emit('join-user-room', STUDENT_USER_ID);
  });

  analyticsSocket.on('analytics-update', (data) => {
    console.log('📊 ANALYTICS UPDATE RECEIVED:', JSON.stringify(data, null, 2));
    analyticsUpdateReceived = true;
  });

  analyticsSocket.on('dashboard-stats-update', (data) => {
    console.log('📈 DASHBOARD STATS UPDATE RECEIVED:', JSON.stringify(data, null, 2));
    dashboardStatsUpdateReceived = true;
  });

  // Wait for socket connection
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    console.log('🔍 1. Getting available jobs...');
    const jobsResponse = await axios.get(`${API_BASE_URL}/api/jobs`, {
      headers: { 'Authorization': `Bearer ${STUDENT_TOKEN}` }
    });

    if (!jobsResponse.data.success || !jobsResponse.data.data.jobs.length) {
      console.log('❌ No jobs available for testing');
      return;
    }

    const firstJob = jobsResponse.data.data.jobs[0];
    console.log(`✅ Found job: "${firstJob.title}" (ID: ${firstJob.id})`);

    console.log('\n👁️ 2. Viewing the job to trigger analytics update...');
    await axios.post(`${API_BASE_URL}/api/jobs/${firstJob.id}/view`, {}, {
      headers: { 'Authorization': `Bearer ${STUDENT_TOKEN}` }
    });
    console.log('✅ Job view tracked');

    // Wait for analytics update
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n💾 3. Saving the job to trigger analytics update...');
    await axios.post(`${API_BASE_URL}/api/saved-jobs`, {
      jobId: firstJob.id
    }, {
      headers: { 'Authorization': `Bearer ${STUDENT_TOKEN}` }
    });
    console.log('✅ Job saved');

    // Wait for analytics update
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n📋 4. Applying for the job to trigger analytics update...');
    await axios.post(`${API_BASE_URL}/api/applications`, {
      jobId: firstJob.id,
      coverLetter: 'Test cover letter for analytics real-time testing',
      customResume: null
    }, {
      headers: { 'Authorization': `Bearer ${STUDENT_TOKEN}` }
    });
    console.log('✅ Application submitted');

    // Wait for final analytics update
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Results
    console.log('\n📊 TEST RESULTS:');
    console.log(`✅ Analytics Update Received: ${analyticsUpdateReceived ? 'YES' : 'NO'}`);
    console.log(`✅ Dashboard Stats Update Received: ${dashboardStatsUpdateReceived ? 'YES' : 'NO'}`);

    if (analyticsUpdateReceived && dashboardStatsUpdateReceived) {
      console.log('🎉 REAL-TIME ANALYTICS UPDATES ARE WORKING!');
    } else {
      console.log('❌ Some real-time updates are missing. Check backend logs.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  } finally {
    studentSocket.disconnect();
    analyticsSocket.disconnect();
  }
}

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted');
  process.exit(0);
});

testAnalyticsRealtime();
