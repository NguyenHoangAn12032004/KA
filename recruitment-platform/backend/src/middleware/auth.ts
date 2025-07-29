import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    companyId?: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('🔒 No token provided');
      return res.status(401).json({ error: 'Access token required' });
    }

    // Log token details for debugging
    console.log('🔍 Raw auth header:', authHeader);
    console.log('🔍 Extracted token (first 20 chars):', token.substring(0, 20) + '...');

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    
    // Validate token format before verification
    if (!token || token === 'null' || token === 'undefined' || token.trim().length === 0) {
      console.log('❌ Invalid token format:', token);
      return res.status(403).json({ error: 'Invalid token format' });
    }
    
    const cleanToken = token.trim();
    const decoded = jwt.verify(cleanToken, jwtSecret) as any;
    
    console.log('🔓 Token decoded:', decoded);

    // Get user ID from token
    const userId = decoded.userId || decoded.id;
    if (!userId) {
      console.log('❌ No user ID in token');
      return res.status(403).json({ error: 'Invalid token: no user ID' });
    }

    // Get user from database with company profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company_profiles: true
      }
    });

    if (!user) {
      console.log('❌ User not found:', userId);
      return res.status(403).json({ error: 'User not found' });
    }
    
    // Log the user data for debugging
    console.log('📊 User from database:', JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      company_profiles: user.company_profiles 
    }, null, 2));

    // Set user data in request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.company_profiles?.id
    };

    console.log('👤 User set in request:', {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      companyId: req.user.companyId
    });
    
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }

    // For company routes, ensure companyId exists
    if ((roles.includes('COMPANY') || roles.includes('HR_MANAGER')) && !req.user.companyId) {
      console.log('❌ Company ID required but not found for user:', req.user);
      return res.status(403).json({ 
        error: 'Company profile required',
        user: {
          id: req.user.id,
          role: req.user.role
        }
      });
    }

    next();
  };
};
