import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function generateTokenForSeededUser() {
  try {
    // Get the first seeded user
    const user = await prisma.user.findFirst({
      where: { email: 'nguyen.van.an@student.hust.edu.vn' },
      include: { studentProfile: true }
    });
    
    if (user) {
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
        { expiresIn: '24h' }
      );
      
      console.log('🔑 JWT Token for seeded user (An Nguyễn Văn):');
      console.log(token);
      console.log('\n👤 User Details:');
      console.log(`Email: ${user.email}`);
      console.log(`ID: ${user.id}`);
      console.log(`Has Profile: ${!!user.studentProfile}`);
      
      if (user.studentProfile) {
        console.log('\n📋 Profile Info:');
        console.log(`Name: ${user.studentProfile.firstName} ${user.studentProfile.lastName}`);
        console.log(`University: ${user.studentProfile.university}`);
        console.log(`Major: ${user.studentProfile.major}`);
        console.log(`Skills: ${user.studentProfile.skills.join(', ')}`);
      }
      
    } else {
      console.log('❌ User not found');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateTokenForSeededUser();
