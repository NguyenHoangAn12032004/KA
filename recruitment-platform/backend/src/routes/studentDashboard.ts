import { Router } from 'express';
import express from 'express';
import { prisma } from '../utils/database';
import { authenticateToken } from '../middleware/auth';
import { emitStudentDashboardUpdate, emitJobViewUpdate } from '../services/socketService';

const router = Router();

// Test route - không cần xác thực (chỉ dùng cho development)
router.get('/test/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Lấy thông tin sinh viên với đầy đủ dữ liệu liên quan
    const student = await prisma.users.findUnique({
      where: { id },
      include: {
        student_profiles: {
          include: {
            student_projects: true,
            student_educations: true,
            student_experiences: true,
            student_certifications: true
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
    const progressData = student.student_profiles 
      ? await getStudentProgressData(student.student_profiles.id)
      : { total_projects: 0, total_skills: 0, total_certifications: 0, profile_completion: 0 };
    
    // Trả về dữ liệu test
    res.json({
      success: true,
      data: {
        profile: {
          firstName: student.student_profiles?.firstName || '',
          lastName: student.student_profiles?.lastName || '',
          email: student.email,
          profile_completion: progressData.profile_completion,
          total_projects: progressData.total_projects,
          total_skills: progressData.total_skills,
          skills: student.student_profiles?.skills || [],
          projects: student.student_profiles?.student_projects || [],
          github: student.student_profiles?.github || '',
          linkedin: student.student_profiles?.linkedin || '',
          portfolio: student.student_profiles?.portfolio || ''
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
    const projects = await prisma.student_projects.count({
      where: { studentId: studentProfileId }
    });
    
    // Get skills count and profile data for completion calculation
    const studentProfile = await prisma.student_profiles.findUnique({
      where: { id: studentProfileId },
      select: { 
        skills: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        experience: true,  // Changed from summary to experience
        profile_completion: true
      }
    });
    
    // Get certifications count (for reference)
    const certifications = await prisma.student_certifications.count({
      where: { studentId: studentProfileId }
    });

    // Calculate profile completion if not available
    let profileCompletion = studentProfile?.profile_completion || 0;
    
    if (!profileCompletion && studentProfile) {
      // Calculate based on filled fields
      let completedFields = 0;
      const totalFields = 6; // firstName, lastName, phone, dateOfBirth, experience, skills
      
      if (studentProfile.firstName) completedFields++;
      if (studentProfile.lastName) completedFields++;
      if (studentProfile.phone) completedFields++;
      if (studentProfile.dateOfBirth) completedFields++;
      if (studentProfile.experience) completedFields++;  // Changed from summary to experience
      if (studentProfile.skills && studentProfile.skills.length > 0) completedFields++;
      
      profileCompletion = Math.round((completedFields / totalFields) * 100);
    }
    
    return {
      total_projects: projects,
      total_skills: studentProfile?.skills?.length || 0,
      total_certifications: certifications,
      profile_completion: profileCompletion
    };
  } catch (error) {
    console.error('Error getting student progress data:', error);
    return {
      total_projects: 0,
      total_skills: 0,
      total_certifications: 0,
      profile_completion: 0
    };
  }
}

// Dashboard sinh viên
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  console.log(`📊 [StudentDashboard] Request for student ID: ${id}`);
  console.log(`📊 [StudentDashboard] Request user ID: ${(req as any).user?.id}`);
  console.log(`📊 [StudentDashboard] Request user role: ${(req as any).user?.role}`);
  
  // Kiểm tra quyền truy cập
  if ((req as any).user?.id !== id && (req as any).user?.role !== 'ADMIN') {
    console.log(`❌ [StudentDashboard] Access denied for user ${(req as any).user?.id} to student ${id}`);
    return res.status(403).json({
      success: false,
      message: 'Không có quyền truy cập dữ liệu này'
    });
  }
  
  try {
    console.log(`🔍 [StudentDashboard] Fetching student data for ID: ${id}`);
    
    // Lấy thông tin sinh viên với đầy đủ dữ liệu liên quan
    const student = await prisma.users.findUnique({
      where: { id },
      include: {
        student_profiles: {
          include: {
            student_projects: true,
            student_educations: true,
            student_experiences: true,
            student_certifications: true
          }
        }
      }
    });
    
    console.log(`📊 [StudentDashboard] Student found: ${student ? 'Yes' : 'No'}`);
    console.log(`📊 [StudentDashboard] Student role: ${student?.role}`);
    console.log(`📊 [StudentDashboard] Has profile: ${student?.student_profiles ? 'Yes' : 'No'}`);
    
    if (!student) {
      console.log(`❌ [StudentDashboard] Student not found with ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sinh viên'
      });
    }
    
    if (student.role !== 'STUDENT') {
      console.log(`❌ [StudentDashboard] User ${id} is not a student, role: ${student.role}`);
      return res.status(404).json({
        success: false,
        message: 'Người dùng không phải là sinh viên'
      });
    }
    
    // Get progress data (projects and skills counts)
    let progressData = { total_projects: 0, total_skills: 0, total_certifications: 0, profile_completion: 0 };
    
    if (student.student_profiles) {
      try {
        progressData = await getStudentProgressData(student.student_profiles.id);
        console.log(`📊 [StudentDashboard] Progress data loaded:`, progressData);
      } catch (progressError) {
        console.error(`⚠️ [StudentDashboard] Failed to load progress data:`, progressError);
        // Continue with default values
      }
    } else {
      console.log(`⚠️ [StudentDashboard] Student has no profile, using default progress data`);
    }
    
    console.log(`📊 [StudentDashboard] Fetching saved jobs for student: ${id}`);
    
    // Lấy thông tin việc làm đã lưu
    const savedJobs = await prisma.saved_jobs.findMany({
      where: {
        userId: id
      },
      include: {
        jobs: {
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
    const applications = await prisma.applications.findMany({
      where: {
        studentId: id
      },
      include: {
        jobs: {
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
            jobs: {
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
      profile: student?.student_profiles?.[0] || null,
      savedJobs: savedJobs.map(saved => ({
        id: saved.jobs.id,
        title: saved.jobs.title,
        company: saved.jobs.company_profiles?.companyName || 'Unknown',
        logo: saved.jobs.company_profiles?.logo || null,
        savedAt: saved.savedAt
      })),
      applications: applications.map(app => ({
        id: app.id,
        jobId: app.jobId,
        status: app.status,
        title: app.jobs.title,
        company: app.jobs.company_profiles?.companyName || 'Unknown',
        logo: app.jobs.company_profiles?.logo || null,
        appliedAt: app.createdAt
      })),
      interviews: interviews.map(interview => ({
        id: interview.id,
        title: interview.title,
        status: interview.status,
        scheduledAt: interview.scheduledAt,
        jobTitle: interview.jobs.title,
        company: interview.applications.jobs.company_profiles?.companyName || 'Unknown',
        logo: interview.applications.jobs.company_profiles?.logo || null
      })),
      // Add viewedJobs for the frontend
      viewedJobs: [],
      // Add stats
      stats: {
        profileCompletion: progressData.profile_completion,
        totalSkills: progressData.total_skills,
        totalProjects: progressData.total_projects,
        totalCertifications: progressData.total_certifications
      }
    };
    
    // Emit real-time update
    emitStudentDashboardUpdate(id, 'data_loaded', dashboardData);
    
    console.log(`✅ [StudentDashboard] Successfully fetched dashboard data for student: ${id}`);
    
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error(`❌ [StudentDashboard] Error fetching dashboard for student ${id}:`, error);
    console.error(`❌ [StudentDashboard] Error stack:`, (error as Error).stack);
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
      details: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    });
  }
});

export default router; 