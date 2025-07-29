const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = 'your-secret-key'; // Thay thế bằng secret key thực tế của bạn

async function generateCompanyToken() {
  try {
    // Tìm một tài khoản công ty
    const companyUser = await prisma.user.findFirst({
      where: { 
        role: 'COMPANY' 
      },
      include: {
        company_profiles: true
      }
    });

    if (!companyUser) {
      console.log('❌ Không tìm thấy tài khoản công ty nào trong cơ sở dữ liệu');
      return;
    }
    
    // Tạo token cho tài khoản công ty
    const token = jwt.sign(
      { 
        id: companyUser.id,
        email: companyUser.email,
        role: companyUser.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('🔑 JWT Token cho tài khoản công ty:');
    console.log(token);
    
    console.log('\n📋 Thông tin công ty:');
    console.log('ID:', companyUser.id);
    console.log('Email:', companyUser.email);
    console.log('Tên công ty:', companyUser.company_profiles?.companyName || 'N/A');
    console.log('Ngành nghề:', companyUser.company_profiles?.industry || 'N/A');
    console.log('Quy mô:', companyUser.company_profiles?.companySize || 'N/A');
    
    console.log('\n🧪 Sử dụng lệnh sau để đăng nhập:');
    console.log(`localStorage.setItem("token", "${token}");`);
    
  } catch (error) {
    console.error('Lỗi khi tạo token:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateCompanyToken(); 