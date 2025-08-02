import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  Stack,
  Fade,
  Skeleton,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Visibility,
  Assignment,
  Schedule,
  Refresh,
  Analytics,
  BarChart,
  ShowChart,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { analyticsService } from '../services/analytics';
import { analyticsSocketService } from '../services/analyticsSocket';
import socketService from '../services/socketService';

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  delay?: number;
}

const ModernStatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  trendValue,
  delay = 0,
}) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />;
      case 'down':
        return <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />;
      default:
        return <ShowChart sx={{ fontSize: 16, color: 'info.main' }} />;
    }
  };

  return (
    <Fade in={isVisible} timeout={600}>
      <Card
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
          border: `1px solid ${alpha(color, 0.2)}`,
          borderRadius: 3,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 24px ${alpha(color, 0.2)}`,
            border: `1px solid ${alpha(color, 0.4)}`,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Avatar
              sx={{
                bgcolor: alpha(color, 0.15),
                color: color,
                width: 48,
                height: 48,
              }}
            >
              {icon}
            </Avatar>
            <Chip
              icon={getTrendIcon()}
              label={trendValue}
              size="small"
              sx={{
                bgcolor: trend === 'up' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.info.main, 0.1),
                color: trend === 'up' ? 'success.main' : 'info.main',
                fontWeight: 600,
              }}
            />
          </Stack>
          
          <Typography
            variant="h3"
            sx={{
              color: color,
              fontWeight: 800,
              mb: 1,
              fontFamily: '"Inter", "Roboto", sans-serif',
            }}
          >
            {value.toLocaleString()}
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              color: 'text.primary',
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            {title}
          </Typography>
          
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
            }}
          >
            {subtitle}
          </Typography>
        </CardContent>
      </Card>
    </Fade>
  );
};

const ModernAnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    viewed: 0,
    applied: 0,
    interviewed: 0,
    trends: {
      viewed: 0,
      applied: 0,
      interviewed: 0
    }
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);

  const COLORS = {
    viewed: theme.palette.primary.main,
    applied: theme.palette.success.main,
    interviewed: theme.palette.warning.main,
  };

  const fetchAnalyticsData = async () => {
    if (!user?.id) return;
    
    try {
      if (user.role === 'COMPANY' || user.role === 'HR_MANAGER') {
        // For companies, use company performance API
        const companyData = await analyticsService.getCompanyPerformance();
        
        if (companyData.success) {
          setStats({
            viewed: companyData.data.totalViews || 0,
            applied: companyData.data.totalApplications || 0,
            interviewed: 0, // Company API doesn't have interview count
            trends: {
              viewed: 0, // Calculate trends later if needed
              applied: 0,
              interviewed: 0
            }
          });
          
          setChartData([{
            name: 'Trong 30 ngày qua',
            viewed: companyData.data.recentViews || 0,
            applied: companyData.data.recentApplications || 0,
            interviewed: 0,
          }]);
          
          setPieData([
            { name: 'Lượt xem công việc', value: companyData.data.totalViews || 0, color: COLORS.viewed },
            { name: 'Đơn ứng tuyển', value: companyData.data.totalApplications || 0, color: COLORS.applied },
            { name: 'Phỏng vấn', value: 0, color: COLORS.interviewed },
          ]);
        }
      } else if (user.role === 'ADMIN') {
        // For admin, use dashboard stats
        const dashboardData = await analyticsService.getDashboardStats();
        
        if (dashboardData.success) {
          setStats({
            viewed: dashboardData.data.totalViews || 0,
            applied: dashboardData.data.totalApplications || 0,
            interviewed: dashboardData.data.recentViews || 0, // Use recent views as third metric
            trends: {
              viewed: 0, // Trends not available in API yet
              applied: 0,
              interviewed: 0
            }
          });
          
          setChartData([{
            name: 'Tổng quan hệ thống',
            viewed: dashboardData.data.totalViews || 0,
            applied: dashboardData.data.totalApplications || 0,
            interviewed: dashboardData.data.recentViews || 0,
          }]);
          
          setPieData([
            { name: 'Lượt quan tâm', value: dashboardData.data.totalViews || 0, color: COLORS.viewed },
            { name: 'Đơn ứng tuyển', value: dashboardData.data.totalApplications || 0, color: COLORS.applied },
            { name: 'Phỏng vấn', value: dashboardData.data.recentViews || 0, color: COLORS.interviewed },
          ]);
        }
      } else {
        // For students, use personal analytics
        const personalData = await analyticsService.getPersonalAnalytics(user.id);
        
        if (personalData.success) {
          const personalStats = personalData.data;
          setStats({
            viewed: personalStats.jobsViewed || 0,
            applied: personalStats.applicationsSent || 0,
            interviewed: personalStats.profileViews || 0, // Use profile views as third metric
            trends: {
              viewed: 0, // Personal trends not calculated yet
              applied: 0,
              interviewed: 0
            }
          });
          
          setChartData([{
            name: 'Hoạt động của bạn',
            viewed: personalStats.jobsViewed || 0,
            applied: personalStats.applicationsSent || 0,
            interviewed: personalStats.profileViews || 0,
          }]);
          
          setPieData([
            { name: 'Công việc đã xem', value: personalStats.jobsViewed || 0, color: COLORS.viewed },
            { name: 'Đơn đã nộp', value: personalStats.applicationsSent || 0, color: COLORS.applied },
            { name: 'Phỏng vấn', value: personalStats.profileViews || 0, color: COLORS.interviewed },
          ]);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  useEffect(() => {
    if (!user?.id) return;
    
    setLoading(true);
    fetchAnalyticsData().finally(() => setLoading(false));
    
    // DISABLED: Analytics socket (port 3001) - not needed since main server handles all events
    // analyticsSocketService.connect();
    
    const handleAnalyticsUpdate = async (data: any) => {
      console.log('� RECEIVED analytics event:', data);
      console.log('🔔 Event type:', data?.type);
      console.log('🔔 Current stats before update:', stats);
      
      // Update state directly for immediate response instead of calling API
      if (data.type === 'job_view') {
        console.log('📈 Updating viewed stats +1');
        setStats(prevStats => ({
          ...prevStats,
          viewed: prevStats.viewed + 1
        }));
        
        setChartData(prevChart => prevChart.map(item => ({
          ...item,
          viewed: item.viewed + 1
        })));
        
        setPieData(prevPie => prevPie.map(item => 
          item.name.includes('quan tâm') || item.name.includes('xem')
            ? { ...item, value: item.value + 1 }
            : item
        ));
      } else if (data.type === 'new_application' || data.type === 'application' || data.type === 'application_submit') {
        console.log('📈 Updating applied stats +1');
        setStats(prevStats => ({
          ...prevStats,
          applied: prevStats.applied + 1
        }));
        
        setChartData(prevChart => prevChart.map(item => ({
          ...item,
          applied: item.applied + 1
        })));
        
        setPieData(prevPie => prevPie.map(item => 
          item.name.includes('ứng tuyển') || item.name.includes('nộp') || item.name.includes('Đơn')
            ? { ...item, value: item.value + 1 }
            : item
        ));
      }
      
      console.log('✅ Stats updated successfully');
    };
    
    // DISABLED: Analytics socket listener - not needed
    // analyticsSocketService.on('analytics-update', handleAnalyticsUpdate);
    
    // Setup main backend socket (port 5000) for all analytics events
    const token = localStorage.getItem('token');
    console.log('🔑 Token found:', !!token);
    if (token && socketService) {
      console.log('🔌 Connecting to socket service...');
      socketService.connect(token);
      
      // Listen for job view events from main backend
      console.log('👂 Setting up analytics-update listener...');
      socketService.on('analytics-update', handleAnalyticsUpdate);
      
      if (user.role === 'COMPANY') {
        console.log('🏢 Joining company room:', user.companyId);
        socketService.joinCompanyRoom(user.companyId!);
      } else if (user.role === 'STUDENT') {
        console.log('👤 Joining user room:', user.id);
        socketService.joinUserRoom(user.id);
      }
    } else {
      console.log('❌ No token or socketService available');
    }
    
    return () => {
      // DISABLED: Analytics socket cleanup - not needed
      // analyticsSocketService.off('analytics-update', handleAnalyticsUpdate);
      if (socketService) {
        socketService.off('analytics-update');
      }
    };
  }, [user?.id, user?.role]);

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Paper
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          p: 4,
          borderRadius: 4,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: alpha('#fff', 0.1),
            borderRadius: '50%',
          }}
        />
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <Avatar sx={{ bgcolor: alpha('#fff', 0.2), color: 'white', width: 56, height: 56 }}>
                <Analytics sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={800}>
                  Analytics Dashboard
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Phân tích dữ liệu thời gian thực
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Tooltip title="Làm mới dữ liệu">
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{
                bgcolor: alpha('#fff', 0.2),
                color: 'white',
                '&:hover': { bgcolor: alpha('#fff', 0.3) },
              }}
            >
              <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>
        </Stack>
        {refreshing && (
          <LinearProgress
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: alpha('#fff', 0.2),
              '& .MuiLinearProgress-bar': { bgcolor: 'white' },
            }}
          />
        )}
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <ModernStatCard
            title="Lượng quan tâm"
            value={stats.viewed}
            subtitle="Tổng lượt xem tin tuyển dụng"
            icon={<Visibility />}
            color={COLORS.viewed}
            trend={stats.trends.viewed > 0 ? "up" : stats.trends.viewed < 0 ? "down" : "neutral"}
            trendValue={stats.trends.viewed !== 0 ? `${stats.trends.viewed > 0 ? '+' : ''}${stats.trends.viewed}% so với 30 ngày trước` : "Không đổi"}
            delay={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ModernStatCard
            title="Đơn ứng tuyển"
            value={stats.applied}
            subtitle="Đã gửi thành công"
            icon={<Assignment />}
            color={COLORS.applied}
            trend={stats.trends.applied > 0 ? "up" : stats.trends.applied < 0 ? "down" : "neutral"}
            trendValue={stats.trends.applied !== 0 ? `${stats.trends.applied > 0 ? '+' : ''}${stats.trends.applied}% so với 30 ngày trước` : "Không đổi"}
            delay={200}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ModernStatCard
            title="Phỏng vấn"
            value={stats.interviewed}    
            subtitle="Lịch hẹn đã tạo"
            icon={<Schedule />}
            color={COLORS.interviewed}
            trend={stats.trends.interviewed > 0 ? "up" : stats.trends.interviewed < 0 ? "down" : "neutral"}
            trendValue={stats.trends.interviewed !== 0 ? `${stats.trends.interviewed > 0 ? '+' : ''}${stats.trends.interviewed}% so với 30 ngày trước` : "Không đổi"}
            delay={400}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, height: 400 }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Biểu đồ hoạt động theo thời gian
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="viewedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.viewed} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.viewed} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="appliedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.applied} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.applied} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="interviewedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.interviewed} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.interviewed} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                      boxShadow: theme.shadows[4],
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="viewed"
                    stroke={COLORS.viewed}
                    strokeWidth={3}
                    fill="url(#viewedGradient)"
                    name="Lượng quan tâm"
                  />
                  <Area
                    type="monotone"
                    dataKey="applied"
                    stroke={COLORS.applied}
                    strokeWidth={3}
                    fill="url(#appliedGradient)"
                    name="Đơn ứng tuyển"
                  />
                  <Area
                    type="monotone"
                    dataKey="interviewed"
                    stroke={COLORS.interviewed}
                    strokeWidth={3}
                    fill="url(#interviewedGradient)"
                    name="Phỏng vấn"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, height: 400 }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Phân bố hoạt động
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                      boxShadow: theme.shadows[4],
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: '12px',
                      paddingTop: '10px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ModernAnalyticsDashboard;
