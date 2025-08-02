const axios = require('axios');

async function testMeEndpoint() {
  try {
    console.log('🔑 Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'testuser@example.com',  
      password: 'test123'
    });

    console.log('📊 Login response:', loginResponse.data);

    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      console.log('✅ Login successful');
      console.log('📋 Token (first 50 chars):', token.substring(0, 50) + '...');

      // Test /me endpoint
      console.log('🔍 Testing /me endpoint...');
      const meResponse = await axios.get('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📊 /me response:', JSON.stringify(meResponse.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testMeEndpoint();
