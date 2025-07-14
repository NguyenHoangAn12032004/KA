const jwt = require('jsonwebtoken');

const userId = '550e8400-e29b-41d4-a716-446655440000';
const email = 'test@student.com';
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
