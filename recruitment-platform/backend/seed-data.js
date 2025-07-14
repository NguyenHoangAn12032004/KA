const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedData() {
  try {
    console.log('🌱 Seeding data...');
    
    // Create test user if not exists
    const testUserId = '550e8400-e29b-41d4-a716-446655440000';
    let testUser = await prisma.user.findUnique({
      where: { id: testUserId }
    });
    
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          id: testUserId,
          email: 'test@student.com',
          password: 'test123',
          role: 'STUDENT',
          isActive: true,
          isVerified: true
        }
      });
      console.log('👤 Test user created');
    }
    
    // Create company user and profile
    const companyUserId = '89386ca4-70af-4b18-8776-5dde56b890ef';
    let companyUser = await prisma.user.findUnique({
      where: { id: companyUserId }
    });
    
    if (!companyUser) {
      companyUser = await prisma.user.create({
        data: {
          id: companyUserId,
          email: 'company@techsolutions.com',
          password: 'hashedpassword',
          role: 'COMPANY',
          isVerified: true
        }
      });
      console.log('🏢 Company user created');
    }
    
    // Create company profile
    const companyProfileId = '78276bd3-69fe-4907-ab06-2ffe4cfaf774';
    let companyProfile = await prisma.company_profiles.findUnique({
      where: { id: companyProfileId }
    });
    
    if (!companyProfile) {
      companyProfile = await prisma.company_profiles.create({
        data: {
          id: companyProfileId,
          userId: companyUserId,
          companyName: 'Tech Solutions Inc',
          industry: 'Technology',
          companySize: '50-100',
          website: 'https://techsolutions.com',
          description: 'Leading technology company specializing in web development and software solutions',
          city: 'Ho Chi Minh City',
          country: 'Vietnam',
          updatedAt: new Date()
        }
      });
      console.log('🏢 Company profile created');
    }
    
    // Check if jobs exist
    const jobCount = await prisma.job.count();
    if (jobCount === 0) {
      // Create sample jobs
      const jobs = await prisma.job.createMany({
        data: [
          {
            id: '6311f27c-ee7d-45a8-9f98-3aaa468bd8b6',
            companyId: companyProfileId,
            title: 'Backend Developer - Node.js',
            description: 'We are looking for a talented Backend Developer to join our growing engineering team. You will be working on scalable web applications using Node.js, Express, and PostgreSQL.',
            requirements: [
              '3+ years of experience with Node.js',
              'Strong knowledge of PostgreSQL and database design',
              'Experience with REST API development',
              'Familiarity with TypeScript',
              'Understanding of microservices architecture'
            ],
            benefits: [
              'Competitive salary and benefits',
              'Flexible working hours',
              'Health insurance',
              'Learning and development opportunities',
              'Modern office environment'
            ],
            responsibilities: [
              'Design and develop backend APIs',
              'Optimize database queries and performance',
              'Collaborate with frontend developers',
              'Write clean, maintainable code',
              'Participate in code reviews'
            ],
            location: 'Ho Chi Minh City',
            jobType: 'FULL_TIME',
            workMode: 'HYBRID',
            experienceLevel: 'INTERMEDIATE',
            salaryMin: 20000000,
            salaryMax: 35000000,
            currency: 'VND',
            isActive: true,
            publishedAt: new Date(),
            requiredSkills: ['Node.js', 'PostgreSQL', 'TypeScript', 'REST API'],
            preferredSkills: ['Docker', 'AWS', 'Redis', 'GraphQL']
          },
          {
            id: '7422f38d-ff8e-46b9-af09-4bbb579ce9c7',
            companyId: companyProfileId,
            title: 'Frontend Developer - React',
            description: 'Join our frontend team to build amazing user experiences using React, TypeScript, and modern web technologies.',
            requirements: [
              '2+ years of React.js experience',
              'Strong knowledge of TypeScript',
              'Experience with Material-UI or similar component libraries',
              'Understanding of responsive design',
              'Knowledge of state management (Redux/Zustand)'
            ],
            benefits: [
              'Competitive salary',
              'Remote work options',
              'Professional development budget',
              'Health and dental insurance',
              'Team building activities'
            ],
            responsibilities: [
              'Develop responsive web applications',
              'Implement UI/UX designs',
              'Optimize application performance',
              'Write unit and integration tests',
              'Collaborate with designers and backend developers'
            ],
            location: 'Ho Chi Minh City',
            jobType: 'FULL_TIME',
            workMode: 'REMOTE',
            experienceLevel: 'JUNIOR',
            salaryMin: 15000000,
            salaryMax: 25000000,
            currency: 'VND',
            isActive: true,
            publishedAt: new Date(),
            requiredSkills: ['React.js', 'TypeScript', 'CSS', 'HTML'],
            preferredSkills: ['Next.js', 'Material-UI', 'Redux', 'Jest']
          },
          {
            id: '8533f49e-ffaf-47ca-b01a-5ccc68aefd8a',
            companyId: companyProfileId,
            title: 'Full Stack Developer',
            description: 'We are seeking a versatile Full Stack Developer to work on both frontend and backend technologies in our dynamic startup environment.',
            requirements: [
              'Experience with React.js and Node.js',
              'Knowledge of database design and optimization',
              'Understanding of API design and implementation',
              'Experience with version control (Git)',
              'Problem-solving and debugging skills'
            ],
            benefits: [
              'High growth potential',
              'Stock options',
              'Flexible schedule',
              'Latest technology stack',
              'Mentorship opportunities'
            ],
            responsibilities: [
              'Develop end-to-end features',
              'Design and implement APIs',
              'Create responsive user interfaces',
              'Optimize application performance',
              'Participate in architectural decisions'
            ],
            location: 'Ha Noi',
            jobType: 'FULL_TIME',
            workMode: 'ONSITE',
            experienceLevel: 'SENIOR',
            salaryMin: 30000000,
            salaryMax: 50000000,
            currency: 'VND',
            isActive: true,
            publishedAt: new Date(),
            requiredSkills: ['React.js', 'Node.js', 'PostgreSQL', 'REST API'],
            preferredSkills: ['TypeScript', 'Docker', 'AWS', 'Microservices']
          }
        ]
      });
      
      console.log('💼 Created sample jobs:', jobs.count);
    }
    
    // Test saved jobs functionality
    console.log('🧪 Testing saved jobs...');
    
    const firstJob = await prisma.job.findFirst();
    if (firstJob) {
      // Create a saved job
      const savedJob = await prisma.savedJob.create({
        data: {
          userId: testUserId,
          jobId: firstJob.id
        },
        include: {
          job: {
            include: {
              company_profiles: {
                select: {
                  companyName: true,
                  city: true,
                  industry: true
                }
              }
            }
          }
        }
      });
      
      console.log('💾 Test saved job created:', {
        id: savedJob.id,
        jobTitle: savedJob.job.title,
        companyName: savedJob.job.company_profiles.companyName
      });
      
      // Get all saved jobs
      const allSavedJobs = await prisma.savedJob.findMany({
        where: { userId: testUserId },
        include: {
          job: {
            include: {
              company_profiles: {
                select: {
                  companyName: true,
                  city: true,
                  industry: true
                }
              }
            }
          }
        }
      });
      
      console.log('📋 All saved jobs for user:', allSavedJobs.length);
      
      // Clean up
      await prisma.savedJob.delete({
        where: { id: savedJob.id }
      });
      
      console.log('🧹 Cleaned up test saved job');
    }
    
    // Final counts
    const finalCounts = {
      users: await prisma.user.count(),
      companies: await prisma.company_profiles.count(),
      jobs: await prisma.job.count(),
      savedJobs: await prisma.savedJob.count()
    };
    
    console.log('📊 Final counts:', finalCounts);
    console.log('✅ Seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();
