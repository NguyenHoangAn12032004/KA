import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Work,
  Person,
  Search,
  BookmarkBorder,
  Bookmark,
  MoreVert,
  LocationOn,
  Business,
  TrendingUp,
  Assignment,
  FilterList,
  ViewList,
  ViewModule,
  Send,
  Edit,
  Download,
  ExpandMore,
  AttachFile,
  Close,
  CheckCircle,
  Pending,
  Cancel,
  Language,
  LinkedIn,
  GitHub,
  Code,
  School,
  Build,
  EmojiEvents,
  AccessTime
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { jobsAPI, applicationsAPI, savedJobsAPI, usersAPI } from '../services/api';
import JobDetailsDialog from './JobDetailsDialog';
import JobCard from './JobCard';
import ApplicationDialog from './ApplicationDialog';
import { generateModernCV } from '../utils/pdfGeneratorModern';

// Export để file được nhận diện là module
export type StudentDashboardType = {};

interface Job {
  id: string;
  title: string;
  company?: {
    id: string;
    companyName: string;
    logoUrl?: string;
    industry?: string;
    location?: string;
    size?: string;
    website?: string;
    founded?: string;
    description?: string;
    rating?: number;
  };
  location: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
  workMode?: 'ONSITE' | 'REMOTE' | 'HYBRID';
  experienceLevel?: 'ENTRY' | 'JUNIOR' | 'INTERMEDIATE' | 'SENIOR';
  description?: string;
  requirements?: string[];
  benefits?: string[];
  responsibilities?: string[];
  qualifications?: string[];
  skills?: string[];
  applicationDeadline?: string;
  isActive?: boolean;
  publishedAt?: string;
  applicationsCount?: number;
  isSaved?: boolean;
  hasApplied?: boolean;
  viewsCount?: number;
  department?: string;
  reportingTo?: string;
}

interface Application {
  id: string;
  jobId?: string;
  jobTitle?: string;
  companyName?: string;
  status?: 'PENDING' | 'REVIEWING' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'INTERVIEWED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  appliedAt?: string;
  updatedAt?: string;
  coverLetter?: string;
  hrNotes?: string;
  rating?: number;
}

interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  gpa?: number;
  skills: string[];
  experience?: string;
  portfolio?: string;
  github?: string;
  linkedin?: string;
  resume?: string;
  avatar?: string;
  summary?: string;
  // Extended fields for CV generation
  education?: {
    institution: string;
    degree: string;
    major?: string;
    gpa?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
  }[];
  workExperience?: {
    company: string;
    position: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
  }[];
  projects?: {
    name: string;
    description: string;
    technologies: string[];
    link?: string;
    github?: string;
  }[];
  languages?: {
    name: string;
    level: string;
  }[];
  certifications?: {
    name: string;
    issuer: string;
    date: string;
    link?: string;
  }[];
}

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  profileViews: number;
  savedJobs: number;
}

function StudentDashboard(): React.ReactElement {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Data states
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    profileViews: 0,
    savedJobs: 0
  });

  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    loadDashboardData();
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      console.log('🔍 Checking API health at http://localhost:5000...');
      
      // Try multiple endpoints
      const endpoints = [
        'http://localhost:5000/api/health',
        'http://localhost:5000/api',
        'http://localhost:5000',
        'http://localhost:5000/api/jobs'
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            setApiStatus('online');
            return;
          }
        } catch (endpointError) {
          // Continue to next endpoint
        }
      }
      
      setApiStatus('offline');
      
    } catch (error) {
      setApiStatus('offline');
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Starting to load dashboard data...');
      console.log('🔑 Current token:', localStorage.getItem('token')?.substring(0, 20) + '...');
      console.log('👤 Current user:', JSON.parse(localStorage.getItem('user') || 'null'));
      
      // Load all data in parallel
      const [jobsRes, applicationsRes, savedJobsRes, profileRes] = await Promise.all([
        jobsAPI.getAll().catch((error) => {
          console.error('❌ Jobs API error:', error);
          return { data: [] };
        }),
        applicationsAPI.getAll().catch((error) => {
          console.error('❌ Applications API error:', error);
          return { data: [] };
        }),
        savedJobsAPI.getAll().catch((error) => {
          console.error('❌ Saved jobs API error:', error);
          return { data: [] };
        }),
        usersAPI.getProfile().catch((error) => {
          console.error('❌ Profile API error:', error);
          return { data: null };
        })
      ]);

      // Process jobs data
      console.log('🔍 Raw jobs response:', jobsRes);
      let jobsData = [];
      
      if (jobsRes && jobsRes.success && jobsRes.data && jobsRes.data.jobs && Array.isArray(jobsRes.data.jobs)) {
        // Direct API response: { success: true, data: { jobs: [...] } }
        jobsData = jobsRes.data.jobs;
      } else if (jobsRes && jobsRes.data && jobsRes.data.success && jobsRes.data.data && Array.isArray(jobsRes.data.data.jobs)) {
        // Axios wrapped response: { data: { success: true, data: { jobs: [...] } } }
        jobsData = jobsRes.data.data.jobs;
      } else if (jobsRes && jobsRes.data && Array.isArray(jobsRes.data)) {
        // Direct array response
        jobsData = jobsRes.data;
      } else if (Array.isArray(jobsRes)) {
        // Fallback case
        jobsData = jobsRes;
      } else {
        console.warn('⚠️ Unexpected jobs response structure:', jobsRes);
        jobsData = [];
      }
      
      console.log('🔍 Processed jobs data:', jobsData);
      console.log('🔍 Jobs count:', jobsData.length);

      // Process applications data first
      const applicationsData = applicationsRes.data || [];
      let finalApplicationsData = applicationsData;
      if (!Array.isArray(applicationsData) && applicationsData.data) {
        finalApplicationsData = applicationsData.data;
      }
      
      setApplications(finalApplicationsData);

      // Process saved jobs data
      let savedJobsData = [];
      
      try {
        // Axios response structure: { data: { success: true, data: [...] } }
        if (savedJobsRes && savedJobsRes.data && savedJobsRes.data.data && Array.isArray(savedJobsRes.data.data)) {
          savedJobsData = savedJobsRes.data.data;
        } else if (savedJobsRes && savedJobsRes.data && Array.isArray(savedJobsRes.data)) {
          savedJobsData = savedJobsRes.data;
        } else if (Array.isArray(savedJobsRes)) {
          savedJobsData = savedJobsRes;
        } else {
          savedJobsData = [];
        }
        
        setSavedJobs(savedJobsData);
        
        // Create set of saved job IDs for quick lookup
        const savedJobIdSet = new Set<string>();
        
        if (savedJobsData && Array.isArray(savedJobsData)) {
          savedJobsData.forEach((savedJob: any) => {
            if (savedJob && savedJob.jobId) {
              savedJobIdSet.add(String(savedJob.jobId));
            }
          });
        }
        
        setSavedJobIds(savedJobIdSet);
      } catch (savedJobsError) {
        setSavedJobs([]);
        setSavedJobIds(new Set());
      }

      // Load profile data
      console.log('👤 Raw profile response:', profileRes);
      const profileData = profileRes.data;
      if (profileData) {
        console.log('👤 Profile loaded:', profileData);
        console.log('👤 Profile certifications:', profileData.certifications);
        
        // Enhanced demo data for user@example.com
        const isDemoUser = user?.email === 'user@example.com';
        
        setProfile({
          id: profileData.id || '1',
          firstName: profileData.firstName || 'Sinh viên',
          lastName: profileData.lastName || 'Demo',
          email: profileData.email || user?.email || 'student@example.com',
          phone: profileData.phone || (isDemoUser ? '+84 987 654 321' : undefined),
          address: profileData.address || (isDemoUser ? '123 Đường Láng, Đống Đa, Hà Nội' : undefined),
          university: profileData.university,
          major: profileData.major,
          graduationYear: profileData.graduationYear,
          gpa: profileData.gpa,
          skills: profileData.skills || [],
          portfolio: profileData.portfolio,
          linkedin: profileData.linkedin,
          github: profileData.github,
          resume: profileData.resume,
          avatar: profileData.avatar || (isDemoUser ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' : undefined),
          summary: profileData.experience || profileData.summary,
          
          // Enhanced demo data only for user@example.com
          education: profileData.educations || profileData.education || [],
          
          workExperience: profileData.workExperiences || profileData.workExperience || [],
          
          projects: profileData.projects || [],
          
          languages: profileData.languages || [],
          
          certifications: profileData.certifications || []
        });
      } else {
        // Fallback to basic data from user object
        setProfile({
          id: '1',
          firstName: 'Sinh viên',
          lastName: 'Demo',
          email: user?.email || 'student@example.com',
          skills: []
        });
      }

      // Calculate stats and cross-reference applications with jobs
      const pendingCount = applicationsData.filter((app: Application) => app?.status === 'PENDING').length;
      const acceptedCount = applicationsData.filter((app: Application) => app?.status && ['ACCEPTED', 'INTERVIEW_SCHEDULED'].includes(app.status)).length;
      const rejectedCount = applicationsData.filter((app: Application) => app?.status === 'REJECTED').length;

      // Mark jobs as applied if user has application for them
      const appliedJobIds = new Set(applicationsData.map((app: Application) => app.jobId).filter(Boolean));
      console.log('📝 Applied job IDs:', Array.from(appliedJobIds));
      
      const jobsWithApplicationStatus = jobsData.map((job: Job) => ({
        ...job,
        hasApplied: appliedJobIds.has(job.id)
      }));
      
      console.log('🔄 Jobs with application status:', jobsWithApplicationStatus);
      setJobs(jobsWithApplicationStatus);

      setStats({
        totalApplications: applicationsData.length,
        pendingApplications: pendingCount,
        acceptedApplications: acceptedCount,
        rejectedApplications: rejectedCount,
        profileViews: Math.floor(Math.random() * 50) + 10, // Mock data
        savedJobs: savedJobsData.length
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleJobMenuOpen = (event: React.MouseEvent<HTMLElement>, job: Job) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedJob(job);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Don't reset selectedJob here as it might be needed for dialog
  };

  const handleJobClick = (job: Job) => {
    // Close any open menu first
    setAnchorEl(null);
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  const handleApplyJob = (job: Job) => {
    console.log('🎯 handleApplyJob called:', job.id, job.title);
    console.log('🎯 Job object:', job);
    console.log('🎯 Setting selectedJob and showing dialog...');
    
    // Close menu first, but don't reset selectedJob yet
    setAnchorEl(null);
    
    // Set selected job and show dialog
    setSelectedJob(job);
    setCoverLetter('');
    setShowApplicationDialog(true);
    
    console.log('🎯 handleApplyJob completed');
  };

  // Save/unsave job functions
  const handleSaveJob = async (jobId: string) => {
    try {
      console.log('💾 Saving job:', jobId);
      const response = await savedJobsAPI.save(jobId);
      console.log('💾 Save response:', response);
      
      // Update local state immediately
      setSavedJobIds(prev => new Set([...Array.from(prev), jobId]));
      
      // Refresh saved jobs list to get complete data
      const savedJobsRes = await savedJobsAPI.getAll();
      const savedJobsData = savedJobsRes.data?.data || savedJobsRes.data || [];
      setSavedJobs(savedJobsData);
      
      // Update saved job IDs from fresh data
      const savedJobIdSet = new Set<string>();
      if (savedJobsData && Array.isArray(savedJobsData)) {
        savedJobsData.forEach((savedJob: any) => {
          if (savedJob && savedJob.jobId) {
            savedJobIdSet.add(String(savedJob.jobId));
          }
        });
      }
      setSavedJobIds(savedJobIdSet);
      
      // Close menu only
      setAnchorEl(null);
      
      console.log('✅ Job saved successfully');
      alert('Đã lưu công việc thành công!');
    } catch (error: any) {
      console.error('❌ Error saving job:', error);
      // Close menu even on error
      setAnchorEl(null);
      
      if (error.response?.status === 400) {
        // Job already saved - update UI to reflect this
        setSavedJobIds(prev => new Set([...Array.from(prev), jobId]));
        
        // Refresh data to get current state
        try {
          const savedJobsRes = await savedJobsAPI.getAll();
          const savedJobsData = savedJobsRes.data?.data || savedJobsRes.data || [];
          setSavedJobs(savedJobsData);
          
          const savedJobIdSet = new Set<string>();
          if (savedJobsData && Array.isArray(savedJobsData)) {
            savedJobsData.forEach((savedJob: any) => {
              if (savedJob && savedJob.jobId) {
                savedJobIdSet.add(String(savedJob.jobId));
              }
            });
          }
          setSavedJobIds(savedJobIdSet);
        } catch (refreshError) {
          console.error('❌ Error refreshing saved jobs:', refreshError);
        }
        
        alert('Công việc này đã được lưu trước đó.');
      } else {
        alert('Không thể lưu công việc. Vui lòng thử lại.');
      }
    }
  };

  const handleUnsaveJob = async (jobId: string) => {
    try {
      console.log('🗑️ Removing saved job:', jobId);
      const response = await savedJobsAPI.remove(jobId);
      console.log('🗑️ Remove response:', response);
      
      // Update local state
      setSavedJobIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
      
      // Refresh saved jobs list
      await loadDashboardData();
      
      console.log('✅ Saved job removed successfully');
    } catch (error: any) {
      console.error('❌ Error removing saved job:', error);
      if (error.response?.status === 404) {
        // Job wasn't saved, but update UI anyway
        setSavedJobIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } else {
        alert('Không thể bỏ lưu công việc. Vui lòng thử lại.');
      }
    }
  };

  const submitApplication = async () => {
    if (!selectedJob) return;
    
    if (!coverLetter.trim()) {
      alert('Vui lòng nhập thư xin việc!');
      return;
    }

    setIsSubmittingApplication(true);
    console.log('📤 Submitting application for job:', selectedJob.id);

    try {
      const applicationData = {
        jobId: selectedJob.id,
        coverLetter: coverLetter.trim()
      };
      
      console.log('📋 Application data:', applicationData);
      console.log('🌐 API Status:', apiStatus);
      
      // If API is offline, use mock mode
      if (apiStatus === 'offline') {
        console.log('🔴 API offline - using mock mode');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        
        // Create mock application
        const mockApplication: Application = {
          id: Date.now().toString(),
          jobId: selectedJob.id,
          jobTitle: selectedJob.title,
          companyName: selectedJob.company?.companyName || 'Company',
          status: 'PENDING',
          appliedAt: new Date().toISOString(),
          coverLetter: coverLetter.trim()
        };
        
        // Update local state
        setApplications(prev => [mockApplication, ...prev]);
        
        // Update job status locally
        const updatedJobs = jobs.map(job =>
          job.id === selectedJob.id
            ? { ...job, hasApplied: true }
            : job
        );
        setJobs(updatedJobs);
        
        // Close dialog and reset state
        setShowApplicationDialog(false);
        setCoverLetter('');
        setSelectedJob(null);
        
        alert('✅ Ứng tuyển thành công! (Mock mode - API đang offline)');
        return;
      }
      
      const response = await applicationsAPI.create(applicationData);
      console.log('📨 Application response:', response);

      // Close dialog and reset state
      setShowApplicationDialog(false);
      setCoverLetter('');
      setSelectedJob(null);
      
      // Reload data to get latest applications
      await loadDashboardData();
      
      alert('✅ Ứng tuyển thành công!');
    } catch (error) {
      console.error('❌ Error submitting application:', error);
      
      if (error instanceof Error) {
        alert(`❌ Lỗi khi ứng tuyển: ${error.message}`);
      } else {
        alert('❌ Có lỗi xảy ra khi ứng tuyển. Vui lòng kiểm tra kết nối mạng và thử lại.');
      }
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'REVIEWING': return 'info';
      case 'SHORTLISTED': return 'primary';
      case 'INTERVIEW_SCHEDULED': return 'secondary';
      case 'INTERVIEWED': return 'secondary';
      case 'ACCEPTED': return 'success';
      case 'REJECTED': return 'error';
      case 'WITHDRAWN': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Pending />;
      case 'ACCEPTED': return <CheckCircle />;
      case 'REJECTED': return <Cancel />;
      default: return <Assignment />;
    }
  };

  const formatSalary = (job: Job) => {
    if (job.salaryMin && job.salaryMax) {
      return `${(job.salaryMin / 1000000).toFixed(1)}-${(job.salaryMax / 1000000).toFixed(1)} triệu VND`;
    }
    return job.salary || 'Thỏa thuận';
  };

  const filteredJobs = jobs.filter(job => {
    console.log('🔍 Filtering job:', job);
    
    // Ensure job has required properties
    if (!job || !job.title) {
      console.log('❌ Job missing title:', job);
      return false;
    }
    
    const matchesSearch = job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company?.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         false;
    const matchesType = !jobTypeFilter || job.type === jobTypeFilter;
    const matchesLocation = !locationFilter || job.location?.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesExperience = !experienceFilter || job.experienceLevel === experienceFilter;
    
    const result = matchesSearch && matchesType && matchesLocation && matchesExperience;
    console.log('🔍 Job filter result:', { job: job.title, matchesSearch, matchesType, matchesLocation, matchesExperience, result });
    
    return result;
  });

  console.log('🔍 Total jobs:', jobs.length, 'Filtered jobs:', filteredJobs.length);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh', pt: 3 }}>
      <Container maxWidth="xl">
        {/* API Status Alert */}
        {apiStatus === 'offline' && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Không thể kết nối đến server. Chức năng ứng tuyển sẽ bị tạm dừng.
          </Alert>
        )}
        
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Chào mừng trở lại, {profile?.firstName || user?.email}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Khám phá những cơ hội việc làm tuyệt vời dành cho bạn
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Assignment color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">{stats.totalApplications}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Tổng ứng tuyển
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Pending color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">{stats.pendingApplications}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Đang chờ phản hồi
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">{stats.acceptedApplications}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Đã được chấp nhận
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">{stats.profileViews}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Lượt xem hồ sơ
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Main Content Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Tìm việc làm" icon={<Search />} />
            <Tab label="Ứng tuyển của tôi" icon={<Assignment />} />
            <Tab label="Việc làm đã lưu" icon={<Bookmark />} />
            <Tab label="Hồ sơ cá nhân" icon={<Person />} />
          </Tabs>
        </Card>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box>
            {/* Search and Filters */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <TextField
                    fullWidth
                    placeholder="Tìm kiếm việc làm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                
                <Box sx={{ flex: '0 1 200px', minWidth: '150px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Loại công việc</InputLabel>
                    <Select
                      value={jobTypeFilter}
                      onChange={(e) => setJobTypeFilter(e.target.value)}
                      label="Loại công việc"
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      <MenuItem value="FULL_TIME">Toàn thời gian</MenuItem>
                      <MenuItem value="PART_TIME">Bán thời gian</MenuItem>
                      <MenuItem value="INTERNSHIP">Thực tập</MenuItem>
                      <MenuItem value="CONTRACT">Hợp đồng</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: '0 1 200px', minWidth: '150px' }}>
                  <TextField
                    fullWidth
                    placeholder="Địa điểm"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </Box>

                <Box sx={{ flex: '0 1 200px', minWidth: '150px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Kinh nghiệm</InputLabel>
                    <Select
                      value={experienceFilter}
                      onChange={(e) => setExperienceFilter(e.target.value)}
                      label="Kinh nghiệm"
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      <MenuItem value="ENTRY">Mới ra trường</MenuItem>
                      <MenuItem value="JUNIOR">1-2 năm</MenuItem>
                      <MenuItem value="INTERMEDIATE">3-5 năm</MenuItem>
                      <MenuItem value="SENIOR">5+ năm</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      onClick={() => setViewMode('grid')}
                      color={viewMode === 'grid' ? 'primary' : 'default'}
                    >
                      <ViewModule />
                    </IconButton>
                    <IconButton
                      onClick={() => setViewMode('list')}
                      color={viewMode === 'list' ? 'primary' : 'default'}
                    >
                      <ViewList />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Card>

            {/* Jobs Grid/List */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              {filteredJobs.length} việc làm phù hợp
            </Typography>

            <Box sx={{ 
              display: 'grid', 
              gap: 3,
              gridTemplateColumns: {
                xs: '1fr',
                sm: viewMode === 'grid' ? 'repeat(auto-fill, minmax(350px, 1fr))' : '1fr',
                lg: viewMode === 'grid' ? 'repeat(auto-fill, minmax(400px, 1fr))' : '1fr'
              }
            }}>
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  viewMode={viewMode}
                  onJobClick={handleJobClick}
                  onApplyClick={handleApplyJob}
                  onSaveClick={(jobId) => {
                    if (savedJobIds.has(jobId)) {
                      handleUnsaveJob(jobId);
                    } else {
                      handleSaveJob(jobId);
                    }
                  }}
                  onMenuClick={handleJobMenuOpen}
                />
              ))}
            </Box>

            {filteredJobs.length === 0 && (
              <Card sx={{ p: 4, textAlign: 'center' }}>
                <Work sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Không tìm thấy việc làm phù hợp
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Hãy thử điều chỉnh bộ lọc tìm kiếm để có kết quả tốt hơn
                </Typography>
                <Button variant="contained" onClick={() => {
                  setSearchQuery('');
                  setJobTypeFilter('');
                  setLocationFilter('');
                  setExperienceFilter('');
                }}>
                  Xóa bộ lọc
                </Button>
              </Card>
            )}
          </Box>
        )}

        {/* Applications Tab */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Danh sách ứng tuyển ({applications.length})
            </Typography>
            
            {/* Debug Info */}
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2">
                📊 Applications count: {applications.length}
              </Typography>
              <Typography variant="body2">
                🌐 API Status: {apiStatus}
              </Typography>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={loadDashboardData}
                sx={{ mt: 1 }}
              >
                Refresh Applications
              </Button>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={async () => {
                  try {
                    console.log('🔄 Force reloading applications...');
                    const response = await applicationsAPI.getAll();
                    console.log('🔄 Force reload response:', response);
                    setApplications(response.data || []);
                  } catch (error) {
                    console.error('❌ Force reload error:', error);
                  }
                }}
                sx={{ mt: 1, ml: 1 }}
              >
                Force Reload
              </Button>
            </Paper>

            {applications.length === 0 ? (
              <Card sx={{ p: 4, textAlign: 'center' }}>
                <Assignment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Chưa có ứng tuyển nào
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Hãy bắt đầu tìm kiếm và ứng tuyển các công việc phù hợp với bạn
                </Typography>
                <Button variant="contained" onClick={() => setActiveTab(0)}>
                  Tìm việc làm
                </Button>
              </Card>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 3,
                '& > *': {
                  flex: '1 1 calc(33.333% - 16px)',
                  minWidth: '300px'
                }
              }}>
                {applications.map((application) => (
                  <Card key={application.id}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {getStatusIcon(application.status || 'PENDING')}
                        <Chip
                          label={application.status || 'PENDING'}
                          color={getStatusColor(application.status || 'PENDING') as any}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Box>

                      <Typography variant="h6" gutterBottom>
                        {application.jobTitle || 'Job Title'}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {application.companyName || 'Company'}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Ứng tuyển: {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString('vi-VN') : 'N/A'}
                      </Typography>

                      {application.hrNotes && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            {application.hrNotes}
                          </Typography>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Saved Jobs Tab */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Việc làm đã lưu ({savedJobs.length})
            </Typography>

            {savedJobs.length > 0 ? (
              <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(350px, 1fr))' : '1fr' }}>
                {savedJobs.map((savedJob) => {
                  console.log('💾 Rendering saved job:', savedJob);
                  
                  // Handle different data structures
                  const job = savedJob.job || savedJob;
                  const company = job.company_profiles || job.company || {};
                  
                  return (
                    <Card key={savedJob.id} sx={{ p: 3, cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
                      <CardContent sx={{ p: 0 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {job.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {company.companyName || company.name || 'Công ty không xác định'}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {job.location}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Business fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {formatSalary(job)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Chip label={job.jobType || job.type} size="small" variant="outlined" />
                          <Chip label={job.workMode || 'ONSITE'} size="small" variant="outlined" />
                          <Chip label={job.experienceLevel || 'ENTRY'} size="small" variant="outlined" />
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {job.description ? job.description.substring(0, 100) + '...' : 'Mô tả sẽ được cập nhật...'}
                        </Typography>

                        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                          Đã lưu: {savedJob.savedAt ? new Date(savedJob.savedAt).toLocaleDateString('vi-VN') : 'Không xác định'}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            onClick={() => handleUnsaveJob(savedJob.jobId || job.id)}
                            color="primary"
                            sx={{ p: 1 }}
                          >
                            <Bookmark />
                          </IconButton>
                          
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<Send />}
                            onClick={() => handleApplyJob(job)}
                            disabled={job.hasApplied}
                          >
                            {job.hasApplied ? 'Đã ứng tuyển' : 'Ứng tuyển ngay'}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            ) : (
              <Card sx={{ p: 4, textAlign: 'center' }}>
                <Bookmark sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Chưa có việc làm nào được lưu
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Lưu những công việc bạn quan tâm để dễ dàng theo dõi sau này
                </Typography>
                <Button variant="contained" onClick={() => setActiveTab(0)}>
                  Tìm việc làm
                </Button>
              </Card>
            )}
          </Box>
        )}

        {/* Profile Tab */}
        {activeTab === 3 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Hồ sơ cá nhân
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Download />}
                  onClick={() => {
                    if (!profile) {
                      alert('Vui lòng cập nhật thông tin hồ sơ trước khi tải CV');
                      return;
                    }
                    
                    const cvData = {
                      firstName: profile.firstName,
                      lastName: profile.lastName,
                      email: profile.email,
                      phone: profile.phone,
                      address: profile.address,
                      university: profile.university,
                      major: profile.major,
                      graduationYear: profile.graduationYear?.toString(),
                      gpa: profile.gpa?.toString(),
                      skills: profile.skills || [],
                      portfolio: profile.portfolio,
                      linkedin: profile.linkedin,
                      github: profile.github,
                      summary: profile.summary,
                      experience: profile.workExperience || [],
                      education: profile.education || [],
                      projects: profile.projects || [],
                      languages: profile.languages || [],
                      certifications: profile.certifications || []
                    };
                    
                    generateModernCV(cvData);
                  }}
                  sx={{ 
                    fontSize: '0.875rem',
                    px: 3,
                    py: 1
                  }}
                >
                  Tải CV
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setShowProfileDialog(true)}
                  sx={{ 
                    fontSize: '0.875rem',
                    px: 3,
                    py: 1
                  }}
                >
                  Chỉnh sửa
                </Button>
              </Box>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              gap: 3,
              flexDirection: { xs: 'column', lg: 'row' }
            }}>
              {/* Left Column - Personal Info & Avatar */}
              <Box sx={{ 
                flex: { xs: '1 1 100%', lg: '0 0 350px' }
              }}>
                <Card sx={{ mb: 3, overflow: 'visible', position: 'relative' }}>
                  <Box
                    sx={{
                      height: 120,
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      position: 'relative'
                    }}
                  />
                  <CardContent sx={{ pt: 0, pb: 3 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      position: 'relative',
                      mt: -6
                    }}>
                      <Avatar
                        src={profile?.avatar}
                        sx={{ 
                          width: 120, 
                          height: 120, 
                          border: '4px solid white',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                          mb: 2
                        }}
                      >
                        {profile?.firstName?.charAt(0)}
                      </Avatar>
                      
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                        {profile?.firstName} {profile?.lastName}
                      </Typography>
                      
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                        {profile?.email}
                      </Typography>

                      {profile?.phone && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          📱 {profile.phone}
                        </Typography>
                      )}

                      {profile?.address && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          📍 {profile.address}
                        </Typography>
                      )}

                      {/* Quick Links */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {profile?.portfolio && (
                          <Button
                            size="small"
                            variant="outlined"
                            href={profile.portfolio}
                            target="_blank"
                            startIcon={<Language />}
                          >
                            Portfolio
                          </Button>
                        )}
                        {profile?.linkedin && (
                          <Button
                            size="small"
                            variant="outlined"
                            href={profile.linkedin}
                            target="_blank"
                            startIcon={<LinkedIn />}
                          >
                            LinkedIn
                          </Button>
                        )}
                        {profile?.github && (
                          <Button
                            size="small"
                            variant="outlined"
                            href={profile.github}
                            target="_blank"
                            startIcon={<GitHub />}
                          >
                            GitHub
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Skills Card */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Code fontSize="small" />
                      Kỹ năng
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {profile?.skills && profile.skills.length > 0 ? (
                        profile.skills.map((skill, index) => (
                          <Chip 
                            key={index} 
                            label={skill} 
                            variant="outlined" 
                            size="small"
                            sx={{ 
                              borderColor: 'primary.main',
                              color: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'primary.main',
                                color: 'white'
                              }
                            }}
                          />
                        ))
                      ) : (
                        <Typography color="text.secondary" variant="body2">
                          Chưa cập nhật kỹ năng
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>

                {/* Academic Performance Card */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp fontSize="small" />
                      Kết quả học tập
                    </Typography>
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(2, 1fr)', 
                      gap: 2 
                    }}>
                      <Box sx={{ 
                        p: 2, 
                        backgroundColor: 'primary.light', 
                        borderRadius: 1,
                        textAlign: 'center'
                      }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>
                          {profile?.gpa || '0.0'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'primary.contrastText' }}>
                          GPA
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        p: 2, 
                        backgroundColor: 'success.light', 
                        borderRadius: 1,
                        textAlign: 'center'
                      }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.contrastText' }}>
                          {profile?.graduationYear || '2024'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'success.contrastText' }}>
                          Năm tốt nghiệp
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Contact & Social Media Card */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Language fontSize="small" />
                      Liên hệ & Mạng xã hội
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {profile?.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            📱
                          </Avatar>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Điện thoại</Typography>
                            <Typography variant="body1">{profile.phone}</Typography>
                          </Box>
                        </Box>
                      )}
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                          📧
                        </Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Email</Typography>
                          <Typography variant="body1">{profile?.email}</Typography>
                        </Box>
                      </Box>

                      {profile?.portfolio && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                            🌐
                          </Avatar>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Portfolio</Typography>
                            <Typography 
                              variant="body1" 
                              component="a" 
                              href={profile.portfolio} 
                              target="_blank"
                              sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                            >
                              {profile.portfolio}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>

                {/* Summary Card */}
                {profile?.summary && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person fontSize="small" />
                        Giới thiệu bản thân
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {profile.summary}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Box>

              {/* Right Column - Detailed Information */}
              <Box sx={{ flex: 1 }}>
                {/* Education Card */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <School fontSize="small" />
                      Học vấn
                    </Typography>

                    {profile?.education && profile.education.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {profile.education.map((edu: any, index: number) => (
                          <Box key={index} sx={{ 
                            p: 3, 
                            border: '2px solid', 
                            borderColor: 'primary.light', 
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                            '&:hover': { 
                              borderColor: 'primary.main',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            },
                            transition: 'all 0.3s ease'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                                🎓
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {edu.degree}
                                </Typography>
                                <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                                  {edu.institution}
                                </Typography>
                              </Box>
                            </Box>
                            
                            {edu.major && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Code fontSize="small" color="primary" />
                                <Typography variant="body2" color="text.secondary">
                                  Chuyên ngành: <span style={{ fontWeight: 500 }}>{edu.major}</span>
                                </Typography>
                              </Box>
                            )}
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccessTime fontSize="small" color="action" />
                                <Typography variant="caption" color="text.secondary">
                                  {edu.startDate} - {edu.current ? 'Hiện tại' : edu.endDate}
                                </Typography>
                              </Box>
                              {edu.gpa && (
                                <Chip 
                                  label={`GPA: ${edu.gpa}`} 
                                  size="small" 
                                  color="primary" 
                                  variant="filled"
                                />
                              )}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Box sx={{ 
                        p: 3,
                        border: '2px dashed',
                        borderColor: 'primary.light',
                        borderRadius: 2,
                        backgroundColor: 'grey.50'
                      }}>
                        <Box sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
                          gap: 3
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                              🏫
                            </Avatar>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Trường đại học
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {profile?.university || 'Chưa cập nhật'}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
                              📚
                            </Avatar>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Chuyên ngành
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {profile?.major || 'Chưa cập nhật'}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
                              🎓
                            </Avatar>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Năm tốt nghiệp
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {profile?.graduationYear || 'Chưa cập nhật'}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40 }}>
                              📊
                            </Avatar>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                GPA
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {profile?.gpa || 'Chưa cập nhật'}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Experience Card */}
                {profile?.workExperience && profile.workExperience.length > 0 && (
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Work fontSize="small" />
                        Kinh nghiệm làm việc
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {profile.workExperience.map((exp: any, index: number) => (
                          <Box key={index} sx={{ 
                            p: 3, 
                            border: '2px solid', 
                            borderColor: 'success.light', 
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
                            '&:hover': { 
                              borderColor: 'success.main',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 20px rgba(76, 175, 80, 0.2)'
                            },
                            transition: 'all 0.3s ease'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
                                💼
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {exp.position}
                                </Typography>
                                <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                                  {exp.company}
                                </Typography>
                              </Box>
                              <Chip 
                                label={exp.current ? 'Hiện tại' : 'Đã hoàn thành'} 
                                size="small" 
                                color={exp.current ? 'primary' : 'default'}
                                variant="filled"
                              />
                            </Box>
                            
                            {exp.location && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <LocationOn fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  {exp.location}
                                </Typography>
                              </Box>
                            )}
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <AccessTime fontSize="small" color="action" />
                              <Typography variant="caption" color="text.secondary">
                                {exp.startDate} - {exp.current ? 'Hiện tại' : exp.endDate}
                              </Typography>
                            </Box>
                            
                            {exp.description && (
                              <Typography variant="body2" sx={{ 
                                mt: 2,
                                p: 2,
                                backgroundColor: 'rgba(255,255,255,0.7)',
                                borderRadius: 1,
                                border: '1px solid rgba(76, 175, 80, 0.2)'
                              }}>
                                {exp.description}
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {/* Projects Card */}
                {profile?.projects && profile.projects.length > 0 && (
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Build fontSize="small" />
                        Dự án
                      </Typography>
                      <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
                        gap: 3 
                      }}>
                        {profile.projects.map((project: any, index: number) => (
                          <Box key={index} sx={{ 
                            p: 3, 
                            border: '2px solid', 
                            borderColor: 'info.light', 
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #e3f2fd 0%, #f1f8e9 100%)',
                            '&:hover': { 
                              borderColor: 'info.main',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 20px rgba(33, 150, 243, 0.2)'
                            },
                            transition: 'all 0.3s ease',
                            height: 'fit-content'
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <Avatar sx={{ bgcolor: 'info.main', width: 40, height: 40 }}>
                                🚀
                              </Avatar>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
                                {project.name}
                              </Typography>
                            </Box>
                            
                            <Typography variant="body2" sx={{ 
                              mb: 2,
                              color: 'text.secondary',
                              lineHeight: 1.6
                            }}>
                              {project.description}
                            </Typography>
                            
                            {project.technologies && project.technologies.length > 0 && (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                {project.technologies.map((tech: string, techIndex: number) => (
                                  <Chip 
                                    key={techIndex} 
                                    label={tech} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ 
                                      borderColor: 'info.main',
                                      color: 'info.main',
                                      fontSize: '0.75rem'
                                    }}
                                  />
                                ))}
                              </Box>
                            )}
                            
                            <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                              {project.link && (
                                <Button 
                                  size="small" 
                                  variant="contained"
                                  color="info"
                                  href={project.link} 
                                  target="_blank"
                                  startIcon={<Language />}
                                  sx={{ flex: 1 }}
                                >
                                  Demo
                                </Button>
                              )}
                              {project.github && (
                                <Button 
                                  size="small" 
                                  variant="outlined"
                                  color="info"
                                  href={project.github} 
                                  target="_blank"
                                  startIcon={<GitHub />}
                                  sx={{ flex: 1 }}
                                >
                                  GitHub
                                </Button>
                              )}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {/* Languages & Certifications */}
                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                  {/* Languages */}
                  {profile?.languages && profile.languages.length > 0 && (
                    <Card sx={{ flex: 1 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Language fontSize="small" />
                          Ngôn ngữ
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {profile.languages.map((lang: any, index: number) => (
                            <Box key={index} sx={{ 
                              p: 2,
                              border: '1px solid',
                              borderColor: 'warning.light',
                              borderRadius: 1,
                              backgroundColor: 'warning.lighter',
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              '&:hover': {
                                borderColor: 'warning.main',
                                transform: 'translateX(4px)'
                              },
                              transition: 'all 0.3s ease'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ bgcolor: 'warning.main', width: 24, height: 24, fontSize: '0.75rem' }}>
                                  🌐
                                </Avatar>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {lang.name}
                                </Typography>
                              </Box>
                              <Chip 
                                label={lang.level} 
                                size="small" 
                                color="warning" 
                                variant="filled"
                              />
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  )}

                  {/* Certifications */}
                  {profile?.certifications && profile.certifications.length > 0 && (
                    <Card sx={{ flex: 1 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmojiEvents fontSize="small" />
                          Chứng chỉ
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {profile.certifications.map((cert: any, index: number) => (
                            <Box key={index} sx={{ 
                              p: 2,
                              border: '1px solid',
                              borderColor: 'success.light',
                              borderRadius: 1,
                              backgroundColor: 'success.lighter',
                              '&:hover': {
                                borderColor: 'success.main',
                                transform: 'translateX(4px)'
                              },
                              transition: 'all 0.3s ease'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Avatar sx={{ bgcolor: 'success.main', width: 24, height: 24, fontSize: '0.75rem' }}>
                                  🏆
                                </Avatar>
                                <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                                  {cert.name}
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                                {cert.issuer} • {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short' }) : 'N/A'}
                                {cert.credentialId && (
                                  <span> • ID: {cert.credentialId}</span>
                                )}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  )}
                </Box>

                {/* Statistics Cards */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, 
                  gap: 2,
                  mt: 3
                }}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {profile?.workExperience?.length || 0}
                      </Typography>
                      <Typography variant="body2">
                        Kinh nghiệm làm việc
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white'
                  }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {profile?.projects?.length || 0}
                      </Typography>
                      <Typography variant="body2">
                        Dự án đã thực hiện
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white'
                  }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {profile?.skills?.length || 0}
                      </Typography>
                      <Typography variant="body2">
                        Kỹ năng
                      </Typography>
                    </CardContent>
                  </Card>

                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    color: 'white'
                  }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {profile?.certifications?.length || 0}
                      </Typography>
                      <Typography variant="body2">
                        Chứng chỉ
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* Enhanced Job Details Dialog */}
        <JobDetailsDialog
          open={showJobDetails}
          job={selectedJob}
          onClose={() => {
            setShowJobDetails(false);
            setSelectedJob(null);
          }}
          onApply={(job) => {
            setShowJobDetails(false);
            handleApplyJob(job);
          }}
          onSave={handleSaveJob}
          onShare={(job) => {
            // Handle sharing job
            if (navigator.share) {
              navigator.share({
                title: job.title,
                text: `Check out this job opportunity at ${job.company?.companyName}`,
                url: window.location.href + `?job=${job.id}`
              });
            } else {
              // Fallback to copy to clipboard
              navigator.clipboard.writeText(
                `${job.title} at ${job.company?.companyName}\n${window.location.href}?job=${job.id}`
              );
              alert('Job link copied to clipboard!');
            }
          }}
        />

        {/* Enhanced Application Dialog */}
        <ApplicationDialog
          open={showApplicationDialog}
          job={selectedJob}
          onClose={() => {
            console.log('🚪 Closing application dialog');
            setShowApplicationDialog(false);
            setSelectedJob(null);
            setCoverLetter('');
          }}
          onSubmit={async (coverLetter: string, additionalFiles?: File[]) => {
            console.log('📝 Submitting application with cover letter:', coverLetter);
            console.log('📎 Additional files:', additionalFiles);
            
            if (!selectedJob) {
              console.error('❌ No job selected');
              return;
            }

            try {
              setIsSubmittingApplication(true);
              
              const applicationData = {
                jobId: selectedJob.id,
                coverLetter: coverLetter
              };

              console.log('🚀 Submitting application with data:', applicationData);
              const response = await applicationsAPI.create(applicationData);
              console.log('✅ Application response:', response);

              // Update job application status
              setJobs(prevJobs => 
                prevJobs.map(job => 
                  job.id === selectedJob.id 
                    ? { ...job, hasApplied: true }
                    : job
                )
              );

              // Refresh applications
              await loadDashboardData();

              // Close dialog and reset state
              setShowApplicationDialog(false);
              setSelectedJob(null);
              setCoverLetter('');

              alert('Ứng tuyển thành công! Bạn có thể theo dõi trạng thái ứng tuyển trong tab "Ứng tuyển của tôi".');
              
            } catch (error: any) {
              console.error('❌ Error submitting application:', error);
              
              // Handle specific error types with detailed messages
              if (error.response?.status === 409) {
                alert('❌ Bạn đã ứng tuyển vào công việc này rồi! Không thể ứng tuyển lại. Bạn có thể kiểm tra trạng thái ứng tuyển trong tab "Ứng tuyển của tôi".');
              } else if (error.response?.status === 401) {
                alert('❌ Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.reload();
              } else if (error.response?.status === 400) {
                const errorMessage = error.response?.data?.message || 'Dữ liệu ứng tuyển không hợp lệ';
                alert(`❌ ${errorMessage}`);
              } else if (error.response?.data?.message) {
                alert(`❌ Lỗi khi ứng tuyển: ${error.response.data.message}`);
              } else {
                alert('❌ Có lỗi xảy ra khi ứng tuyển. Vui lòng thử lại.');
              }
            } finally {
              setIsSubmittingApplication(false);
            }
          }}
          isSubmitting={isSubmittingApplication}
        />

        {/* Profile Edit Dialog */}
        <Dialog
          open={showProfileDialog}
          onClose={() => setShowProfileDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">
                Chỉnh sửa hồ sơ cá nhân
              </Typography>
              <IconButton onClick={() => setShowProfileDialog(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Để chỉnh sửa hồ sơ chi tiết, vui lòng truy cập trang Hồ sơ cá nhân.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                setShowProfileDialog(false);
                window.location.href = '/student-profile';
              }}
            >
              Đi tới trang Hồ sơ cá nhân
            </Button>
          </DialogContent>
        </Dialog>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            if (selectedJob) {
              handleJobClick(selectedJob);
              setAnchorEl(null); // Only close menu, don't reset selectedJob
            }
          }}>
            Xem chi tiết
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedJob) {
              handleApplyJob(selectedJob);
              setAnchorEl(null); // Close menu when applying
            }
          }}>
            Ứng tuyển
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedJob) {
              handleSaveJob(selectedJob.id);
              setAnchorEl(null); // Close menu after saving
            }
          }}>
            Lưu việc làm
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            Chia sẻ
          </MenuItem>
        </Menu>
      </Container>
    </Box>
  );
}

// Export interface for isolatedModules compliance
export interface StudentDashboardProps {}

export { StudentDashboard };
export default StudentDashboard;
