const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Script để đồng bộ số lượt xem và số ứng viên cho tất cả các công việc
 * Sử dụng khi cần đồng bộ lại dữ liệu hoặc sau khi thêm trigger mới
 */
async function updateJobCounts() {
  try {
    console.log('🔄 Bắt đầu đồng bộ số lượt xem và số ứng viên cho tất cả công việc...');

    // Lấy tất cả công việc
    const jobs = await prisma.job.findMany({
      select: {
        id: true,
        title: true,
        viewCount: true,
        applicationsCount: true
      }
    });

    console.log(`📊 Tìm thấy ${jobs.length} công việc cần cập nhật`);
    let updatedCount = 0;

    // Cập nhật từng công việc
    for (const job of jobs) {
      // Đếm số lượt xem từ bảng job_views
      const viewCount = await prisma.jobView.count({
        where: {
          jobId: job.id
        }
      });

      // Đếm số ứng viên từ bảng applications
      const applicationsCount = await prisma.application.count({
        where: {
          jobId: job.id
        }
      });

      const needsUpdate = job.viewCount !== viewCount || job.applicationsCount !== applicationsCount;
      
      if (needsUpdate) {
        // Cập nhật công việc
        await prisma.job.update({
          where: {
            id: job.id
          },
          data: {
            viewCount,
            applicationsCount
          }
        });
        
        updatedCount++;
        console.log(`✅ Đã đồng bộ "${job.title}" - Lượt xem: ${viewCount} (trước đó: ${job.viewCount}), Ứng viên: ${applicationsCount} (trước đó: ${job.applicationsCount})`);
      } else {
        console.log(`✓ "${job.title}" - Đã đồng bộ (Lượt xem: ${viewCount}, Ứng viên: ${applicationsCount})`);
      }
    }

    console.log(`\n🎉 Hoàn thành đồng bộ số lượt xem và số ứng viên!`);
    console.log(`   Tổng số: ${jobs.length} công việc`);
    console.log(`   Đã cập nhật: ${updatedCount} công việc`);
    console.log(`   Không thay đổi: ${jobs.length - updatedCount} công việc`);
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật số lượt xem và số ứng viên:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Thực thi hàm đồng bộ
updateJobCounts().then(() => {
  console.log('📝 Script hoàn tất');
}); 