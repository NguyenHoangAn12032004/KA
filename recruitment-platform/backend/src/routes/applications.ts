import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/applications - Get applications with auth
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let applications;

    if (userRole === 'STUDENT') {
      // Get applications for student
      applications = await prisma.applications.findMany({
        where: { studentId: userId },
        include: {
          jobs: {
            select: {
              id: true,
              title: true,
              location: true,
              salaryMin: true,
              salaryMax: true,
              currency: true,
              companyId: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (userRole === 'COMPANY') {
      // Get applications for company's jobs
      // First get the company profile ID
      const companyProfile = await prisma.company_profiles.findUnique({
        where: { userId: userId },
        select: { id: true }
      });

      if (!companyProfile) {
        return res.status(404).json({
          success: false,
          error: 'Company profile not found'
        });
      }

      const companyJobs = await prisma.jobs.findMany({
        where: { companyId: companyProfile.id },
        select: { id: true }
      });

      const jobIds = companyJobs.map(job => job.id);

      applications = await prisma.applications.findMany({
        where: { jobId: { in: jobIds } },
        include: {
          jobs: {
            select: {
              id: true,
              title: true,
              location: true,
              salaryMin: true,
              salaryMax: true,
              currency: true
            }
          },
          users: {
            select: {
              id: true,
              email: true,
              student_profiles: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phone: true,
                  avatar: true,
                  university: true,
                  major: true,
                  graduationYear: true,
                  skills: true,
                  experience: true,
                  portfolio: true,
                  github: true,
                  linkedin: true,
                  resume: true,
                  preferredJobTypes: true,
                  preferredWorkModes: true,
                  expectedSalaryMin: true,
                  expectedSalaryMax: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: applications
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications'
    });
  }
});

// GET /api/applications/student - Alias for student applications (same as GET /)
router.get('/student', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'STUDENT') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get applications for student
    const applications = await prisma.applications.findMany({
      where: { studentId: userId },
      include: {
        jobs: {
          select: {
            id: true,
            title: true,
            location: true,
            salaryMin: true,
            salaryMax: true,
            currency: true,
            companyId: true
          }
        },
        users: {
          select: {
            id: true,
            email: true,
            student_profiles: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                university: true,
                major: true,
                graduationYear: true,
                gpa: true,
                skills: true,
                experience: true,
                portfolio: true,
                github: true,
                linkedin: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: applications
    });

  } catch (error) {
    console.error('Error fetching student applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student applications'
    });
  }
});

// GET /api/applications/student/:studentId - Get student applications by ID (for COMPANY role)
router.get('/student/:studentId', authenticateToken, async (req: any, res) => {
  try {
    const userRole = req.user.role;
    const { studentId } = req.params;

    if (userRole !== 'COMPANY') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    console.log('[GET] Student applications for ID:', studentId);

    // Get applications for specific student
    const applications = await prisma.applications.findMany({
      where: { studentId },
      include: {
        jobs: {
          select: {
            id: true,
            title: true,
            location: true,
            salaryMin: true,
            salaryMax: true,
            currency: true,
            companyId: true
          }
        },
        users: {
          select: {
            id: true,
            email: true,
            student_profiles: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                university: true,
                major: true,
                graduationYear: true,
                gpa: true,
                skills: true,
                experience: true,
                portfolio: true,
                github: true,
                linkedin: true,
                resume: true,
                preferredJobTypes: true,
                preferredWorkModes: true,
                expectedSalaryMin: true,
                expectedSalaryMax: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: applications
    });

  } catch (error) {
    console.error('Error fetching student applications by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student applications'
    });
  }
});

// POST /api/applications - Create new application
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { jobId, coverLetter } = req.body;

    if (userRole !== 'STUDENT') {
      return res.status(403).json({
        success: false,
        error: 'Only students can apply for jobs'
      });
    }

    if (!jobId) {
      return res.status(400).json({
        success: false,
        error: 'Job ID is required'
      });
    }

    // Check if job exists
    const job = await prisma.jobs.findUnique({
      where: { id: jobId },
      include: {
        company_profiles: {
          select: {
            companyName: true
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Check if user already applied
    const existingApplication = await prisma.applications.findFirst({
      where: {
        studentId: userId,
        jobId
      }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        error: 'You have already applied for this job'
      });
    }

    // Create application
    const application = await prisma.applications.create({
      data: {
        id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        studentId: userId,
        jobId,
        coverLetter: coverLetter || '',
        status: 'PENDING',
        updatedAt: new Date()
      },
      include: {
        jobs: {
          select: {
            title: true,
            companyId: true
          }
        }
      }
    });

    // Emit real-time event if socket is available
    const io = (req as any).io;
    if (io) {
      // Notify company about new application - FIXED: Use consistent event name
      io.to(`company-${job.companyId}`).emit('new-application', {
        applicationId: application.id,
        jobId: application.jobId,
        jobTitle: job.title,
        studentId: application.studentId,
        timestamp: new Date(),
        job: { title: job.title } // Add job info for frontend
      });
      
      console.log(`📡 Emitted new-application event to company-${job.companyId}`);
      
      // Notify student about successful application
      io.to(`user-${application.studentId}`).emit('application-submitted', {
        applicationId: application.id,
        jobTitle: job.title,
        companyName: job.company_profiles?.companyName,
        timestamp: new Date()
      });
    }

    res.status(201).json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create application'
    });
  }
});

// POST /api/applications/:jobId/resume - Upload resume for specific job
router.post('/:jobId/resume', authenticateToken, async (req: any, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;
    
    // Check if job exists
    const job = await prisma.jobs.findUnique({
      where: { id: jobId }
    });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    
    // For now, just return success (file upload can be implemented later)
    // The actual application will be created via POST /api/applications
    return res.json({
      success: true,
      data: {
        url: null, // File upload not implemented yet
        message: 'Resume upload endpoint exists but file handling not implemented'
      }
    });
    
  } catch (error) {
    console.error('Error handling resume upload:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to handle resume upload'
    });
  }
});

// PUT /api/applications/:id/status - Update application status
router.put('/:id/status', authenticateToken, async (req: any, res) => {
  try {
    const applicationId = req.params.id;
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'COMPANY') {
      return res.status(403).json({
        success: false,
        error: 'Only companies can update application status'
      });
    }

    // Find application with job and student info
    const application = await prisma.applications.findUnique({
      where: { id: applicationId },
      include: {
        jobs: {
          include: {
            company_profiles: {
              select: {
                companyName: true,
                userId: true
              }
            }
          }
        },
        users: {
          include: {
            student_profiles: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
                phone: true,
                university: true,
                major: true,
                skills: true
              }
            }
          }
        }
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Check if user owns this company
    if (application.jobs.company_profiles?.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this application'
      });
    }

    // Update application status
    const updatedApplication = await prisma.applications.update({
      where: { id: applicationId },
      data: { status },
      include: {
        jobs: {
          select: {
            title: true,
            companyId: true
          }
        }
      }
    });

    // Emit real-time events
    const io = (req as any).io;
    if (io) {
      // Notify student about status change
      io.to(`user-${application.studentId}`).emit('application-status-changed', {
        applicationId: applicationId,
        jobTitle: application.jobs.title,
        status: status,
        companyName: application.jobs.company_profiles?.companyName,
        timestamp: new Date()
      });
      
      // Notify company room about the update
      io.to(`company-${application.jobs.companyId}`).emit('application-status-updated', {
        applicationId: applicationId,
        studentName: `${application.users.student_profiles?.firstName} ${application.users.student_profiles?.lastName}`,
        status: status,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: updatedApplication
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update application status'
    });
  }
});

// POST /api/applications/:id/schedule-interview - Schedule interview for application
router.post('/:id/schedule-interview', authenticateToken, async (req: any, res) => {
  try {
    const applicationId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log(`📅 Schedule interview request - ApplicationId: ${applicationId}, UserId: ${userId}, Role: ${userRole}`);

    // Only companies can schedule interviews
    if (userRole !== 'COMPANY') {
      return res.status(403).json({
        success: false,
        error: 'Only companies can schedule interviews'
      });
    }

    // Get company profile
    const companyProfile = await prisma.company_profiles.findUnique({
      where: { userId: userId },
      select: { id: true }
    });

    if (!companyProfile) {
      return res.status(404).json({
        success: false,
        error: 'Company profile not found'
      });
    }

    // Get the application and verify it belongs to company
    const application = await prisma.applications.findUnique({
      where: { id: applicationId },
      include: {
        jobs: {
          select: {
            id: true,
            companyId: true,
            title: true
          }
        }
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    console.log(`🔍 Application found - JobId: ${application.jobs.id}, CompanyId: ${application.jobs.companyId}, Expected: ${companyProfile.id}`);

    // Verify the job belongs to the company
    if (application.jobs.companyId !== companyProfile.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only schedule interviews for your own job applications'
      });
    }

    const {
      title,
      description,
      type,
      scheduledAt,
      duration = 60,
      location,
      meetingLink,
      interviewer,
      interviewerEmail,
      notes
    } = req.body;

    console.log(`📅 Interview data:`, { title, type, scheduledAt, duration });

    // Generate unique interview ID
    const interviewId = `interview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create the interview
    const interview = await prisma.interviews.create({
      data: {
        id: interviewId,
        applicationId: applicationId,
        companyId: companyProfile.id,
        jobId: application.jobs.id,
        title,
        description,
        type,
        scheduledAt: new Date(scheduledAt),
        duration,
        location,
        meetingLink,
        interviewer,
        interviewerEmail,
        notes,
        status: 'SCHEDULED',
        updatedAt: new Date()
      }
    });

    // Update application status to INTERVIEW_SCHEDULED
    await prisma.applications.update({
      where: { id: applicationId },
      data: {
        status: 'INTERVIEW_SCHEDULED',
        updatedAt: new Date()
      }
    });

    console.log('✅ Interview scheduled successfully:', interview.id);

    // Create notification for the student using NotificationService
    try {
      const { getNotificationService } = require('../services/socketService');
      const notificationService = getNotificationService();
      
      if (notificationService) {
        await notificationService.notifyInterviewScheduled({
          studentUserId: application.studentId,
          interviewId: interview.id
        });
        console.log(`📬 Created notification for student ${application.studentId}`);
      } else {
        console.error('❌ NotificationService not available');
      }
    } catch (notificationError) {
      console.error('❌ Failed to create notification:', notificationError);
    }

    // Emit real-time event if socket is available
    const io = (req as any).io;
    console.log('🔍 Socket IO instance available:', !!io);
    
    if (io) {
      console.log(`📡 Emitting interview-scheduled to user-${application.studentId}`);
      // Notify student about scheduled interview
      io.to(`user-${application.studentId}`).emit('interview-scheduled', {
        interviewId: interview.id,
        applicationId: applicationId,
        jobTitle: application.jobs.title,
        type: interview.type,
        scheduledAt: interview.scheduledAt,
        timestamp: new Date()
      });
      
      console.log(`📡 Emitting interview-scheduled-company to company-${companyProfile.id}`);
      // Notify company room about the scheduled interview
      io.to(`company-${companyProfile.id}`).emit('interview-scheduled-company', {
        interviewId: interview.id,
        applicationId: applicationId,
        jobTitle: application.jobs.title,
        timestamp: new Date()
      });
      
      console.log('✅ Real-time events emitted successfully');
    } else {
      console.error('❌ Socket IO instance not available');
    }

    return res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      data: interview
    });

  } catch (error) {
    console.error('❌ Error scheduling interview:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to schedule interview'
    });
  }
});

export default router;


