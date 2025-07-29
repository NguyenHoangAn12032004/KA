const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Script để kiểm tra API endpoint để ghi lại lượt xem công việc
 */
async function testJobViewEndpoint() {
  try {
    console.log('🔍 Bắt đầu kiểm tra API endpoint ghi lượt xem công việc...');

    // Lấy một công việc ngẫu nhiên để kiểm tra
    const job = await prisma.job.findFirst({
      where: {
        isActive: true
      },
      select: {
        id: true,
        title: true,
        viewCount: true
      }
    });

    if (!job) {
      console.error('❌ Không tìm thấy công việc nào để kiểm tra');
      return;
    }

    console.log(`📋 Công việc được chọn để kiểm tra: "${job.title}"`);
    console.log(`   - ID: ${job.id}`);
    console.log(`   - Lượt xem hiện tại: ${job.viewCount}`);

    // Gọi API endpoint để ghi lượt xem
    console.log('\n🔄 Gọi API endpoint để ghi lượt xem...');
    const response = await axios.post(`http://localhost:5000/api/jobs/${job.id}/view`);

    console.log('\n✅ Kết quả từ API:');
    console.log(`   - Status: ${response.status}`);
    console.log(`   - Data:`, response.data);

    // Kiểm tra xem số lượt xem có tăng lên không
    const updatedJob = await prisma.job.findUnique({
      where: {
        id: job.id
      },
      select: {
        viewCount: true
      }
    });

    console.log(`\n📊 Kết quả kiểm tra:`);
    console.log(`   - Lượt xem trước đó: ${job.viewCount}`);
    console.log(`   - Lượt xem hiện tại: ${updatedJob.viewCount}`);

    if (updatedJob.viewCount > job.viewCount) {
      console.log(`\n✅ API endpoint hoạt động đúng! Số lượt xem đã tăng.`);
    } else {
      console.log(`\n❌ API endpoint không hoạt động đúng! Số lượt xem không tăng.`);
    }

    // Kiểm tra bảng job_views
    const viewRecords = await prisma.jobView.findMany({
      where: {
        jobId: job.id
      },
      orderBy: {
        viewedAt: 'desc'
      },
      take: 5
    });

    console.log(`\n📋 5 lượt xem gần đây nhất của công việc:`, 
      viewRecords.map(record => ({
        id: record.id,
        userId: record.userId || 'anonymous',
        viewedAt: record.viewedAt
      }))
    );

    console.log('\n🎉 Hoàn thành kiểm tra API endpoint ghi lượt xem công việc!');
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra API endpoint ghi lượt xem:', error);
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy hàm kiểm tra
testJobViewEndpoint(); 