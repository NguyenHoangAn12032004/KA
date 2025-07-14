import { convertVietnameseToEnglish, convertVietnameseNameToEnglish, convertVietnameseNames } from './src/utils/vietnameseConverter';

console.log('🌟 Vietnamese to English Name Converter Test\n');

// Test cases
const testCases = [
  'thu nguyễn thị',
  'phạm văn đức',
  'trần thị minh châu',
  'lê hoàng anh',
  'nguyễn văn an',
  'võ minh hiếu',
  'đặng thị hương',
  'bùi quang huy'
];

console.log('📝 Test Results:');
console.log('================');

testCases.forEach((name, index) => {
  const result = convertVietnameseNameToEnglish(name);
  console.log(`${index + 1}. "${name}" → "${result}"`);
});

console.log('\n🔤 Separate Name Conversion:');
console.log('============================');

const separateTests = [
  { firstName: 'Thu', lastName: 'Nguyễn Thị' },
  { firstName: 'Văn', lastName: 'Phạm Đức' },
  { firstName: 'Minh', lastName: 'Trần Thị Châu' }
];

separateTests.forEach((test, index) => {
  const result = convertVietnameseNames(test.firstName, test.lastName);
  console.log(`${index + 1}. "${test.firstName}" + "${test.lastName}" →`);
  console.log(`   First: "${result.firstName}"`);
  console.log(`   Last: "${result.lastName}"`);
  console.log(`   Full: "${result.fullName}"`);
  console.log('');
});

console.log('✅ All tests completed!');
