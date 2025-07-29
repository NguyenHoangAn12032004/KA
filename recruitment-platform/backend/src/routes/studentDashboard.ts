import { Router } from 'express';
import { prisma } from '../utils/database';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Test route - không cần xác thực (chỉ dùng cho development)
router.get('/test/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Lấy thông tin sinh viên với đầy đủ dữ liệu liên quan
    const student = await prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: {
          include: {
            projects: true,
            educations: true,
            workExperiences: true,
            certifications: true
          }
        }
      }
    });
    
    if (!student || student.role !== 'STUDENT') {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sinh viên'
      });
    }
    
    // Get progress data (projects and skills counts)
    const progressData = student.studentProfile 
      ? await getStudentProgressData(student.studentProfile.id)
      : { total_projects: 0, total_skills: 0, total_certifications: 0 };
    
    // Trả về dữ liệu test
    res.json({
      success: true,
      data: {
        profile: {
          firstName: student.studentProfile?.firstName || '',
          lastName: student.studentProfile?.lastName || '',
          email: student.email,
          profile_completion: student.studentProfile?.profile_completion || 0,
          total_projects: progressData.total_projects,
          total_skills: progressData.total_skills,
          skills: student.studentProfile?.skills || [],
          projects: student.studentProfile?.projects || [],
          github: student.studentProfile?.github || '',
          linkedin: student.studentProfile?.linkedin || '',
          portfolio: student.studentProfile?.portfolio || ''
        }
      }
    });
  } catch (error) {
    console.error('Error in test route:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message
    });
  }
});

// Helper function to count projects and skills
async function getStudentProgressData(studentProfileId: string) {
  try {
    // Get projects count
    const projects = await prisma.studentProject.count({
      where: { studentId: studentProfileId }
    });
    
    // Get skills count
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      select: { skills: true }
    });
    
    // Get certifications count (for reference)
    const certifications = await prisma.studentCertification.count({
      where: { studentId: studentProfileId }
    });
    
    return {
      total_projects: projects,
      total_skills: studentProfile?.skills?.length || 0,
      total_certifications: certifications
    };
  } catch (error) {
    console.error('Error getting student progress data:', error);
    return {
      total_projects: 0,
      total_skills: 0,
      total_certifications: 0
    };
  }
}

// Dashboard sinh viên
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  // Kiểm tra quyền truy cập
  if ((req as any).user?.id !== id && (req as any).user?.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Không có quyền truy cập dữ liệu này'
    });
  }
  
  try {
    // Lấy thông tin sinh viên với đầy đủ dữ liệu liên quan
    const student = await prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: {
          include: {
            projects: true,
            educations: true,
            workExperiences: true,
            certifications: true
          }
        }
      }
    });
    
    if (!student || student.role !== 'STUDENT') {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sinh viên'
      });
    }
    
    // Get progress data (projects and skills counts)
    const progressData = student.studentProfile 
      ? await getStudentProgressData(student.studentProfile.id)
      : { total_projects: 0, total_skills: 0, total_certifications: 0 };
    
    // Lấy thông tin việc làm đã lưu
    const savedJobs = await prisma.savedJob.findMany({
      where: {
        userId: id
      },
      include: {
        job: {
          include: {
            company_profiles: true
          }
        }
      },
      orderBy: {
        savedAt: 'desc'
      },
      take: 10
    });
    
    // Lấy thông tin việc làm đã ứng tuyển
    const applications = await prisma.application.findMany({
      where: {
        studentId: id
      },
      include: {
        job: {
          include: {
            company_profiles: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    
    // Lấy thông tin phỏng vấn
    const interviews = await prisma.interviews.findMany({
      where: {
        applicationId: {
          in: applications.map(app => app.id)
        }
      },
      include: {
        applications: {
          include: {
            job: {
              include: {
                company_profiles: true
              }
            }
          }
        },
        jobs: true
      },
      orderBy: {
        scheduledAt: 'desc'
      },
      take: 10
    });
    
    // Định dạng dữ liệu trả về
    const dashboardData = {
      profile: {
        firstName: student.studentProfile?.firstName || '',
        lastName: student.studentProfile?.lastName || '',
        email: student.email,
        avatar: student.studentProfile?.avatar || '',
        university: student.studentProfile?.university || '',
        major: student.studentProfile?.major || '',
        profile_completion: student.studentProfile?.profile_completion || 0,
        // Add progress data
        total_projects: progressData.total_projects,
        total_skills: progressData.total_skills,
        total_certifications: progressData.total_certifications,
        // Thêm dữ liệu đầy đủ
        skills: student.studentProfile?.skills || [],
        projects: student.studentProfile?.projects || [],
        github: student.studentProfile?.github || '',
        linkedin: student.studentProfile?.linkedin || '',
        portfolio: student.studentProfile?.portfolio || ''
      },
      savedJobs: savedJobs.map(sj => ({
        id: sj.jobId,
        title: sj.job.title,
        company: sj.job.company_profiles?.companyName || 'Unknown',
        logo: sj.job.company_profiles?.logo || null,
        location: sj.job.location,
        savedAt: sj.savedAt
      })),
      applications: applications.map(app => ({
        id: app.id,
        jobId: app.jobId,
        status: app.status,
        title: app.job.title,
        company: app.job.company_profiles?.companyName || 'Unknown',
        logo: app.job.company_profiles?.logo || null,
        appliedAt: app.createdAt
      })),
      interviews: interviews.map(interview => ({
        id: interview.id,
        title: interview.title,
        status: interview.status,
        scheduledAt: interview.scheduledAt,
        jobTitle: interview.jobs.title,
        company: interview.applications.job.company_profiles?.companyName || 'Unknown',
        logo: interview.applications.job.company_profiles?.logo || null
      })),
      // Add viewedJobs for the frontend
      viewedJobs: []
    };
    
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message
    });
  }
});

export default router; 