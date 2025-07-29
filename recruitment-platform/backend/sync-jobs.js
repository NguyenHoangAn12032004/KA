const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncJobs() {
  try {
    console.log('🔄 Bắt đầu đồng bộ dữ liệu công việc...');
    
    // Lấy thông tin người dùng công ty
    const companyUsers = await prisma.user.findMany({
      where: { role: 'COMPANY' },
      include: { company_profiles: true }
    });
    
    if (!companyUsers || companyUsers.length === 0) {
      console.log('❌ Không tìm thấy người dùng công ty nào');
      return;
    }
    
    console.log(`👥 Tìm thấy ${companyUsers.length} người dùng công ty`);
    
    // Lấy tất cả công việc không có companyId hoặc có companyId không hợp lệ
    const allJobs = await prisma.job.findMany();
    const orphanJobs = allJobs.filter(job => {
      // Kiểm tra xem companyId có tồn tại và có hợp lệ không
      return !job.companyId || !companyUsers.some(user => 
        user.company_profiles && user.company_profiles.id === job.companyId
      );
    });
    
    console.log(`🔍 Tìm thấy ${orphanJobs.length} công việc cần được đồng bộ`);
    
    // Phân phối công việc cho các công ty
    if (orphanJobs.length > 0) {
      // Sử dụng công ty đầu tiên làm mặc định
      const defaultCompany = companyUsers[0].company_profiles;
      
      console.log(`📋 Sử dụng công ty mặc định: ${defaultCompany.companyName} (ID: ${defaultCompany.id})`);
      
      // Cập nhật tất cả công việc không có companyId
      for (const job of orphanJobs) {
        console.log(`🔄 Đang cập nhật công việc "${job.title}" (ID: ${job.id})...`);
        
        await prisma.job.update({
          where: { id: job.id },
          data: { 
            companyId: defaultCompany.id,
            isActive: true, // Đảm bảo công việc đang hoạt động
            viewCount: Math.floor(Math.random() * 100) + 20, // Thêm lượt xem ngẫu nhiên
            publishedAt: job.publishedAt || new Date() // Đảm bảo có ngày đăng
          }
        });
      }
      
      console.log('✅ Đã cập nhật tất cả công việc thành công!');
    }
    
    // Tạo ứng viên mẫu cho các công việc
    console.log('🔄 Đang tạo ứng viên mẫu cho các công việc...');
    
    // Lấy danh sách người dùng sinh viên
    const studentUsers = await prisma.user.findMany({
      where: { role: 'STUDENT' }
    });
    
    if (studentUsers.length === 0) {
      console.log('⚠️ Không tìm thấy người dùng sinh viên nào để tạo ứng viên mẫu');
    } else {
      console.log(`👥 Tìm thấy ${studentUsers.length} người dùng sinh viên`);
      
      // Lấy tất cả công việc đã được đồng bộ
      const syncedJobs = await prisma.job.findMany({
        where: { 
          isActive: true
        }
      });
      
      // Lọc các công việc có companyId
      const validJobs = syncedJobs.filter(job => job.companyId !== null);
      
      console.log(`📊 Tìm thấy ${validJobs.length} công việc đã được đồng bộ`);
      
      // Tạo ứng viên mẫu cho mỗi công việc
      for (const job of validJobs) {
        // Kiểm tra xem công việc đã có ứng viên chưa
        const existingApplications = await prisma.application.count({
          where: { jobId: job.id }
        });
        
        if (existingApplications > 0) {
          console.log(`ℹ️ Công việc "${job.title}" đã có ${existingApplications} ứng viên, bỏ qua.`);
          continue;
        }
        
        // Tạo 1-3 ứng viên ngẫu nhiên cho mỗi công việc
        const applicationCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < applicationCount; i++) {
          if (i >= studentUsers.length) break;
          
          const student = studentUsers[i];
          
          try {
            await prisma.application.create({
              data: {
                jobId: job.id,
                studentId: student.id,
                status: ['PENDING', 'REVIEWING', 'SHORTLISTED'][Math.floor(Math.random() * 3)],
                coverLetter: `Tôi rất quan tâm đến vị trí ${job.title} và mong muốn được làm việc tại công ty của bạn.`,
                appliedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // 1-7 ngày trước
              }
            });
          } catch (error) {
            if (error.code === 'P2002') {
              console.log(`⚠️ Sinh viên ${student.email} đã ứng tuyển vào công việc này trước đó`);
            } else {
              console.error(`❌ Lỗi khi tạo ứng viên:`, error);
            }
          }
        }
        
        console.log(`✅ Đã tạo ứng viên mẫu cho công việc "${job.title}"`);
      }
    }
    
    // Kiểm tra kết quả sau khi đồng bộ
    const companiesWithJobs = await prisma.company_profiles.findMany({
      include: {
        _count: {
          select: {
            jobs: true
          }
        }
      }
    });
    
    console.log('\n📊 Kết quả sau khi đồng bộ:');
    for (const company of companiesWithJobs) {
      console.log(`- ${company.companyName}: ${company._count.jobs} công việc`);
    }
    
    console.log('\n🎉 Đồng bộ dữ liệu hoàn tất!');
    
  } catch (error) {
    console.error('❌ Lỗi khi đồng bộ dữ liệu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncJobs(); 