const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleApplications() {
  try {
    console.log('🚀 Bắt đầu tạo ứng dụng mẫu...');

    // Get company jobs
    const jobs = await prisma.job.findMany({
      where: {
        company_profiles: {
          companyName: 'HUTECH'
        }
      },
      take: 3
    });

    if (jobs.length === 0) {
      console.log('❌ Không tìm thấy công việc nào của công ty HUTECH');
      return;
    }

    // Get student users
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT'
      },
      take: 5
    });

    if (students.length === 0) {
      console.log('❌ Không tìm thấy sinh viên nào');
      return;
    }

    console.log(`📋 Tìm thấy ${jobs.length} công việc và ${students.length} sinh viên`);

    // Create applications
    const applications = [];
    for (const job of jobs) {
      for (let i = 0; i < Math.min(3, students.length); i++) {
        const student = students[i];
        
        try {
          const application = await prisma.application.create({
            data: {
              jobId: job.id,
              studentId: student.id,
              coverLetter: `Tôi rất quan tâm đến vị trí ${job.title} tại công ty của bạn. Với kinh nghiệm và kỹ năng của mình, tôi tin rằng sẽ đóng góp tích cực cho công ty.`,
              status: ['PENDING', 'REVIEWING', 'SHORTLISTED'][Math.floor(Math.random() * 3)]
            }
          });
          
          applications.push(application);
          console.log(`✅ Đã tạo ứng dụng: ${student.email} -> ${job.title}`);
        } catch (error) {
          if (error.code === 'P2002') {
            console.log(`⚠️ Ứng dụng đã tồn tại: ${student.email} -> ${job.title}`);
          } else {
            console.error(`❌ Lỗi tạo ứng dụng: ${error.message}`);
          }
        }
      }
    }

    console.log(`🎉 Tạo ${applications.length} ứng dụng mẫu hoàn tất!`);

    // Create some job views
    console.log('📊 Tạo một số lượt xem công việc...');
    for (const job of jobs) {
      for (let i = 0; i < 10 + Math.floor(Math.random() * 20); i++) {
        try {
          await prisma.jobView.create({
            data: {
              jobId: job.id,
              userId: Math.random() > 0.5 ? students[Math.floor(Math.random() * students.length)].id : undefined,
              ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
              userAgent: 'Mozilla/5.0 (Sample Browser)'
            }
          });
        } catch (error) {
          // Ignore duplicate view errors
        }
      }
    }

    // Update job counts
    console.log('🔄 Đồng bộ số lượt xem và ứng dụng...');
    for (const job of jobs) {
      const viewCount = await prisma.jobView.count({
        where: { jobId: job.id }
      });
      
      const applicationsCount = await prisma.application.count({
        where: { jobId: job.id }
      });

      await prisma.job.update({
        where: { id: job.id },
        data: {
          viewCount,
          applicationsCount
        }
      });

      console.log(`✅ ${job.title}: ${viewCount} lượt xem, ${applicationsCount} ứng dụng`);
    }

    console.log('🏆 Hoàn tất tạo sample data cho Company Dashboard!');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleApplications();
