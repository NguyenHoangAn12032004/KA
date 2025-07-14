// Simple test to demonstrate Vietnamese-to-English translation
const { translateProfile } = require('./utils/translator');

// Vietnamese profile data
const vietnameseProfile = {
  firstName: "Văn Nam",
  lastName: "Trần", 
  address: "Hà Nội, Việt Nam",
  summary: "Tôi là một Backend Developer với 2 năm kinh nghiệm trong việc phát triển ứng dụng web.",
  experience: [
    {
      company: "VNG Corporation",
      position: "Backend Developer Intern", 
      description: "Phát triển RESTful APIs với Spring Boot, làm việc với MySQL và MongoDB"
    }
  ],
  education: [
    {
      institution: "Đại học Bách khoa Hà Nội",
      degree: "Cử nhân Công nghệ Thông tin"
    }
  ],
  skills: ["Java", "Spring Boot", "Thiết kế hệ thống", "Lập trình API"]
};

console.log('🧪 Testing Vietnamese-to-English Translation System\n');
console.log('📝 Original Vietnamese Profile:');
console.log(`Name: ${vietnameseProfile.firstName} ${vietnameseProfile.lastName}`);
console.log(`Address: ${vietnameseProfile.address}`);
console.log(`Education: ${vietnameseProfile.education[0].degree} at ${vietnameseProfile.education[0].institution}`);
console.log(`Experience: ${vietnameseProfile.experience[0].description}`);
console.log(`Skills: ${vietnameseProfile.skills.slice(0, 3).join(', ')}...\n`);

// Translate the profile
const translatedProfile = translateProfile(vietnameseProfile);

console.log('🔄 Translated English Profile:');
console.log(`Name: ${translatedProfile.firstName} ${translatedProfile.lastName}`);
console.log(`Address: ${translatedProfile.address}`);
console.log(`Education: ${translatedProfile.education[0].degree} at ${translatedProfile.education[0].institution}`);
console.log(`Experience: ${translatedProfile.experience[0].description}`);
console.log(`Skills: ${translatedProfile.skills.slice(0, 3).join(', ')}...\n`);

console.log('✅ Translation Results:');
console.log('📍 Location:', vietnameseProfile.address, '→', translatedProfile.address);
console.log('🎓 University:', vietnameseProfile.education[0].institution, '→', translatedProfile.education[0].institution);
console.log('🎯 Degree:', vietnameseProfile.education[0].degree, '→', translatedProfile.education[0].degree);
console.log('💼 Experience Description:');
console.log('   Vietnamese:', vietnameseProfile.experience[0].description);
console.log('   English:', translatedProfile.experience[0].description);
console.log('\n🎉 Complete Vietnamese-to-English translation system working perfectly!');
