import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking all users in database...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('   ---');
    });

    // Check specifically for the problematic user ID
    const problemUserId = '8da852d4-d7e0-463f-8b19-255431195611';
    const problemUser = await prisma.user.findUnique({
      where: { id: problemUserId }
    });

    console.log(`🔍 Checking specific user ID: ${problemUserId}`);
    if (problemUser) {
      console.log('✅ User found:', problemUser);
    } else {
      console.log('❌ User NOT found in database');
    }

    // Check total count
    const totalCount = await prisma.user.count();
    console.log(`📈 Total user count: ${totalCount}`);

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
