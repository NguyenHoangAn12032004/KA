const jwt = require('jsonwebtoken');

const userId = 'usr1';
const email = 'student1@example.com';
const role = 'STUDENT';

const jwtSecret = 'recruitment-platform-jwt-secret-key-2024'; // Same as in .env

const token = jwt.sign(
  { userId, email, role },
  jwtSecret,
  { expiresIn: '24h' }
);

console.log('🔑 New token for user:', userId);
console.log('📧 Email:', email);
console.log('👤 Role:', role);
console.log('🔐 Secret:', jwtSecret);
console.log('🎫 Token:', token);
