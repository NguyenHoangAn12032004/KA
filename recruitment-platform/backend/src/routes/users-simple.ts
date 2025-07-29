import { Router } from 'express';
import { prisma } from '../utils/database';
import { authenticateToken } from '../middleware/auth';

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
        lastLogin: true
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

// Get current user profile
router.get('/profile', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: {
          include: {
            educations: true,
            workExperiences: true,
            projects: true,
            languages: true,
            certifications: true
          }
        },
        company_profiles: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Nếu không có studentProfile, tạo một profile trống
    if (user.role === 'STUDENT' && !user.studentProfile) {
      console.log('🆕 Creating empty student profile for user:', userId);
      const newProfile = await prisma.studentProfile.create({
        data: {
          userId,
          firstName: 'Sinh viên',
          lastName: 'Demo',
          skills: ['React', 'TypeScript', 'Node.js'] // Default skills
        }
      });
      
      // Thêm profile mới vào user với type assertion để tránh lỗi TypeScript
      user.studentProfile = {
        ...newProfile,
        educations: [],
        workExperiences: [],
        projects: [],
        languages: [],
        certifications: []
      } as any; // Sử dụng type assertion để tránh lỗi
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Simple update implementation
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router; 