import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Tabs,
  Tab,
  Paper,
  LinearProgress,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Rating,
  Stack,
  Fab,
  Zoom,
  Collapse,
  Link as MuiLink
} from '@mui/material';
import {
  Close,
  LocationOn,
  Business,
  Schedule,
  AttachMoney,
  Work,
  School,
  Language,
  AccessTime,
  People,
  TrendingUp,
  Star,
  Share,
  Bookmark,
  BookmarkBorder,
  Send,
  ExpandMore,
  CheckCircle,
  Info,
  WorkHistory,
  EmojiEvents,
  Code,
  Build,
  Group,
  Public,
  CalendarToday,
  Email,
  Phone,
  LinkedIn,
  GitHub,
  Launch,
  Favorite,
  FavoriteBorder,
  Download,
  Print
} from '@mui/icons-material';

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
  } | string;
  companyLogo?: string;
  location: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT' | string;
  workMode?: 'ONSITE' | 'REMOTE' | 'HYBRID' | string;
  experienceLevel?: 'ENTRY' | 'JUNIOR' | 'INTERMEDIATE' | 'SENIOR' | string;
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
  applicationCount?: number;
  isSaved?: boolean;
  hasApplied?: boolean;
  viewsCount?: number;
  viewCount?: number;
  department?: string;
  reportingTo?: string;
  createdAt?: string;
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

interface JobDetailsDialogProps {
  open: boolean;
  job: Job | null;
  onClose: () => void;
  onApply: (job: any) => void;
  onSave?: (jobId: string) => void;
  onShare?: (job: Job) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`job-tabpanel-${index}`}
      aria-labelledby={`job-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `job-tab-${index}`,
    'aria-controls': `job-tabpanel-${index}`,
  };
}

const JobDetailsDialog: React.FC<JobDetailsDialogProps> = ({
  open,
  job,
  onClose,
  onApply,
  onSave,
  onShare
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    if (job) {
      setIsSaved(job.isSaved || false);
    }
  }, [job]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSave = () => {
    if (job && onSave) {
      onSave(job.id);
      setIsSaved(!isSaved);
    }
  };

  const handleShare = () => {
    if (job && onShare) {
      onShare(job);
    }
  };

  const formatSalary = (job: Job) => {
    if (job.salaryMin && job.salaryMax) {
      const currency = job.currency || 'VND';
      const min = job.salaryMin.toLocaleString();
      const max = job.salaryMax.toLocaleString();
      return `${min} - ${max} ${currency}`;
    }
    return job.salary || 'Salary negotiable';
  };

  const getJobTypeLabel = (type: string) => {
    const typeLabels = {
      'FULL_TIME': 'Full-time',
      'PART_TIME': 'Part-time',
      'INTERNSHIP': 'Internship',
      'CONTRACT': 'Contract'
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const getWorkModeLabel = (mode: string) => {
    const modeLabels = {
      'ONSITE': 'On-site',
      'REMOTE': 'Remote',
      'HYBRID': 'Hybrid'
    };
    return modeLabels[mode as keyof typeof modeLabels] || mode;
  };

  const getExperienceLabel = (level: string) => {
    const levelLabels = {
      'ENTRY': 'Entry Level',
      'JUNIOR': 'Junior Level',
      'INTERMEDIATE': 'Mid Level',
      'SENIOR': 'Senior Level'
    };
    return levelLabels[level as keyof typeof levelLabels] || level;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  if (!job) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          maxHeight: '90vh',
          m: 2,
          borderRadius: 2,
          boxShadow: '0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12), 0 11px 15px -7px rgba(0,0,0,0.2)'
        }
      }}
    >
      <DialogTitle sx={{ 
        p: 0, 
        position: 'relative',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <Avatar
                src={typeof job.company === 'object' ? job.company?.logoUrl : job.companyLogo || job.company_profiles?.logo}
                sx={{ 
                  width: 80, 
                  height: 80, 
                  mr: 3,
                  border: '3px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
              >
                {typeof job.company === 'object' ? job.company?.companyName?.[0] : 
                 typeof job.company === 'string' ? job.company?.[0] : 
                 job.company_profiles?.companyName?.[0] || 'C'}
              </Avatar>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.2 }}>
                  {job.title}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                  {typeof job.company === 'object' ? job.company?.companyName : 
                   typeof job.company === 'string' ? job.company : 
                   job.company_profiles?.companyName || 'Company'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOn sx={{ fontSize: 18 }} />
                    <Typography variant="body2">{job.location}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTime sx={{ fontSize: 18 }} />
                    <Typography variant="body2">
                      {job.publishedAt ? getTimeAgo(job.publishedAt) : 'Recently posted'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <People sx={{ fontSize: 18 }} />
                    <Typography variant="body2">
                      {job.applicationsCount || 0} applicants
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TrendingUp sx={{ fontSize: 18 }} />
                    <Typography variant="body2">
                      {job.viewCount || job.viewsCount || 0} views
                    </Typography>
                  </Box>
                  {typeof job.company === 'object' && job.company?.rating && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Rating
                        value={typeof job.company === 'object' ? job.company.rating : 0}
                        readOnly
                        size="small"
                        sx={{
                          "& .MuiRating-iconFilled": {
                            color: "warning.main",
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        {typeof job.company === 'object' ? job.company.rating : 0}/5
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
              <Tooltip title={isSaved ? "Remove from saved" : "Save job"}>
                <IconButton
                  onClick={handleSave}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)', 
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  {isSaved ? <Bookmark /> : <BookmarkBorder />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Share job">
                <IconButton
                  onClick={handleShare}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)', 
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  <Share />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Close">
                <IconButton
                  onClick={onClose}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)', 
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  <Close />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Job Tags */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={getJobTypeLabel(job.type)} 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 600
              }} 
            />
            <Chip 
              label={getWorkModeLabel(job.workMode || 'ONSITE')} 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 600
              }} 
            />
            <Chip 
              label={getExperienceLabel(job.experienceLevel || 'ENTRY')} 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 600
              }} 
            />
            <Chip 
              label={formatSalary(job)} 
              icon={<AttachMoney sx={{ color: 'white !important' }} />}
              sx={{ 
                bgcolor: 'rgba(76, 175, 80, 0.3)', 
                color: 'white',
                fontWeight: 600
              }} 
            />
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: 3 }}
          >
            <Tab label="Job Details" icon={<Work />} iconPosition="start" {...a11yProps(0)} />
            <Tab label="Company" icon={<Business />} iconPosition="start" {...a11yProps(1)} />
            <Tab label="Requirements" icon={<CheckCircle />} iconPosition="start" {...a11yProps(2)} />
            <Tab label="Benefits" icon={<EmojiEvents />} iconPosition="start" {...a11yProps(3)} />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          <TabPanel value={activeTab} index={0}>
            {/* Job Description */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                Job Description
              </Typography>
              <Card variant="outlined" sx={{ p: 3, bgcolor: 'grey.50' }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    lineHeight: 1.7,
                    fontSize: '1rem'
                  }}
                >
                  {job.description || 'Job description will be updated soon...'}
                </Typography>
              </Card>
            </Box>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Key Responsibilities
                </Typography>
                <List sx={{ bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                  {job.responsibilities.map((responsibility, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ py: 2 }}>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={responsibility}
                          sx={{ 
                            '& .MuiListItemText-primary': { 
                              fontSize: '1rem',
                              lineHeight: 1.6
                            }
                          }}
                        />
                      </ListItem>
                      {index < (job.responsibilities?.length || 0) - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}

            {/* Job Details Grid */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                Job Information
              </Typography>
              <Box 
                sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
                  gap: 3 
                }}
              >
                <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Business color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Department
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={600}>
                    {job.department || 'Engineering'}
                  </Typography>
                </Card>
                
                <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarToday color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Application Deadline
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={600}>
                    {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : 'Open until filled'}
                  </Typography>
                </Card>

                <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUp color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Job Views
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={600}>
                    {job.viewCount || job.viewsCount || 0} views
                  </Typography>
                </Card>

                <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Group color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Reporting To
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={600}>
                    {job.reportingTo || 'Team Lead'}
                  </Typography>
                </Card>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            {/* Company Information */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  src={job.company_profiles?.logo}
                  sx={{ width: 80, height: 80, mr: 3 }}
                >
                  {job.company_profiles?.companyName?.charAt(0) || 'C'}
                </Avatar>
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    {job.company_profiles?.companyName || 'Company'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {job.company_profiles?.industry || 'Technology'}
                    </Typography>
                    <Chip 
                      label={job.company_profiles?.companySize || '50-100'} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                  {job.company_profiles?.website && (
                    <MuiLink 
                      href={job.company_profiles.website} 
                      target="_blank" 
                      rel="noopener"
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}
                    >
                      <Language fontSize="small" />
                      Truy cập website
                      <Launch fontSize="small" />
                    </MuiLink>
                  )}
                </Box>
              </Box>

              <Box 
                sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, 
                  gap: 3 
                }}
              >
                <Card variant="outlined" sx={{ p: 2, height: '100%', textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Quy mô công ty
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {job.company_profiles?.companySize || '100-500'} nhân viên
                  </Typography>
                </Card>
                
                <Card variant="outlined" sx={{ p: 2, height: '100%', textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Ngành nghề
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {job.company_profiles?.industry || 'Công nghệ'}
                  </Typography>
                </Card>

                <Card variant="outlined" sx={{ p: 2, height: '100%', textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Địa điểm
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {job.company_profiles?.city || job.location}
                  </Typography>
                </Card>

                <Card variant="outlined" sx={{ p: 2, height: '100%', textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Website
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ wordBreak: 'break-all' }}>
                    {job.company_profiles?.website ? (
                      <MuiLink href={job.company_profiles.website} target="_blank" rel="noopener">
                        {job.company_profiles.website.replace('https://', '')}
                      </MuiLink>
                    ) : 'Đang cập nhật'}
                  </Typography>
                </Card>
              </Box>

              {job.company_profiles?.description && (
                <Card variant="outlined" sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Giới thiệu về công ty
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                    {job.company_profiles.description}
                  </Typography>
                </Card>
              )}

              {/* Additional Company Information */}
              <Card variant="outlined" sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Thông tin bổ sung
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Business color="primary" />
                    <Typography variant="body2">
                      <strong>Tên công ty:</strong> {job.company_profiles?.companyName || 'Đang cập nhật'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn color="primary" />
                    <Typography variant="body2">
                      <strong>Thành phố:</strong> {job.company_profiles?.city || 'Đang cập nhật'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Work color="primary" />
                    <Typography variant="body2">
                      <strong>Lĩnh vực:</strong> {job.company_profiles?.industry || 'Công nghệ'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <People color="primary" />
                    <Typography variant="body2">
                      <strong>Số lượng nhân viên:</strong> {job.company_profiles?.companySize || '50-100'}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            {/* Requirements */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                Job Requirements
              </Typography>
              {job.requirements && job.requirements.length > 0 ? (
                <List sx={{ bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                  {job.requirements.map((requirement, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ py: 2 }}>
                        <ListItemIcon>
                          <CheckCircle color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={requirement}
                          sx={{ 
                            '& .MuiListItemText-primary': { 
                              fontSize: '1rem',
                              lineHeight: 1.6
                            }
                          }}
                        />
                      </ListItem>
                      {index < (job.requirements?.length || 0) - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Alert severity="info">
                  Job requirements will be updated soon.
                </Alert>
              )}
            </Box>

            {/* Qualifications */}
            {job.qualifications && job.qualifications.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Required Qualifications
                </Typography>
                <List sx={{ bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                  {job.qualifications.map((qualification, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ py: 2 }}>
                        <ListItemIcon>
                          <School color="secondary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={qualification}
                          sx={{ 
                            '& .MuiListItemText-primary': { 
                              fontSize: '1rem',
                              lineHeight: 1.6
                            }
                          }}
                        />
                      </ListItem>
                      {index < (job.qualifications?.length || 0) - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Required Skills
                </Typography>
                <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {job.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        color="primary"
                        variant="outlined"
                        icon={<Code />}
                        sx={{ fontWeight: 600 }}
                      />
                    ))}
                  </Box>
                </Paper>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            {/* Benefits */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                Benefits & Perks
              </Typography>
              {job.benefits && job.benefits.length > 0 ? (
                <List sx={{ bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                  {job.benefits.map((benefit, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ py: 2 }}>
                        <ListItemIcon>
                          <EmojiEvents color="warning" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={benefit}
                          sx={{ 
                            '& .MuiListItemText-primary': { 
                              fontSize: '1rem',
                              lineHeight: 1.6,
                              fontWeight: 500
                            }
                          }}
                        />
                      </ListItem>
                      {index < (job.benefits?.length || 0) - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Alert severity="info">
                  Benefits information will be updated soon.
                </Alert>
              )}
            </Box>

            {/* Salary Information */}
            <Card 
              variant="outlined" 
              sx={{ 
                p: 3, 
                bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Salary Package
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {formatSalary(job)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Competitive salary package with additional benefits
              </Typography>
            </Card>
          </TabPanel>
        </Box>
      </DialogContent>

      <DialogActions 
        sx={{ 
          p: 3, 
          bgcolor: 'grey.50',
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => {
              // Generate and download job description PDF
              console.log('Download job description');
            }}
          >
            Download
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={() => window.print()}
          >
            Print
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            onClick={onClose}
            variant="outlined"
            size="large"
          >
            Close
          </Button>
          {user && user.role === 'STUDENT' && (
            <Button
              variant="contained"
              onClick={() => onApply(job)}
              disabled={job.hasApplied}
              startIcon={job.hasApplied ? <CheckCircle /> : <Send />}
              size="large"
              sx={{ 
                minWidth: 140,
                fontWeight: 600,
                ...(job.hasApplied ? {
                  bgcolor: 'success.main',
                  '&:hover': { bgcolor: 'success.dark' }
                } : {})
              }}
            >
              {job.hasApplied ? 'Applied' : 'Apply Now'}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default JobDetailsDialog;
