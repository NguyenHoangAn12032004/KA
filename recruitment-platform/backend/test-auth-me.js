const axios = require('axios');

async function testAuthMe() {
  try {
    // Get a valid token first
    console.log('🔑 Getting token...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'user2@example.com',
      password: 'password123'
    });

    if (loginResponse.data.success) {
      const token = loginResponse.data.token;
      console.log('✅ Login successful, token received');

      // Test /me endpoint
      console.log('🔍 Testing /me endpoint...');
      const meResponse = await axios.get('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📊 /me response:', JSON.stringify(meResponse.data, null, 2));
    } else {
      console.error('❌ Login failed:', loginResponse.data);
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAuthMe();
