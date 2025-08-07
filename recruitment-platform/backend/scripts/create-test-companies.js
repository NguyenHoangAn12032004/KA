/**
 * Script to create test companies in the database
 * 
 * This script creates a set of test companies with various verification statuses,
 * industries, and sizes to populate the company management page.
 * 
 * Usage: 
 *   node scripts/create-test-companies.js
 */

// Ensure we have the correct path to the Prisma schema
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

const industries = [
  'Finance', 
  'Technology', 
  'Healthcare', 
  'Education', 
  'Construction', 
  'Manufacturing', 
  'Food & Beverage',
  'Transportation',
  'Retail',
  'Entertainment'
];

const sizes = ['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'];
const statuses = ['PENDING', 'VERIFIED', 'REJECTED'];

const generateRandomCompany = (index) => {
  const industry = industries[Math.floor(Math.random() * industries.length)];
  const size = sizes[Math.floor(Math.random() * sizes.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const jobsCount = Math.floor(Math.random() * 20);
  
  return {
    name: `Test Company ${index}`,
    email: `contact@testcompany${index}.com`,
    industry,
    size,
    verificationStatus: status,
    isVerified: status === 'VERIFIED',
    jobsCount,
    description: `This is a test company #${index} in the ${industry} industry with ${size.toLowerCase()} size.`,
    website: `https://www.testcompany${index}.com`,
    phone: `+1234567${index.toString().padStart(4, '0')}`,
    address: `123 Test Street, City ${index}, Country`,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
    verificationDate: status !== 'PENDING' ? new Date(Date.now() - Math.floor(Math.random() * 1000000000)) : null,
    verificationReason: status === 'REJECTED' ? 'Test rejection reason for testing purposes' : null
  };
};

async function createCompanies() {
  try {
    console.log('Creating test companies...');
    
    // First, we need to create users for these companies
    console.log('Creating user accounts for test companies...');
    
    // Delete existing test companies to avoid duplication
    const deletedCount = await prisma.company_profiles.deleteMany({
      where: {
        companyName: {
          startsWith: 'Test Company'
        }
      }
    });
    
    console.log(`Deleted ${deletedCount.count} existing test company profiles`);
    
    // Create new test companies
    const companiesToCreate = Array(20).fill().map((_, i) => generateRandomCompany(i + 1));
    
    for (let i = 0; i < companiesToCreate.length; i++) {
      const company = companiesToCreate[i];
      
      // First create a user account
      const user = await prisma.users.create({
        data: {
          id: `test-company-${i+1}-${Date.now()}`,
          email: company.email,
          password: '$2b$10$dQmZrQS4CsjDVbR0yVsPxe1QP2H3SI9poAq/opJsZwyhBEtpXofem', // hashed 'password123'
          role: 'COMPANY',
          isActive: true,
          isVerified: company.isVerified,
          createdAt: company.createdAt,
          updatedAt: new Date()
        }
      });
      
      // Now create the company profile
      const companyProfile = await prisma.company_profiles.create({
        data: {
          id: `test-company-profile-${i+1}-${Date.now()}`,
          userId: user.id,
          companyName: company.name,
          companySize: company.size,
          industry: company.industry,
          website: company.website,
          description: company.description,
          phone: company.phone,
          address: company.address,
          isVerified: company.isVerified,
          createdAt: company.createdAt,
          updatedAt: new Date(),
          email: company.email,
          view_count: Math.floor(Math.random() * 1000),
          follower_count: Math.floor(Math.random() * 100)
        }
      });
      
      console.log(`Created company: ${company.name} with ID ${companyProfile.id}`);
      
      // Create some jobs for this company
      const jobCount = Math.floor(Math.random() * 5) + 1;
      console.log(`Creating ${jobCount} jobs for ${company.name}...`);
      
      for (let j = 0; j < jobCount; j++) {
        await prisma.jobs.create({
          data: {
            id: `test-job-${i+1}-${j+1}-${Date.now()}`,
            companyId: companyProfile.id,
            title: `Test Job ${j+1} at ${company.name}`,
            description: `This is a test job posting at ${company.name} in the ${company.industry} industry.`,
            jobType: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'][Math.floor(Math.random() * 4)],
            workMode: ['ONSITE', 'REMOTE', 'HYBRID'][Math.floor(Math.random() * 3)],
            experienceLevel: ['ENTRY', 'JUNIOR', 'INTERMEDIATE', 'SENIOR', 'EXPERT'][Math.floor(Math.random() * 5)],
            location: 'Ho Chi Minh City, Vietnam',
            salaryMin: 1000 + Math.floor(Math.random() * 5000),
            salaryMax: 6000 + Math.floor(Math.random() * 10000),
            isActive: true,
            createdAt: company.createdAt,
            updatedAt: new Date(),
            viewCount: Math.floor(Math.random() * 500),
            requirements: ['Bachelor degree', 'Good communication', '3+ years experience'],
            benefits: ['Competitive salary', 'Health insurance', 'Remote work options'],
            responsibilities: ['Lead project development', 'Collaborate with team', 'Meet deadlines'],
            requiredSkills: ['JavaScript', 'React', 'Node.js'],
            preferredSkills: ['TypeScript', 'GraphQL', 'AWS'],
            tags: ['tech', 'development', 'frontend']
          }
        });
      }
    }
    
    console.log('Successfully created test companies with jobs!');
  } catch (error) {
    console.error('Error creating test companies:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

createCompanies();
