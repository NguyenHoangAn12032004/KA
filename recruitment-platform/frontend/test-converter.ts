import { convertVietnameseNames } from './src/utils/vietnameseConverter';

console.log('🚀 Testing Vietnamese Name Converter...\n');

// Test cases with common Vietnamese names
const testNames = [
  { first: 'Thu', last: 'Nguyễn Thị' },
  { first: 'Văn', last: 'Phạm Đức' },
  { first: 'Thị', last: 'Trần Minh' },
  { first: 'Quang', last: 'Lê Hùng' },
  { first: 'Hương', last: 'Đặng Thị' },
  { first: 'thu', last: 'nguyễn thị' }, // lowercase test
  { first: 'MINH', last: 'TRẦN VĂN' }, // uppercase test
];

testNames.forEach((name, index) => {
  const result = convertVietnameseNames(name.first, name.last);
  console.log(`${index + 1}. Input: "${name.first}" + "${name.last}"`);
  console.log(`   Output: "${result.firstName}" + "${result.lastName}"`);
  console.log(`   Full Name: "${result.fullName}"`);
  console.log('   ---');
});

console.log('\n✅ Converter test completed!');
console.log('\n📝 How to use in your code:');
console.log(`
import { convertVietnameseNames } from './vietnameseConverter';

// Example usage:
const result = convertVietnameseNames('Thu', 'Nguyễn Thị');
console.log(result.fullName); // "Thu Nguyen Thi"

// In PDF generators:
const englishName = convertVietnameseNames(profile.firstName, profile.lastName);
pdf.text(englishName.fullName, x, y);
`);
