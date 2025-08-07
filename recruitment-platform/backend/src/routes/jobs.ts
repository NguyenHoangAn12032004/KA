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
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
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
    const totalCount = await prisma.jobs.count({
      where: filters
    });
    
    // Get jobs with company information
    const jobs = await prisma.jobs.findMany({
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
            job_views: true // Thêm count của job_views
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
    
    console.log(`🔍 [Jobs API] Checking applications for user: ${userId}`);
    
    if (userId) {
      const applications = await prisma.applications.findMany({
        where: {
          studentId: userId,
          jobId: { in: jobs.map(job => job.id) }
        },
        select: {
          jobId: true
        }
      });
      
      console.log(`📊 [Jobs API] Found ${applications.length} applications for user ${userId}`);
      console.log(`📊 [Jobs API] Job IDs in current page:`, jobs.map(job => job.id));
      console.log(`📊 [Jobs API] Application job IDs:`, applications.map(app => app.jobId));
      
      userApplications = applications.reduce((acc, app) => {
        acc[app.jobId] = true;
        console.log(`✅ [Jobs API] User ${userId} has applied to job ${app.jobId}`);
        return acc;
      }, {} as Record<string, boolean>);
    }
    
    // Get user's saved jobs if authenticated
    let userSavedJobs: Record<string, boolean> = {};
    
    if (userId) {
      const savedJobs = await prisma.saved_jobs.findMany({
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
    console.log(`📊 [Jobs API] Formatting ${jobs.length} jobs for response`);
    const formattedJobs = jobs.map(job => {
      const hasApplied = !!userApplications[job.id];
      console.log(`📋 [Jobs API] Job ${job.id} (${job.title}): hasApplied = ${hasApplied}`);
      
      return {
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
        hasApplied: hasApplied,
        viewCount: job.viewCount || job._count?.job_views || 0, // Sử dụng job_views nếu viewCount không tồn tại
        applicationsCount: job._count?.applications || 0,
        viewsCount: job.viewCount || job._count?.job_views || 0 // Đảm bảo tương thích ngược
      };
    });
    
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
    const savedJobs = await prisma.saved_jobs.findMany({
      where: {
        userId: userId
      },
      include: {
        jobs: {
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
      id: savedJob.jobs.id,
      title: savedJob.jobs.title,
      company: {
        id: savedJob.jobs.companyId,
        companyName: savedJob.jobs.company_profiles.companyName,
        logoUrl: savedJob.jobs.company_profiles.logo,
        industry: savedJob.jobs.company_profiles.industry
      },
      location: savedJob.jobs.location,
      type: savedJob.jobs.jobType,
      workMode: savedJob.jobs.workMode,
      experienceLevel: savedJob.jobs.experienceLevel,
      salaryMin: savedJob.jobs.salaryMin,
      salaryMax: savedJob.jobs.salaryMax,
      currency: savedJob.jobs.currency,
      publishedAt: savedJob.jobs.publishedAt,
      applicationsCount: savedJob.jobs._count?.applications || 0,
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

    const jobs = await prisma.jobs.findMany({
      where: {
        companyId: companyId
      },
      include: {
        applications: {
          include: {
            users: {
              include: {
                student_profiles: true
              }
            }
          }
        },
        company_profiles: true,
        _count: {
          select: {
            applications: true,
            job_views: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format jobs with proper view counts
    const formattedJobs = jobs.map(job => ({
      ...job,
      applicationsCount: job._count?.applications || 0,
      viewsCount: job.viewCount || job._count?.job_views || 0, // Use stored viewCount, fallback to real-time count
      viewCount: job.viewCount || job._count?.job_views || 0, // Ensure both fields are available
      // Also make sure _count data is preserved for compatibility
      _count: {
        applications: job._count?.applications || 0,
        job_views: job._count?.job_views || 0
      }
    }));

    res.json({
      success: true,
      data: formattedJobs
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
    
    const job = await prisma.jobs.findUnique({
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
      // FIXED: Only create one job view record for GET route
      await prisma.job_views.create({
        data: {
          id: uuid(),
          jobId: id,
          userId: userId || undefined,
          ipAddress: ipAddress || undefined,
          userAgent: userAgent || undefined,
          viewedAt: new Date()
        }
      });
      
      console.log(`View recorded for job ${id}, user: ${userId || 'anonymous'}`);
      
      // Track analytics event if user is logged in
      if (userId) {
        try {
          const analyticsResponse = await fetch('http://localhost:3001/api/analytics/track', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              metric: 'job_view',
              userId: userId,
              jobId: id,
              companyId: job.companyId,
              value: 1,
              metadata: {
                jobTitle: job.title,
                ipAddress: ipAddress,
                userAgent: userAgent
              }
            })
          });
          
          if (analyticsResponse.ok) {
            console.log('📊 Job view analytics tracked successfully');
          }
        } catch (error) {
          console.error('Failed to track job view analytics:', error);
        }
      }
      
      // Emit real-time analytics update via Socket.IO
      try {
        const io = req.app.get('io');
        if (io) {
          io.emit('analytics-update', {
            type: 'job_view',
            jobId: id,
            userId: userId,
            companyId: job.companyId,
            timestamp: new Date()
          });
          console.log('📡 Real-time analytics update emitted');
        }
      } catch (error) {
        console.error('Failed to emit real-time update:', error);
      }
    } catch (viewError) {
      console.error('Error recording job view:', viewError);
      // Don't update view count if recording fails
    }
    
    // Get the updated job with the current view count
    const updatedJob = await prisma.jobs.findUnique({
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
router.post('/:id/view', authenticateToken, async (req: Request, res) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthRequest).user?.id;
    const ipAddress = req.ip || req.connection.remoteAddress || '0.0.0.0';
    const userAgent = req.headers['user-agent'];
    
    // Get the job to check if it exists and get company info
    const job = await prisma.jobs.findUnique({
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
    
    // Record the job view
    try {
      // FIXED: Only create one job view record, not two!
      await prisma.job_views.create({
        data: {
          id: uuid(),
          jobId: id,
          userId: userId || undefined,
          ipAddress: ipAddress || undefined,
          userAgent: userAgent || undefined,
          viewedAt: new Date()
        }
      });
      
      console.log(`📊 View recorded for job ${id}, user: ${userId || 'anonymous'}`);
      
      // Emit real-time update to company dashboard
      const io = (req as any).io;
      if (io && job.company_profiles) {
        const updatedViewCount = await prisma.job_views.count({
          where: { jobId: id }
        });
        
        io.to(`company-${job.companyId}`).emit('job-viewed', {
          jobId: id,
          jobTitle: job.title,
          totalViews: updatedViewCount,
          viewedBy: userId || 'anonymous'
        });
        
        console.log(`📡 Emitted job-viewed event to company-${job.companyId}`);

        // � TRACK ANALYTICS EVENT
        // await trackAnalyticsEvent('job_view', userId, id, job.companyId, 1, {
        //   jobTitle: job.title,
        //   viewedAt: new Date(),
        //   userAgent: userAgent || undefined
        // });

        // �🚨 EMIT ANALYTICS UPDATE EVENTS FOR REAL-TIME DASHBOARD SYNC
        if (userId) {
          // Emit analytics-update event for student analytics dashboard
          io.to(`user-${userId}`).emit('analytics-update', {
            type: 'job_view',
            jobId: id,
            viewCount: updatedViewCount,
            timestamp: new Date()
          });

          console.log(`📊 Analytics update event emitted for job view ${id} by user ${userId}`);
        }

        // CRITICAL: Emit global analytics-update event for analytics dashboard real-time
        if (userId) {
          io.emit('analytics-update', {
            type: 'job_view',
            jobId: id,
            userId: userId,
            companyId: job.companyId,
            timestamp: new Date()
          });
          console.log('📡 CRITICAL: Global analytics-update event emitted for real-time dashboard');
        }

        // Emit dashboard-stats-update for general analytics
        io.emit('dashboard-stats-update', {
          type: 'job_view',
          companyId: job.companyId,
          jobId: id,
          totalViews: updatedViewCount,
          viewedBy: userId || 'anonymous',
          timestamp: new Date()
        });
      }
      
    } catch (viewError) {
      console.error('Error recording job view:', viewError);
    }
    
    // Get the updated job with current counts
    const updatedJob = await prisma.jobs.findUnique({
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
      data: updatedJob || job
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

    // 🔒 BUSINESS LOGIC: Check if company is verified before allowing job posting
    const companyProfile = await prisma.company_profiles.findUnique({
      where: { userId: req.user?.id },
      select: { 
        id: true, 
        isVerified: true, 
        companyName: true 
      }
    });

    if (!companyProfile) {
      console.log('❌ Company profile not found for user:', req.user?.id);
      return res.status(403).json({
        success: false,
        error: 'Company profile not found'
      });
    }

    if (!companyProfile.isVerified) {
      console.log(`🚫 Company ${companyProfile.companyName} (${companyProfile.id}) is not verified, cannot post jobs`);
      return res.status(403).json({
        success: false,
        error: 'Chỉ các công ty đã được xác thực mới có thể đăng tin tuyển dụng. Vui lòng chờ quản trị viên xác thực tài khoản công ty của bạn.',
        code: 'COMPANY_NOT_VERIFIED'
      });
    }

    console.log(`✅ Company ${companyProfile.companyName} is verified, proceeding with job creation`);

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

    // Generate unique ID for the job
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    dataToCreate.id = jobId;
    dataToCreate.updatedAt = new Date();

    console.log('🔄 Formatted job data để tạo:', JSON.stringify(dataToCreate, null, 2));

    const job = await prisma.jobs.create({
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
    const job = await prisma.jobs.findUnique({
      where: { id }
    });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Check if already saved
    const existingSave = await prisma.saved_jobs.findFirst({
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
    await prisma.saved_jobs.create({
      data: {
        id: `save-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
    await prisma.saved_jobs.deleteMany({
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

// Update job
router.put('/:id', authenticateToken, requireRole(['COMPANY', 'HR_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    const updateData = req.body;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // 🔒 BUSINESS LOGIC: Check if company is verified before allowing job updates
    const companyProfile = await prisma.company_profiles.findUnique({
      where: { userId: req.user?.id },
      select: { 
        id: true, 
        isVerified: true, 
        companyName: true 
      }
    });

    if (!companyProfile || !companyProfile.isVerified) {
      console.log(`🚫 Company ${companyProfile?.companyName || 'Unknown'} is not verified, cannot update jobs`);
      return res.status(403).json({
        success: false,
        error: 'Chỉ các công ty đã được xác thực mới có thể cập nhật tin tuyển dụng.',
        code: 'COMPANY_NOT_VERIFIED'
      });
    }

    // Check if job belongs to company
    const existingJob = await prisma.jobs.findUnique({
      where: { id },
      select: { companyId: true }
    });

    if (!existingJob || existingJob.companyId !== companyId) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or access denied'
      });
    }

    // Format update data
    const formattedUpdateData = {
      ...updateData,
      requirements: Array.isArray(updateData.requirements) 
        ? updateData.requirements 
        : updateData.requirements?.split('\n').filter(Boolean) || [],
      benefits: Array.isArray(updateData.benefits)
        ? updateData.benefits
        : updateData.benefits?.split('\n').filter(Boolean) || [],
      responsibilities: Array.isArray(updateData.responsibilities)
        ? updateData.responsibilities
        : updateData.responsibilities?.split('\n').filter(Boolean) || [],
      updatedAt: new Date()
    };

    const updatedJob = await prisma.jobs.update({
      where: { id },
      data: formattedUpdateData,
      include: {
        company_profiles: {
          select: {
            id: true,
            companyName: true,
            logo: true,
            city: true
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

    // Emit socket event for real-time updates
    const io = (req as any).app.get('io');
    if (io) {
      io.to(`company-${companyId}`).emit('job-updated', {
        jobId: id,
        job: updatedJob
      });
    }

    res.json({
      success: true,
      data: {
        ...updatedJob,
        applicationsCount: updatedJob._count.applications,
        viewCount: updatedJob._count.job_views
      }
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Toggle job status (pause/resume)
router.patch('/:id/status', authenticateToken, requireRole(['COMPANY', 'HR_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body; // true or false
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Validate isActive
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Invalid isActive value. Must be true or false'
      });
    }

    // Check if job belongs to company
    const existingJob = await prisma.jobs.findUnique({
      where: { id },
      select: { companyId: true, isActive: true }
    });

    if (!existingJob || existingJob.companyId !== companyId) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or access denied'
      });
    }

    const updatedJob = await prisma.jobs.update({
      where: { id },
      data: {
        isActive,
        updatedAt: new Date()
      },
      include: {
        _count: {
          select: {
            applications: true,
            job_views: true
          }
        }
      }
    });

    // Emit socket event for real-time updates
    const io = (req as any).app.get('io');
    if (io) {
      io.to(`company-${companyId}`).emit('job-status-updated', {
        jobId: id,
        isActive,
        job: updatedJob
      });
    }

    res.json({
      success: true,
      data: {
        ...updatedJob,
        applicationsCount: updatedJob._count.applications,
        viewCount: updatedJob._count.job_views
      },
      message: `Job ${isActive ? 'activated' : 'paused'} successfully`
    });
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete job
router.delete('/:id', authenticateToken, requireRole(['COMPANY', 'HR_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if job belongs to company
    const existingJob = await prisma.jobs.findUnique({
      where: { id },
      select: { companyId: true }
    });

    if (!existingJob || existingJob.companyId !== companyId) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or access denied'
      });
    }

    // Delete job (this will cascade delete related records)
    await prisma.jobs.delete({
      where: { id }
    });

    // Emit socket event for real-time updates
    const io = (req as any).app.get('io');
    if (io) {
      io.to(`company-${companyId}`).emit('job-deleted', {
        jobId: id
      });
    }

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get job applications
router.get('/:id/applications', authenticateToken, requireRole(['COMPANY', 'HR_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    const { page = 1, limit = 10, status: filterStatus } = req.query;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if job belongs to company
    const job = await prisma.jobs.findUnique({
      where: { id },
      select: { companyId: true, title: true }
    });

    if (!job || job.companyId !== companyId) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or access denied'
      });
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const whereClause: any = { jobId: id };
    
    if (filterStatus && filterStatus !== 'ALL') {
      whereClause.status = filterStatus;
    }

    const [applications, total] = await Promise.all([
      prisma.applications.findMany({
        where: whereClause,
        include: {
          users: {
            include: {
              student_profiles: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                  major: true,
                  university: true,
                  graduationYear: true,
                  skills: true,
                  experience: true,
                  phone: true,
                  portfolio: true,
                  github: true,
                  linkedin: true,
                  resume: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.applications.count({
        where: whereClause
      })
    ]);

    const formattedApplications = applications.map(app => ({
      id: app.id,
      status: app.status,
      appliedAt: app.createdAt,
      coverLetter: app.coverLetter,
      customResume: app.customResume,
      rating: app.rating,
      hrNotes: app.hrNotes,
      feedback: app.feedback,
      users: {
        id: app.users.id,
        email: app.users.email,
        firstName: app.users.student_profiles?.firstName || '',
        lastName: app.users.student_profiles?.lastName || '',
        fullName: `${app.users.student_profiles?.firstName || ''} ${app.users.student_profiles?.lastName || ''}`.trim(),
        avatar: app.users.student_profiles?.avatar,
        major: app.users.student_profiles?.major,
        university: app.users.student_profiles?.university,
        graduationYear: app.users.student_profiles?.graduationYear,
        skills: app.users.student_profiles?.skills || [],
        experience: app.users.student_profiles?.experience,
        phone: app.users.student_profiles?.phone,
        portfolio: app.users.student_profiles?.portfolio,
        github: app.users.student_profiles?.github,
        linkedin: app.users.student_profiles?.linkedin,
        resume: app.users.student_profiles?.resume
      }
    }));

    res.json({
      success: true,
      data: {
        applications: formattedApplications,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string))
        },
        jobTitle: job.title
      }
    });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;

