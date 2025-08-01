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
  CircularProgress
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
  Info
} from '@mui/icons-material';
import { notificationsAPI } from '../services/api';
import { toast } from 'react-toastify';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'APPLICATION_SUBMITTED' | 'APPLICATION_STATUS_CHANGED' | 'NEW_JOB_POSTED' | 'INTERVIEW_SCHEDULED' | 'MESSAGE_RECEIVED' | 'SYSTEM_ANNOUNCEMENT';
  isRead: boolean;
  createdAt: string;
}

const NotificationsMenu: React.FC = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const open = Boolean(anchorEl);

  useEffect(() => {
    // Tính số thông báo chưa đọc
    if (Array.isArray(notifications)) {
      setUnreadCount(notifications.filter(notification => !notification.isRead).length);
    } else {
      setUnreadCount(0);
    }
  }, [notifications]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    loadNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Gọi API để lấy thông báo
      // Nếu API chưa được triển khai, sử dụng dữ liệu mẫu
      try {
        const response = await notificationsAPI.getAll({ unread_only: false, page: 1 });
        // Handle different response structures
        const notificationsData = (response as any).notifications || response.data || (response as any) || [];
        setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      } catch (error) {
        console.error("Error loading notifications:", error);
        // Sử dụng dữ liệu mẫu nếu API lỗi
        setNotifications([
          {
            id: '1',
            title: 'Ứng viên mới',
            message: 'Nguyễn Văn A đã ứng tuyển vào vị trí Frontend Developer',
            type: 'APPLICATION_SUBMITTED',
            isRead: false,
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Lịch phỏng vấn',
            message: 'Phỏng vấn với Trần Thị B vào lúc 15:00 ngày mai',
            type: 'INTERVIEW_SCHEDULED',
            isRead: false,
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            title: 'Tin nhắn mới',
            message: 'Bạn có tin nhắn mới từ Lê Văn C',
            type: 'MESSAGE_RECEIVED',
            isRead: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '4',
            title: 'Cập nhật trạng thái',
            message: 'Đơn ứng tuyển của Phạm Thị D đã được chuyển sang trạng thái "Đã phỏng vấn"',
            type: 'APPLICATION_STATUS_CHANGED',
            isRead: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast.error("Không thể tải thông báo");
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
        return <Person color="primary" />;
      case 'APPLICATION_STATUS_CHANGED':
        return <CheckCircle color="success" />;
      case 'NEW_JOB_POSTED':
        return <Work color="info" />;
      case 'INTERVIEW_SCHEDULED':
        return <Schedule color="warning" />;
      case 'MESSAGE_RECEIVED':
        return <Message color="secondary" />;
      case 'SYSTEM_ANNOUNCEMENT':
        return <Info color="info" />;
      default:
        return <NotificationsActive color="primary" />;
    }
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
              onClick={() => {
                markAsRead(notification.id);
                handleClose();
              }}
              sx={{ 
                p: 2,
                borderLeft: notification.isRead ? 'none' : `4px solid ${theme.palette.primary.main}`,
                background: notification.isRead ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                '&:hover': {
                  background: alpha(theme.palette.primary.main, 0.1)
                }
              }}
            >
              <ListItemIcon>
                {getNotificationIcon(notification.type)}
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
    </Box>
  );
};

export default NotificationsMenu; 