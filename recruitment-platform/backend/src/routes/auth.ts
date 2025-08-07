import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';
import { generateToken } from '../utils/jwt';
import { authenticateToken } from '../middleware/auth';

// AuthRequest interface
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    companyId?: string;
  };
}

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role, firstName, lastName, companyName } = req.body;

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.users.create({
      data: {
        id: `user-${Date.now()}`,
        email,
        password: hashedPassword,
        role,
        updatedAt: new Date(),
        student_profiles: role === 'STUDENT' ? {
          create: {
            id: `student-${Date.now()}`,
            firstName,
            lastName,
            updatedAt: new Date()
          }
        } : undefined,
        company_profiles: role === 'COMPANY' ? {
          create: {
            id: `comp-${Date.now()}`,
            companyName,
            updatedAt: new Date()
          }
        } : undefined
      },
      include: {
        student_profiles: true,
        company_profiles: true
      }
    });

    // Generate JWT token
    const token = generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    console.log('🔍 Login attempt for email:', email);

    // Find user (no include) for password check and update
    const user = await prisma.users.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ Login failed: User not found');
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('❌ Login failed: Invalid password');
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Update last login
    await prisma.users.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Fetch user with profiles for response
    const userWithProfiles = await prisma.users.findUnique({
      where: { email },
      include: {
        student_profiles: true,
        company_profiles: true
      }
    });

    // Generate JWT token
    const token = generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = userWithProfiles || user;
    
    console.log('✅ Login successful for user:', email);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    console.error('❌ Login server error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    // Get full user data with company profile
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      include: {
        company_profiles: true,
        student_profiles: true
      }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        company_profiles: user.company_profiles,
        studentProfile: user.student_profiles,
        companyId: user.company_profiles?.id
      }
    });
  } catch (error) {
    console.error('❌ Error getting current user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
