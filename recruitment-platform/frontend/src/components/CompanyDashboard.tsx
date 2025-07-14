import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Business,
  Add,
  Edit,
  Delete,
  Visibility,
  TrendingUp,
  People,
  Work,
  Assignment,
  MoreVert,
  LocationOn,
  Schedule
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { jobsAPI } from '../services/api';

interface JobPosting {
  id: string;
  title: string;
  location: string;
  salary?: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED';
  applicants: number;
  createdAt: string;
  description: string;
}

const CompanyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [createJobOpen, setCreateJobOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    location: '',
    salary: '',
    type: 'FULL_TIME' as const,
    description: ''
  });

  // Mock data for development
  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getAll();
      
      // Convert API response to expected format
      const formattedJobs = response.data.jobs.map((job: any) => ({
        id: job.id,
        title: job.title,
        location: job.location?.city || job.location || 'Chưa xác định',
        salary: job.salary_range ? `${job.salary_range.min/1000000}-${job.salary_range.max/1000000} triệu` : 'Thỏa thuận',
        type: job.job_type?.toUpperCase() || 'FULL_TIME',
        status: job.status?.toUpperCase() || 'ACTIVE',
        applicants: job.applicant_count || 0,
        createdAt: job.posted_date ? new Date(job.posted_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: job.description || ''
      }));
      
      setJobs(formattedJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
      // Fallback to mock data if API fails
      setJobs([
        {
          id: '1',
          title: 'Senior Frontend Developer',
          location: 'Ho Chi Minh City',
          salary: '25-35 triệu',
          type: 'FULL_TIME',
          status: 'ACTIVE',
          applicants: 12,
          createdAt: '2025-07-08',
          description: 'Tìm kiếm Senior Frontend Developer có kinh nghiệm với React.js...'
        },
        {
          id: '2',
          title: 'UI/UX Designer',
          location: 'Ha Noi',
          salary: '18-25 triệu',
          type: 'FULL_TIME',
          status: 'ACTIVE',
          applicants: 8,
          createdAt: '2025-07-06',
          description: 'Cần tuyển UI/UX Designer có khả năng thiết kế sáng tạo...'
        },
        {
          id: '3',
          title: 'Marketing Intern',
          location: 'Da Nang',
          salary: '5-8 triệu',
          type: 'INTERNSHIP',
          status: 'PAUSED',
          applicants: 25,
          createdAt: '2025-07-01',
          description: 'Cơ hội thực tập Marketing cho sinh viên năm cuối...'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, jobId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedJob(jobId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedJob(null);
  };

  const handleCreateJob = async () => {
    if (creating) return; // Prevent double submission
    
    try {
      setCreating(true);
      
      // Create job data to send to backend
      const jobData = {
        title: newJob.title,
        location: newJob.location,
        salary: newJob.salary,
        job_type: newJob.type.toLowerCase(),
        description: newJob.description,
        requirements: '',
        experience_level: 'entry',
        status: 'active'
      };

      // Send to backend API
      const response = await jobsAPI.create(jobData);
      
      // If successful, refresh jobs list
      await loadJobs();
      
      setCreateJobOpen(false);
      setNewJob({
        title: '',
        location: '',
        salary: '',
        type: 'FULL_TIME',
        description: ''
      });
      
      alert('Đăng tin tuyển dụng thành công!');
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Có lỗi xảy ra khi đăng tin tuyển dụng. Vui lòng thử lại!');
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PAUSED': return 'warning';
      case 'CLOSED': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Đang tuyển';
      case 'PAUSED': return 'Tạm dừng';
      case 'CLOSED': return 'Đã đóng';
      default: return status;
    }
  };

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case 'FULL_TIME': return 'Toàn thời gian';
      case 'PART_TIME': return 'Bán thời gian';
      case 'INTERNSHIP': return 'Thực tập';
      case 'CONTRACT': return 'Hợp đồng';
      default: return type;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const totalApplicants = jobs.reduce((sum, job) => sum + job.applicants, 0);
  const activeJobs = jobs.filter(job => job.status === 'ACTIVE').length;

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)', color: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Xin chào, {user?.companyProfile?.companyName}! 🏢
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Quản lý tuyển dụng và tìm kiếm nhân tài phù hợp
              </Typography>
            </Box>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.2)' }}>
              <Business fontSize="large" />
            </Avatar>
          </Box>
        </Paper>

        {/* Quick Stats */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4 
        }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Work sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" component="div">
                {jobs.length}
              </Typography>
              <Typography color="text.secondary">
                Tổng tin tuyển dụng
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6" component="div">
                {activeJobs}
              </Typography>
              <Typography color="text.secondary">
                Đang tuyển
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <People sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h6" component="div">
                {totalApplicants}
              </Typography>
              <Typography color="text.secondary">
                Ứng viên
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h6" component="div">
                5
              </Typography>
              <Typography color="text.secondary">
                Đang phỏng vấn
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Actions */}
        <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            size="large"
            onClick={() => setCreateJobOpen(true)}
          >
            Đăng tin tuyển dụng
          </Button>
          <Button
            variant="outlined"
            startIcon={<People />}
            size="large"
          >
            Xem ứng viên
          </Button>
          <Button
            variant="outlined"
            startIcon={<Business />}
            size="large"
          >
            Cập nhật thông tin công ty
          </Button>
        </Box>

        {/* Job Listings */}
        <Paper sx={{ width: '100%', mb: 2 }}>
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="div">
              Danh sách tin tuyển dụng
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => setCreateJobOpen(true)}
            >
              Thêm mới
            </Button>
          </Box>
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Vị trí</TableCell>
                  <TableCell>Địa điểm</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Lương</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Ứng viên</TableCell>
                  <TableCell>Ngày đăng</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id} hover>
                    <TableCell component="th" scope="row">
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {job.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'grey.500' }} />
                        {job.location}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getJobTypeLabel(job.type)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold' }}>
                        {job.salary || 'Thỏa thuận'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(job.status)}
                        color={getStatusColor(job.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {job.applicants}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, job.id)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            <Visibility fontSize="small" sx={{ mr: 1 }} />
            Xem chi tiết
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Edit fontSize="small" sx={{ mr: 1 }} />
            Chỉnh sửa
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <People fontSize="small" sx={{ mr: 1 }} />
            Xem ứng viên
          </MenuItem>
          <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
            <Delete fontSize="small" sx={{ mr: 1 }} />
            Xóa
          </MenuItem>
        </Menu>

        {/* Create Job Dialog */}
        <Dialog open={createJobOpen} onClose={() => setCreateJobOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Đăng tin tuyển dụng mới</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                label="Tên vị trí"
                value={newJob.title}
                onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Địa điểm"
                value={newJob.location}
                onChange={(e) => setNewJob(prev => ({ ...prev, location: e.target.value }))}
              />
              <TextField
                fullWidth
                label="Mức lương"
                value={newJob.salary}
                onChange={(e) => setNewJob(prev => ({ ...prev, salary: e.target.value }))}
                placeholder="VD: 15-20 triệu"
              />
              <TextField
                fullWidth
                select
                label="Loại công việc"
                value={newJob.type}
                onChange={(e) => setNewJob(prev => ({ ...prev, type: e.target.value as any }))}
                SelectProps={{ native: true }}
              >
                <option value="FULL_TIME">Toàn thời gian</option>
                <option value="PART_TIME">Bán thời gian</option>
                <option value="INTERNSHIP">Thực tập</option>
                <option value="CONTRACT">Hợp đồng</option>
              </TextField>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Mô tả công việc"
                value={newJob.description}
                onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateJobOpen(false)}>Hủy</Button>
            <Button 
              onClick={handleCreateJob}
              variant="contained"
              disabled={creating || !newJob.title || !newJob.location || !newJob.description}
            >
              {creating ? 'Đang đăng...' : 'Đăng tin'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default CompanyDashboard;
