const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixCompanyJobs() {
  try {
    console.log('🔧 Bắt đầu khắc phục vấn đề tin tuyển dụng...');
    
    // 1. Kiểm tra người dùng công ty
    const companyUser = await prisma.user.findFirst({
      where: { 
        email: 'company@example.com',
        role: 'COMPANY'
      },
      include: { company_profiles: true }
    });
    
    if (!companyUser || !companyUser.company_profiles) {
      console.log('❌ Không tìm thấy thông tin công ty');
      return;
    }
    
    console.log('👤 Thông tin công ty:');
    console.log(`- User ID: ${companyUser.id}`);
    console.log(`- Email: ${companyUser.email}`);
    console.log(`- Company ID: ${companyUser.company_profiles.id}`);
    console.log(`- Company Name: ${companyUser.company_profiles.companyName}`);
    
    // 2. Kiểm tra tin tuyển dụng của công ty
    const companyJobs = await prisma.job.findMany({
      where: { companyId: companyUser.company_profiles.id },
      include: {
        _count: {
          select: {
            applications: true
          }
        }
      }
    });
    
    console.log(`📊 Số lượng tin tuyển dụng: ${companyJobs.length}`);
    
    // 3. Nếu không có tin tuyển dụng, tạo một số tin mẫu
    if (companyJobs.length === 0) {
      console.log('⚠️ Không có tin tuyển dụng, đang tạo tin mẫu...');
      
      const sampleJobs = [
        {
          title: 'Frontend Developer (React)',
          description: 'Chúng tôi đang tìm kiếm Frontend Developer có kinh nghiệm với React...',
          requirements: ['Kinh nghiệm với React', 'JavaScript/TypeScript', 'HTML/CSS'],
          benefits: ['Lương cạnh tranh', 'Môi trường làm việc năng động', 'Cơ hội học tập và phát triển'],
          jobType: 'FULL_TIME',
          workMode: 'HYBRID',
          experienceLevel: 'INTERMEDIATE',
          location: 'TP. Hồ Chí Minh',
          salaryMin: 15000000,
          salaryMax: 25000000,
          currency: 'VND',
          isActive: true,
          viewCount: Math.floor(Math.random() * 100) + 20,
          publishedAt: new Date()
        },
        {
          title: 'Backend Developer (Node.js)',
          description: 'Chúng tôi đang tìm kiếm Backend Developer có kinh nghiệm với Node.js...',
          requirements: ['Kinh nghiệm với Node.js', 'Express', 'MongoDB/PostgreSQL'],
          benefits: ['Lương cạnh tranh', 'Môi trường làm việc năng động', 'Cơ hội học tập và phát triển'],
          jobType: 'FULL_TIME',
          workMode: 'HYBRID',
          experienceLevel: 'INTERMEDIATE',
          location: 'TP. Hồ Chí Minh',
          salaryMin: 18000000,
          salaryMax: 30000000,
          currency: 'VND',
          isActive: true,
          viewCount: Math.floor(Math.random() * 100) + 20,
          publishedAt: new Date()
        },
        {
          title: 'UI/UX Designer',
          description: 'Chúng tôi đang tìm kiếm UI/UX Designer có kinh nghiệm thiết kế giao diện người dùng...',
          requirements: ['Kinh nghiệm với Figma/Sketch', 'UI/UX Design', 'Prototyping'],
          benefits: ['Lương cạnh tranh', 'Môi trường làm việc năng động', 'Cơ hội học tập và phát triển'],
          jobType: 'FULL_TIME',
          workMode: 'HYBRID',
          experienceLevel: 'INTERMEDIATE',
          location: 'TP. Hồ Chí Minh',
          salaryMin: 15000000,
          salaryMax: 25000000,
          currency: 'VND',
          isActive: true,
          viewCount: Math.floor(Math.random() * 100) + 20,
          publishedAt: new Date()
        }
      ];
      
      // Tạo tin tuyển dụng
      for (const jobData of sampleJobs) {
        const job = await prisma.job.create({
          data: {
            ...jobData,
            companyId: companyUser.company_profiles.id
          }
        });
        
        console.log(`✅ Đã tạo tin tuyển dụng: ${job.title} (ID: ${job.id})`);
      }
      
      console.log('✅ Đã tạo xong các tin tuyển dụng mẫu');
    } else {
      // 4. Nếu đã có tin tuyển dụng, đảm bảo chúng được gán đúng cho công ty
      console.log('🔍 Kiểm tra và cập nhật tin tuyển dụng hiện có...');
      
      for (const job of companyJobs) {
        console.log(`- ${job.title} (ID: ${job.id})`);
        console.log(`  Trạng thái: ${job.isActive ? 'Đang hoạt động' : 'Tạm dừng'}`);
        console.log(`  Ứng viên: ${job._count.applications}`);
        
        // Đảm bảo tin tuyển dụng đang hoạt động
        if (!job.isActive) {
          await prisma.job.update({
            where: { id: job.id },
            data: { isActive: true }
          });
          console.log(`  ✅ Đã kích hoạt tin tuyển dụng`);
        }
        
        // Đảm bảo có ngày đăng
        if (!job.publishedAt) {
          await prisma.job.update({
            where: { id: job.id },
            data: { publishedAt: new Date() }
          });
          console.log(`  ✅ Đã cập nhật ngày đăng`);
        }
      }
    }
    
    // 5. Kiểm tra lại sau khi cập nhật
    const updatedJobs = await prisma.job.findMany({
      where: { companyId: companyUser.company_profiles.id },
      include: {
        _count: {
          select: {
            applications: true
          }
        }
      }
    });
    
    console.log(`\n📊 Kết quả sau khi cập nhật: ${updatedJobs.length} tin tuyển dụng`);
    
    updatedJobs.forEach((job, index) => {
      console.log(`\n[${index + 1}] ${job.title}`);
      console.log(`- ID: ${job.id}`);
      console.log(`- Trạng thái: ${job.isActive ? 'Đang hoạt động' : 'Tạm dừng'}`);
      console.log(`- Ứng viên: ${job._count.applications}`);
      console.log(`- Lượt xem: ${job.viewCount || 0}`);
    });
    
    console.log('\n✅ Hoàn thành khắc phục vấn đề tin tuyển dụng');
    console.log('👉 Hãy kiểm tra lại trên giao diện sau khi làm mới trang');
    
  } catch (error) {
    console.error('❌ Lỗi khi khắc phục vấn đề tin tuyển dụng:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCompanyJobs(); 