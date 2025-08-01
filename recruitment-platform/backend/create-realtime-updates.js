const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function createRealtimeUpdates() {
  try {
    console.log('🚀 Bắt đầu tạo realtime updates...');

    setInterval(async () => {
      try {
        // Get random job and student
        const job = await prisma.job.findFirst({
          where: {
            company_profiles: {
              companyName: 'HUTECH'
            }
          },
          include: {
            company_profiles: true
          }
        });

        if (!job) return;

        // Create a random job view
        await prisma.jobView.create({
          data: {
            id: uuidv4(),
            jobId: job.id,
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Chrome/Test Browser'
          }
        });

        // Update job view count
        const viewCount = await prisma.jobView.count({
          where: { jobId: job.id }
        });

        await prisma.job.update({
          where: { id: job.id },
          data: { viewCount }
        });

        console.log(`👁️ Job "${job.title}" được xem - Total views: ${viewCount}`);

        // Simulate socket emission
        console.log('📡 Emitting job-viewed event:', {
          jobId: job.id,
          jobTitle: job.title,
          totalViews: viewCount
        });

      } catch (error) {
        console.error('Error in periodic update:', error);
      }
    }, 5000); // Every 5 seconds

    console.log('⏰ Periodic updates started - creating new job views every 5 seconds');
    console.log('📊 Check your Company Dashboard to see realtime updates!');
    console.log('Press Ctrl+C to stop...');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Stopping realtime updates...');
  await prisma.$disconnect();
  process.exit(0);
});

createRealtimeUpdates();
