import { generateProfessionalCV } from './utils/pdfGeneratorProfessional';

// Test with Vietnamese data to see if it gets translated to English
const vietnameseProfile = {
  firstName: "Văn Nam",
  lastName: "Trần",
  email: "nam.tv@email.com",
  phone: "0987654321",
  address: "Hà Nội, Việt Nam",
  summary: "Tôi là một Backend Developer với 2 năm kinh nghiệm trong việc phát triển ứng dụng web.",
  experience: [
    {
      company: "VNG Corporation",
      position: "Backend Developer Intern",
      location: "Hồ Chí Minh",
      startDate: "2023-01",
      endDate: "2023-06",
      current: false,
      description: "Phát triển RESTful APIs với Spring Boot, làm việc với MySQL và MongoDB"
    },
    {
      company: "FPT Software", 
      position: "Junior Developer",
      location: "Hà Nội",
      startDate: "2023-07",
      endDate: "2024-07",
      current: false,
      description: "Xây dựng hệ thống microservices, tích hợp payment gateway"
    }
  ],
  education: [
    {
      institution: "Đại học Bách khoa Hà Nội",
      degree: "Cử nhân Công nghệ Thông tin",
      major: "Công nghệ Thông tin",
      startDate: "2019",
      endDate: "2023",
      current: false,
      gpa: "3.5/4.0"
    }
  ],
  skills: ["Java", "Spring Boot", "MySQL", "MongoDB", "Thiết kế hệ thống", "Lập trình API"],
  languages: [
    {
      name: "Tiếng Việt",
      level: "Bản ngữ"
    },
    {
      name: "Tiếng Anh", 
      level: "Trung cấp"
    }
  ]
};

async function testProfessionalPDF() {
  try {
    console.log('🧪 Testing Professional PDF Generation with Vietnamese content...\n');
    console.log('Original Vietnamese Profile:');
    console.log(`Name: ${vietnameseProfile.firstName} ${vietnameseProfile.lastName}`);
    console.log(`Address: ${vietnameseProfile.address}`);
    console.log(`Education: ${vietnameseProfile.education![0].degree} at ${vietnameseProfile.education![0].institution}`);
    console.log(`Experience: ${vietnameseProfile.experience![0].description}`);
    console.log(`Skills: ${vietnameseProfile.skills!.slice(0, 3).join(', ')}...\n`);

    // Generate PDF with translation
    await generateProfessionalCV(vietnameseProfile);
    
    console.log('✅ Professional PDF generated successfully!');
    console.log('🎯 Expected translations:');
    console.log('- Trần Văn Nam → Tran Van Nam');
    console.log('- Hà Nội, Việt Nam → Hanoi, Vietnam');
    console.log('- Đại học Bách khoa Hà Nội → Hanoi University of Science and Technology');
    console.log('- Cử nhân Công nghệ Thông tin → Bachelor of Science in Information Technology');
    console.log('- Vietnamese experience text → English descriptions');
    console.log('- Vietnamese skills → English skills');
    
  } catch (error) {
    console.error('❌ Error generating Professional PDF:', error);
  }
}

testProfessionalPDF();
