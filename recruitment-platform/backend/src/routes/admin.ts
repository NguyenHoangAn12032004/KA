import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin, requireAdminOrOwner, allowImpersonation } from '../middleware/adminAuth';
import { AdminIntegrationService, UserAction } from '../services/AdminIntegrationService';
import { AdminAnalyticsService } from '../services/AdminAnalyticsService';
import { AuthRequest } from '../types';

const router = Router();
const prisma = new PrismaClient();

// Initialize services
const adminIntegrationService = new AdminIntegrationService();
const adminAnalyticsService = new AdminAnalyticsService();

// Apply authentication to all admin routes
router.use(authenticateToken);

// Apply admin requirement to all routes except stop-impersonation
router.use((req: Request, res: Response, next: NextFunction) => {
  // Skip admin requirement for stop-impersonation endpoint
  if (req.path === '/users/stop-impersonation') {
    return next();
  }
  return requireAdmin(req as AuthRequest, res, next);
});

// GET /api/admin/dashboard - Get admin dashboard data
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const timeRange = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    };

    const [analytics, insights, realtimeMetrics] = await Promise.all([
      adminAnalyticsService.getCrossRoleAnalytics(timeRange),
      adminAnalyticsService.generateSystemInsights(),
      adminAnalyticsService.getRealtimeMetrics()
    ]);

    res.json({
      success: true,
      data: {
        analytics,
        insights,
        realtimeMetrics,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('❌ Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load admin dashboard'
    });
  }
});

// GET /api/admin/users - Get all users with filtering
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { 
      role, 
      status, 
      verified, 
      page = 1, 
      limit = 50,
      search
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    const whereClause: any = {};
    
    if (role && role !== 'ALL') {
      whereClause.role = role as UserRole;
    }
    
    if (status === 'active') {
      whereClause.isActive = true;
    } else if (status === 'suspended') {
      whereClause.isActive = false;
    }
    
    if (verified === 'true') {
      whereClause.isVerified = true;
    } else if (verified === 'false') {
      whereClause.isVerified = false;
    }
    
    if (search) {
      whereClause.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { student_profiles: { firstName: { contains: search as string, mode: 'insensitive' } } },
        { student_profiles: { lastName: { contains: search as string, mode: 'insensitive' } } },
        { company_profiles: { companyName: { contains: search as string, mode: 'insensitive' } } }
      ];
    }

    const [users, totalCount] = await Promise.all([
      prisma.users.findMany({
        where: whereClause,
        include: {
          student_profiles: {
            select: {
              firstName: true,
              lastName: true,
              university: true,
              major: true
            }
          },
          company_profiles: {
            select: {
              companyName: true,
              industry: true,
              isVerified: true
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.users.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('❌ Admin users list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load users'
    });
  }
});

// GET /api/admin/users/:id - Get specific user details
router.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.users.findUnique({
      where: { id },
      include: {
        student_profiles: {
          include: {
            student_educations: true,
            student_experiences: true,
            student_projects: true
          }
        },
        company_profiles: {
          include: {
            jobs: {
              select: {
                id: true,
                title: true,
                isActive: true,
                createdAt: true
              }
            }
          }
        },
        applications: {
          include: {
            jobs: {
              select: {
                title: true,
                company_profiles: {
                  select: {
                    companyName: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('❌ Admin user details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load user details'
    });
  }
});

// POST /api/admin/users/:id/action - Execute admin action on user
router.post('/users/:id/action', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, reason, newRole } = req.body;
    const adminId = (req as any).user.id;

    const userAction: UserAction = {
      type: action,
      reason,
      newRole: newRole as UserRole
    };

    const result = await adminIntegrationService.manageUser(adminId, id, userAction);

    res.json({
      success: true,
      data: result,
      message: `User action ${action} completed successfully`
    });
  } catch (error) {
    console.error('❌ Admin user action error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to execute user action'
    });
  }
});

// GET /api/admin/companies - Get all companies with admin details
router.get('/companies', async (req: Request, res: Response) => {
  try {
    console.log('🔥 ADMIN COMPANIES ENDPOINT HIT! Query params:', req.query);
    
    // Set cache-control headers to prevent caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    const { verified, active, page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const whereClause: any = {};
    
    if (verified === 'true') {
      whereClause.isVerified = true;
    } else if (verified === 'false') {
      whereClause.isVerified = false;
    }
    
    if (active === 'true') {
      whereClause.users = { isActive: true };
    } else if (active === 'false') {
      whereClause.users = { isActive: false };
    }

    const [companies, totalCount] = await Promise.all([
      // Use traditional Prisma query for debugging
      prisma.company_profiles.findMany({
        where: whereClause,
        include: {
          users: {
            select: {
              id: true,
              email: true,
              isActive: true,
              isVerified: true,
              createdAt: true
            }
          },
          jobs: {
            select: {
              id: true,
              title: true,
              isActive: true,
              _count: {
                select: {
                  applications: true
                }
              }
            }
          },
          _count: {
            select: {
              jobs: true
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.company_profiles.count({ where: whereClause })
    ]);

    console.log(`🏢 Found ${companies.length} companies from database`);
    console.log(`🏢 First company:`, companies[0] ? companies[0].companyName : 'none');

    const responseData = {
      success: true,
      data: {
        companies: companies.map(company => ({
          id: company.id,
          name: company.companyName,
          email: company.users?.email || company.email,
          industry: company.industry,
          size: company.companySize,
          isVerified: company.isVerified,
          verificationStatus: company.isVerified ? 'VERIFIED' : 'PENDING',
          status: company.users?.isActive ? 'ACTIVE' : 'SUSPENDED',
          createdAt: company.createdAt.toISOString(),
          jobsCount: company._count.jobs || 0,
          website: company.website,
          phone: company.phone,
          address: company.address,
          description: company.description
        })),
        total: totalCount,
        pages: Math.ceil(totalCount / Number(limit))
      }
    };

    console.log(`🏢 Sending response with ${responseData.data.companies.length} companies`);

    // Emit real-time update to admin dashboard
    const io = req.app.get('socketio');
    if (io && io.of('/admin')) {
      io.of('/admin').emit('companies-updated', {
        companies: responseData.data.companies,
        total: responseData.data.total,
        timestamp: new Date().toISOString()
      });
      console.log('📡 Sent real-time companies update to admin panel');
    }

    res.json(responseData);
  } catch (error) {
    console.error('❌ Admin companies list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load companies'
    });
  }
});

// POST /api/admin/companies/:id/verify - Verify company (for backward compatibility)
router.post('/companies/:id/verify', verifyCompanyHandler);

// PATCH /api/admin/companies/:id/verify - Verify company (primary method)
router.patch('/companies/:id/verify', verifyCompanyHandler);

async function verifyCompanyHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const adminId = (req as any).user.id;

    console.log(`🔍 [Admin] Verifying company ${id} with status: ${status}`);

    const verified = status === 'VERIFIED';

    // First check if company exists
    const existingCompany = await prisma.company_profiles.findUnique({
      where: { id },
      include: { users: true }
    });

    if (!existingCompany) {
      console.log(`❌ [Admin] Company ${id} not found`);
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    // Update company verification status
    const company = await prisma.company_profiles.update({
      where: { id },
      data: { 
        isVerified: verified
      },
      include: {
        users: true
      }
    });

    console.log(`✅ [Admin] Company ${id} ${verified ? 'verified' : 'rejected'} successfully`);

    // Transform to match frontend expectations
    const transformedCompany = {
      id: company.id,
      name: company.companyName,
      email: company.users?.email || company.email,
      industry: company.industry,
      size: company.companySize,
      isVerified: company.isVerified,
      verificationStatus: company.isVerified ? 'VERIFIED' : 'REJECTED',
      status: company.users?.isActive ? 'ACTIVE' : 'SUSPENDED',
      createdAt: company.createdAt.toISOString(),
      jobsCount: 0, // Will be updated by count query if needed
      website: company.website,
      phone: company.phone,
      address: company.address,
      description: company.description
    };

    // Sync data across roles
    await adminIntegrationService.syncDataAcrossRoles('COMPANY', id);

    // Emit real-time update to admin panel
    const io = (req as any).io;
    if (io) {
      io.to('admin-room').emit('company-verification', {
        companyId: id,
        verified: verified,
        company: transformedCompany,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: transformedCompany,
      message: `Company ${verified ? 'verified' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('❌ Admin company verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify company'
    });
  }
}

// POST /api/admin/companies/:id/action - Suspend/Activate company
router.post('/companies/:id/action', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;
    const adminId = (req as any).user.id;

    const isActive = action === 'activate';

    // Update user status in users table
    const company = await prisma.company_profiles.findUnique({
      where: { id },
      include: { users: true }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    // Update user isActive status if user exists
    if (company.users) {
      await prisma.users.update({
        where: { id: company.users.id },
        data: { 
          isActive: isActive
        }
      });
    }

    // Get updated company data
    const updatedCompany = await prisma.company_profiles.findUnique({
      where: { id },
      include: { users: true }
    });

    // Transform to match frontend expectations
    const transformedCompany = {
      id: updatedCompany!.id,
      name: updatedCompany!.companyName,
      email: updatedCompany!.users?.email || updatedCompany!.email,
      industry: updatedCompany!.industry,
      size: updatedCompany!.companySize,
      isVerified: updatedCompany!.isVerified,
      verificationStatus: updatedCompany!.isVerified ? 'VERIFIED' : 'PENDING',
      status: updatedCompany!.users?.isActive ? 'ACTIVE' : 'SUSPENDED',
      createdAt: updatedCompany!.createdAt.toISOString(),
      jobsCount: 0, // Will be updated by count query if needed
      website: updatedCompany!.website,
      phone: updatedCompany!.phone,
      address: updatedCompany!.address,
      description: updatedCompany!.description
    };

    // Sync data across roles
    await adminIntegrationService.syncDataAcrossRoles('COMPANY', id);

    res.json({
      success: true,
      data: transformedCompany,
      message: `Company ${isActive ? 'activated' : 'suspended'} successfully`
    });
  } catch (error) {
    console.error('❌ Admin company action error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update company status'
    });
  }
});

// GET /api/admin/companies/:id - Get company details
router.get('/companies/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const company = await prisma.company_profiles.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            isActive: true,
            isVerified: true,
            createdAt: true
          }
        },
        jobs: {
          select: {
            id: true,
            title: true,
            isActive: true,
            _count: {
              select: {
                applications: true
              }
            }
          }
        },
        _count: {
          select: {
            jobs: true
          }
        }
      }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    // Transform to match frontend expectations
    const transformedCompany = {
      id: company.id,
      name: company.companyName,
      email: company.users?.email || company.email,
      industry: company.industry,
      size: company.companySize,
      isVerified: company.isVerified,
      verificationStatus: company.isVerified ? 'VERIFIED' : 'PENDING',
      status: company.users?.isActive ? 'ACTIVE' : 'SUSPENDED',
      createdAt: company.createdAt.toISOString(),
      jobsCount: company._count.jobs || 0,
      website: company.website,
      phone: company.phone,
      address: company.address,
      description: company.description
    };

    res.json({
      success: true,
      data: transformedCompany
    });
  } catch (error) {
    console.error('❌ Admin company details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load company details'
    });
  }
});

// GET /api/admin/jobs - Get all jobs with admin details
router.get('/jobs', async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const whereClause: any = {};
    
    if (status === 'active') {
      whereClause.isActive = true;
    } else if (status === 'inactive') {
      whereClause.isActive = false;
    }

    const [jobs, totalCount] = await Promise.all([
      prisma.jobs.findMany({
        where: whereClause,
        include: {
          company_profiles: {
            select: {
              companyName: true,
              isVerified: true
            }
          },
          _count: {
            select: {
              applications: true
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.jobs.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('❌ Admin jobs list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load jobs'
    });
  }
});

// POST /api/admin/jobs/:id/moderate - Moderate job posting
router.post('/jobs/:id/moderate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'approve' | 'reject' | 'deactivate'
    const adminId = (req as any).user.id;

    let updateData: any = {};
    
    switch (action) {
      case 'approve':
        updateData = { isActive: true, moderatedBy: adminId, moderatedAt: new Date() };
        break;
      case 'reject':
      case 'deactivate':
        updateData = { isActive: false, moderatedBy: adminId, moderatedAt: new Date() };
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid moderation action'
        });
    }

    const job = await prisma.jobs.update({
      where: { id },
      data: updateData,
      include: {
        company_profiles: true
      }
    });

    // Sync data across roles
    await adminIntegrationService.syncDataAcrossRoles('JOB', id);

    res.json({
      success: true,
      data: job,
      message: `Job ${action} completed successfully`
    });
  } catch (error) {
    console.error('❌ Admin job moderation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to moderate job'
    });
  }
});

// GET /api/admin/analytics/realtime - Get real-time analytics
router.get('/analytics/realtime', async (req: Request, res: Response) => {
  try {
    const metrics = await adminAnalyticsService.getRealtimeMetrics();
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('❌ Admin realtime analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load realtime analytics'
    });
  }
});

// GET /api/admin/analytics/insights - Get system insights
router.get('/analytics/insights', async (req: Request, res: Response) => {
  try {
    const insights = await adminAnalyticsService.generateSystemInsights();
    
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('❌ Admin insights error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate insights'
    });
  }
});

// POST /api/admin/broadcast - Send system-wide broadcast
router.post('/broadcast', async (req: Request, res: Response) => {
  try {
    const { message, targetRoles, priority = 'normal' } = req.body;
    const adminId = (req as any).user.id;

    // TODO: Implement broadcast via socket service
    console.log('📢 Admin broadcast:', { message, targetRoles, priority, adminId });

    res.json({
      success: true,
      message: 'Broadcast sent successfully'
    });
  } catch (error) {
    console.error('❌ Admin broadcast error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send broadcast'
    });
  }
});

// POST /api/admin/sync-data - Manual data synchronization
router.post('/sync-data', async (req: Request, res: Response) => {
  try {
    const { entityType, entityId } = req.body;
    
    await adminIntegrationService.syncDataAcrossRoles(entityType, entityId);
    
    res.json({
      success: true,
      message: 'Data synchronization completed'
    });
  } catch (error) {
    console.error('❌ Admin data sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync data'
    });
  }
});

// GET /api/admin/system-status - Get system status
router.get('/system-status', async (req: Request, res: Response) => {
  try {
    const timeRange = {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
      end: new Date()
    };

    const analytics = await adminAnalyticsService.getCrossRoleAnalytics(timeRange);
    
    res.json({
      success: true,
      data: {
        systemHealth: analytics.systemHealth,
        userStats: analytics.userStats,
        interactionStats: analytics.interactionStats,
        recommendations: analytics.recommendations
      }
    });
  } catch (error) {
    console.error('❌ Admin system status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system status'
    });
  }
});

// POST /api/admin/users/:id/impersonate - Impersonate a user
router.post('/users/:id/impersonate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user.id;

    // Find the user to impersonate
    const targetUser = await prisma.users.findUnique({
      where: { id },
      include: {
        student_profiles: true,
        company_profiles: true
      }
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!targetUser.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Cannot impersonate inactive user'
      });
    }

    // Generate impersonation token
    const jwt = require('jsonwebtoken');
    const impersonationToken = jwt.sign(
      { 
        userId: targetUser.id,
        originalAdminId: adminId,
        isImpersonating: true,
        impersonatedAt: new Date().toISOString()
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '2h' } // Limited time for security
    );

    // Log the impersonation action
    console.log(`🎭 Admin ${adminId} impersonating user ${targetUser.id} (${targetUser.email})`);

    res.json({
      success: true,
      data: {
        token: impersonationToken,
        user: {
          id: targetUser.id,
          email: targetUser.email,
          role: targetUser.role,
          isImpersonating: true,
          originalAdminId: adminId
        }
      },
      message: `Now impersonating ${targetUser.email}`
    });
  } catch (error) {
    console.error('❌ Admin impersonate error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to impersonate user'
    });
  }
});

// POST /api/admin/users/stop-impersonation - Stop impersonating and return to admin
router.post('/users/stop-impersonation', authenticateToken, async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

    if (!decoded.isImpersonating || !decoded.originalAdminId) {
      return res.status(400).json({
        success: false,
        error: 'Not currently impersonating'
      });
    }

    // Find the original admin
    const adminUser = await prisma.users.findUnique({
      where: { id: decoded.originalAdminId }
    });

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        error: 'Original admin not found'
      });
    }

    // Generate new admin token
    const adminToken = jwt.sign(
      { 
        userId: adminUser.id,
        email: adminUser.email,
        role: adminUser.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log(`🎭 Stopped impersonation, returning to admin ${adminUser.id}`);

    res.json({
      success: true,
      data: {
        token: adminToken,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role
        }
      },
      message: 'Impersonation stopped, returned to admin account'
    });
  } catch (error) {
    console.error('❌ Stop impersonation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop impersonation'
    });
  }
});

export default router;
