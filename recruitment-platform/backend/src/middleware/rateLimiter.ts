import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { cacheService } from '../services/cacheService';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

class AdvancedRateLimiter {
  // Different limits for different endpoint types
  static configs = {
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: process.env.NODE_ENV === 'development' ? 1000 : 20, // High limit for development
      message: 'Too many login attempts, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    },
    api: {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 60, // limit each IP to 60 API requests per minute
      message: 'API rate limit exceeded, please slow down.',
      standardHeaders: true,
      legacyHeaders: false,
    },
    upload: {
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 10, // limit file uploads
      message: 'Too many file uploads, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    },
    search: {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 30, // limit search requests
      message: 'Too many search requests, please slow down.',
      standardHeaders: true,
      legacyHeaders: false,
    }
  };

  // Create custom rate limiter with Redis store
  static createLimiter(type: keyof typeof AdvancedRateLimiter.configs): RateLimitRequestHandler {
    const config = this.configs[type];

    return rateLimit({
      ...config,
      // Custom key generator that includes user ID for authenticated requests
      keyGenerator: (req: Request) => {
        const userKey = (req as any).user?.id || 'anonymous';
        return `${req.ip}:${userKey}`;
      },
      
      // Custom handler for rate limit exceeded
      handler: (req: Request, res: Response) => {
        const userInfo = (req as any).user?.id ? `User: ${(req as any).user.id}` : 'Anonymous';
        
        logger.warn('Rate limit exceeded', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path,
          method: req.method,
          user: userInfo,
          type: type
        });

        res.status(429).json({
          success: false,
          error: config.message,
          retryAfter: Math.ceil(config.windowMs / 1000),
          type: 'RATE_LIMIT_EXCEEDED'
        });
      },

      // Skip rate limiting for whitelisted IPs (if any)
      skip: (req: Request) => {
        const whitelistedIPs = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
        return whitelistedIPs.includes(req.ip);
      },

      // Standard headers for rate limit info
      standardHeaders: true,
      legacyHeaders: false,
    });
  }

  // Progressive rate limiting - increases restrictions for repeat offenders
  static createProgressiveLimiter() {
    return async (req: Request, res: Response, next: any) => {
      const clientKey = `progressive:${req.ip}`;
      
      try {
        const attempts = await cacheService.get<number>(clientKey) || 0;
        
        let maxRequests = 100; // Base limit
        let windowMs = 15 * 60 * 1000; // 15 minutes
        
        // Increase restrictions based on previous violations
        if (attempts > 0) {
          maxRequests = Math.max(10, 100 - (attempts * 20));
          windowMs = Math.min(60 * 60 * 1000, windowMs + (attempts * 5 * 60 * 1000));
        }

        // Create dynamic rate limiter
        const dynamicLimiter = rateLimit({
          windowMs,
          max: maxRequests,
          keyGenerator: () => req.ip,
          handler: async (req: Request, res: Response) => {
            // Increment violation counter
            await cacheService.increment(clientKey, 1);
            await cacheService.setWithExpiry(clientKey, attempts + 1, 24 * 60 * 60); // 24 hours

            logger.warn('Progressive rate limit exceeded', {
              ip: req.ip,
              attempts: attempts + 1,
              maxRequests,
              windowMs
            });

            res.status(429).json({
              success: false,
              error: 'Rate limit exceeded. Repeated violations will result in longer restrictions.',
              retryAfter: Math.ceil(windowMs / 1000),
              violationCount: attempts + 1
            });
          }
        });

        dynamicLimiter(req, res, next);
      } catch (error) {
        logger.error('Progressive rate limiter error', { error: error instanceof Error ? error.message : 'Unknown error' });
        next();
      }
    };
  }

  // Endpoint-specific rate limiting
  static authLimiter = this.createLimiter('auth');
  static apiLimiter = this.createLimiter('api');
  static generalLimiter = this.createLimiter('general');
  static uploadLimiter = this.createLimiter('upload');
  static searchLimiter = this.createLimiter('search');
  static progressiveLimiter = this.createProgressiveLimiter();
}

// IP-based blocking for severe violations
export const createIPBlocker = () => {
  const blockedIPs = new Set<string>();
  
  return {
    middleware: (req: Request, res: Response, next: any) => {
      if (blockedIPs.has(req.ip)) {
        logger.warn('Blocked IP attempted access', { ip: req.ip });
        return res.status(403).json({
          success: false,
          error: 'Access denied. IP address has been blocked.',
          type: 'IP_BLOCKED'
        });
      }
      next();
    },
    
    blockIP: (ip: string, duration?: number) => {
      blockedIPs.add(ip);
      logger.warn('IP address blocked', { ip, duration });
      
      if (duration) {
        setTimeout(() => {
          blockedIPs.delete(ip);
          logger.info('IP address unblocked', { ip });
        }, duration);
      }
    },
    
    unblockIP: (ip: string) => {
      blockedIPs.delete(ip);
      logger.info('IP address manually unblocked', { ip });
    },
    
    getBlockedIPs: () => Array.from(blockedIPs)
  };
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: any) => {
  // Set security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  });
  
  // Remove potentially revealing headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  next();
};

export default AdvancedRateLimiter;
