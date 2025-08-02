import express, { Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Analytics route working', timestamp: new Date().toISOString() });
});

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    companyId?: string;
  };
}

// Analytics tracking function
export async function trackAnalyticsEvent(metric: string, userId?: string, jobId?: string, companyId?: string, value: number = 1, metadata?: any) {
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
router.get('/dashboard-stats', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalJobs = await prisma.job.count();
    const totalApplications = await prisma.application.count();
    const totalCompanies = await prisma.company_profiles.count();
    
    // Get 30 days data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    });
    
    const recentJobs = await prisma.job.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    });
    
    const recentApplications = await prisma.application.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    });

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
router.get('/personal', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID not found'
      });
    }

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
    }, {} as Record<string, number>);

    // Get actual counts from database
    const applicationsCount = await prisma.application.count({
      where: { 
        studentId: userId,
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    const interviewCount = await prisma.interviews.count({
      where: { 
        applications: {
          studentId: userId
        },
        createdAt: { gte: thirtyDaysAgo }
      }
    });

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
router.post('/track', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { metric, jobId, companyId, value = 1, metadata } = req.body;
    const userId = req.user?.id;

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
router.get('/company/performance', authenticateToken, requireRole(['COMPANY', 'HR_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(403).json({
        success: false,
        error: 'Company ID not found'
      });
    }

    // Get 30 days data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get company jobs with applications and interviews
    const jobs = await prisma.job.findMany({
      where: { companyId: companyId },
      include: {
        applications: {
          include: {
            interviews: true
          },
          where: {
            createdAt: { gte: thirtyDaysAgo }
          }
        }
      }
    });

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

    const totalApplications30d = jobs.reduce((sum, job) => sum + job.applications.length, 0);
    
    const totalInterviews30d = jobs.reduce((sum, job) => {
      return sum + job.applications.reduce((iSum, app) => iSum + app.interviews.length, 0);
    }, 0);

    res.json({
      success: true,
      data: {
        totalViews30d,
        totalApplications30d,
        totalInterviews30d,
        totalJobs: jobs.length,
        jobDetails: jobs.map(job => ({
          id: job.id,
          title: job.title,
          viewCount: job.viewCount,
          applicationsCount: job.applications.length,
          interviewsCount: job.applications.reduce((sum, app) => sum + app.interviews.length, 0)
        }))
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

export default router;