/**
 * Test Translation Functions
 */

import { translateToEnglish, translateExperience } from './translator-clean.js';

console.log('🧪 TESTING TRANSLATION IMPROVEMENTS');
console.log('=====================================\n');

// Test cases from the PDF
const testCases = [
  'Thực tập Frontend Developer tại FPT Software (6 tháng)',
  'Phát triển giao diện web responsive với React.js',
  'Tích hợp API RESTful', 
  'Làm việc theo mô hình Agile/Scrum',
  'Đại học Bách khoa Hà Nội',
  'Bachelor of Science in Computer Science'
];

console.log('1️⃣ Testing translateToEnglish function:');
console.log('=======================================');
testCases.forEach((test, index) => {
  const result = translateToEnglish(test);
  console.log(`${index + 1}. "${test}"`);
  console.log(`   → "${result}"`);
  console.log('');
});

console.log('\n2️⃣ Testing translateExperience function:');
console.log('========================================');
testCases.forEach((test, index) => {
  const result = translateExperience(test);
  console.log(`${index + 1}. "${test}"`);
  console.log(`   → "${result}"`);
  console.log('');
});

console.log('🎯 Expected Results:');
console.log('===================');
console.log('✅ "Thực tập Frontend Developer tại FPT Software (6 tháng)"');
console.log('   → "Frontend Developer Intern at FPT Software (6 months)"');
console.log('');
console.log('✅ "Phát triển giao diện web responsive với React.js"');
console.log('   → "Developed responsive web interfaces with React.js"');
console.log('');
console.log('✅ "Tích hợp API RESTful"');
console.log('   → "Integrated RESTful APIs"');
console.log('');
console.log('✅ "Làm việc theo mô hình Agile/Scrum"');
console.log('   → "Worked with Agile/Scrum methodology"');
console.log('');
console.log('✅ "Đại học Bách khoa Hà Nội"');
console.log('   → "Hanoi University of Science and Technology"');
