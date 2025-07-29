import express, { Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';
import { v4 as uuid } from 'uuid';

const router = express.Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    companyId?: string;  // Make sure this property exists
  };
}

// Route to get all jobs with filters
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { search, location, category, type, salaryMin, salaryMax, page = 1, limit = 10, orderBy = 'latest' } = req.query;
    
    const filters: any = {
      isActive: true,
      AND: [] as any[]
    };
    
    // Add search filter
    if (search) {
      filters.AND.push({
        OR: [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          { company_profiles: { companyName: { contains: search as string, mode: 'insensitive' } } }
        ]
      });
    }
    
    // Add location filter
    if (location) {
      filters.AND.push({
        location: { contains: location as string, mode: 'insensitive' }
      });
    }
    
    // Add category filter
    if (category) {
      filters.AND.push({
        jobType: { equals: category as string }
      });
    }
    
    // Add job type filter
    if (type) {
      filters.AND.push({
        jobType: { equals: type as string }
      });
    }
    
    // Add salary range filter
    if (salaryMin || salaryMax) {
      if (salaryMin) {
        filters.AND.push({
          salaryMin: { gte: parseInt(salaryMin as string) }
        });
      }
      
      if (salaryMax) {
        filters.AND.push({
          salaryMax: { lte: parseInt(salaryMax as string) }
        });
      }
    }
    
    // If no AND filters, remove the empty array
    if (filters.AND.length === 0) {
      delete filters.AND;
    }

    // Determine ordering
    let orderByClause: any;
    switch(orderBy) {
      case 'salary_high':
        orderByClause = { salaryMax: 'desc' };
        break;
      case 'salary_low':
        orderByClause = { salaryMin: 'asc' };
        break;
      case 'oldest':
        orderByClause = { createdAt: 'asc' };
        break;
      case 'alphabetical':
        orderByClause = { title: 'asc' };
        break;
      case 'latest':
      default:
        orderByClause = { createdAt: 'desc' };
    }
    
    // Calculate pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;
    
    // Get the count of all matching jobs for pagination
    const totalCount = await prisma.job.count({
      where: filters
    });
    
    // Get jobs with company information
    const jobs = await prisma.job.findMany({
      where: filters,
      include: {
        company_profiles: {
          select: {
            companyName: true,
            logo: true,
            website: true
          }
        },
        _count: {
          select: {
            applications: true,
            jobViews: true // Thêm count của jobViews
          }
        }
      },
      orderBy: orderByClause,
      skip,
      take: limitNum
    });

    // Check if the user has applied to any of these jobs
    const userId = req.user?.id;
    let userApplications: Record<string, boolean> = {};
    
    if (userId) {
      const applications = await prisma.application.findMany({
        where: {
          studentId: userId,
          jobId: { in: jobs.map(job => job.id) }
        },
        select: {
          jobId: true
        }
      });
      
      console.log(`Found ${applications.length} applications for user ${userId}`);
      
      userApplications = applications.reduce((acc, app) => {
        acc[app.jobId] = true;
        console.log(`User ${userId} has applied to job ${app.jobId}`);
        return acc;
      }, {} as Record<string, boolean>);
    }
    
    // Get user's saved jobs if authenticated
    let userSavedJobs: Record<string, boolean> = {};
    
    if (userId) {
      const savedJobs = await prisma.savedJob.findMany({
        where: {
          userId,
          jobId: { in: jobs.map(job => job.id) }
        },
        select: {
          jobId: true,
          savedAt: true
        }
      });
      
      userSavedJobs = savedJobs.reduce((acc, saved) => {
        acc[saved.jobId] = true;
        return acc;
      }, {} as Record<string, boolean>);
    }
    
    // Format the response
    const formattedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company_profiles?.companyName || 'Unknown Company',
      companyLogo: job.company_profiles?.logo || null,
      companyWebsite: job.company_profiles?.website || null,
      location: job.location,
      description: job.description,
      requirements: job.requirements,
      responsibilities: job.responsibilities,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      jobType: job.jobType,
      category: job.jobType, // Sử dụng jobType thay cho category vì schema không có trường category
      postedAt: job.createdAt,
      applicationCount: job._count?.applications || 0,
      closingDate: job.applicationDeadline,
      isSaved: !!userSavedJobs[job.id],
      hasApplied: !!userApplications[job.id],
      viewCount: job.viewCount || job._count?.jobViews || 0, // Sử dụng jobViews nếu viewCount không tồn tại
      applicationsCount: job._count?.applications || 0,
      viewsCount: job.viewCount || job._count?.jobViews || 0 // Đảm bảo tương thích ngược
    }));
    
    res.json({
      success: true,
      data: {
        jobs: formattedJobs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs'
    });
  }
});

// Get saved jobs for the authenticated user
router.get('/saved', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Get saved jobs for this user
    const savedJobs = await prisma.savedJob.findMany({
      where: {
        userId: userId
      },
      include: {
        job: {
          include: {
            company_profiles: {
              select: {
                companyName: true,
                logo: true,
                industry: true
              }
            },
            _count: {
              select: {
                applications: true
              }
            }
          }
        }
      },
      orderBy: {
        savedAt: 'desc'
      }
    });

    // Format response
    const formattedJobs = savedJobs.map(savedJob => ({
      id: savedJob.job.id,
      title: savedJob.job.title,
      company: {
        id: savedJob.job.companyId,
        companyName: savedJob.job.company_profiles.companyName,
        logoUrl: savedJob.job.company_profiles.logo,
        industry: savedJob.job.company_profiles.industry
      },
      location: savedJob.job.location,
      type: savedJob.job.jobType,
      workMode: savedJob.job.workMode,
      experienceLevel: savedJob.job.experienceLevel,
      salaryMin: savedJob.job.salaryMin,
      salaryMax: savedJob.job.salaryMax,
      currency: savedJob.job.currency,
      publishedAt: savedJob.job.publishedAt,
      applicationsCount: savedJob.job._count.applications,
      savedAt: savedJob.savedAt
    }));

    res.json({
      success: true,
      data: formattedJobs
    });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch saved jobs'
    });
  }
});

// Get all jobs for a company
router.get('/company', authenticateToken, requireRole(['COMPANY', 'HR_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(403).json({
        success: false,
        error: 'Company ID not found'
      });
    }

    const jobs = await prisma.job.findMany({
      where: {
        companyId: companyId
      },
      include: {
        applications: {
          include: {
            student: {
              include: {
                studentProfile: true
              }
            }
          }
        },
        company_profiles: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Error fetching company jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company jobs'
    });
  }
});

// Get job by ID
router.get('/:id', async (req: Request, res) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthRequest).user?.id;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company_profiles: true,
        _count: {
          select: {
            applications: true
          }
        }
      }
    });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    
    // Record the job view consistently using JobView model
    try {
      // Create a record in job_views table, which will trigger the viewCount update
      await prisma.jobView.create({
        data: {
          id: uuid(),
          jobId: id,
          userId: userId || undefined,
          ipAddress: ipAddress || undefined,
          userAgent: userAgent || undefined
        }
      });
      
      console.log(`View recorded for job ${id}, user: ${userId || 'anonymous'}`);
    } catch (viewError) {
      console.error('Error recording job view:', viewError);
      // Don't update view count if recording fails
    }
    
    // Get the updated job with the current view count
    const updatedJob = await prisma.job.findUnique({
      where: { id },
      include: {
        company_profiles: true,
        _count: {
          select: {
            applications: true
          }
        }
      }
    });
    
    res.json({
      success: true,
      data: updatedJob || job // Use updated job or fall back to original
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job'
    });
  }
});

// Add a dedicated endpoint for tracking job views
router.post('/:id/view', async (req: Request, res) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthRequest).user?.id;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    
    console.log(`Recording view for job ${id}, userId: ${userId || 'anonymous'}`);
    
    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id }
    });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    
    // Record job view using JobView model
    await prisma.jobView.create({
      data: {
        id: uuid(),
        jobId: id,
        userId: userId || undefined,
        ipAddress: ipAddress || undefined,
        userAgent: userAgent || undefined
      }
    });
    
    console.log(`Successfully recorded view for job ${id}`);
    
    // Get updated view count
    const updatedJob = await prisma.job.findUnique({
      where: { id },
      select: { 
        viewCount: true,
        applicationsCount: true
      }
    });
    
    res.json({
      success: true,
      data: {
        viewCount: updatedJob?.viewCount || 0,
        applicationsCount: updatedJob?.applicationsCount || 0
      }
    });
  } catch (error) {
    console.error('Error recording job view:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record job view'
    });
  }
});

// Create new job
router.post('/', authenticateToken, requireRole(['COMPANY', 'HR_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const companyId = req.user?.companyId;
    
    console.log('📝 Creating new job with company ID:', companyId);
    console.log('👤 User details:', JSON.stringify(req.user, null, 2));
    console.log('📦 Received job data:', JSON.stringify(req.body, null, 2));

    if (!companyId) {
      console.log('❌ Company ID not found for user:', req.user?.id);
      return res.status(403).json({
        success: false,
        error: 'Company ID not found'
      });
    }

    // Format some fields to match the expected types
    const formattedData = {
      ...req.body,
      // Convert to arrays if they're strings
      requirements: Array.isArray(req.body.requirements) 
        ? req.body.requirements 
        : req.body.requirements?.split('\n').filter(Boolean) || [],
      benefits: Array.isArray(req.body.benefits)
        ? req.body.benefits
        : req.body.benefits?.split('\n').filter(Boolean) || [],
      responsibilities: Array.isArray(req.body.responsibilities)
        ? req.body.responsibilities
        : req.body.responsibilities?.split('\n').filter(Boolean) || [],
      // Match enum types
      jobType: req.body.jobType || req.body.type,
      // Make sure to include companyId
      companyId: companyId,
      publishedAt: new Date(),
      isActive: true
    };

    // Loại bỏ trường type vì prisma.job không có trường này
    // Chỉ sử dụng jobType theo đúng schema
    const { type, skills, ...dataToCreate } = formattedData;

    // Xử lý skills - chuyển sang requiredSkills
    if (skills && Array.isArray(skills)) {
      dataToCreate.requiredSkills = skills;
    }

    // Xử lý applicationDeadline - chuyển từ chuỗi ngày thành đối tượng Date
    if (dataToCreate.applicationDeadline && typeof dataToCreate.applicationDeadline === 'string') {
      try {
        // Nếu chỉ là ngày không có giờ (YYYY-MM-DD), thêm giờ vào
        if (dataToCreate.applicationDeadline.length === 10) {
          dataToCreate.applicationDeadline = new Date(`${dataToCreate.applicationDeadline}T23:59:59.999Z`);
        } else {
          dataToCreate.applicationDeadline = new Date(dataToCreate.applicationDeadline);
        }
        
        // Kiểm tra nếu không phải là Date hợp lệ thì xóa
        if (isNaN(dataToCreate.applicationDeadline.getTime())) {
          console.log('❌ Ngày không hợp lệ, xóa trường applicationDeadline');
          delete dataToCreate.applicationDeadline;
        }
      } catch (e) {
        console.log('❌ Lỗi khi chuyển đổi applicationDeadline thành Date:', e);
        // Nếu có lỗi, xóa trường này để tránh lỗi validation
        delete dataToCreate.applicationDeadline;
      }
    }

    console.log('🔄 Formatted job data để tạo:', JSON.stringify(dataToCreate, null, 2));

    const job = await prisma.job.create({
      data: dataToCreate
    });

    console.log('✅ Job created successfully:', job.id);

    // Emit socket event for new job
    const io = req.app.get('io');
    if (io) {
      io.emit('new-job-posted', job);
      console.log('📣 Socket event emitted: new-job-posted');
    } else {
      console.log('⚠️ Socket IO not available');
    }

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('❌ Error creating job:', error);
    // More detailed error information
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create job',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Save a job
router.post('/:id/save', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id }
    });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Check if already saved
    const existingSave = await prisma.savedJob.findFirst({
      where: {
        jobId: id,
        userId: userId
      }
    });

    if (existingSave) {
      return res.status(400).json({
        success: false,
        error: 'Job already saved'
      });
    }

    // Save the job
    await prisma.savedJob.create({
      data: {
        jobId: id,
        userId: userId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Job saved successfully'
    });
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save job'
    });
  }
});

// Unsave a job
router.delete('/:id/save', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Delete the saved job record
    await prisma.savedJob.deleteMany({
      where: {
        jobId: id,
        userId: userId
      }
    });

    res.json({
      success: true,
      message: 'Job unsaved successfully'
    });
  } catch (error) {
    console.error('Error unsaving job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unsave job'
    });
  }
});

export default router;
