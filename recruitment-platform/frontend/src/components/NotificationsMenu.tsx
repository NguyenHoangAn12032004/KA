import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
  alpha,
  useTheme,
  CircularProgress,
  Fade
} from '@mui/material';
import {
  Notifications,
  Person,
  Work,
  Message,
  NotificationsActive,
  CheckCircle,
  Schedule,
  Error,
  Info,
  Send,
  Visibility,
  BookmarkAdd,
  EventAvailable
} from '@mui/icons-material';
import { notificationsAPI } from '../services/api';
import { toast } from 'react-toastify';
import socketService from '../services/socketService';
import { useAuth } from '../contexts/AuthContext';
import NotificationDetailModal from './NotificationDetailModal';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'APPLICATION_SUBMITTED' | 'APPLICATION_STATUS_CHANGED' | 'NEW_JOB_POSTED' | 'INTERVIEW_SCHEDULED' | 'MESSAGE_RECEIVED' | 'SYSTEM_ANNOUNCEMENT' |
         'JOB_VIEWED' | 'JOB_SAVED' | 'JOB_APPLICATION' | 'INTERVIEW_SCHEDULED' | 'PROFILE_UPDATED';
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  jobTitle?: string;
  companyName?: string;
  icon?: React.ReactElement;
  color?: string;
  data?: any; // Additional data from realtime updates
}

const NotificationsMenu: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const open = Boolean(anchorEl);

  useEffect(() => {
    // Tính số thông báo chưa đọc
    if (Array.isArray(notifications)) {
      setUnreadCount(notifications.filter(notification => !notification.isRead).length);
    } else {
      setUnreadCount(0);
    }
  }, [notifications]);
  
  // Setup socket listeners for real-time notifications
  useEffect(() => {
    if (user?.id) {
      setupSocketListeners();
      // Load initial notifications
      loadNotifications();
    }
    
    return () => {
      // Cleanup socket listeners
      socketService.off('student-dashboard-update');
      socketService.off('job-view-updated');
      socketService.off('application-updated');
      socketService.off('profile-updated');
      socketService.off('interview-scheduled');
    };
  }, [user?.id]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    loadNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const setupSocketListeners = () => {
    if (!user?.id) return;
    
    // Listen for new notifications (IMPORTANT: This was missing!)
    socketService.on('notification:new', (notification: any) => {
      console.log('📨 [NotificationsMenu] Received new notification:', notification);
      
      // Add new notification to the list
      setNotifications(prev => {
        const newNotifications = [notification, ...prev];
        return newNotifications.slice(0, 20); // Keep only recent 20
      });
      
      // Update unread count
      setUnreadCount(prevCount => prevCount + 1);
      
      // Show toast notification
      toast.success(`Thông báo mới: ${notification.title}`, {
        position: "top-right",
        autoClose: 5000,
      });
    });

    // Listen for notification updates
    socketService.on('notification:updated', (notification: any) => {
      console.log('📝 [NotificationsMenu] Notification updated:', notification);
      
      // Update existing notification
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? notification : n)
      );
    });
    
    // Listen for dashboard-specific updates
    socketService.on('student-dashboard-update', (update: any) => {
      console.log('📊 [NotificationsMenu] Received dashboard update:', update);
      handleRealtimeUpdate(update);
    });

    // Listen for job view updates
    socketService.on('job-view-updated', (data: any) => {
      console.log('👁️ [NotificationsMenu] Job view update:', data);
      handleRealtimeUpdate({
        type: 'job_viewed',
        data,
        timestamp: new Date()
      });
    });

    // Listen for application updates
    socketService.on('application-updated', (data: any) => {
      console.log('📝 [NotificationsMenu] Application update:', data);
      handleRealtimeUpdate({
        type: 'application_updated',
        data,
        timestamp: new Date()
      });
    });

    // Listen for profile updates
    socketService.on('profile-updated', (data: any) => {
      console.log('👤 [NotificationsMenu] Profile update:', data);
      handleRealtimeUpdate({
        type: 'profile_updated',
        data,
        timestamp: new Date()
      });
    });
    
    // Listen for interview scheduling
    socketService.on('interview-scheduled', (data: any) => {
      console.log('📅 [NotificationsMenu] Interview scheduled:', data);
      handleRealtimeUpdate({
        type: 'interview_scheduled',
        data,
        timestamp: new Date()
      });
    });
  };
  
  const handleRealtimeUpdate = (update: any) => {
    // Create a new notification from the realtime update
    const notification: Notification = mapUpdateToNotification(update);
    
    // Add to notifications list with smooth animation
    setNotifications(prev => {
      const newNotifications = [notification, ...prev];
      // Keep only the most recent 20 notifications
      return newNotifications.slice(0, 20);
    });
    
    // Update unread count
    setUnreadCount(prevCount => prevCount + 1);
    
    // Show a toast for the new notification with proper styling based on notification type
    let toastType = 'info';
    
    switch (update.type) {
      case 'interview_scheduled':
        toastType = 'success';
        break;
      case 'application_updated':
        toastType = 'success';
        break;
      case 'profile_updated':
        toastType = 'info';
        break;
      default:
        toastType = 'info';
    }
    
    toast[toastType as 'info' | 'success'](notification.title, {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      style: {
        background: notification.color || theme.palette.info.main,
        color: 'white',
        borderRadius: '12px',
        fontSize: '14px'
      }
    });
  };
  
  const mapUpdateToNotification = (update: any): Notification => {
    const timestamp = update.timestamp || new Date();
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const data = update.data || {};
    
    // Default notification
    let notification: Notification = {
      id,
      title: 'Thông báo mới',
      message: 'Bạn có thông báo mới',
      type: 'SYSTEM_ANNOUNCEMENT',
      isRead: false,
      createdAt: timestamp instanceof Date ? timestamp.toISOString() : new Date().toISOString(),
      color: theme.palette.info.main
    };
    
    // Map based on type
    switch (update.type) {
      case 'job_viewed':
        notification = {
          ...notification,
          title: `Đã xem việc làm: ${data.jobTitle || 'Công việc'}`,
          message: `Bạn đã xem việc làm ${data.jobTitle || ''} tại ${data.companyName || ''}`,
          type: 'JOB_VIEWED',
          jobTitle: data.jobTitle,
          companyName: data.companyName,
          icon: <Visibility />,
          color: theme.palette.info.main
        };
        break;
        
      case 'job_saved':
        notification = {
          ...notification,
          title: `Đã lưu việc làm: ${data.jobTitle || 'Công việc'}`,
          message: `Bạn đã lưu việc làm ${data.jobTitle || ''} tại ${data.companyName || ''}`,
          type: 'JOB_SAVED',
          jobTitle: data.jobTitle,
          companyName: data.companyName,
          icon: <BookmarkAdd />,
          color: theme.palette.secondary.main
        };
        break;
        
      case 'application_updated':
        notification = {
          ...notification,
          title: `Cập nhật ứng tuyển: ${data.jobTitle || 'Công việc'}`,
          message: `Đơn ứng tuyển vào ${data.jobTitle || 'công việc'} tại ${data.companyName || ''} đã được cập nhật sang trạng thái ${data.status || ''}`,
          type: 'APPLICATION_STATUS_CHANGED',
          jobTitle: data.jobTitle,
          companyName: data.companyName,
          icon: <Send />,
          color: theme.palette.primary.main
        };
        break;
        
      case 'interview_scheduled':
        // Extract job title and company name from either data directly or nested objects
        const jobTitle = data.jobTitle || data.job?.title || data.title || 'Công việc';
        const companyName = data.companyName || data.company?.companyName || data.company || '';
        const scheduledTime = data.scheduledAt ? new Date(data.scheduledAt).toLocaleString('vi-VN') : 'thời gian đã định';
        
        notification = {
          ...notification,
          title: `Lịch phỏng vấn mới: ${jobTitle}`,
          message: `Bạn có lịch phỏng vấn cho vị trí ${jobTitle} tại ${companyName} vào ${scheduledTime}`,
          type: 'INTERVIEW_SCHEDULED',
          jobTitle: jobTitle,
          companyName: companyName,
          icon: <EventAvailable />,
          color: theme.palette.success.main
        };
        break;
        
      case 'profile_updated':
        notification = {
          ...notification,
          title: 'Hồ sơ đã cập nhật',
          message: 'Hồ sơ của bạn đã được cập nhật thành công',
          type: 'PROFILE_UPDATED',
          icon: <Person />,
          color: theme.palette.warning.main
        };
        break;
    }
    
    return notification;
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      console.log('📬 [NotificationsMenu] Loading notifications...');
      
      // Gọi API để lấy thông báo
      try {
        const response = await notificationsAPI.getAll({ unread_only: false, page: 1 });
        console.log('📬 [NotificationsMenu] API Response:', response);
        console.log('📬 [NotificationsMenu] Response data:', response.data);
        
        // Handle different response structures - fix the parsing
        const responseData = response.data || response;
        const notificationsData = responseData.notifications || responseData.data || [];
        const validNotifications = Array.isArray(notificationsData) ? notificationsData : [];
        
        console.log('📬 [NotificationsMenu] Response data notifications:', notificationsData);
        console.log('📬 [NotificationsMenu] Setting notifications:', validNotifications);
        setNotifications(validNotifications);
        
        if (validNotifications.length === 0) {
          console.log('📬 [NotificationsMenu] No notifications found, using empty array');
        } else {
          console.log(`📬 [NotificationsMenu] Successfully loaded ${validNotifications.length} notifications`);
        }
      } catch (apiError) {
        console.error("📬 [NotificationsMenu] API Error:", apiError);
        
        // Set empty array instead of mock data for cleaner testing
        console.log('📬 [NotificationsMenu] Setting empty notifications due to API error');
        setNotifications([]);
      }
    } catch (error) {
      console.error("📬 [NotificationsMenu] General Error:", error);
      toast.error("Không thể tải thông báo");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prevNotifications => {
        if (!Array.isArray(prevNotifications)) return prevNotifications;
        return prevNotifications.map(notification => 
          notification.id === id ? { ...notification, isRead: true } : notification
        );
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prevNotifications => {
        if (!Array.isArray(prevNotifications)) return prevNotifications;
        return prevNotifications.map(notification => ({ ...notification, isRead: true }));
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'APPLICATION_SUBMITTED':
        return <Send color="primary" />;
      case 'APPLICATION_STATUS_CHANGED':
        return <CheckCircle color="success" />;
      case 'NEW_JOB_POSTED':
        return <Work color="info" />;
      case 'INTERVIEW_SCHEDULED':
        return <EventAvailable color="warning" />;
      case 'MESSAGE_RECEIVED':
        return <Message color="secondary" />;
      case 'SYSTEM_ANNOUNCEMENT':
        return <Info color="info" />;
      case 'JOB_VIEWED':
        return <Visibility color="info" />;
      case 'JOB_SAVED':
        return <BookmarkAdd color="secondary" />;
      case 'JOB_APPLICATION':
        return <Send color="primary" />;
      case 'PROFILE_UPDATED':
        return <Person color="warning" />;
      default:
        return <NotificationsActive color="primary" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setDetailModalOpen(true);
    handleClose();
    
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const handleDetailModalClose = () => {
    setDetailModalOpen(false);
    setSelectedNotification(null);
  };

  const handleMarkReadFromModal = (id: string) => {
    markAsRead(id);
  };

  const handleDeleteFromModal = (id: string) => {
    setNotifications(prevNotifications => {
      if (!Array.isArray(prevNotifications)) return prevNotifications;
      return prevNotifications.filter(notification => notification.id !== id);
    });
    toast.success('Đã xóa thông báo');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} ngày trước`;
    } else if (diffHours > 0) {
      return `${diffHours} giờ trước`;
    } else if (diffMins > 0) {
      return `${diffMins} phút trước`;
    } else {
      return 'Vừa xong';
    }
  };

  return (
    <Box>
      <IconButton
        onClick={handleClick}
        size="large"
        aria-controls={open ? 'notifications-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        sx={{ 
          ml: 1,
          transition: 'all 0.3s ease',
          '&:hover': { 
            transform: 'scale(1.1)',
            background: alpha(theme.palette.primary.main, 0.1)
          }
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Notifications />
        </Badge>
      </IconButton>
      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 500,
            overflow: 'auto',
            borderRadius: 2,
            mt: 1.5,
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(10px)',
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>Thông báo</Typography>
          {unreadCount > 0 && (
            <Typography 
              variant="body2" 
              sx={{ 
                cursor: 'pointer', 
                color: theme.palette.primary.main,
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' }
              }}
              onClick={markAllRead}
            >
              Đánh dấu tất cả đã đọc
            </Typography>
          )}
        </Box>
        <Divider />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={30} />
          </Box>
        ) : !Array.isArray(notifications) || notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">Không có thông báo nào</Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{ 
                p: 2,
                borderLeft: notification.isRead ? 'none' : `4px solid ${notification.color || theme.palette.primary.main}`,
                background: notification.isRead ? 'transparent' : alpha(notification.color || theme.palette.primary.main, 0.05),
                '&:hover': {
                  background: alpha(notification.color || theme.palette.primary.main, 0.1)
                }
              }}
            >
              <ListItemIcon>
                {notification.icon || getNotificationIcon(notification.type)}
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography variant="subtitle2" fontWeight={notification.isRead ? 400 : 700}>
                    {notification.title}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        display: 'block',
                        fontWeight: notification.isRead ? 400 : 500
                      }}
                    >
                      {notification.message}
                    </Typography>
                    {notification.companyName && (
                      <Typography 
                        variant="body2" 
                        color="text.primary"
                        fontWeight={600}
                        sx={{ display: 'block', mt: 0.5 }}
                      >
                        {notification.companyName}
                      </Typography>
                    )}
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ mt: 0.5, display: 'block' }}
                    >
                      {formatTimeAgo(notification.createdAt)}
                    </Typography>
                  </>
                }
              />
            </MenuItem>
          ))
        )}
        
        <Divider />
        <MenuItem 
          onClick={handleClose}
          sx={{ 
            justifyContent: 'center', 
            py: 1.5,
            color: theme.palette.primary.main,
            fontWeight: 600
          }}
        >
          <Typography variant="body2" fontWeight={600}>Xem tất cả thông báo</Typography>
        </MenuItem>
      </Menu>

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        notification={selectedNotification}
        open={detailModalOpen}
        onClose={handleDetailModalClose}
        onMarkRead={handleMarkReadFromModal}
        onDelete={handleDeleteFromModal}
      />
    </Box>
  );
};

export default NotificationsMenu; 