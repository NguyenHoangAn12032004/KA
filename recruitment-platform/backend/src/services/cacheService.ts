import Redis, { RedisOptions } from 'ioredis';
import { logger } from '../utils/logger';

class CacheService {
  private redis: Redis | null = null;
  private isConnected: boolean = false;
  private isEnabled: boolean = true;

  constructor() {
    // Check if Redis is enabled
    this.isEnabled = process.env.ENABLE_CACHING !== 'false';
    
    if (!this.isEnabled) {
      logger.info('Caching disabled via ENABLE_CACHING environment variable');
      return;
    }

    const redisConfig: RedisOptions = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      family: 4,
      connectTimeout: 10000,
      commandTimeout: 5000,
    };

    try {
      this.redis = new Redis(redisConfig);
      this.setupEventHandlers();
    } catch (error) {
      logger.warn('Failed to initialize Redis, caching will be disabled', { error: error instanceof Error ? error.message : 'Unknown error' });
      this.isEnabled = false;
      this.redis = null;
    }
  }

  private setupEventHandlers(): void {
    if (!this.redis) return;
    
    this.redis.on('connect', () => {
      this.isConnected = true;
      logger.info('Redis connected successfully');
    });

    this.redis.on('ready', () => {
      logger.info('Redis ready for commands');
    });

    this.redis.on('error', (error) => {
      this.isConnected = false;
      logger.warn('Redis connection error, caching disabled', { error: error.message });
    });

    this.redis.on('close', () => {
      this.isConnected = false;
      logger.warn('Redis connection closed');
    });

    this.redis.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
    });
  }

  async connect(): Promise<void> {
    if (!this.isEnabled || !this.redis) {
      logger.info('Cache service disabled or not configured');
      return;
    }

    try {
      await this.redis.connect();
      this.isConnected = true;
      logger.info('Redis cache service initialized');
    } catch (error) {
      this.isConnected = false;
      this.isEnabled = false;
      logger.warn('Failed to connect to Redis, continuing without cache', { error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async get<T = string>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected || !this.redis) {
        return null;
      }

      const value = await this.redis.get(key);
      if (value === null) {
        return null;
      }

      // Try to parse JSON, fallback to string
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      logger.warn('Cache get error, continuing without cache', { key, error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      if (!this.isConnected || !this.redis) {
        return false;
      }

      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }

      return true;
    } catch (error) {
      logger.warn('Cache set error, continuing without cache', { key, error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      if (!this.isConnected || !this.redis) {
        return false;
      }

      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      logger.warn('Cache delete error', { key, error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (!this.isConnected || !this.redis) {
        return false;
      }

      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.warn('Cache exists error', { key, error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }

  async setWithExpiry(key: string, value: any, ttlSeconds: number): Promise<boolean> {
    return this.set(key, value, ttlSeconds);
  }

  async increment(key: string, value: number = 1): Promise<number | null> {
    try {
      if (!this.isConnected || !this.redis) {
        return null;
      }

      return await this.redis.incrby(key, value);
    } catch (error) {
      logger.warn('Cache increment error', { key, error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  }

  async getMultiple<T = string>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (!this.isConnected || !this.redis || keys.length === 0) {
        return keys.map(() => null);
      }

      const values = await this.redis.mget(...keys);
      return values.map(value => {
        if (value === null) return null;
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as unknown as T;
        }
      });
    } catch (error) {
      logger.warn('Cache getMultiple error', { keys, error: error instanceof Error ? error.message : 'Unknown error' });
      return keys.map(() => null);
    }
  }

  async setMultiple(keyValuePairs: Record<string, any>, ttlSeconds?: number): Promise<boolean> {
    try {
      if (!this.isConnected || !this.redis) {
        return false;
      }

      const pipeline = this.redis.pipeline();
      
      for (const [key, value] of Object.entries(keyValuePairs)) {
        const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
        
        if (ttlSeconds) {
          pipeline.setex(key, ttlSeconds, serializedValue);
        } else {
          pipeline.set(key, serializedValue);
        }
      }

      await pipeline.exec();
      return true;
    } catch (error) {
      logger.warn('Cache setMultiple error', { error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }

  async flush(): Promise<boolean> {
    try {
      if (!this.isConnected || !this.redis) {
        return false;
      }

      await this.redis.flushdb();
      return true;
    } catch (error) {
      logger.warn('Cache flush error', { error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.quit();
      }
      this.isConnected = false;
      logger.info('Cache service disconnected');
    } catch (error) {
      logger.warn('Error disconnecting cache service', { error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  isHealthy(): boolean {
    return this.isEnabled && this.isConnected;
  }

  // Cache key helpers
  static keys = {
    job: (id: string) => `job:${id}`,
    jobs: (page: number, filters?: string) => `jobs:page:${page}:${filters || 'all'}`,
    user: (id: string) => `user:${id}`,
    company: (id: string) => `company:${id}`,
    analytics: (type: string, date: string) => `analytics:${type}:${date}`,
    search: (query: string, filters: string) => `search:${Buffer.from(query + filters).toString('base64')}`,
  };
}

// Create singleton instance
export const cacheService = new CacheService();

// Cache middleware for Express routes
export const cacheMiddleware = (ttlSeconds: number = 300) => {
  return async (req: any, res: any, next: any) => {
    // Skip cache for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL and query params
    const cacheKey = `route:${req.originalUrl}`;
    
    try {
      const cachedData = await cacheService.get(cacheKey);
      
      if (cachedData) {
        logger.debug('Cache hit', { cacheKey });
        return res.json(cachedData);
      }

      // Store original res.json
      const originalJson = res.json;
      
      // Override res.json to cache the response
      res.json = function(body: any) {
        // Cache successful responses only
        if (res.statusCode === 200) {
          cacheService.set(cacheKey, body, ttlSeconds);
          logger.debug('Response cached', { cacheKey, ttl: ttlSeconds });
        }
        
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error', { error: error instanceof Error ? error.message : 'Unknown error' });
      next();
    }
  };
};

export default cacheService;
