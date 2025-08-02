import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';

const SimpleAnalytics: React.FC = () => {
  const [stats, setStats] = useState({
    jobViews: 0,
    applications: 0,
    interviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        console.log('🔍 Fetching analytics...');
        
        // Get dashboard stats
        const dashboardResponse = await fetch('http://localhost:3001/api/analytics/dashboard-stats');
        const dashboardData = await dashboardResponse.json();
        
        console.log('📊 Dashboard data:', dashboardData);
        
        if (dashboardData.success) {
          setStats({
            jobViews: dashboardData.data.jobViews30d || 0,
            applications: dashboardData.data.applications30d || 0,
            interviews: dashboardData.data.interviews30d || 0
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('❌ Error:', err);
        setError(String(err));
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h4">🔄 Đang tải dữ liệu...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" color="error">❌ Lỗi: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" gutterBottom>
        📊 Analytics Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Lượt xem trong 30 ngày
              </Typography>
              <Typography variant="h2" color="primary">
                {stats.jobViews}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                Đơn ứng tuyển trong 30 ngày
              </Typography>
              <Typography variant="h2" color="success.main">
                {stats.applications}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">
                Tổng số lượt phỏng vấn trong 30 ngày
              </Typography>
              <Typography variant="h2" color="warning.main">
                {stats.interviews}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
        <Typography variant="h6">🔍 Debug Info</Typography>
        <Typography>API đang hoạt động: ✅</Typography>
        <Typography>Endpoint: http://localhost:3001/api/analytics/dashboard-stats</Typography>
        <Typography>Dữ liệu được cập nhật: {new Date().toLocaleString()}</Typography>
      </Box>
    </Box>
  );
};

export default SimpleAnalytics;
