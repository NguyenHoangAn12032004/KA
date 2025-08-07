// Verification script to check created jobs for company
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const companyId = 'comp-1754211437688';
  
  console.log(`📊 Checking jobs for company ${companyId}...`);
  
  const company = await prisma.company_profiles.findUnique({
    where: { id: companyId },
    include: {
      jobs: {
        select: {
          id: true,
          title: true,
          experienceLevel: true,
          workMode: true,
          salaryMin: true,
          salaryMax: true,
          currency: true,
          location: true,
          createdAt: true,
          isActive: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!company) {
    console.log('❌ Company not found');
    return;
  }

  console.log(`\n🏢 Company: ${company.companyName}`);
  console.log(`📍 Location: ${company.city}, ${company.country}`);
  console.log(`⭐ Rating: ${company.rating}/5.0`);
  console.log(`👀 Views: ${company.view_count}`);
  console.log(`👥 Followers: ${company.follower_count}`);
  
  console.log(`\n📋 Jobs Posted (${company.jobs.length}):`);
  console.log('=' .repeat(80));
  
  company.jobs.forEach((job, index) => {
    console.log(`${index + 1}. ${job.title}`);
    console.log(`   💼 ${job.experienceLevel} | 🏢 ${job.workMode} | 📍 ${job.location}`);
    console.log(`   💰 $${job.salaryMin}-${job.salaryMax} ${job.currency}`);
    console.log(`   📅 Posted: ${job.createdAt.toLocaleDateString()}`);
    console.log(`   ✅ Active: ${job.isActive ? 'Yes' : 'No'}`);
    console.log('');
  });
}

main()
  .catch((e) => {
    console.error('Error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
