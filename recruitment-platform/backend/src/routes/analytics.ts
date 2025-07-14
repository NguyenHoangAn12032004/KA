import { Router } from 'express';
import { prisma } from '../utils/database';

const router = Router();

// Get dashboard statistics
router.get('/dashboard-stats', async (req, res) => {
  try {
    // Get total counts
    const [totalUsers, totalCompanies, totalJobs, totalApplications] = await Promise.all([
      prisma.user.count(),
      prisma.company_profiles.count(),
      prisma.job.count(),
      prisma.application.count()
    ]);

    // Get user counts by role
    const [studentCount, companyCount, adminCount] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'COMPANY' } }),
      prisma.user.count({ where: { role: 'ADMIN' } })
    ]);

    // Get active jobs count
    const activeJobs = await prisma.job.count({
      where: {
        isActive: true
      }
    });

    // Get pending applications count
    const pendingApplications = await prisma.application.count({
      where: {
        status: 'PENDING'
      }
    });

    // Calculate growth rates (comparing last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Weekly activity tracking (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [newRegistrations, newJobs, newApplications] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      }),
      prisma.job.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      }),
      prisma.application.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      })
    ]);

    // Count blocked accounts (suspended users)
    const blockedAccounts = await prisma.user.count({
      where: {
        // Assuming you have a status field, otherwise return 0
        // status: 'SUSPENDED'
      }
    });

    const [usersLast30Days, usersPrevious30Days] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo
          }
        }
      })
    ]);

    const [jobsLast30Days, jobsPrevious30Days] = await Promise.all([
      prisma.job.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      prisma.job.count({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo
          }
        }
      })
    ]);

    // Calculate growth percentages
    const usersGrowth = usersPrevious30Days > 0 
      ? ((usersLast30Days - usersPrevious30Days) / usersPrevious30Days) * 100 
      : usersLast30Days > 0 ? 100 : 0;

    const jobsGrowth = jobsPrevious30Days > 0 
      ? ((jobsLast30Days - jobsPrevious30Days) / jobsPrevious30Days) * 100 
      : jobsLast30Days > 0 ? 100 : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalCompanies,
        totalJobs,
        totalApplications,
        activeJobs,
        pendingApplications,
        usersGrowth: Math.round(usersGrowth * 10) / 10, // Round to 1 decimal
        jobsGrowth: Math.round(jobsGrowth * 10) / 10,
        // User breakdown
        studentCount,
        companyCount,
        adminCount,
        // Weekly activities
        weeklyStats: {
          newRegistrations,
          newJobs,
          newApplications,
          blockedAccounts: 0 // Default to 0 since we don't have status field yet
        }
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get recent activities
router.get('/recent-activities', async (req, res) => {
  try {
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
        studentProfile: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        company_profiles: {
          select: {
            companyName: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: recentUsers
    });

  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
