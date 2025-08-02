const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('testpassword123', 12);
    
    const user = await prisma.user.create({
      data: {
        id: 'test-user-analytics',
        email: 'test.analytics@example.com',
        password: hashedPassword,
        role: 'STUDENT',
        isActive: true,
        isVerified: true
      }
    });
    
    console.log('✅ Test user created:', user);
    
    // Create student profile
    const studentProfile = await prisma.student_profiles.create({
      data: {
        userId: user.id,
        firstName: 'Test',
        lastName: 'User',
        phone: '123456789',
        university: 'Test University',
        major: 'Computer Science',
        graduationYear: 2025,
        skills: ['JavaScript', 'Node.js', 'Testing']
      }
    });
    
    console.log('✅ Student profile created:', studentProfile);
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️ Test user already exists');
    } else {
      console.error('❌ Error creating test user:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
