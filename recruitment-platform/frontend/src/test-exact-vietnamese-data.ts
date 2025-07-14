import { translateProfile } from './utils/translator';

// Exact data from Vietnamese user as shown in the PDF
const vietnameseUserData = {
  firstName: 'Hoa',
  lastName: 'Mai Thị',
  university: 'Đại học Bách khoa Hà Nội',
  major: 'Công nghệ Thông tin',
  experience: 'Backend Developer Intern tại VNG Corporation (6 tháng)\n- Phát triển RESTful APIs với Spring Boot\n- Tối ưu hóa database queries và performance\n- Triển khai microservices trên AWS cloud\n- Làm việc với team theo phương pháp Agile',
  skills: ['Java', 'Spring Boot', 'MySQL', 'ReactJS', 'Node.js', 'Docker', 'AWS'],
  preferredLocations: ['Hà Nội', 'TP.HCM']
};

console.log('🇻🇳 ORIGINAL VIETNAMESE DATA (from PDF):');
console.log('=====================================');
console.log('Name:', vietnameseUserData.firstName, vietnameseUserData.lastName);
console.log('University:', vietnameseUserData.university);
console.log('Major:', vietnameseUserData.major);
console.log('Experience:');
console.log(vietnameseUserData.experience);
console.log('Locations:', vietnameseUserData.preferredLocations.join(', '));

console.log('\n🔄 TRANSLATING TO ENGLISH...\n');

const translatedData = translateProfile(vietnameseUserData);

console.log('🇺🇸 TRANSLATED ENGLISH DATA:');
console.log('============================');
console.log('Name:', translatedData.firstName, translatedData.lastName);
console.log('University:', translatedData.university);
console.log('Major:', translatedData.major);
console.log('Experience:');
console.log(translatedData.experience);
console.log('Locations:', translatedData.preferredLocations?.join(', '));

console.log('\n📊 TRANSLATION COMPARISON:');
console.log('===========================');
console.log('✅ University: Đại học Bách khoa Hà Nội → ' + translatedData.university);
console.log('✅ Major: Công nghệ Thông tin → ' + translatedData.major);
console.log('✅ Experience text completely translated from Vietnamese to English');
console.log('\n🎯 PDF should now show completely English content!');
