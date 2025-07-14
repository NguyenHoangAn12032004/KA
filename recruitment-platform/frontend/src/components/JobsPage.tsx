import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  Paper,
  IconButton,
  Pagination,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
  Avatar
} from '@mui/material';
import {
  Search,
  LocationOn,
  Work,
  Business,
  Schedule,
  AttachMoney,
  BookmarkBorder,
  Bookmark,
  FilterList,
  Close,
  Send,
  Star,
  TrendingUp,
  Edit,
  Delete,
  Save,
  Cancel
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { jobsAPI } from '../services/api';

interface Job {
  id: string;
  title: string;
  company: {
    id: string;
    companyName: string;
    logoUrl?: string;
    industry?: string;
  };
  location: string;
  salary?: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
  level: 'ENTRY' | 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'LEAD';
  description: string;
  requirements: string[];
  benefits: string[];
  skills: string[];
  createdAt: string;
  deadline?: string;
  isBookmarked?: boolean;
  isHot?: boolean;
  applicantsCount?: number;
}

const JobsPage: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  // Load jobs from API
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const response = await jobsAPI.getAll();
        
        // Convert API response to expected format
        const formattedJobs = response.data.jobs.map((job: any) => ({
          id: job.id,
          title: job.title,
          company: {
            id: job.company?.id || job.companyId,
            companyName: job.company?.companyName || 'Unknown Company',
            industry: job.company?.industry || 'Technology',
            logoUrl: job.company?.logo || ''
          },
          location: job.location || 'Chưa xác định',
          salary: job.salaryMin && job.salaryMax 
            ? `${job.salaryMin/1000000}-${job.salaryMax/1000000} triệu`
            : 'Thỏa thuận',
          type: job.jobType || 'FULL_TIME',
          level: job.experienceLevel || 'ENTRY',
          description: job.description || '',
          requirements: job.requirements || [],
          benefits: job.benefits || [],
          skills: job.requirements || [], // Use requirements as skills for display
          postedDate: job.publishedAt ? new Date(job.publishedAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
          deadline: job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString('vi-VN') : null,
          views: job.viewCount || 0,
          applicants: job._aggr_count_applications || 0
        }));
        
        setJobs(formattedJobs);
        
      } catch (error) {
        console.error('Error loading jobs:', error);
        // Fallback to mock data
        setJobs([
        {
          id: '1',
          title: 'Frontend Developer Intern',
          company: {
            id: 'techcorp',
            companyName: 'TechCorp Vietnam',
            industry: 'Technology',
            logoUrl: ''
          },
          location: 'Ho Chi Minh City',
          salary: '8-12 triệu',
          type: 'INTERNSHIP',
          level: 'ENTRY',
          description: 'Chúng tôi đang tìm kiếm một Frontend Developer Intern có đam mê với công nghệ web hiện đại. Bạn sẽ được làm việc với team experienced developers và học hỏi các best practices trong việc phát triển ứng dụng web.',
          requirements: [
            'Kiến thức cơ bản về HTML, CSS, JavaScript',
            'Có hiểu biết về React.js hoặc Vue.js',
            'Khả năng làm việc nhóm tốt',
            'Đam mê học hỏi công nghệ mới'
          ],
          benefits: [
            'Lương thực tập cạnh tranh',
            'Môi trường làm việc trẻ trung, năng động',
            'Được mentor 1:1 từ senior developers',
            'Cơ hội được full-time sau thực tập'
          ],
          skills: ['React.js', 'TypeScript', 'HTML/CSS', 'Git'],
          createdAt: '2025-07-10',
          deadline: '2025-08-10',
          isBookmarked: false,
          isHot: true,
          applicantsCount: 15
        },
        {
          id: '2',
          title: 'UI/UX Designer',
          company: {
            id: 'designstudio',
            companyName: 'Creative Design Studio',
            industry: 'Design',
            logoUrl: ''
          },
          location: 'Ha Noi',
          salary: '15-20 triệu',
          type: 'FULL_TIME',
          level: 'JUNIOR',
          description: 'Tham gia thiết kế giao diện người dùng cho các ứng dụng mobile và web. Làm việc trực tiếp với product team để tạo ra những trải nghiệm người dùng tuyệt vời.',
          requirements: [
            'Tốt nghiệp chuyên ngành Design, IT hoặc tương đương',
            'Thành thạo Figma, Adobe XD, Sketch',
            'Có portfolio design ấn tượng',
            'Kỹ năng giao tiếp và thuyết trình tốt'
          ],
          benefits: [
            'Lương cơ bản + bonus performance',
            'Bảo hiểm sức khỏe toàn diện',
            'Team building hàng quý',
            'Cơ hội thăng tiến rõ ràng'
          ],
          skills: ['Figma', 'Adobe XD', 'Sketch', 'User Research', 'Prototyping'],
          createdAt: '2025-07-09',
          deadline: '2025-07-25',
          isBookmarked: true,
          isHot: false,
          applicantsCount: 8
        },
        {
          id: '3',
          title: 'Data Analyst Intern',
          company: {
            id: 'analyticspro',
            companyName: 'Analytics Pro',
            industry: 'Data & Analytics',
            logoUrl: ''
          },
          location: 'Da Nang',
          salary: '6-10 triệu',
          type: 'INTERNSHIP',
          level: 'ENTRY',
          description: 'Phân tích dữ liệu và tạo báo cáo cho các dự án kinh doanh. Học hỏi cách sử dụng các công cụ analytics hiện đại và machine learning cơ bản.',
          requirements: [
            'Kiến thức cơ bản về thống kê',
            'Biết sử dụng Python hoặc R',
            'Có kinh nghiệm với SQL',
            'Tư duy logic và phân tích tốt'
          ],
          benefits: [
            'Môi trường học hỏi chuyên sâu',
            'Tiếp cận dữ liệu thực tế của doanh nghiệp',
            'Mentoring từ senior data scientists',
            'Certificate sau khi hoàn thành'
          ],
          skills: ['Python', 'SQL', 'Excel', 'Power BI', 'Statistics'],
          createdAt: '2025-07-08',
          deadline: '2025-08-01',
          isBookmarked: false,
          isHot: false,
          applicantsCount: 12
        },
        {
          id: '4',
          title: 'Backend Developer',
          company: {
            id: 'startupx',
            companyName: 'StartupX',
            industry: 'Fintech',
            logoUrl: ''
          },
          location: 'Ho Chi Minh City',
          salary: '20-30 triệu',
          type: 'FULL_TIME',
          level: 'MIDDLE',
          description: 'Phát triển và maintain các API services cho ứng dụng fintech. Làm việc với microservices architecture và cloud technologies.',
          requirements: [
            '2+ năm kinh nghiệm backend development',
            'Thành thạo Node.js hoặc Python',
            'Kinh nghiệm với database (PostgreSQL, MongoDB)',
            'Hiểu biết về microservices và cloud (AWS/GCP)'
          ],
          benefits: [
            'Lương cạnh tranh + equity',
            'Flexible working hours',
            'Latest MacBook Pro',
            'Health insurance cho gia đình'
          ],
          skills: ['Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Microservices'],
          createdAt: '2025-07-07',
          deadline: '2025-07-30',
          isBookmarked: false,
          isHot: true,
          applicantsCount: 25
        },
        {
          id: '5',
          title: 'Digital Marketing Intern',
          company: {
            id: 'marketingagency',
            companyName: 'Digital Marketing Agency',
            industry: 'Marketing',
            logoUrl: ''
          },
          location: 'Ho Chi Minh City',
          salary: '5-8 triệu',
          type: 'INTERNSHIP',
          level: 'ENTRY',
          description: 'Hỗ trợ team marketing trong việc lập kế hoạch và thực hiện các campaign digital marketing. Học hỏi về SEO, SEM, social media marketing.',
          requirements: [
            'Đam mê digital marketing',
            'Kỹ năng viết content tốt',
            'Biết sử dụng các social media platforms',
            'Có khả năng phân tích số liệu cơ bản'
          ],
          benefits: [
            'Được training chuyên sâu về digital marketing',
            'Thực hành trên các project thực tế',
            'Certificate Google Ads & Analytics',
            'Networking với industry experts'
          ],
          skills: ['Content Writing', 'Social Media', 'Google Analytics', 'Facebook Ads'],
          createdAt: '2025-07-06',
          deadline: '2025-07-28',
          isBookmarked: false,
          isHot: false,
          applicantsCount: 18
        }
      ]);
      } finally {
        setLoading(false);
      }
    };
    
    loadJobs();
  }, []);

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case 'FULL_TIME': return 'Toàn thời gian';
      case 'PART_TIME': return 'Bán thời gian';
      case 'INTERNSHIP': return 'Thực tập';
      case 'CONTRACT': return 'Hợp đồng';
      default: return type;
    }
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'FULL_TIME': return 'success';
      case 'PART_TIME': return 'warning';
      case 'INTERNSHIP': return 'info';
      case 'CONTRACT': return 'secondary';
      default: return 'default';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'ENTRY': return 'Mới ra trường';
      case 'JUNIOR': return 'Junior';
      case 'MIDDLE': return 'Middle';
      case 'SENIOR': return 'Senior';
      case 'LEAD': return 'Lead';
      default: return level;
    }
  };

  const handleBookmarkToggle = (jobId: string) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
    
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, isBookmarked: !job.isBookmarked }
        : job
    ));
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setDetailDialogOpen(true);
  };

  // Job management handlers
  const handleEditJob = (job: Job) => {
    console.log('Edit job clicked:', job);
    setEditingJob(job);
    setEditDialogOpen(true);
  };

  const handleDeleteJob = (job: Job) => {
    console.log('Delete job clicked:', job);
    setJobToDelete(job);
    setDeleteDialogOpen(true);
  };

  const handleSaveJobEdit = async () => {
    if (!editingJob) return;

    try {
      await jobsAPI.update(editingJob.id, {
        title: editingJob.title,
        description: editingJob.description,
        location: editingJob.location,
        jobType: editingJob.type,
        experienceLevel: editingJob.level,
        salaryMin: editingJob.salary ? parseInt(editingJob.salary.split('-')[0]) * 1000000 : 0,
        salaryMax: editingJob.salary ? parseInt(editingJob.salary.split('-')[1]) * 1000000 : 0,
        requirements: editingJob.requirements
      });

      // Reload jobs
      const response = await jobsAPI.getAll();
      const formattedJobs = response.data.jobs.map((job: any) => ({
        id: job.id,
        title: job.title,
        company: {
          id: job.company?.id || job.companyId,
          companyName: job.company?.companyName || 'Unknown Company',
          industry: job.company?.industry || 'Technology',
          logoUrl: job.company?.logo || ''
        },
        location: job.location || 'Vietnam',
        type: job.jobType || 'FULL_TIME',
        experience: job.experienceLevel || 'Mid',
        salary: job.salaryMin && job.salaryMax 
          ? `${job.salaryMin/1000000}-${job.salaryMax/1000000}`
          : 'Thỏa thuận',
        description: job.description || 'No description available',
        requirements: job.requirements || [],
        postedDate: job.publishedAt ? new Date(job.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        deadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : null,
        isActive: job.isActive
      }));
      setJobs(formattedJobs);
      
      setEditDialogOpen(false);
      setEditingJob(null);
    } catch (error) {
      console.error('Error updating job:', error);
    }
  };

  const handleConfirmDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      await jobsAPI.delete(jobToDelete.id);
      
      // Remove from local state
      setJobs(jobs.filter(j => j.id !== jobToDelete.id));
      
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === '' || job.location.includes(locationFilter);
    const matchesType = typeFilter === '' || job.type === typeFilter;
    const matchesLevel = levelFilter === '' || job.level === levelFilter;
    
    return matchesSearch && matchesLocation && matchesType && matchesLevel;
  });

  const jobsPerPage = 6;
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const paginatedJobs = filteredJobs.slice((page - 1) * jobsPerPage, page * jobsPerPage);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="rectangular" width="100%" height={60} sx={{ mt: 2 }} />
        </Box>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
          gap: 3 
        }}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Box key={item}>
              <Skeleton variant="rectangular" height={200} />
            </Box>
          ))}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Tìm kiếm việc làm
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Khám phá {jobs.length} cơ hội việc làm phù hợp với bạn
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: '2fr 1fr 1fr 1fr 1fr' 
          }, 
          gap: 2,
          alignItems: 'center'
        }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm công việc, công ty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <FormControl fullWidth>
            <InputLabel>Địa điểm</InputLabel>
            <Select
              value={locationFilter}
              label="Địa điểm"
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="Ho Chi Minh">TP.HCM</MenuItem>
              <MenuItem value="Ha Noi">Hà Nội</MenuItem>
              <MenuItem value="Da Nang">Đà Nẵng</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Loại việc</InputLabel>
            <Select
              value={typeFilter}
              label="Loại việc"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="FULL_TIME">Toàn thời gian</MenuItem>
              <MenuItem value="PART_TIME">Bán thời gian</MenuItem>
              <MenuItem value="INTERNSHIP">Thực tập</MenuItem>
              <MenuItem value="CONTRACT">Hợp đồng</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Cấp độ</InputLabel>
            <Select
              value={levelFilter}
              label="Cấp độ"
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="ENTRY">Mới ra trường</MenuItem>
              <MenuItem value="JUNIOR">Junior</MenuItem>
              <MenuItem value="MIDDLE">Middle</MenuItem>
              <MenuItem value="SENIOR">Senior</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            fullWidth
            sx={{ height: 56 }}
          >
            Lọc nâng cao
          </Button>
        </Box>
      </Paper>

      {/* Results Summary */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body1">
          Hiển thị {paginatedJobs.length} trong tổng {filteredJobs.length} công việc
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip label="Mới nhất" variant="outlined" size="small" />
          <Chip label="Hot jobs" variant="outlined" size="small" />
          <Chip label="Phù hợp nhất" variant="outlined" size="small" />
        </Box>
      </Box>

      {/* Job List */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
        gap: 3 
      }}>
        {paginatedJobs.map((job) => (
          <Card 
            key={job.id}
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => handleJobClick(job)}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                {/* Job Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                        {job.title}
                      </Typography>
                      {job.isHot && (
                        <Chip label="HOT" color="error" size="small" icon={<TrendingUp />} />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Business sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {job.company.companyName}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmarkToggle(job.id);
                    }}
                    sx={{ color: job.isBookmarked ? 'warning.main' : 'text.secondary' }}
                  >
                    {job.isBookmarked ? <Bookmark /> : <BookmarkBorder />}
                  </IconButton>
                </Box>

                {/* Job Details */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {job.location}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AttachMoney sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold' }}>
                      {job.salary || 'Thỏa thuận'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={getJobTypeLabel(job.type)}
                      color={getJobTypeColor(job.type) as any}
                      size="small"
                    />
                    <Chip
                      label={getLevelLabel(job.level)}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Box>

                {/* Description */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {job.description ? job.description.substring(0, 120) + '...' : 'Mô tả công việc sẽ được cập nhật...'}
                </Typography>

                {/* Skills */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {(job.skills || []).slice(0, 4).map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  ))}
                  {(job.skills || []).length > 4 && (
                    <Chip
                      label={`+${(job.skills || []).length - 4}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  )}
                </Box>

                {/* Footer */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                  <Typography variant="caption" color="text.secondary">
                    {job.applicantsCount} người đã ứng tuyển
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                  </Typography>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditJob(job);
                    }}
                    variant="outlined"
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Delete />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteJob(job);
                    }}
                    variant="outlined"
                    color="error"
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
        ))}
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Job Detail Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedJob && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {selectedJob.title}
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    {selectedJob.company.companyName}
                  </Typography>
                </Box>
                <IconButton onClick={() => setDetailDialogOpen(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              {/* Job Info */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: 2,
                mb: 3 
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography>{selectedJob.location}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography color="primary.main" fontWeight="bold">
                    {selectedJob.salary || 'Thỏa thuận'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Work sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography>{getJobTypeLabel(selectedJob.type)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Star sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography>{getLevelLabel(selectedJob.level)}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Description */}
              <Typography variant="h6" gutterBottom>Mô tả công việc</Typography>
              <Typography variant="body1" paragraph>
                {selectedJob.description}
              </Typography>

              {/* Requirements */}
              <Typography variant="h6" gutterBottom>Yêu cầu</Typography>
              <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                {selectedJob.requirements.map((req, index) => (
                  <Typography component="li" key={index} paragraph>
                    {req}
                  </Typography>
                ))}
              </Box>

              {/* Benefits */}
              <Typography variant="h6" gutterBottom>Quyền lợi</Typography>
              <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                {selectedJob.benefits.map((benefit, index) => (
                  <Typography component="li" key={index} paragraph>
                    {benefit}
                  </Typography>
                ))}
              </Box>

              {/* Skills */}
              <Typography variant="h6" gutterBottom>Kỹ năng yêu cầu</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {(selectedJob.skills || []).map((skill, index) => (
                  <Chip key={index} label={skill} variant="outlined" />
                ))}
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
              <Button
                onClick={() => handleBookmarkToggle(selectedJob.id)}
                startIcon={selectedJob.isBookmarked ? <Bookmark /> : <BookmarkBorder />}
                color={selectedJob.isBookmarked ? 'warning' : 'inherit'}
              >
                {selectedJob.isBookmarked ? 'Đã lưu' : 'Lưu tin'}
              </Button>
              <Button
                variant="contained"
                startIcon={<Send />}
                size="large"
                disabled={!user || user.role !== 'STUDENT'}
              >
                Ứng tuyển ngay
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Job Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="h2" gutterBottom>
            Chỉnh sửa công việc
          </Typography>
        </DialogTitle>
        <DialogContent>
          {editingJob && (
            <Box component="form" noValidate autoComplete="off">
              <TextField
                label="Tiêu đề"
                variant="outlined"
                fullWidth
                value={editingJob.title}
                onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Địa điểm"
                variant="outlined"
                fullWidth
                value={editingJob.location}
                onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Mức lương (triệu VNĐ)"
                variant="outlined"
                fullWidth
                value={editingJob.salary}
                onChange={(e) => setEditingJob({ ...editingJob, salary: e.target.value })}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Loại việc</InputLabel>
                <Select
                  value={editingJob.type}
                  label="Loại việc"
                  onChange={(e) => setEditingJob({ ...editingJob, type: e.target.value })}
                >
                  <MenuItem value="FULL_TIME">Toàn thời gian</MenuItem>
                  <MenuItem value="PART_TIME">Bán thời gian</MenuItem>
                  <MenuItem value="INTERNSHIP">Thực tập</MenuItem>
                  <MenuItem value="CONTRACT">Hợp đồng</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Cấp độ</InputLabel>
                <Select
                  value={editingJob.level}
                  label="Cấp độ"
                  onChange={(e) => setEditingJob({ ...editingJob, level: e.target.value })}
                >
                  <MenuItem value="ENTRY">Mới ra trường</MenuItem>
                  <MenuItem value="JUNIOR">Junior</MenuItem>
                  <MenuItem value="MIDDLE">Middle</MenuItem>
                  <MenuItem value="SENIOR">Senior</MenuItem>
                  <MenuItem value="LEAD">Lead</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Mô tả công việc"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={editingJob.description}
                onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Yêu cầu công việc"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={editingJob.requirements.join('\n')}
                onChange={(e) => setEditingJob({ ...editingJob, requirements: e.target.value.split('\n') })}
                sx={{ mb: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)} color="inherit">
            Hủy
          </Button>
          <Button onClick={handleSaveJobEdit} variant="contained" color="primary">
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Job Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Xác nhận xóa công việc</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Bạn có chắc chắn muốn xóa công việc này?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Hủy
          </Button>
          <Button onClick={handleConfirmDeleteJob} variant="contained" color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default JobsPage;
