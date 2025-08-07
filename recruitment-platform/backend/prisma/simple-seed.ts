// Simple seed to create company with full data
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Simple seeding...');

  // Clean existing data
  await prisma.jobs.deleteMany({});
  await prisma.applications.deleteMany({});
  await prisma.job_views.deleteMany({});
  await prisma.company_profiles.deleteMany({});
  await prisma.student_profiles.deleteMany({});
  await prisma.users.deleteMany({});

  const demoPassword = await bcrypt.hash('demo123', 10);

  // Create company user and profile separately
  const companyUser = await prisma.users.create({
    data: {
      id: `user-${Date.now()}`,
      email: 'company@demo.com',
      password: demoPassword,
      role: 'COMPANY',
      isActive: true,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });

  const companyProfile = await prisma.company_profiles.create({
    data: {
      id: `company-${Date.now()}`,
      userId: companyUser.id,
      companyName: 'HUTECH Technology Solutions',
      industry: 'Information Technology',
      companySize: '100-500',
      description: 'Leading software development company specializing in innovative technology solutions for businesses worldwide. We focus on web development, mobile applications, and enterprise solutions.',
      country: 'Vietnam',
      city: 'Ho Chi Minh City',
      phone: '+84 28 1234 5678',
      website: 'https://hutech-solutions.com',
      logo: 'https://via.placeholder.com/120x120/4285f4/ffffff?text=HUTECH',
      linkedin: 'https://linkedin.com/company/hutech-solutions',
      facebook: 'https://facebook.com/hutechsolutions',
      twitter: 'https://twitter.com/hutechsolutions',
      founded: '2015',
      isVerified: true,
      rating: 4.8,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  // Create student user and profile
  const studentUser = await prisma.users.create({
    data: {
      id: `student-user-${Date.now()}`,
      email: 'student@demo.com',
      password: demoPassword,
      role: 'STUDENT',
      isActive: true,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });

  const studentProfile = await prisma.student_profiles.create({
    data: {
      id: `student-${Date.now()}`,
      userId: studentUser.id,
      firstName: 'Demo',
      lastName: 'Student',
      phone: '0123456789',
      dateOfBirth: new Date('2000-01-01'),
      university: 'Demo University',
      major: 'Computer Science',
      graduationYear: 2024,
      skills: ['JavaScript', 'React', 'Node.js'],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });

  // Create jobs
  const job1 = await prisma.jobs.create({
    data: {
      id: `job-${Date.now()}-1`,
      title: 'Senior Full Stack Developer',
      description: 'We are looking for an experienced Full Stack Developer to join our dynamic team.',
      requirements: ['Bachelor degree in Computer Science', '3+ years experience with React and Node.js', 'Strong problem-solving skills'],
      benefits: ['Competitive salary', 'Health insurance', 'Flexible working hours'],
      responsibilities: ['Develop web applications', 'Collaborate with team members', 'Code reviews'],
      jobType: 'FULL_TIME',
      workMode: 'HYBRID',
      experienceLevel: 'SENIOR',
      location: 'Ho Chi Minh City',
      salaryMin: 2000,
      salaryMax: 3000,
      currency: 'USD',
      requiredSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
      preferredSkills: ['Docker', 'AWS', 'GraphQL'],
      companyId: companyProfile.id,
      isActive: true,
      updatedAt: new Date(),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    }
  });

  const job2 = await prisma.jobs.create({
    data: {
      id: `job-${Date.now()}-2`,
      title: 'Frontend Developer (React)',
      description: 'Join our frontend team to build amazing user interfaces.',
      requirements: ['2+ years experience with React', 'Knowledge of TypeScript', 'Experience with modern CSS'],
      benefits: ['Health insurance', 'Performance bonus', 'Team building activities'],
      responsibilities: ['Build user interfaces', 'Optimize performance', 'Write clean code'],
      jobType: 'FULL_TIME',
      workMode: 'ONSITE',
      experienceLevel: 'INTERMEDIATE',
      location: 'Ho Chi Minh City',
      salaryMin: 1500,
      salaryMax: 2500,
      currency: 'USD',
      requiredSkills: ['React', 'TypeScript', 'CSS', 'JavaScript'],
      preferredSkills: ['Material-UI', 'Redux', 'Jest'],
      companyId: companyProfile.id,
      isActive: true,
      updatedAt: new Date(),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    }
  });

  // Create applications
  await prisma.applications.create({
    data: {
      id: `app-${Date.now()}-1`,
      jobId: job1.id,
      studentId: studentUser.id,
      status: 'PENDING',
      appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });

  await prisma.applications.create({
    data: {
      id: `app-${Date.now()}-2`,
      jobId: job2.id,
      studentId: studentUser.id,
      status: 'REVIEWING',
      appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });

  // Create job views
  await prisma.job_views.create({
    data: {
      id: `view-${Date.now()}-1`,
      jobId: job1.id,
      viewedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    }
  });

  for (let i = 0; i < 5; i++) {
    await prisma.job_views.create({
      data: {
        id: `view-${Date.now()}-${i + 2}`,
        jobId: job1.id,
        viewedAt: new Date(Date.now() - (i + 1) * 60 * 60 * 1000),
      }
    });
  }

  for (let i = 0; i < 3; i++) {
    await prisma.job_views.create({
      data: {
        id: `view-${Date.now()}-job2-${i + 1}`,
        jobId: job2.id,
        viewedAt: new Date(Date.now() - (i + 1) * 60 * 60 * 1000),
      }
    });
  }

  console.log('✅ Created complete company profile with real data');
  console.log('✅ Created 2 jobs with applications and views');
  console.log('🎉 Simple seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
