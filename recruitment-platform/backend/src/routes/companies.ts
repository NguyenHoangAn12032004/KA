import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';
import { AuthRequest } from '../types';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Add logging to see if this route file is being loaded
console.log('🏢 Companies route file loaded');

// Simple test route to verify router is working
router.get('/test', (req: Request, res: Response) => {
  console.log('🔧 Companies test route hit!');
  res.json({ message: 'Companies router is working!' });
});

// Enhanced company interface for frontend
interface EnhancedCompany {
  id: string;
  companyName: string;
  logoUrl?: string;
  industry?: string;
  companySize?: string;
  location: string;
  description?: string;
  website?: string;
  foundedYear?: number;
  rating?: number;
  totalJobs?: number;
  activeJobs?: number;
  isVerified?: boolean;
  isFeatured?: boolean;
  followers?: number;
  viewCount?: number;
  lastJobPosted?: string;
  socialLinks?: {
    linkedin?: string;
    facebook?: string;
    website?: string;
    twitter?: string;
  };
  tags?: string[];
  benefits?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// GET /api/companies - Enhanced company listing with real-time data
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      search, 
      industry, 
      size, 
      location, 
      verified, 
      featured, 
      hasJobs,
      sortBy = 'newest',
      page = 1, 
      limit = 12,
      includeStats = true 
    } = req.query;

    // Build where clause for filtering
    const whereClause: any = {
      AND: []
    };

    if (search) {
      whereClause.AND.push({
        OR: [
          { companyName: { contains: search as string, mode: 'insensitive' } },
          { industry: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          { city: { contains: search as string, mode: 'insensitive' } }
        ]
      });
    }

    if (industry) {
      whereClause.AND.push({ industry: { in: Array.isArray(industry) ? industry : [industry] } });
    }

    if (size) {
      whereClause.AND.push({ companySize: { in: Array.isArray(size) ? size : [size] } });
    }

    if (location) {
      whereClause.AND.push({ city: { in: Array.isArray(location) ? location : [location] } });
    }

    if (verified === 'true') {
      whereClause.AND.push({ isVerified: true });
    }

    if (hasJobs === 'true') {
      whereClause.AND.push({
        jobs: {
          some: {
            isActive: true
          }
        }
      });
    }

    // Build order by clause
    let orderBy: any = { createdAt: 'desc' };
    switch (sortBy) {
      case 'name':
        orderBy = { companyName: 'asc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'jobs':
        orderBy = [{ jobs: { _count: 'desc' } }];
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
    }

    // Get companies with enhanced data
    const companies = await prisma.company_profiles.findMany({
      where: whereClause.AND.length > 0 ? whereClause : {},
      include: {
        jobs: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            createdAt: true,
            viewCount: true,
            applicationsCount: true
          }
        },
        users: {
          select: {
            id: true,
            email: true,
            isActive: true,
            lastLogin: true
          }
        },
        _count: {
          select: {
            jobs: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    // Get total count for pagination
    const totalCount = await prisma.company_profiles.count({
      where: whereClause.AND.length > 0 ? whereClause : {}
    });

    // Transform data to enhanced format
    const enhancedCompanies: EnhancedCompany[] = await Promise.all(
      companies.map(async (company) => {
        const jobStats = includeStats ? await getCompanyJobStats(company.id) : null;
        const viewStats = includeStats ? await getCompanyViewStats(company.id) : null;
        
        return {
      id: company.id,
          companyName: company.companyName,
          logoUrl: company.logo,
          industry: company.industry,
          companySize: company.companySize,
          location: `${company.city}, ${company.country}`,
          description: company.description,
          website: company.website,
          foundedYear: company.founded ? parseInt(company.founded) : undefined,
          rating: company.rating,
      totalJobs: company._count.jobs,
          activeJobs: company.jobs.length,
          isVerified: company.isVerified,
          isFeatured: false, // Will be enhanced with business logic
          followers: 0, // Will be enhanced with follower system
          viewCount: viewStats?.total || 0,
          lastJobPosted: company.jobs[0]?.createdAt.toISOString(),
          socialLinks: {
            linkedin: company.linkedin,
            facebook: company.facebook,
            website: company.website,
            twitter: company.twitter
          },
          tags: [company.industry, company.companySize].filter(Boolean) as string[],
          benefits: [], // Will be enhanced
          createdAt: company.createdAt,
          updatedAt: company.updatedAt
        };
      })
    );

    // Get aggregated statistics
    const stats = includeStats ? await getCompaniesStats() : null;

    res.json({
      success: true,
      data: {
        companies: enhancedCompanies,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / Number(limit))
        },
        stats,
        filters: {
          industries: await getAvailableIndustries(),
          sizes: await getAvailableSizes(),
          locations: await getAvailableLocations()
        }
      }
    });

    logger.info(`📊 Companies fetched: ${enhancedCompanies.length}/${totalCount}`);

  } catch (error) {
    logger.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch companies'
    });
  }
});

// GET /api/companies/profile - Get current company profile (authenticated)
// GET /api/companies/profile - Get company profile for authenticated user
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    console.log('🏢 GET /api/companies/profile - Processing request for user:', req.user?.id);
    const userId = req.user!.id;
    console.log('🏢 Searching for company profile with userId:', userId);

    // Get company profile for the current user
    const company = await prisma.company_profiles.findUnique({
      where: { userId },
      include: {
        jobs: {
          where: { isActive: true },
          include: {
            applications: {
              select: {
                id: true,
                status: true,
                appliedAt: true
              }
            },
            _count: {
              select: {
                applications: true,
                job_views: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        users: {
          select: {
            id: true,
            email: true,
            isActive: true,
            lastLogin: true
          }
        }
      }
    });

    console.log('🏢 Company profile query result:', company ? 'Found' : 'Not found');
    console.log('🏢 Company data:', company ? JSON.stringify({ id: company.id, companyName: company.companyName, userId: company.userId }, null, 2) : 'null');

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company profile not found'
      });
    }

    // Get enhanced statistics
    const jobStats = await getCompanyJobStats(company.id);
    const viewStats = await getCompanyViewStats(company.id);
    const applicationStats = await getCompanyApplicationStats(company.id);

    // Get follower count
    const followerCount = await prisma.activity_logs.count({
      where: {
        activityType: 'FOLLOW_COMPANY',
        entityId: company.id
      }
    });

    // Transform to enhanced format
    const profileData = {
      id: company.id,
      companyName: company.companyName,
      description: company.description,
      industry: company.industry,
      companySize: company.companySize,
      foundedYear: company.founded ? parseInt(company.founded) : undefined,
      location: `${company.city || ''}, ${company.country || ''}`.trim().replace(/^,\s*|,\s*$/, ''),
      website: company.website,
      email: company.users?.email || '',
      phone: company.phone,
      logoUrl: company.logo,
      isVerified: company.isVerified,
      rating: company.rating || 4.5,
      stats: {
        totalJobs: jobStats.totalJobs,
        activeJobs: jobStats.activeJobs,
        totalApplications: jobStats.totalApplications,
        totalViews: viewStats.total,
        followers: followerCount,
        successfulHires: Math.floor(jobStats.totalApplications * 0.15), // Estimate
        averageRating: company.rating || 4.5,
        responseRate: 87, // Default value
        hireTime: 12, // Default value in days
      },
      socialLinks: {
        linkedin: company.linkedin,
        facebook: company.facebook,
        twitter: company.twitter,
        instagram: null,
        youtube: null,
        github: null,
      },
      culture: {
        workEnvironment: company.description || null,
        coreValues: null,
        benefits: null,
        growth: null,
      },
      recentJobs: company.jobs.map(job => ({
        id: job.id,
        title: job.title,
        location: job.location,
        type: 'Full-time', // Default value since type field doesn't exist
        isActive: job.isActive,
        applicationsCount: job._count.applications,
        createdAt: job.createdAt,
      })),
    };

    console.log('🏢 Sending response data structure:', JSON.stringify({
      stats: profileData.stats,
      location: profileData.location,
      phone: profileData.phone,
      website: profileData.website,
      logoUrl: profileData.logoUrl
    }, null, 2));

    res.json({
      success: true,
      data: profileData
    });

    logger.info(`👤 Company profile fetched for user: ${userId}`);

  } catch (error) {
    logger.error('Error fetching company profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/companies/:id - Get detailed company information
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { includeJobs = true, includeStats = true } = req.query;
    
    const company = await prisma.company_profiles.findUnique({
      where: { id },
      include: {
        jobs: includeJobs === 'true' ? {
          where: { isActive: true },
          include: {
            applications: {
          select: {
            id: true,
                status: true,
                appliedAt: true
          }
        },
            _count: {
              select: {
                applications: true,
                job_views: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        } : false,
        users: {
          select: {
            id: true,
            email: true,
            isActive: true,
            lastLogin: true
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

    // Get enhanced statistics
    const stats = includeStats === 'true' ? {
      jobStats: await getCompanyJobStats(id),
      viewStats: await getCompanyViewStats(id),
      applicationStats: await getCompanyApplicationStats(id)
    } : null;

    // Transform to enhanced format
    const enhancedCompany: EnhancedCompany & { jobs?: any[], stats?: any } = {
      id: company.id,
      companyName: company.companyName,
      logoUrl: company.logo,
      industry: company.industry,
      companySize: company.companySize,
      location: `${company.city}, ${company.country}`,
      description: company.description,
      website: company.website,
      foundedYear: company.founded ? parseInt(company.founded) : undefined,
      rating: company.rating,
      totalJobs: Array.isArray(company.jobs) ? company.jobs.length : 0,
      activeJobs: Array.isArray(company.jobs) ? company.jobs.filter(job => job.isActive).length : 0,
      isVerified: company.isVerified,
      isFeatured: false,
      followers: 0,
      viewCount: stats?.viewStats?.total || 0,
      socialLinks: {
        linkedin: company.linkedin,
        facebook: company.facebook,
        website: company.website,
        twitter: company.twitter
      },
      tags: [company.industry, company.companySize].filter(Boolean) as string[],
      benefits: [],
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      jobs: includeJobs === 'true' ? company.jobs : undefined,
      stats
    };

    res.json({
      success: true,
      data: {
        company: enhancedCompany
      }
    });

    logger.info(`🏢 Company details fetched: ${company.companyName}`);

  } catch (error) {
    logger.error('Error fetching company details:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/companies/:id/follow - Follow/unfollow company (authenticated)
router.post('/:id/follow', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id: companyId } = req.params;
    const userId = req.user!.id;

    // Check if company exists
    const company = await prisma.company_profiles.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    // For now, we'll store in activity logs until we create a followers table
    const existingFollow = await prisma.activity_logs.findFirst({
      where: {
        userId,
        activityType: 'FOLLOW_COMPANY',
        entityType: 'COMPANY',
        entityId: companyId
      }
    });

    if (existingFollow) {
      // Unfollow
      await prisma.activity_logs.delete({
        where: { id: existingFollow.id }
      });

      // Emit real-time event
      const io = req.app.get('io');
      if (io) {
        io.emit('company-unfollowed', {
          companyId,
          userId,
          timestamp: new Date()
        });
      }

    res.json({
      success: true,
        data: {
          following: false,
          message: 'Company unfollowed successfully'
        }
      });
    } else {
      // Follow
      await prisma.activity_logs.create({
        data: {
          id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId,
          activityType: 'FOLLOW_COMPANY',
          entityType: 'COMPANY',
          entityId: companyId,
          updatedAt: new Date(),
          data: {
            companyName: company.companyName,
            action: 'follow'
          }
        }
      });

      // Emit real-time event
      const io = req.app.get('io');
      if (io) {
        io.emit('company-followed', {
          companyId,
          userId,
          companyName: company.companyName,
          timestamp: new Date()
        });
      }

      res.json({
        success: true,
        data: {
          following: true,
          message: 'Company followed successfully'
        }
      });
    }

    logger.info(`👥 User ${userId} ${existingFollow ? 'unfollowed' : 'followed'} company ${companyId}`);

  } catch (error) {
    logger.error('Error toggling company follow:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/companies/:id/view - Track company view
router.post('/:id/view', async (req: Request, res: Response) => {
  try {
    const { id: companyId } = req.params;
    const { userId, ipAddress, userAgent } = req.body;

    // Track the view in activity logs
    await prisma.activity_logs.create({
      data: {
        id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: userId || undefined,
        activityType: 'VIEW_COMPANY',
        entityType: 'COMPANY',
        entityId: companyId,
        updatedAt: new Date(),
        data: {
          ipAddress,
          userAgent,
          timestamp: new Date()
        }
      }
    });

    // Emit real-time event for statistics
    const io = req.app.get('io');
    if (io) {
      io.emit('company-viewed', {
        companyId,
        userId,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        message: 'View tracked successfully'
      }
    });

  } catch (error) {
    logger.error('Error tracking company view:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/companies/stats/overview - Get companies overview statistics
router.get('/stats/overview', authenticateToken, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const stats = await getCompaniesStats();

    res.json({
      success: true,
      data: {
        stats
      }
    });

  } catch (error) {
    logger.error('Error fetching companies stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Helper Functions
async function getCompanyJobStats(companyId: string) {
  const jobs = await prisma.jobs.findMany({
    where: { companyId },
    include: {
      applications: {
        select: {
          status: true,
          appliedAt: true
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

  const activeJobs = jobs.filter(job => job.isActive).length;
  const totalApplications = jobs.reduce((sum, job) => sum + job._count.applications, 0);
  const totalViews = jobs.reduce((sum, job) => sum + job._count.job_views, 0);

  return {
    totalJobs: jobs.length,
    activeJobs,
    totalApplications,
    totalViews,
    averageApplicationsPerJob: activeJobs > 0 ? Math.round(totalApplications / activeJobs) : 0
  };
}

async function getCompanyViewStats(companyId: string) {
  const views = await prisma.activity_logs.findMany({
    where: {
      activityType: 'VIEW_COMPANY',
      entityId: companyId
    },
    orderBy: { createdAt: 'desc' }
  });

  const today = new Date();
  const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  return {
    total: views.length,
    last7Days: views.filter(view => view.createdAt >= last7Days).length,
    last30Days: views.filter(view => view.createdAt >= last30Days).length
  };
}

async function getCompanyApplicationStats(companyId: string) {
  const applications = await prisma.applications.findMany({
    where: {
      jobs: {
        companyId
      }
    },
    include: {
      jobs: {
        select: {
          title: true
        }
      }
    }
  });

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: applications.length,
    byStatus: statusCounts
  };
}

async function getCompaniesStats() {
  const totalCompanies = await prisma.company_profiles.count();
  const verifiedCompanies = await prisma.company_profiles.count({
    where: { isVerified: true }
  });
  const companiesWithJobs = await prisma.company_profiles.count({
    where: {
      jobs: {
        some: {
          isActive: true
        }
      }
    }
  });

  const topIndustries = await prisma.company_profiles.groupBy({
    by: ['industry'],
    _count: {
      industry: true
    },
    orderBy: {
      _count: {
        industry: 'desc'
      }
    },
    take: 10
  });

  return {
    totalCompanies,
    verifiedCompanies,
    companiesWithJobs,
    verificationRate: Math.round((verifiedCompanies / totalCompanies) * 100),
    topIndustries: topIndustries.map(item => ({
      industry: item.industry,
      count: item._count.industry
    }))
  };
}

async function getAvailableIndustries() {
  const industries = await prisma.company_profiles.findMany({
    select: { industry: true },
    distinct: ['industry'],
    where: { industry: { not: null } }
  });
  return industries.map(item => item.industry).filter(Boolean);
}

async function getAvailableSizes() {
  const sizes = await prisma.company_profiles.findMany({
    select: { companySize: true },
    distinct: ['companySize'],
    where: { companySize: { not: null } }
  });
  return sizes.map(item => item.companySize).filter(Boolean);
}

async function getAvailableLocations() {
  const locations = await prisma.company_profiles.findMany({
    select: { city: true },
    distinct: ['city'],
    where: { city: { not: null } }
  });
  return locations.map(item => item.city).filter(Boolean);
}

// PUT /api/companies/profile - Update current company profile (authenticated)
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const updateData = req.body;

    // Update company profile
    const updatedCompany = await prisma.company_profiles.update({
      where: { userId },
      data: {
        companyName: updateData.companyName,
        description: updateData.description,
        industry: updateData.industry,
        companySize: updateData.companySize,
        founded: updateData.foundedYear?.toString(),
        website: updateData.website,
        phone: updateData.phone,
        city: updateData.location?.split(',')[0]?.trim(),
        country: updateData.location?.split(',')[1]?.trim() || 'Vietnam',
        linkedin: updateData.socialLinks?.linkedin,
        facebook: updateData.socialLinks?.facebook,
        twitter: updateData.socialLinks?.twitter,
        updatedAt: new Date(),
      },
    });

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('company-profile-updated', {
        companyId: updatedCompany.id,
        userId,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: updatedCompany,
      message: 'Company profile updated successfully'
    });

    logger.info(`✏️ Company profile updated for user: ${userId}`);

  } catch (error) {
    logger.error('Error updating company profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
