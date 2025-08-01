const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxZjI0YmJlMC0yNTY2LTRmOTUtODU5OC1mODA0NzUzNWVjMjIiLCJpYXQiOjE3NTQwMzE1ODQsImV4cCI6MTc1NDYzNjM4NH0.xEV3id0KMq5ymgwdLEfCCNttVkd0ut2eI6gJR97fThE';

async function testDashboardWithRealData() {
  try {
    console.log('🎯 Testing Company Dashboard with Real Data...\n');
    
    const headers = {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    };
    
    console.log('📊 1. Testing Dashboard Stats API...');
    const statsResponse = await axios.get(`${API_BASE_URL}/api/company-dashboard/stats`, { headers });
    console.log('✅ Stats Data:');
    console.log(JSON.stringify(statsResponse.data, null, 2));
    console.log('');
    
    console.log('📋 2. Testing Recent Applications API...');
    const applicationsResponse = await axios.get(`${API_BASE_URL}/api/company-dashboard/recent-applications`, { headers });
    console.log('✅ Recent Applications:');
    console.log(JSON.stringify(applicationsResponse.data, null, 2));
    console.log('');
    
    console.log('📈 3. Testing Performance Metrics API...');
    const performanceResponse = await axios.get(`${API_BASE_URL}/api/company-dashboard/performance`, { headers });
    console.log('✅ Performance Metrics:');
    console.log(JSON.stringify(performanceResponse.data, null, 2));
    console.log('');
    
    console.log('🎉 All Dashboard APIs are working successfully!');
    console.log('');
    console.log('💡 To view the dashboard in browser:');
    console.log('1. Open: http://localhost:3000/company-dashboard');
    console.log('2. Login with: company@example.com / password');
    console.log('3. Or set token in localStorage:');
    console.log(`localStorage.setItem("token", "${TOKEN}");`);
    
  } catch (error) {
    console.error('❌ Dashboard API Test Error:', error.response?.data || error.message);
  }
}

testDashboardWithRealData();
