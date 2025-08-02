const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Add explicit OPTIONS handler
app.options('*', cors());

app.use(express.json());

// Analytics tracking function
async function trackAnalyticsEvent(metric, userId, jobId, companyId, value = 1, metadata) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const analyticsId = `${metric}_${today.toISOString().split('T')[0]}_${userId || 'null'}_${jobId || 'null'}_${companyId || 'null'}`;
    
    await prisma.analytics.upsert({
      where: { id: analyticsId },
      update: {
        value: { increment: value },
        metadata: metadata ? JSON.stringify(metadata) : undefined
      },
      create: {
        id: analyticsId,
        metric,
        value,
        date: today,
        userId,
        jobId,
        companyId,
        metadata: metadata ? JSON.stringify(metadata) : undefined
      }
    });

    console.log(`📊 Analytics tracked: ${metric} for user ${userId || 'anonymous'}, job ${jobId}, value +${value}`);
    
    // Emit real-time update
    io.emit('analytics-update', {
      metric,
      userId,
      jobId,
      companyId,
      value,
      timestamp: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Error tracking analytics event:', error);
    return false;
  }
}

// Create test data endpoint
app.post('/api/test-data', async (req, res) => {
  try {
    console.log('🔧 Creating test analytics data...');
    
    // Create some sample analytics events
    await trackAnalyticsEvent('job_view', 'student-1', 'job-1', 'company-1', 15);
    await trackAnalyticsEvent('job_view', 'student-2', 'job-2', 'company-1', 8);
    await trackAnalyticsEvent('application_submit', 'student-1', 'job-1', 'company-1', 1);
    await trackAnalyticsEvent('application_submit', 'student-3', 'job-2', 'company-1', 1);
    await trackAnalyticsEvent('interview', 'student-1', 'job-1', 'company-1', 1);
    
    console.log('✅ Test data created successfully');
    
    res.json({
      success: true,
      message: 'Test analytics data created successfully'
    });
  } catch (error) {
    console.error('Error creating test data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Dashboard stats endpoint - using database function for real data
app.get('/api/analytics/dashboard-stats', async (req, res) => {
  try {
    console.log('📊 Fetching dashboard stats from database function...');
    
    // Use database function to get real analytics data
    const result = await prisma.$queryRaw`SELECT * FROM get_dashboard_analytics(30)`;
    const stats = result[0];
    
    console.log('📊 Database function result:', stats);
    
    res.json({
      success: true,
      data: {
        jobViews30d: Number(stats.job_views_30d) || 0,
        applications30d: Number(stats.applications_30d) || 0,
        interviews30d: Number(stats.interviews_30d) || 0,
        totalUsers: Number(stats.total_users) || 0,
        totalJobs: Number(stats.total_jobs) || 0,
        totalApplications: Number(stats.total_applications) || 0,
        totalCompanies: Number(stats.total_companies) || 0,
        trends: {
          jobViews: Number(stats.job_views_trend) || 0,
          applications: Number(stats.applications_trend) || 0,
          interviews: Number(stats.interviews_trend) || 0
        },
        analytics: {
          job_view: Number(stats.job_views_30d) || 0,
          application_submit: Number(stats.applications_30d) || 0,
          interview: Number(stats.interviews_30d) || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard stats'
    });
  }
});

// Personal analytics endpoint
app.get('/api/analytics/personal', async (req, res) => {
  try {
    const userId = req.query.userId || 'student-1';
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get analytics data
    const analyticsData = await prisma.analytics.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo }
      }
    });

    // Aggregate by metric
    const aggregatedData = analyticsData.reduce((acc, item) => {
      if (!acc[item.metric]) {
        acc[item.metric] = 0;
      }
      acc[item.metric] += item.value;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        job_view: aggregatedData.job_view || 0,
        application_submit: aggregatedData.application_submit || 0,
        interview: aggregatedData.interview || 0,
        analytics: aggregatedData
      }
    });
  } catch (error) {
    console.error('Error fetching personal analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Track event endpoint
app.post('/api/analytics/track', async (req, res) => {
  try {
    const { metric, userId, jobId, companyId, value = 1, metadata } = req.body;

    if (!metric) {
      return res.status(400).json({
        success: false,
        error: 'Metric is required'
      });
    }

    const success = await trackAnalyticsEvent(metric, userId, jobId, companyId, value, metadata);

    res.json({
      success,
      message: success ? 'Analytics event tracked successfully' : 'Failed to track event'
    });
  } catch (error) {
    console.error('Error tracking analytics event:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = 3001;

server.listen(PORT, () => {
  console.log(`🚀 Analytics API Server running on http://localhost:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/analytics/dashboard-stats`);
  console.log(`   GET  http://localhost:${PORT}/api/analytics/personal?userId=student-1`);
  console.log(`   POST http://localhost:${PORT}/api/analytics/track`);
  console.log(`   POST http://localhost:${PORT}/api/test-data (creates sample data)`);
  console.log(`\n🎯 To create test data, visit: http://localhost:${PORT}/api/test-data`);
  console.log(`🔌 Socket.IO server ready for real-time analytics updates`);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('📡 Analytics client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('📡 Analytics client disconnected:', socket.id);
  });
});

process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});
