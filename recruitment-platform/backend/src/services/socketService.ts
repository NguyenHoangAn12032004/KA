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

    // Handle typing indicators
    socket.on('typing-start', (data) => {
      const { receiverId, senderId } = data;
      socket.to(`user-${receiverId}`).emit('user-typing', { senderId });
    });

    socket.on('typing-stop', (data) => {
      const { receiverId, senderId } = data;
      socket.to(`user-${receiverId}`).emit('user-stopped-typing', { senderId });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`🔌 User disconnected: ${socket.id}`);
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error('Socket error:', error);
    });
  });

  // Utility functions for emitting from outside socket handlers
  return {
    // Emit to specific user
    emitTousers: (userId: string, event: string, data: any) => {
      io.to(`user-${userId}`).emit(event, data);
    },

    // Emit to specific company
    emitToCompany: (companyId: string, event: string, data: any) => {
      io.to(`company-${companyId}`).emit(event, data);
    },

    // Emit to all users
    emitToAll: (event: string, data: any) => {
      io.emit(event, data);
    },

    // Emit to specific job room
    emitToJob: (jobId: string, event: string, data: any) => {
      io.to(`job-${jobId}`).emit(event, data);
    }
  };
};
