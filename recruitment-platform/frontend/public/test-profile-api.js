// Test script to check API response format
const testAPI = async () => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    // Call the profile API
    const response = await fetch('/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('🔍 Full API Response:', data);
    
    if (data.success && data.data) {
      console.log('📋 Profile Data:', data.data);
      console.log('🏆 Certifications:', data.data.certifications);
      console.log('🎓 Education:', data.data.educations);
      console.log('💼 Work Experience:', data.data.workExperiences);
      console.log('🚀 Projects:', data.data.projects);
      console.log('🌐 Languages:', data.data.languages);
    }
  } catch (error) {
    console.error('❌ API Error:', error);
  }
};

// Run the test
testAPI();
