import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

interface AuthRequest extends express.Request {
  user?: {
    id: string;
    email: string;
    role: string;
    companyId?: string;
  };
}

// Simple test route without any middleware
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Analytics simple route working', 
    timestamp: new Date().toISOString(),
    success: true 
  });
});

// Dashboard stats route - for ADMIN users
router.get('/dashboard-stats', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Get real data from database
    const [
      totalUsers,
      totalJobs,
      totalApplications,
      totalCompanies,
      activeJobs,
      pendingApplications,
      studentCount,
      companyCount,
      adminCount
    ] = await Promise.all([
      prisma.users.count(),
      prisma.jobs.count(),
      prisma.applications.count(),
      prisma.company_profiles.count(),
      prisma.jobs.count({ where: { isActive: true } }),
      prisma.applications.count({ where: { 
        OR: [
          { status: 'PENDING' },
          { status: 'REVIEWING' }
        ]
      }}),
      prisma.users.count({ where: { role: 'STUDENT' } }),
      prisma.users.count({ where: { role: 'COMPANY' } }),
      prisma.users.count({ where: { role: 'ADMIN' } })
    ]);

    // Get weekly stats (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      weeklyNewRegistrations,
      weeklyNewJobs,
      weeklyNewApplications,
      blockedAccounts
    ] = await Promise.all([
      prisma.users.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.jobs.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.applications.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.users.count({ where: { isActive: false } })
    ]);

    // Get monthly growth stats (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      monthlyUsersGrowth,
      monthlyJobsGrowth
    ] = await Promise.all([
      prisma.users.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.jobs.count({ where: { createdAt: { gte: thirtyDaysAgo } } })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalJobs,
        totalApplications,
        totalCompanies,
        activeJobs,
        pendingApplications,
        usersGrowth: monthlyUsersGrowth,
        jobsGrowth: monthlyJobsGrowth,
        studentCount,
        companyCount,
        adminCount,
        weeklyStats: {
          newRegistrations: weeklyNewRegistrations,
          newJobs: weeklyNewJobs,
          newApplications: weeklyNewApplications,
          blockedAccounts: blockedAccounts,
        },
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
});

// Personal analytics route - for STUDENT users
router.get('/personal', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const userId = req.user.id;

    // Get real personal data
    const [
      applicationsSent,
      jobsViewed,
      savedJobs,
      profileViews
    ] = await Promise.all([
      prisma.applications.count({ where: { studentId: userId } }),
      prisma.job_views.count({ where: { userId } }),
      prisma.saved_jobs.count({ where: { userId } }),
      // Profile views could be calculated from analytics or activity logs
      prisma.activity_logs.count({
        where: {
          userId,
          activityType: 'PROFILE_VIEW'
        }
      })
    ]);

    // Get application status breakdown
    const applicationsByStatus = await prisma.applications.groupBy({
      by: ['status'],
      where: { studentId: userId },
      _count: { status: true }
    });

    // Get recent activity
    const recentApplications = await prisma.applications.count({
      where: {
        studentId: userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    });

    res.json({
      success: true,
      data: {
        applicationsSent,
        jobsViewed,
        savedJobs,
        profileViews: profileViews || 0,
        applicationsByStatus: applicationsByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {} as Record<string, number>),
        recentApplications,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Personal analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch personal analytics'
    });
  }
});

// Company performance route - for COMPANY users
router.get('/company/performance', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user || !req.user.companyId) {
      return res.status(401).json({ success: false, error: 'Company user not authenticated' });
    }

    const companyId = req.user.companyId;

    // Get company's jobs
    const companyJobs = await prisma.jobs.findMany({
      where: { companyId },
      select: { id: true }
    });
    
    const jobIds = companyJobs.map(job => job.id);

    // Get real company performance data
    const [
      jobsPosted,
      totalApplications,
      totalViews,
      activeJobs,
      hiredCandidates
    ] = await Promise.all([
      prisma.jobs.count({ where: { companyId } }),
      prisma.applications.count({ where: { jobId: { in: jobIds } } }),
      prisma.job_views.count({ where: { jobId: { in: jobIds } } }),
      prisma.jobs.count({ where: { companyId, isActive: true } }),
      prisma.applications.count({ 
        where: { 
          jobId: { in: jobIds },
          status: 'ACCEPTED'
        } 
      })
    ]);

    // Get applications by status
    const applicationsByStatus = await prisma.applications.groupBy({
      by: ['status'],
      where: { jobId: { in: jobIds } },
      _count: { status: true }
    });

    // Get recent performance (last 30 days)
    const recentViews = await prisma.job_views.count({
      where: {
        jobId: { in: jobIds },
        viewedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const recentApplications = await prisma.applications.count({
      where: {
        jobId: { in: jobIds },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    res.json({
      success: true,
      data: {
        jobsPosted,
        totalApplications,
        totalViews,
        activeJobs,
        hiredCandidates,
        applicationsByStatus: applicationsByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {} as Record<string, number>),
        recentViews,
        recentApplications,
        conversionRate: totalViews > 0 ? ((totalApplications / totalViews) * 100).toFixed(2) : '0',
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Company performance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company performance data'
    });
  }
});

export default router;
