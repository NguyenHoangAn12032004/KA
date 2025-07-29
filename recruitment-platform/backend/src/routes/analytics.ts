import express, { Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    companyId?: string;
  };
}

// Lấy thông tin hiệu suất cho công ty
router.get('/company/performance', authenticateToken, requireRole(['COMPANY', 'HR_MANAGER']), async (req: AuthRequest, res) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(403).json({
        success: false,
        error: 'Company ID not found'
      });
    }

    // Lấy tất cả job của công ty
    const jobs = await prisma.job.findMany({
      where: { companyId: companyId },
      include: {
        applications: {
          include: {
            interviews: true
          }
        }
      }
    });

    // Tính toán các chỉ số
    const totalJobs = jobs.length;
    const totalApplications = jobs.reduce((sum, job) => sum + job.applications.length, 0);
    const totalInterviews = jobs.reduce((sum, job) => {
      return sum + job.applications.reduce((iSum, app) => iSum + app.interviews.length, 0);
    }, 0);
    const totalHired = jobs.reduce((sum, job) => {
      return sum + job.applications.filter(app => app.status === 'ACCEPTED').length;
    }, 0);
    const totalViews = jobs.reduce((sum, job) => sum + job.viewCount, 0);

    // Tính tỷ lệ
    const applicationRate = totalJobs > 0 ? totalApplications / totalJobs : 0;
    const interviewRate = totalApplications > 0 ? totalInterviews / totalApplications : 0;
    const hireRate = totalInterviews > 0 ? totalHired / totalInterviews : 0;

    // Lấy dữ liệu phân tích theo thời gian (30 ngày gần đây)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyMetrics = await prisma.analytics.findMany({
      where: {
        companyId: companyId,
        date: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Nhóm dữ liệu theo ngày và loại
    const metricsByDate = dailyMetrics.reduce((acc, metric) => {
      const dateStr = metric.date.toISOString().split('T')[0];
      if (!acc[dateStr]) {
        acc[dateStr] = {};
      }
      if (!acc[dateStr][metric.metric]) {
        acc[dateStr][metric.metric] = 0;
      }
      acc[dateStr][metric.metric] += metric.value;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalJobs,
        totalApplications,
        totalInterviews,
        totalHired,
        totalViews,
        applicationRate,
        interviewRate,
        hireRate,
        metrics: metricsByDate
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
