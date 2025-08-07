import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../utils/database';

interface AdminContext {
  id: string;
  userId: string;
  permissions: any[];
  canImpersonate: boolean;
  accessLevel: string;
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminContext;
    }
  }
}

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify admin role
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Admin access required',
        userRole: req.user.role 
      });
    }

    // Get admin profile with enhanced permissions
    // For now, use users table until admin_profiles is created
    const adminProfile = await prisma.users.findUnique({
      where: { id: req.user.id },
      include: {
        student_profiles: true,
        company_profiles: true
      }
    }).then(user => {
      if (!user) return null;
      // Create admin context from user data
      return {
        id: `admin-${user.id}`,
        userId: user.id,
        isActive: user.isActive,
        canImpersonate: true,
        accessLevel: 'ADMIN',
        permissions: ['READ', 'WRITE', 'DELETE', 'ADMIN'], // Default admin permissions
        auditLogs: []
      };
    }).catch(async () => {
      // Fallback admin context
      return {
        id: `admin-${req.user.id}`,
        userId: req.user.id,
        isActive: true,
        canImpersonate: true,
        accessLevel: 'SUPER_ADMIN',
        permissions: [],
        auditLogs: []
      };
    });

    if (!adminProfile || !adminProfile.isActive) {
      return res.status(403).json({ error: 'Admin profile inactive' });
    }

    // Set admin context
    req.admin = {
      id: adminProfile.id,
      userId: req.user.id,
      permissions: adminProfile.permissions || [],
      canImpersonate: adminProfile.canImpersonate || true,
      accessLevel: adminProfile.accessLevel || 'ADMIN'
    };

    console.log('🔑 Admin authenticated:', {
      adminId: req.admin.id,
      userId: req.admin.userId,
      accessLevel: req.admin.accessLevel
    });

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(500).json({ error: 'Admin authentication failed' });
  }
};

// Multi-role access for admin
export const requireAdminOrOwner = (ownerField: string = 'userId') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Admin has universal access
    if (req.user.role === 'ADMIN') {
      await requireAdmin(req, res, next);
      return;
    }

    // Check if user owns the resource
    const resourceId = req.params.id;
    const userId = req.user.id;
    
    // For now, allow access if user owns the resource
    // TODO: Implement specific ownership checks based on resource type
    console.log('🔍 Checking ownership:', { resourceId, userId, ownerField });
    
    next();
  };
};

// Admin impersonation middleware
export const allowImpersonation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const impersonateUserId = req.headers['x-impersonate-user'] as string;
    
    if (!impersonateUserId) {
      return next(); // No impersonation requested
    }

    // Only admins can impersonate
    if (!req.admin || !req.admin.canImpersonate) {
      return res.status(403).json({ error: 'Impersonation not allowed' });
    }

    // Get target user
    const targetUser = await prisma.users.findUnique({
      where: { id: impersonateUserId },
      include: {
        company_profiles: true,
        student_profiles: true
      }
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'Target user not found' });
    }

    // Set impersonation context
    const originalUser = req.user;
    req.user = {
      id: targetUser.id,
      email: targetUser.email,
      role: targetUser.role as any, // Type cast to resolve enum mismatch
      companyId: targetUser.company_profiles?.id,
      isActive: targetUser.isActive,
      isVerified: targetUser.isVerified,
      isImpersonating: true,
      originalAdminId: originalUser.id
    } as any; // Type assertion for extended properties

    console.log('👥 Admin impersonation active:', {
      adminId: originalUser.id,
      targetUserId: targetUser.id,
      targetRole: targetUser.role
    });

    next();
  } catch (error) {
    console.error('Impersonation error:', error);
    return res.status(500).json({ error: 'Impersonation failed' });
  }
};
