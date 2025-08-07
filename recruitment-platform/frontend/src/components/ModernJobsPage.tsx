import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Fade,
  Stack,
  Pagination,
  useTheme,
  alpha,
  Drawer,
  FormControl,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Collapse,
  Skeleton
} from '@mui/material';
import {
  Search,
  LocationOn,
  Business,
  AttachMoney,
  WorkOutline,
  Public,
  School,
  FilterList,
  Sort,
  Close,
  Send,
  Bookmark,
  BookmarkBorder,
  AccessTime,
  TrendingUp,
  Group,
  Speed,
  Refresh,
  CheckCircle
} from '@mui/icons-material';
import { jobsAPI, applicationsAPI } from '../services/api';
import { toast } from 'react-toastify';
import ApplicationDialog from './ApplicationDialog';
import JobDetailsDialog from './JobDetailsDialog';
import socketService from '../services/socketService';
import { motion } from 'framer-motion';
import axios from 'axios'; // Added axios import
import { API_BASE_URL } from '../config'; // Import from config instead of services/api

// Define Job interface
interface Job {
  id: string;
  title: string;
  company?: {
    id: string;
    companyName: string;
    logoUrl?: string;
    industry?: string;
    location?: string;
    rating?: number;
    size?: string;
    website?: string;
    founded?: string;
    description?: string;
  } | string;
  companyLogo?: string;
  location: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  type: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | string;
  workMode?: "ONSITE" | "REMOTE" | "HYBRID" | string;
  experienceLevel?: "ENTRY" | "JUNIOR" | "INTERMEDIATE" | "SENIOR" | string;
  description?: string;
  applicationDeadline?: string;
  publishedAt?: string;
  applicationsCount?: number;
  applicationCount?: number;
  isSaved?: boolean;
  hasApplied?: boolean;
  viewCount?: number;
  viewsCount?: number;
  skills?: string[];
  createdAt?: string;
  matchScore?: number;
  requirements?: string[];
  benefits?: string[];
  responsibilities?: string[];
  qualifications?: string[];
  isActive?: boolean;
  department?: string;
  reportingTo?: string;
  company_profiles?: {
    companyName: string;
    logo?: string;
    description?: string;
    website?: string;
    city?: string;
    industry?: string;
    companySize?: string;
  };
}

// Define Application interface
interface Application {
  id: string;
  jobId: string;
  status: string;
  appliedAt: string;
}

// Define SavedJob interface
interface SavedJob {
  id: string;
  jobId: string;
}

// Helper function to safely get a date
const getDateValue = (dateStr: string | undefined): Date => {
  if (!dateStr) return new Date();
  try {
    return new Date(dateStr);
  } catch (e) {
    return new Date();
  }
};

const ModernJobsPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]); // Update to use Job type
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]); // Update to use Job type
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(9);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null); // Update to use Job type
  const [openJobDetails, setOpenJobDetails] = useState(false);
  const [openApplication, setOpenApplication] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    jobType: [] as string[],
    workMode: [] as string[],
    experienceLevel: [] as string[],
    location: '',
    salary: ''
  });
  const [sortBy, setSortBy] = useState('newest');
  const [error, setError] = useState<string | null>(null);
  const [newJobAlert, setNewJobAlert] = useState(false);
  const [newJobCount, setNewJobCount] = useState(0);

  // Load jobs
  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get all jobs
      const jobsResponse = await jobsAPI.getAll();
      console.log("API Response:", jobsResponse);
      
      // Đảm bảo luôn có mảng jobs, xử lý nhiều trường hợp phản hồi khác nhau
      let jobsData = [];
      if (jobsResponse?.data) {
        if (Array.isArray(jobsResponse.data)) {
          jobsData = jobsResponse.data;
        } else if (jobsResponse.data.jobs && Array.isArray(jobsResponse.data.jobs)) {
          jobsData = jobsResponse.data.jobs;
        } else if (jobsResponse.data.data) {
          if (Array.isArray(jobsResponse.data.data)) {
            jobsData = jobsResponse.data.data;
          } else if (jobsResponse.data.data.jobs && Array.isArray(jobsResponse.data.data.jobs)) {
            jobsData = jobsResponse.data.data.jobs;
          }
        }
      }
      
      console.log("Processed Jobs Data:", jobsData);
      // Check for hasApplied property
      if (jobsData.length > 0) {
        console.log("First job hasApplied:", jobsData[0].hasApplied);
        console.log("Sample job object:", jobsData[0]);
      }
      
      // Đảm bảo số lượt xem và số ứng viên có giá trị
      const processedJobs = jobsData.map((job: Job) => ({
        ...job,
        viewCount: job.viewCount || job.viewsCount || 0, // Ưu tiên viewCount, rồi đến viewsCount
        applicationsCount: job.applicationsCount || job.applicationCount || 0, // Ưu tiên applicationsCount, rồi đến applicationCount
        viewsCount: job.viewCount || job.viewsCount || 0 // Cập nhật viewsCount để đảm bảo tương thích ngược
      }));
      
      setJobs(processedJobs);
      
      // Get saved jobs if user is logged in
      if (user) {
        try {
          const savedResponse = await jobsAPI.getSavedJobs();
          if (savedResponse.data) {
            // Handle different response formats
            const savedJobsData = Array.isArray(savedResponse.data) 
              ? savedResponse.data 
              : (savedResponse.data.data || []);
            
            setSavedJobs(savedJobsData.map((job: SavedJob) => job.jobId) || []);
          }
        } catch (savedError) {
          console.error('Error loading saved jobs:', savedError);
          setSavedJobs([]); // Set empty array on error
        }
      }
      
      setNewJobCount(0);
      setNewJobAlert(false);
    } catch (error) {
      console.error('Error loading jobs:', error);
      setError(t('error.loadJobs'));
      setJobs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [t, user]);

  // Apply filters
  const applyFilters = useCallback(() => {
    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      setFilteredJobs([]);
      return;
    }
    
    let filtered = [...jobs];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(search) ||
        (typeof job.company === 'object' ? 
          job.company?.companyName?.toLowerCase().includes(search) : 
          job.company?.toLowerCase().includes(search)) ||
        job.location?.toLowerCase().includes(search) ||
        job.description?.toLowerCase().includes(search) ||
        job.skills?.some((skill: string) => skill.toLowerCase().includes(search))
      );
    }

    // Job type filter
    if (filters.jobType.length > 0) {
      filtered = filtered.filter(job => job.type && filters.jobType.includes(job.type));
    }

    // Work mode filter
    if (filters.workMode.length > 0) {
      filtered = filtered.filter(job => job.workMode && filters.workMode.includes(job.workMode));
    }

    // Experience level filter
    if (filters.experienceLevel.length > 0) {
      filtered = filtered.filter(job => job.experienceLevel && filters.experienceLevel.includes(job.experienceLevel));
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Salary filter
    if (filters.salary) {
      const [min, max] = filters.salary.split('-').map(Number);
      filtered = filtered.filter(job => 
        (job.salaryMin && job.salaryMin >= min) || 
        (job.salaryMax && job.salaryMax <= max)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          const bDate = b.publishedAt || b.createdAt;
          const aDate = a.publishedAt || a.createdAt;
          return getDateValue(bDate).getTime() - getDateValue(aDate).getTime();
        case 'salary-high':
          return (b.salaryMax || 0) - (a.salaryMax || 0);
        case 'salary-low':
          return (a.salaryMin || 0) - (b.salaryMin || 0);
        case 'relevance':
          return (b.matchScore || 0) - (a.matchScore || 0);
        default:
          return 0;
      }
    });

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [jobs, searchTerm, filters, sortBy]);

  // Handle apply job
  const handleApplyJob = useCallback((job: Job) => {
    if (!user) {
      toast.error(t('error.loginRequired'));
      return;
    }

    if (user.role !== 'STUDENT') {
      toast.error('Chỉ sinh viên mới có thể ứng tuyển vào vị trí này');
      return;
    }

    setSelectedJob(job);
    setOpenApplication(true);
  }, [user, t]);

  // Submit application
  const handleSubmitApplication = useCallback(async (coverLetter: string, additionalFiles?: File[]) => {
    if (!selectedJob || !user) return;

    try {
      setIsSubmitting(true);

      // Upload additional files if any
      let resumeUrl = '';
      if (additionalFiles?.length) {
        try {
          // Upload only the first file as resume
          const formData = new FormData();
          formData.append('resume', additionalFiles[0]);
          
          const config = {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          };
          
          const uploadResponse = await axios.post(
            `${API_BASE_URL}/api/applications/${selectedJob.id}/resume`, 
            formData, 
            config
          );
          
          if (uploadResponse.data?.success) {
            resumeUrl = uploadResponse.data.data.url;
          }
        } catch (uploadError) {
          console.error('Error uploading resume:', uploadError);
          // Continue with application submission even if file upload fails
        }
      }

      // Submit application
      await applicationsAPI.create({
        jobId: selectedJob.id,
        coverLetter,
        customResume: resumeUrl || null
      });

      toast.success(t('application.submitSuccess'));
      setOpenApplication(false);
      
      // Update job in list to show as applied
      setJobs(prev => prev.map(job => 
        job.id === selectedJob.id ? { ...job, hasApplied: true } : job
      ));

    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(t('error.submitApplication'));
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedJob, user, t]);

  // Handle save job
  const handleSaveJob = useCallback(async (jobId: string) => {
    if (!user) {
      toast.error(t('error.loginRequired'));
      return;
    }

    const isSaved = savedJobs.includes(jobId);
    
    try {
      // Optimistic update
      setSavedJobs(prev =>
        isSaved ? prev.filter(id => id !== jobId) : [...prev, jobId]
      );
      
      // API call
      if (isSaved) {
        await jobsAPI.unsaveJob(jobId);
      } else {
        await jobsAPI.saveJob(jobId);
      }
      
      toast.success(isSaved ? t('job.unsaved') : t('job.saved'));
    } catch (error) {
      console.error('Error saving job:', error);
      // Revert optimistic update
      setSavedJobs(prev => 
        isSaved ? [...prev, jobId] : prev.filter(id => id !== jobId)
      );
      toast.error(t('error.general'));
    }
  }, [savedJobs, user, t]);

  // Socket connection for real-time updates
  useEffect(() => {
    if (!user) return;

    try {
      // Check if socket is already connected to avoid duplicate connections
      if (!socketService.isConnected) {
        socketService.connect(localStorage.getItem('token')!);
        
        // Only join room if connection is successful
        if (socketService.isConnected) {
          socketService.joinJobRoom('all-jobs');
        }
      }
      
      // Setup event listeners
      socketService.on('new-job-posted', (newJob: Job) => {
        setNewJobCount(prev => prev + 1);
        setNewJobAlert(true);
      });

      socketService.on('job-updated', (updatedJob: Job) => {
        setJobs(prev => prev.map(job => 
          job.id === updatedJob.id ? { ...job, ...updatedJob } : job
        ));
      });

      // Clean up function
      return () => {
        // Remove event listeners first
        socketService.off('new-job-posted');
        socketService.off('job-updated');
        
        // Only disconnect if we're the ones who connected
        if (socketService.isConnected) {
          socketService.disconnect();
        }
      };
    } catch (error) {
      console.error('Socket connection error:', error);
      // Don't show error to user, just log it
    }
  }, [user]);

  // Fetch user's applied jobs
  const fetchUserApplications = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await applicationsAPI.getByStudent();
      console.log("User applications:", response.data);
      
      if (response.data?.success && Array.isArray(response.data.data)) {
        const appliedJobIds = response.data.data.map((app: Application) => app.jobId);
        console.log("Applied job IDs:", appliedJobIds);
        
        // Update jobs with applied status
        setJobs(prevJobs => 
          prevJobs.map(job => ({
            ...job,
            hasApplied: appliedJobIds.includes(job.id)
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching user applications:", error);
    }
  }, [user]);
  
  // Load jobs on mount
  useEffect(() => {
    loadJobs().then(() => {
      if (user) {
        fetchUserApplications();
      }
    });
    
    // Socket setup
    const token = localStorage.getItem('token') || '';
    socketService.connect(token);
    
    // Listen for new job events
    socketService.on('new-job', (data: { id: string; title: string }) => {
      setNewJobCount(prev => prev + 1);
      setNewJobAlert(true);
    });
    
    return () => {
      // Clean up socket listeners
      socketService.off('new-job');
      socketService.disconnect();
    };
  }, [loadJobs, fetchUserApplications, user]);
  
  // Apply filters whenever dependencies change
  useEffect(() => {
    if (Array.isArray(jobs)) {
      applyFilters();
    } else {
      setFilteredJobs([]);
    }
  }, [jobs, searchTerm, filters, sortBy, applyFilters]);

  // Pagination
  const currentJobs = useMemo(() => {
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    return filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  }, [filteredJobs, currentPage, jobsPerPage]);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  // Function to handle job click for viewing details
  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setOpenJobDetails(true);
    
    // Track job view
    try {
      jobsAPI.incrementView(job.id)
        .then(response => {
          if (response.data?.success) {
            // Update local job view count with the returned value from the server
            setJobs(prev => 
              prev.map(j => 
                j.id === job.id 
                  ? { 
                      ...j, 
                      viewCount: response.data.data.viewCount,
                      applicationsCount: response.data.data.applicationsCount || j.applicationsCount
                    }
                  : j
              )
            );
          }
        })
        .catch(err => {
          console.error('Error tracking job view:', err);
          // Silently fail - don't show error to user
        });
    } catch (error) {
      console.error('Error tracking job view:', error);
      // Silently fail - don't show error to user
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {t('job.exploreOpportunities')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('job.findYourDream')}
        </Typography>
      </Box>

      {/* Search and Filter Bar */}
      <Card 
        elevation={0}
        sx={{ 
          mb: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 3
        }}
      >
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder={t('job.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => setFilterDrawerOpen(true)}
                  sx={{ borderRadius: 2 }}
                >
                  {t('job.filters')}
                </Button>
                <FormControl sx={{ minWidth: 200 }}>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    displayEmpty
                    startAdornment={<Sort sx={{ mr: 1, color: 'action.active' }} />}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="newest">{t('job.sort.newest')}</MenuItem>
                    <MenuItem value="salary-high">{t('job.sort.salaryHigh')}</MenuItem>
                    <MenuItem value="salary-low">{t('job.sort.salaryLow')}</MenuItem>
                    <MenuItem value="relevance">{t('job.sort.relevance')}</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* New Job Alert */}
      <Collapse in={newJobAlert}>
        <Alert 
          severity="info"
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={loadJobs}
              startIcon={<Refresh />}
            >
              {t('job.refresh')}
            </Button>
          }
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {newJobCount === 1 
            ? t('job.newJobAlert') 
            : t('job.newJobsAlert', { count: newJobCount })}
        </Alert>
      </Collapse>

      {/* Job List */}
      {loading ? (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, idx) => (
            <Grid item xs={12} md={6} lg={4} key={idx}>
              <Card sx={{ height: '100%', borderRadius: 3 }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Skeleton variant="circular" width={50} height={50} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="80%" />
                        <Skeleton variant="text" width="60%" />
                      </Box>
                    </Box>
                    <Skeleton variant="rectangular" height={100} />
                    <Stack direction="row" spacing={1}>
                      <Skeleton variant="rounded" width={80} height={32} />
                      <Skeleton variant="rounded" width={80} height={32} />
                      <Skeleton variant="rounded" width={80} height={32} />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : filteredJobs.length === 0 ? (
        <Box 
          sx={{ 
            textAlign: 'center',
            py: 8,
            px: 3,
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: '1px dashed',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" gutterBottom>
            {t('job.noMatch')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('job.adjustFilters')}
          </Typography>
          <Button 
            variant="outlined"
            onClick={() => {
              setSearchTerm('');
              setFilters({
                jobType: [],
                workMode: [],
                experienceLevel: [],
                location: '',
                salary: ''
              });
              setSortBy('newest');
            }}
          >
            {t('job.clearFilters')}
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {currentJobs.map((job, idx) => (
              <Grid item xs={12} md={6} lg={4} key={job.id || idx}>
                <Fade in timeout={300 + idx * 100}>
                  <Card
                    component={motion.div}
                    whileHover={{ 
                      y: -4,
                      boxShadow: theme.shadows[4]
                    }}
                    sx={{ 
                      height: '100%',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleJobClick(job)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar
                          src={typeof job.company === 'object' ? job.company?.logoUrl : job.companyLogo}
                          sx={{ 
                            width: 50,
                            height: 50,
                            mr: 2,
                            bgcolor: 'primary.main'
                          }}
                        >
                          {typeof job.company === 'object' ? job.company?.companyName?.[0] : 
                           typeof job.company === 'string' ? job.company?.[0] : 
                           'C'}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {job.title || t('job.noTitle')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {typeof job.company === 'object' ? job.company?.companyName : 
                             typeof job.company === 'string' ? job.company : 
                             t('job.unknownCompany')}
                          </Typography>
                        </Box>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveJob(job.id);
                          }}
                          sx={{ 
                            color: savedJobs.includes(job.id) ? 'primary.main' : 'action.active'
                          }}
                        >
                          {savedJobs.includes(job.id) ? <Bookmark /> : <BookmarkBorder />}
                        </IconButton>
                      </Box>

                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          {job.location && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationOn fontSize="small" color="action" />
                              <Typography variant="body2">{job.location}</Typography>
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AttachMoney fontSize="small" color="action" />
                            <Typography variant="body2">
                              {job.salaryMin && job.salaryMax
                                ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${job.currency || 'VND'}`
                                : t('job.negotiable')}
                            </Typography>
                          </Box>
                          {(job.publishedAt || job.createdAt) && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTime fontSize="small" color="action" />
                              <Typography variant="body2">
                                {getDateValue(job.publishedAt || job.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {job.type && (
                            <Chip 
                              icon={<WorkOutline />}
                              label={job.type}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                          {job.workMode && (
                            <Chip
                              icon={job.workMode === 'REMOTE' ? <Public /> : <Business />}
                              label={job.workMode}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {job.experienceLevel && (
                            <Chip
                              icon={<School />}
                              label={job.experienceLevel}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Stack>

                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {job.description ? `${job.description.slice(0, 150)}...` : t('job.noDescription')}
                          </Typography>
                          {job.skills && job.skills.length > 0 ? (
                            <>
                              {job.skills.slice(0, 3).map((skill: string, i: number) => (
                                <Chip
                                  key={i}
                                  label={skill}
                                  size="small"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              ))}
                              {job.skills.length > 3 && (
                                <Chip
                                  label={`+${job.skills.length - 3}`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </>
                          ) : null}
                        </Box>

                        <Stack 
                          direction="row" 
                          spacing={2} 
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          {/* Hiển thị thông tin ứng viên và lượt xem cho mỗi công việc */}
                          <Stack direction="row" spacing={2}>
                            <Tooltip title={t('job.views')}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <TrendingUp fontSize="small" color="action" />
                                <Typography variant="body2" fontWeight="medium">
                                  {job.viewCount?.toLocaleString() || 0}
                                </Typography>
                              </Box>
                            </Tooltip>
                            <Tooltip title={t('job.applicants')}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Group fontSize="small" color="action" />
                                <Typography 
                                  variant="body2" 
                                  fontWeight="medium" 
                                  color={job.applicationsCount && job.applicationsCount > 0 ? 'primary' : 'text.secondary'}
                                >
                                  {job.applicationsCount?.toLocaleString() || 0}
                                </Typography>
                              </Box>
                            </Tooltip>
                            {job.matchScore && (
                              <Tooltip title={t('job.matchScore')}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Speed fontSize="small" color="action" />
                                  <Typography variant="body2">
                                    {job.matchScore}%
                                  </Typography>
                                </Box>
                              </Tooltip>
                            )}
                          </Stack>
                          {user && user.role === 'STUDENT' && (
                            <Button
                              variant={job.hasApplied ? "contained" : "contained"}
                              color={job.hasApplied ? "success" : "primary"}
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!job.hasApplied) {
                                  handleApplyJob(job);
                                }
                              }}
                              disabled={job.hasApplied}
                              startIcon={job.hasApplied ? <CheckCircle /> : <Send />}
                              sx={{
                                backgroundColor: job.hasApplied ? '#4caf50' : undefined,
                                color: 'white',
                                '&.Mui-disabled': {
                                  backgroundColor: '#4caf50',
                                  color: 'white',
                                  opacity: 1
                                }
                              }}
                            >
                              {job.hasApplied ? t('jobs.applied') : t('jobs.apply')}
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                color="primary"
                size="large"
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}

      {/* Job Details Dialog */}
      {selectedJob && (
        <JobDetailsDialog
          open={openJobDetails}
          job={selectedJob}
          onClose={() => setOpenJobDetails(false)}
          onApply={handleApplyJob}
          onSave={handleSaveJob}
        />
      )}

      {/* Application Dialog */}
      {selectedJob && (
        <ApplicationDialog
          open={openApplication}
          job={selectedJob}
          onClose={() => setOpenApplication(false)}
          onSubmit={handleSubmitApplication}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 } }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              {t('job.filters')}
            </Typography>
            <IconButton onClick={() => setFilterDrawerOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          <Stack spacing={3}>
            {/* Job Type Filter */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                {t('job.type')}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'].map(type => (
                  <Chip
                    key={type}
                    label={t(`job.types.${type.toLowerCase()}`)}
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        jobType: prev.jobType.includes(type)
                          ? prev.jobType.filter(t => t !== type)
                          : [...prev.jobType, type]
                      }));
                    }}
                    color={filters.jobType.includes(type) ? 'primary' : 'default'}
                  />
                ))}
              </Stack>
            </Box>

            {/* Work Mode Filter */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                {t('job.workMode')}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {['ONSITE', 'REMOTE', 'HYBRID'].map(mode => (
                  <Chip
                    key={mode}
                    label={t(`job.workModes.${mode.toLowerCase()}`)}
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        workMode: prev.workMode.includes(mode)
                          ? prev.workMode.filter(m => m !== mode)
                          : [...prev.workMode, mode]
                      }));
                    }}
                    color={filters.workMode.includes(mode) ? 'primary' : 'default'}
                  />
                ))}
              </Stack>
            </Box>

            {/* Experience Level Filter */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                {t('job.experienceLevel')}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {['ENTRY', 'JUNIOR', 'INTERMEDIATE', 'SENIOR'].map(level => (
                  <Chip
                    key={level}
                    label={t(`job.experienceLevels.${level.toLowerCase()}`)}
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        experienceLevel: prev.experienceLevel.includes(level)
                          ? prev.experienceLevel.filter(l => l !== level)
                          : [...prev.experienceLevel, level]
                      }));
                    }}
                    color={filters.experienceLevel.includes(level) ? 'primary' : 'default'}
                  />
                ))}
              </Stack>
            </Box>

            {/* Location Filter */}
            <TextField
              label={t('job.location')}
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn />
                  </InputAdornment>
                )
              }}
            />

            {/* Salary Range Filter */}
            <FormControl fullWidth>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                {t('job.salaryRange')}
              </Typography>
              <Select
                value={filters.salary}
                onChange={(e) => setFilters(prev => ({ ...prev, salary: e.target.value }))}
                displayEmpty
              >
                <MenuItem value="">{t('job.allSalaries')}</MenuItem>
                <MenuItem value="0-5000000">&lt; 5M VND</MenuItem>
                <MenuItem value="5000000-10000000">5M - 10M VND</MenuItem>
                <MenuItem value="10000000-20000000">10M - 20M VND</MenuItem>
                <MenuItem value="20000000-50000000">20M - 50M VND</MenuItem>
                <MenuItem value="50000000-999999999">&gt; 50M VND</MenuItem>
              </Select>
            </FormControl>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setFilters({
                    jobType: [],
                    workMode: [],
                    experienceLevel: [],
                    location: '',
                    salary: ''
                  });
                }}
              >
                {t('job.clearFilters')}
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setFilterDrawerOpen(false)}
              >
                {t('job.applyFilters')}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ModernJobsPage; 