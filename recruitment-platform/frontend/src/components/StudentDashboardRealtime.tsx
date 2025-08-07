import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  Grid,
  useTheme,
  alpha,
  keyframes,
  Fade,
  Slide,
  Zoom,
  Badge,
  IconButton,
} from "@mui/material";
import {
  Work,
  Person,
  Search,
  Bookmark,
  TrendingUp,
  Schedule,
  Send,
  Visibility,
  EmojiEvents,
  TrendingDown,
  CompareArrows,
  CelebrationRounded,
  HandshakeRounded,
  SchoolRounded,
  MonetizationOn,
  Sync,
  Wifi,
  WifiOff,
} from "@mui/icons-material";
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import realtimeStudentService from '../services/realtimeStudentService';
import socketService from '../services/socketService';

// Modern animations
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulseGlow = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 20px rgba(25, 118, 210, 0.4); }
  50% { opacity: 0.8; transform: scale(1.05); box-shadow: 0 0 30px rgba(25, 118, 210, 0.8); }
`;

const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(2deg); }
`;

const shimmerAnimation = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const countUpAnimation = keyframes`
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

// Modern Stat Card for Student
const StudentStatCard: React.FC<{
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactElement;
  gradient: string;
  delay?: number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}> = ({
  title,
  value,
  subtitle,
  icon,
  gradient,
  delay = 0,
  trend,
  trendValue,
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Zoom in timeout={600 + delay}>
      <Card
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(135deg, ${gradient})`,
          backgroundSize: "400% 400%",
          animation: `${gradientAnimation} 8s ease infinite`,
          border: "1px solid rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(20px)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          cursor: "pointer",
          "&:hover": {
            transform: "translateY(-8px) scale(1.02)",
            boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
            "& .stat-icon": {
              transform: "scale(1.2) rotate(10deg)",
            },
            "& .stat-value": {
              transform: "scale(1.1)",
            },
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
            transition: "left 0.6s ease",
          },
          "&:hover::before": {
            left: "100%",
          },
        }}
      >
        <CardContent sx={{ position: "relative", zIndex: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  mb: 1,
                }}
              >
                {title}
              </Typography>
              <Typography
                className="stat-value"
                variant="h3"
                sx={{
                  color: "white",
                  fontWeight: 800,
                  mb: 1,
                  textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                  transition: "transform 0.3s ease",
                  animation: `${countUpAnimation} 0.8s ease-out ${delay}ms both`,
                }}
              >
                {typeof value === "number" ? value.toLocaleString() : value}
              </Typography>
              {subtitle && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    mb: 1,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
              {trend && trendValue && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {trend === "up" ? (
                    <TrendingUp sx={{ color: "#4ade80", fontSize: 16 }} />
                  ) : trend === "down" ? (
                    <TrendingDown sx={{ color: "#f87171", fontSize: 16 }} />
                  ) : (
                    <CompareArrows sx={{ color: "#fbbf24", fontSize: 16 }} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        trend === "up"
                          ? "#4ade80"
                          : trend === "down"
                            ? "#f87171"
                            : "#fbbf24",
                      fontWeight: 700,
                      textShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    }}
                  >
                    {trendValue}
                  </Typography>
                </Box>
              )}
            </Box>
            <Box
              className="stat-icon"
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.3s ease",
                animation: `${floatingAnimation} 6s ease-in-out infinite`,
                animationDelay: `${delay}ms`,
              }}
            >
              {React.cloneElement(icon, {
                sx: {
                  fontSize: 32,
                  color: "white",
                  filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
                },
              })}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  );
};

// Quick Actions Component for Student
const StudentQuickActions: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Only 2 actions: Tìm việc, Hồ sơ
  const actions = [
    {
      label: "Tìm việc",
      icon: <Search />,
      color: theme.palette.primary.main,
      desc: "Khám phá cơ hội mới",
      onClick: () => navigate("/jobs"),
    },
    {
      label: "Hồ sơ",
      icon: <Person />,
      color: theme.palette.info.main,
      desc: "Cập nhật thông tin",
      onClick: () => navigate("/profile"),
    },
  ];
  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.paper, 0.9)} 0%, 
          ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
        backdropFilter: "blur(20px)",
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 3,
        height: "100%",
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
          Thao tác nhanh
        </Typography>
        <Grid container spacing={2}>
          {actions.map((action, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Zoom in timeout={600 + index * 100}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={action.icon}
                  sx={{
                    py: 2,
                    px: 3,
                    borderColor: alpha(action.color, 0.3),
                    color: action.color,
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    background: alpha(action.color, 0.05),
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    height: 80,
                    justifyContent: "flex-start",
                    textAlign: "left",
                    "&:hover": {
                      borderColor: action.color,
                      background: alpha(action.color, 0.1),
                      transform: "translateY(-2px)",
                      boxShadow: `0 8px 20px ${alpha(action.color, 0.3)}`,
                    },
                  }}
                  onClick={action.onClick}
                >
                  <Typography variant="subtitle2" fontWeight={700}>
                    {action.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {action.desc}
                  </Typography>
                </Button>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

// Recent Activity Component
const RecentActivity: React.FC<{
  viewedJobs: any[];
  savedJobs: any[];
  applications: any[];
  interviews: any[];
}> = ({ viewedJobs, savedJobs, applications, interviews }) => {
  const theme = useTheme();

  // Time ago helper function
  const timeAgo = (date: string | Date) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    return "Vừa xong";
  };

  // Build activity list from real data
  const activities: Array<{
    type: string;
    title: string;
    company: string;
    time: string;
    icon: React.ReactElement;
    color: string;
    timestamp: number;
  }> = [];

  // Applications
  applications.forEach(app => {
    activities.push({
      type: 'application',
      title: `Ứng tuyển ${app.jobTitle || app.title || 'Công việc'}`,
      company: app.companyName || app.company?.companyName || '',
      time: app.appliedAt ? timeAgo(app.appliedAt) : '',
      icon: <Send />,
      color: theme.palette.info.main,
      timestamp: app.appliedAt ? new Date(app.appliedAt).getTime() : 0,
    });
  });
  // Saved jobs
  savedJobs.forEach(job => {
    activities.push({
      type: 'saved',
      title: `Đã lưu ${job.jobTitle || job.title || 'Công việc'}`,
      company: job.companyName || job.company?.companyName || '',
      time: job.savedAt ? timeAgo(job.savedAt) : '',
      icon: <Bookmark />,
      color: theme.palette.warning.main,
      timestamp: job.savedAt ? new Date(job.savedAt).getTime() : 0,
    });
  });
  // Viewed jobs
  viewedJobs.forEach(job => {
    activities.push({
      type: 'viewed',
      title: `Xem chi tiết ${job.jobTitle || job.title || 'Công việc'}`,
      company: job.companyName || job.company?.companyName || '',
      time: job.viewedAt ? timeAgo(job.viewedAt) : '',
      icon: <Visibility />,
      color: theme.palette.success.main,
      timestamp: job.viewedAt ? new Date(job.viewedAt).getTime() : 0,
    });
  });
  // Interviews
  interviews.forEach(iv => {
    activities.push({
      type: 'interview',
      title: `Lịch phỏng vấn ${iv.jobTitle || iv.title || 'Công việc'}`,
      company: iv.companyName || iv.company?.companyName || '',
      time: iv.interviewAt ? timeAgo(iv.interviewAt) : '',
      icon: <Schedule />,
      color: theme.palette.error.main,
      timestamp: iv.interviewAt ? new Date(iv.interviewAt).getTime() : 0,
    });
  });

  // Sort by timestamp desc
  activities.sort((a, b) => b.timestamp - a.timestamp);

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.paper, 0.9)} 0%, 
          ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
        backdropFilter: "blur(20px)",
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 3,
        height: "100%",
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
          Hoạt động gần đây
        </Typography>
        <List sx={{ p: 0 }}>
          {activities.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
              Không có hoạt động nào gần đây.
            </Typography>
          ) : activities.slice(0, 6).map((activity, index) => (
            <Fade key={index} in timeout={600 + index * 100}>
              <ListItem
                sx={{
                  p: 2,
                  mb: 1,
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: alpha(activity.color, 0.1),
                    transform: "translateX(4px)",
                  },
                }}
              >
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      background: alpha(activity.color, 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {React.cloneElement(activity.icon, {
                      sx: { color: activity.color, fontSize: 20 },
                    })}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" fontWeight={600}>
                      {activity.title}
                    </Typography>
                  }
                  secondary={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 0.5,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {activity.company}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        • {activity.time}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </Fade>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

// Progress Tracker Component - receives stats as props
const ProgressTracker: React.FC<{ 
  profile: any; 
  profileCompletion: number; 
  totalSkills: number; 
  totalProjects: number; 
  totalCertifications: number 
}> = ({ profile, profileCompletion, totalSkills, totalProjects, totalCertifications }) => {
  const theme = useTheme();

  // Use props instead of calculating locally
  console.log('📊 [ProgressTracker] Received props:', { profileCompletion, totalSkills, totalProjects, totalCertifications });
  console.log('📊 [ProgressTracker] Profile completion value:', profileCompletion);
  console.log('📊 [ProgressTracker] Total skills value:', totalSkills);
  console.log('📊 [ProgressTracker] Total projects value:', totalProjects);
  console.log('📊 [ProgressTracker] Total certifications value:', totalCertifications);

  // Social links - show demo links if profile doesn't have them yet
  const socialLinks = [
    profile?.linkedin ? { icon: <LinkedInIcon color="primary" />, url: profile.linkedin } : 
      { icon: <LinkedInIcon color="primary" />, url: "https://linkedin.com/in/student-profile" },
    profile?.github ? { icon: <GitHubIcon color="action" />, url: profile.github } : 
      { icon: <GitHubIcon color="action" />, url: "https://github.com/student-portfolio" },
    profile?.portfolio ? { icon: <LanguageIcon color="success" />, url: profile.portfolio } : 
      { icon: <LanguageIcon color="success" />, url: "https://student-portfolio.dev" },
  ].filter((x): x is { icon: JSX.Element; url: string } => !!x);

  return (
    <Card
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
          Tiến độ phát triển
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Hoàn thiện hồ sơ */}
          <Fade in timeout={800}>
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>Hoàn thiện hồ sơ</Typography>
                <Typography variant="body2" fontWeight={700} sx={{ color: theme.palette.primary.main }}>{profileCompletion}%</Typography>
              </Box>
              <Box sx={{ width: "100%", height: 8, borderRadius: 4, background: alpha(theme.palette.primary.main, 0.1), overflow: "hidden", position: "relative" }}>
                <Box sx={{ width: `${profileCompletion}%`, height: "100%", background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`, borderRadius: 4, transition: "width 1.5s ease-out", animation: `${shimmerAnimation} 2s ease-in-out infinite`, backgroundSize: "200% 100%" }} />
              </Box>
            </Box>
          </Fade>
          {/* Kỹ năng chuyên môn - tổng số kỹ năng */}
          <Fade in timeout={1000}>
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>Kỹ năng chuyên môn</Typography>
                <Typography variant="body2" fontWeight={700} sx={{ color: theme.palette.success.main }}>{totalSkills} kỹ năng</Typography>
              </Box>
              <Box sx={{ width: "100%", height: 8, borderRadius: 4, background: alpha(theme.palette.success.main, 0.1), overflow: "hidden", position: "relative" }}>
                <Box sx={{ width: `${Math.min(totalSkills * 10, 100)}%`, height: "100%", background: `linear-gradient(90deg, ${theme.palette.success.main}, ${alpha(theme.palette.success.main, 0.8)})`, borderRadius: 4, transition: "width 1.5s ease-out", animation: `${shimmerAnimation} 2s ease-in-out infinite`, backgroundSize: "200% 100%" }} />
              </Box>
            </Box>
          </Fade>
          {/* Kinh nghiệm dự án - tổng số projects */}
          <Fade in timeout={1200}>
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>Kinh nghiệm dự án</Typography>
                <Typography variant="body2" fontWeight={700} sx={{ color: theme.palette.warning.main }}>{totalProjects} dự án</Typography>
              </Box>
              <Box sx={{ width: "100%", height: 8, borderRadius: 4, background: alpha(theme.palette.warning.main, 0.1), overflow: "hidden", position: "relative" }}>
                <Box sx={{ width: `${Math.min(totalProjects * 20, 100)}%`, height: "100%", background: `linear-gradient(90deg, ${theme.palette.warning.main}, ${alpha(theme.palette.warning.main, 0.8)})`, borderRadius: 4, transition: "width 1.5s ease-out", animation: `${shimmerAnimation} 2s ease-in-out infinite`, backgroundSize: "200% 100%" }} />
              </Box>
            </Box>
          </Fade>
          {/* Mạng lưới kết nối - social icons */}
          <Fade in timeout={1400}>
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>Mạng lưới kết nối</Typography>
                <Typography variant="body2" fontWeight={700} sx={{ color: theme.palette.success.main }}>
                  {socialLinks.length} kết nối
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {socialLinks.map((link, idx) => (
                    <Tooltip key={idx} title={`Kết nối ${idx + 1}`}>
                      <IconButton
                        component="a"
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{
                          background: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.2),
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {link.icon}
                      </IconButton>
                    </Tooltip>
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Hoạt động
                </Typography>
              </Box>
            </Box>
          </Fade>
        </Box>
      </CardContent>
    </Card>
  );
};

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [viewedJobs, setViewedJobs] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  
  // Progress tracking states for real-time updates
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [totalSkills, setTotalSkills] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalCertifications, setTotalCertifications] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      initializeRealtimeConnection();
    }
    return () => {
      // Cleanup
      realtimeStudentService.off('data-updated');
      realtimeStudentService.off('stats_updated');
      realtimeStudentService.off('notification');
      realtimeStudentService.off('job_viewed');
      realtimeStudentService.off('job_saved');
      realtimeStudentService.off('job_unsaved');
      realtimeStudentService.off('application_created');
      realtimeStudentService.off('application_updated');
      realtimeStudentService.off('profile_updated');
      realtimeStudentService.off('interview_scheduled');
    };
    // eslint-disable-next-line
  }, [user?.id]);

  // Log props being passed to ProgressTracker
  useEffect(() => {
    console.log('📊 [StudentDashboard] Props for ProgressTracker:', { 
      profileCompletion, 
      totalSkills, 
      totalProjects, 
      totalCertifications 
    });
  }, [profileCompletion, totalSkills, totalProjects, totalCertifications]);

  const initializeRealtimeConnection = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Connect socket if not connected
      const token = localStorage.getItem('token');
      if (token && !socketService.isConnected) {
        socketService.connect(token);
      }

      // Initialize realtime service
      await realtimeStudentService.initialize(user.id);

      // Set up listeners for real-time updates
      realtimeStudentService.on('data-updated', handleDataUpdate);
      realtimeStudentService.on('stats_updated', handleStatsUpdate);
      realtimeStudentService.on('data_loaded', handleDataUpdate); // Handle data_loaded as data update
      realtimeStudentService.on('notification', handleNotification);
      realtimeStudentService.on('job_viewed', handleJobViewed);
      realtimeStudentService.on('job_saved', handleJobSaved);  
      realtimeStudentService.on('job_unsaved', handleJobUnsaved);
      realtimeStudentService.on('application_created', handleApplicationCreated);
      realtimeStudentService.on('application_updated', handleApplicationUpdated);
      realtimeStudentService.on('profile_updated', handleProfileUpdated);
      realtimeStudentService.on('interview_scheduled', handleInterviewScheduled);

      // Update connection status
      setIsRealtimeConnected(realtimeStudentService.isRealtimeConnected());

      console.log('🎯 [StudentDashboard] Realtime connection initialized');
    } catch (error) {
      console.error('❌ [StudentDashboard] Failed to initialize realtime connection:', error);
      toast.error('Không thể kết nối realtime. Trang sẽ hoạt động ở chế độ thường.');
    } finally {
      setLoading(false);
    }
  };

  const handleDataUpdate = useCallback((data: any) => {
    console.log('📊 [StudentDashboard] Data updated:', data);
    console.log('📊 [StudentDashboard] Data type:', typeof data);
    console.log('📊 [StudentDashboard] Data has stats:', !!data.stats);
    
    // Update state with smooth animations
    setViewedJobs(data.viewedJobs || []);
    setSavedJobs(data.savedJobs || []);
    setApplications(data.applications || []);
    setInterviews(data.interviews || []);
    setProfileData(data.profile);
    
    // Update progress stats if available
    if (data.stats) {
      console.log('📊 [StudentDashboard] Updating stats from data:', data.stats);
      setProfileCompletion(data.stats.profileCompletion || 0);
      setTotalSkills(data.stats.totalSkills || 0);
      setTotalProjects(data.stats.totalProjects || 0);
      setTotalCertifications(data.stats.totalCertifications || 0);
    }
    
    // Show subtle notification for major updates
    if (data.applications?.length > applications.length) {
      toast.success('🎉 Dữ liệu ứng tuyển đã được cập nhật!', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: true,
        pauseOnHover: false,
        style: {
          background: theme.palette.success.main,
          color: 'white',
          borderRadius: '12px',
          fontSize: '14px'
        }
      });
    }
  }, [applications.length, theme.palette.success.main]);

  const handleJobViewed = useCallback((data: any) => {
    console.log('👁️ [StudentDashboard] Job viewed:', data);
    toast.info(`👁️ Đã xem: ${data.jobTitle}`, {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: true,
      style: {
        background: theme.palette.info.main,
        color: 'white',
        borderRadius: '12px',
        fontSize: '12px'
      }
    });
  }, [theme.palette.info.main]);

  const handleJobSaved = useCallback((data: any) => {
    console.log('💾 [StudentDashboard] Job saved:', data);
    toast.success(`💾 Đã lưu: ${data.jobTitle}`, {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: true,
      style: {
        background: theme.palette.success.main,
        color: 'white',
        borderRadius: '12px',
        fontSize: '12px'
      }
    });
  }, [theme.palette.success.main]);

  const handleJobUnsaved = useCallback((data: any) => {
    console.log('🗑️ [StudentDashboard] Job unsaved:', data);
    toast.info(`🗑️ Đã bỏ lưu: ${data.jobTitle}`, {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: true,
      style: {
        background: theme.palette.warning.main,
        color: 'white',
        borderRadius: '12px',
        fontSize: '12px'
      }
    });
  }, [theme.palette.warning.main]);

  const handleApplicationCreated = useCallback((data: any) => {
    console.log('📝 [StudentDashboard] Application created:', data);
    toast.success(`🎯 Ứng tuyển thành công: ${data.jobTitle}`, {
      position: "bottom-right",
      autoClose: 4000,
      hideProgressBar: false,
      style: {
        background: theme.palette.success.main,
        color: 'white',
        borderRadius: '12px',
        fontSize: '14px'
      }
    });
  }, [theme.palette.success.main]);

  const handleApplicationUpdated = useCallback((data: any) => {
    console.log('📋 [StudentDashboard] Application updated:', data);
    const statusMessages = {
      'PENDING': '⏳ Đơn ứng tuyển đang chờ xử lý',
      'REVIEWING': '👀 Đơn ứng tuyển đang được xem xét',
      'INTERVIEWED': '🎤 Đã phỏng vấn',
      'ACCEPTED': '🎉 Chúc mừng! Bạn đã được chấp nhận',
      'REJECTED': '😔 Đơn ứng tuyển bị từ chối'
    };
    
    const message = statusMessages[data.status as keyof typeof statusMessages] || 'Cập nhật trạng thái ứng tuyển';
    const isPositive = ['ACCEPTED', 'INTERVIEWED'].includes(data.status);
    
    toast[isPositive ? 'success' : 'info'](message, {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      style: {
        background: isPositive ? theme.palette.success.main : theme.palette.info.main,
        color: 'white',
        borderRadius: '12px',
        fontSize: '14px'
      }
    });
  }, [theme.palette.success.main, theme.palette.info.main]);

  const handleProfileUpdated = useCallback((data: any) => {
    console.log('👤 [StudentDashboard] Profile updated:', data);
    toast.success('✅ Hồ sơ đã được cập nhật!', {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: true,
      style: {
        background: theme.palette.success.main,
        color: 'white',
        borderRadius: '12px',
        fontSize: '14px'
      }
    });
  }, [theme.palette.success.main]);

  const handleInterviewScheduled = useCallback((data: any) => {
    console.log('📅 [StudentDashboard] Interview scheduled:', data);
    
    // Show toast notification
    toast.success(`📅 Lịch phỏng vấn mới: ${data.jobTitle}`, {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      style: {
        background: theme.palette.success.main,
        color: 'white',
        borderRadius: '12px',
        fontSize: '14px'
      }
    });

    // Refresh dashboard data to get the latest interviews
    console.log('🔄 [StudentDashboard] Refreshing data after interview scheduled');
    initializeRealtimeConnection();
  }, [theme.palette.success.main, initializeRealtimeConnection]);

  const handleStatsUpdate = useCallback((stats: any) => {
    console.log('📊 [StudentDashboard] Stats updated:', stats);
    console.log('📊 [StudentDashboard] Stats type:', typeof stats);
    console.log('📊 [StudentDashboard] Stats keys:', stats ? Object.keys(stats) : 'null');
    
    // Update progress data with smooth transitions
    if (stats && stats.profileCompletion !== undefined) {
      console.log('📊 [StudentDashboard] Setting profileCompletion:', stats.profileCompletion);
      setProfileCompletion(stats.profileCompletion);
    }
    if (stats && stats.totalSkills !== undefined) {
      console.log('📊 [StudentDashboard] Setting totalSkills:', stats.totalSkills);
      setTotalSkills(stats.totalSkills);
    }
    if (stats && stats.totalProjects !== undefined) {
      console.log('📊 [StudentDashboard] Setting totalProjects:', stats.totalProjects);
      setTotalProjects(stats.totalProjects);
    }
    if (stats && stats.totalCertifications !== undefined) {
      console.log('📊 [StudentDashboard] Setting totalCertifications:', stats.totalCertifications);
      setTotalCertifications(stats.totalCertifications);
    }
  }, []);

  const handleNotification = useCallback((notification: any) => {
    console.log('🔔 [StudentDashboard] Notification received:', notification);
    
    // Show toast notification
    if (notification.type === 'interview_scheduled') {
      toast.success(`📅 ${notification.title}: ${notification.message}`, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        style: {
          background: theme.palette.success.main,
          color: 'white',
          borderRadius: '12px',
          fontSize: '14px'
        }
      });
    } else {
      toast.info(`🔔 ${notification.title}: ${notification.message}`, {
        position: "bottom-right",
        autoClose: 4000,
        hideProgressBar: false,
        style: {
          background: theme.palette.info.main,
          color: 'white',
          borderRadius: '12px',
          fontSize: '14px'
        }
      });
    }
  }, [theme.palette.success.main, theme.palette.info.main]);

  // Manual refresh function
  const handleRefresh = async () => {
    try {
      setLoading(true);
      await realtimeStudentService.refresh();
      toast.success('🔄 Dữ liệu đã được làm mới!', {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: true,
        style: {
          background: theme.palette.primary.main,
          color: 'white',
          borderRadius: '12px'
        }
      });
    } catch (error) {
      toast.error('❌ Không thể làm mới dữ liệu');
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
          <CircularProgress
            size={60}
            sx={{
              color: theme.palette.primary.main,
              animation: `${pulseGlow} 2s ease-in-out infinite`,
            }}
          />
          <Typography
            variant="h6"
            sx={{ mt: 2, color: theme.palette.primary.main }}
          >
            Đang tải dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  const getUserDisplayName = () => {
    if (user?.studentProfile) {
      return `${user.studentProfile.firstName} ${user.studentProfile.lastName}`;
    }
    return user?.email?.split("@")[0] || "Student";
  };

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
      <Container maxWidth="xl" sx={{ py: 4, position: "relative", zIndex: 1 }}>
        {/* Modern Header */}
        <Slide direction="down" in timeout={800}>
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
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                opacity: 0.3,
                pointerEvents: "none",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "relative",
                zIndex: 1,
              }}
            >
              <Box>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      background: "rgba(255, 255, 255, 0.2)",
                      border: "3px solid rgba(255, 255, 255, 0.3)",
                      fontSize: "1.5rem",
                      fontWeight: 700,
                    }}
                  >
                    {getUserDisplayName().charAt(0)}
                  </Avatar>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 800,
                          textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                        }}
                      >
                        Chào mừng trở lại, {getUserDisplayName()}! 👋
                      </Typography>
                      <Tooltip title={isRealtimeConnected ? "Đã kết nối realtime" : "Chưa kết nối realtime"}>
                        <Chip
                          icon={isRealtimeConnected ? <Wifi /> : <WifiOff />}
                          label={isRealtimeConnected ? "LIVE" : "OFFLINE"}
                          size="small"
                          color={isRealtimeConnected ? "success" : "warning"}
                          sx={{
                            fontWeight: 700,
                            fontSize: "10px",
                            animation: isRealtimeConnected ? `${pulseGlow} 2s ease-in-out infinite` : 'none'
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="Làm mới dữ liệu">
                        <IconButton 
                          onClick={handleRefresh}
                          disabled={loading}
                          sx={{ 
                            color: 'white',
                            '&:hover': {
                              background: 'rgba(255,255,255,0.1)'
                            }
                          }}
                        >
                          <Sync />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        opacity: 0.9,
                        textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                      }}
                    >
                      Sẵn sàng khám phá cơ hội nghề nghiệp mới hôm nay?
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    animation: `${floatingAnimation} 8s ease-in-out infinite`,
                    animationDelay: "2s",
                  }}
                >
                  <SchoolRounded sx={{ fontSize: 80, opacity: 0.3 }} />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Slide>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={6}>
            <StudentStatCard
              title="Đã ứng tuyển"
              value={applications.length}
              subtitle="Đang chờ phản hồi"
              icon={<Send />}
              gradient={`${theme.palette.info.main}, ${theme.palette.info.dark}`}
              delay={100}
              trend="up"
              trendValue="+3 mới"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <StudentStatCard
              title="Phỏng vấn"
              value={interviews.length}
              subtitle="Lịch hẹn sắp tới"
              icon={<Schedule />}
              gradient={`${theme.palette.success.main}, ${theme.palette.success.dark}`}
              delay={300}
              trend="up"
              trendValue="+1 tuần này"
            />
          </Grid>
        </Grid>

        {/* Dashboard Content */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <StudentQuickActions />
          </Grid>
          <Grid item xs={12} md={6}>
            <ProgressTracker 
              profile={profileData || user?.studentProfile} 
              profileCompletion={profileCompletion}
              totalSkills={totalSkills}
              totalProjects={totalProjects}
              totalCertifications={totalCertifications}
            />
          </Grid>
        </Grid>

        {/* Success Stories Section */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Card
              sx={{
                background: `linear-gradient(135deg, 
                  ${alpha(theme.palette.success.main, 0.1)} 0%, 
                  ${alpha(theme.palette.info.main, 0.1)} 100%)`,
                backdropFilter: "blur(20px)",
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                borderRadius: 3,
                p: 4,
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <EmojiEvents
                  sx={{ fontSize: 32, color: theme.palette.success.main }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.info.main})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Câu chuyện thành công
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: "center" }}>
                    <CelebrationRounded
                      sx={{
                        fontSize: 48,
                        color: theme.palette.success.main,
                        mb: 1,
                      }}
                    />
                    <Typography
                      variant="h4"
                      fontWeight={800}
                      color="success.main"
                    >
                      92%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tỷ lệ được tuyển dụng
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: "center" }}>
                    <HandshakeRounded
                      sx={{
                        fontSize: 48,
                        color: theme.palette.info.main,
                        mb: 1,
                      }}
                    />
                    <Typography variant="h4" fontWeight={800} color="info.main">
                      1,234
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sinh viên đã có việc
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: "center" }}>
                    <MonetizationOn
                      sx={{
                        fontSize: 48,
                        color: theme.palette.warning.main,
                        mb: 1,
                      }}
                    />
                    <Typography
                      variant="h4"
                      fontWeight={800}
                      color="warning.main"
                    >
                      15M+
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Mức lương trung bình
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default StudentDashboard;
