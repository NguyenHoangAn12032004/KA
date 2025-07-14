import { translateProfile, translateToEnglish } from './src/utils/translator';

// Test with the actual Vietnamese data
const testProfile = {
  firstName: 'Hoa',
  lastName: 'Mai Thị',
  university: 'Đại học Bách khoa Hà Nội',
  major: 'Công nghệ Thông tin',
  experience: 'Backend Developer Intern tại VNG Corporation (6 tháng)\n- Phát triển RESTful APIs với Spring Boot\n- Tối ưu hóa database queries và performance\n- Triển khai microservices trên AWS cloud\n- Làm việc với team theo phương pháp Agile',
  preferredLocations: ['Hà Nội', 'TP.HCM']
};

console.log('🇻🇳 Original Vietnamese Profile:');
console.log('================================');
console.log(JSON.stringify(testProfile, null, 2));

console.log('\n🇺🇸 Translated English Profile:');
console.log('================================');
const translated = translateProfile(testProfile);
console.log(JSON.stringify(translated, null, 2));

console.log('\n🔄 Specific Translations:');
console.log('========================');
console.log(`University: "${testProfile.university}" → "${translated.university}"`);
console.log(`Major: "${testProfile.major}" → "${translated.major}"`);
console.log(`\nExperience:`);
console.log(`Original: "${testProfile.experience}"`);
console.log(`Translated: "${translated.experience}"`);
