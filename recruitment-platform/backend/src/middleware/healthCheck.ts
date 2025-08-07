import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import os from 'os';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: ServiceHealth;
    redis?: ServiceHealth;
    memory: ServiceHealth;
    disk: ServiceHealth;
  };
  metrics: {
    memoryUsage: NodeJS.MemoryUsage;
    cpuLoad: number[];
    activeConnections: number;
  };
}

interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastCheck: string;
  details?: string;
}

class HealthCheckService {
  private prisma: any;
  private redis?: any;

  constructor(prisma: any, redis?: any) {
    this.prisma = prisma;
    this.redis = redis;
  }

  async checkDatabase(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;
      
      return {
        status: responseTime < 1000 ? 'up' : 'degraded',
        responseTime,
        lastCheck: new Date().toISOString(),
        details: `Query executed in ${responseTime}ms`
      };
    } catch (error) {
      logger.error('Database health check failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      return {
        status: 'down',
        responseTime: Date.now() - start,
        lastCheck: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async checkRedis(): Promise<ServiceHealth | undefined> {
    if (!this.redis) return undefined;

    const start = Date.now();
    try {
      await this.redis.ping();
      const responseTime = Date.now() - start;
      
      return {
        status: responseTime < 500 ? 'up' : 'degraded',
        responseTime,
        lastCheck: new Date().toISOString(),
        details: `Ping responded in ${responseTime}ms`
      };
    } catch (error) {
      logger.error('Redis health check failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      return {
        status: 'down',
        responseTime: Date.now() - start,
        lastCheck: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  checkMemory(): ServiceHealth {
    const memoryUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemoryPercent = ((totalMemory - freeMemory) / totalMemory) * 100;

    return {
      status: usedMemoryPercent < 80 ? 'up' : usedMemoryPercent < 90 ? 'degraded' : 'down',
      lastCheck: new Date().toISOString(),
      details: `Memory usage: ${usedMemoryPercent.toFixed(2)}%`
    };
  }

  checkDisk(): ServiceHealth {
    // Simplified disk check - in production, use a proper disk space library
    const tmpDir = os.tmpdir();
    
    return {
      status: 'up', // Placeholder - implement actual disk space check
      lastCheck: new Date().toISOString(),
      details: `Temp directory: ${tmpDir}`
    };
  }

  async getHealthStatus(): Promise<HealthStatus> {
    const [database, redis] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis()
    ]);

    const memory = this.checkMemory();
    const disk = this.checkDisk();

    const services = {
      database,
      ...(redis && { redis }),
      memory,
      disk
    };

    // Determine overall status
    const serviceStatuses = Object.values(services);
    const hasDown = serviceStatuses.some(s => s.status === 'down');
    const hasDegraded = serviceStatuses.some(s => s.status === 'degraded');
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (hasDown) {
      overallStatus = 'unhealthy';
    } else if (hasDegraded) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services,
      metrics: {
        memoryUsage: process.memoryUsage(),
        cpuLoad: os.loadavg(),
        activeConnections: 0 // TODO: Track actual connections
      }
    };
  }
}

export const createHealthCheckEndpoint = (prisma: any, redis?: any) => {
  const healthService = new HealthCheckService(prisma, redis);

  return async (req: Request, res: Response) => {
    try {
      const healthStatus = await healthService.getHealthStatus();
      
      // Set appropriate HTTP status
      const httpStatus = healthStatus.status === 'healthy' ? 200 : 
                        healthStatus.status === 'degraded' ? 200 : 503;

      res.status(httpStatus).json(healthStatus);
    } catch (error) {
      logger.error('Health check endpoint error', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      });
    }
  };
};

// Simple metrics endpoint
export const createMetricsEndpoint = () => {
  return (req: Request, res: Response) => {
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      pid: process.pid
    };

    res.json(metrics);
  };
};
