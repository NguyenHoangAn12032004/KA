// Test Real-time Analytics Updates
// This script tests if analytics events are properly emitted when students perform actions

const axios = require('axios');
const io = require('socket.io-client');

const API_BASE_URL = 'http://localhost:5000';
const SOCKET_URL = 'http://localhost:5000';

async function testAnalyticsRealtime() {
  console.log('🧪 Testing Analytics Real-time Updates...\n');

  try {
    // First login to get valid token
    console.log('🔐 1. Logging in as student...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'test.analytics@example.com',
      password: 'testpassword123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.data.token;
    const userId = loginResponse.data.data.user.id;
    console.log(`✅ Login successful! User ID: ${userId}`);

    // Setup Socket.IO
    console.log('\n📡 2. Setting up Socket.IO listeners...');
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      auth: { token }
    });

    let analyticsUpdateReceived = false;
    let dashboardStatsUpdateReceived = false;
    const receivedEvents = [];

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      socket.emit('join-user-room', userId);
    });

    socket.on('analytics-update', (data) => {
      console.log('📊 ANALYTICS UPDATE RECEIVED:', JSON.stringify(data, null, 2));
      analyticsUpdateReceived = true;
      receivedEvents.push({ type: 'analytics-update', data, timestamp: new Date() });
    });

    socket.on('dashboard-stats-update', (data) => {
      console.log('📈 DASHBOARD STATS UPDATE RECEIVED:', JSON.stringify(data, null, 2));  
      dashboardStatsUpdateReceived = true;
      receivedEvents.push({ type: 'dashboard-stats-update', data, timestamp: new Date() });
    });

    // Wait for socket connection
    await new Promise(resolve => setTimeout(resolve, 2000));

    const headers = { 'Authorization': `Bearer ${token}` };

    // Get available jobs
    console.log('\n💼 3. Getting available jobs...');
    const jobsResponse = await axios.get(`${API_BASE_URL}/api/jobs`, { headers });
    
    if (!jobsResponse.data.success || !jobsResponse.data.data.jobs.length) {
      console.log('❌ No jobs available for testing');
      return;
    }

    const firstJob = jobsResponse.data.data.jobs[0];
    console.log(`✅ Found job: "${firstJob.title}" (ID: ${firstJob.id})`);

    // Test 1: Job View
    console.log('\n👁️ 4. Testing job view analytics...');
    await axios.post(`${API_BASE_URL}/api/jobs/${firstJob.id}/view`, {}, { headers });
    console.log('✅ Job view tracked');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: Save Job
    console.log('\n💾 5. Testing save job analytics...');
    try {
      await axios.post(`${API_BASE_URL}/api/saved-jobs`, { jobId: firstJob.id }, { headers });
      console.log('✅ Job saved');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error === 'Job already saved') {
        console.log('ℹ️ Job already saved (that\'s fine for testing)');
      } else {
        throw error;
      }
    }
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 3: Apply for Job
    console.log('\n📋 6. Testing job application analytics...');
    try {
      await axios.post(`${API_BASE_URL}/api/applications`, {
        jobId: firstJob.id,
        coverLetter: 'Test cover letter for analytics real-time testing',
        customResume: null
      }, { headers });
      console.log('✅ Application submitted');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('ℹ️ Already applied (that\'s fine for testing)');
      } else {
        throw error;
      }
    }
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Final wait for all events
    console.log('\n⏳ 7. Waiting for all analytics events...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Results Summary
    console.log('\n📊 TEST RESULTS SUMMARY:');
    console.log('=====================================');
    console.log(`✅ Analytics Updates Received: ${analyticsUpdateReceived ? 'YES' : 'NO'}`);
    console.log(`✅ Dashboard Stats Updates Received: ${dashboardStatsUpdateReceived ? 'YES' : 'NO'}`);
    console.log(`📝 Total Events Received: ${receivedEvents.length}`);
    
    if (receivedEvents.length > 0) {
      console.log('\n📋 Event Details:');
      receivedEvents.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.type}:`, event.data.type || 'unknown');
      });
    }

    if (analyticsUpdateReceived && dashboardStatsUpdateReceived) {
      console.log('\n🎉 SUCCESS: Real-time analytics updates are working!');
    } else if (receivedEvents.length > 0) {
      console.log('\n⚠️ PARTIAL SUCCESS: Some analytics events received');
    } else {
      console.log('\n❌ FAILURE: No analytics events received. Check backend implementation.');
    }

    socket.disconnect();

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
  }
}

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted');
  process.exit(0);
});

testAnalyticsRealtime();
