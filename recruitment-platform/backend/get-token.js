const jwt = require('jsonwebtoken');

const userId = 'c41235c1-4916-4a2f-b9e8-17a9ee0e29cc';
const email = 'nguyen.thi.thu@student.vnu.edu.vn';
const role = 'STUDENT';

const token = jwt.sign(
  { userId, email, role },
  'recruitment-platform-jwt-secret-key-2024',
  { expiresIn: '24h' }
);

console.log('🔑 JWT Token for Thu Nguyễn Thị (UI/UX Designer):');
console.log(token);
console.log('\n📋 Profile Summary:');
console.log('Name: Thu Nguyễn Thị');
console.log('University: Đại học Quốc gia Hà Nội');
console.log('Major: Thiết kế Đồ họa');
console.log('Skills: Adobe Photoshop, Illustrator, Figma, Sketch, UI/UX Design');
console.log('Experience: UI/UX Designer Intern tại Zalo');
console.log('\n🧪 Test với token này:');
console.log('localStorage.setItem("token", "' + token + '");');
