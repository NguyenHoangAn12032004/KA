import { Server, Socket, Namespace } from 'socket.io';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export interface CrossRoleEvent {
  eventType: string;
  targetRoles: UserRole[];
  data: any;
  excludeUsers?: string[];
}

export class AdminSocketService {
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

    // Main namespace for regular users
    this.io.on('connection', (socket) => {
      this.handleUserConnection(socket);
    });
  }

  private handleAdminConnection(socket: Socket) {
    console.log('🔑 Admin connected:', socket.id);
    
    // Verify admin authentication
    const user = (socket as any).user;
    if (!user || user.role !== 'ADMIN') {
      console.log('❌ Unauthorized admin connection');
      socket.disconnect();
      return;
    }

    // Join admin room
    socket.join('admin-room');
    console.log('🏢 Admin joined admin-room');

    // Cross-role monitoring
    socket.on('monitor-role', (roleType: string) => {
      socket.join(`monitor-${roleType}`);
      console.log(`📊 Admin monitoring role: ${roleType}`);
    });

    // Direct user communication
    socket.on('admin-message-user', async (data) => {
      await this.sendAdminMessageToUser(data.userId, data.message, user.id);
    });

    // System-wide broadcasts
    socket.on('admin-broadcast', async (data) => {
      await this.adminBroadcast(data, user.id);
    });

    // Real-time user management
    socket.on('admin-user-action', async (data) => {
      await this.handleAdminUserAction(data, user.id);
    });

    // Subscribe to real-time analytics
    socket.on('subscribe-analytics', () => {
      socket.join('admin-analytics');
      console.log('📊 Admin subscribed to analytics');
    });

    socket.on('disconnect', () => {
      console.log('🔌 Admin disconnected:', socket.id);
    });
  }

  private handleUserConnection(socket: Socket) {
    console.log('👤 User connected:', socket.id);

    const user = (socket as any).user;
    if (user) {
      // Store user connection
      if (!this.userConnections.has(user.id)) {
        this.userConnections.set(user.id, []);
      }
      this.userConnections.get(user.id)!.push(socket);

      // Join user-specific room
      socket.join(`user-${user.id}`);
      
      // Join role-specific room
      socket.join(`role-${user.role}`);

      console.log(`👤 User ${user.id} (${user.role}) joined rooms`);

      socket.on('disconnect', () => {
        // Remove from connections
        const userSockets = this.userConnections.get(user.id);
        if (userSockets) {
          const index = userSockets.indexOf(socket);
          if (index > -1) {
            userSockets.splice(index, 1);
          }
          if (userSockets.length === 0) {
            this.userConnections.delete(user.id);
          }
        }
        console.log('👤 User disconnected:', socket.id);
      });
    }
  }

  // Cross-role event emission
  async emitCrossRoleEvent(event: CrossRoleEvent) {
    console.log('📡 Emitting cross-role event:', event.eventType);

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
  private getRoleSpecificData(data: any, userRole: UserRole) {
    switch (userRole) {
      case 'STUDENT':
        return {
          message: data.studentMessage || data.message,
          actionUrl: data.studentActionUrl || data.actionUrl
        };
      case 'COMPANY':
        return {
          message: data.companyMessage || data.message,
          actionUrl: data.companyActionUrl || data.actionUrl
        };
      case 'ADMIN':
        return {
          message: data.adminMessage || data.message,
          actionUrl: data.adminActionUrl || data.actionUrl
        };
      default:
        return { message: data.message };
    }
  }

  // Enhanced notification system
  async notifyRoleChange(userId: string, fromRole: UserRole, toRole: UserRole, adminId: string) {
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

  // Utility methods
  emitToUser(userId: string, event: string, data: any) {
    this.io.to(`user-${userId}`).emit(event, {
      ...data,
      timestamp: new Date()
    });
    console.log(`📡 Emitted to user ${userId}:`, event);
  }

  emitToAdmin(event: string, data: any) {
    this.adminNamespace.to('admin-room').emit(event, {
      ...data,
      timestamp: new Date()
    });
    console.log(`📡 Emitted to admins:`, event);
  }

  emitToRole(role: UserRole, event: string, data: any) {
    this.io.to(`role-${role}`).emit(event, {
      ...data,
      timestamp: new Date()
    });
    console.log(`📡 Emitted to role ${role}:`, event);
  }

  emitJobUpdate(jobId: string, data: any) {
    this.io.to(`job-${jobId}`).emit('job-updated', {
      jobId,
      ...data,
      timestamp: new Date()
    });
    console.log(`📡 Job update emitted for job ${jobId}`);
  }

  // Admin-specific methods
  private async sendAdminMessageToUser(userId: string, message: string, adminId: string) {
    this.emitToUser(userId, 'admin-message', {
      message,
      adminId,
      type: 'direct',
      priority: 'high'
    });

    // Log admin message
    console.log(`💬 Admin ${adminId} sent message to user ${userId}`);
  }

  private async adminBroadcast(data: any, adminId: string) {
    const { targetRoles, message, priority = 'normal' } = data;

    if (targetRoles && targetRoles.length > 0) {
      // Broadcast to specific roles
      for (const role of targetRoles) {
        this.emitToRole(role, 'admin-broadcast', {
          message,
          adminId,
          priority,
          targetRole: role
        });
      }
    } else {
      // Broadcast to all users
      this.io.emit('admin-broadcast', {
        message,
        adminId,
        priority
      });
    }

    console.log(`📢 Admin broadcast sent by ${adminId} to roles:`, targetRoles || 'ALL');
  }

  private async handleAdminUserAction(data: any, adminId: string) {
    const { action, targetUserId, reason } = data;

    // Emit to target user
    this.emitToUser(targetUserId, 'admin-action', {
      action,
      reason,
      adminId,
      timestamp: new Date()
    });

    // Emit to other admins
    this.adminNamespace.to('admin-room').emit('admin-action-executed', {
      action,
      targetUserId,
      executedBy: adminId,
      timestamp: new Date()
    });

    console.log(`🔧 Admin action ${action} executed by ${adminId} on user ${targetUserId}`);
  }

  // Helper methods
  private async getUsersByRole(role: UserRole) {
    return await prisma.users.findMany({
      where: { role, isActive: true },
      select: { id: true, role: true, email: true }
    });
  }

  private async countAffectedUsers(targetRoles: UserRole[], excludeUsers: string[]) {
    const count = await prisma.users.count({
      where: {
        role: { in: targetRoles },
        isActive: true,
        id: { notIn: excludeUsers }
      }
    });
    return count;
  }

  // Real-time analytics methods
  async broadcastSystemMetrics(metrics: any) {
    this.adminNamespace.to('admin-analytics').emit('system-metrics', {
      ...metrics,
      timestamp: new Date()
    });
  }

  async broadcastUserActivity(activity: any) {
    this.adminNamespace.to('admin-room').emit('user-activity', {
      ...activity,
      timestamp: new Date()
    });
  }

  async broadcastSecurityAlert(alert: any) {
    this.adminNamespace.emit('security-alert', {
      ...alert,
      timestamp: new Date(),
      priority: 'critical'
    });
  }

  // Performance monitoring
  getConnectedUsers(): number {
    return this.userConnections.size;
  }

  getConnectedAdmins(): number {
    return this.adminNamespace.adapter.rooms.get('admin-room')?.size || 0;
  }

  getConnectionsByRole(role: UserRole): number {
    // Use the main namespace adapter to get room size
    return this.io.sockets.adapter.rooms.get(`role-${role}`)?.size || 0;
  }
}
