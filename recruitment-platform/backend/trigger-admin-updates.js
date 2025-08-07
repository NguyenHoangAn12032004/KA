const axios = require('axios');

const triggerRealTimeUpdates = async () => {
  console.log('🔄 Triggering real-time updates for admin dashboard...');
  
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmZmE2MmM2NC1iN2JkLTRhYjktODAyOC02Y2EyMTEyYTNkMWIiLCJpYXQiOjE3NTQzMTcxMDIsImV4cCI6MTc1NDkyMTkwMn0.i3u1NMCr8pg56XCXwwJ313dE27f3axfQz8ku_IsOc7U';
    
    // Simulate some activity to trigger real-time updates
    console.log('📊 Getting latest dashboard data...');
    const dashboardResponse = await axios.get('http://localhost:5000/api/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Dashboard data fetched successfully:');
    console.log('📈 Active Users:', dashboardResponse.data.data.realtimeMetrics.activeUsers);
    console.log('📝 Applications Today:', dashboardResponse.data.data.realtimeMetrics.todayApplications);
    console.log('👥 Total Users:', dashboardResponse.data.data.analytics.userStats.totalUsers);
    console.log('🔧 System Load:', (dashboardResponse.data.data.realtimeMetrics.systemLoad * 100).toFixed(1) + '%');
    
    // Test user management endpoint
    console.log('\n🔄 Testing user management endpoint...');
    const usersResponse = await axios.get('http://localhost:5000/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Users data fetched:', usersResponse.data.data.length, 'users');
    
    console.log('\n🎉 All admin endpoints working successfully!');
    console.log('💡 You can now refresh the admin dashboard page to see the data.');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

triggerRealTimeUpdates();
