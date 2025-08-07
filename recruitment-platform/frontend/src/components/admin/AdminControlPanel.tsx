import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  IconButton,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useSocket } from '../../hooks/useSocket';
import axios from 'axios';
import UserManagement from './UserManagement';
import CompanyManagement from './CompanyManagement';
import AdminAnalytics from './AdminAnalytics';

interface AdminDashboardData {
  analytics: any;
  insights: any;
  realtimeMetrics: any;
  timestamp: string;
}

interface AdminDashboardResponse {
  success: boolean;
  data: AdminDashboardData;
}

interface SystemMetrics {
  activeUsers: number;
  todayApplications: number;
  todayRegistrations: number;
  systemLoad: number;
}

interface AdminControlPanelProps {
  user: any;
}

export const AdminControlPanel: React.FC<AdminControlPanelProps> = ({ user }) => {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket('admin');

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadDashboardData();
      setupSocketListeners();
    }
  }, [user, socket]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use analytics API instead of admin dashboard
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/analytics/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('📊 Dashboard API Response:', response.data);
      
      // Handle analytics API response structure
      const data = response.data.data || response.data;
      
      // Map analytics data to expected format
      const mappedMetrics: SystemMetrics = {
        activeUsers: data.totalUsers || 0,
        todayApplications: data.totalApplications || 0,
        todayRegistrations: data.weeklyStats?.newRegistrations || 0,
        systemLoad: 0.75 // Static value or calculate from system metrics
      };
      
      setDashboardData(data);
      setSystemMetrics(mappedMetrics);
      setError(null);
    } catch (error) {
      console.error('Failed to load admin dashboard:', error);
      setError('Failed to load dashboard data');
      
      // Fallback to empty data instead of mock data
      setSystemMetrics({
        activeUsers: 0,
        todayApplications: 0,
        todayRegistrations: 0,
        systemLoad: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    if (!socket) return;

    // Real-time updates for admin
    socket.on('admin:system-wide-update', (data: any) => {
      console.log('📡 System-wide update received:', data);
      loadDashboardData();
    });

    socket.on('admin:system-metrics', (metrics: SystemMetrics) => {
      console.log('📊 System metrics update:', metrics);
      setSystemMetrics(metrics);
    });

    socket.on('admin:user-activity', (activity: any) => {
      console.log('👤 User activity:', activity);
    });

    socket.on('admin:security-alert', (alert: any) => {
      console.log('🚨 Security alert:', alert);
    });

    return () => {
      socket.off('admin:system-wide-update');
      socket.off('admin:system-metrics');
      socket.off('admin:user-activity');
      socket.off('admin:security-alert');
    };
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  if (user?.role !== 'ADMIN') {
    return (
      <Alert severity="error">
        Access denied. Admin privileges required.
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <IconButton onClick={handleRefresh} size="small">
          <RefreshIcon />
        </IconButton>
      }>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Admin Control Panel
        </Typography>
        <Box display="flex" gap={1}>
          <Chip 
            label={`System Load: ${systemMetrics?.systemLoad ? (systemMetrics.systemLoad * 100).toFixed(1) : 0}%`}
            color={systemMetrics?.systemLoad && systemMetrics.systemLoad > 0.8 ? 'error' : 'success'}
            size="small"
          />
          <IconButton onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Real-time Metrics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Users
                  </Typography>
                  <Typography variant="h5">
                    {systemMetrics?.activeUsers || 0}
                  </Typography>
                </Box>
                <PeopleIcon color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Applications Today
                  </Typography>
                  <Typography variant="h5">
                    {systemMetrics?.todayApplications || 0}
                  </Typography>
                </Box>
                <WorkIcon color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    New Registrations
                  </Typography>
                  <Typography variant="h5">
                    {systemMetrics?.todayRegistrations || 0}
                  </Typography>
                </Box>
                <BusinessIcon color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    System Health
                  </Typography>
                  <Typography variant="h5">
                    <Chip 
                      label={dashboardData?.analytics?.systemHealth?.serverStatus || 'Unknown'}
                      color={dashboardData?.analytics?.systemHealth?.serverStatus === 'healthy' ? 'success' : 'warning'}
                      size="small"
                    />
                  </Typography>
                </Box>
                <AnalyticsIcon color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Navigation Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab icon={<DashboardIcon />} label="Overview" />
            <Tab icon={<PeopleIcon />} label="User Management" />
            <Tab icon={<BusinessIcon />} label="Company Management" />
            <Tab icon={<WorkIcon />} label="Job Management" />
            <Tab icon={<AnalyticsIcon />} label="Analytics" />
            <Tab icon={<SettingsIcon />} label="System Settings" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Tab Content */}
          {selectedTab === 0 && <AdminOverviewTab data={dashboardData} />}
          {selectedTab === 1 && <UserManagement onUserUpdate={loadDashboardData} />}
          {selectedTab === 2 && <CompanyManagement onCompanyUpdate={loadDashboardData} />}
          {selectedTab === 3 && <AdminJobManagementTab />}
          {selectedTab === 4 && <AdminAnalytics data={dashboardData?.analytics} />}
          {selectedTab === 5 && <AdminSystemSettingsTab />}
        </CardContent>
      </Card>
    </Box>
  );
};

// Tab Components
const AdminOverviewTab: React.FC<{ data: AdminDashboardData | null }> = ({ data }) => (
  <Box>
    <Typography variant="h6" gutterBottom>
      System Overview
    </Typography>
    
    {data?.insights && (
      <Box mb={3}>
        <Typography variant="subtitle1" gutterBottom>
          System Insights
        </Typography>
        {data.insights.actionableInsights?.map((insight: string, index: number) => (
          <Alert key={index} severity="info" sx={{ mb: 1 }}>
            {insight}
          </Alert>
        ))}
      </Box>
    )}

    {data?.analytics?.recommendations && (
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Recommendations
        </Typography>
        {data.analytics.recommendations.map((rec: string, index: number) => (
          <Alert key={index} severity="warning" sx={{ mb: 1 }}>
            {rec}
          </Alert>
        ))}
      </Box>
    )}
  </Box>
);

const AdminJobManagementTab: React.FC = () => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Job Management
    </Typography>
    <Typography>
      Job management features will be implemented here.
    </Typography>
  </Box>
);

const AdminSystemSettingsTab: React.FC = () => (
  <Box>
    <Typography variant="h6" gutterBottom>
      System Settings
    </Typography>
    <Typography>
      System configuration options will be implemented here.
    </Typography>
  </Box>
);

export default AdminControlPanel;
