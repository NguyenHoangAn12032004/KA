import React, { useState, useEffect, useCallback } from 'react';
import { styled, alpha, keyframes } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { 
  Box, 
  Paper,
  Typography, 
  Button, 
  Avatar, 
  Chip, 
  Card, 
  CardContent,
  Badge,
  Container,
  Stack,
  Tab,
  Tabs,
  Fade,
  Rating,
  Grid,
  LinearProgress,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Zoom,
  Slide,
  useMediaQuery
} from '@mui/material';
import { 
  Edit,
  Save,
  Add,
  Business,
  LocationOn,
  People,
  Work,
  TrendingUp,
  Facebook,
  LinkedIn,
  AutoGraph,
  Speed,
  EmojiEvents,
  Verified,
  Share,
  Visibility,
  Phone,
  Email,
  Public,
  StarBorder,
  Star,
  Bookmark,
  BookmarkBorder,
  TrendingDown,
  Analytics,
  GitHub,
  Twitter,
  Groups
} from '@mui/icons-material';
import { 
  Timeline as MuiTimeline, 
  TimelineItem, 
  TimelineSeparator, 
  TimelineContent, 
  TimelineDot, 
  TimelineConnector, 
  TimelineOppositeContent 
} from '@mui/lab';
import { useAuth } from '../contexts/AuthContext';
import { companiesAPI } from '../services/api';
import socketService from '../services/socketService';

// Modern animations
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulseGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.4),
                0 0 40px rgba(102, 126, 234, 0.2),
                0 0 60px rgba(102, 126, 234, 0.1);
  }
  50% { 
    box-shadow: 0 0 30px rgba(102, 126, 234, 0.6),
                0 0 60px rgba(102, 126, 234, 0.3),
                0 0 80px rgba(102, 126, 234, 0.2);
  }
`;

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.background.paper, 0.95)} 0%, 
    ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderRadius: theme.spacing(2),
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
}));

const HeroSection = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main} 0%, 
    ${theme.palette.primary.dark} 50%,
    ${theme.palette.secondary.main} 100%)`,
  backgroundSize: '400% 400%',
  animation: `${gradientAnimation} 15s ease infinite`,
  color: 'white',
  borderRadius: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, 
    ${alpha(theme.palette.background.paper, 0.9)} 0%, 
    ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
  borderRadius: theme.spacing(3),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: `0 16px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const FloatingActionButton = styled(Button)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  borderRadius: '50%',
  width: 64,
  height: 64,
  minWidth: 64,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
  animation: `${floatAnimation} 3s ease-in-out infinite`,
  zIndex: 1000,
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.6)}`,
  },
}));

// Interface definitions
interface CompanyStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalViews: number;
  followers: number;
  successfulHires: number;
  averageRating: number;
  responseRate: number;
  hireTime: number;
}

interface CompanyProfileData {
  id: string;
  companyName: string;
  description?: string;
  industry?: string;
  companySize?: string;
  foundedYear?: number;
  location?: string;
  website?: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  isVerified: boolean;
  rating: number;
  stats: CompanyStats;
  socialLinks: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    github?: string;
  };
  culture: {
    workEnvironment?: string;
    coreValues?: string;
    benefits?: string;
    growth?: string;
  };
  recentJobs: any[];
  achievements: Array<{
    title: string;
    description: string;
    date: string;
    icon: string;
  }>;
  team: Array<{
    name: string;
    position: string;
    avatar?: string;
  }>;
}

// Stats Card Component
const CompanyStatsCard: React.FC<{
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactElement;
  color: string;
  trend?: string;
  onClick?: () => void;
  isLoading?: boolean;
}> = ({ title, value, subtitle, icon, color, trend, onClick, isLoading = false }) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <StatsCard onClick={onClick}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Skeleton variant="circular" width={56} height={56} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="80%" height={32} />
              <Skeleton variant="text" width="40%" height={16} />
            </Box>
          </Box>
        </CardContent>
      </StatsCard>
    );
  }

  return (
    <StatsCard onClick={onClick}>
      <CardContent sx={{ p: 3, position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(color, 0.2)}, ${alpha(color, 0.1)})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Box sx={{ color, fontSize: 28 }}>
              {icon}
            </Box>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
              sx={{ mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              fontWeight={800} 
              sx={{ 
                color,
                mb: 0.5,
                background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.7)})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {trend.includes('+') ? (
              <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
            ) : (
              <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
            )}
            <Chip
              label={trend}
              size="small"
              color={trend.includes('+') ? 'success' : 'error'}
              sx={{ fontWeight: 600, fontSize: '0.75rem' }}
            />
          </Box>
        )}
      </CardContent>
    </StatsCard>
  );
};

// Main Component
const CompanyProfileNew: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State management
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CompanyProfileData | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('info');

  // Load profile data
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await companiesAPI.getProfile();
      if (response && response.data) {
        console.log('🏢 Raw API response:', response.data);
        console.log('🏢 Company data details:', JSON.stringify(response.data.data, null, 2));
        // Transform the data to match our interface
        const transformedData: CompanyProfileData = {
          id: response.data.id || '',
          companyName: response.data.companyName || 'Công ty chưa đặt tên',
          description: response.data.description || null,
          industry: response.data.industry || null,
          companySize: response.data.companySize || null,
          foundedYear: response.data.foundedYear || null,
          location: response.data.location || null,
          website: response.data.website || '',
          email: response.data.email || user?.email || '',
          phone: response.data.phone || '',
          logoUrl: response.data.logoUrl || response.data.logo || '',
          isVerified: response.data.isVerified || false,
          rating: response.data.rating || 4.5,
          stats: {
            totalJobs: response.data.stats?.totalJobs || 0,
            activeJobs: response.data.stats?.activeJobs || 0,
            totalApplications: response.data.stats?.totalApplications || 0,
            totalViews: response.data.stats?.totalViews || 0,
            followers: response.data.stats?.followers || 0,
            successfulHires: response.data.stats?.successfulHires || 0,
            averageRating: response.data.stats?.averageRating || 4.5,
            responseRate: response.data.stats?.responseRate || 87,
            hireTime: response.data.stats?.hireTime || 12,
          },
          socialLinks: {
            linkedin: response.data.socialLinks?.linkedin || response.data.linkedin || '',
            facebook: response.data.socialLinks?.facebook || response.data.facebook || '',
            twitter: response.data.socialLinks?.twitter || response.data.twitter || '',
            instagram: response.data.socialLinks?.instagram || '',
            youtube: response.data.socialLinks?.youtube || '',
            github: response.data.socialLinks?.github || '',
          },
          culture: {
            workEnvironment: response.data.culture?.workEnvironment || null,
            coreValues: response.data.culture?.coreValues || null,
            benefits: response.data.culture?.benefits || null,
            growth: response.data.culture?.growth || null,
          },
          recentJobs: response.data.recentJobs || [],
          achievements: response.data.achievements || [],
          team: response.data.team || []
        };
        
        console.log('📊 Setting company profile:', JSON.stringify(transformedData, null, 2));
        setProfile(transformedData);
        setEditFormData(transformedData);
        
        // Setup real-time connection
        if (socketService && transformedData.id) {
          socketService.joinCompanyRoom(transformedData.id);
          setupRealTimeListeners();
        }
      }
    } catch (error) {
      console.error('Error loading company profile:', error);
      showSnackbar('Không thể tải thông tin công ty. Vui lòng thử lại sau.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Setup real-time listeners
  const setupRealTimeListeners = useCallback(() => {
    if (!socketService) return;

    socketService.on('company-stats-updated', (data: any) => {
      console.log('📊 Real-time stats update:', data);
      setProfile(prev => prev ? {
        ...prev,
        stats: { ...prev.stats, ...data.stats }
      } : null);
    });

    socketService.on('company-viewed', (data: any) => {
      console.log('👁️ Company viewed:', data);
      setProfile(prev => prev ? {
        ...prev,
        stats: {
          ...prev.stats,
          totalViews: prev.stats.totalViews + 1
        }
      } : null);
    });

    socketService.on('job-application-received', (data: any) => {
      console.log('📝 New application received:', data);
      setProfile(prev => prev ? {
        ...prev,
        stats: {
          ...prev.stats,
          totalApplications: prev.stats.totalApplications + 1
        }
      } : null);
      showSnackbar('Có ứng viên mới ứng tuyển!', 'success');
    });

    socketService.on('application-status-changed', (data: any) => {
      console.log('🔄 Application status changed:', data);
      // Optionally refresh profile or update specific stats
      showSnackbar(`Trạng thái ứng tuyển đã được cập nhật: ${data.status}`, 'info');
    });

    socketService.on('job-view-updated', (data: any) => {
      console.log('👁️ Job view updated:', data);
      setProfile(prev => prev ? {
        ...prev,
        stats: {
          ...prev.stats,
          totalViews: prev.stats.totalViews + 1
        }
      } : null);
    });

  }, []);

  // Utility functions
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleEditSave = async () => {
    try {
      setLoading(true);
      // For now, just simulate the save
      setProfile(editFormData);
      setShowEditDialog(false);
      showSnackbar('Cập nhật thông tin thành công!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showSnackbar('Có lỗi xảy ra khi cập nhật thông tin!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (profile) {
        // For now, just simulate the follow action
        setIsFollowing(!isFollowing);
        showSnackbar(
          !isFollowing ? 'Đã theo dõi công ty!' : 'Đã bỏ theo dõi!', 
          'success'
        );
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      showSnackbar('Có lỗi xảy ra!', 'error');
    }
  };

  // Effects
  useEffect(() => {
    loadProfile();
    
    return () => {
      if (socketService) {
        socketService.disconnect();
      }
    };
  }, [loadProfile]);

  // Loading state
  if (loading && !profile) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.1)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: `${pulseGlow} 2s ease-in-out infinite`,
              mb: 2,
            }}
          >
            <Business sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography variant="h6" color="primary.main" gutterBottom>
            Đang tải hồ sơ doanh nghiệp...
          </Typography>
          <LinearProgress 
            sx={{ 
              width: 200, 
              borderRadius: 2,
              '& .MuiLinearProgress-bar': {
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }
            }} 
          />
        </Box>
      </Box>
    );
  }

  if (!profile) return null;

  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: '100vh',
        background: `
          linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.05)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.05)} 50%,
            ${alpha(theme.palette.info.main, 0.05)} 100%)
        `,
        position: 'relative',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <Fade in timeout={800}>
          <HeroSection sx={{ p: 4, mb: 4 }}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3, flexWrap: 'wrap' }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    profile.isVerified ? (
                      <Verified sx={{ color: 'success.main', fontSize: 24 }} />
                    ) : null
                  }
                >
                  <Avatar
                    src={profile.logoUrl}
                    sx={{
                      width: { xs: 100, sm: 120 },
                      height: { xs: 100, sm: 120 },
                      border: '4px solid rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Business sx={{ fontSize: { xs: 40, sm: 50 } }} />
                  </Avatar>
                </Badge>
                
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant={isMobile ? 'h4' : 'h3'}
                    sx={{
                      fontWeight: 800,
                      textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                      mb: 1,
                      wordBreak: 'break-word',
                    }}
                  >
                    {profile.companyName}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      opacity: 0.9,
                      textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Business sx={{ fontSize: 20 }} />
                    {profile.industry || 'Chưa xác định ngành'}{(profile.industry && profile.foundedYear) ? ' • ' : ''}{profile.foundedYear && profile.foundedYear !== new Date().getFullYear() ? `Thành lập ${profile.foundedYear}` : ''}
                  </Typography>
                  
                  {/* Action Buttons */}
                  <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                    <Button
                      variant="contained"
                      startIcon={isFollowing ? <Star /> : <StarBorder />}
                      onClick={handleFollow}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.3)',
                        },
                      }}
                    >
                      {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={isBookmarked ? <Bookmark /> : <BookmarkBorder />}
                      onClick={() => setIsBookmarked(!isBookmarked)}
                      sx={{
                        color: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        '&:hover': {
                          borderColor: 'rgba(255, 255, 255, 0.8)',
                          background: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      {isBookmarked ? 'Đã lưu' : 'Lưu'}
                    </Button>
                    
                    {user?.role === 'COMPANY' && (
                      <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={() => setShowEditDialog(true)}
                        sx={{
                          background: 'rgba(255, 255, 255, 0.9)',
                          color: theme.palette.primary.main,
                          '&:hover': {
                            background: 'white',
                          },
                        }}
                      >
                        Chỉnh sửa
                      </Button>
                    )}
                  </Stack>
                </Box>
                
                {/* Rating Section */}
                <Box sx={{ textAlign: 'center', minWidth: 'fit-content' }}>
                  <Typography variant="h3" fontWeight={800} gutterBottom>
                    {profile.rating}
                  </Typography>
                  <Rating 
                    value={profile.rating} 
                    readOnly 
                    precision={0.1}
                    sx={{ 
                      mb: 1,
                      '& .MuiRating-iconFilled': {
                        color: '#FFD700',
                        filter: 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.4))',
                      },
                    }} 
                  />
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Đánh giá từ ứng viên
                  </Typography>
                </Box>
              </Box>
              
              {/* Company Description */}
              {profile.description && (
                <Typography
                  variant="h6"
                  sx={{
                    opacity: 0.95,
                    lineHeight: 1.6,
                    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    fontStyle: 'italic',
                    maxWidth: '80%',
                  }}
                >
                  "{profile.description}"
                </Typography>
              )}
            </Box>
          </HeroSection>
        </Fade>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <CompanyStatsCard
              title="Tin tuyển dụng"
              value={profile.stats.totalJobs}
              subtitle="Tổng số tin đăng"
              icon={<Work />}
              color={theme.palette.primary.main}
              trend="+2 tuần này"
              isLoading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <CompanyStatsCard
              title="Ứng viên"
              value={profile.stats.totalApplications}
              subtitle="Tổng ứng tuyển"
              icon={<People />}
              color={theme.palette.info.main}
              trend="+15%"
              isLoading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <CompanyStatsCard
              title="Lượt xem"
              value={profile.stats.totalViews}
              subtitle="Profile views"
              icon={<Visibility />}
              color={theme.palette.warning.main}
              trend="+8%"
              isLoading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <CompanyStatsCard
              title="Tuyển thành công"
              value={profile.stats.successfulHires}
              subtitle="Candidates hired"
              icon={<EmojiEvents />}
              color={theme.palette.success.main}
              trend="+3 tháng này"
              isLoading={loading}
            />
          </Grid>
        </Grid>

        {/* Company Info Card */}
        <StyledCard>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Thông tin công ty
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Email color="action" />
                  <Typography variant="body1">{profile.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Phone color="action" />
                  <Typography variant="body1">{profile.phone || 'Chưa cập nhật'}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <LocationOn color="action" />
                  <Typography variant="body1">{profile.location || 'Chưa cập nhật địa chỉ'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Public color="action" />
                  <Typography variant="body1">
                    {profile.website ? (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer">
                        {profile.website}
                      </a>
                    ) : 'Chưa cập nhật'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>
      </Container>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <TrendingUp />
      </FloatingActionButton>

      {/* Edit Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.background.paper, 0.95)} 0%, 
              ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            Chỉnh sửa thông tin công ty
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Tên công ty"
              value={editFormData.companyName || ''}
              onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Mô tả công ty"
              value={editFormData.description || ''}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              multiline
              rows={4}
              fullWidth
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Ngành nghề"
                  value={editFormData.industry || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, industry: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Quy mô công ty"
                  value={editFormData.companySize || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, companySize: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowEditDialog(false)} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            startIcon={<Save />}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              },
            }}
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanyProfileNew;