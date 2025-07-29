const { PrismaClient } = require('@prisma/client');
const { v4: uuid } = require('uuid');
const prisma = new PrismaClient();

/**
 * Script để kiểm tra chức năng đếm lượt xem công việc
 */
async function testJobViewCount() {
  try {
    console.log('🔍 Bắt đầu kiểm tra chức năng đếm lượt xem công việc...');

    // Lấy một công việc ngẫu nhiên để kiểm tra
    const job = await prisma.job.findFirst({
      where: {
        isActive: true
      },
      select: {
        id: true,
        title: true,
        viewCount: true,
        applicationsCount: true
      }
    });

    if (!job) {
      console.error('❌ Không tìm thấy công việc nào để kiểm tra');
      return;
    }

    console.log(`📋 Công việc được chọn để kiểm tra: "${job.title}"`);
    console.log(`   - ID: ${job.id}`);
    console.log(`   - Lượt xem hiện tại: ${job.viewCount}`);
    console.log(`   - Số ứng viên hiện tại: ${job.applicationsCount}`);

    // Đếm số lượt xem hiện tại trong bảng job_views
    const currentViewCount = await prisma.jobView.count({
      where: {
        jobId: job.id
      }
    });

    console.log(`   - Số bản ghi trong bảng job_views: ${currentViewCount}`);

    // Kiểm tra xem số lượt xem có khớp với số bản ghi trong job_views không
    if (job.viewCount !== currentViewCount) {
      console.log(`⚠️ Cảnh báo: Số lượt xem (${job.viewCount}) không khớp với số bản ghi trong job_views (${currentViewCount})`);
    } else {
      console.log(`✅ Số lượt xem khớp với số bản ghi trong job_views`);
    }

    // Thêm một lượt xem mới
    console.log('\n🔄 Thêm một lượt xem mới...');
    
    const newView = await prisma.jobView.create({
      data: {
        id: uuid(),
        jobId: job.id,
        userId: null,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Script'
      }
    });

    console.log(`✅ Đã thêm lượt xem mới với ID: ${newView.id}`);

    // Kiểm tra xem số lượt xem có tăng lên không
    const updatedJob = await prisma.job.findUnique({
      where: {
        id: job.id
      },
      select: {
        viewCount: true
      }
    });

    console.log(`   - Lượt xem trước đó: ${job.viewCount}`);
    console.log(`   - Lượt xem hiện tại: ${updatedJob.viewCount}`);

    if (updatedJob.viewCount === job.viewCount + 1) {
      console.log(`✅ Trigger đã hoạt động đúng! Số lượt xem đã tăng lên 1.`);
    } else if (updatedJob.viewCount > job.viewCount) {
      console.log(`⚠️ Số lượt xem đã tăng, nhưng không chính xác là 1. Có thể có nhiều lượt xem được thêm cùng lúc.`);
    } else {
      console.log(`❌ Trigger không hoạt động! Số lượt xem không tăng.`);
    }

    console.log('\n🎉 Hoàn thành kiểm tra chức năng đếm lượt xem công việc!');
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra chức năng đếm lượt xem:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy hàm kiểm tra
testJobViewCount(); 