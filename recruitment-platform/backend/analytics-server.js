const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

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
  } catch (error) {
    console.error('Error tracking analytics event:', error);
  }
}

// Dashboard stats endpoint
app.get('/api/analytics/dashboard-stats', async (req, res) => {
  try {
    const totalUsers = await prisma.user.count() || 0;
    const totalJobs = await prisma.job.count() || 0;
    const totalApplications = await prisma.application.count() || 0;
    const totalCompanies = await prisma.company_profiles.count() || 0;
    
    // Get 30 days data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    }) || 0;
    
    const recentJobs = await prisma.job.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    }) || 0;
    
    const recentApplications = await prisma.application.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    }) || 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalJobs,
        totalApplications,
        totalCompanies,
        recentUsers,
        recentJobs,
        recentApplications,
        growthMetrics: {
          userGrowth: recentUsers,
          jobGrowth: recentJobs,
          applicationGrowth: recentApplications
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

// Personal analytics for students
app.get('/api/analytics/personal', async (req, res) => {
  try {
    // For demo purposes, use a test user ID
    const userId = req.query.userId || 'test-user';
    
    // Get 30 days data
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

    // Get actual counts from database
    const applicationsCount = await prisma.application.count({
      where: { 
        studentId: userId,
        createdAt: { gte: thirtyDaysAgo }
      }
    }) || 0;

    const interviewCount = await prisma.interviews.count({
      where: { 
        applications: {
          studentId: userId
        },
        createdAt: { gte: thirtyDaysAgo }
      }
    }) || 0;

    res.json({
      success: true,
      data: {
        job_view: aggregatedData.job_view || 0,
        application_submit: applicationsCount,
        interview: interviewCount,
        analytics: aggregatedData,
        timeSeriesData: analyticsData
      }
    });
  } catch (error) {
    console.error('Error fetching personal analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch personal analytics'
    });
  }
});

// Track analytics event endpoint
app.post('/api/analytics/track', async (req, res) => {
  try {
    const { metric, jobId, companyId, value = 1, metadata } = req.body;
    const userId = req.body.userId || 'test-user';

    if (!metric) {
      return res.status(400).json({
        success: false,
        error: 'Metric is required'
      });
    }

    await trackAnalyticsEvent(metric, userId, jobId, companyId, value, metadata);

    res.json({
      success: true,
      message: 'Analytics event tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking analytics event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track analytics event'
    });
  }
});

// Company performance analytics
app.get('/api/analytics/company/performance', async (req, res) => {
  try {
    const companyId = req.query.companyId || 'test-company';
    
    // Get 30 days data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get analytics data
    const analyticsData = await prisma.analytics.findMany({
      where: {
        companyId: companyId,
        date: { gte: thirtyDaysAgo }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Calculate metrics
    const totalViews30d = analyticsData
      .filter(a => a.metric === 'job_view')
      .reduce((sum, a) => sum + a.value, 0);

    const totalApplications30d = analyticsData
      .filter(a => a.metric === 'application_submit')
      .reduce((sum, a) => sum + a.value, 0);
    
    const totalInterviews30d = analyticsData
      .filter(a => a.metric === 'interview')
      .reduce((sum, a) => sum + a.value, 0);

    res.json({
      success: true,
      data: {
        totalViews30d,
        totalApplications30d,
        totalInterviews30d,
        totalJobs: 10, // Mock data
        jobDetails: [
          { id: 'test-job-1', title: 'Software Engineer', viewCount: 25, applicationsCount: 5, interviewsCount: 2 },
          { id: 'test-job-2', title: 'Frontend Developer', viewCount: 18, applicationsCount: 3, interviewsCount: 1 }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching company performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company performance'
    });
  }
});

// Test endpoint to populate some sample data
app.post('/api/analytics/test-data', async (req, res) => {
  try {
    console.log('🔧 Creating test analytics data...');
    
    // Create some sample analytics events
    await trackAnalyticsEvent('job_view', 'student-1', 'job-1', 'company-1', 5);
    await trackAnalyticsEvent('job_view', 'student-2', 'job-2', 'company-1', 3);
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
      error: 'Failed to create test data'
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Analytics API Server running on port ${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/analytics/dashboard-stats`);
  console.log(`   GET  http://localhost:${PORT}/api/analytics/personal`);
  console.log(`   POST http://localhost:${PORT}/api/analytics/track`);
  console.log(`   GET  http://localhost:${PORT}/api/analytics/company/performance`);
  console.log(`   POST http://localhost:${PORT}/api/analytics/test-data (creates sample data)`);
});
