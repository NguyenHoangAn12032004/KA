const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function testApiResponse() {
  try {
    console.log('🔍 Kiểm tra API response cho getCompanyJobs...');
    
    // Lấy thông tin người dùng công ty
    const user = await prisma.user.findFirst({
      where: { email: 'company@example.com' },
      include: { company_profiles: true }
    });
    
    if (!user || !user.company_profiles) {
      console.log('❌ Không tìm thấy thông tin công ty');
      return;
    }
    
    console.log('👤 Thông tin người dùng:');
    console.log(`- ID: ${user.id}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Role: ${user.role}`);
    console.log(`- Company ID: ${user.company_profiles.id}`);
    console.log(`- Company Name: ${user.company_profiles.companyName}`);
    
    // Tạo JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      'your-secret-key',
      { expiresIn: '1h' }
    );
    
    console.log('\n🔑 JWT Token:');
    console.log(token);
    
    // Gọi API thực tế
    console.log('\n🔄 Gọi API getCompanyJobs...');
    
    try {
      const response = await axios.get('http://localhost:5000/api/jobs/company', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('✅ API Response Status:', response.status);
      console.log('📋 API Response Data:');
      console.log(JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.data && response.data.data.jobs) {
        console.log(`📊 Số lượng công việc trả về: ${response.data.data.jobs.length}`);
        
        response.data.data.jobs.forEach((job, index) => {
          console.log(`\n[${index + 1}] ${job.title}`);
          console.log(`- ID: ${job.id}`);
          console.log(`- Trạng thái: ${job.isActive ? 'Đang hoạt động' : 'Tạm dừng'}`);
          console.log(`- Ứng viên: ${job.applicationsCount || 0}`);
          console.log(`- Lượt xem: ${job.viewsCount || 0}`);
        });
      } else {
        console.log('❌ Không có dữ liệu công việc hoặc định dạng không đúng');
      }
    } catch (apiError) {
      console.error('❌ Lỗi khi gọi API:', apiError.message);
      if (apiError.response) {
        console.error('- Status:', apiError.response.status);
        console.error('- Data:', apiError.response.data);
      }
    }
    
    // Kiểm tra trực tiếp từ database
    console.log('\n🔍 Kiểm tra trực tiếp từ database...');
    
    const jobs = await prisma.job.findMany({
      where: { companyId: user.company_profiles.id },
      include: {
        _count: {
          select: {
            applications: true
          }
        }
      }
    });
    
    console.log(`📊 Số lượng công việc trong database: ${jobs.length}`);
    
    jobs.forEach((job, index) => {
      console.log(`\n[${index + 1}] ${job.title}`);
      console.log(`- ID: ${job.id}`);
      console.log(`- Trạng thái: ${job.isActive ? 'Đang hoạt động' : 'Tạm dừng'}`);
      console.log(`- Ứng viên: ${job._count.applications}`);
      console.log(`- Lượt xem: ${job.viewCount || 0}`);
    });
    
    console.log('\n🔍 Kiểm tra localStorage trong frontend...');
    console.log('Chạy lệnh sau trong console của trình duyệt:');
    console.log('console.log("Token:", localStorage.getItem("token"))');
    console.log('console.log("User:", JSON.parse(localStorage.getItem("user")))');
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testApiResponse(); 