import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateThu() {
  try {
    console.log('Updating Thu Nguyen Thi profile...');
    
    const updatedProfile = await prisma.studentProfile.updateMany({
      where: {
        firstName: 'Thu',
        lastName: { contains: 'Nguyễn' }
      },
      data: {
        firstName: 'Thu',
        lastName: 'Nguyen Thi',
        university: 'Vietnam National University, Hanoi',
        major: 'Graphic Design',
        experience: 'UI/UX Designer Intern at Zalo (5 months)\n- Designed mobile app interfaces for 2M+ users\n- Created wireframes and interactive prototypes\n- Conducted user research and usability testing',
        preferredLocations: ['Hanoi', 'Ho Chi Minh City', 'Remote']
      }
    });
    
    console.log('✅ Updated profiles:', updatedProfile.count);
    
    // Verify the update
    const thuProfile = await prisma.studentProfile.findFirst({
      where: {
        firstName: 'Thu',
        lastName: 'Nguyen Thi'
      }
    });
    
    console.log('Updated profile:', thuProfile);
    
  } catch (error) {
    console.error('❌ Error updating profile:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateThu();
