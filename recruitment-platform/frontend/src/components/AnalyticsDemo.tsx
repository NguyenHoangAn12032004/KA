import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  AlertTitle,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Container,
  Stack
} from '@mui/material';
import { trackJobView, trackJobApplication, trackInterview, analyticsService } from '../services/analytics';

interface AnalyticsStats {
  job_view: number;
  application_submit: number;
  interview: number;
}

const AnalyticsDemo: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsStats>({
    job_view: 0,
    application_submit: 0,
    interview: 0
  });
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const [personalData, dashboardData] = await Promise.all([
        analyticsService.getPersonalAnalytics('student-1'),
        analyticsService.getDashboardStats()
      ]);

      if (personalData.success) {
        setStats(personalData.data);
      }
      
      if (dashboardData.success) {
        setDashboardStats(dashboardData.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleTrackEvent = async (eventType: string) => {
    setLoading(true);
    setMessage('');

    try {
      let success = false;
      
      switch (eventType) {
        case 'job_view':
          success = await trackJobView('student-1', 'demo-job-' + Date.now(), 'demo-company-1');
          setMessage('Đã theo dõi lượt xem công việc!');
          break;
        case 'application_submit':
          success = await trackJobApplication('student-1', 'demo-job-' + Date.now(), 'demo-company-1');
          setMessage('Đã theo dõi đơn ứng tuyển!');
          break;
        case 'interview':
          success = await trackInterview('student-1', 'demo-job-' + Date.now(), 'demo-company-1');
          setMessage('Đã theo dõi cuộc phỏng vấn!');
          break;
      }

      if (success) {
        // Refresh analytics after tracking
        setTimeout(() => {
          fetchAnalytics();
        }, 500);
      }
    } catch (error) {
      setMessage('Lỗi khi theo dõi sự kiện: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
        🎯 Demo Hệ thống Analytics
      </Typography>
      
      <Typography variant="h6" align="center" color="text.secondary" paragraph>
        Trang này cho phép bạn test hệ thống analytics trong thời gian thực
      </Typography>

      <Grid container spacing={4}>
        {/* Controls */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom color="primary">
                📊 Theo dõi Sự kiện
              </Typography>
              
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => handleTrackEvent('job_view')}
                  disabled={loading}
                  fullWidth
                >
                  👁️ Xem công việc (+1 lượt xem)
                </Button>
                
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  onClick={() => handleTrackEvent('application_submit')}
                  disabled={loading}
                  fullWidth
                >
                  📝 Ứng tuyển công việc (+1 đơn ứng tuyển)
                </Button>
                
                <Button
                  variant="contained"
                  color="warning"
                  size="large"
                  onClick={() => handleTrackEvent('interview')}
                  disabled={loading}
                  fullWidth
                >
                  🎤 Tham gia phỏng vấn (+1 phỏng vấn)
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={fetchAnalytics}
                  disabled={loading}
                  fullWidth
                >
                  🔄 Cập nhật dữ liệu
                </Button>
              </Stack>

              {message && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {message}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Personal Stats */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom color="primary">
                📈 Thống kê cá nhân (30 ngày)
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="Lượt xem trong 30 ngày"
                    secondary={
                      <Typography variant="h4" color="primary">
                        {stats.job_view}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider />
                
                <ListItem>
                  <ListItemText
                    primary="Đơn ứng tuyển trong 30 ngày"
                    secondary={
                      <Typography variant="h4" color="success.main">
                        {stats.application_submit}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider />
                
                <ListItem>
                  <ListItemText
                    primary="Tổng số lượt phỏng vấn trong 30 ngày"
                    secondary={
                      <Typography variant="h4" color="warning.main">
                        {stats.interview}
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Dashboard Stats */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom color="primary">
                🏢 Thống kê tổng quan hệ thống
              </Typography>
              
              {dashboardStats && (
                <Grid container spacing={3}>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {dashboardStats.totalUsers}
                      </Typography>
                      <Typography variant="body2">Tổng số người dùng</Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {dashboardStats.totalJobs}
                      </Typography>
                      <Typography variant="body2">Tổng số công việc</Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        {dashboardStats.totalApplications}
                      </Typography>
                      <Typography variant="body2">Tổng số đơn ứng tuyển</Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main">
                        {dashboardStats.totalCompanies}
                      </Typography>
                      <Typography variant="body2">Tổng số công ty</Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                      <Typography variant="h4">
                        {dashboardStats.jobViews30d || 0}
                      </Typography>
                      <Typography variant="body2">Lượt xem trong 30 ngày</Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                      <Typography variant="h4">
                        {dashboardStats.applications30d || 0}
                      </Typography>
                      <Typography variant="body2">Đơn ứng tuyển trong 30 ngày</Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                      <Typography variant="h4">
                        {dashboardStats.interviews30d || 0}
                      </Typography>
                      <Typography variant="body2">Phỏng vấn trong 30 ngày</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mt: 4 }}>
        <AlertTitle>Hướng dẫn sử dụng</AlertTitle>
        <Typography>
          1. Nhấn các nút để tạo sự kiện analytics<br/>
          2. Xem thống kê cập nhật trong thời gian thực<br/>
          3. Kiểm tra trang Analytics chính tại <strong>/analytics</strong> để xem giao diện đầy đủ<br/>
          4. Hệ thống sẽ tự động theo dõi các hành động của sinh viên như xem công việc, ứng tuyển, và phỏng vấn
        </Typography>
      </Alert>
    </Container>
  );
};

export default AnalyticsDemo;
