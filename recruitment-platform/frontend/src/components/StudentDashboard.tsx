import React, { useState, useEffect } from "react";
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
  Tooltip,
  Grid,
  useTheme,
  alpha,
  keyframes,
  Fade,
  Slide,
  Zoom,
  Stack,
  ListItemAvatar,
  Skeleton,
} from "@mui/material";
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
  Schedule,
  AttachMoney,
  Send,
  Timeline,
  School,
  Assessment,
  Notifications,
  Star,
  EmojiEvents,
  TrendingDown,
  FilterList,
  Visibility,
  AutoGraph,
  Psychology,
  Rocket,
  LocalFireDepartment,
  FlashOn,
  Speed,
  Analytics,
  WorkspacePremium,
  CelebrationRounded,
  HandshakeRounded,
  SchoolRounded,
  BusinessCenter,
  MonetizationOn,
  AccessTime,
  ExpandMore,
  CompareArrows,
  PersonAdd,
  Groups,
  Campaign,
  Mail,
  Info,
  Warning,
  DoneAll,
  Delete,
  CheckCircle,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { dashboardAPI, usersAPI } from '../services/api';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import JobCard from "./JobCard";
import { useNavigate } from "react-router-dom";
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';
import realtimeStudentService from '../services/realtimeStudentService';
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
                0 0 90px rgba(102, 126, 234, 0.2);
  }
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
  };
  location: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  type: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT";
  workMode?: "ONSITE" | "REMOTE" | "HYBRID";
  experienceLevel?: "ENTRY" | "JUNIOR" | "INTERMEDIATE" | "SENIOR";
  description?: string;
  applicationDeadline?: string;
  publishedAt?: string;
  applicationsCount?: number;
  isSaved?: boolean;
  hasApplied?: boolean;
  viewsCount?: number;
}

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

// Helper: time ago
function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff} giây trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

// Progress Tracker Component
const ProgressTracker: React.FC<{ profile: any }> = ({ profile }) => {
  const theme = useTheme();
  
  // Log profile data to debug
  console.log('ProgressTracker received profile:', profile);
  
  // Lấy dữ liệu thực từ profile
  const profileCompletion = profile?.profile_completion || 0;
  const totalSkills = profile?.total_skills || 0;
  const totalProjects = profile?.total_projects || 0;
  
  // Debug values
  console.log('Progress values (real data):', { 
    profileCompletion,
    totalSkills,
    totalProjects,
    github: profile?.github,
    linkedin: profile?.linkedin,
    portfolio: profile?.portfolio
  });
  
  const socialLinks = [
    profile?.linkedin ? { icon: <LinkedInIcon color="primary" />, url: profile.linkedin } : null,
    profile?.github ? { icon: <GitHubIcon color="action" />, url: profile.github } : null,
    profile?.portfolio ? { icon: <LanguageIcon color="success" />, url: profile.portfolio } : null,
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
                <Typography variant="body2" fontWeight={700} sx={{ color: theme.palette.info.main }}>{totalSkills} kỹ năng</Typography>
              </Box>
              <Box sx={{ width: "100%", height: 8, borderRadius: 4, background: alpha(theme.palette.info.main, 0.1), overflow: "hidden", position: "relative" }}>
                <Box sx={{ width: `${Math.min(totalSkills * 10, 100)}%`, height: "100%", background: `linear-gradient(90deg, ${theme.palette.info.main}, ${alpha(theme.palette.info.main, 0.8)})`, borderRadius: 4, transition: "width 1.5s ease-out", animation: `${shimmerAnimation} 2s ease-in-out infinite`, backgroundSize: "200% 100%" }} />
              </Box>
            </Box>
          </Fade>
          {/* Kinh nghiệm dự án - tổng dự án */}
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
                <Box sx={{ display: "flex", gap: 1 }}>
                  {socialLinks.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">Chưa có liên kết</Typography>
                  ) : (
                    socialLinks.map((link, idx) => (
                      <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{link.icon}</a>
                    ))
                  )}
                </Box>
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
  const [activeTab, setActiveTab] = useState(0);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  
  // Progress data state
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [totalSkills, setTotalSkills] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalCertifications, setTotalCertifications] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      initializeRealtimeConnection();
      // Also load initial data directly to ensure we have something to display
      loadDashboardData();
    }
    return () => {
      // Cleanup
      realtimeStudentService.off('data-updated');
      realtimeStudentService.off('job_viewed');
      realtimeStudentService.off('job_saved');
      realtimeStudentService.off('job_unsaved');
      realtimeStudentService.off('application_created');
      realtimeStudentService.off('application_updated');
      realtimeStudentService.off('profile_updated');
      realtimeStudentService.off('interview_scheduled');
      realtimeStudentService.off('stats_updated');
    };
    // eslint-disable-next-line
  }, [user?.id]);

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
      realtimeStudentService.on('job_viewed', handleJobViewed);
      realtimeStudentService.on('job_saved', handleJobSaved);  
      realtimeStudentService.on('job_unsaved', handleJobUnsaved);
      realtimeStudentService.on('application_created', handleApplicationCreated);
      realtimeStudentService.on('application_updated', handleApplicationUpdated);
      realtimeStudentService.on('profile_updated', handleProfileUpdated);
      realtimeStudentService.on('interview_scheduled', handleInterviewScheduled);
      realtimeStudentService.on('stats_updated', handleStatsUpdated);

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

  const handleDataUpdate = (data: any) => {
    console.log('📊 [StudentDashboard] Data updated:', data);
    
    // Update state with smooth animations
    if (data.viewedJobs !== undefined) setViewedJobs(data.viewedJobs || []);
    if (data.savedJobs !== undefined) setSavedJobs(data.savedJobs || []);
    if (data.applications !== undefined) setApplications(data.applications || []);
    if (data.interviews !== undefined) setInterviews(data.interviews || []);
    if (data.profile !== undefined) setProfileData(data.profile);
    
    // Show subtle notification for major updates
    if (data.applications && data.applications.length > applications.length) {
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
    
    // Update connection status
    setIsRealtimeConnected(realtimeStudentService.isRealtimeConnected());
  };

  const handleJobViewed = (data: any) => {
    console.log('👁️ [StudentDashboard] Job viewed:', data);
    // This will be handled by handleDataUpdate, but we can add specific logic here
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
  };

  const handleJobSaved = (data: any) => {
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
  };

  const handleJobUnsaved = (data: any) => {
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
  };

  const handleApplicationCreated = (data: any) => {
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
  };

  const handleApplicationUpdated = (data: any) => {
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
  };

  const handleProfileUpdated = (data: any) => {
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
  };

  const handleInterviewScheduled = (data: any) => {
    console.log('📅 [StudentDashboard] Interview scheduled:', data);
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
  };

  const handleStatsUpdated = (stats: any) => {
    console.log('📊 [StudentDashboard] Stats updated:', stats);
    
    // Update progress data state
    if (stats) {
      if (stats.profileCompletion !== undefined) {
        setProfileCompletion(stats.profileCompletion);
      }
      if (stats.totalSkills !== undefined) {
        setTotalSkills(stats.totalSkills);  
      }
      if (stats.totalProjects !== undefined) {
        setTotalProjects(stats.totalProjects);
      }
      if (stats.totalCertifications !== undefined) {
        setTotalCertifications(stats.totalCertifications);
      }
      
      console.log('✅ [StudentDashboard] Progress stats updated in real-time');
    }
  };

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

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // This function is now handled by realtime service
      // Keep for backwards compatibility
      console.log('📊 [StudentDashboard] Using realtime service instead of manual load');
      
      if (user?.id) {
        const response = await dashboardAPI.getStudentDashboard(user.id);
        
        if (response.data?.success && response.data?.data) {
          const data = response.data.data;
          // Dữ liệu đã được định dạng từ backend
          setViewedJobs(data.viewedJobs || []);
          setSavedJobs(data.savedJobs || []);
          setApplications(data.applications || []);
          setInterviews(data.interviews || []);
          
          // Lấy dữ liệu profile từ API hoặc từ user context
          const profileFromAPI = data.profile || {};
          const profileFromUser = user?.studentProfile || {};
          
          // Kết hợp dữ liệu từ API và từ user context
          const combinedProfile = {
            ...profileFromUser,
            ...profileFromAPI,
            // Đảm bảo các trường quan trọng luôn có giá trị
            profile_completion: profileFromAPI.profile_completion || profileFromUser.profile_completion || 0,
            skills: profileFromAPI.skills || profileFromUser.skills || [],
            projects: profileFromAPI.projects || profileFromUser.projects || [],
            github: profileFromAPI.github || profileFromUser.github || '',
            linkedin: profileFromAPI.linkedin || profileFromUser.linkedin || '',
            portfolio: profileFromAPI.portfolio || profileFromUser.portfolio || ''
          };
          
          // Log dữ liệu kết hợp
          console.log('Combined profile data:', combinedProfile);
          
          // Lưu dữ liệu profile
          setProfileData(combinedProfile);
          
          // Set progress data từ stats
          if (data.stats) {
            setProfileCompletion(data.stats.profileCompletion || 0);
            setTotalSkills(data.stats.totalSkills || 0);
            setTotalProjects(data.stats.totalProjects || 0);
            setTotalCertifications(data.stats.totalCertifications || 0);
          }
        } else {
          // Fallback nếu không có dữ liệu từ API, sử dụng dữ liệu từ user context
          if (user?.studentProfile) {
            setProfileData(user.studentProfile);
            console.log('Using profile data from user context:', user.studentProfile);
          }
          
          // Fallback cho các dữ liệu khác
          setViewedJobs([]);
          setSavedJobs([]);
          setApplications([]);
          setInterviews([]);
        }
      } else {
        console.log('No user ID available for loading dashboard data');
        setViewedJobs([]);
        setSavedJobs([]);
        setApplications([]);
        setInterviews([]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      
      // Fallback nếu có lỗi, sử dụng dữ liệu từ user context
      if (user?.studentProfile) {
        setProfileData(user.studentProfile);
        console.log('Using profile data from user context due to error:', user.studentProfile);
      }
      
      // Fallback cho các dữ liệu khác
      setViewedJobs([]);
      setSavedJobs([]);
      setApplications([]);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (jobId: string) => {
    try {
      const job = savedJobs.find((j) => j.id === jobId);
      if (!job) return;

      const isSaved = savedJobs.some((savedJob) => savedJob.id === jobId);

      // Update UI optimistically
      if (isSaved) {
        setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
      } else {
        // Add to saved jobs
        setSavedJobs((prev) => [...prev, job]);
      }

      // Make API call
      if (user?.id) {
        if (isSaved) {
          await dashboardAPI.removeJob(user.id, jobId);
        } else {
          await dashboardAPI.saveJob(user.id, jobId);
        }
      }

      // Show toast notification
      toast.success(
        isSaved
          ? "Đã xóa công việc khỏi danh sách đã lưu"
          : "Đã lưu công việc thành công"
      );
    } catch (error) {
      console.error("Error toggling saved job:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
      
      // Revert UI change
      const isSaved = savedJobs.some((savedJob) => savedJob.id === jobId);
      if (isSaved) {
        setSavedJobs((prev) => [...prev, savedJobs.find((j) => j.id === jobId)!]);
      } else {
        setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
      }
    }
  };

  const handleApplyJob = async (job: Job) => {
    try {
      // Implementation for job application
      console.log("Applying to job:", job.id);
    } catch (error) {
      console.error("Error applying to job:", error);
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
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                      }}
                    >
                      Chào mừng trở lại, {getUserDisplayName()}! 👋
                    </Typography>
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
          <Grid item xs={12} sm={6} md={3}>
            <StudentStatCard
              title="Việc làm đã xem"
              value={viewedJobs.length}
              subtitle="Tuần này"
              icon={<Visibility />}
              gradient={`${theme.palette.primary.main}, ${theme.palette.primary.dark}`}
              delay={0}
              trend="up"
              trendValue="+12%"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
            <StudentStatCard
              title="Việc đã lưu"
              value={savedJobs.length}
              subtitle="Danh sách yêu thích"
              icon={<Bookmark />}
              gradient={`${theme.palette.warning.main}, ${theme.palette.warning.dark}`}
              delay={200}
              trend="neutral"
              trendValue="Ổn định"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
            <ProgressTracker profile={profileData || user?.studentProfile} />
          </Grid>
        </Grid>

        {/* Job Recommendations */}
        <Card
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
                variant="h5"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                🎯 Việc làm gợi ý cho bạn
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Visibility />}
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  "&:hover": {
                    transform: "translateY(-1px)",
                  },
                }}
                onClick={() => navigate("/jobs")}
              >
                Xem tất cả
              </Button>
            </Box>

            <Grid container spacing={3}>
              {/* The original code had a call to recommendedJobs.slice(0, 3).map,
                  but recommendedJobs state was removed. Assuming this was a placeholder
                  or intended to be replaced with a different data source if available.
                  For now, leaving it as is, but it will likely cause an error
                  if not replaced with a valid data source. */}
              {/* {recommendedJobs.slice(0, 3).map((job, index) => ( */}
              {/*   <Grid item xs={12} md={4} key={job.id}> */}
              {/*     <Fade in timeout={600 + index * 200}> */}
              {/*       <Box> */}
              {/*         <JobCard */}
              {/*           job={job} */}
              {/*           onJobClick={() => console.log("View job:", job.id)} */}
              {/*           onApplyClick={handleApplyJob} */}
              {/*           onSaveClick={handleSaveJob} */}
              {/*           viewMode="grid" */}
              {/*         /> */}
              {/*       </Box> */}
              {/*     </Fade> */}
              {/*   </Grid> */}
              {/* ))} */}
            </Grid>
          </Box>
        </Card>

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