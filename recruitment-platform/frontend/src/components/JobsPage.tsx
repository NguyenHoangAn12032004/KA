import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Box, Typography, Card, CardContent, Button, TextField, InputAdornment, Grid, Chip, Avatar, 
  CircularProgress, Pagination, useTheme, Fade, Stack, Skeleton, IconButton, Container,
  FormControl, InputLabel, Select, MenuItem, OutlinedInput, Drawer, Divider, Badge, Tooltip,
  ToggleButtonGroup, ToggleButton, useMediaQuery, Paper, Collapse, Alert, Tabs, Tab,
  Snackbar, Grow
} from '@mui/material';
import { 
  Search, Work, LocationOn, AttachMoney, Bookmark, BookmarkBorder, Send, Business,
  FilterList, Sort, GridView, ViewList, Refresh, TuneOutlined, Close, KeyboardArrowDown,
  TrendingUp, Notifications, AccessTime, School, Public, LocalOffer, Tune
} from '@mui/icons-material';
import { jobsAPI, savedJobsAPI } from '../services/api';
import JobCard from './JobCard';
import JobDetailsDialog from './JobDetailsDialog';
import { toast } from 'react-toastify';
import socketService from '../services/socketService';
import { debounce } from 'lodash';
import { API_URL } from '../config';

// Import types
interface Job {
  id: string;
  title: string;
  company?: string;
  companyLogo?: string;
  location: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  type: string; // Thay jobType thành type để phù hợp với interface
  workMode?: string;
  experienceLevel?: string;
  description?: string;
  applicationDeadline?: string;
  publishedAt?: string;
  applicationsCount?: number;
  applicationCount?: number;
  isSaved?: boolean;
  hasApplied?: boolean;
  viewCount?: number;
  viewsCount?: number;
  createdAt?: string;
  skills?: string[];
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

const JobsPage: React.FC = () => {
  // Theme and translations
  const theme = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Constants
  const jobsPerPage = 9;
  const gridSize = isMobile ? 12 : isTablet ? 6 : 4;

  // State declarations
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [openJobDetails, setOpenJobDetails] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [newJobAlert, setNewJobAlert] = useState(false);
  const [newJobCount, setNewJobCount] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    jobType: '',
    location: '',
    salary: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [jobTypeFilter, setJobTypeFilter] = useState<string[]>([]);
  const [workModeFilter, setWorkModeFilter] = useState<string[]>([]);
  const [experienceLevelFilter, setExperienceLevelFilter] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  // Function declarations
  // Load jobs
  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await jobsAPI.getAll();
      console.log('Jobs response:', response.data);

      // Chuẩn hóa dữ liệu jobs
      let jobsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          jobsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          jobsData = response.data.data;
        } else if (response.data.jobs && Array.isArray(response.data.jobs)) {
          jobsData = response.data.jobs;
        } else if (response.data.data && response.data.data.jobs && Array.isArray(response.data.data.jobs)) {
          jobsData = response.data.data.jobs;
        }
      }

      // Đảm bảo số lượt xem và số ứng viên có giá trị
      const processedJobs = jobsData.map((job: any) => ({
        ...job,
        viewCount: job.viewCount || job.viewsCount || 0, // Ưu tiên viewCount, rồi đến viewsCount
        applicationsCount: job.applicationsCount || job.applicationCount || 0, // Ưu tiên applicationsCount, rồi đến applicationCount
        viewsCount: job.viewCount || job.viewsCount || 0 // Cập nhật viewsCount để đảm bảo tương thích ngược
      }));

      setJobs(processedJobs);
      setFilteredJobs(processedJobs); // Khởi tạo danh sách đã lọc với tất cả công việc
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError(t('error.loadJobs'));
      setLoading(false);
    }
  }, [t]);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    await loadJobs();
    setIsRefreshing(false);
  }, [isRefreshing, loadJobs]);

  const applyFilters = useCallback(() => {
    let filtered = [...jobs];
    
    // Apply tab filter
    switch (activeTab) {
      case 1: // Full Time
        filtered = filtered.filter(job => job.type === 'FULL_TIME');
        break;
      case 2: // Part Time
        filtered = filtered.filter(job => job.type === 'PART_TIME');
        break;
      case 3: // Internship
        filtered = filtered.filter(job => job.type === 'INTERNSHIP');
        break;
      case 4: // Remote
        filtered = filtered.filter(job => job.workMode === 'REMOTE');
        break;
    }
    
    // Text search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(searchLower) ||
        job.company?.toLowerCase().includes(searchLower) ||
        job.location?.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower) ||
        job.skills?.some((skill: string) => skill.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply other filters
    if (jobTypeFilter.length > 0) {
      filtered = filtered.filter(job => jobTypeFilter.includes(job.type));
    }
    
    if (workModeFilter.length > 0) {
      filtered = filtered.filter(job => workModeFilter.includes(job.workMode || ''));
    }
    
    if (experienceLevelFilter.length > 0) {
      filtered = filtered.filter(job => experienceLevelFilter.includes(job.experienceLevel || ''));
    }
    
    if (locationFilter) {
      filtered = filtered.filter(job => 
        job.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return getDateValue(b.publishedAt || b.createdAt).getTime() - 
                 getDateValue(a.publishedAt || a.createdAt).getTime();
        case 'oldest':
          return getDateValue(a.publishedAt || a.createdAt).getTime() - 
                 getDateValue(b.publishedAt || b.createdAt).getTime();
        case 'salary-high':
          return (b.salaryMax || 0) - (a.salaryMax || 0);
        case 'salary-low':
          return (a.salaryMin || 0) - (b.salaryMin || 0);
        case 'popularity':
          return (b.viewsCount || 0) - (a.viewsCount || 0);
        default:
          return 0;
      }
    });
    
    setFilteredJobs(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [jobs, searchTerm, jobTypeFilter, workModeFilter, experienceLevelFilter, locationFilter, sortOption, activeTab]);

  const matchesFilters = useCallback((job: Job) => {
    if (jobTypeFilter.length > 0 && !jobTypeFilter.includes(job.type)) return false;
    if (workModeFilter.length > 0 && !workModeFilter.includes(job.workMode || '')) return false;
    if (experienceLevelFilter.length > 0 && !experienceLevelFilter.includes(job.experienceLevel || '')) return false;
    if (locationFilter && !job.location?.toLowerCase().includes(locationFilter.toLowerCase())) return false;
    return true;
  }, [jobTypeFilter, workModeFilter, experienceLevelFilter, locationFilter]);

  const handleSocketError = useCallback((error: Error) => {
    console.error('Socket connection error:', error);
    setError('Lost connection to real-time updates');
  }, []);

  const handleJobUpdate = useCallback((updatedJob: Job) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === updatedJob.id ? { ...job, ...updatedJob } : job
      )
    );
  }, []);

  const handleNewJob = useCallback((newJob: Job) => {
    setNewJobCount(prev => prev + 1);
    setNewJobAlert(true);
    // Add new job to the list if it matches current filters
    if (matchesFilters(newJob)) {
      setJobs(prevJobs => [newJob, ...prevJobs]);
    }
  }, [matchesFilters]);

  // Handle save job
  const handleSaveJob = async (jobId: string) => {
    try {
      if (savedJobs.includes(jobId)) {
        // Unsave job
        await jobsAPI.unsaveJob(jobId);
        setSavedJobs(prev => prev.filter(id => id !== jobId));
      } else {
        // Save job
        await jobsAPI.saveJob(jobId);
        setSavedJobs(prev => [...prev, jobId]);
      }
    } catch (error) {
      console.error('Error saving/unsaving job:', error);
      setError(t('error.saveJob'));
    }
  };

  // Effects
  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Socket connection setup
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    try {
      socketService.connect(token);
      socketService.joinJobRoom('all-jobs');
      socketService.on('new-job-posted', handleNewJob);
      socketService.on('job-updated', handleJobUpdate);
      socketService.on('connect_error', handleSocketError);

      return () => {
        socketService.off('new-job-posted');
        socketService.off('job-updated');
        socketService.off('connect_error');
        socketService.disconnect();
      };
    } catch (error) {
      console.error('Socket connection error:', error);
      setError('Failed to establish real-time connection');
    }
  }, [handleNewJob, handleJobUpdate, handleSocketError]);

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce((term: string) => {
      setSearchTerm(term);
    }, 300),
    []
  );

  // Check if user can apply to jobs
  const canApplyToJobs = (): boolean => {
    return Boolean(user && user.role === 'STUDENT');
  };

  // Handle job application
  const handleApplyJob = (job: any) => {
    // Check if user can apply (only STUDENT role can apply)
    if (!user) {
      toast.error('Vui lòng đăng nhập để ứng tuyển');
      return;
    }
    
    if (user.role !== 'STUDENT') {
      toast.error('Chỉ sinh viên mới có thể ứng tuyển vào vị trí này');
      return;
    }
    
    // Open job details with application focus
    setSelectedJob(job);
    setOpenJobDetails(true);
  };

  // Handle job click to view details
  const handleJobClick = async (job: any) => {
    setSelectedJob(job);
    setOpenJobDetails(true);
    
    try {
      // Call the dedicated endpoint for tracking job views
      const response = await jobsAPI.incrementView(job.id);
      
      if (response?.data?.success) {
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
        
        // Update filtered jobs as well
        setFilteredJobs(prev => 
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
    } catch (error) {
      console.error('Error tracking job view:', error);
      // Silently fail - don't show error to user
    }
  };

  // Handle menu click for job options
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, job: any) => {
    // Prevent propagation to avoid triggering job click
    event.stopPropagation();
    // Additional menu functionality can be added here
    console.log('Job menu clicked:', job.title);
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilters({
      jobType: '',
      location: '',
      salary: ''
    });
    setFilteredJobs(jobs);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  // Memoized location options from all jobs
  const locationOptions = useMemo(() => {
    const locations = jobs.map(job => job.location).filter(Boolean);
    return Array.from(new Set(locations)).sort();
  }, [jobs]);

  // Filter drawer content
  const filterDrawer = (
    <Box sx={{ width: isMobile ? '100vw' : 320, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          {t('job.filters')}
        </Typography>
        <IconButton onClick={() => setFilterDrawerOpen(false)}>
          <Close />
        </IconButton>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Job Type Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {t('job.type')}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'].map((type) => (
            <Chip
              key={type}
              label={t(`job.types.${type.toLowerCase()}`)}
              color={jobTypeFilter.includes(type) ? 'primary' : 'default'}
              onClick={() => {
                setJobTypeFilter(prev => 
                  prev.includes(type) 
                    ? prev.filter(t => t !== type) 
                    : [...prev, type]
                );
              }}
              sx={{ m: 0.5 }}
            />
          ))}
        </Stack>
      </Box>
      
      {/* Work Mode Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {t('job.workMode')}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {['ONSITE', 'REMOTE', 'HYBRID'].map((mode) => (
            <Chip
              key={mode}
              label={t(`job.workModes.${mode.toLowerCase()}`)}
              color={workModeFilter.includes(mode) ? 'primary' : 'default'}
              onClick={() => {
                setWorkModeFilter(prev => 
                  prev.includes(mode) 
                    ? prev.filter(m => m !== mode) 
                    : [...prev, mode]
                );
              }}
              sx={{ m: 0.5 }}
            />
          ))}
        </Stack>
      </Box>
      
      {/* Experience Level Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {t('job.experienceLevel')}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {['ENTRY', 'JUNIOR', 'INTERMEDIATE', 'SENIOR'].map((level) => (
            <Chip
              key={level}
              label={t(`job.experienceLevels.${level.toLowerCase()}`)}
              color={experienceLevelFilter.includes(level) ? 'primary' : 'default'}
              onClick={() => {
                setExperienceLevelFilter(prev => 
                  prev.includes(level) 
                    ? prev.filter(l => l !== level) 
                    : [...prev, level]
                );
              }}
              sx={{ m: 0.5 }}
            />
          ))}
        </Stack>
      </Box>
      
      {/* Location Filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {t('job.location')}
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel>{t('job.selectLocation')}</InputLabel>
          <Select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            input={<OutlinedInput label={t('job.selectLocation')} />}
          >
            <MenuItem value="">
              <em>{t('job.allLocations')}</em>
            </MenuItem>
            {locationOptions.map((location) => (
              <MenuItem key={location} value={location}>
                {location}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button 
          variant="outlined" 
          onClick={handleResetFilters}
          startIcon={<Refresh />}
        >
          {t('job.resetFilters')}
        </Button>
        <Button 
          variant="contained" 
          onClick={() => setFilterDrawerOpen(false)}
        >
          {t('job.applyFilters')}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {t('job.list')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('job.findYourDream')}
        </Typography>
      </Box>
      
      {/* Search and Filter Bar */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          mb: 4, 
          borderRadius: 3,
          background: theme.palette.background.paper
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: 'center'
        }}>
          <TextField
            fullWidth
            placeholder={t('job.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => debouncedSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }}
            size="medium"
          />
          
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            flexShrink: 0,
            width: { xs: '100%', md: 'auto' },
            justifyContent: { xs: 'space-between', md: 'flex-start' }
          }}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setFilterDrawerOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              {t('job.filters')}
            </Button>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                displayEmpty
                startAdornment={<Sort sx={{ mr: 1, color: 'action.active' }} />}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="newest">{t('job.sort.newest')}</MenuItem>
                <MenuItem value="oldest">{t('job.sort.oldest')}</MenuItem>
                <MenuItem value="salary-high">{t('job.sort.salaryHigh')}</MenuItem>
                <MenuItem value="salary-low">{t('job.sort.salaryLow')}</MenuItem>
                <MenuItem value="popularity">{t('job.sort.popularity')}</MenuItem>
              </Select>
            </FormControl>
            
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => {
                if (newMode) setViewMode(newMode);
              }}
              aria-label="view mode"
              size="small"
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              <ToggleButton value="grid" aria-label="grid view">
                <GridView />
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <ViewList />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Paper>
      
      {/* New Job Alert */}
      <Collapse in={newJobAlert}>
        <Alert 
          severity="info"
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleRefresh}
              startIcon={<Refresh />}
            >
              {t('job.refresh')}
            </Button>
          }
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {newJobCount === 1 
            ? t('job.newJobAlert') 
            : t('job.newJobsAlert').replace('{{count}}', newJobCount.toString())}
        </Alert>
      </Collapse>
      
      {/* Job Categories Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minWidth: 'auto',
              px: 3,
              py: 1,
              borderRadius: 2,
              mx: 0.5,
              fontWeight: 600,
            },
            '& .Mui-selected': {
              bgcolor: 'primary.main',
              color: 'white !important',
            }
          }}
        >
          <Tab label={t('job.allJobs')} icon={<Work />} iconPosition="start" />
          <Tab label={t('job.fullTime')} icon={<Business />} iconPosition="start" />
          <Tab label={t('job.partTime')} icon={<AccessTime />} iconPosition="start" />
          <Tab label={t('job.internship')} icon={<School />} iconPosition="start" />
          <Tab label={t('job.remote')} icon={<Public />} iconPosition="start" />
        </Tabs>
      </Box>
      
      {/* Filter Tags */}
      {(jobTypeFilter.length > 0 || workModeFilter.length > 0 || experienceLevelFilter.length > 0 || locationFilter) && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {jobTypeFilter.map(type => (
            <Chip
              key={type}
              label={t(`job.types.${type.toLowerCase()}`)}
              onDelete={() => {
                setJobTypeFilter(prev => prev.filter(t => t !== type));
              }}
              color="primary"
              variant="outlined"
              size="small"
            />
          ))}
          
          {workModeFilter.map(mode => (
            <Chip
              key={mode}
              label={t(`job.workModes.${mode.toLowerCase()}`)}
              onDelete={() => {
                setWorkModeFilter(prev => prev.filter(m => m !== mode));
              }}
              color="primary"
              variant="outlined"
              size="small"
            />
          ))}
          
          {experienceLevelFilter.map(level => (
            <Chip
              key={level}
              label={t(`job.experienceLevels.${level.toLowerCase()}`)}
              onDelete={() => {
                setExperienceLevelFilter(prev => prev.filter(l => l !== level));
              }}
              color="primary"
              variant="outlined"
              size="small"
            />
          ))}
          
          {locationFilter && (
            <Chip
              label={locationFilter}
              onDelete={() => setLocationFilter('')}
              color="primary"
              variant="outlined"
              size="small"
            />
          )}
          
          <Chip
            label={t('job.clearAll')}
            onClick={handleResetFilters}
            color="default"
            size="small"
          />
        </Box>
      )}
      
      {/* Results Count */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {filteredJobs.length} {t('job.resultsFound')}
        </Typography>
        
        <Button 
          startIcon={<Refresh />}
          size="small"
          onClick={handleRefresh}
        >
          {t('job.refresh')}
        </Button>
      </Box>
      
      {/* Loading State */}
      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: jobsPerPage }).map((_, idx) => (
            <Grid item xs={12} sm={viewMode === 'grid' ? 6 : 12} md={viewMode === 'grid' ? 4 : 12} key={idx}>
              <Skeleton 
                variant="rectangular" 
                height={viewMode === 'grid' ? 280 : 180} 
                sx={{ borderRadius: 3 }} 
              />
            </Grid>
          ))}
        </Grid>
      ) : filteredJobs.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          bgcolor: 'background.paper',
          borderRadius: 3,
          border: '1px dashed',
          borderColor: 'divider'
        }}>
          <Typography variant="h6" gutterBottom>
            {t('job.noMatch')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('job.adjustFilters')}
          </Typography>
          <Button 
            variant="outlined" 
            onClick={handleResetFilters}
            startIcon={<Refresh />}
          >
            {t('job.clearFilters')}
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {currentJobs.map((job, index) => (
              <Grid item xs={12} md={gridSize} key={job.id || index}>
                <Grow in timeout={300 + index * 100}>
                  <Box>
                    <JobCard
                      job={{
                        ...job,
                        company: {
                          id: "1",
                          companyName: job.company || "Unknown Company",
                          logoUrl: job.companyLogo
                        },
                        type: (job.type || "FULL_TIME") as "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT",
                        workMode: job.workMode as "REMOTE" | "ONSITE" | "HYBRID" | undefined,
                        experienceLevel: job.experienceLevel as "ENTRY" | "JUNIOR" | "INTERMEDIATE" | "SENIOR" | undefined,
                        viewCount: job.viewCount || job.viewsCount || 0, // Đảm bảo luôn có số lượt xem
                        applicationsCount: job.applicationsCount || job.applicationCount || 0 // Đảm bảo luôn có số ứng viên
                      }}
                      onJobClick={handleJobClick}
                      onApplyClick={handleApplyJob}
                      onSaveClick={handleSaveJob}
                      onMenuClick={handleMenuClick}
                      viewMode={viewMode}
                      showApplyButton={canApplyToJobs()} // Only show apply button for students
                    />
                  </Box>
                </Grow>
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
                showFirstButton
                showLastButton
                sx={{ 
                  '& .MuiPaginationItem-root': { borderRadius: 2 },
                  '& .Mui-selected': { fontWeight: 'bold' }
                }}
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
      
      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      >
        {filterDrawer}
      </Drawer>

      {/* Error Alert */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default JobsPage;
