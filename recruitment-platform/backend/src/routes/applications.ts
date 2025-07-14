import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all applications for authenticated user
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    console.log('📋 Getting applications for user:', userId);

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    const applications = await prisma.application.findMany({
      where: {
        studentId: userId  // Filter by authenticated user ID
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

    console.log('📋 Found applications for user:', applications.length);

    // Transform data to match frontend interface
    const transformedApplications = applications.map(app => ({
      id: app.id,
      jobId: app.jobId,
      jobTitle: app.job.title,
      companyName: app.job.company_profiles.companyName,
      status: app.status,
      appliedAt: app.appliedAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      coverLetter: app.coverLetter,
      hrNotes: app.hrNotes,
      rating: app.rating
    }));

    res.json(transformedApplications);
  } catch (error) {
    console.error('❌ Error getting applications:', error);
    res.status(500).json({ error: 'Failed to get applications' });
  }
});

// Create new application 
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { jobId, coverLetter } = req.body;
    const userId = (req as any).user?.id;
    
    console.log('📤 Received application request:', { jobId, userId, coverLetter: coverLetter?.substring(0, 50) });
    
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    // First, check if the job exists
    console.log('🔍 Checking if job exists:', jobId);
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company_profiles: true
      }
    });

    if (!job) {
      console.log('❌ Job not found:', jobId);
      return res.status(404).json({ error: 'Job not found' });
    }

    console.log('✅ Job found:', job.title);

    // Check if this user already applied for this job
    console.log('🔍 Checking for existing application...');
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId,
        studentId: userId  // Use actual user ID
      }
    });

    if (existingApplication) {
      console.log('❌ User already applied for this job');
      return res.status(409).json({ error: 'You have already applied for this job' });
    }

    // Create the application
    console.log('📝 Creating new application...');
    const application = await prisma.application.create({
      data: {
        jobId,
        studentId: userId,  // Use actual user ID instead of hardcoded
        coverLetter: coverLetter || '',
        status: 'PENDING'
      }
    });

    console.log('✅ Application created:', application.id);

    // Transform response
    const response = {
      id: application.id,
      jobId: application.jobId,
      jobTitle: job.title,
      companyName: job.company_profiles.companyName,
      status: application.status,
      appliedAt: application.appliedAt.toISOString(),
      coverLetter: application.coverLetter
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('❌ Detailed error creating application:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('❌ Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('❌ Error message:', error instanceof Error ? error.message : String(error));
    res.status(500).json({ error: 'Failed to create application', details: error instanceof Error ? error.message : String(error) });
  }
});

// Create current user from token if not exists
router.post('/setup-current-user', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    console.log('🧪 Setting up current user from token:', userId);
    
    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!existingUser) {
      // Create user with ID from token
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          email: 'current@student.com', // Temporary email
          password: 'temp123',
          role: 'STUDENT',
          isActive: true,
          isVerified: true
        }
      });
      console.log('✅ Current user created:', newUser.id);
      
      // Also create student profile
      const studentProfile = await prisma.studentProfile.create({
        data: {
          userId: userId,
          firstName: 'Current',
          lastName: 'Student',
          phone: '0123456789',
          dateOfBirth: new Date('1995-01-01'),
          university: 'Test University',
          major: 'Computer Science',
          gpa: 3.5,
          graduationYear: 2020
        }
      });
      console.log('✅ Student profile created:', studentProfile.id);
      
      res.json({ success: true, message: 'Current user and profile created', userId: userId });
    } else {
      console.log('✅ Current user already exists');
      res.json({ success: true, message: 'Current user already exists', userId: userId });
    }
  } catch (error) {
    console.error('❌ Error setting up current user:', error);
    res.status(500).json({ error: String(error) });
  }
});

// Quick fix: Create current user - GET version for easy testing
router.get('/fix-user', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    console.log('🔧 Quick fix: Creating user from token:', userId);
    
    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!existingUser) {
      // Create user with ID from token
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          email: `user-${userId.slice(0,8)}@student.com`,
          password: 'temp123',
          role: 'STUDENT',
          isActive: true,
          isVerified: true
        }
      });
      console.log('✅ User created:', newUser.id);
      
      // Also create student profile
      const studentProfile = await prisma.studentProfile.create({
        data: {
          userId: userId,
          firstName: 'Student',
          lastName: 'User',
          university: 'Test University',
          major: 'Computer Science',
          graduationYear: 2020
        }
      });
      console.log('✅ Student profile created');
      
      res.json({ success: true, message: 'User and profile created successfully', userId: userId });
    } else {
      res.json({ success: true, message: 'User already exists', userId: userId });
    }
  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({ error: String(error) });
  }
});

export default router;
