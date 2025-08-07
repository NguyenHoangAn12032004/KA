import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface CrossRoleAnalytics {
  userStats: UserStats;
  interactionStats: InteractionStats;
  systemHealth: SystemHealth;
  crossRoleMetrics: CrossRoleMetrics;
  recommendations: string[];
}

export interface UserStats {
  totalUsers: number;
  usersByRole: Record<UserRole, number>;
  newUsersToday: number;
  activeUsersToday: number;
  verifiedUsers: number;
  suspendedUsers: number;
}

export interface InteractionStats {
  totalApplications: number;
  applicationsToday: number;
  totalJobs: number;
  activeJobs: number;
  totalCompanies: number;
  verifiedCompanies: number;
}

export interface SystemHealth {
  serverStatus: 'healthy' | 'warning' | 'critical';
  dbConnections: number;
  socketConnections: number;
  responseTime: number;
  errorRate: number;
  lastUpdated: Date;
}

export interface CrossRoleMetrics {
  studentCompanyInteractions: any[];
  universityPartnerships: any[];
  adminInterventions: any[];
  crossPlatformEngagement: any;
}

export interface SystemInsights {
  userGrowth: any[];
  engagementTrends: any[];
  bottlenecks: any[];
  actionableInsights: string[];
}

export class AdminAnalyticsService {
  async getCrossRoleAnalytics(timeRange: TimeRange): Promise<CrossRoleAnalytics> {
    console.log('📊 Getting cross-role analytics for range:', timeRange);

    try {
      const [
        userStats,
        interactionStats,
        systemHealth,
        crossRoleMetrics
      ] = await Promise.all([
        this.getUserStatsByRole(timeRange),
        this.getInteractionStatistics(timeRange),
        this.getSystemHealthMetrics(),
        this.getCrossRoleInteractionMetrics(timeRange)
      ]);

      console.log('📊 User Stats:', userStats);
      console.log('📊 Interaction Stats:', interactionStats);
      console.log('📊 System Health:', systemHealth);

      return {
        userStats,
        interactionStats,
        systemHealth,
        crossRoleMetrics,
        recommendations: await this.generateRecommendations()
      };
    } catch (error) {
      console.error('❌ Error in getCrossRoleAnalytics:', error);
      throw error;
    }
  }

  private async getUserStatsByRole(timeRange: TimeRange): Promise<UserStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      usersByRole,
      newUsersToday,
      activeUsersToday,
      verifiedUsers,
      suspendedUsers
    ] = await Promise.all([
      // Total users
      prisma.users.count(),
      
      // Users by role
      this.getUserCountByRole(),
      
      // New users today
      prisma.users.count({
        where: {
          createdAt: { gte: today }
        }
      }),
      
      // Active users today (assuming last login tracking)
      prisma.users.count({
        where: {
          isActive: true,
          updatedAt: { gte: today }
        }
      }),
      
      // Verified users
      prisma.users.count({
        where: { isVerified: true }
      }),
      
      // Suspended users
      prisma.users.count({
        where: { isActive: false }
      })
    ]);

    return {
      totalUsers,
      usersByRole,
      newUsersToday,
      activeUsersToday,
      verifiedUsers,
      suspendedUsers
    };
  }

  private async getUserCountByRole(): Promise<Record<UserRole, number>> {
    const roleCounts = await prisma.users.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    });

    const result: Record<UserRole, number> = {
      STUDENT: 0,
      COMPANY: 0,
      ADMIN: 0,
      HR_MANAGER: 0
    };

    roleCounts.forEach(roleCount => {
      result[roleCount.role] = roleCount._count.id;
    });

    return result;
  }

  private async getInteractionStatistics(timeRange: TimeRange): Promise<InteractionStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalApplications,
      applicationsToday,
      totalJobs,
      activeJobs,
      totalCompanies,
      verifiedCompanies
    ] = await Promise.all([
      // Total applications
      prisma.applications.count(),
      
      // Applications today
      prisma.applications.count({
        where: {
          createdAt: { gte: today }
        }
      }),
      
      // Total jobs
      prisma.jobs.count(),
      
      // Active jobs
      prisma.jobs.count({
        where: { isActive: true }
      }),
      
      // Total companies
      prisma.company_profiles.count(),
      
      // Verified companies
      prisma.company_profiles.count({
        where: { isVerified: true }
      })
    ]);

    return {
      totalApplications,
      applicationsToday,
      totalJobs,
      activeJobs,
      totalCompanies,
      verifiedCompanies
    };
  }

  private async getSystemHealthMetrics(): Promise<SystemHealth> {
    // Mock system health metrics - in real implementation, 
    // these would come from monitoring services
    const responseTime = await this.measureResponseTime();
    
    return {
      serverStatus: 'healthy',
      dbConnections: 10,
      socketConnections: 50,
      responseTime,
      errorRate: 0.1,
      lastUpdated: new Date()
    };
  }

  private async measureResponseTime(): Promise<number> {
    const start = Date.now();
    await prisma.users.count();
    return Date.now() - start;
  }

  private async getCrossRoleInteractionMetrics(timeRange: TimeRange): Promise<CrossRoleMetrics> {
    return {
      studentCompanyInteractions: await this.getStudentCompanyInteractions(timeRange),
      universityPartnerships: await this.getUniversityPartnerships(timeRange),
      adminInterventions: await this.getAdminInterventions(timeRange),
      crossPlatformEngagement: await this.getCrossPlatformEngagement(timeRange)
    };
  }

  private async getStudentCompanyInteractions(timeRange: TimeRange) {
    try {
      // Raw SQL query for complex analytics
      const interactions = await prisma.$queryRaw<any[]>`
        SELECT 
          DATE(a.created_at) as date,
          COUNT(DISTINCT a.student_id) as unique_students,
          COUNT(DISTINCT j.company_id) as unique_companies,
          COUNT(*) as total_applications,
          AVG(CASE WHEN a.status = 'ACCEPTED' THEN 1.0 ELSE 0.0 END) as success_rate
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        WHERE a.created_at >= ${timeRange.start}
          AND a.created_at <= ${timeRange.end}
        GROUP BY DATE(a.created_at)
        ORDER BY date DESC
        LIMIT 30
      `;

      return interactions.map(row => ({
        date: row.date,
        uniqueStudents: Number(row.unique_students),
        uniqueCompanies: Number(row.unique_companies),
        totalApplications: Number(row.total_applications),
        successRate: Number(row.success_rate)
      }));
    } catch (error) {
      console.error('Error getting student-company interactions:', error);
      return [];
    }
  }

  private async getUniversityPartnerships(timeRange: TimeRange) {
    // Mock data - implement when university features are added
    return [
      {
        universityId: 'univ-1',
        universityName: 'HUTECH',
        studentCount: 150,
        activeInternships: 25,
        placementRate: 0.85
      }
    ];
  }

  private async getAdminInterventions(timeRange: TimeRange) {
    // Mock data - implement when audit logs are available
    return [
      {
        date: new Date(),
        type: 'USER_SUSPENSION',
        count: 2,
        adminId: 'admin-1'
      },
      {
        date: new Date(),
        type: 'COMPANY_VERIFICATION',
        count: 5,
        adminId: 'admin-1'
      }
    ];
  }

  private async getCrossPlatformEngagement(timeRange: TimeRange) {
    // Calculate engagement metrics across different platform features
    const [jobViews, profileViews, applicationSubmissions] = await Promise.all([
      this.getJobViewMetrics(timeRange),
      this.getProfileViewMetrics(timeRange),
      this.getApplicationMetrics(timeRange)
    ]);

    return {
      jobViews,
      profileViews,
      applicationSubmissions,
      engagementScore: this.calculateEngagementScore({
        jobViews,
        profileViews,
        applicationSubmissions
      })
    };
  }

  private async getJobViewMetrics(timeRange: TimeRange) {
    try {
      const count = await prisma.job_views.count({
        where: {
          viewedAt: {
            gte: timeRange.start,
            lte: timeRange.end
          }
        }
      });
      return count;
    } catch (error) {
      console.log('Job views table not available');
      return 0;
    }
  }

  private async getProfileViewMetrics(timeRange: TimeRange) {
    // Mock data - implement when profile view tracking is added
    return 250;
  }

  private async getApplicationMetrics(timeRange: TimeRange) {
    return await prisma.applications.count({
      where: {
        createdAt: {
          gte: timeRange.start,
          lte: timeRange.end
        }
      }
    });
  }

  private calculateEngagementScore(metrics: any): number {
    // Simple engagement score calculation
    const { jobViews, profileViews, applicationSubmissions } = metrics;
    return Math.round((jobViews * 0.3 + profileViews * 0.2 + applicationSubmissions * 0.5) / 10);
  }

  async generateSystemInsights(): Promise<SystemInsights> {
    const [userGrowth, engagementTrends, bottlenecks] = await Promise.all([
      this.analyzeUserGrowthTrends(),
      this.analyzeEngagementTrends(),
      this.identifySystemBottlenecks()
    ]);

    return {
      userGrowth,
      engagementTrends,
      bottlenecks,
      actionableInsights: this.generateActionableInsights({
        userGrowth,
        engagementTrends,
        bottlenecks
      })
    };
  }

  private async analyzeUserGrowthTrends() {
    // Get user registration trends over the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const growthData = await prisma.$queryRaw<any[]>`
        SELECT 
          DATE(created_at) as date,
          role,
          COUNT(*) as new_users
        FROM users
        WHERE created_at >= ${thirtyDaysAgo}
        GROUP BY DATE(created_at), role
        ORDER BY date DESC
      `;

      return growthData.map(row => ({
        date: row.date,
        role: row.role,
        newUsers: Number(row.new_users)
      }));
    } catch (error) {
      console.error('Error analyzing user growth trends:', error);
      return [];
    }
  }

  private async analyzeEngagementTrends() {
    // Analyze engagement patterns
    return [
      {
        metric: 'Application Conversion Rate',
        value: 0.15,
        trend: 'increasing',
        change: 0.02
      },
      {
        metric: 'Job View to Application Rate',
        value: 0.08,
        trend: 'stable',
        change: 0.001
      }
    ];
  }

  private async identifySystemBottlenecks() {
    // Identify potential system bottlenecks
    return [
      {
        area: 'Database Queries',
        severity: 'medium',
        description: 'Some queries taking longer than expected',
        impact: 'Response time increase'
      },
      {
        area: 'Socket Connections',
        severity: 'low',
        description: 'Increasing number of concurrent connections',
        impact: 'Memory usage'
      }
    ];
  }

  private generateActionableInsights(data: any): string[] {
    const insights = [];

    // User growth insights
    if (data.userGrowth.length > 0) {
      const recentGrowth = data.userGrowth.slice(0, 7).reduce((sum: number, day: any) => sum + day.newUsers, 0);
      if (recentGrowth > 50) {
        insights.push('High user growth detected - consider scaling infrastructure');
      }
    }

    // Engagement insights
    if (data.engagementTrends.length > 0) {
      const conversionRate = data.engagementTrends.find((t: any) => t.metric === 'Application Conversion Rate');
      if (conversionRate && conversionRate.value < 0.1) {
        insights.push('Low application conversion rate - review job posting quality');
      }
    }

    // System bottlenecks
    if (data.bottlenecks.some((b: any) => b.severity === 'high')) {
      insights.push('Critical system bottlenecks detected - immediate attention required');
    }

    return insights;
  }

  private async generateRecommendations(): Promise<string[]> {
    const recommendations = [];

    // Check system metrics
    const userStats = await this.getUserStatsByRole({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    });

    // User verification recommendations
    const verificationRate = userStats.verifiedUsers / userStats.totalUsers;
    if (verificationRate < 0.5) {
      recommendations.push('Low user verification rate - consider implementing verification incentives');
    }

    // Company engagement recommendations
    if (userStats.usersByRole.COMPANY < userStats.usersByRole.STUDENT / 10) {
      recommendations.push('Low company to student ratio - focus on company acquisition');
    }

    // System health recommendations
    const systemHealth = await this.getSystemHealthMetrics();
    if (systemHealth.responseTime > 1000) {
      recommendations.push('High response times detected - consider database optimization');
    }

    return recommendations;
  }

  // Real-time analytics methods
  async getRealtimeMetrics() {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    return {
      activeUsers: await this.getActiveUsersCount(),
      todayApplications: await prisma.applications.count({
        where: { createdAt: { gte: startOfDay } }
      }),
      todayRegistrations: await prisma.users.count({
        where: { createdAt: { gte: startOfDay } }
      }),
      systemLoad: await this.getSystemLoad()
    };
  }

  private async getActiveUsersCount(): Promise<number> {
    // Mock active users - implement with real session tracking
    return Math.floor(Math.random() * 100) + 50;
  }

  private async getSystemLoad(): Promise<number> {
    // Mock system load - implement with real monitoring
    return Math.random() * 0.8 + 0.1;
  }
}
