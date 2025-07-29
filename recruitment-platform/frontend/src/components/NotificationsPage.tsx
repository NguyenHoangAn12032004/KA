import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  IconButton,
  Divider,
  Chip,
  Button,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  alpha,
  useTheme,
  CircularProgress,
  Pagination,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Person,
  Work,
  Message,
  NotificationsActive,
  CheckCircle,
  Schedule,
  Error,
  Info,
  Delete,
  MoreVert,
  FilterList,
  DoneAll,
  Refresh
} from '@mui/icons-material';
import { notificationsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'APPLICATION_SUBMITTED' | 'APPLICATION_STATUS_CHANGED' | 'NEW_JOB_POSTED' | 'INTERVIEW_SCHEDULED' | 'MESSAGE_RECEIVED' | 'SYSTEM_ANNOUNCEMENT';
  isRead: boolean;
  createdAt: string;
  data?: any;
}

const NotificationsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('all');
  const [readFilter, setReadFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    loadNotifications();
  }, [page, typeFilter, readFilter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Gọi API để lấy thông báo
      // Nếu API chưa được triển khai, sử dụng dữ liệu mẫu
      try {
        const params: any = { page };
        if (typeFilter !== 'all') params.type = typeFilter;
        if (readFilter === 'unread') params.unread_only = true;
        
        const response = await notificationsAPI.getAll(params);
        setNotifications(response.data || []);
      } catch (error) {
        console.error("Error loading notifications:", error);
        // Sử dụng dữ liệu mẫu nếu API lỗi
        const mockNotifications = [
          {
            id: '1',
            title: 'Ứng viên mới',
            message: 'Nguyễn Văn A đã ứng tuyển vào vị trí Frontend Developer',
            type: 'APPLICATION_SUBMITTED' as 'APPLICATION_SUBMITTED',
            isRead: false,
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Lịch phỏng vấn',
            message: 'Phỏng vấn với Trần Thị B vào lúc 15:00 ngày mai',
            type: 'INTERVIEW_SCHEDULED' as 'INTERVIEW_SCHEDULED',
            isRead: false,
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            title: 'Tin nhắn mới',
            message: 'Bạn có tin nhắn mới từ Lê Văn C',
            type: 'MESSAGE_RECEIVED' as 'MESSAGE_RECEIVED',
            isRead: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '4',
            title: 'Cập nhật trạng thái',
            message: 'Đơn ứng tuyển của Phạm Thị D đã được chuyển sang trạng thái "Đã phỏng vấn"',
            type: 'APPLICATION_STATUS_CHANGED' as 'APPLICATION_STATUS_CHANGED',
            isRead: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '5',
            title: 'Việc làm mới',
            message: 'Có 3 việc làm mới phù hợp với bạn',
            type: 'NEW_JOB_POSTED' as 'NEW_JOB_POSTED',
            isRead: false,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '6',
            title: 'Thông báo hệ thống',
            message: 'Hệ thống sẽ bảo trì vào ngày 15/07/2025',
            type: 'SYSTEM_ANNOUNCEMENT' as 'SYSTEM_ANNOUNCEMENT',
            isRead: true,
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
          }
        ] as Notification[];
        setNotifications(mockNotifications);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast.error("Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  const handleTypeFilterChange = (event: SelectChangeEvent) => {
    setTypeFilter(event.target.value);
    setPage(1);
  };

  const handleReadFilterChange = (event: SelectChangeEvent) => {
    setReadFilter(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, notification: Notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, isRead: true } : notification
        )
      );
      toast.success("Đã đánh dấu đã đọc");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Không thể đánh dấu đã đọc");
    } finally {
      handleMenuClose();
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      toast.success("Đã đánh dấu tất cả là đã đọc");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Không thể đánh dấu tất cả là đã đọc");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      toast.success("Đã xóa thông báo");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Không thể xóa thông báo");
    } finally {
      handleMenuClose();
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

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    if (readFilter === 'read' && !notification.isRead) return false;
    if (readFilter === 'unread' && notification.isRead) return false;
    return true;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.95)} 0%, 
            ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" fontWeight={700}>
              Thông báo
            </Typography>
            {unreadCount > 0 && (
              <Badge 
                badgeContent={unreadCount} 
                color="error"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Làm mới">
              <IconButton onClick={() => loadNotifications()}>
                <Refresh />
              </IconButton>
            </Tooltip>
            {unreadCount > 0 && (
              <Button
                startIcon={<DoneAll />}
                variant="outlined"
                size="small"
                onClick={handleMarkAllAsRead}
              >
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </Box>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Loại thông báo</InputLabel>
            <Select
              value={typeFilter}
              onChange={handleTypeFilterChange}
              label="Loại thông báo"
              startAdornment={
                <FilterList sx={{ mr: 1, fontSize: 20 }} />
              }
            >
              <MenuItem value="all">Tất cả thông báo</MenuItem>
              <MenuItem value="APPLICATION_SUBMITTED">Ứng viên mới</MenuItem>
              <MenuItem value="APPLICATION_STATUS_CHANGED">Cập nhật trạng thái</MenuItem>
              <MenuItem value="NEW_JOB_POSTED">Việc làm mới</MenuItem>
              <MenuItem value="INTERVIEW_SCHEDULED">Lịch phỏng vấn</MenuItem>
              <MenuItem value="MESSAGE_RECEIVED">Tin nhắn</MenuItem>
              <MenuItem value="SYSTEM_ANNOUNCEMENT">Thông báo hệ thống</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={readFilter}
              onChange={handleReadFilterChange}
              label="Trạng thái"
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="read">Đã đọc</MenuItem>
              <MenuItem value="unread">Chưa đọc</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Notifications List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : paginatedNotifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Không có thông báo nào
            </Typography>
          </Box>
        ) : (
          <>
            <List sx={{ width: '100%' }}>
              {paginatedNotifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      py: 2,
                      px: 3,
                      borderRadius: 2,
                      mb: 1,
                      background: notification.isRead 
                        ? 'transparent'
                        : alpha(theme.palette.primary.main, 0.05),
                      borderLeft: notification.isRead
                        ? 'none'
                        : `4px solid ${theme.palette.primary.main}`,
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.08),
                      }
                    }}
                    secondaryAction={
                      <IconButton edge="end" onClick={(e) => handleMenuClick(e, notification)}>
                        <MoreVert />
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle1"
                          fontWeight={notification.isRead ? 400 : 700}
                        >
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{ display: 'block', mb: 0.5 }}
                          >
                            {notification.message}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatTimeAgo(notification.createdAt)}
                            </Typography>
                            <Chip
                              label={(() => {
                                switch (notification.type) {
                                  case 'APPLICATION_SUBMITTED': return 'Ứng viên mới';
                                  case 'APPLICATION_STATUS_CHANGED': return 'Cập nhật trạng thái';
                                  case 'NEW_JOB_POSTED': return 'Việc làm mới';
                                  case 'INTERVIEW_SCHEDULED': return 'Lịch phỏng vấn';
                                  case 'MESSAGE_RECEIVED': return 'Tin nhắn';
                                  case 'SYSTEM_ANNOUNCEMENT': return 'Hệ thống';
                                  default: return notification.type;
                                }
                              })()}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                />
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            borderRadius: 2,
            minWidth: 180,
            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.15)}`,
          }
        }}
      >
        {selectedNotification && !selectedNotification.isRead && (
          <MenuItem onClick={() => handleMarkAsRead(selectedNotification.id)}>
            <ListItemIcon>
              <CheckCircle fontSize="small" />
            </ListItemIcon>
            <ListItemText>Đánh dấu đã đọc</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => selectedNotification && handleDelete(selectedNotification.id)}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xóa thông báo</ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default NotificationsPage; 