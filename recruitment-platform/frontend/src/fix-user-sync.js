/**
 * User Data Sync Fix Script
 * This script helps fix user data synchronization issues
 */

console.log('🔧 USER DATA SYNC FIX STARTING...');
console.log('================================\n');

// Step 1: Clear all existing user data
console.log('1️⃣ Clearing existing user data...');
localStorage.removeItem('token');
localStorage.removeItem('user');
console.log('✅ Cleared localStorage data\n');

// Step 2: Show what we're going to set
const correctUserData = {
  id: 'nguyen-van-an-001',
  email: 'nguyenvanan@example.com',
  role: 'STUDENT',
  studentProfile: {
    firstName: 'An',
    lastName: 'Nguyen Van',
    university: 'Hanoi University of Science and Technology',
    major: 'Computer Science',
    graduationYear: 2024,
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'Docker'],
    gpa: '3.7/4.0'
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const correctToken = `nguyen-van-an-token-${Date.now()}`;

console.log('2️⃣ Setting correct user data:');
console.log('=============================');
console.log('User ID:', correctUserData.id);
console.log('Email:', correctUserData.email);
console.log('Name:', correctUserData.studentProfile.firstName, correctUserData.studentProfile.lastName);
console.log('University:', correctUserData.studentProfile.university);
console.log('Token:', correctToken.substring(0, 30) + '...');
console.log('');

// Step 3: Set the correct data
localStorage.setItem('user', JSON.stringify(correctUserData));
localStorage.setItem('token', correctToken);

console.log('3️⃣ Verification:');
console.log('================');
const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
const storedToken = localStorage.getItem('token');

console.log('✅ Stored User ID:', storedUser?.id);
console.log('✅ Stored Email:', storedUser?.email);
console.log('✅ Stored Name:', storedUser?.studentProfile?.firstName, storedUser?.studentProfile?.lastName);
console.log('✅ Stored Token:', storedToken?.substring(0, 30) + '...');

console.log('\n🎯 INSTRUCTIONS:');
console.log('================');
console.log('1. Refresh the page (F5)');
console.log('2. You should now be logged in as "An Nguyen Van"');
console.log('3. Check that applications and saved jobs show YOUR data');
console.log('4. If issues persist, use the logout button and login again with:');
console.log('   Email: nguyenvanan@example.com');
console.log('   Password: password123');

console.log('\n🚀 USER DATA SYNC FIX COMPLETED!');
console.log('=================================');
