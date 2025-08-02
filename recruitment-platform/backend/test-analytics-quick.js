const axios = require('axios');

async function testApplicationAndAnalytics() {
  try {
    // Login as company user first
    console.log('🔑 Logging in as company...');
    const companyLogin = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'testuser@example.com',  
      password: 'test123'
    });

    if (!companyLogin.data.success) {
      throw new Error('Company login failed');
    }

    const companyToken = companyLogin.data.data.token;
    console.log('✅ Company logged in');

    // Check current stats
    console.log('📊 Getting current analytics stats...');
    const currentStats = await axios.get('http://localhost:5000/api/company-dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${companyToken}`
      }
    });
    
    console.log('📈 Current stats:', JSON.stringify(currentStats.data, null, 2));

    // Create a job first if needed
    console.log('📝 Creating a test job...');
    const jobResponse = await axios.post('http://localhost:5000/api/jobs', {
      title: 'Test Analytics Job',
      description: 'Job for testing analytics',
      requirements: ['Basic requirements'],
      location: 'Ho Chi Minh City',
      jobType: 'FULL_TIME',
      workMode: 'ONSITE',
      experienceLevel: 'ENTRY',
      salaryMin: 1000,
      salaryMax: 2000,
      currency: 'USD'
    }, {
      headers: {
        'Authorization': `Bearer ${companyToken}`
      }
    });

    if (!jobResponse.data.success) {
      console.log('⚠️ Job creation failed, might already exist');
    } else {
      console.log('✅ Test job created:', jobResponse.data.data.id);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testApplicationAndAnalytics();
