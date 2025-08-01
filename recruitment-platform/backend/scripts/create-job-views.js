const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createJobViews() {
  try {
    console.log('🔍 Tạo job views cho dashboard test...');
    
    // Lấy tất cả jobs của company
    const jobs = await prisma.job.findMany({
      select: { id: true, title: true }
    });
    
    console.log(`📊 Tìm thấy ${jobs.length} jobs`);
    
    // Xóa job views cũ
    await prisma.jobView.deleteMany({});
    console.log('🗑️ Đã xóa job views cũ');
    
    // Tạo job views ngẫu nhiên cho mỗi job
    for (const job of jobs) {
      const viewCount = Math.floor(Math.random() * 50) + 10; // 10-59 views
      
      for (let i = 0; i < viewCount; i++) {
        const randomDate = new Date();
        randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30)); // Trong 30 ngày qua
        
        await prisma.jobView.create({
          data: {
            jobId: job.id,
            viewedAt: randomDate,
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Test Browser'
          }
        });
      }
      
      console.log(`✅ Đã tạo ${viewCount} views cho job: ${job.title}`);
    }
    
    // Thống kê tổng quan
    const totalViews = await prisma.jobView.count();
    console.log(`\n🎉 Hoàn thành! Tổng cộng ${totalViews} job views đã được tạo.`);
    
  } catch (error) {
    console.error('❌ Lỗi khi tạo job views:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createJobViews();
