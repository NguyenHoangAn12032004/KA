const https = require('https');
const http = require('http');

async function testJobsAPI() {
  try {
    console.log('🧪 Testing jobs API after fixes...');
    
    // Wait a bit for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/jobs',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Jobs API Response:');
          console.log('Status:', res.statusCode);
          console.log('Data structure:', {
            success: response.success,
            dataType: Array.isArray(response.data),
            jobCount: response.data?.length || 0
          });
          
          if (response.data && response.data.length > 0) {
            console.log('📋 Sample job structure:');
            const sampleJob = response.data[0];
            console.log({
              id: sampleJob.id,
              title: sampleJob.title,
              company: sampleJob.company,
              location: sampleJob.location,
              type: sampleJob.type,
              workMode: sampleJob.workMode,
              experienceLevel: sampleJob.experienceLevel
            });
          }
        } catch (parseError) {
          console.error('❌ JSON parse error:', parseError.message);
          console.log('Raw response:', data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Jobs API test failed:', error.message);
    });

    req.end();
    
  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
  }
}

testJobsAPI();
