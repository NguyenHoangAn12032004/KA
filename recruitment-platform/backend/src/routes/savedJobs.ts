import { Router } from 'express';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Get saved jobs for authenticated user
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    
    console.log('🔍 Getting saved jobs for user:', userId);
    
    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }
    
    const savedJobs = await prisma.savedJob.findMany({
      where: {
        userId: userId  // Use authenticated user ID
      },
      include: {
        job: {
          include: {
            company_profiles: {
              select: {
                companyName: true,
                logo: true,
                city: true,
                industry: true
              }
            }
          }
        }
      },
      orderBy: {
        savedAt: 'desc'
      }
    });

    console.log('✅ Found saved jobs for user:', savedJobs.length);
    res.json({ success: true, data: savedJobs });
  } catch (error) {
    console.error('❌ Error getting saved jobs:', error);
    res.status(500).json({ error: 'Failed to get saved jobs', details: String(error) });
  }
});

// Save a job for authenticated user
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { jobId } = req.body;
    const userId = (req as AuthRequest).user?.id;
    
    console.log('💾 Saving job:', { jobId, userId });
    
    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }
    
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }
    
    // Check if already saved
    const existingSave = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: userId,  // Use authenticated user ID
          jobId: jobId
        }
      }
    });
    
    if (existingSave) {
      return res.status(400).json({ error: 'Job already saved' });
    }
    
    const savedJob = await prisma.savedJob.create({
      data: {
        userId: userId,  // Use authenticated user ID
        jobId: jobId
      },
      include: {
        job: {
          include: {
            company_profiles: {
              select: {
                companyName: true,
                logo: true,
                city: true,
                industry: true
              }
            }
          }
        }
      }
    });

    console.log('✅ Job saved successfully for user:', userId);
    res.status(201).json({ success: true, data: savedJob });
  } catch (error) {
    console.error('❌ Error saving job:', error);
    res.status(500).json({ error: 'Failed to save job', details: String(error) });
  }
});

// Remove saved job for authenticated user
router.delete('/:jobId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const userId = (req as AuthRequest).user?.id;
    
    console.log('🗑️ Removing saved job:', { jobId, userId });
    
    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }
    
    const deletedSave = await prisma.savedJob.delete({
      where: {
        userId_jobId: {
          userId: userId,  // Use authenticated user ID
          jobId: jobId
        }
      }
    });

    console.log('✅ Saved job removed successfully for user:', userId);
    res.json({ success: true, message: 'Job removed from saved list' });
  } catch (error: any) {
    console.error('❌ Error removing saved job:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Saved job not found' });
    }
    res.status(500).json({ error: 'Failed to remove saved job', details: String(error) });
  }
});

// Check if job is saved by authenticated user
router.get('/check/:jobId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const userId = (req as AuthRequest).user?.id;
    
    console.log('🔍 Checking if job is saved:', { jobId, userId });
    
    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }
    
    const savedJob = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: userId,  // Use authenticated user ID
          jobId: jobId
        }
      }
    });

    console.log('✅ Job saved status for user:', { jobId, userId, isSaved: !!savedJob });
    res.json({ success: true, isSaved: !!savedJob });
  } catch (error) {
    console.error('❌ Error checking saved job:', error);
    res.status(500).json({ error: 'Failed to check saved job', details: String(error) });
  }
});

export default router;
