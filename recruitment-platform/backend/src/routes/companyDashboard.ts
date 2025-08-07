import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

const router = express.Router();
const prisma = new PrismaClient();

// Get company dashboard statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get company profile
    const companyProfile = await prisma.company_profiles.findUnique({
      where: { userId }
    });

    if (!companyProfile) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    // Get company jobs statistics
    const jobs = await prisma.jobs.findMany({
      where: { companyId: companyProfile.id },
      include: {
        applications: {
          include: {
            interviews: true
          }
        },
        _count: {
          select: {
            applications: true,
            job_views: true
          }
        }
      }
    });

    // Calculate statistics
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(job => job.isActive).length;
    
    const totalApplications = jobs.reduce((sum, job) => sum + (job._count?.applications || 0), 0);
    const totalViews = jobs.reduce((sum, job) => sum + (job._count?.job_views || 0), 0);
    
    // Count interviews
    const interviewsScheduled = jobs.reduce((sum, job) => {
      return sum + (job.applications || []).reduce((intSum, app) => intSum + (app.interviews?.length || 0), 0);
    }, 0);

    // Get recent applications for trending data
    const recentApplications = await prisma.applications.findMany({
      where: {
        jobs: {
          companyId: companyProfile.id
        },
        appliedAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)) // Last 7 days
        }
      }
    });

    // Get recent views (if job_views table exists)
    const recentViews = await prisma.job_views.findMany({
      where: {
        jobs: {
          companyId: companyProfile.id
        },
        viewedAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)) // Last 7 days
        }
      }
    });

    const stats = {
      totalJobs,
      activeJobs,
      totalApplications,
      totalViews,
      interviewsScheduled,
      // Trend data (simplified - you can make this more sophisticated)
      weeklyTrends: {
        newApplications: recentApplications.length,
        newViews: recentViews.length,
      }
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching company dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message
    });
  }
});

// Get recent applications with candidate details
router.get('/recent-applications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get company profile
    const companyProfile = await prisma.company_profiles.findUnique({
      where: { userId }
    });

    if (!companyProfile) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    // Get recent applications with candidate details
    const applications = await prisma.applications.findMany({
      where: {
        jobs: {
          companyId: companyProfile.id
        }
      },
      include: {
        users: {
          include: {
            student_profiles: true
          }
        },
        jobs: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        appliedAt: 'desc'
      },
      take: 10 // Get last 10 applications
    });

    // Transform data for frontend
    const transformedApplications = applications.map(app => ({
      id: app.id,
      candidateName: `${app.users.student_profiles?.firstName || ''} ${app.users.student_profiles?.lastName || ''}`.trim() || 'Ứng viên',
      candidateAvatar: app.users.student_profiles?.avatar || null,
      jobTitle: app.jobs.title,
      appliedAt: app.appliedAt.toISOString(),
      status: app.status,
      avatar: app.users.student_profiles?.firstName?.charAt(0)?.toUpperCase() || 'U',
    }));

    res.json({
      success: true,
      data: transformedApplications
    });

  } catch (error) {
    console.error('Error fetching recent applications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message
    });
  }
});

// Get performance metrics
router.get('/performance', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get company profile
    const companyProfile = await prisma.company_profiles.findUnique({
      where: { userId }
    });

    if (!companyProfile) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    // Get jobs with detailed application data
    const jobs = await prisma.jobs.findMany({
      where: { companyId: companyProfile.id },
      include: {
        applications: {
          include: {
            interviews: true
          }
        },
        _count: {
          select: {
            applications: true,
            job_views: true
          }
        }
      }
    });

    // Calculate performance metrics
    const totalViews = jobs.reduce((sum, job) => sum + job._count?.job_views, 0);
    const totalApplications = jobs.reduce((sum, job) => sum + job._count?.applications, 0);
    
    const totalInterviews = jobs.reduce((sum, job) => {
      return sum + (job.applications || []).reduce((intSum, app) => intSum + (app.interviews?.length || 0), 0);
    }, 0);

    const acceptedApplications = jobs.reduce((sum, job) => {
      return sum + (job.applications || []).filter(app => app.status === 'ACCEPTED').length;
    }, 0);

    // Calculate rates (as percentages)
    const applicationRate = totalViews > 0 ? Math.round((totalApplications / totalViews) * 100) : 0;
    const candidateQuality = totalApplications > 0 ? Math.round((totalInterviews / totalApplications) * 100) : 0;
    const hiringTime = totalInterviews > 0 ? Math.round((acceptedApplications / totalInterviews) * 100) : 0;
    const candidateSatisfaction = 85; // This would need actual survey data

    const metrics = [
      {
        label: "Tỷ lệ ứng tuyển",
        value: applicationRate,
        target: 100,
        color: "#1976d2",
        trend: "+2.5%",
      },
      {
        label: "Chất lượng ứng viên",
        value: candidateQuality,
        target: 100,
        color: "#2e7d32",
        trend: "+5.2%",
      },
      {
        label: "Thời gian tuyển dụng",
        value: hiringTime,
        target: 100,
        color: "#ed6c02",
        trend: "-1.8%",
      },
      {
        label: "Hài lòng ứng viên",
        value: candidateSatisfaction,
        target: 100,
        color: "#0288d1",
        trend: "+3.1%",
      },
    ];

    res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message
    });
  }
});

export default router;



