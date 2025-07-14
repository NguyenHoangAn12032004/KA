const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const userCount = await prisma.user.count();
    console.log(`✅ Database connected! Found ${userCount} users`);
    
    // Test if problematic user exists
    const problemUser = await prisma.user.findUnique({
      where: { id: '8da852d4-d7e0-463f-8b19-255431195611' }
    });
    
    console.log(`🔍 Problematic user exists: ${problemUser ? 'YES' : 'NO'}`);
    if (problemUser) {
      console.log('User details:', problemUser);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
