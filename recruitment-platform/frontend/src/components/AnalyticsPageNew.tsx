import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Skeleton, 
  Stack, 
  Paper,
  useTheme,
  alpha,
  keyframes,
  Fade,
  Slide,
  Zoom,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Container,
  Avatar,
  CircularProgress,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import { 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  Line,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts';
import {
  Analytics,
  TrendingUp,
  TrendingDown,
  Visibility,
  BookmarkBorder,
  Assignment,
  Schedule,
  Refresh,
  Download,
  Share,
  FilterList,
  Assessment,
  People,
  Work,
  Business,
  School,
  Star,
  Timeline,
  CompareArrows,
  DataUsage,
  Insights
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { analyticsAPI, companyDashboardAPI } from '../services/api';
import { analyticsService } from '../services/analytics';
import socketService from '../services/socketService';
import { analyticsSocketService } from '../services/analyticsSocket';

// Enhanced color palette
const COLORS = ['#1976d2', '#43a047', '#fbc02d', '#e57373', '#7e57c2', '#ff6b35', '#f7931e', '#2196f3'];
const GRADIENT_COLORS = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
  ['#a8edea', '#fed6e3'],
  ['#ffecd2', '#fcb69f'],
  ['#ff9a9e', '#fecfef']
];

const DEFAULT_METRICS = ['job_view', 'application_submit', 'interview'];
const METRIC_LABELS: Record<string, string> = {
  job_view: 'Lượng quan tâm trong 30 ngày',
  application_submit: 'Đơn ứng tuyển trong 30 ngày',
  interview: 'Tổng số lượt phỏng vấn trong 30 ngày',
  job_posted: 'Tin đăng tuyển',
  profile_view: 'Lượt xem hồ sơ',
  company_follow: 'Theo dõi công ty'
};

// Advanced animations
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulseGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.4),
                0 0 40px rgba(102, 126, 234, 0.2),
                0 0 80px rgba(102, 126, 234, 0.1);
  }
  50% { 
    box-shadow: 0 0 30px rgba(102, 126, 234, 0.6),
                0 0 60px rgba(102, 126, 234, 0.4),
                0 0 120px rgba(102, 126, 234, 0.2);
  }
`;

const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(2deg); }
`;

interface AnalyticsData {
  totalUsers?: number;
  totalJobs?: number;
  totalApplications?: number;
  totalCompanies?: number;
  totalViews?: number;
  activeJobs?: number;
  recentRegistrations?: number;
  jobViews30d?: number;
  applications30d?: number;
  interviews30d?: number;
  growthMetrics?: {
    userGrowth?: number;
    jobGrowth?: number;
    applicationGrowth?: number;
  };
  timeSeriesData?: Array<{
    date: string;
    users: number;
    jobs: number;
    applications: number;
    companies: number;
  }>;
  userSegmentation?: Array<{
    role: string;
    count: number;
    percentage: number;
  }>;
  performanceMetrics?: Array<{
    metric: string;
    value: number;
    target: number;
    trend: string;
  }>;
}

const AnalyticsPageNew: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [realTimeLoading, setRealTimeLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({});
  const [stats, setStats] = useState<any>({});
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('week');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<{start: string, end: string}>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return {
      start: start.toISOString().slice(0,10),
      end: end.toISOString().slice(0,10)
    };
  });

  // Real-time data fetching and updates
  const fetchAnalyticsData = useCallback(async () => {
    if (!user?.id) return;
    
    setRealTimeLoading(true);
    
    try {
      console.log('🔍 Starting analytics data fetch for user:', user.id, user.role);
      
      // Use our analytics service
      const [dashboardData, personalData] = await Promise.all([
        analyticsService.getDashboardStats(),
        analyticsService.getPersonalAnalytics(user.id)
      ]);
      
      console.log('📊 Dashboard response:', dashboardData);
      console.log('👤 Personal response:', personalData);
      
      if (dashboardData.success && personalData.success) {
        // Set dashboard data for admin view
        setAnalyticsData({
          totalUsers: dashboardData.data.totalUsers,
          totalJobs: dashboardData.data.totalJobs,
          totalApplications: dashboardData.data.totalApplications,
          totalCompanies: dashboardData.data.totalCompanies,
          jobViews30d: dashboardData.data.jobViews30d,
          applications30d: dashboardData.data.applications30d,
          interviews30d: dashboardData.data.interviews30d
        });
        
        // Set stats based on user role
        const personalStats = personalData.data;
        
        if (user.role === 'COMPANY' || user.role === 'ADMIN') {
          // For company/admin, show dashboard stats
          setStats({
            viewed: dashboardData.data.jobViews30d || 0,
            applied: dashboardData.data.applications30d || 0,
            interviewed: dashboardData.data.interviews30d || 0,
            profileCompletion: 100, // Companies don't have profile completion
          });
          
          console.log('📈 Updated dashboard stats for company/admin:', {
            viewed: dashboardData.data.jobViews30d || 0,
            applied: dashboardData.data.applications30d || 0,
            interviewed: dashboardData.data.interviews30d || 0,
          });
        } else {
          // For students, show personal stats
          setStats({
            viewed: personalStats.job_view || 0,
            applied: personalStats.application_submit || 0,
            interviewed: personalStats.interview || 0,
            profileCompletion: user?.studentProfile?.profileCompletion || 0,
          });
          
          console.log('📈 Updated personal stats for student:', {
            viewed: personalStats.job_view || 0,
            applied: personalStats.application_submit || 0,
            interviewed: personalStats.interview || 0,
          });
        }
        
        // Create chart data based on user role
        let chartData;
        if (user.role === 'COMPANY' || user.role === 'ADMIN') {
          // For company/admin, use dashboard data
          chartData = [{
            name: 'Trong 30 ngày qua',
            viewed: dashboardData.data.jobViews30d || 0,
            applied: dashboardData.data.applications30d || 0,
            interviewed: dashboardData.data.interviews30d || 0,
          }];
        } else {
          // For students, use personal data
          chartData = [{
            name: 'Trong 30 ngày qua',
            viewed: personalStats.job_view || 0,
            applied: personalStats.application_submit || 0,
            interviewed: personalStats.interview || 0,
          }];
        }
        
        setWeeklyData(chartData);
        
        // Update pie chart data based on user role
        let pieChartData;
        if (user.role === 'COMPANY' || user.role === 'ADMIN') {
          // For company/admin, use dashboard data
          pieChartData = [
            { name: METRIC_LABELS['job_view'], value: dashboardData.data.jobViews30d || 0, color: COLORS[0] },
            { name: METRIC_LABELS['application_submit'], value: dashboardData.data.applications30d || 0, color: COLORS[2] },
            { name: METRIC_LABELS['interview'], value: dashboardData.data.interviews30d || 0, color: COLORS[3] },
          ];
        } else {
          // For students, use personal data
          pieChartData = [
            { name: METRIC_LABELS['job_view'], value: personalStats.job_view || 0, color: COLORS[0] },
            { name: METRIC_LABELS['application_submit'], value: personalStats.application_submit || 0, color: COLORS[2] },
            { name: METRIC_LABELS['interview'], value: personalStats.interview || 0, color: COLORS[3] },
          ];
        }
        
        setPieData(pieChartData);
        
        console.log('🥧 Updated pie data:', [
          { name: METRIC_LABELS['job_view'], value: personalStats.job_view || 0 },
          { name: METRIC_LABELS['application_submit'], value: personalStats.application_submit || 0 },
          { name: METRIC_LABELS['interview'], value: personalStats.interview || 0 },
        ]);
      } else {
        console.error('❌ Analytics API returned error:', { dashboardData, personalData });
        throw new Error('Failed to fetch analytics data');
      }
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Fallback data
      setStats({ 
        viewed: 0, 
        saved: 0, 
        applied: 0, 
        interviewed: 0, 
        profileCompletion: user?.studentProfile?.profileCompletion || 0 
      });
      setWeeklyData([]);
      setPieData([]);
    } finally {
      setRealTimeLoading(false);
    }
  }, [user?.id, user?.role, user?.studentProfile?.profileCompletion, dateRange, groupBy]);

  // Initial data load and real-time setup
  useEffect(() => {
    if (!user?.id) return;
    
    setLoading(true);
    fetchAnalyticsData().finally(() => setLoading(false));
    
    // Setup real-time updates via analytics socket
    analyticsSocketService.connect();
    
    // Listen for real-time analytics updates
    const handleAnalyticsUpdate = (data: any) => {
      console.log('📊 Real-time analytics update received:', data);
      // Fetch fresh data immediately
      fetchAnalyticsData();
    };
    
    analyticsSocketService.on('analytics-update', handleAnalyticsUpdate);
    
    // Setup main socket for other features
    if (socketService && user?.id) {
      const token = localStorage.getItem('token');
      if (token) {
        socketService.connect(token);
        
        // Join appropriate rooms based on user role
        if (user.role === 'ADMIN') {
          // For admin, we can listen to general analytics updates
          // Admin doesn't need a specific room, they get global updates
        } else if (user.role === 'COMPANY') {
          socketService.joinCompanyRoom(user.companyId!);
        } else {
          socketService.joinUserRoom(user.id);
        }
      }
    }

    return () => {
      // Cleanup analytics socket listeners
      analyticsSocketService.off('analytics-update', handleAnalyticsUpdate);
    };
    
    // Setup auto-refresh interval
    const refreshInterval = 30000; // 30 seconds
    const interval = setInterval(() => {
      fetchAnalyticsData();
    }, refreshInterval);
    
    return () => {
      clearInterval(interval);
      if (socketService) {
        socketService.off('analytics-update');
        socketService.off('dashboard-stats-update');
      }
    };
  }, [user?.id, user?.role, user?.companyId, fetchAnalyticsData]);

  // Filter handlers
  const handleGroupBy = (_: any, value: 'day' | 'week' | 'month') => {
    if (value) setGroupBy(value);
  };

  const handleTimeRangeChange = (range: '7d' | '30d' | '90d') => {
    setTimeRange(range);
    const end = new Date();
    const start = new Date();
    
    switch (range) {
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      case '90d':
        start.setDate(end.getDate() - 90);
        break;
    }
    
    setDateRange({
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10)
    });
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  // Enhanced Stat Card Component
  const EnhancedStatCard: React.FC<{
    title: string;
    value: number | string;
    subtitle?: string;
    icon: React.ReactElement;
    gradient: string[];
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    delay?: number;
  }> = ({ title, value, subtitle, icon, gradient, trend, trendValue, delay = 0 }) => {
    return (
      <Zoom in timeout={600 + delay}>
        <Card
          sx={{
            position: 'relative',
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
            backgroundSize: '400% 400%',
            animation: `${gradientAnimation} 8s ease infinite`,
            color: 'white',
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: `0 20px 40px ${alpha(gradient[0], 0.3)}`,
              '& .stat-icon': {
                transform: 'scale(1.2) rotate(10deg)',
              },
              '& .stat-value': {
                transform: 'scale(1.1)',
              },
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              transition: 'left 0.6s ease',
            },
            '&:hover::before': {
              left: '100%',
            },
          }}
        >
          <CardContent sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                  {title}
                </Typography>
                <Typography
                  className="stat-value"
                  variant="h3"
                  sx={{
                    color: 'white',
                    fontWeight: 800,
                    mb: 1,
                    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </Typography>
                {subtitle && (
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    {subtitle}
                  </Typography>
                )}
                {trend && trendValue && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {trend === 'up' ? (
                      <TrendingUp sx={{ color: '#4ade80', fontSize: 16 }} />
                    ) : trend === 'down' ? (
                      <TrendingDown sx={{ color: '#f87171', fontSize: 16 }} />
                    ) : (
                      <CompareArrows sx={{ color: '#fbbf24', fontSize: 16 }} />
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        color: trend === 'up' ? '#4ade80' : trend === 'down' ? '#f87171' : '#fbbf24',
                        fontWeight: 700,
                        textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      }}
                    >
                      {trendValue}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box
                className="stat-icon"
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.3s ease',
                  animation: `${floatingAnimation} 6s ease-in-out infinite`,
                  animationDelay: `${delay}ms`,
                }}
              >
                {React.cloneElement(icon, {
                  sx: {
                    fontSize: 32,
                    color: 'white',
                    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
                  },
                })}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Zoom>
    );
  };

  // Performance Chart Component
  const PerformanceChart: React.FC<{ data: any[]; title: string }> = ({ data, title }) => {
    return (
      <Card
        sx={{
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.95)} 0%, 
            ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {title}
          </Typography>
          
          {loading ? (
            <Skeleton variant="rectangular" height={300} />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="viewed" fill={COLORS[0]} name="Đã xem" />
                <Line dataKey="applied" stroke={COLORS[2]} name="Đã ứng tuyển" strokeWidth={3} />
                <Area dataKey="saved" fill={alpha(COLORS[1], 0.3)} stroke={COLORS[1]} name="Đã lưu" />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    );
  };

  // Real-time Status Component
  const RealTimeStatus: React.FC = () => {
    return (
      <Card
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
          color: 'white',
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Badge
              variant="dot"
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#4ade80',
                  animation: `${pulseGlow} 2s ease-in-out infinite`,
                },
              }}
            >
              <DataUsage sx={{ fontSize: 24 }} />
            </Badge>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Cập nhật realtime
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Lần cuối: {lastUpdate.toLocaleTimeString('vi-VN')}
              </Typography>
            </Box>
            <IconButton
              onClick={handleRefresh}
              disabled={realTimeLoading}
              sx={{ color: 'white' }}
            >
              {realTimeLoading ? (
                <CircularProgress size={20} sx={{ color: 'white' }} />
              ) : (
                <Refresh />
              )}
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.1)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress
            size={60}
            sx={{
              color: theme.palette.primary.main,
              animation: `${pulseGlow} 2s ease-in-out infinite`,
            }}
          />
          <Typography variant="h6" sx={{ mt: 2, color: theme.palette.primary.main }}>
            Đang tải dữ liệu phân tích...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: '100vh',
        background: `
          linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.05)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.05)} 50%,
            ${alpha(theme.palette.warning.main, 0.05)} 100%),
          radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%)
        `,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${theme.palette.primary.main.slice(1)}' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Modern Header */}
        <Slide direction="down" in timeout={800}>
          <Paper
            sx={{
              p: 4,
              mb: 4,
              background: `linear-gradient(135deg, 
                ${theme.palette.primary.main} 0%, 
                ${theme.palette.primary.dark} 50%,
                ${theme.palette.secondary.main} 100%)`,
              backgroundSize: '400% 400%',
              animation: `${gradientAnimation} 15s ease infinite`,
              color: 'white',
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(20px)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                opacity: 0.3,
                pointerEvents: 'none',
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 3,
                      background: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: `${floatingAnimation} 6s ease-in-out infinite`,
                    }}
                  >
                    <Analytics sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                      }}
                    >
                      Analytics Dashboard
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                      Phân tích dữ liệu thời gian thực
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box
                sx={{
                  animation: `${floatingAnimation} 8s ease-in-out infinite`,
                  animationDelay: '2s',
                }}
              >
                <Insights sx={{ fontSize: 80, opacity: 0.3 }} />
              </Box>
            </Box>
          </Paper>
        </Slide>

        {/* Controls */}
        <Fade in timeout={1000}>
          <Paper
            sx={{
              p: 3,
              mb: 4,
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.background.paper, 0.95)} 0%, 
                ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: 3,
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <RealTimeStatus />
              </Grid>
              <Grid item xs={12} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Khoảng thời gian
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {['7d', '30d', '90d'].map((range) => (
                      <Button
                        key={range}
                        variant={timeRange === range ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => handleTimeRangeChange(range as any)}
                        sx={{ minWidth: 'auto' }}
                      >
                        {range}
                      </Button>
                    ))}
                  </Stack>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Nhóm theo
                  </Typography>
                  <ToggleButtonGroup
                    value={groupBy}
                    exclusive
                    onChange={handleGroupBy}
                    size="small"
                  >
                    <ToggleButton value="day">Ngày</ToggleButton>
                    <ToggleButton value="week">Tuần</ToggleButton>
                    <ToggleButton value="month">Tháng</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Tooltip title="Tải xuống báo cáo">
                    <IconButton>
                      <Download />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Chia sẻ">
                    <IconButton>
                      <Share />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Bộ lọc">
                    <IconButton>
                      <FilterList />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Fade>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <EnhancedStatCard
              title="Lượng quan tâm"
              value={stats.viewed || 0}
              subtitle="Tổng lượt xem tin tuyển dụng"
              icon={<Visibility />}
              gradient={GRADIENT_COLORS[0]}
              trend="up"
              trendValue="+12% tuần này"
              delay={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <EnhancedStatCard
              title="Đơn ứng tuyển"
              value={stats.applied || 0}
              subtitle="Đã gửi thành công"
              icon={<Assignment />}
              gradient={GRADIENT_COLORS[2]}
              trend="up"
              trendValue="+15% tuần này"
              delay={200}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <EnhancedStatCard
              title="Phỏng vấn"
              value={stats.interviewed || 0}
              subtitle="Lịch hẹn đã tạo"
              icon={<Schedule />}
              gradient={GRADIENT_COLORS[3]}
              trend="up"
              trendValue="+5% tuần này"
              delay={300}
            />
          </Grid>
        </Grid>

        {/* Admin/Company specific stats */}
        {user?.role === 'ADMIN' && analyticsData && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <EnhancedStatCard
                title="Tổng người dùng"
                value={analyticsData.totalUsers || 0}
                subtitle="Đã đăng ký"
                icon={<People />}
                gradient={GRADIENT_COLORS[4]}
                trend="up"
                trendValue="+18% tháng này"
                delay={400}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <EnhancedStatCard
                title="Tổng công việc"
                value={analyticsData.totalJobs || 0}
                subtitle="Đang hoạt động"
                icon={<Work />}
                gradient={GRADIENT_COLORS[5]}
                trend="up"
                trendValue="+25% tháng này"
                delay={500}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <EnhancedStatCard
                title="Tổng ứng tuyển"
                value={analyticsData.totalApplications || 0}
                subtitle="Tất cả đơn"
                icon={<Assessment />}
                gradient={GRADIENT_COLORS[6]}
                trend="up"
                trendValue="+30% tháng này"
                delay={600}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <EnhancedStatCard
                title="Tổng công ty"
                value={analyticsData.totalCompanies || 0}
                subtitle="Đã xác thực"
                icon={<Business />}
                gradient={GRADIENT_COLORS[7]}
                trend="up"
                trendValue="+10% tháng này"
                delay={700}
              />
            </Grid>
          </Grid>
        )}

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <PerformanceChart data={weeklyData} title="Biểu đồ hoạt động theo thời gian" />
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                background: `linear-gradient(135deg, 
                  ${alpha(theme.palette.background.paper, 0.95)} 0%, 
                  ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 3,
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Phân bố hoạt động
                </Typography>
                {loading ? (
                  <Skeleton variant="circular" width={280} height={280} />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Profile Completion for Students */}
        {user?.role === 'STUDENT' && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.info.main, 0.1)} 0%, 
                    ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Tiến độ hoàn thiện hồ sơ
                  </Typography>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                    <CircularProgress
                      variant="determinate"
                      value={stats.profileCompletion || 0}
                      size={120}
                      thickness={6}
                      sx={{
                        color: theme.palette.primary.main,
                        animation: `${pulseGlow} 3s ease-in-out infinite`,
                      }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h4" fontWeight={800} color="primary.main">
                        {stats.profileCompletion || 0}%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Hoàn thiện hồ sơ để tăng cơ hội được tuyển dụng
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.success.main, 0.1)} 0%, 
                    ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Gợi ý cải thiện
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                        <School sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Cập nhật thông tin giáo dục
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Thêm bằng cấp và chứng chỉ
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                        <Star sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Thêm kỹ năng chuyên môn
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Liệt kê các kỹ năng quan trọng
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                        <Timeline sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          Bổ sung kinh nghiệm làm việc
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Mô tả các dự án đã thực hiện
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Additional Analytics for Admin */}
        {user?.role === 'ADMIN' && analyticsData?.timeSeriesData && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Card
                sx={{
                  background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.background.paper, 0.95)} 0%, 
                    ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Xu hướng tăng trưởng tổng thể
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={analyticsData.timeSeriesData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Area 
                        dataKey="users" 
                        stackId="1" 
                        stroke={COLORS[0]} 
                        fill={alpha(COLORS[0], 0.6)} 
                        name="Người dùng"
                      />
                      <Area 
                        dataKey="jobs" 
                        stackId="1" 
                        stroke={COLORS[1]} 
                        fill={alpha(COLORS[1], 0.6)} 
                        name="Công việc"
                      />
                      <Area 
                        dataKey="applications" 
                        stackId="1" 
                        stroke={COLORS[2]} 
                        fill={alpha(COLORS[2], 0.6)} 
                        name="Ứng tuyển"
                      />
                      <Area 
                        dataKey="companies" 
                        stackId="1" 
                        stroke={COLORS[3]} 
                        fill={alpha(COLORS[3], 0.6)} 
                        name="Công ty"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Footer */}
        <Fade in timeout={1500}>
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.background.paper, 0.7)} 0%, 
                ${alpha(theme.palette.background.paper, 0.5)} 100%)`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: 3,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Dữ liệu được cập nhật tự động mỗi 30 giây • 
              Lần cập nhật cuối: {lastUpdate.toLocaleString('vi-VN')}
            </Typography>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default AnalyticsPageNew;
