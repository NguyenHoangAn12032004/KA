import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Skeleton, Stack, Paper } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { analyticsAPI } from '../services/api';
import { Button, ToggleButton, ToggleButtonGroup, TextField } from '@mui/material';

const COLORS = ['#1976d2', '#43a047', '#fbc02d', '#e57373', '#7e57c2'];

const DEFAULT_METRICS = ['job_view', 'job_saved', 'application_submit', 'interview'];
const METRIC_LABELS: Record<string, string> = {
  job_view: 'Đã xem',
  job_saved: 'Đã lưu',
  application_submit: 'Đã ứng tuyển',
  interview: 'Phỏng vấn',
};

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('week');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return {
      start: start.toISOString().slice(0,10),
      end: end.toISOString().slice(0,10)
    };
  });

  // Fetch analytics data
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    analyticsAPI.getPersonalAnalytics({
      userId: user.id,
      metrics: DEFAULT_METRICS,
      startDate: dateRange.start,
      endDate: dateRange.end,
      groupBy,
    })
      .then(res => {
        const data = res.data.data || {};
        // Build chart data
        const periods = Object.keys(data).sort();
        const chartData = periods.map(period => ({
          name: period,
          viewed: data[period]['job_view'] || 0,
          saved: data[period]['job_saved'] || 0,
          applied: data[period]['application_submit'] || 0,
          interviewed: data[period]['interview'] || 0,
        }));
        setWeeklyData(chartData);
        // Tổng hợp stats
        let totalViewed = 0, totalSaved = 0, totalApplied = 0, totalInterviewed = 0;
        for (const row of chartData) {
          totalViewed += row.viewed;
          totalSaved += row.saved;
          totalApplied += row.applied;
          totalInterviewed += row.interviewed;
        }
        setStats({
          viewed: totalViewed,
          saved: totalSaved,
          applied: totalApplied,
          interviewed: totalInterviewed,
          profileCompletion: user?.studentProfile?.profileCompletion || 0,
        });
        setPieData([
          { name: METRIC_LABELS['job_view'], value: totalViewed },
          { name: METRIC_LABELS['job_saved'], value: totalSaved },
          { name: METRIC_LABELS['application_submit'], value: totalApplied },
          { name: METRIC_LABELS['interview'], value: totalInterviewed },
        ]);
      })
      .catch(() => {
        setStats({ viewed: 0, saved: 0, applied: 0, interviewed: 0, profileCompletion: user?.studentProfile?.profileCompletion || 0 });
        setWeeklyData([]);
        setPieData([]);
      })
      .finally(() => setLoading(false));
  }, [user?.id, dateRange, groupBy]);

  // UI: filter thời gian
  const handleGroupBy = (_: any, value: 'day' | 'week' | 'month') => {
    if (value) setGroupBy(value);
  };
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange(r => ({ ...r, [e.target.name]: e.target.value }));
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', background: '#f7fafd' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Phân tích cá nhân
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={2} alignItems="center">
        <ToggleButtonGroup value={groupBy} exclusive onChange={handleGroupBy} size="small">
          <ToggleButton value="day">Ngày</ToggleButton>
          <ToggleButton value="week">Tuần</ToggleButton>
          <ToggleButton value="month">Tháng</ToggleButton>
        </ToggleButtonGroup>
        <TextField
          type="date"
          name="start"
          label="Từ ngày"
          size="small"
          value={dateRange.start}
          onChange={handleDateChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          type="date"
          name="end"
          label="Đến ngày"
          size="small"
          value={dateRange.end}
          onChange={handleDateChange}
          InputLabelProps={{ shrink: true }}
        />
      </Stack>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, borderRadius: 4, boxShadow: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Hoạt động trong tuần
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 3 }} />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="viewed" fill="#1976d2" name="Đã xem" />
                  <Bar dataKey="saved" fill="#43a047" name="Đã lưu" />
                  <Bar dataKey="applied" fill="#fbc02d" name="Đã ứng tuyển" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, borderRadius: 4, boxShadow: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Tỉ lệ hoạt động
            </Typography>
            {loading ? (
              <Skeleton variant="circular" width={180} height={180} />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 4, boxShadow: 2, mb: 3, textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Tiến độ hoàn thiện hồ sơ
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={30} />
            ) : (
              <Stack alignItems="center" spacing={1}>
                <Typography variant="h3" fontWeight={800} color="primary.main">
                  {stats.profileCompletion}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hồ sơ của bạn đã hoàn thiện {stats.profileCompletion}%
                </Typography>
              </Stack>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 4, boxShadow: 2, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Tổng quan
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={60} />
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}><b>Đã xem:</b> {stats.viewed}</Grid>
                <Grid item xs={6} md={3}><b>Đã lưu:</b> {stats.saved}</Grid>
                <Grid item xs={6} md={3}><b>Đã ứng tuyển:</b> {stats.applied}</Grid>
                <Grid item xs={6} md={3}><b>Phỏng vấn:</b> {stats.interviewed}</Grid>
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage; 