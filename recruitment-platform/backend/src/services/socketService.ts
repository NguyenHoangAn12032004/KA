import { Server } from 'socket.io';
import { logger } from '../utils/logger';

export const initializeSocket = (io: Server) => {
  io.on('connection', (socket) => {
    logger.info(`🔌 User connected: ${socket.id}`);

    // Join user-specific room
    socket.on('join-user-room', (userId: string) => {
      socket.join(`user-${userId}`);
      logger.info(`👤 User ${userId} joined room: user-${userId}`);
    });

    // Join company-specific room
    socket.on('join-company-room', (companyId: string) => {
      socket.join(`company-${companyId}`);
      logger.info(`🏢 Company ${companyId} joined room: company-${companyId}`);
    });

    // Join all companies room for general updates
    socket.on('join-companies-room', () => {
      socket.join('all-companies');
      logger.info(`🏢 Joined all companies room`);
    });

    // Join job-specific room
    socket.on('join-job-room', (jobId: string) => {
      socket.join(`job-${jobId}`);
      logger.info(`💼 Joined job room: job-${jobId}`);
    });

    // Handle real-time messaging
    socket.on('send-message', (data) => {
      const { receiverId, message, senderId } = data;
      
      // Emit to specific user
      socket.to(`user-${receiverId}`).emit('new-message', {
        senderId,
        message,
        timestamp: new Date()
      });
      
      logger.info(`💬 Message sent from ${senderId} to ${receiverId}`);
    });

    // Handle application status updates
    socket.on('application-status-update', (data) => {
      const { studentId, jobId, status, companyId } = data;
      
      // Notify student
      socket.to(`user-${studentId}`).emit('application-status-changed', {
        jobId,
        status,
        timestamp: new Date()
      });
      
      // Notify company
      socket.to(`company-${companyId}`).emit('application-update', {
        studentId,
        jobId,
        status,
        timestamp: new Date()
      });
      
      logger.info(`📋 Application status updated: ${status} for job ${jobId}`);
    });

    // Handle new job applications
    socket.on('new-application', (data) => {
      const { jobId, companyId, studentId } = data;
      
      // Notify company
      socket.to(`company-${companyId}`).emit('new-application-received', {
        jobId,
        studentId,
        timestamp: new Date()
      });
      
      logger.info(`📥 New application for job ${jobId} from student ${studentId}`);
    });

    // Handle interview scheduling
    socket.on('interview-scheduled', (data) => {
      const { studentId, companyId, interviewData } = data;
      
      // Notify student
      socket.to(`user-${studentId}`).emit('interview-scheduled', {
        ...interviewData,
        timestamp: new Date()
      });
      
      logger.info(`📅 Interview scheduled for student ${studentId}`);
    });

    // ==================================================================
    // NEW: COMPANY REAL-TIME FEATURES
    // ==================================================================

    // Handle company profile updates
    socket.on('company-profile-updated', (data) => {
      const { companyId, updates, updatedBy } = data;
      
      // Notify all users in company room
      socket.to(`company-${companyId}`).emit('company-profile-changed', {
        companyId,
        updates,
        updatedBy,
        timestamp: new Date()
      });

      // Notify all companies room
      socket.to('all-companies').emit('company-updated', {
        companyId,
        updates,
        timestamp: new Date()
      });
      
      logger.info(`🏢 Company profile updated: ${companyId}`);
    });

    // Handle new company registration
    socket.on('new-company-registered', (data) => {
      const { company, registeredBy } = data;
      
      // Notify all companies room
      socket.to('all-companies').emit('new-company-added', {
        company,
        registeredBy,
        timestamp: new Date()
      });
      
      logger.info(`🆕 New company registered: ${company.companyName}`);
    });

    // Handle company follow/unfollow
    socket.on('company-follow-toggle', (data) => {
      const { companyId, userId, action, companyName } = data;
      
      // Notify company room
      socket.to(`company-${companyId}`).emit(`company-${action}`, {
        companyId,
        userId,
        companyName,
        timestamp: new Date()
      });

      // Notify user
      socket.to(`user-${userId}`).emit(`company-${action}-confirmed`, {
        companyId,
        companyName,
        timestamp: new Date()
      });
      
      logger.info(`👥 User ${userId} ${action} company ${companyId}`);
    });

    // Handle company view tracking
    socket.on('company-view-tracked', (data) => {
      const { companyId, userId, viewData } = data;
      
      // Notify company room for real-time stats
      socket.to(`company-${companyId}`).emit('company-view-update', {
        companyId,
        userId,
        viewData,
        timestamp: new Date()
      });

      // Notify all companies room for trending updates
      socket.to('all-companies').emit('company-view-tracked', {
        companyId,
        totalViews: viewData.totalViews,
        dailyViews: viewData.dailyViews,
        timestamp: new Date()
      });
      
      logger.info(`👁️ Company ${companyId} viewed by ${userId || 'anonymous'}`);
    });

    // Handle job posting by companies
    socket.on('new-job-posted', (data) => {
      const { jobId, companyId, jobData } = data;
      
      // Notify all users
      io.emit('new-job-available', {
        jobId,
        companyId,
        jobData,
        timestamp: new Date()
      });

      // Notify company followers
      socket.to(`company-${companyId}`).emit('company-job-posted', {
        jobId,
        jobData,
        timestamp: new Date()
      });
      
      logger.info(`💼 New job posted: ${jobData.title} by company ${companyId}`);
    });

    // Handle company statistics updates
    socket.on('company-stats-changed', (data) => {
      const { companyId, stats } = data;
      
      // Notify company room
      socket.to(`company-${companyId}`).emit('company-stats-updated', {
        companyId,
        stats,
        timestamp: new Date()
      });

      // Notify all companies room for ranking updates
      socket.to('all-companies').emit('company-ranking-update', {
        companyId,
        stats,
        timestamp: new Date()
      });
      
      logger.info(`📊 Company stats updated: ${companyId}`);
    });

    // Handle company verification status changes
    socket.on('company-verification-changed', (data) => {
      const { companyId, isVerified, verifiedBy } = data;
      
      // Notify company
      socket.to(`company-${companyId}`).emit('verification-status-changed', {
        isVerified,
        verifiedBy,
        timestamp: new Date()
      });

      // Notify all companies room
      socket.to('all-companies').emit('company-verification-update', {
        companyId,
        isVerified,
        timestamp: new Date()
      });
      
      logger.info(`✅ Company verification changed: ${companyId} - ${isVerified ? 'verified' : 'unverified'}`);
    });

    // Handle bulk company operations (admin)
    socket.on('bulk-company-operation', (data) => {
      const { operation, companyIds, operatedBy } = data;
      
      // Notify affected companies
      companyIds.forEach((companyId: string) => {
        socket.to(`company-${companyId}`).emit('company-bulk-operation', {
          operation,
          operatedBy,
          timestamp: new Date()
        });
      });

      // Notify all companies room
      socket.to('all-companies').emit('companies-bulk-updated', {
        operation,
        affectedCount: companyIds.length,
        operatedBy,
        timestamp: new Date()
      });
      
      logger.info(`🔄 Bulk operation ${operation} performed on ${companyIds.length} companies`);
    });

    // ==================================================================
    // ENHANCED EXISTING FEATURES
    // ==================================================================

    // Enhanced typing indicators with company context
    socket.on('typing-start', (data) => {
      const { receiverId, senderId, context } = data;
      socket.to(`user-${receiverId}`).emit('user-typing', { 
        senderId, 
        context,
        timestamp: new Date()
      });
    });

    socket.on('typing-stop', (data) => {
      const { receiverId, senderId, context } = data;
      socket.to(`user-${receiverId}`).emit('user-stopped-typing', { 
        senderId,
        context,
        timestamp: new Date()
      });
    });

    // Enhanced notification system
    socket.on('send-notification', (data) => {
      const { userId, notification, type } = data;
      
      socket.to(`user-${userId}`).emit('new-notification', {
        ...notification,
        type,
        timestamp: new Date()
      });
      
      logger.info(`🔔 Notification sent to user ${userId}: ${type}`);
    });

    // Broadcast system announcements
    socket.on('system-announcement', (data) => {
      const { announcement, targetRooms, announcedBy } = data;
      
      targetRooms.forEach((room: string) => {
        socket.to(room).emit('system-announcement', {
          announcement,
          announcedBy,
          timestamp: new Date()
        });
      });
      
      logger.info(`📢 System announcement broadcasted to ${targetRooms.length} rooms`);
    });

    // ==================================================================
    // CONNECTION MANAGEMENT
    // ==================================================================

    // Handle room leaving
    socket.on('leave-room', (room: string) => {
      socket.leave(room);
      logger.info(`👋 Socket ${socket.id} left room: ${room}`);
    });

    // Handle user status updates
    socket.on('user-status-update', (data) => {
      const { userId, status, context } = data;
      
      // Broadcast to relevant rooms
      socket.broadcast.emit('user-status-changed', {
        userId,
        status,
        context,
        timestamp: new Date()
      });
      
      logger.info(`👤 User ${userId} status updated: ${status}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`🔌 User disconnected: ${socket.id}`);
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error('Socket error:', error);
    });

    // ==================================================================
    // ADMIN MONITORING EVENTS
    // ==================================================================

    // Handle admin connection monitoring
    socket.on('admin-monitor-start', (adminId: string) => {
      socket.join('admin-monitoring');
      logger.info(`👑 Admin ${adminId} started monitoring`);
    });

    // Broadcast system metrics
    setInterval(() => {
      const connectedUsers = io.sockets.sockets.size;
      const rooms = Array.from(io.sockets.adapter.rooms.keys());
      
      io.to('admin-monitoring').emit('system-metrics', {
        connectedUsers,
        activeRooms: rooms.length,
        timestamp: new Date()
      });
    }, 30000); // Every 30 seconds

    // Log connection metrics
    logger.info(`📊 Total connected sockets: ${io.sockets.sockets.size}`);
  });

  // ==================================================================
  // POSTGRESQL NOTIFICATION LISTENERS
  // ==================================================================

  // Note: In a production environment, you would set up PostgreSQL LISTEN/NOTIFY
  // to automatically emit socket events when database triggers fire
  
  // Example setup (would require additional PostgreSQL client):
  /*
  pgClient.on('notification', (msg) => {
    const data = JSON.parse(msg.payload);
    
    switch (msg.channel) {
      case 'company_stats_updated':
        io.to('all-companies').emit('company-stats-updated', data);
        break;
      case 'company_view_tracked':
        io.to(`company-${data.companyId}`).emit('company-view-tracked', data);
        break;
      case 'job_application_count_updated':
        io.to(`company-${data.companyId}`).emit('job-stats-updated', data);
        break;
      // ... other database events
    }
  });
  */

  logger.info('🚀 Socket.IO service initialized with company real-time features');
};
