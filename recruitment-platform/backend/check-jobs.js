const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkJobs() {
  try {
    console.log('🔍 Checking jobs in database...');
    
    // Get all jobs
    const jobs = await prisma.job.findMany();
    console.log('📊 Total jobs in database:', jobs.length);
    
    if (jobs.length > 0) {
      console.log('📋 Jobs:');
      jobs.forEach(job => {
        console.log(`- ID: ${job.id}`);
        console.log(`  Title: ${job.title}`);
        console.log(`  Company ID: ${job.companyId}`);
        console.log(`  Active: ${job.isActive}`);
        console.log(`  Created At: ${job.createdAt}`);
        console.log('---');
      });
    } else {
      console.log('❌ No jobs found in database');
    }
    
    // Get all company profiles
    const companies = await prisma.company_profiles.findMany();
    console.log('📊 Total companies in database:', companies.length);
    
    if (companies.length > 0) {
      console.log('📋 Companies:');
      companies.forEach(company => {
        console.log(`- ID: ${company.id}`);
        console.log(`  Name: ${company.companyName}`);
        console.log(`  User ID: ${company.userId}`);
        console.log('---');
      });
    } else {
      console.log('❌ No companies found in database');
    }
    
  } catch (error) {
    console.error('❌ Error checking jobs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkJobs(); 