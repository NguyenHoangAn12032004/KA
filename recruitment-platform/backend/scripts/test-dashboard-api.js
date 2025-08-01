const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

// Token mới từ generate-company-token.js
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFmMjRiYmUwLTI1NjYtNGY5NS04NTk4LWY4MDQ3NTM1ZWMyMiIsImVtYWlsIjoiY29tcGFueUBleGFtcGxlLmNvbSIsInJvbGUiOiJDT01QQU5ZIiwiaWF0IjoxNzU0MDMxNjMxLCJleHAiOjE3NTQxMTgwMzF9.EszPwii5oiYB14i0Hi2-OOoErcr8UEdcZu-v_hXpulY';

async function testCompanyDashboardAPI() {
  try {
    console.log('🧪 Testing Company Dashboard API...\n');
    
    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };
    
    // Test 1: Get Dashboard Stats
    console.log('📊 Testing /api/company-dashboard/stats...');
    const statsResponse = await axios.get(`${API_BASE_URL}/api/company-dashboard/stats`, { headers });
    console.log('✅ Stats Response:', JSON.stringify(statsResponse.data, null, 2));
    console.log('');
    
    // Test 2: Get Recent Applications
    console.log('📋 Testing /api/company-dashboard/recent-applications...');
    const applicationsResponse = await axios.get(`${API_BASE_URL}/api/company-dashboard/recent-applications`, { headers });
    console.log('✅ Recent Applications Response:', JSON.stringify(applicationsResponse.data, null, 2));
    console.log('');
    
    // Test 3: Get Performance Metrics
    console.log('📈 Testing /api/company-dashboard/performance...');
    const performanceResponse = await axios.get(`${API_BASE_URL}/api/company-dashboard/performance`, { headers });
    console.log('✅ Performance Response:', JSON.stringify(performanceResponse.data, null, 2));
    console.log('');
    
    console.log('🎉 All API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ API Test Error:', error.response?.data || error.message);
  }
}

testCompanyDashboardAPI();
