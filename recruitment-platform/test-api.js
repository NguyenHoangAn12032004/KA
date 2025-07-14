// Simple API test script
const http = require('http');

function testAPI(path = '/', method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          console.log(`✅ ${method} ${path} - Status: ${res.statusCode}`);
          console.log(JSON.stringify(parsed, null, 2));
          resolve(parsed);
        } catch (e) {
          console.log(`✅ ${method} ${path} - Status: ${res.statusCode}`);
          console.log(body);
          resolve(body);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${method} ${path} - Error: ${error.message}`);
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Testing Recruitment Platform API...\n');
  
  try {
    // Test 1: Root endpoint
    await testAPI('/');
    
    console.log('\n' + '-'.repeat(50) + '\n');
    
    // Test 2: Health endpoint
    await testAPI('/health');
    
    console.log('\n' + '-'.repeat(50) + '\n');
    
    // Test 3: Login with demo admin
    await testAPI('/api/auth/login', 'POST', {
      email: 'admin@recruitment.com',
      password: 'admin123'
    });
    
    console.log('\n' + '-'.repeat(50) + '\n');
    
    // Test 4: Get jobs
    await testAPI('/api/jobs');
    
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
  }
}

runTests();
