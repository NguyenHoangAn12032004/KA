const { PrismaClient } = require('@prisma/client');

async function checkCounts() {
  const prisma = new PrismaClient();
  
  try {
    const jobs = await prisma.jobs.findMany({
      where: { companyId: 'comp-1753844622266' },
      orderBy: { viewCount: 'desc' },
      take: 5,
      select: { 
        id: true, 
        title: true, 
        viewCount: true, 
        applicationsCount: true 
      }
    });
    
    console.log('Jobs with view counts:');
    jobs.forEach(job => {
      console.log(`${job.id}: ${job.title} - Views: ${job.viewCount}, Apps: ${job.applicationsCount}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCounts();
