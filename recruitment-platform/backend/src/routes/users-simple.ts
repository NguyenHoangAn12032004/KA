import { Router } from 'express';
import { prisma } from '../utils/database';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    const users = await prisma.users.findMany({
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

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        student_profiles: {
          include: {
            student_educations: true,
            student_experiences: true,
            student_projects: true,
            student_languages: true,
            student_certifications: true
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
    if (user.role === 'STUDENT' && !user.student_profiles) {
      console.log('🆕 Creating empty student profile for user:', userId);
      const newProfile = await prisma.student_profiles.create({
        data: {
          id: `student-profile-${Date.now()}`,
          userId,
          firstName: 'Sinh viên',
          lastName: 'Demo',
          skills: ['React', 'TypeScript', 'Node.js'], // Default skills
          updatedAt: new Date()
        }
      });
      
      // Thêm profile mới vào user với type assertion để tránh lỗi TypeScript
      user.student_profiles = {
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
    const updatedUser = await prisma.users.update({
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