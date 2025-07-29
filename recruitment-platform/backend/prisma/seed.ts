import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash password
  const adminPassword = await bcrypt.hash('admin123', 10);
  const demoPassword = await bcrypt.hash('demo123', 10);

  // Create admin account
  const admin = await prisma.user.create({
    data: {
      email: 'admin@recruitment.com',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
      isVerified: true,
    }
  });
  console.log('✅ Created admin account');

  // Create student account
  const student = await prisma.user.create({
    data: {
      email: 'student@demo.com',
      password: demoPassword,
      role: 'STUDENT',
      isActive: true,
      isVerified: true,
      studentProfile: {
        create: {
          firstName: 'Demo',
          lastName: 'Student',
          phone: '0123456789',
          dateOfBirth: new Date('2000-01-01'),
          university: 'Demo University',
          major: 'Computer Science',
          graduationYear: 2024,
          skills: ['JavaScript', 'React', 'Node.js']
        }
      }
    },
    include: {
      studentProfile: true
    }
  });
  console.log('✅ Created student account');

  // Create company account
  const company = await prisma.user.create({
    data: {
      email: 'company@demo.com',
      password: demoPassword,
      role: 'COMPANY',
      isActive: true,
      isVerified: true,
      company_profiles: {
        create: {
          id: `company-${Date.now()}`,
          companyName: 'Demo Company',
          industry: 'Technology',
          companySize: '50-200',
          description: 'A demo company for testing purposes',
          country: 'Vietnam',
          updatedAt: new Date()
        }
      }
    },
    include: {
      company_profiles: true
    }
  });
  console.log('✅ Created company account');

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
