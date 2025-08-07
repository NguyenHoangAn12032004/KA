// Test admin login
const testAdminLogin = async () => {
  try {
    console.log('🔐 Testing admin login...');
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@recruitment.com',
        password: 'Admin123!@#'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin login successful!');
      console.log('📧 Email:', data.data?.user?.email);
      console.log('👤 Role:', data.data?.user?.role);
      console.log('🔑 Token:', data.data?.token ? 'Generated' : 'Missing');
      
      // Test admin dashboard access
      if (data.data?.token) {
        console.log('\n🔍 Testing admin dashboard access...');
        const dashboardResponse = await fetch('http://localhost:5000/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${data.data.token}`
          }
        });
        
        if (dashboardResponse.ok) {
          console.log('✅ Admin dashboard accessible!');
        } else {
          console.log('❌ Admin dashboard access denied');
        }
      }
      
      return data;
    } else {
      console.log('❌ Admin login failed:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Login test error:', error.message);
    return null;
  }
};

testAdminLogin();
