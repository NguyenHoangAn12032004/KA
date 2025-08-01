import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  alpha,
  useTheme,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface QuickActionItemProps {
  icon: React.ReactNode;
  primaryText: string;
  secondaryText: string;
  color: string;
  onClick: () => void;
}

const QuickActionItem: React.FC<QuickActionItemProps> = ({
  icon,
  primaryText,
  secondaryText,
  color,
  onClick
}) => {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        height: '100%',
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 16px ${alpha(color, 0.2)}`,
          border: `1px solid ${alpha(color, 0.3)}`,
          '& .icon-wrapper': {
            background: alpha(color, 0.2),
            transform: 'scale(1.1)',
          }
        }
      }}
      onClick={onClick}
    >
      <Box
        className="icon-wrapper"
        sx={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: alpha(color, 0.1),
          color: color,
          mb: 2,
          transition: 'all 0.3s ease',
        }}
      >
        {icon}
      </Box>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        {primaryText}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {secondaryText}
      </Typography>
    </Paper>
  );
};

interface QuickActionsProps {
  userRole?: 'STUDENT' | 'COMPANY' | 'ADMIN';
}

const QuickActions: React.FC<QuickActionsProps> = ({ userRole = 'COMPANY' }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const getQuickActions = () => {
    switch (userRole) {
      case 'COMPANY':
        return [
          {
            icon: <AddIcon sx={{ fontSize: 32 }} />,
            primaryText: 'Đăng tin',
            secondaryText: 'Tạo tin tuyển dụng mới',
            color: theme.palette.primary.main,
            onClick: () => navigate('/create-job')
          },
          {
            icon: <PersonIcon sx={{ fontSize: 32 }} />,
            primaryText: 'Ứng viên',
            secondaryText: 'Xem hồ sơ ứng viên',
            color: theme.palette.info.main,
            onClick: () => navigate('/candidates')
          },
          {
            icon: <AssessmentIcon sx={{ fontSize: 32 }} />,
            primaryText: 'Thống kê',
            secondaryText: 'Báo cáo chi tiết',
            color: theme.palette.success.main,
            onClick: () => navigate('/analytics')
          }
        ];
      case 'STUDENT':
        return [
          {
            icon: <AddIcon sx={{ fontSize: 32 }} />,
            primaryText: 'Tìm việc',
            secondaryText: 'Khám phá việc làm mới',
            color: theme.palette.primary.main,
            onClick: () => navigate('/jobs')
          },
          {
            icon: <PersonIcon sx={{ fontSize: 32 }} />,
            primaryText: 'Hồ sơ',
            secondaryText: 'Cập nhật thông tin',
            color: theme.palette.info.main,
            onClick: () => navigate('/student-profile')
          },
          {
            icon: <AssessmentIcon sx={{ fontSize: 32 }} />,
            primaryText: 'Đơn ứng tuyển',
            secondaryText: 'Xem trạng thái',
            color: theme.palette.success.main,
            onClick: () => navigate('/applications')
          },
          {
            icon: <NotificationsIcon sx={{ fontSize: 32 }} />,
            primaryText: 'Thông báo',
            secondaryText: '5 tin mới',
            color: theme.palette.warning.main,
            onClick: () => navigate('/notifications')
          }
        ];
      case 'ADMIN':
        return [
          {
            icon: <AddIcon sx={{ fontSize: 32 }} />,
            primaryText: 'Quản lý',
            secondaryText: 'Tổng quan hệ thống',
            color: theme.palette.primary.main,
            onClick: () => navigate('/admin-dashboard')
          },
          {
            icon: <PersonIcon sx={{ fontSize: 32 }} />,
            primaryText: 'Người dùng',
            secondaryText: 'Quản lý tài khoản',
            color: theme.palette.info.main,
            onClick: () => navigate('/admin/users')
          },
          {
            icon: <AssessmentIcon sx={{ fontSize: 32 }} />,
            primaryText: 'Báo cáo',
            secondaryText: 'Thống kê hệ thống',
            color: theme.palette.success.main,
            onClick: () => navigate('/admin/reports')
          },
          {
            icon: <NotificationsIcon sx={{ fontSize: 32 }} />,
            primaryText: 'Thông báo',
            secondaryText: '3 tin mới',
            color: theme.palette.warning.main,
            onClick: () => navigate('/notifications')
          }
        ];
      default:
        return [];
    }
  };
  
  const quickActions = getQuickActions();
  
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 3,
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.paper, 0.9)} 0%, 
          ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          Thao tác nhanh
        </Typography>
        <Tooltip title="Xem tất cả">
          <IconButton size="small">
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Grid container spacing={2}>
        {quickActions.map((action, index) => (
          <Grid item xs={6} sm={6} md={3} key={index}>
            <QuickActionItem {...action} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default QuickActions; 