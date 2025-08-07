import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface NotificationData {
  userId: string;
  type: 'APPLICATION_SUBMITTED' | 'APPLICATION_STATUS_CHANGED' | 'NEW_JOB_POSTED' | 'INTERVIEW_SCHEDULED' | 'MESSAGE_RECEIVED' | 'SYSTEM_ANNOUNCEMENT';
  title: string;
  message: string;
  data?: any;
}

export class NotificationService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  /**
   * Create and send a notification to a user
   */
  async createAndSendNotification(notificationData: NotificationData): Promise<void> {
    try {
      // Create notification in database
      const notification = await prisma.notifications.create({
        data: {
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId: notificationData.userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          data: notificationData.data || {},
          isRead: false,
          createdAt: new Date()
        }
      });

      // Send real-time notification via socket
      this.io.to(`user-${notificationData.userId}`).emit('notification:new', {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        isRead: notification.isRead,
        readAt: notification.readAt,
        createdAt: notification.createdAt.toISOString(),
        timestamp: new Date()
      });

      logger.info(`🔔 Notification created and sent to user ${notificationData.userId}: ${notificationData.title}`);
    } catch (error) {
      logger.error('❌ Error creating notification:', error);
    }
  }

  /**
   * Send notification for new job application
   */
  async notifyNewApplication(data: {
    companyUserId: string;
    studentName: string;
    jobTitle: string;
    applicationId: string;
    jobId: string;
    studentId: string;
  }): Promise<void> {
    await this.createAndSendNotification({
      userId: data.companyUserId,
      type: 'APPLICATION_SUBMITTED',
      title: 'Ứng viên mới',
      message: `${data.studentName} đã ứng tuyển vào vị trí ${data.jobTitle}`,
      data: {
        applicationId: data.applicationId,
        jobId: data.jobId,
        studentId: data.studentId,
        studentName: data.studentName,
        jobTitle: data.jobTitle
      }
    });
  }

  /**
   * Send notification for application status change
   */
  async notifyApplicationStatusChange(data: {
    studentUserId: string;
    jobTitle: string;
    companyName: string;
    status: string;
    applicationId: string;
    jobId: string;
  }): Promise<void> {
    await this.createAndSendNotification({
      userId: data.studentUserId,
      type: 'APPLICATION_STATUS_CHANGED',
      title: 'Cập nhật trạng thái ứng tuyển',
      message: `Đơn ứng tuyển vào ${data.jobTitle} tại ${data.companyName} đã được cập nhật sang trạng thái "${data.status}"`,
      data: {
        applicationId: data.applicationId,
        jobId: data.jobId,
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        status: data.status
      }
    });
  }

  /**
   * Send notification for new job posting
   */
  async notifyNewJobPosted(data: {
    userIds: string[];
    jobTitle: string;
    companyName: string;
    jobId: string;
    salary?: string;
    location?: string;
  }): Promise<void> {
    const promises = data.userIds.map(userId =>
      this.createAndSendNotification({
        userId,
        type: 'NEW_JOB_POSTED',
        title: 'Việc làm mới',
        message: `Có việc làm mới phù hợp: ${data.jobTitle} tại ${data.companyName}`,
        data: {
          jobId: data.jobId,
          jobTitle: data.jobTitle,
          companyName: data.companyName,
          salary: data.salary,
          location: data.location
        }
      })
    );

    await Promise.all(promises);
  }

  /**
   * Send notification for interview scheduling
   */
  async notifyInterviewScheduled(data: {
    studentUserId: string;
    interviewId: string;
  }): Promise<void> {
    try {
      // Get interview details from database with full company information
      const interview = await prisma.interviews.findUnique({
        where: { id: data.interviewId },
        include: {
          jobs: {
            include: {
              company_profiles: true
            }
          },
          applications: {
            include: {
              users: true
            }
          },
          company_profiles: true  // Direct company profile relation
        }
      });

      if (!interview) {
        logger.error(`❌ Interview not found: ${data.interviewId}`);
        return;
      }

      const jobTitle = interview.jobs.title;
      const companyProfile = interview.jobs.company_profiles;
      const companyName = companyProfile.companyName;

      await this.createAndSendNotification({
        userId: data.studentUserId,
        type: 'INTERVIEW_SCHEDULED',
        title: 'Lịch phỏng vấn mới',
        message: `Bạn có lịch phỏng vấn cho vị trí ${jobTitle} tại ${companyName}`,
        data: {
          interviewId: interview.id,
          applicationId: interview.applicationId,
          jobId: interview.jobId,
          jobTitle: jobTitle,
          companyName: companyName,
          companyContactPerson: companyProfile.contactPerson,
          companyEmail: companyProfile.email,
          companyPhone: companyProfile.phone,
          companyAddress: companyProfile.address,
          companyWebsite: companyProfile.website,
          companyDescription: companyProfile.description,
          interviewTitle: interview.title,
          scheduledAt: interview.scheduledAt.toISOString(),
          duration: interview.duration,
          location: interview.location || companyProfile.address || 'Địa chỉ sẽ được thông báo sau',
          interviewLink: interview.meetingLink,
          interviewerName: interview.interviewer || companyProfile.contactPerson || 'Sẽ được thông báo sau',
          interviewerEmail: interview.interviewerEmail || companyProfile.email,
          interviewerPhone: companyProfile.phone,
          interviewType: interview.type,
          notes: interview.notes,
          description: interview.description,
          status: interview.status
        }
      });

      logger.info(`🔔 Interview notification sent for interview ${data.interviewId} to user ${data.studentUserId}`);
    } catch (error) {
      logger.error('❌ Error sending interview notification:', error);
    }
  }

  /**
   * Send notification for new message
   */
  async notifyNewMessage(data: {
    receiverUserId: string;
    senderName: string;
    preview: string;
    conversationId: string;
    messageId: string;
  }): Promise<void> {
    await this.createAndSendNotification({
      userId: data.receiverUserId,
      type: 'MESSAGE_RECEIVED',
      title: 'Tin nhắn mới',
      message: `Bạn có tin nhắn mới từ ${data.senderName}: ${data.preview}`,
      data: {
        conversationId: data.conversationId,
        messageId: data.messageId,
        senderName: data.senderName,
        preview: data.preview
      }
    });
  }

  /**
   * Send system announcement
   */
  async sendSystemAnnouncement(data: {
    userIds: string[];
    title: string;
    message: string;
    announcementData?: any;
  }): Promise<void> {
    const promises = data.userIds.map(userId =>
      this.createAndSendNotification({
        userId,
        type: 'SYSTEM_ANNOUNCEMENT',
        title: data.title,
        message: data.message,
        data: data.announcementData
      })
    );

    await Promise.all(promises);
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await prisma.notifications.count({
        where: {
          userId,
          isRead: false
        }
      });
      return count;
    } catch (error) {
      logger.error('❌ Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      await prisma.notifications.update({
        where: {
          id: notificationId,
          userId
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });

      // Emit read status update to user
      this.io.to(`user-${userId}`).emit('notification-read', {
        notificationId,
        timestamp: new Date()
      });

      return true;
    } catch (error) {
      logger.error('❌ Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      await prisma.notifications.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });

      // Emit all read status update to user
      this.io.to(`user-${userId}`).emit('all-notifications-read', {
        timestamp: new Date()
      });

      return true;
    } catch (error) {
      logger.error('❌ Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      await prisma.notifications.delete({
        where: {
          id: notificationId,
          userId
        }
      });

      // Emit delete notification to user
      this.io.to(`user-${userId}`).emit('notification-deleted', {
        notificationId,
        timestamp: new Date()
      });

      return true;
    } catch (error) {
      logger.error('❌ Error deleting notification:', error);
      return false;
    }
  }
}

export default NotificationService;
