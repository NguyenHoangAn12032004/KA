import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { Download as DownloadIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { adminAPI } from '../../services/adminAPI';

interface AnalyticsData {
  userStats: {
    totalUsers: number;
    verifiedUsers: number;
    activeUsersToday: number;
    newUsersThisWeek: number;
    usersByRole: { role: string; count: number }[];
    userGrowthTrend: { date: string; users: number }[];
  };
  interactionStats: {
    totalApplications: number;
    activeJobs: number;
    totalCompanies: number;
    verifiedCompanies: number;
    applicationTrends: { date: string; applications: number }[];
    jobsByCategory: { category: string; count: number }[];
  };
  systemHealth: {
    serverStatus: string;
    databaseStatus: string;
    uptime: number;
    performanceMetrics: { metric: string; value: number }[];
  };
  recommendations: string[];
}

interface AdminAnalyticsProps {
  data?: AnalyticsData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ data: initialData }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [reportType, setReportType] = useState('overview');

  useEffect(() => {
    if (!initialData) {
      loadAnalytics();
    }
  }, [timeRange, reportType, initialData]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      
      // Calculate start date based on time range
      switch (timeRange) {
        case '1d':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      const response = await adminAPI.getAnalytics({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        type: reportType as 'users' | 'jobs' | 'applications' | 'companies'
      });
      
      setAnalyticsData(response.data);
      setError(null);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (format: 'csv' | 'excel' | 'json') => {
    try {
      const response = await adminAPI.exportData({
        type: 'users', // This could be dynamic based on current view
        format,
        filters: { timeRange, reportType }
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-${format}-${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export data:', error);
      setError('Failed to export data');
    }
  };

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
        <Button onClick={loadAnalytics} size="small">
          <RefreshIcon />
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  if (!analyticsData) {
    return (
      <Alert severity="info">
        No analytics data available.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">
            <Box display="flex" gap={2}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  label="Time Range"
                >
                  <MenuItem value="1d">Last 24 Hours</MenuItem>
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                  <MenuItem value="30d">Last 30 Days</MenuItem>
                  <MenuItem value="90d">Last 90 Days</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  label="Report Type"
                >
                  <MenuItem value="overview">Overview</MenuItem>
                  <MenuItem value="users">Users</MenuItem>
                  <MenuItem value="jobs">Jobs</MenuItem>
                  <MenuItem value="applications">Applications</MenuItem>
                  <MenuItem value="companies">Companies</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                onClick={loadAnalytics}
                size="small"
              >
                <RefreshIcon sx={{ mr: 1 }} />
                Refresh
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => handleExportData('csv')}
                size="small"
              >
                <DownloadIcon sx={{ mr: 1 }} />
                Export CSV
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4">
                {analyticsData.userStats.totalUsers.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="success.main">
                +{analyticsData.userStats.newUsersThisWeek} this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Jobs
              </Typography>
              <Typography variant="h4">
                {analyticsData.interactionStats.activeJobs.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="info.main">
                {analyticsData.interactionStats.totalCompanies} companies
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Applications
              </Typography>
              <Typography variant="h4">
                {analyticsData.interactionStats.totalApplications.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="warning.main">
                Active today: {analyticsData.userStats.activeUsersToday}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                System Health
              </Typography>
              <Typography variant="h4" color="success.main">
                {analyticsData.systemHealth.serverStatus === 'healthy' ? '✓' : '⚠'}
              </Typography>
              <Typography variant="body2">
                Uptime: {Math.round(analyticsData.systemHealth.uptime / 3600)}h
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} mb={3}>
        {/* User Growth Trend */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Growth Trend
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.userStats.userGrowthTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Users by Role */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Users by Role
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.userStats.usersByRole}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ role, count }) => `${role}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData.userStats.usersByRole.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Application Trends */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Application Trends
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.interactionStats.applicationTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="applications" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Jobs by Category */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Jobs by Category
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.interactionStats.jobsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recommendations */}
      {analyticsData.recommendations.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Recommendations
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {analyticsData.recommendations.map((recommendation, index) => (
              <Alert key={index} severity="info" sx={{ mb: 1 }}>
                {recommendation}
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AdminAnalytics;
