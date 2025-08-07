# Đề xuất Cải tiến Admin Role cho Liên kết Chặt chẽ giữa các Role

## 🎯 Mục tiêu: Tạo Admin Role với khả năng liên kết và đồng bộ tất cả roles

### 1. **Enhanced Admin Authentication & Authorization**

```typescript
// backend/src/middleware/adminAuth.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../utils/database';

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify admin role
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Admin access required',
        userRole: req.user.role 
      });
    }

    // Get admin profile with enhanced permissions
    const adminProfile = await prisma.admin_profiles.findUnique({
      where: { userId: req.user.id },
      include: {
        permissions: true,
        auditLogs: true
      }
    });

    if (!adminProfile || !adminProfile.isActive) {
      return res.status(403).json({ error: 'Admin profile inactive' });
    }

    // Set admin context
    req.admin = {
      id: adminProfile.id,
      userId: req.user.id,
      permissions: adminProfile.permissions,
      canImpersonate: adminProfile.canImpersonate,
      accessLevel: adminProfile.accessLevel
    };

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(500).json({ error: 'Admin authentication failed' });
  }
};

// Multi-role access for admin
export const requireAdminOrOwner = (ownerField: string = 'userId') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Admin has universal access
    if (req.user.role === 'ADMIN') {
      await requireAdmin(req, res, next);
      return;
    }

    // Check if user owns the resource
    const resourceId = req.params.id;
    const userId = req.user.id;
    
    // Verify ownership based on resource type
    next();
  };
};
```

### 2. **Cross-Role Data Integration Service**

```typescript
// backend/src/services/AdminIntegrationService.ts
export class AdminIntegrationService {
  private socketService: SocketService;
  private auditService: AuditService;

  constructor() {
    this.socketService = new SocketService();
    this.auditService = new AuditService();
  }

  // Cross-role user management
  async manageUser(adminId: string, targetUserId: string, action: UserAction) {
    const targetUser = await this.getUserWithAllProfiles(targetUserId);
    
    switch (action.type) {
      case 'SUSPEND':
        return await this.suspendUserAcrossRoles(adminId, targetUser, action.reason);
      case 'VERIFY':
        return await this.verifyUserProfile(adminId, targetUser);
      case 'MERGE':
        return await this.mergeUserProfiles(adminId, action.sourceId, action.targetId);
      default:
        throw new Error('Invalid action type');
    }
  }

  private async getUserWithAllProfiles(userId: string) {
    return await prisma.users.findUnique({
      where: { id: userId },
      include: {
        student_profiles: {
          include: {
            student_educations: true,
            student_experiences: true,
            student_projects: true,
            applications: true
          }
        },
        company_profiles: {
          include: {
            jobs: true,
            applications: true
          }
        },
        university_profiles: true,
        admin_profiles: true
      }
    });
  }

  // Real-time cross-role notifications
  async broadcastCrossRoleUpdate(update: CrossRoleUpdate) {
    const affectedUsers = await this.getAffectedUsers(update);
    
    for (const user of affectedUsers) {
      const personalizedUpdate = this.personalizeUpdate(update, user);
      this.socketService.emitToUser(user.id, 'cross-role-update', personalizedUpdate);
    }

    // Admin dashboard update
    this.socketService.emitToAdmin('system-wide-update', {
      type: update.type,
      affectedUsers: affectedUsers.length,
      timestamp: new Date()
    });
  }

  // Data synchronization across roles
  async syncDataAcrossRoles(entityType: EntityType, entityId: string) {
    switch (entityType) {
      case 'JOB':
        await this.syncJobData(entityId);
        break;
      case 'APPLICATION':
        await this.syncApplicationData(entityId);
        break;
      case 'USER':
        await this.syncUserData(entityId);
        break;
    }
  }

  private async syncJobData(jobId: string) {
    const job = await prisma.jobs.findUnique({
      where: { id: jobId },
      include: {
        applications: true,
        company_profiles: true,
        job_views: true
      }
    });

    // Update related entities
    await this.updateJobViewCounts(jobId);
    await this.updateCompanyStats(job.companyId);
    await this.updateApplicationStatuses(job.applications);

    // Real-time updates
    this.socketService.emitJobUpdate(jobId, {
      type: 'data_sync',
      timestamp: new Date()
    });
  }
}
```

### 3. **Enhanced Socket Integration cho Cross-Role Communication**

```typescript
// backend/src/services/SocketService.ts
export class SocketService {
  private io: Server;
  private adminNamespace: Namespace;
  private userConnections: Map<string, Socket[]> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.adminNamespace = io.of('/admin');
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Admin namespace
    this.adminNamespace.on('connection', (socket) => {
      this.handleAdminConnection(socket);
    });

    // Main namespace
    this.io.on('connection', (socket) => {
      this.handleUserConnection(socket);
    });
  }

  private handleAdminConnection(socket: Socket) {
    socket.join('admin-room');

    // Cross-role monitoring
    socket.on('monitor-role', (roleType: string) => {
      socket.join(`monitor-${roleType}`);
    });

    // Direct user communication
    socket.on('admin-message-user', async (data) => {
      await this.sendAdminMessageToUser(data.userId, data.message, socket.user.id);
    });

    // System-wide broadcasts
    socket.on('admin-broadcast', async (data) => {
      await this.adminBroadcast(data, socket.user.id);
    });
  }

  // Cross-role event emission
  async emitCrossRoleEvent(event: CrossRoleEvent) {
    const { targetRoles, data, excludeUsers = [] } = event;

    for (const role of targetRoles) {
      const roleUsers = await this.getUsersByRole(role);
      
      for (const user of roleUsers) {
        if (!excludeUsers.includes(user.id)) {
          this.emitToUser(user.id, event.eventType, {
            ...data,
            roleSpecific: this.getRoleSpecificData(data, user.role)
          });
        }
      }
    }

    // Admin monitoring
    this.emitToAdmin('cross-role-event-sent', {
      eventType: event.eventType,
      targetRoles,
      affectedUsers: await this.countAffectedUsers(targetRoles, excludeUsers)
    });
  }

  // Role-specific data filtering
  private getRoleSpecificData(data: any, userRole: string) {
    switch (userRole) {
      case 'STUDENT':
        return {
          message: data.studentMessage || data.message,
          actionUrl: data.studentActionUrl
        };
      case 'COMPANY':
        return {
          message: data.companyMessage || data.message,
          actionUrl: data.companyActionUrl
        };
      default:
        return { message: data.message };
    }
  }

  // Enhanced notification system
  async notifyRoleChange(userId: string, fromRole: string, toRole: string, adminId: string) {
    // Notify the user
    this.emitToUser(userId, 'role-changed', {
      fromRole,
      toRole,
      adminId,
      timestamp: new Date(),
      message: `Your role has been changed from ${fromRole} to ${toRole}`
    });

    // Notify admins
    this.emitToAdmin('user-role-changed', {
      userId,
      fromRole,
      toRole,
      changedBy: adminId,
      timestamp: new Date()
    });

    // Role-specific notifications
    if (toRole === 'COMPANY') {
      this.emitToRole('ADMIN', 'new-company-user', { userId, adminId });
    }
  }
}
```

### 4. **Admin Dashboard với Cross-Role Analytics**

```typescript
// backend/src/services/AdminAnalyticsService.ts
export class AdminAnalyticsService {
  async getCrossRoleAnalytics(timeRange: TimeRange): Promise<CrossRoleAnalytics> {
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

    return {
      userStats,
      interactionStats,
      systemHealth,
      crossRoleMetrics,
      recommendations: await this.generateRecommendations()
    };
  }

  private async getCrossRoleInteractionMetrics(timeRange: TimeRange) {
    return {
      studentCompanyInteractions: await this.getStudentCompanyInteractions(timeRange),
      universityPartnerships: await this.getUniversityPartnerships(timeRange),
      adminInterventions: await this.getAdminInterventions(timeRange),
      crossPlatformEngagement: await this.getCrossPlatformEngagement(timeRange)
    };
  }

  private async getStudentCompanyInteractions(timeRange: TimeRange) {
    const interactions = await prisma.$queryRaw`
      SELECT 
        DATE(a.created_at) as date,
        COUNT(DISTINCT a.student_id) as unique_students,
        COUNT(DISTINCT j.company_id) as unique_companies,
        COUNT(*) as total_applications,
        AVG(CASE WHEN a.status = 'ACCEPTED' THEN 1 ELSE 0 END) as success_rate
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.created_at >= ${timeRange.start}
        AND a.created_at <= ${timeRange.end}
      GROUP BY DATE(a.created_at)
      ORDER BY date DESC
    `;

    return interactions;
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
}
```

### 5. **Real-time Admin Control Panel**

```typescript
// frontend/src/components/admin/AdminControlPanel.tsx
export const AdminControlPanel: React.FC = () => {
  const [crossRoleData, setCrossRoleData] = useState<CrossRoleData>();
  const [selectedRole, setSelectedRole] = useState<UserRole>('ALL');
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      // Subscribe to cross-role updates
      socket.on('cross-role-update', handleCrossRoleUpdate);
      socket.on('system-wide-metrics', handleSystemMetrics);
      socket.on('role-interaction-update', handleRoleInteraction);

      return () => {
        socket.off('cross-role-update');
        socket.off('system-wide-metrics');
        socket.off('role-interaction-update');
      };
    }
  }, [socket]);

  const handleRoleAction = async (action: AdminAction) => {
    try {
      const result = await adminAPI.executeAction(action);
      
      // Real-time feedback
      socket?.emit('admin-action-executed', {
        action: action.type,
        targetRole: action.targetRole,
        timestamp: new Date()
      });

      setSnackbar({
        open: true,
        message: `Action ${action.type} executed successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Admin action failed:', error);
    }
  };

  return (
    <AdminDashboardLayout>
      <Grid container spacing={3}>
        {/* Cross-Role Overview */}
        <Grid item xs={12}>
          <CrossRoleOverviewCard 
            data={crossRoleData}
            onRoleSelect={setSelectedRole}
          />
        </Grid>

        {/* Real-time Monitoring */}
        <Grid item xs={12} md={8}>
          <RealTimeMonitoringPanel 
            selectedRole={selectedRole}
            onAction={handleRoleAction}
          />
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <QuickActionsPanel 
            onAction={handleRoleAction}
          />
        </Grid>

        {/* Cross-Role Analytics */}
        <Grid item xs={12}>
          <CrossRoleAnalyticsCharts 
            data={crossRoleData?.analytics}
          />
        </Grid>
      </Grid>
    </AdminDashboardLayout>
  );
};
```

## 🔗 **Cải tiến tạo liên kết chặt chẽ:**

### ✅ **1. Unified Authentication Flow**
- Admin có thể impersonate các role khác
- Cross-role permission inheritance
- Real-time session management

### ✅ **2. Data Synchronization**
- Automatic cross-role data updates
- Conflict resolution mechanisms
- Real-time data consistency

### ✅ **3. Communication Bridge**
- Admin-to-any-role messaging
- Cross-role notifications
- System-wide announcements

### ✅ **4. Monitoring & Analytics**
- Cross-role interaction tracking
- System health monitoring
- Performance analytics across roles

### ✅ **5. Event-Driven Architecture**
- Real-time event propagation
- Role-specific event handling
- Admin oversight of all events

## 📈 **Benefits của cải tiến:**

1. **Tight Integration**: Admin role trở thành central hub
2. **Real-time Sync**: Data đồng bộ across all roles
3. **Enhanced Control**: Admin có full visibility và control
4. **Better UX**: Smooth interactions giữa các role
5. **Scalable Architecture**: Dễ extend cho new features

## 🎯 **Kết luận:**

Với những cải tiến này, **admin role sẽ tạo được liên kết cực kỳ chặt chẽ** giữa tất cả các role trong hệ thống, đảm bảo:
- Data consistency
- Real-time communication
- Centralized control
- Enhanced user experience
- System reliability
