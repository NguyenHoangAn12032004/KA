import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.jobs.deleteMany({});
  await prisma.applications.deleteMany({});
  await prisma.job_views.deleteMany({});
  await prisma.company_profiles.deleteMany({});
  await prisma.student_profiles.deleteMany({});
  await prisma.users.deleteMany({});

  // Hash password
  const adminPassword = await bcrypt.hash('admin123', 10);
  const demoPassword = await bcrypt.hash('demo123', 10);

  // Create admin account
  const admin = await prisma.users.create({
    data: {
      id: `admin-${Date.now()}`,
      email: 'admin@recruitment.com',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });
  console.log('✅ Created admin account');

  // Create student account
  const student = await prisma.users.create({
    data: {
      id: `student-${Date.now()}`,
      email: 'student@demo.com',
      password: demoPassword,
      role: 'STUDENT',
      isActive: true,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      student_profiles: {
        create: {
          id: `student-profile-${Date.now()}`,
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
      }
    },
    include: {
      student_profiles: true
    }
  });
  console.log('✅ Created student account');

  // Create company account
  const company = await prisma.users.create({
    data: {
      id: `company-user-${Date.now()}`,
      email: 'company@demo.com',
      password: demoPassword,
      role: 'COMPANY',
      isActive: true,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      company_profiles: {
        create: {
          id: `company-${Date.now()}`,
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
      }
    },
    include: {
      company_profiles: true
    }
  });
  console.log('✅ Created company account with full profile data');

  // Create sample jobs for the company
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
      companyId: company.company_profiles!.id,
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
      companyId: company.company_profiles!.id,
      isActive: true,
      updatedAt: new Date(),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    }
  });

  // Create sample applications
  await prisma.applications.create({
    data: {
      id: `app-${Date.now()}-1`,
      jobId: job1.id,
      studentId: student.id,
      status: 'PENDING',
      appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });

  await prisma.applications.create({
    data: {
      id: `app-${Date.now()}-2`,
      jobId: job2.id,
      studentId: student.id,
      status: 'REVIEWING',
      appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });

  // Create sample job views
  await prisma.job_views.create({
    data: {
      id: `view-${Date.now()}-1`,
      jobId: job1.id,
      viewedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    }
  });

  await prisma.job_views.create({
    data: {
      id: `view-${Date.now()}-2`,
      jobId: job1.id,
      viewedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    }
  });

  await prisma.job_views.create({
    data: {
      id: `view-${Date.now()}-3`,
      jobId: job2.id,
      viewedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    }
  });

  console.log('✅ Created sample jobs, applications, and views');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
