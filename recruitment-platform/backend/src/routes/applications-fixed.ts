import { Router } from 'express';
import { Request, Response } from 'express';
import { prisma } from '../utils/database';
import { authenticateToken, requireRole } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'resumes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `resume-${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX files are allowed'));
    }
  }
});

// Apply job (Student only)
router.post('/', authenticateToken, requireRole(['STUDENT']), async (req: Request, res: Response) => {
  try {
    console.log('📝 POST /api/applications - Headers:', req.headers);
    console.log('📝 POST /api/applications - Body:', JSON.stringify(req.body, null, 2));
    console.log('📝 POST /api/applications - User:', req.user);
    
    const { jobId, coverLetter } = req.body;
    const userId = req.user?.id;

    console.log(`📋 Application data - jobId: ${jobId}, userId: ${userId}, coverLetter: ${coverLetter?.substring(0, 50)}...`);

    if (!jobId || !userId) {
      console.log('❌ Missing required fields:', { jobId: !!jobId, userId: !!userId });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if job exists
    const job = await prisma.jobs.findUnique({ where: { id: jobId } });
    if (!job) {
      console.log(`❌ Job not found: ${jobId}`);
      return res.status(404).json({ message: 'Job not found' });
    }

    console.log(`✅ Job found: ${job.title} (Company: ${job.companyId})`);

    // Check if user already applied
    const existingApp = await prisma.applications.findFirst({
      where: { studentId: userId, jobId }
    });

    if (existingApp) {
      console.log(`❌ User already applied: ${userId} -> ${jobId}`);
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    console.log(`📝 Creating application for user ${userId} -> job ${jobId}`);

    // Create application
    const application = await prisma.applications.create({
      data: {
        id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        studentId: userId,
        jobId,
        coverLetter: coverLetter || '',
        status: 'PENDING',
        updatedAt: new Date()
      }
    });

    console.log(`✅ Application created successfully: ${application.id}`);

    // Real-time notification
    const io = req.app.get('io');
    if (io) {
      console.log('📡 Emitting real-time events...');
      
      io.to(`company-${job.companyId}`).emit('new-application', {
        applicationId: application.id,
        jobId,
        jobTitle: job.title,
        applicantId: userId,
        timestamp: new Date()
      });

      // Global analytics update
      io.emit('analytics-update', {
        type: 'new_application',
        applicationId: application.id,
        jobId,
        companyId: job.companyId,
        studentId: userId,
        timestamp: new Date()
      });

      // Company-specific stats update
      io.to(`company-${job.companyId}`).emit('company-stats-update', {
        type: 'application_count_increase',
        companyId: job.companyId,
        applicationCount: 1,
        timestamp: new Date()
      });

      console.log('📡 Real-time events emitted successfully');
    } else {
      console.log('⚠️ Socket.IO not available');
    }

    res.status(201).json({
      message: 'Application submitted successfully',
      applications: {
        id: application.id,
        status: application.status,
        createdAt: application.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Error creating application:', error);
    res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
});

// Get student's applications
router.get('/student', authenticateToken, requireRole(['STUDENT']), async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }

    const applications = await prisma.applications.findMany({
      where: { studentId: userId },
      include: {
        jobs: {
          include: { company_profiles: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedApps = applications.map(app => ({
      id: app.id,
      status: app.status,
      coverLetter: app.coverLetter,
      customResume: app.customResume,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      jobs: {
        id: app.jobs.id,
        title: app.jobs.title,
        company: {
          id: app.jobs.company_profiles?.id,
          companyName: app.jobs.company_profiles?.companyName
        }
      }
    }));

    res.json(formattedApps);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get applications for job (Company only)
router.get('/:jobId', requireRole(['COMPANY']), async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const companyId = (req.user as any)?.companyId;

    if (!companyId) {
      return res.status(403).json({ message: 'Company access required' });
    }

    // Verify job belongs to company
    const job = await prisma.jobs.findFirst({
      where: { id: jobId, companyId }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found or access denied' });
    }

    const applications = await prisma.applications.findMany({
      where: { jobId },
      include: {
        users: {
          include: { student_profiles: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      jobs: {
        id: job.id,
        title: job.title
      },
      applications: applications.map(app => ({
        id: app.id,
        status: app.status,
        coverLetter: app.coverLetter,
        customResume: app.customResume,
        createdAt: app.createdAt,
        users: {
          id: app.users.id,
          email: app.users.email,
          profile: app.users.student_profiles ? {
            firstName: app.users.student_profiles.firstName,
            lastName: app.users.student_profiles.lastName,
            university: app.users.student_profiles.university,
            major: app.users.student_profiles.major,
            graduationYear: app.users.student_profiles.graduationYear,
            skills: app.users.student_profiles.skills
          } : null
        }
      }))
    });

  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Upload resume for specific application (by job ID)
router.post('/:jobId/resume', authenticateToken, requireRole(['STUDENT']), upload.single('resume'), async (req: Request, res: Response) => {
  try {
    console.log('📝 Resume upload by jobId - Headers:', req.headers);
    const { jobId } = req.params;
    const userId = req.user?.id;
    const file = req.file;

    console.log(`📁 Resume upload for jobId: ${jobId}, userId: ${userId}, file: ${file?.filename}`);

    if (!file) {
      return res.status(400).json({ message: 'Resume file is required' });
    }

    const application = await prisma.applications.findFirst({
      where: { studentId: userId, jobId }
    });

    if (!application) {
      console.log(`❌ Application not found for jobId: ${jobId}, userId: ${userId}`);
      return res.status(404).json({ message: 'Application not found' });
    }

    const relativePath = path.relative(process.cwd(), file.path);

    await prisma.applications.update({
      where: { id: application.id },
      data: { customResume: relativePath }
    });

    console.log(`✅ Resume uploaded successfully for application: ${application.id}`);
    res.json({
      message: 'Resume uploaded successfully',
      filename: file.filename
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Upload resume for specific application (by application ID)
router.post('/:applicationId/resume', authenticateToken, requireRole(['STUDENT']), upload.single('resume'), async (req: Request, res: Response) => {
  try {
    console.log('📝 Resume upload by applicationId - Headers:', req.headers);
    const { applicationId } = req.params;
    const userId = req.user?.id;
    const file = req.file;

    console.log(`📁 Resume upload for applicationId: ${applicationId}, userId: ${userId}, file: ${file?.filename}`);

    if (!file) {
      return res.status(400).json({ message: 'Resume file is required' });
    }

    const application = await prisma.applications.findFirst({
      where: { id: applicationId, studentId: userId }
    });

    if (!application) {
      console.log(`❌ Application not found for applicationId: ${applicationId}, userId: ${userId}`);
      return res.status(404).json({ message: 'Application not found' });
    }

    const relativePath = path.relative(process.cwd(), file.path);

    await prisma.applications.update({
      where: { id: application.id },
      data: { customResume: relativePath }
    });

    console.log(`✅ Resume uploaded successfully for application: ${application.id}`);
    res.json({
      message: 'Resume uploaded successfully',
      filename: file.filename
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update application status (Company only)
router.put('/:id/status', requireRole(['COMPANY']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const companyId = (req.user as any)?.companyId;

    if (!companyId) {
      return res.status(403).json({ message: 'Company access required' });
    }

    if (!['PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'ACCEPTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await prisma.applications.findFirst({
      where: {
        id,
        jobs: { companyId }
      },
      include: {
        jobs: { include: { company_profiles: true } }
      }
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found or access denied' });
    }

    const updatedApp = await prisma.applications.update({
      where: { id },
      data: { status }
    });

    // Real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${application.studentId}`).emit('application-status-update', {
        applicationId: id,
        jobTitle: application.jobs.title,
        companyName: application.jobs.company_profiles?.companyName,
        status,
        timestamp: new Date()
      });

      io.emit('analytics-update', {
        type: 'application_status_update',
        applicationId: id,
        status,
        jobId: application.jobId,
        companyId: application.jobs.companyId,
        studentId: application.studentId,
        timestamp: new Date()
      });

      // Company-specific stats refresh
      io.to(`company-${application.jobs.companyId}`).emit('refresh-company-stats', {
        companyId: application.jobs.companyId,
        timestamp: new Date()
      });
    }

    res.json({
      message: 'Application status updated successfully',
      applications: {
        id: updatedApp.id,
        status: updatedApp.status
      }
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;


