import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Import routes
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
//import usersEnhancedRoutes from './routes/users-enhanced';
import usersSimpleRoutes from './routes/users-simple';
import jobsRoutes from './routes/jobs';
import companiesRoutes from './routes/companies';
import applicationsRoutes from './routes/applications';
import uploadRoutes from './routes/upload';
import savedJobsRoutes from './routes/savedJobs'; // Temporarily disabled
import analyticsRoutes from './routes/analytics-simple';
import studentDashboardRoutes from './routes/studentDashboard'; // Temporarily disabled
import companyDashboardRoutes from './routes/companyDashboard';
import notificationsRoutes from './routes/notifications';
import adminRoutes from './routes/admin';
import aiRoutes from './routes/ai'; // New AI routes

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { requestLogger, performanceLogger } from './middleware/requestLogger';
import { createHealthCheckEndpoint, createMetricsEndpoint } from './middleware/healthCheck';
import AdvancedRateLimiter, { securityHeaders } from './middleware/rateLimiter';
import { logger } from './utils/logger';
import { prisma } from './utils/database';

// Import services
import { initializeSocket } from './services/socketService';
import { cacheService } from './services/cacheService';

// Load environment variables
dotenv.config();

console.log('🔧 Starting server initialization...');

// Initialize services
async function initializeServices() {
  try {
    // Initialize cache service
    await cacheService.connect();
    logger.info('✅ Cache service initialized');
  } catch (error) {
    logger.warn('⚠️ Cache service failed to initialize, continuing without cache', { error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

const app = express();

// Create HTTP server
const server = createServer(app);

console.log('✅ Express app created');

// CORS configuration - Apply before other middleware
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
app.use(cors({
  origin: corsOrigin, // Use environment variable or default
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Pragma', 'Expires', 'Last-Modified', 'ETag', 'If-Modified-Since', 'If-None-Match']
}));

// Handle OPTIONS preflight requests
app.options('*', cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Pragma', 'Expires', 'Last-Modified', 'ETag', 'If-Modified-Since', 'If-None-Match']
}));

// Enhanced Middleware Setup
console.log('🔧 Setting up enhanced middleware...');

// Security headers (apply early)
app.use(securityHeaders);

// Request logging and performance monitoring
app.use(requestLogger);
app.use(performanceLogger);

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: corsOrigin, // Use environment variable or default
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify JWT token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
        // Get user from database
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return next(new Error('Authentication error: Invalid user'));
    }

    // Attach user to socket
    (socket as any).user = user;
    next();
  } catch (error) {
    console.error('Socket auth error:', error);
    next(new Error('Authentication error'));
  }
});

// Admin namespace authentication
io.of('/admin').use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Admin authentication error: No token provided'));
    }

    // Verify JWT token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive || user.role !== 'ADMIN') {
      return next(new Error('Admin authentication error: Access denied'));
    }

    // Attach user to socket
    (socket as any).user = user;
    next();
  } catch (error) {
    console.error('Admin socket auth error:', error);
    next(new Error('Admin authentication error'));
  }
});

// Initialize socket handlers
initializeSocket(io);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "http://localhost:5000", "https:"],
      connectSrc: ["'self'", "http://localhost:5000", "ws://localhost:5000"],
    },
  },
}));

// Rate limiting - More permissive for development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute instead of 15
  max: parseInt(process.env.RATE_LIMIT_MAX || '1000'), // 1000 requests per minute for development
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for development environment
    return process.env.NODE_ENV === 'development';
  }
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Serve static files from uploads directory - CORS enabled
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../../uploads'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  },
  fallthrough: true
}));

// Add a route to debug file access
app.get('/debug-file', (req, res) => {
  const filePath = req.query.path as string;
  if (!filePath) {
    return res.status(400).json({ success: false, message: 'No file path provided' });
  }
  
  const fullPath = path.join(__dirname, '../../', filePath);
  
  if (fs.existsSync(fullPath)) {
    res.json({ 
      success: true, 
      exists: true, 
      path: fullPath,
      isFile: fs.statSync(fullPath).isFile(),
      isDirectory: fs.statSync(fullPath).isDirectory(),
      size: fs.statSync(fullPath).size
    });
  } else {
    res.json({ 
      success: true, 
      exists: false, 
      path: fullPath
    });
  }
});

// Debug request logger
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.originalUrl} - Headers:`, req.headers);
  next();
});

// Health check endpoint (Enhanced)
app.get('/health', createHealthCheckEndpoint(prisma, cacheService.isHealthy() ? cacheService : undefined));

// Metrics endpoint
app.get('/metrics', createMetricsEndpoint());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Recruitment Platform API - Enhanced Version',
    version: '2.0.0',
    status: 'running',
    features: ['AI-Powered', 'Real-time', 'PWA-Ready', 'Enhanced Security'],
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      auth: '/api/auth',
      users: '/api/users',
      jobs: '/api/jobs',
      applications: '/api/applications',
      companies: '/api/companies',
      analytics: '/api/analytics',
      ai: '/api/ai',
      upload: '/api/upload'
    }
  });
});

// Middleware to attach Socket.IO instance to requests
app.use((req: any, res, next) => {
  req.io = io;
  next();
});

// API routes
console.log('🔗 Registering API routes...');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API health check passed',
    timestamp: new Date().toISOString() 
  });
});
console.log('✅ API Health route registered');

// Routes
// API Routes with Enhanced Rate Limiting
console.log('🔧 Registering API routes with enhanced security...');

// Apply general rate limiting to all API routes
app.use('/api/', AdvancedRateLimiter.generalLimiter);

// Authentication routes (with stricter rate limiting)
app.use('/api/auth', AdvancedRateLimiter.authLimiter, authRoutes);

// AI routes (with API rate limiting)  
app.use('/api/ai', AdvancedRateLimiter.apiLimiter, aiRoutes);
console.log('✅ AI routes registered at /api/ai with rate limiting');

// Regular API routes
app.use('/api/users', usersRoutes);
app.use('/api/users-enhanced', usersRoutes); // Alias for enhanced endpoints
app.use('/api/users-simple', usersSimpleRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/companies', companiesRoutes);
console.log('✅ Companies routes registered at /api/companies');
app.use('/api/applications', applicationsRoutes);
console.log('✅ Applications routes registered at /api/applications');

// Upload routes (with stricter rate limiting)
app.use('/api/upload', AdvancedRateLimiter.uploadLimiter, uploadRoutes);
console.log('✅ Upload routes registered at /api/upload with rate limiting');
// app.use('/api/saved-jobs', savedJobsRoutes); // Temporarily disabled
app.use('/api/analytics', analyticsRoutes);
console.log('✅ Analytics routes registered at /api/analytics');
app.use('/api/student-dashboard', studentDashboardRoutes);
console.log('✅ Student Dashboard routes registered at /api/student-dashboard');
// Add dashboard route that maps to student dashboard
app.use('/api/dashboard/student', studentDashboardRoutes);
console.log('✅ Student Dashboard routes also registered at /api/dashboard/student');
app.use('/api/company-dashboard', companyDashboardRoutes);
console.log('✅ Company Dashboard routes registered at /api/company-dashboard');
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);
console.log('✅ Admin routes registered at /api/admin');

// Socket.IO instance available to routes
app.set('io', io);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Server port configuration - Use environment PORT or default to 5000
const PORT = process.env.PORT || 5000;

console.log(`🔧 Attempting to start server on port ${PORT}`);

// Initialize services before starting server
initializeServices().then(() => {
  server.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    logger.info(`🤖 AI Features: ${process.env.GEMINI_API_KEY ? 'Enabled' : 'Disabled'}`);
    logger.info(`📁 Cache Service: ${cacheService.isHealthy() ? 'Connected' : 'Offline'}`);
    logger.info(`🔒 Security: Enhanced rate limiting, security headers enabled`);
    logger.info(`📱 PWA: Service worker and manifest ready`);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  // Close cache connection
  await cacheService.disconnect();
  
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  // Close cache connection
  await cacheService.disconnect();
  
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

export default app;
