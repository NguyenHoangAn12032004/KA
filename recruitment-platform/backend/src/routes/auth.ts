import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';
import { generateToken } from '../utils/jwt';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role, firstName, lastName, companyName } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
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
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        studentProfile: role === 'STUDENT' ? {
          create: {
            firstName,
            lastName
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
        studentProfile: true,
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
    const user = await prisma.user.findUnique({
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
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Fetch user with profiles for response
    const userWithProfiles = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
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
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    // This will be implemented with auth middleware
    res.json({
      success: true,
      message: 'Auth middleware needed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
