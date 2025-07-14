import { Router } from 'express';
import { prisma } from '../utils/database';
import { JobType, ExperienceLevel, WorkMode } from '@prisma/client';

const router = Router();

// Helper function to parse salary range from string like "15-20"
function parseSalaryRange(salaryString: string): { min: number; max: number } | null {
  if (!salaryString) return null;
  
  const match = salaryString.match(/(\d+)[-–](\d+)/);
  if (match) {
    return {
      min: parseInt(match[1]) * 1000000, // Convert millions to actual amount
      max: parseInt(match[2]) * 1000000
    };
  }
  
  // If single number, use it as both min and max
  const singleMatch = salaryString.match(/(\d+)/);
  if (singleMatch) {
    const amount = parseInt(singleMatch[1]) * 1000000;
    return { min: amount, max: amount };
  }
  
  return null;
}

// Get all jobs with filters
router.get('/', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '10',
      search,
      jobType,
      workMode,
      location,
      experienceLevel,
      salaryMin,
      salaryMax
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      isActive: true
    };

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Job type filter
    if (jobType) {
      where.jobType = jobType;
    }

    // Work mode filter
    if (workMode) {
      where.workMode = workMode;
    }

    // Location filter
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    // Experience level filter
    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }

    // Salary range filter
    if (salaryMin || salaryMax) {
      where.AND = [];
      if (salaryMin) {
        where.AND.push({ salaryMin: { gte: parseInt(salaryMin as string) } });
      }
      if (salaryMax) {
        where.AND.push({ salaryMax: { lte: parseInt(salaryMax as string) } });
      }
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company_profiles: {
            select: {
              companyName: true,
              logo: true,
              city: true,
              industry: true
            }
          },
          _count: {
            select: {
              applications: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.job.count({ where })
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company_profiles: {
          select: {
            companyName: true,
            logo: true,
            description: true,
            website: true,
            city: true,
            industry: true,
            companySize: true
          }
        },
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
        message: 'Job not found'
      });
    }

    // Increment view count
    await prisma.job.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create new job (company only)
router.post('/', async (req, res) => {
  try {
    const jobData = req.body;
    
    // Map frontend fields to database schema
    const salaryRange = parseSalaryRange(jobData.salary);
    
    const mappedData = {
      title: jobData.title,
      description: jobData.description,
      requirements: jobData.requirements ? [jobData.requirements] : [],
      location: jobData.location,
      jobType: (jobData.job_type?.toUpperCase() as JobType) || JobType.FULL_TIME,
      workMode: WorkMode.ONSITE, // Default work mode
      experienceLevel: (jobData.experience_level?.toUpperCase() as ExperienceLevel) || ExperienceLevel.ENTRY,
      salaryMin: salaryRange?.min || 0,
      salaryMax: salaryRange?.max || 0,
      currency: 'VND',
      isActive: jobData.status === 'active',
      publishedAt: new Date(),
      companyId: '78276bd3-69fe-4907-ab06-2ffe4cfaf774' // Use existing company ID from GET response
    };

    const job = await prisma.job.create({
      data: mappedData,
      include: {
        company_profiles: {
          select: {
            companyName: true,
            logo: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
