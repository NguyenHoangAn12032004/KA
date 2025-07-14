import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function createVietnameseUser() {
  try {
    console.log('🇻🇳 Creating Vietnamese user with diacritics...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Create user with Vietnamese profile
    const user = await prisma.user.create({
      data: {
        email: 'mai.thi.hoa@student.hust.edu.vn',
        password: hashedPassword,
        role: 'STUDENT',
        isActive: true,
        isVerified: true,
      }
    });

    // Create student profile with Vietnamese data (with diacritics)
    const profile = await prisma.studentProfile.create({
      data: {
        userId: user.id,
        firstName: 'Hoa',
        lastName: 'Mai Thị',
        phone: '+84987654321',
        dateOfBirth: new Date('2003-05-15'),
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
        university: 'Đại học Bách khoa Hà Nội',
        major: 'Công nghệ Thông tin',
        graduationYear: 2025,
        gpa: 3.8,
        skills: ['Java', 'Spring Boot', 'MySQL', 'ReactJS', 'Node.js', 'Docker', 'AWS'],
        experience: 'Backend Developer Intern tại VNG Corporation (6 tháng)\n- Phát triển RESTful APIs với Spring Boot\n- Tối ưu hóa database queries và performance\n- Triển khai microservices trên AWS cloud\n- Làm việc với team theo phương pháp Agile',
        portfolio: 'https://maithihoa.dev',
        github: 'https://github.com/maithihoa',
        linkedin: 'https://linkedin.com/in/maithihoa',
        resume: 'https://drive.google.com/file/d/5566778899/view',
        preferredJobTypes: ['FULL_TIME', 'INTERNSHIP'],
        preferredWorkModes: ['HYBRID', 'ONSITE'],
        preferredLocations: ['Hà Nội', 'TP.HCM'],
        expectedSalaryMin: 15000000,
        expectedSalaryMax: 25000000,
      }
    });

    console.log('✅ Vietnamese user created:', {
      id: user.id,
      email: user.email,
      name: `${profile.firstName} ${profile.lastName}`
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('\n🎫 JWT Token for Vietnamese user:');
    console.log('====================================');
    console.log(token);
    console.log('====================================');
    
    console.log('\n📋 User Details:');
    console.log(`Email: ${user.email}`);
    console.log(`Password: 123456`);
    console.log(`Name: ${profile.firstName} ${profile.lastName} (Vietnamese with diacritics)`);
    console.log(`University: ${profile.university}`);
    console.log(`Major: ${profile.major}`);
    
    console.log('\n🔄 Expected conversion:');
    console.log(`"${profile.firstName} ${profile.lastName}" → "Hoa Mai Thi"`);
    
    return { user, profile, token };
    
  } catch (error) {
    console.error('❌ Error creating Vietnamese user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createVietnameseUser();
