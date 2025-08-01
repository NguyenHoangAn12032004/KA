import { Router } from 'express';
import { prisma } from '../utils/database';
import { authenticateToken } from '../middleware/auth';
import { Request, Response } from 'express';

// Create the router
const router = Router();

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        lastLogin: true,
        studentProfile: {
          select: {
            firstName: true,
            lastName: true,
            university: true,
            major: true
          }
        },
        company_profiles: {
          select: {
            companyName: true,
            industry: true,
            companySize: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get user by ID (for candidate profiles)
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    console.log('[GET] Fetching user profile for ID:', id);
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        studentProfile: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
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
            educations: true,
            workExperiences: true,
            languages: true,
            certifications: true,
            projects: true
          }
        },
        company_profiles: {
          select: {
            companyName: true,
            industry: true,
            companySize: true,
            description: true,
            website: true,
            logo: true
          }
        }
      }
    });
    
    if (!user) {
      console.log('[GET] User not found:', id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('[GET] User found:', user.email, '- Role:', user.role);
    
    res.json({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error('[GET] Error fetching user by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Delete user (admin action)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('[DELETE] Attempting to delete user with ID: ' + id);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      console.log('[DELETE] User not found: ' + id);
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    console.log('[DELETE] User found: ' + user.email + ' (' + user.role + ')');

    // Delete associated profiles first
    if (user.role === 'STUDENT') {
      const deletedProfiles = await prisma.studentProfile.deleteMany({
        where: { userId: id }
      });
      console.log('[DELETE] Deleted ' + deletedProfiles.count + ' student profiles');
    } else if (user.role === 'COMPANY') {
      const deletedProfiles = await prisma.company_profiles.deleteMany({
        where: { userId: id }
      });
      console.log('[DELETE] Deleted ' + deletedProfiles.count + ' company profiles');
    }

    // Delete the user
    await prisma.user.delete({
      where: { id }
    });

    console.log('[DELETE] Successfully deleted user: ' + id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
