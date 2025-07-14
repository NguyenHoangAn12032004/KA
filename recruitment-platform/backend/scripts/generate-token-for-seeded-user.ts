import jwt from 'jsonwebtoken';

// Generate token for one of the seeded users
const userId = 'sample-user-id'; // This will be replaced with actual user ID
const email = 'nguyen.van.an@student.hust.edu.vn';
const role = 'STUDENT';

const token = jwt.sign(
  { userId, email, role },
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
  { expiresIn: '24h' }
);

console.log('🔑 Generated JWT Token for seeded user:');
console.log(token);
console.log('\n📋 User Details:');
console.log(`Email: ${email}`);
console.log(`Role: ${role}`);
console.log('\n🔗 Test API with:');
console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:5000/api/users/profile`);
