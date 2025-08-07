import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Chip,
  IconButton,
  Divider,
  Grid,
  Card,
  CardContent,
  ListItem,
  ListItemIcon,
  ListItemText,
  alpha,
  useTheme
} from '@mui/material';
import {
  Close,
  Person,
  Work,
  Schedule,
  Message,
  CheckCircle,
  Info,
  Business,
  Email,
  Phone,
  AccessTime,
  Visibility,
  MoreVert,
  NotificationsActive,
  Event,
  Send,
  BookmarkAdd,
  EventAvailable,
  Link,
  LocationOn,
  VideoCall
} from '@mui/icons-material';

interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

interface NotificationDetailModalProps {
  notification: NotificationData | null;
  open: boolean;
  onClose: () => void;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  notification,
  open,
  onClose,
  onMarkRead,
  onDelete
}) => {
  const theme = useTheme();

  if (!notification) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'APPLICATION_SUBMITTED':
        return <Send color="primary" sx={{ fontSize: 40 }} />;
      case 'APPLICATION_STATUS_CHANGED':
        return <CheckCircle color="success" sx={{ fontSize: 40 }} />;
      case 'NEW_JOB_POSTED':
        return <Work color="info" sx={{ fontSize: 40 }} />;
      case 'INTERVIEW_SCHEDULED':
        return <EventAvailable color="warning" sx={{ fontSize: 40 }} />;
      case 'MESSAGE_RECEIVED':
        return <Message color="secondary" sx={{ fontSize: 40 }} />;
      case 'SYSTEM_ANNOUNCEMENT':
        return <Info color="info" sx={{ fontSize: 40 }} />;
      case 'JOB_SAVED':
        return <BookmarkAdd color="secondary" sx={{ fontSize: 40 }} />;
      case 'PROFILE_UPDATED':
        return <Person color="warning" sx={{ fontSize: 40 }} />;
      case 'JOB_VIEW_TRACKED':
        return <Visibility color="info" sx={{ fontSize: 40 }} />;
      default:
        return <NotificationsActive color="primary" sx={{ fontSize: 40 }} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'APPLICATION_SUBMITTED':
        return theme.palette.primary.main;
      case 'APPLICATION_STATUS_CHANGED':
        return theme.palette.success.main;
      case 'NEW_JOB_POSTED':
        return theme.palette.info.main;
      case 'INTERVIEW_SCHEDULED':
        return theme.palette.warning.main;
      case 'MESSAGE_RECEIVED':
        return theme.palette.secondary.main;
      case 'SYSTEM_ANNOUNCEMENT':
        return theme.palette.info.main;
      case 'JOB_SAVED':
        return theme.palette.secondary.main;
      case 'PROFILE_UPDATED':
        return theme.palette.warning.main;
      case 'JOB_VIEW_TRACKED':
        return theme.palette.info.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'APPLICATION_SUBMITTED':
        return 'Ứng tuyển mới';
      case 'APPLICATION_STATUS_CHANGED':
        return 'Cập nhật trạng thái';
      case 'NEW_JOB_POSTED':
        return 'Việc làm mới';
      case 'INTERVIEW_SCHEDULED':
        return 'Lịch phỏng vấn';
      case 'MESSAGE_RECEIVED':
        return 'Tin nhắn';
      case 'SYSTEM_ANNOUNCEMENT':
        return 'Thông báo hệ thống';
      case 'JOB_SAVED':
        return 'Việc làm đã lưu';
      case 'PROFILE_UPDATED':
        return 'Cập nhật hồ sơ';
      case 'JOB_VIEW_TRACKED':
        return 'Lượt xem việc làm';
      default:
        return type;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDetailedInfo = () => {
    const data = notification.data || {};
    
    // Debug log to check data structure
    console.log('🔍 Notification data in modal:', data);
    console.log('🔍 Notification type:', notification.type);
    
    switch (notification.type) {
      case 'APPLICATION_SUBMITTED':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Thông tin ứng tuyển
            </Typography>
            <Grid container spacing={2}>
              {data.jobTitle && (
                <Grid item xs={12}>
                  <ListItem sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <Work color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Vị trí"
                      secondary={data.jobTitle}
                    />
                  </ListItem>
                </Grid>
              )}
              {data.companyName && (
                <Grid item xs={12}>
                  <ListItem sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <Business color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Công ty"
                      secondary={data.companyName}
                    />
                  </ListItem>
                </Grid>
              )}
              {data.studentName && (
                <Grid item xs={12}>
                  <ListItem sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <Person color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Ứng viên"
                      secondary={data.studentName}
                    />
                  </ListItem>
                </Grid>
              )}
            </Grid>
          </Box>
        );
        
      case 'APPLICATION_STATUS_CHANGED':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Chi tiết cập nhật
            </Typography>
            <Grid container spacing={2}>
              {data.jobTitle && (
                <Grid item xs={12}>
                  <ListItem sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <Work color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Vị trí"
                      secondary={data.jobTitle}
                    />
                  </ListItem>
                </Grid>
              )}
              {data.status && (
                <Grid item xs={12}>
                  <ListItem sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Trạng thái mới"
                      secondary={
                        <Chip 
                          label={data.status} 
                          color="success" 
                          size="small" 
                          sx={{ fontWeight: 600 }}
                        />
                      }
                    />
                  </ListItem>
                </Grid>
              )}
              {data.companyName && (
                <Grid item xs={12}>
                  <ListItem sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <Business color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Công ty"
                      secondary={data.companyName}
                    />
                  </ListItem>
                </Grid>
              )}
            </Grid>
          </Box>
        );
        
      case 'INTERVIEW_SCHEDULED':
        console.log('🎯 Rendering INTERVIEW_SCHEDULED with data:', data);
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Thông tin phỏng vấn
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ListItem sx={{ pl: 0 }}>
                  <ListItemIcon>
                    <Work color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Vị trí"
                    secondary={data.jobTitle || 'Chưa cập nhật'}
                  />
                </ListItem>
              </Grid>
              
              <Grid item xs={12}>
                <ListItem sx={{ pl: 0 }}>
                  <ListItemIcon>
                    <Business color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Công ty"
                    secondary={data.companyName || 'Chưa cập nhật'}
                  />
                </ListItem>
              </Grid>
              
              <Grid item xs={12}>
                <ListItem sx={{ pl: 0 }}>
                  <ListItemIcon>
                    <Schedule color="warning" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Thời gian & Thời lượng"
                    secondary={`${formatDateTime(data.scheduledAt)} (${data.duration || 60} phút)`}
                  />
                </ListItem>
              </Grid>
              
              <Grid item xs={12}>
                <ListItem sx={{ pl: 0 }}>
                  <ListItemIcon>
                    <LocationOn color="info" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Địa điểm phỏng vấn"
                    secondary={data.location || 'Chưa cập nhật'}
                  />
                </ListItem>
              </Grid>
              
              {data.interviewLink && (
                <Grid item xs={12}>
                  <ListItem sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <VideoCall color="secondary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Link phỏng vấn online"
                      secondary={
                        <Box component="a" 
                          href={data.interviewLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          sx={{ 
                            color: theme.palette.primary.main,
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          {data.interviewLink}
                        </Box>
                      }
                    />
                  </ListItem>
                </Grid>
              )}
            </Grid>

            {/* Company Information Section */}
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Thông tin công ty
            </Typography>
            <Grid container spacing={2}>
              {data.companyContactPerson && (
                <Grid item xs={12}>
                  <ListItem sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <Person color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Người liên hệ công ty"
                      secondary={data.companyContactPerson}
                    />
                  </ListItem>
                </Grid>
              )}
              
              {data.companyEmail && (
                <Grid item xs={12}>
                  <ListItem sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <Email color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Email công ty"
                      secondary={
                        <Box component="a" 
                          href={`mailto:${data.companyEmail}`}
                          sx={{ 
                            color: theme.palette.primary.main,
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          {data.companyEmail}
                        </Box>
                      }
                    />
                  </ListItem>
                </Grid>
              )}
              
              {data.companyPhone && (
                <Grid item xs={12}>
                  <ListItem sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <Phone color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Số điện thoại công ty"
                      secondary={
                        <Box component="a" 
                          href={`tel:${data.companyPhone}`}
                          sx={{ 
                            color: theme.palette.primary.main,
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          {data.companyPhone}
                        </Box>
                      }
                    />
                  </ListItem>
                </Grid>
              )}
              
              {data.companyAddress && (
                <Grid item xs={12}>
                  <ListItem sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <LocationOn color="warning" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Địa chỉ công ty"
                      secondary={data.companyAddress}
                    />
                  </ListItem>
                </Grid>
              )}
              
              {data.companyWebsite && (
                <Grid item xs={12}>
                  <ListItem sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <Link color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Website công ty"
                      secondary={
                        <Box component="a" 
                          href={data.companyWebsite} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          sx={{ 
                            color: theme.palette.primary.main,
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          {data.companyWebsite}
                        </Box>
                      }
                    />
                  </ListItem>
                </Grid>
              )}
            </Grid>

            {/* Interviewer Information Section */}
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Thông tin người phỏng vấn
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ListItem sx={{ pl: 0 }}>
                  <ListItemIcon>
                    <Person color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Người phỏng vấn"
                    secondary={data.interviewerName || 'Chưa cập nhật'}
                  />
                </ListItem>
              </Grid>
              
              {data.interviewerEmail && (
                <Grid item xs={12}>
                  <ListItem sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <Email color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Email người phỏng vấn"
                      secondary={
                        <Box component="a" 
                          href={`mailto:${data.interviewerEmail}`}
                          sx={{ 
                            color: theme.palette.primary.main,
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          {data.interviewerEmail}
                        </Box>
                      }
                    />
                  </ListItem>
                </Grid>
              )}
              
              {data.interviewerPhone && (
                <Grid item xs={12}>
                  <ListItem sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <Phone color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Số điện thoại người phỏng vấn"
                      secondary={
                        <Box component="a" 
                          href={`tel:${data.interviewerPhone}`}
                          sx={{ 
                            color: theme.palette.primary.main,
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          {data.interviewerPhone}
                        </Box>
                      }
                    />
                  </ListItem>
                </Grid>
              )}
            </Grid>

            {/* Additional Information Section */}
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Thông tin bổ sung
            </Typography>
            <Grid container spacing={2}>
              {data.interviewType && (
                <Grid item xs={12}>
                  <ListItem sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <Event color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Hình thức phỏng vấn"
                      secondary={
                        <Chip 
                          label={data.interviewType === 'online' ? 'Phỏng vấn online' : 
                                data.interviewType === 'offline' ? 'Phỏng vấn trực tiếp' : 
                                data.interviewType === 'VIDEO' ? 'Phỏng vấn video call' :
                                data.interviewType} 
                          color={data.interviewType === 'online' || data.interviewType === 'VIDEO' ? 'secondary' : 'primary'}
                          size="small" 
                          sx={{ fontWeight: 600 }}
                        />
                      }
                    />
                  </ListItem>
                </Grid>
              )}
              
              {data.description && (
                <Grid item xs={12}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      background: alpha(theme.palette.primary.main, 0.03),
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                      borderRadius: 2
                    }}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.primary.main }}>
                        Mô tả phỏng vấn:
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                        {data.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              
              {data.status && (
                <Grid item xs={12}>
                  <ListItem sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Trạng thái phỏng vấn"
                      secondary={
                        <Chip 
                          label={data.status === 'SCHEDULED' ? 'Đã lên lịch' : 
                                data.status === 'COMPLETED' ? 'Đã hoàn thành' : 
                                data.status === 'CANCELLED' ? 'Đã hủy' : 
                                data.status} 
                          color={data.status === 'SCHEDULED' ? 'warning' : 
                                data.status === 'COMPLETED' ? 'success' : 
                                data.status === 'CANCELLED' ? 'error' : 'default'}
                          size="small" 
                          sx={{ fontWeight: 600 }}
                        />
                      }
                    />
                  </ListItem>
                </Grid>
              )}
              
              {data.notes && (
                <Grid item xs={12}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      background: alpha(theme.palette.info.main, 0.05),
                      borderColor: alpha(theme.palette.info.main, 0.2),
                      borderRadius: 2
                    }}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.info.main }}>
                        Ghi chú phỏng vấn:
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                        {data.notes}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Box>
        );
        
      case 'NEW_JOB_POSTED':
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Thông tin việc làm mới
            </Typography>
            <Grid container spacing={2}>
              {data.jobTitle && (
                <Grid item xs={12}>
                  <ListItem sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <Work color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Vị trí"
                      secondary={data.jobTitle}
                    />
                  </ListItem>
                </Grid>
              )}
              {data.companyName && (
                <Grid item xs={12}>
                  <ListItem sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <Business color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Công ty"
                      secondary={data.companyName}
                    />
                  </ListItem>
                </Grid>
              )}
              {data.salary && (
                <Grid item xs={12}>
                  <ListItem sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <Info color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Mức lương"
                      secondary={data.salary}
                    />
                  </ListItem>
                </Grid>
              )}
              {data.location && (
                <Grid item xs={12}>
                  <ListItem sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <Event color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Địa điểm"
                      secondary={data.location}
                    />
                  </ListItem>
                </Grid>
              )}
            </Grid>
          </Box>
        );
        
      default:
        return data && Object.keys(data).length > 0 ? (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Chi tiết thông báo
            </Typography>
            <Card 
              variant="outlined" 
              sx={{ 
                background: alpha(theme.palette.background.paper, 0.5),
                borderRadius: 2
              }}
            >
              <CardContent>
                <Typography 
                  variant="body2" 
                  component="pre" 
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }}
                >
                  {JSON.stringify(data, null, 2)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ) : null;
    }
  };

  const handleMarkRead = () => {
    if (!notification.isRead && onMarkRead) {
      onMarkRead(notification.id);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(notification.id);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.95)} 0%, 
            ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              background: `linear-gradient(135deg, ${getNotificationColor(notification.type)}, ${alpha(getNotificationColor(notification.type), 0.7)})`,
              width: 56,
              height: 56
            }}
          >
            {getNotificationIcon(notification.type)}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Chi tiết thông báo
            </Typography>
            <Chip
              label={getTypeLabel(notification.type)}
              size="small"
              sx={{
                background: alpha(getNotificationColor(notification.type), 0.1),
                color: getNotificationColor(notification.type),
                fontWeight: 600
              }}
            />
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ ml: 1 }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Notification Header */}
        <Card
          variant="outlined"
          sx={{
            mb: 3,
            borderRadius: 2,
            borderLeft: `4px solid ${getNotificationColor(notification.type)}`,
            background: notification.isRead 
              ? 'transparent'
              : alpha(getNotificationColor(notification.type), 0.03)
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {notification.title}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
              {notification.message}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
              <ListItem sx={{ pl: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <AccessTime color="action" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Thời gian tạo"
                  secondary={formatDateTime(notification.createdAt)}
                  primaryTypographyProps={{ variant: 'caption' }}
                  secondaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                />
              </ListItem>
              
              {notification.readAt && (
                <ListItem sx={{ pl: 0, py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Visibility color="action" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Đã đọc lúc"
                    secondary={formatDateTime(notification.readAt)}
                    primaryTypographyProps={{ variant: 'caption' }}
                    secondaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                  />
                </ListItem>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Detailed Information */}
        {getDetailedInfo()}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Đóng
        </Button>
        
        {!notification.isRead && (
          <Button
            onClick={handleMarkRead}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2 }}
            startIcon={<CheckCircle />}
          >
            Đánh dấu đã đọc
          </Button>
        )}
        
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          sx={{ borderRadius: 2 }}
          startIcon={<Close />}
        >
          Xóa thông báo
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationDetailModal;
