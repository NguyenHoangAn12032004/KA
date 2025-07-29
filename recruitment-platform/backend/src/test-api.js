// Script để test API
const axios = require('axios');

// Thay thế bằng ID của sinh viên thực tế
const studentId = '1';

async function testStudentDashboardAPI() {
  try {
    console.log('Testing student dashboard API...');
    
    // Test API không cần xác thực
    const response = await axios.get(`http://localhost:3001/api/student-dashboard/test/${studentId}`);
    
    console.log('API Response:', JSON.stringify(response.data, null, 2));
    
    // Kiểm tra dữ liệu
    if (response.data && response.data.success) {
      console.log('Test successful!');
      console.log('Profile data:', response.data.data.profile);
      
      // Kiểm tra các trường dữ liệu cụ thể
      const { profile } = response.data.data;
      console.log('Skills:', profile.skills);
      console.log('Projects:', profile.projects);
      console.log('Total skills:', profile.total_skills);
      console.log('Total projects:', profile.total_projects);
      console.log('Profile completion:', profile.profile_completion);
      console.log('Social links:', {
        github: profile.github,
        linkedin: profile.linkedin,
        portfolio: profile.portfolio
      });
    } else {
      console.error('Test failed:', response.data.message || 'Unknown error');
    }
  } catch (error) {
    console.error('Error testing API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testStudentDashboardAPI(); 