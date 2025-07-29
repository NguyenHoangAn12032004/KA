import React, { useState, useEffect } from 'react';
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
  IconButton,
  Rating
} from '@mui/material';
import { 
  Edit,
  Save,
  Cancel,
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
  PhotoCamera,
  Share,
  Visibility,
  Phone,
  Email,
  Public
} from '@mui/icons-material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineContent, TimelineDot, TimelineConnector, TimelineOppositeContent } from '@mui/lab';
import { useAuth } from '../contexts/AuthContext';
import { companiesAPI } from '../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Define animations
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
                0 0 90px rgba(102, 126, 234, 0.2);
  }
`;

const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(2deg); }
`;

const StyledCard = styled(Card)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[3],
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.main,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      border: '1px solid currentColor',
      content: '""',
    },
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(15),
  height: theme.spacing(15),
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[3],
}));

// Company Stats Component
const CompanyStatsCard: React.FC<{
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactElement;
  color: string;
  trend?: string;
}> = ({ title, value, subtitle, icon, color, trend }) => {
  const theme = useTheme();

  return (
    <StyledCard
      sx={{
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        borderRadius: 3,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 24px ${alpha(color, 0.3)}`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              background: alpha(color, 0.2),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box sx={{ color, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {icon}
            </Box>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
              sx={{ mb: 0.5 }}
            >
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ color, mb: 0.5 }}>
              {typeof value === "number" ? value.toLocaleString() : value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Chip
                label={trend}
                size="small"
                color={trend.includes("+") ? "success" : "error"}
                sx={{ mt: 0.5, fontWeight: 600 }}
              />
            )}
          </Box>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

// Company Culture Component
const CompanyCulture: React.FC<{ culture: any }> = ({ culture }) => {
  const theme = useTheme();

  const cultureItems = [
    {
      label: "Môi trường làm việc",
      value: culture?.workEnvironment || "Thân thiện, năng động",
    },
    {
      label: "Giá trị cốt lõi",
      value: culture?.coreValues || "Sáng tạo, Đổi mới, Hợp tác",
    },
    {
      label: "Phúc lợi",
      value: culture?.benefits || "Bảo hiểm sức khỏe, Du lịch hàng năm",
    },
    {
      label: "Cơ hội phát triển",
      value: culture?.growth || "Đào tạo chuyên môn, Thăng tiến rõ ràng",
    },
  ];

  return (
    <StyledCard
      sx={{
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.paper, 0.9)} 0%, 
          ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
        backdropFilter: "blur(20px)",
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Văn hóa doanh nghiệp
        </Typography>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} flexWrap="wrap">
          {cultureItems.map((item, index) => (
            <Box key={index} sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" } }}>
              <Fade in timeout={600 + index * 200}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    fontWeight={600}
                    gutterBottom
                  >
                    {item.label}
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    {item.value}
                  </Typography>
                </Box>
              </Fade>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </StyledCard>
  );
};

// Recent Jobs Component
const RecentJobs: React.FC<{ jobs: any[] }> = ({ jobs }) => {
  const theme = useTheme();

  if (!jobs || jobs.length === 0) {
    return (
      <StyledCard sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Chưa có tin tuyển dụng nào
        </Typography>
      </StyledCard>
    );
  }

  return (
    <Timeline position="alternate">
      {jobs.slice(0, 5).map((job, index) => (
        <TimelineItem key={index}>
          <TimelineOppositeContent
            sx={{ m: "auto 0" }}
            variant="body2"
            color="text.secondary"
          >
            {new Date(job.createdAt).toLocaleDateString("vi-VN")}
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineConnector />
            <TimelineDot
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <Work />
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent sx={{ py: "12px", px: 2 }}>
            <StyledCard
              sx={{
                background: `linear-gradient(135deg, 
                  ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                  ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
                backdropFilter: "blur(10px)",
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight={700}>
                  {job.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {job.location} • {job.type}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Chip
                    label={`${job.applicationsCount || 0} ứng viên`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={job.isActive ? "Đang hoạt động" : "Tạm dừng"}
                    size="small"
                    color={job.isActive ? "success" : "default"}
                  />
                </Box>
              </CardContent>
            </StyledCard>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

const CompanyProfile: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await companiesAPI.getProfile();
      if (response && response.data) {
        setProfile(response.data);
      } else {
        throw new Error('No company profile data received');
      }
    } catch (error) {
      console.error("Error loading company profile:", error);
      toast.error('Không thể tải thông tin công ty. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.1)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: `${pulseGlow} 2s ease-in-out infinite`,
              mb: 2,
            }}
          >
            <Business sx={{ fontSize: 40, color: "white" }} />
          </Box>
          <Typography variant="h6" color="primary.main">
            Đang tải hồ sơ doanh nghiệp...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!profile) return null;

  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: "100vh",
        background: `
          linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.05)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.05)} 50%,
            ${alpha(theme.palette.info.main, 0.05)} 100%),
          radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%)
        `,
        position: "relative",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${theme.palette.primary.main.slice(1)}' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          pointerEvents: "none",
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4, position: "relative", zIndex: 1 }}>
        {/* Header Section */}
        <Fade in timeout={800}>
          <Paper
            sx={{
              p: 4,
              mb: 4,
              background: `linear-gradient(135deg, 
                ${theme.palette.primary.main} 0%, 
                ${theme.palette.primary.dark} 50%,
                ${theme.palette.secondary.main} 100%)`,
              backgroundSize: "400% 400%",
              animation: `${gradientAnimation} 15s ease infinite`,
              color: "white",
              borderRadius: 4,
              border: "1px solid rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(20px)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}
              >
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  badgeContent={
                    <IconButton
                      size="small"
                      sx={{
                        backgroundColor: "white",
                        "&:hover": { backgroundColor: "grey.100" },
                      }}
                    >
                      <PhotoCamera
                        sx={{ fontSize: 16, color: "primary.main" }}
                      />
                    </IconButton>
                  }
                >
                  <StyledAvatar
                    sx={{
                      background: "rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    {profile.companyName?.charAt(0)}
                  </StyledAvatar>
                </Badge>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                      mb: 1,
                    }}
                  >
                    {profile.companyName}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      opacity: 0.9,
                      textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                      mb: 2,
                    }}
                  >
                    {profile.industry} • Thành lập {profile.foundedYear}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                      icon={<People />}
                      label={`${profile.companySize} nhân viên`}
                      sx={{
                        background: "rgba(255, 255, 255, 0.2)",
                        color: "white",
                        fontWeight: 600,
                      }}
                    />
                    <Chip
                      icon={<LocationOn />}
                      label={profile.location}
                      sx={{
                        background: "rgba(255, 255, 255, 0.2)",
                        color: "white",
                        fontWeight: 600,
                      }}
                    />
                    <Chip
                      icon={<Verified />}
                      label="Xác thực"
                      sx={{
                        background: "rgba(255, 255, 255, 0.2)",
                        color: "white",
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={editMode ? <Save /> : <Edit />}
                    onClick={() => setEditMode(!editMode)}
                    sx={{
                      borderColor: "white",
                      color: "white",
                      fontWeight: 700,
                      "&:hover": {
                        borderColor: "white",
                        background: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    {editMode ? "Lưu" : "Chỉnh sửa"}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Share />}
                    sx={{
                      borderColor: "white",
                      color: "white",
                      fontWeight: 700,
                      "&:hover": {
                        borderColor: "white",
                        background: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    Chia sẻ
                  </Button>
                </Box>
              </Box>

              {profile.description && (
                <Typography
                  variant="body1"
                  sx={{
                    opacity: 0.9,
                    lineHeight: 1.6,
                    textShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    fontStyle: "italic",
                  }}
                >
                  "{profile.description}"
                </Typography>
              )}
            </Box>
          </Paper>
        </Fade>

        {/* Stats Overview */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ mb: 4 }} flexWrap="wrap">
          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
            <CompanyStatsCard
              title="Tin tuyển dụng"
              value={profile.stats.totalJobs}
              subtitle="Đang hoạt động"
              icon={<Work />}
              color={theme.palette.primary.main}
              trend="+2 tuần này"
            />
          </Box>
          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
            <CompanyStatsCard
              title="Ứng viên"
              value={profile.stats.totalApplications}
              subtitle="Tổng ứng tuyển"
              icon={<People />}
              color={theme.palette.info.main}
              trend="+15%"
            />
          </Box>
          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
            <CompanyStatsCard
              title="Lượt xem"
              value={profile.stats.totalViews}
              subtitle="Profile views"
              icon={<Visibility />}
              color={theme.palette.warning.main}
              trend="+8%"
            />
          </Box>
          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
            <CompanyStatsCard
              title="Tuyển thành công"
              value={profile.stats.successfulHires}
              subtitle="Candidates hired"
              icon={<EmojiEvents />}
              color={theme.palette.success.main}
              trend="+3 tháng này"
            />
          </Box>
        </Stack>

        {/* Content Sections */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          {/* Left Column */}
          <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(33.33% - 12px)" } }}>
            <Stack spacing={3}>
              {/* Contact Info */}
              <StyledCard
                sx={{
                  background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                    ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Thông tin liên hệ
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Email color="action" />
                      <Typography variant="body2">{profile.email}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Phone color="action" />
                      <Typography variant="body2">{profile.phone}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <LocationOn color="action" />
                      <Typography variant="body2">
                        {profile.location}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Public color="action" />
                      <Typography variant="body2">{profile.website}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StyledCard>

              {/* Social Links */}
              <StyledCard
                sx={{
                  background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                    ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Mạng xã hội
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <LinkedIn color="action" />
                      <Typography variant="body2">LinkedIn</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Facebook color="action" />
                      <Typography variant="body2">Facebook</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Public color="action" />
                      <Typography variant="body2">Website</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </StyledCard>

              {/* Rating */}
              <StyledCard
                sx={{
                  background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.success.main, 0.1)} 0%, 
                    ${alpha(theme.palette.info.main, 0.1)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 3, textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontWeight: 700,
                      color: theme.palette.success.main,
                    }}
                  >
                    Đánh giá công ty
                  </Typography>
                  <Typography
                    variant="h2"
                    fontWeight={800}
                    color="success.main"
                    sx={{ mb: 1 }}
                  >
                    4.8
                  </Typography>
                  <Rating
                    value={4.8}
                    readOnly
                    precision={0.1}
                    size="large"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Dựa trên 156 đánh giá
                  </Typography>
                </CardContent>
              </StyledCard>
            </Stack>
          </Box>

          {/* Right Column */}
          <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 calc(66.67% - 12px)" } }}>
            <StyledCard
              sx={{
                background: `linear-gradient(135deg, 
                  ${alpha(theme.palette.background.paper, 0.95)} 0%, 
                  ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                backdropFilter: "blur(20px)",
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  background: alpha(theme.palette.primary.main, 0.05),
                }}
              >
                <Tabs
                  value={tabValue}
                  onChange={(_, newValue) => setTabValue(newValue)}
                  sx={{
                    "& .MuiTab-root": {
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "1rem",
                      minHeight: 64,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: alpha(theme.palette.primary.main, 0.1),
                      },
                    },
                    "& .Mui-selected": {
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                    },
                  }}
                >
                  <Tab label="🏢 Về công ty" />
                  <Tab label="💼 Tin tuyển dụng" />
                  <Tab label="📊 Phân tích" />
                </Tabs>
              </Box>

              {/* About Company Tab */}
              {tabValue === 0 && (
                <Box sx={{ p: 4 }}>
                  <CompanyCulture culture={profile.culture} />
                </Box>
              )}

              {/* Recent Jobs Tab */}
              {tabValue === 1 && (
                <Box sx={{ p: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Tin tuyển dụng gần đây
                    </Typography>
                    <Button
                      startIcon={<Add />}
                      variant="outlined"
                      size="small"
                      sx={{ borderRadius: 2 }}
                    >
                      Đăng tin mới
                    </Button>
                  </Box>
                  <RecentJobs jobs={profile.recentJobs || []} />
                </Box>
              )}

              {/* Analytics Tab */}
              {tabValue === 2 && (
                <Box sx={{ p: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Phân tích hiệu suất tuyển dụng
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={3} flexWrap="wrap">
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
                      <StyledCard sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
                        <AutoGraph
                          sx={{
                            fontSize: 32,
                            color: theme.palette.primary.main,
                            mb: 1,
                          }}
                        />
                        <Typography
                          variant="h4"
                          fontWeight={800}
                          color="primary.main"
                        >
                          87%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tỷ lệ phản hồi
                        </Typography>
                      </StyledCard>
                    </Box>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
                      <StyledCard sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
                        <Speed
                          sx={{
                            fontSize: 32,
                            color: theme.palette.success.main,
                            mb: 1,
                          }}
                        />
                        <Typography
                          variant="h4"
                          fontWeight={800}
                          color="success.main"
                        >
                          12
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Ngày tuyển dụng TB
                        </Typography>
                      </StyledCard>
                    </Box>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
                      <StyledCard sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
                        <TrendingUp
                          sx={{
                            fontSize: 32,
                            color: theme.palette.warning.main,
                            mb: 1,
                          }}
                        />
                        <Typography
                          variant="h4"
                          fontWeight={800}
                          color="warning.main"
                        >
                          +24%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tăng trưởng ứng viên
                        </Typography>
                      </StyledCard>
                    </Box>
                    <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" } }}>
                      <StyledCard sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
                        <EmojiEvents
                          sx={{
                            fontSize: 32,
                            color: theme.palette.info.main,
                            mb: 1,
                          }}
                        />
                        <Typography
                          variant="h4"
                          fontWeight={800}
                          color="info.main"
                        >
                          4.8
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Đánh giá TB
                        </Typography>
                      </StyledCard>
                    </Box>
                  </Stack>
                </Box>
              )}
            </StyledCard>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default CompanyProfile;
