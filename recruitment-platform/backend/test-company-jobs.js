const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

async function testCompanyJobs() {
  try {
    console.log('🔍 Kiểm tra API getCompanyJobs...');
    
    // Lấy thông tin người dùng hiện tại
    const currentUser = await prisma.user.findFirst({
      where: { email: 'company@example.com' },
      include: { company_profiles: true }
    });
    
    if (!currentUser || !currentUser.company_profiles) {
      console.log('❌ Không tìm thấy thông tin công ty của người dùng hiện tại');
      return;
    }
    
    console.log('👤 Thông tin người dùng:');
    console.log(`- ID: ${currentUser.id}`);
    console.log(`- Email: ${currentUser.email}`);
    console.log(`- Role: ${currentUser.role}`);
    console.log(`- Company ID: ${currentUser.company_profiles.id}`);
    console.log(`- Company Name: ${currentUser.company_profiles.companyName}`);
    
    // Tạo JWT token
    const token = jwt.sign(
      { id: currentUser.id, email: currentUser.email, role: currentUser.role },
      'your-secret-key',
      { expiresIn: '1h' }
    );
    
    console.log('\n🔑 JWT Token để test API:');
    console.log(token);
    console.log('\n📋 Sử dụng lệnh sau để đặt token vào localStorage:');
    console.log(`localStorage.setItem('token', '${token}');`);
    
    // Mô phỏng API getCompanyJobs
    console.log('\n🔄 Mô phỏng API getCompanyJobs...');
    
    const companyId = currentUser.company_profiles.id;
    
    // Lấy tất cả công việc của công ty này
    const jobs = await prisma.job.findMany({
      where: { companyId },
      include: {
        company_profiles: {
          select: {
            companyName: true,
            logo: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📊 Tìm thấy ${jobs.length} công việc cho công ty ID: ${companyId}`);
    
    if (jobs.length > 0) {
      console.log('\n📋 Danh sách công việc:');
      jobs.forEach((job, index) => {
        console.log(`\n[${index + 1}] ${job.title}`);
        console.log(`- ID: ${job.id}`);
        console.log(`- Địa điểm: ${job.location}`);
        console.log(`- Loại: ${job.jobType}`);
        console.log(`- Số lượng ứng viên: ${job._count.applications}`);
        console.log(`- Ngày tạo: ${job.createdAt}`);
      });
    } else {
      console.log('❌ Không tìm thấy công việc nào cho công ty này');
    }
    
    // Kiểm tra tất cả các công việc trong database
    const allJobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`\n📊 Tổng số công việc trong database: ${allJobs.length}`);
    
    // Kiểm tra các companyId khác nhau
    const companyIds = [...new Set(allJobs.map(job => job.companyId))];
    console.log(`📊 Số lượng companyId khác nhau: ${companyIds.length}`);
    console.log('📋 Danh sách companyId:');
    companyIds.forEach(id => {
      const count = allJobs.filter(job => job.companyId === id).length;
      console.log(`- ${id}: ${count} công việc`);
    });
    
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCompanyJobs(); 