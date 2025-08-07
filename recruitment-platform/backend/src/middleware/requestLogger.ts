import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

// Extend Request interface to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
    }
  }
}

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Generate unique request ID
  req.requestId = uuidv4();
  req.startTime = Date.now();

  // Log incoming request
  logger.info('Incoming request', {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Override res.json to log responses
  const originalJson = res.json;
  res.json = function(body: any) {
    const responseTime = Date.now() - (req.startTime || 0);
    
    logger.info('Outgoing response', {
      requestId: req.requestId,
      statusCode: res.statusCode,
      responseTime,
      contentLength: JSON.stringify(body).length,
      timestamp: new Date().toISOString()
    });

    return originalJson.call(this, body);
  };

  // Log errors if response status >= 400
  res.on('finish', () => {
    const responseTime = Date.now() - (req.startTime || 0);
    
    if (res.statusCode >= 400) {
      logger.warn('Request completed with error', {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime,
        ip: req.ip
      });
    }
  });

  next();
};

export const performanceLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const time = diff[0] * 1e3 + diff[1] * 1e-6; // Convert to milliseconds

    // Log slow requests (> 1000ms)
    if (time > 1000) {
      logger.warn('Slow request detected', {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        responseTime: time,
        statusCode: res.statusCode
      });
    }

    // Log performance metrics
    logger.debug('Request performance', {
      requestId: req.requestId,
      responseTime: time,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    });
  });

  next();
};
