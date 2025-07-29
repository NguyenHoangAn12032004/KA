import express, { Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { getApplications, updateApplication } from '../controllers/applications';
import { authenticateToken, requireRole } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const prisma = new PrismaClient();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/resumes');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'resume-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.') as any);
    }
  }
});

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    companyId?: string;
  };
}

router.get('/', authenticateToken, requireRole(['COMPANY', 'HR_MANAGER']), getApplications);
router.patch('/:id', authenticateToken, requireRole(['COMPANY', 'HR_MANAGER']), updateApplication);

// Upload resume for application
router.post('/:jobId/resume', authenticateToken, upload.single('resume'), async (req: AuthRequest, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Generate the URL for the uploaded file
    const fileUrl = `/uploads/resumes/${req.file.filename}`;

    res.status(200).json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload resume'
    });
  }
});

// Route for students to submit job applications
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Check if the user is a student
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== 'STUDENT') {
      return res.status(403).json({
        success: false,
        error: 'Only students can apply for jobs'
      });
    }

    const { jobId, coverLetter, customResume } = req.body;

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Check if the student has already applied for this job
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_studentId: {
          jobId,
          studentId: userId
        }
      }
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        error: 'You have already applied for this job'
      });
    }

    // Tạo transaction để đảm bảo tính nhất quán dữ liệu
    const [application, updatedJob] = await prisma.$transaction([
      // Tạo đơn ứng tuyển
      prisma.application.create({
        data: {
          jobId,
          studentId: userId,
          coverLetter,
          customResume,
          status: 'PENDING',
          statusHistory: JSON.stringify([
            {
              status: 'PENDING',
              timestamp: new Date().toISOString(),
              note: 'Application submitted'
            }
          ])
        },
        include: {
          job: true
        }
      }),
      
      // Cập nhật số lượng ứng viên cho công việc
      prisma.job.update({
        where: { id: jobId },
        data: {
          applicationsCount: {
            increment: 1
          }
        }
      })
    ]);

    // Create notification for the student
    await prisma.notification.create({
      data: {
        userId,
        type: 'APPLICATION_SUBMITTED',
        title: 'Application Submitted',
        message: `Your application for ${job.title} has been submitted successfully`,
        data: {
          applicationId: application.id,
          jobId
        }
      }
    });

    // Get the Socket.IO instance
    const io = req.app.get('io');
    if (io) {
      // Notify the company about the new application
      io.to(`company:${job.companyId}`).emit('new-application', {
        applicationId: application.id,
        jobId,
        jobTitle: job.title
      });
    }

    res.status(201).json({
      success: true,
      data: {
        application_id: application.id,
        status: application.status,
        submitted_at: application.appliedAt,
        message: 'Application submitted successfully'
      }
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit application'
    });
  }
});

// Route for students to get their applications
router.get('/student', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Get all applications for this student
    const applications = await prisma.application.findMany({
      where: {
        studentId: userId
      },
      include: {
        job: {
          include: {
            company_profiles: true
          }
        }
      },
      orderBy: {
        appliedAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching student applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications'
    });
  }
});

// Lấy các đơn ứng tuyển gần đây cho công ty
router.get('/company/recent', authenticateToken, requireRole(['COMPANY', 'HR_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(403).json({
        success: false,
        error: 'Company ID not found'
      });
    }

    // Lấy tất cả job của công ty
    const companyJobs = await prisma.job.findMany({
      where: { companyId: companyId },
      select: { id: true }
    });
    
    const jobIds = companyJobs.map(job => job.id);
    
    // Lấy 10 đơn ứng tuyển gần đây nhất
    const recentApplications = await prisma.application.findMany({
      where: {
        jobId: { in: jobIds }
      },
      include: {
        student: {
          include: {
            studentProfile: true
          }
        },
        job: true
      },
      orderBy: {
        appliedAt: 'desc'
      },
      take: 10
    });

    // Chuyển đổi dữ liệu
    const transformedApplications = recentApplications.map(app => ({
      id: app.id,
      jobId: app.jobId,
      jobTitle: app.job.title,
      studentId: app.studentId,
      studentName: app.student.studentProfile ? `${app.student.studentProfile.firstName} ${app.student.studentProfile.lastName}` : 'Unknown',
      studentAvatar: app.student.studentProfile?.avatar,
      status: app.status,
      appliedAt: app.appliedAt,
      university: app.student.studentProfile?.university,
      major: app.student.studentProfile?.major
    }));

    res.json({
      success: true,
      data: transformedApplications
    });
  } catch (error) {
    console.error('Error fetching recent applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent applications'
    });
  }
});

export default router;
