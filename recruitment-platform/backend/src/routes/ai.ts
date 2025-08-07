import { Router, Request, Response } from 'express';
import { geminiAI } from '../services/geminiAIService';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import AdvancedRateLimiter from '../middleware/rateLimiter';
import { logger } from '../utils/logger';
import { cacheService } from '../services/cacheService';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for CV uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});

// Apply rate limiting to AI endpoints
router.use(AdvancedRateLimiter.apiLimiter);

// CV Analysis Endpoint
router.post('/analyze-cv', authenticateToken, upload.single('cv'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { jobId, requirements } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'CV file is required'
      });
    }

    // Extract text from uploaded file (simplified - in production use proper text extraction)
    const cvText = req.file.buffer.toString('utf-8');
    
    // Get job requirements
    let jobRequirements: string[] = [];
    if (jobId) {
      const job = await prisma.jobs.findUnique({
        where: { id: jobId },
        select: { requirements: true }
      });
      jobRequirements = job?.requirements || [];
    } else if (requirements) {
      jobRequirements = Array.isArray(requirements) ? requirements : [requirements];
    }

    if (jobRequirements.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Job requirements are needed for analysis'
      });
    }

    const analysis = await geminiAI.analyzeCV(cvText, jobRequirements);

    // Log the analysis for tracking
    logger.info('CV analysis completed', {
      userId,
      jobId,
      score: analysis.score,
      fileSize: req.file.size
    });

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    logger.error('CV analysis error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id 
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to analyze CV'
    });
  }
});

// Job Matching Endpoint
router.get('/job-matches', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    // Get user profile
    const userProfile = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        student_profiles: {
          include: {
            student_experiences: true,
            student_educations: true
          }
        }
      }
    });

    if (!userProfile?.student_profiles) {
      return res.status(400).json({
        success: false,
        error: 'Student profile not found. Please complete your profile first.'
      });
    }

    // Get available jobs (limit to recent ones)
    const jobs = await prisma.jobs.findMany({
      where: {
        isActive: true
      },
      include: {
        company_profiles: {
          select: {
            companyName: true,
            industry: true
          }
        }
      },
      take: 50, // Limit for AI processing
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Prepare candidate profile for AI
    const candidateProfile = {
      id: userId,
      skills: userProfile.student_profiles.skills || [],
      experience: userProfile.student_profiles.student_experiences?.map(e => e.description || e.company || '').join('. ') || '',
      education: userProfile.student_profiles.student_educations?.map(e => `${e.degree || ''} in ${e.fieldOfStudy || ''} from ${e.institution || ''}`).join('. ') || '',
      preferences: {
        location: req.query.location,
        jobType: req.query.jobType,
        experienceLevel: req.query.experienceLevel
      }
    };

    const matchResult = await geminiAI.findMatchingJobs(candidateProfile, jobs);

    // Cache result for user
    const cacheKey = `job_matches:${userId}`;
    await cacheService.set(cacheKey, matchResult, 1800); // 30 minutes

    logger.info('Job matching completed', {
      userId,
      totalJobs: jobs.length,
      matches: matchResult.recommendedJobs.length
    });

    res.json({
      success: true,
      data: matchResult
    });

  } catch (error) {
    logger.error('Job matching error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id 
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to find job matches'
    });
  }
});

// Chatbot Endpoint
router.post('/chat', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { message, context } = req.body;
    const userId = req.user?.id;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Prepare context
    const chatContext = {
      userType: req.user?.role,
      currentPage: context?.currentPage || 'unknown',
      userHistory: context?.userHistory || {},
      userId
    };

    const response = await geminiAI.handleChatQuery(message, chatContext);

    // Log chat interaction
    logger.info('Chat interaction', {
      userId,
      messageLength: message.length,
      needsHumanAgent: response.needsHumanAgent
    });

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    logger.error('Chat error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id 
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to process chat message'
    });
  }
});

// Job Description Generator (for companies)
router.post('/generate-job-description', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const jobInfo = req.body;

    // Verify user is company/HR
    if (req.user?.role !== 'COMPANY' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Only companies can generate job descriptions'
      });
    }

    // Validate required fields
    const requiredFields = ['title', 'company', 'location', 'experienceLevel'];
    const missingFields = requiredFields.filter(field => !jobInfo[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const jobDescription = await geminiAI.generateJobDescription(jobInfo);

    logger.info('Job description generated', {
      userId,
      title: jobInfo.title,
      company: jobInfo.company
    });

    res.json({
      success: true,
      data: {
        description: jobDescription
      }
    });

  } catch (error) {
    logger.error('Job description generation error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id 
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate job description'
    });
  }
});

// Interview Questions Generator (for companies)
router.post('/generate-interview-questions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { jobTitle, skills, experienceLevel } = req.body;

    // Verify user is company/HR
    if (req.user?.role !== 'COMPANY' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Only companies can generate interview questions'
      });
    }

    if (!jobTitle || !skills || !experienceLevel) {
      return res.status(400).json({
        success: false,
        error: 'Job title, skills, and experience level are required'
      });
    }

    const skillsArray = Array.isArray(skills) ? skills : [skills];
    const questions = await geminiAI.generateInterviewQuestions(jobTitle, skillsArray, experienceLevel);

    logger.info('Interview questions generated', {
      userId,
      jobTitle,
      skillsCount: skillsArray.length,
      questionsCount: questions.length
    });

    res.json({
      success: true,
      data: {
        questions
      }
    });

  } catch (error) {
    logger.error('Interview questions generation error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id 
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate interview questions'
    });
  }
});

// AI Analytics - Get insights about user activity
router.get('/insights', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { period = '30d' } = req.query;

    const cacheKey = `ai_insights:${userId}:${period}`;
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      return res.json({
        success: true,
        data: cached
      });
    }

    // Get user activity data
    const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const userActivity = await prisma.analytics.findMany({
      where: {
        userId,
        date: {
          gte: startDate
        }
      }
    });

    // Generate AI insights about user behavior
    const insightPrompt = `
      Analyze this user activity data and provide insights:
      
      Activity Data: ${JSON.stringify(userActivity)}
      
      Provide insights in JSON format:
      {
        "summary": "Brief summary of user activity",
        "trends": ["trend 1", "trend 2"],
        "recommendations": ["recommendation 1", "recommendation 2"],
        "score": <engagement score 0-100>
      }
    `;

    // For demo purposes, create mock insights
    const insights = {
      summary: "User shows consistent engagement with job searching activities",
      trends: [
        "Increased activity in technology sector jobs",
        "Regular profile views suggesting good visibility"
      ],
      recommendations: [
        "Consider updating your skills section",
        "Apply to more remote positions based on your activity"
      ],
      score: 75
    };

    // Cache for 6 hours
    await cacheService.set(cacheKey, insights, 21600);

    res.json({
      success: true,
      data: insights
    });

  } catch (error) {
    logger.error('AI insights error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.id 
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate insights'
    });
  }
});

export default router;
