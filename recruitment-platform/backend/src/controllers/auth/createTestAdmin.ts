import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test endpoint để tạo admin user
// POST /api/auth/create-admin
export const createTestAdmin = async (req: Request, res: Response) => {
  try {
    // Chỉ cho phép trong development environment
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        message: 'Admin creation endpoint only available in development mode'
      });
    }

    const { email = 'admin@recruitment.com', password = 'Admin123!@#' } = req.body;

    // Check if admin already exists
    const existingAdmin = await prisma.users.findFirst({
      where: { 
        role: 'ADMIN',
        email
      }
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin user already exists',
        user: {
          id: existingAdmin.id,
          email: existingAdmin.email,
          role: existingAdmin.role
        }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const adminUser = await prisma.users.create({
      data: {
        id: uuidv4(),
        email,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        isVerified: true,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      user: adminUser,
      credentials: {
        email,
        password // Only show in development
      }
    });

  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
