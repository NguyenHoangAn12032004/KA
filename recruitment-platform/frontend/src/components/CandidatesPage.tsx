import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  alpha,
  useTheme,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Fade,
  Skeleton,
  Badge,
  Snackbar,
  Alert,
  Stack
} from '@mui/material';
import {
  Search,
  FilterList,
  Person,
  School,
  Work,
  LocationOn,
  Star,
  StarBorder,
  MoreVert,
  Email,
  Phone,
  CalendarToday,
  CheckCircle,
  Cancel,
  Schedule,
  Download,
  Visibility,
  Delete,
  Edit,
  Sort,
  Refresh,
  NotificationsActive,
  PeopleAlt,
  AddCircleOutline,
  CloudUpload
} from '@mui/icons-material';
import { applicationsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socketService';
import { debounce } from 'lodash';
import { motion, AnimatePresence, Variants, TargetAndTransition } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { useInView } from 'react-intersection-observer';

interface Candidate {
  id: string;
  studentId: string;
  jobId: string;
  jobTitle: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
  student: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    university?: string;
    major?: string;
    graduationYear?: number;
    avatar?: string;
    skills?: string[];
    experience?: string;
  };
}

// Styled components for enhanced UI
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.background.paper, 0.95)} 0%, 
    ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
  backdropFilter: 'blur(10px)',
}));

// Fix the StatusChip color prop type
const StatusChip = styled(Chip)<{ customcolor: string }>(({ theme, customcolor }) => ({
  borderRadius: theme.spacing(1),
  fontWeight: 600,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
  backgroundColor: alpha(customcolor, 0.1),
  color: customcolor,
}));

const SkillChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    borderColor: theme.palette.primary.main,
    transform: 'scale(1.05)',
  },
}));

const AnimatedGrid = styled(Grid)(({ theme }) => ({
  '& .MuiGrid-item': {
    transition: 'all 0.3s ease',
  },
}));

const EmptyState: React.FC<{ onRefresh: () => void }> = ({ onRefresh }) => {
  const theme = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          px: 3,
          textAlign: 'center',
          bgcolor: 'background.paper',
          borderRadius: 4,
          border: '1px dashed',
          borderColor: 'divider',
        }}
      >
        <PeopleAlt
          sx={{
            fontSize: 64,
            color: 'primary.main',
            mb: 3,
            opacity: 0.7,
          }}
        />
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Không tìm thấy ứng viên nào
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
          Chưa có ứng viên nào ứng tuyển. Bạn có thể đăng tuyển việc làm mới hoặc
          nhập danh sách ứng viên từ file.
        </Typography>
        
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            variant="contained"
            startIcon={<AddCircleOutline />}
            onClick={() => {/* Navigate to job posting page */}}
          >
            Đăng tin tuyển dụng
          </Button>
          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            onClick={() => {/* Open import dialog */}}
          >
            Nhập từ file Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={onRefresh}
          >
            Làm mới danh sách
          </Button>
        </Stack>

        <Box sx={{ mt: 6, width: '100%', maxWidth: 600 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Gợi ý nhanh
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme => `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                  },
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  📝 Tạo mẫu đăng tuyển
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sử dụng mẫu có sẵn để đăng tin nhanh chóng
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme => `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                  },
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  📊 Xem báo cáo tuyển dụng
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Phân tích hiệu quả tuyển dụng của công ty
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </motion.div>
  );
};

const CandidatesPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'info' | 'warning' | 'error', message: string} | null>(null);
  const itemsPerPage = 10;

  const [jobsList, setJobsList] = useState<{id: string, title: string}[]>([]);

  // Socket connection setup
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
      
      // Join relevant rooms
      socketService.joinCompanyRoom('company-room'); // Replace with actual company ID
      
      // Listen for real-time updates
      socketService.on('application-status-changed', handleRealTimeUpdate);
      socketService.on('new-application-received', handleNewApplication);
      
      return () => {
        socketService.off('application-status-changed');
        socketService.off('new-application-received');
        socketService.disconnect();
      };
    }
  }, []);

  const handleRealTimeUpdate = useCallback((data: any) => {
    setCandidates(prev => prev.map(candidate => 
      candidate.id === data.applicationId 
        ? { ...candidate, status: data.status, updatedAt: new Date().toISOString() }
        : candidate
    ));
    
    setNotification({
      type: 'info',
      message: `Trạng thái ứng viên đã được cập nhật: ${getStatusLabel(data.status)}`
    });
  }, []);

  const handleNewApplication = useCallback((data: any) => {
    loadCandidates();
    setNotification({
      type: 'success',
      message: 'Có ứng viên mới ứng tuyển!'
    });
  }, []);

  const debouncedSearch = useMemo(
    () => debounce((term: string) => {
      setSearchTerm(term);
    }, 300),
    []
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCandidates();
    setRefreshing(false);
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  useEffect(() => {
    // Đảm bảo candidates là mảng
    if (!Array.isArray(candidates)) {
      console.error('candidates không phải là mảng:', candidates);
      setFilteredCandidates([]);
      return;
    }
    
    let result = [...candidates];
    
    if (searchTerm) {
      result = result.filter(candidate => 
        `${candidate.student?.firstName || ''} ${candidate.student?.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (candidate.student?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (candidate.student?.university || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (candidate.student?.major || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (candidate.jobTitle || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(candidate => candidate.status === statusFilter);
    }
    
    if (jobFilter !== 'all') {
      result = result.filter(candidate => candidate.jobId === jobFilter);
    }
    
    switch (sortBy) {
      case 'date':
        result.sort((a, b) => new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime());
        break;
      case 'name':
        result.sort((a, b) => {
          const nameA = `${a.student?.firstName || ''} ${a.student?.lastName || ''}`.toLowerCase();
          const nameB = `${b.student?.firstName || ''} ${b.student?.lastName || ''}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;
      case 'status':
        result.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
        break;
    }
    
    setFilteredCandidates(result);
  }, [candidates, searchTerm, statusFilter, jobFilter, sortBy]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const response = await applicationsAPI.getAll();
      
      // Kiểm tra cấu trúc dữ liệu trả về
      console.log('API response:', response);
      
      // Đảm bảo dữ liệu là mảng
      const candidatesData = response.data?.data || [];
      
      if (Array.isArray(candidatesData)) {
        setCandidates(candidatesData);
        
        // Lấy danh sách job duy nhất
        const uniqueJobs = Array.from(new Set(candidatesData.map((c: Candidate) => c.jobId)))
          .map(jobId => {
            const job = candidatesData.find((c: Candidate) => c.jobId === jobId);
            return {
              id: String(jobId),
              title: job?.jobTitle || 'Không xác định'
            };
          });
        setJobsList(uniqueJobs);
      } else {
        console.error('Dữ liệu không phải là mảng:', candidatesData);
        setCandidates([]);
        setJobsList([]);
      }
    } catch (error) {
      console.error("Error loading candidates:", error);
      setCandidates([]);
      setJobsList([]);
      setNotification({
        type: 'error',
        message: 'Không thể tải danh sách ứng viên'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, candidate: Candidate) => {
    setAnchorEl(event.currentTarget);
    setSelectedCandidate(candidate);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCandidate(null);
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedCandidate) return;
    
    try {
      await applicationsAPI.update(selectedCandidate.id, { status });
      
      // Emit socket event for real-time update
      socketService.emit('application-status-update', {
        applicationId: selectedCandidate.id,
        status,
        studentId: selectedCandidate.studentId
      });
      
      setCandidates(prev => prev.map(c => 
        c.id === selectedCandidate.id ? { ...c, status } : c
      ));
      
      setNotification({
        type: 'success',
        message: `Đã cập nhật trạng thái ứng viên thành ${getStatusLabel(status)}`
      });
    } catch (error) {
      console.error("Error updating candidate status:", error);
      setNotification({
        type: 'error',
        message: 'Không thể cập nhật trạng thái ứng viên'
      });
    } finally {
      handleMenuClose();
    }
  };

  const handleViewProfile = () => {
    if (!selectedCandidate) return;
    // Navigate to candidate profile
    navigate(`/candidates/${selectedCandidate.studentId}`);
    handleMenuClose();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Map tab value to status filter
    switch (newValue) {
      case 0: // All
        setStatusFilter('all');
        break;
      case 1: // Pending
        setStatusFilter('PENDING');
        break;
      case 2: // Reviewing
        setStatusFilter('REVIEWING');
        break;
      case 3: // Shortlisted
        setStatusFilter('SHORTLISTED');
        break;
      case 4: // Interview
        setStatusFilter('INTERVIEW_SCHEDULED');
        break;
      case 5: // Accepted
        setStatusFilter('ACCEPTED');
        break;
      case 6: // Rejected
        setStatusFilter('REJECTED');
        break;
      default:
        setStatusFilter('all');
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xử lý';
      case 'REVIEWING':
        return 'Đang xem xét';
      case 'SHORTLISTED':
        return 'Vào danh sách ngắn';
      case 'INTERVIEW_SCHEDULED':
        return 'Đã lên lịch phỏng vấn';
      case 'INTERVIEWED':
        return 'Đã phỏng vấn';
      case 'ACCEPTED':
        return 'Đã chấp nhận';
      case 'REJECTED':
        return 'Từ chối';
      case 'WITHDRAWN':
        return 'Đã rút';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return theme.palette.info.main;
      case 'REVIEWING':
        return theme.palette.warning.main;
      case 'SHORTLISTED':
        return theme.palette.success.main;
      case 'INTERVIEW_SCHEDULED':
        return theme.palette.primary.main;
      case 'INTERVIEWED':
        return theme.palette.secondary.main;
      case 'ACCEPTED':
        return theme.palette.success.dark;
      case 'REJECTED':
        return theme.palette.error.main;
      case 'WITHDRAWN':
        return theme.palette.text.disabled;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Schedule fontSize="small" />;
      case 'REVIEWING':
        return <Visibility fontSize="small" />;
      case 'SHORTLISTED':
        return <Star fontSize="small" />;
      case 'INTERVIEW_SCHEDULED':
        return <CalendarToday fontSize="small" />;
      case 'INTERVIEWED':
        return <Person fontSize="small" />;
      case 'ACCEPTED':
        return <CheckCircle fontSize="small" />;
      case 'REJECTED':
        return <Cancel fontSize="small" />;
      case 'WITHDRAWN':
        return <Delete fontSize="small" />;
      default:
        return <Schedule fontSize="small" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Pagination
  const paginatedCandidates = filteredCandidates.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Replace useInView with a simpler implementation first
  const [loadMoreRef, setLoadMoreRef] = useState<HTMLDivElement | null>(null);

  // Use a separate effect for infinite scroll
  useEffect(() => {
    if (!loadMoreRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loading && filteredCandidates.length > page * itemsPerPage) {
          setPage(prev => prev + 1);
        }
      },
      {
        threshold: 0.5,
      }
    );

    observer.observe(loadMoreRef);

    return () => {
      if (loadMoreRef) {
        observer.unobserve(loadMoreRef);
      }
    };
  }, [loadMoreRef, loading, filteredCandidates.length, page, itemsPerPage]);

  // Fix animation variants type
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
    exit: { opacity: 0, y: -20 },
  };

  const getItemAnimation = (index: number): TargetAndTransition => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: index * 0.1,
      ease: [0.4, 0, 0.2, 1],
    }
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.95)} 0%, 
            ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Quản lý ứng viên
          </Typography>
          <Tooltip title="Làm mới danh sách">
            <IconButton onClick={handleRefresh} sx={{ ml: 2 }}>
              <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm ứng viên..."
              onChange={(e) => debouncedSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Vị trí ứng tuyển</InputLabel>
              <Select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                label="Vị trí ứng tuyển"
              >
                <MenuItem value="all">Tất cả vị trí</MenuItem>
                {jobsList.map(job => (
                  <MenuItem key={job.id} value={job.id}>{job.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sắp xếp theo</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sắp xếp theo"
                startAdornment={
                  <InputAdornment position="start">
                    <Sort />
                  </InputAdornment>
                }
              >
                <MenuItem value="date">Ngày ứng tuyển</MenuItem>
                <MenuItem value="name">Tên ứng viên</MenuItem>
                <MenuItem value="status">Trạng thái</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
              '& .MuiTab-root': {
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: theme.palette.primary.main,
                  opacity: 1,
                },
              },
            }}
          >
            <Tab label={
              <Badge badgeContent={candidates.length} color="primary">
                Tất cả
              </Badge>
            } />
            <Tab label={
              <Badge badgeContent={candidates.filter(c => c.status === 'PENDING').length} color="info">
                Chờ xử lý
              </Badge>
            } />
            <Tab label={
              <Badge badgeContent={candidates.filter(c => c.status === 'REVIEWING').length} color="warning">
                Đang xem xét
              </Badge>
            } />
            <Tab label={
              <Badge badgeContent={candidates.filter(c => c.status === 'SHORTLISTED').length} color="success">
                Vào danh sách ngắn
              </Badge>
            } />
            <Tab label={
              <Badge badgeContent={candidates.filter(c => c.status === 'INTERVIEW_SCHEDULED').length} color="primary">
                Lịch phỏng vấn
              </Badge>
            } />
            <Tab label={
              <Badge badgeContent={candidates.filter(c => c.status === 'ACCEPTED').length} color="success">
                Đã chấp nhận
              </Badge>
            } />
            <Tab label={
              <Badge badgeContent={candidates.filter(c => c.status === 'REJECTED').length} color="error">
                Từ chối
              </Badge>
            } />
          </Tabs>
        </Box>

        <AnimatePresence>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : filteredCandidates.length === 0 ? (
            <EmptyState onRefresh={handleRefresh} />
          ) : (
            <AnimatedGrid container spacing={3}>
              {paginatedCandidates.map((candidate, index) => (
                <Grid item xs={12} key={candidate.id}>
                  <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate={getItemAnimation(index)}
                    exit="exit"
                    layoutId={candidate.id}
                  >
                    <StyledCard>
                      <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              src={candidate.student.avatar}
                              alt={`${candidate.student.firstName} ${candidate.student.lastName}`}
                              sx={{ 
                                width: 60, 
                                height: 60, 
                                mr: 2,
                                border: `2px solid ${getStatusColor(candidate.status)}`,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                },
                              }}
                            >
                              {candidate.student.firstName?.[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="h6" fontWeight={600}>
                                {candidate.student.firstName} {candidate.student.lastName}
                              </Typography>
                              <motion.div whileHover={{ x: 5 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Email fontSize="small" />
                                  {candidate.student.email}
                                </Typography>
                              </motion.div>
                              {candidate.student.phone && (
                                <motion.div whileHover={{ x: 5 }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Phone fontSize="small" />
                                    {candidate.student.phone}
                                  </Typography>
                                </motion.div>
                              )}
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={6} md={3}>
                            <motion.div whileHover={{ x: 5 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Work fontSize="small" />
                                Vị trí: <Typography component="span" fontWeight={600}>{candidate.jobTitle}</Typography>
                              </Typography>
                            </motion.div>
                            <motion.div whileHover={{ x: 5 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CalendarToday fontSize="small" />
                                Ngày ứng tuyển: {formatDate(candidate.appliedAt)}
                              </Typography>
                            </motion.div>
                            <motion.div whileHover={{ x: 5 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <School fontSize="small" />
                                {candidate.student.university || 'Chưa cập nhật'}
                              </Typography>
                            </motion.div>
                          </Grid>
                          
                          <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {candidate.student.skills?.map((skill, index) => (
                                <SkillChip 
                                  key={index} 
                                  label={skill} 
                                  size="small" 
                                  variant="outlined"
                                />
                              ))}
                              {(!candidate.student.skills || candidate.student.skills.length === 0) && (
                                <Typography variant="body2" color="text.secondary">
                                  Chưa cập nhật kỹ năng
                                </Typography>
                              )}
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={6} md={2} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <StatusChip
                              icon={getStatusIcon(candidate.status)}
                              label={getStatusLabel(candidate.status)}
                              customcolor={getStatusColor(candidate.status)}
                            />
                            <IconButton 
                              onClick={(e) => handleMenuClick(e, candidate)}
                              sx={{
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  transform: 'rotate(90deg)',
                                },
                              }}
                            >
                              <MoreVert />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </StyledCard>
                  </motion.div>
                </Grid>
              ))}
              <div ref={setLoadMoreRef} style={{ height: 20 }} />
            </AnimatedGrid>
          )}
        </AnimatePresence>

        {/* Enhanced Menu with animations */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              borderRadius: 2,
              minWidth: 200,
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          TransitionComponent={Fade}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleViewProfile}>
            <ListItemIcon>
              <Visibility fontSize="small" />
            </ListItemIcon>
            <ListItemText>Xem hồ sơ</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleStatusChange('PENDING')}>
            <ListItemIcon>
              <Schedule fontSize="small" color="info" />
            </ListItemIcon>
            <ListItemText>Đánh dấu chờ xử lý</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange('REVIEWING')}>
            <ListItemIcon>
              <Visibility fontSize="small" color="warning" />
            </ListItemIcon>
            <ListItemText>Đánh dấu đang xem xét</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange('SHORTLISTED')}>
            <ListItemIcon>
              <Star fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText>Đưa vào danh sách ngắn</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange('INTERVIEW_SCHEDULED')}>
            <ListItemIcon>
              <CalendarToday fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText>Lên lịch phỏng vấn</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange('ACCEPTED')}>
            <ListItemIcon>
              <CheckCircle fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText>Chấp nhận ứng viên</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleStatusChange('REJECTED')}>
            <ListItemIcon>
              <Cancel fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Từ chối ứng viên</ListItemText>
          </MenuItem>
        </Menu>

        <Snackbar
          open={!!notification}
          autoHideDuration={6000}
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          TransitionComponent={Fade}
        >
          {notification ? (
            <Alert
              onClose={() => setNotification(null)}
              severity={notification.type}
              sx={{ 
                width: '100%',
                borderRadius: 2,
                boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
              }}
              icon={notification.type === 'success' ? <CheckCircle /> : undefined}
            >
              {notification.message}
            </Alert>
          ) : undefined}
        </Snackbar>

        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </Paper>
    </Container>
  );
};

export default CandidatesPage; 