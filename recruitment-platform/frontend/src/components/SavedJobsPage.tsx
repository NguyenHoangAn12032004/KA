import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Grid, Chip, Avatar, CircularProgress, Fade, Stack, Skeleton
} from '@mui/material';
import { Bookmark, BookmarkBorder, Send, LocationOn, AttachMoney, Work } from '@mui/icons-material';
import { savedJobsAPI, jobsAPI } from '../services/api';
import { toast } from 'react-toastify';

export {};

const SavedJobsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const loadSavedJobs = async () => {
    try {
      setLoading(true);
      const response = await savedJobsAPI.getAll();
      setSavedJobs(response.data || []);
    } catch (error) {
      toast.error('Không thể tải danh sách việc làm đã lưu.');
      setSavedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveJob = async (jobId: string) => {
    try {
      setSavedJobs((prev) => prev.filter((job) => job.id !== jobId));
      await savedJobsAPI.remove(jobId);
      toast.success('Đã bỏ lưu việc làm');
    } catch (error) {
      toast.error('Có lỗi xảy ra.');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Việc làm đã lưu
      </Typography>
      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      ) : savedJobs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" gutterBottom>
            Bạn chưa lưu việc làm nào
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Hãy lưu lại các công việc yêu thích để dễ dàng ứng tuyển sau này!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {savedJobs.map((job, idx) => (
            <Grid item xs={12} sm={6} md={4} key={job.id}>
              <Fade in timeout={600 + idx * 100}>
                <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2, cursor: 'pointer', transition: '0.2s', '&:hover': { boxShadow: 6, transform: 'translateY(-4px)' } }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar src={job.company?.logoUrl} sx={{ width: 48, height: 48 }}>
                        {job.company?.companyName?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>{job.title}</Typography>
                        <Typography variant="body2" color="text.secondary">{job.company?.companyName}</Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} mt={2} mb={1}>
                      <Chip icon={<LocationOn />} label={job.location} size="small" />
                      <Chip icon={<AttachMoney />} label={job.salary || 'Thỏa thuận'} size="small" />
                      <Chip icon={<Work />} label={job.type} size="small" />
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        startIcon={<BookmarkBorder />}
                        onClick={() => handleRemoveJob(job.id)}
                      >
                        Bỏ lưu
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<Send />}
                        sx={{ ml: 1 }}
                      >
                        Ứng tuyển
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default SavedJobsPage; 