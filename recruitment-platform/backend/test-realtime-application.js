const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function createRealtimeApplication() {
  try {
    console.log('🚀 Tạo ứng dụng realtime để test...');

    // Get a job
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

    // Get a student
    const student = await prisma.user.findFirst({
      where: {
        role: 'STUDENT'
      },
      include: {
        studentProfile: true
      }
    });

    if (!job || !student) {
      console.log('❌ Không tìm thấy job hoặc student');
      return;
    }

    console.log(`📋 Tạo ứng dụng: ${student.email} -> ${job.title}`);

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId: job.id,
        studentId: student.id,
        coverLetter: 'Đây là ứng dụng realtime test để kiểm tra dashboard update!',
        status: 'PENDING'
      },
      include: {
        student: {
          include: {
            studentProfile: true
          }
        },
        job: {
          include: {
            company_profiles: true
          }
        }
      }
    });

    console.log('✅ Ứng dụng đã được tạo:', application.id);

    // Simulate socket emission (you would normally emit this in your application route)
    console.log('📡 Socket data would be emitted:');
    console.log({
      event: 'new-application',
      data: {
        id: application.id,
        job: {
          id: job.id,
          title: job.title
        },
        student: {
          firstName: student.studentProfile?.firstName,
          lastName: student.studentProfile?.lastName,
          avatar: student.studentProfile?.avatar
        },
        status: application.status,
        createdAt: application.appliedAt
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: job.company_profiles.userId, // Company user ID
        type: 'APPLICATION_RECEIVED',
        title: 'Ứng viên mới',
        message: `Có ứng viên mới ứng tuyển vào vị trí ${job.title}`,
        data: JSON.stringify({
          applicationId: application.id,
          jobId: job.id,
          studentId: student.id
        })
      }
    });

    console.log('🔔 Notification đã được tạo');
    console.log('🎉 Test realtime application hoàn tất!');

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️ Ứng dụng đã tồn tại - đây là test thành công!');
    } else {
      console.error('❌ Lỗi:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createRealtimeApplication();
