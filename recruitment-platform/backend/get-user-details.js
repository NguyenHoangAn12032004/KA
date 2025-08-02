const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getUserDetails() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'user2@example.com' },
      select: { id: true, email: true, password: true, role: true }
    });
    console.log('User details:', user);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getUserDetails();
