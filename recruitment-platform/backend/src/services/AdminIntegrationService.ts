import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export interface UserAction {
  type: 'SUSPEND' | 'VERIFY' | 'MERGE' | 'ACTIVATE' | 'DELETE' | 'ROLE_CHANGE';
  reason?: string;
  sourceId?: string;
  targetId?: string;
  newRole?: UserRole;
}

export interface CrossRoleUpdate {
  type: string;
  entityId: string;
  entityType: 'USER' | 'JOB' | 'APPLICATION' | 'SYSTEM';
  data: any;
  affectedRoles: UserRole[];
}

export type EntityType = 'JOB' | 'APPLICATION' | 'USER' | 'COMPANY' | 'STUDENT';

// Simple socket interface
interface SimpleSocketService {
  emitToUser(userId: string, event: string, data: any): void;
  emitToAdmin(event: string, data: any): void;
  emitJobUpdate(jobId: string, data: any): void;
}

export class AdminIntegrationService {
  private socketService: SimpleSocketService;

  constructor(socketService?: SimpleSocketService) {
    this.socketService = socketService || {
      emitToUser: (userId: string, event: string, data: any) => {
        console.log(`📡 Socket emit to user ${userId}:`, event, data);
      },
      emitToAdmin: (event: string, data: any) => {
        console.log(`📡 Socket emit to admin:`, event, data);
      },
      emitJobUpdate: (jobId: string, data: any) => {
        console.log(`📡 Socket job update ${jobId}:`, data);
      }
    };
  }

  // Cross-role user management
  async manageUser(adminId: string, targetUserId: string, action: UserAction) {
    console.log('🔧 Admin managing user:', { adminId, targetUserId, action });
    
    const targetUser = await this.getUserWithAllProfiles(targetUserId);
    
    if (!targetUser) {
      throw new Error('Target user not found');
    }

    let result;
    
    switch (action.type) {
      case 'SUSPEND':
        result = await this.suspendUserAcrossRoles(adminId, targetUser, action.reason || 'Admin action');
        break;
      case 'VERIFY':
        result = await this.verifyUserProfile(adminId, targetUser);
        break;
      case 'ACTIVATE':
        result = await this.activateUser(adminId, targetUser);
        break;
      case 'DELETE':
        result = await this.deleteUser(adminId, targetUser, action.reason || 'Admin deletion');
        break;
      case 'ROLE_CHANGE':
        result = await this.changeUserRole(adminId, targetUser, action.newRole!);
        break;
      default:
        throw new Error('Invalid action type');
    }

    // Log admin action
    console.log('📝 Admin action logged:', {
      adminId,
      action: action.type,
      targetUserId,
      timestamp: new Date()
    });

    return result;
  }

  private async getUserWithAllProfiles(userId: string) {
    return await prisma.users.findUnique({
      where: { id: userId },
      include: {
        student_profiles: true,
        company_profiles: true
      }
    });
  }

  private async suspendUserAcrossRoles(adminId: string, user: any, reason: string) {
    // Update user status - only use existing fields
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: { 
        isActive: false
      }
    });

    // Handle role-specific suspensions
    if (user.role === 'COMPANY' && user.company_profiles) {
      // Deactivate all company jobs
      await prisma.jobs.updateMany({
        where: { companyId: user.company_profiles.id },
        data: { isActive: false }
      });
    }

    // Broadcast suspension notification
    await this.broadcastCrossRoleUpdate({
      type: 'USER_SUSPENDED',
      entityId: user.id,
      entityType: 'USER',
      data: { reason, suspendedBy: adminId },
      affectedRoles: ['ADMIN', user.role]
    });

    return updatedUser;
  }

  private async verifyUserProfile(adminId: string, user: any) {
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: { 
        isVerified: true
      }
    });

    // Role-specific verification
    if (user.role === 'COMPANY' && user.company_profiles) {
      await prisma.company_profiles.update({
        where: { id: user.company_profiles.id },
        data: { isVerified: true }
      });
    }

    await this.broadcastCrossRoleUpdate({
      type: 'USER_VERIFIED',
      entityId: user.id,
      entityType: 'USER',
      data: { verifiedBy: adminId },
      affectedRoles: ['ADMIN', user.role]
    });

    return updatedUser;
  }

  private async activateUser(adminId: string, user: any) {
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: { 
        isActive: true
      }
    });

    // Reactivate role-specific entities
    if (user.role === 'COMPANY' && user.company_profiles) {
      await prisma.jobs.updateMany({
        where: { companyId: user.company_profiles.id },
        data: { isActive: true }
      });
    }

    await this.broadcastCrossRoleUpdate({
      type: 'USER_ACTIVATED',
      entityId: user.id,
      entityType: 'USER',
      data: { activatedBy: adminId },
      affectedRoles: ['ADMIN', user.role]
    });

    return updatedUser;
  }

  private async deleteUser(adminId: string, user: any, reason: string) {
    try {
      // Start transaction to ensure data consistency
      const result = await prisma.$transaction(async (tx) => {
        // Delete related profiles first (foreign key constraints)
        if (user.student_profiles) {
          await tx.student_profiles.deleteMany({
            where: { userId: user.id }
          });
        }

        if (user.company_profiles) {
          await tx.company_profiles.deleteMany({
            where: { userId: user.id }
          });
        }

        // Delete applications
        await tx.applications.deleteMany({
          where: { 
            OR: [
              { studentId: user.id },
              { jobs: { companyId: user.id } }
            ]
          }
        });

        // Delete jobs if company
        if (user.role === 'COMPANY') {
          await tx.jobs.deleteMany({
            where: { companyId: user.id }
          });
        }

        // Finally delete the user
        const deletedUser = await tx.users.delete({
          where: { id: user.id }
        });

        return deletedUser;
      });

      // Broadcast deletion update
      await this.broadcastCrossRoleUpdate({
        type: 'USER_DELETED',
        entityId: user.id,
        entityType: 'USER',
        data: { reason, deletedBy: adminId, userEmail: user.email },
        affectedRoles: ['ADMIN']
      });

      console.log(`🗑️ User ${user.email} deleted by admin ${adminId}`);
      
      return { success: true, message: 'User successfully deleted' };
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw new Error('Failed to delete user: ' + (error as Error).message);
    }
  }

  private async changeUserRole(adminId: string, user: any, newRole: UserRole) {
    const oldRole = user.role;
    
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: { role: newRole }
    });

    await this.broadcastCrossRoleUpdate({
      type: 'USER_ROLE_CHANGED',
      entityId: user.id,
      entityType: 'USER',
      data: { oldRole, newRole, changedBy: adminId },
      affectedRoles: ['ADMIN', oldRole, newRole]
    });

    return updatedUser;
  }

  // Real-time cross-role notifications
  async broadcastCrossRoleUpdate(update: CrossRoleUpdate) {
    console.log('📡 Broadcasting cross-role update:', update);
    
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

  private async getAffectedUsers(update: CrossRoleUpdate) {
    // Get users affected by the update based on roles and entity
    const users = await prisma.users.findMany({
      where: {
        OR: [
          { role: { in: update.affectedRoles } },
          { id: update.entityId }
        ],
        isActive: true
      },
      select: { id: true, role: true, email: true }
    });

    return users;
  }

  private personalizeUpdate(update: CrossRoleUpdate, user: any) {
    // Personalize update message based on user role
    const baseUpdate = {
      ...update,
      timestamp: new Date(),
      userId: user.id
    };

    switch (user.role) {
      case 'STUDENT':
        return {
          ...baseUpdate,
          message: this.getStudentMessage(update)
        };
      case 'COMPANY':
        return {
          ...baseUpdate,
          message: this.getCompanyMessage(update)
        };
      case 'ADMIN':
        return {
          ...baseUpdate,
          message: this.getAdminMessage(update)
        };
      default:
        return baseUpdate;
    }
  }

  private getStudentMessage(update: CrossRoleUpdate): string {
    switch (update.type) {
      case 'USER_SUSPENDED':
        return 'Your account has been suspended by an administrator.';
      case 'USER_VERIFIED':
        return 'Your profile has been verified!';
      default:
        return 'System update notification.';
    }
  }

  private getCompanyMessage(update: CrossRoleUpdate): string {
    switch (update.type) {
      case 'USER_SUSPENDED':
        return 'Your company account has been suspended.';
      case 'USER_VERIFIED':
        return 'Your company profile has been verified!';
      default:
        return 'System update notification.';
    }
  }

  private getAdminMessage(update: CrossRoleUpdate): string {
    return `Admin action completed: ${update.type}`;
  }

  // Data synchronization across roles
  async syncDataAcrossRoles(entityType: EntityType, entityId: string) {
    console.log('🔄 Syncing data across roles:', { entityType, entityId });
    
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
      case 'COMPANY':
        await this.syncCompanyData(entityId);
        break;
      case 'STUDENT':
        await this.syncStudentData(entityId);
        break;
    }
  }

  private async syncJobData(jobId: string) {
    const job = await prisma.jobs.findUnique({
      where: { id: jobId },
      include: {
        applications: true,
        company_profiles: true
      }
    });

    if (!job) return;

    // Update related entities
    await this.updateJobViewCounts(jobId);
    await this.updateCompanyStats(job.companyId);

    // Real-time updates
    this.socketService.emitJobUpdate(jobId, {
      type: 'data_sync',
      timestamp: new Date()
    });
  }

  private async syncApplicationData(applicationId: string) {
    console.log('🔄 Syncing application data:', applicationId);
  }

  private async syncUserData(userId: string) {
    console.log('🔄 Syncing user data:', userId);
  }

  private async syncCompanyData(companyId: string) {
    console.log('🔄 Syncing company data:', companyId);
  }

  private async syncStudentData(studentId: string) {
    console.log('🔄 Syncing student data:', studentId);
  }

  private async updateJobViewCounts(jobId: string) {
    // Update job view statistics if job_views table exists
    try {
      const viewCount = await prisma.job_views.count({
        where: { jobId }
      });

      await prisma.jobs.update({
        where: { id: jobId },
        data: { viewCount }
      });
    } catch (error) {
      console.log('📊 Job views table not available:', error);
    }
  }

  private async updateCompanyStats(companyId: string) {
    // Update company statistics
    const [jobCount, applicationCount] = await Promise.all([
      prisma.jobs.count({ where: { companyId } }),
      prisma.applications.count({
        where: { jobs: { companyId } }
      })
    ]);

    console.log('📊 Company stats updated:', { companyId, jobCount, applicationCount });
  }
}
