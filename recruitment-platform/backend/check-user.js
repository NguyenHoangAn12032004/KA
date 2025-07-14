const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    
    console.log('🔍 Looking for user:', userId);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true }
    });
    
    if (user) {
      console.log('✅ User found:', {
        id: user.id,
        email: user.email,
        role: user.role,
        hasPassword: !!user.password,
        hasStudentProfile: !!user.studentProfile
      });
      
      if (user.studentProfile) {
        console.log('📝 Student profile:', user.studentProfile);
      } else {
        console.log('❌ No student profile found');
      }
    } else {
      console.log('❌ User not found');
      
      // Check if any users exist
      const allUsers = await prisma.user.findMany({
        select: { id: true, email: true, role: true }
      });
      
      console.log('👥 All users in database:', allUsers);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
