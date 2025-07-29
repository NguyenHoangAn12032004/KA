const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  try {
    // Tạo user với ID cụ thể từ token
    const userId = '8cac86b7-4b2b-406b-af34-415928fe87ad';
    
    // Kiểm tra xem user đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (existingUser) {
      console.log('User đã tồn tại:', existingUser);
    } else {
      // Tạo user mới
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await prisma.user.create({
        data: {
          id: userId,
          email: 'company@example.com',
          password: hashedPassword,
          role: 'COMPANY',
          isActive: true,
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log('User đã được tạo:', user);
    }

    // Kiểm tra và tạo company profile
    const existingCompany = await prisma.company_profiles.findFirst({
      where: { userId: userId }
    });

    if (existingCompany) {
      console.log('Company profile đã tồn tại:', existingCompany);
    } else {
      // Tạo company profile mới
      const companyId = uuidv4();
      const companyProfile = await prisma.company_profiles.create({
        data: {
          id: companyId,
          userId: userId,
          companyName: 'Test Company',
          companySize: '50-200',
          industry: 'Technology',
          website: 'https://testcompany.com',
          description: 'This is a test company for development',
          logo: 'https://via.placeholder.com/150',
          address: 'Ho Chi Minh City, Vietnam',
          city: 'Ho Chi Minh City',
          country: 'Vietnam',
          email: 'contact@testcompany.com',
          phone: '0123456789',
          contactPerson: 'HR Manager',
          founded: '2020',
          rating: 4.5,
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log('Company profile đã được tạo:', companyProfile);
    }

    console.log('Hoàn thành!');
  } catch (error) {
    console.error('Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 