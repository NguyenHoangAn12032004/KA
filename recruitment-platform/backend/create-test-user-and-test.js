const axios = require('axios');

async function createTestUser() {
  try {
    console.log('🔧 Creating test user...');
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
      email: 'testuser@example.com',
      password: 'test123',
      role: 'COMPANY',
      firstName: 'Test',
      lastName: 'User',
      companyName: 'Test Company'
    });

    console.log('✅ Registration response:', registerResponse.data);
    
    if (registerResponse.data.success) {
      const token = registerResponse.data.data.token;
      console.log('📋 Using token from registration');
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

createTestUser();
