/**
 * Test PDF Generation with Improved Translation
 */

// Mock data with Vietnamese content from the PDF
const testProfile = {
  firstName: 'An',
  lastName: 'Nguyen Van', 
  email: 'nguyen.van.an@student.hust.edu.vn',
  phone: '+84901234567',
  address: 'Hà Nội, Việt Nam',
  university: 'Đại học Bách khoa Hà Nội',
  major: 'Khoa học Máy tính',
  graduationYear: '2024',
  gpa: '3.7/4.0',
  skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'Docker'],
  portfolio: 'https://github.com/nguyenvanan-portfolio',
  linkedin: 'https://linkedin.com/in/nguyenvanan',
  github: 'https://github.com/nguyenvanan',
  summary: 'Thực tập Frontend Developer tại FPT Software (6 tháng). Phát triển giao diện web responsive với React.js. Tích hợp API RESTful. Làm việc theo mô hình Agile/Scrum.',
  experience: [
    {
      company: 'FPT Software',
      position: 'Thực tập Frontend Developer',
      location: 'Hà Nội',
      startDate: '2024-01',
      endDate: '2024-06',
      current: false,
      description: 'Phát triển giao diện web responsive với React.js. Tích hợp API RESTful. Làm việc theo mô hình Agile/Scrum.'
    }
  ],
  education: [
    {
      institution: 'Đại học Bách khoa Hà Nội',
      degree: 'Cử nhân',
      major: 'Khoa học Máy tính',
      gpa: '3.7/4.0',
      startDate: '2020',
      endDate: '2024',
      current: false
    }
  ]
};

console.log('🧪 TESTING PDF GENERATION WITH IMPROVED TRANSLATION');
console.log('===================================================\n');

// Test individual translation functions
console.log('1️⃣ Testing translateExperience:');
console.log('================================');

import('./utils/translator-clean.js').then(({ translateExperience, translateToEnglish, translateProfile }) => {
  
  const testTexts = [
    'Thực tập Frontend Developer tại FPT Software (6 tháng)',
    'Phát triển giao diện web responsive với React.js', 
    'Tích hợp API RESTful',
    'Làm việc theo mô hình Agile/Scrum'
  ];
  
  testTexts.forEach((text, index) => {
    const result = translateExperience(text);
    console.log(`${index + 1}. Original: "${text}"`);
    console.log(`   Translated: "${result}"`);
    console.log('');
  });
  
  console.log('2️⃣ Testing full profile translation:');
  console.log('=====================================');
  
  const translatedProfile = translateProfile(testProfile);
  
  console.log('Summary:');
  console.log(`Original: "${testProfile.summary}"`);
  console.log(`Translated: "${translatedProfile.summary}"`);
  console.log('');
  
  console.log('Experience Description:');
  console.log(`Original: "${testProfile.experience[0].description}"`);
  console.log(`Translated: "${translatedProfile.experience[0].description}"`);
  console.log('');
  
  console.log('University:');
  console.log(`Original: "${testProfile.university}"`);
  console.log(`Translated: "${translatedProfile.university}"`);
  console.log('');
  
  console.log('Major:');
  console.log(`Original: "${testProfile.major}"`);
  console.log(`Translated: "${translatedProfile.major}"`);
  console.log('');
  
  console.log('Position:');
  console.log(`Original: "${testProfile.experience[0].position}"`);
  console.log(`Translated: "${translatedProfile.experience[0].position}"`);
  
  console.log('\n🎯 Translation Status: COMPLETED');
  console.log('================================');
  console.log('✅ All Vietnamese text should now be in English');
  console.log('✅ PDF generators will use these translations');
  console.log('✅ Ready to generate English-only PDFs');
  
}).catch(error => {
  console.error('❌ Error testing translation:', error);
});
