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
import usersEnhancedRoutes from './routes/users-enhanced';
import usersSimpleRoutes from './routes/users-simple';
import jobsRoutes from './routes/jobs';
import companiesRoutes from './routes/companies';
import applicationsRoutes from './routes/applications';
import uploadRoutes from './routes/upload';
import savedJobsRoutes from './routes/savedJobs';
import analyticsRoutes from './routes/analytics';
import studentDashboardRoutes from './routes/studentDashboard';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { logger } from './utils/logger';
import { prisma } from './utils/database';

// Import socket handlers
import { initializeSocket } from './services/socketService';

// Load environment variables
dotenv.config();

console.log('🔧 Starting server initialization...');

const app = express();

// Create HTTP server
const server = createServer(app);

console.log('✅ Express app created');

// CORS configuration - Apply before other middleware
app.use(cors({
  origin: "http://localhost:3000", // Specific origin instead of wildcard
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle OPTIONS preflight requests
app.options('*', cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Specific origin instead of wildcard
    methods: ["GET", "POST"],
    credentials: true
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

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '500'), // tăng giới hạn từ 100 lên 500 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Recruitment Platform API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      jobs: '/api/jobs',
      applications: '/api/applications',
      companies: '/api/companies',
      analytics: '/api/analytics',
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
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/users-enhanced', usersEnhancedRoutes);
app.use('/api/users-simple', usersSimpleRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/saved-jobs', savedJobsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/student-dashboard', studentDashboardRoutes);

// Socket.IO instance available to routes
app.set('io', io);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Force restart - Updated timestamp: 2025-07-13 - Back to port 3001
const PORT = process.env.PORT || 3001; // Changed to port 3001 to avoid conflicts

console.log(`🔧 Attempting to start server on port ${PORT}`);

server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

export default app;
