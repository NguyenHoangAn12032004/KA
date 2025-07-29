const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSampleJobs() {
  try {
    console.log('🚀 Bắt đầu tạo công việc mẫu...');
    
    // Lấy thông tin công ty HUTECH
    const company = await prisma.company_profiles.findFirst({
      where: { companyName: 'HUTECH' }
    });
    
    if (!company) {
      console.log('❌ Không tìm thấy công ty HUTECH');
      return;
    }
    
    console.log(`📋 Thông tin công ty:`);
    console.log(`- ID: ${company.id}`);
    console.log(`- Tên: ${company.companyName}`);
    
    // Danh sách công việc mẫu
    const sampleJobs = [
      {
        title: 'Frontend Developer (React)',
        description: 'Chúng tôi đang tìm kiếm một Frontend Developer có kinh nghiệm với React để tham gia vào đội ngũ phát triển sản phẩm của chúng tôi.',
        requirements: ['Có ít nhất 2 năm kinh nghiệm với React', 'Thành thạo JavaScript/TypeScript', 'Hiểu biết về HTML/CSS'],
        benefits: ['Lương cạnh tranh', 'Môi trường làm việc năng động', 'Cơ hội học hỏi và phát triển'],
        location: 'TP. Hồ Chí Minh',
        jobType: 'FULL_TIME',
        workMode: 'HYBRID',
        experienceLevel: 'INTERMEDIATE',
        salaryMin: 20000000,
        salaryMax: 35000000,
        currency: 'VND',
        requiredSkills: ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS'],
        isActive: true,
        publishedAt: new Date(),
        companyId: company.id
      },
      {
        title: 'UI/UX Designer',
        description: 'Chúng tôi đang tìm kiếm một UI/UX Designer tài năng để thiết kế giao diện người dùng cho các sản phẩm của chúng tôi.',
        requirements: ['Có ít nhất 2 năm kinh nghiệm thiết kế UI/UX', 'Thành thạo Figma, Adobe XD', 'Portfolio thiết kế ấn tượng'],
        benefits: ['Lương cạnh tranh', 'Môi trường làm việc sáng tạo', 'Cơ hội làm việc với các dự án lớn'],
        location: 'TP. Hồ Chí Minh',
        jobType: 'FULL_TIME',
        workMode: 'ONSITE',
        experienceLevel: 'INTERMEDIATE',
        salaryMin: 18000000,
        salaryMax: 30000000,
        currency: 'VND',
        requiredSkills: ['Figma', 'Adobe XD', 'UI Design', 'UX Research'],
        isActive: true,
        publishedAt: new Date(),
        companyId: company.id
      },
      {
        title: 'Mobile Developer (Flutter)',
        description: 'Chúng tôi đang tìm kiếm một Mobile Developer có kinh nghiệm với Flutter để phát triển ứng dụng di động đa nền tảng.',
        requirements: ['Có ít nhất 1 năm kinh nghiệm với Flutter', 'Thành thạo Dart', 'Đã từng phát hành ứng dụng trên App Store/Google Play'],
        benefits: ['Lương cạnh tranh', 'Môi trường làm việc linh hoạt', 'Cơ hội phát triển sự nghiệp'],
        location: 'TP. Hồ Chí Minh',
        jobType: 'FULL_TIME',
        workMode: 'HYBRID',
        experienceLevel: 'JUNIOR',
        salaryMin: 15000000,
        salaryMax: 25000000,
        currency: 'VND',
        requiredSkills: ['Flutter', 'Dart', 'Mobile Development', 'Firebase'],
        isActive: true,
        publishedAt: new Date(),
        companyId: company.id
      }
    ];
    
    // Tạo công việc
    console.log('🔄 Đang tạo công việc mẫu...');
    
    for (const jobData of sampleJobs) {
      const job = await prisma.job.create({
        data: jobData
      });
      
      console.log(`✅ Đã tạo công việc: ${job.title} (ID: ${job.id})`);
    }
    
    console.log('🎉 Tạo công việc mẫu hoàn tất!');
    
    // Kiểm tra lại số lượng công việc
    const jobCount = await prisma.job.count({
      where: { companyId: company.id }
    });
    
    console.log(`📊 Tổng số công việc của công ty ${company.companyName}: ${jobCount}`);
    
  } catch (error) {
    console.error('❌ Lỗi khi tạo công việc mẫu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleJobs(); 