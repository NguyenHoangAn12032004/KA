import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.log('🔒 No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  // Log token details for debugging
  console.log('🔍 Raw auth header:', authHeader);
  console.log('🔍 Extracted token (first 20 chars):', token.substring(0, 20) + '...');

  try {
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    
    // Validate token format before verification
    if (!token || token === 'null' || token === 'undefined' || token.trim().length === 0) {
      console.log('❌ Invalid token format:', token);
      return res.status(403).json({ error: 'Invalid token format' });
    }
    
    const cleanToken = token.trim();
    const decoded = jwt.verify(cleanToken, jwtSecret) as any;
    
    console.log('🔓 Token decoded:', decoded);
    console.log('🔓 Token verified for user:', decoded.userId || decoded.id);
    req.user = {
      id: decoded.userId || decoded.id, // Support both userId and id fields
      email: decoded.email,
      role: decoded.role
    };
    
    console.log('👤 User set in request:', req.user);
    
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
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};
