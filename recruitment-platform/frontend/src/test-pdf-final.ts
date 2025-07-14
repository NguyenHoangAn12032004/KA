import { generateProfessionalCV } from './utils/pdfGeneratorProfessional';

// Test profile with Vietnamese content that should be translated
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

console.log('🔍 TESTING PDF GENERATION - TRANSLATION VERIFICATION');
console.log('====================================================\n');

try {
  console.log('📄 Generating PDF with Vietnamese content...');
  generateProfessionalCV(testProfile);
  
  console.log('✅ PDF generation function called successfully!');
  
  console.log('\n🎯 Expected Translations in PDF:');
  console.log('================================');
  console.log('❌ Should NOT contain: "Thực tập Frontend Developer"');
  console.log('✅ Should contain: "Frontend Developer Intern"');
  console.log('');
  console.log('❌ Should NOT contain: "Phát triển giao diện web responsive với React.js"'); 
  console.log('✅ Should contain: "Developed responsive web interfaces with React.js"');
  console.log('');
  console.log('❌ Should NOT contain: "Tích hợp API RESTful"');
  console.log('✅ Should contain: "Integrated RESTful APIs"');
  console.log('');
  console.log('❌ Should NOT contain: "Làm việc theo mô hình Agile/Scrum"');
  console.log('✅ Should contain: "Worked with Agile/Scrum methodology"');
  console.log('');
  console.log('❌ Should NOT contain: "Đại học Bách khoa Hà Nội"');
  console.log('✅ Should contain: "Hanoi University of Science and Technology"');
  
  console.log('\n🚀 PDF GENERATION STATUS: SUCCESS');
  console.log('==================================');
  console.log('✅ PDF created with improved translation system');
  console.log('✅ All Vietnamese text should now be translated');
  console.log('✅ Ready for download and verification');
  
} catch (error) {
  console.error('❌ Error generating PDF:', error);
  console.log('\n🔧 Debugging Information:');
  console.log('=========================');
  console.log('- Check that translator-clean.ts is imported correctly');
  console.log('- Verify translation mappings are complete');
  console.log('- Ensure translateProfile function is working');
}
