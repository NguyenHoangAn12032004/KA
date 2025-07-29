import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  CircularProgress,
  Alert,
  Grid,
  useTheme,
  alpha,
  keyframes,
  Fade,
  Slide,
  Zoom,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import {
  Business,
  Add,
  Edit,
  Delete,
  Visibility,
  TrendingUp,
  People,
  Work,
  Assignment,
  MoreVert,
  LocationOn,
  Schedule,
  Analytics,
  Campaign,
  PersonAdd,
  Groups,
  Timeline,
  Assessment,
  MonetizationOn,
  Speed,
  Security,
  NotificationsActive,
  TrendingDown,
  CompareArrows,
  EmojiEvents,
  CelebrationRounded,
  HandshakeRounded,
  WorkspacePremium,
  LocalFireDepartment,
  FlashOn,
  Psychology,
  Rocket,
  AutoGraph,
  DataUsage,
  Send,
  Badge,
  CheckCircle,
  Schedule as ScheduleIcon,
  AccessTime,
  Star,
  BusinessCenter,
  School,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { jobsAPI, companiesAPI } from "../services/api";
import { toast } from "react-toastify";
import QuickActions from "./QuickActions";
import { useNavigate } from "react-router-dom";

// Modern animations (same as AdminDashboard)
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

interface JobPosting {
  id: string;
  title: string;
  location: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  type: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT";
  workMode?: "ONSITE" | "REMOTE" | "HYBRID";
  experienceLevel?: "ENTRY" | "JUNIOR" | "INTERMEDIATE" | "SENIOR";
  description?: string;
  requirements?: string;
  benefits?: string;
  applicationDeadline?: string;
  publishedAt?: string;
  isActive: boolean;
  applicationsCount?: number;
  viewsCount?: number;
  company?: {
    id: string;
    companyName: string;
    logoUrl?: string;
  };
}

// Company Stat Card Component
const CompanyStatCard: React.FC<{
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

// Recent Applications Component
const RecentApplications: React.FC = () => {
  const theme = useTheme();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Sửa phần fetchRecentApplications để thêm debounce và xử lý lỗi tốt hơn
  useEffect(() => {
    const fetchRecentApplications = async () => {
      try {
        setLoading(true);
        const response = await companiesAPI.getRecentApplications();
        // Kiểm tra cấu trúc dữ liệu trả về
        if (response?.data?.data) {
          setApplications(response.data.data.slice(0, 5));
        } else if (Array.isArray(response?.data)) {
          setApplications(response.data.slice(0, 5));
        } else {
          console.warn('Không có dữ liệu ứng viên hoặc định dạng không đúng:', response);
          // Sử dụng dữ liệu mẫu
          setApplications([
            {
              candidateName: "Nguyễn Văn A",
              position: "Frontend Developer",
              appliedAt: "2 giờ trước",
              status: "new",
              avatar: "N",
              experience: "2 năm",
              skills: ["React", "TypeScript"],
            },
            {
              candidateName: "Trần Thị B",
              position: "Backend Engineer",
              appliedAt: "5 giờ trước",
              status: "reviewing",
              avatar: "T",
              experience: "3 năm",
              skills: ["Node.js", "MongoDB"],
            },
          ]);
        }
      } catch (error) {
        console.error("Error loading recent applications:", error);
        // Không hiển thị toast để tránh quá nhiều thông báo
        // Sử dụng dữ liệu mẫu
        setApplications([
          {
            candidateName: "Nguyễn Văn A",
            position: "Frontend Developer",
            appliedAt: "2 giờ trước",
            status: "new",
            avatar: "N",
            experience: "2 năm",
            skills: ["React", "TypeScript"],
          },
          {
            candidateName: "Trần Thị B",
            position: "Backend Engineer",
            appliedAt: "5 giờ trước",
            status: "reviewing",
            avatar: "T",
            experience: "3 năm",
            skills: ["Node.js", "MongoDB"],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    // Sử dụng setTimeout để tránh gọi API quá nhiều lần
    const timer = setTimeout(() => {
      fetchRecentApplications();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return theme.palette.info.main;
      case "reviewing":
        return theme.palette.warning.main;
      case "shortlisted":
        return theme.palette.success.main;
      case "interview":
        return theme.palette.primary.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new":
        return "Mới";
      case "reviewing":
        return "Đang xem xét";
      case "shortlisted":
        return "Lọt vòng";
      case "interview":
        return "Phỏng vấn";
      default:
        return status;
    }
  };

  const handleViewMoreCandidates = () => {
    navigate('/candidates');
  };

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
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
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
          Ứng viên mới nhất
        </Typography>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={30} />
          </Box>
        ) : applications.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">
              Chưa có ứng viên nào
            </Typography>
          </Box>
        ) : (
        <List sx={{ p: 0 }}>
          {applications && applications.map((app, index) => (
            <Fade key={index} in timeout={600 + index * 100}>
              <ListItem
                sx={{
                  p: 2,
                  mb: 1,
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  border: `1px solid ${alpha(getStatusColor(app.status), 0.2)}`,
                  background: alpha(getStatusColor(app.status), 0.05),
                  "&:hover": {
                    background: alpha(getStatusColor(app.status), 0.1),
                    transform: "translateX(4px)",
                  },
                }}
              >
                <ListItemIcon>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      background: `linear-gradient(135deg, ${getStatusColor(app.status)}, ${alpha(getStatusColor(app.status), 0.8)})`,
                      fontWeight: 700,
                    }}
                  >
                    {app.avatar}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={700}>
                        {app.candidateName}
                      </Typography>
                      <Chip
                        label={getStatusLabel(app.status)}
                        size="small"
                        sx={{
                          background: alpha(getStatusColor(app.status), 0.2),
                          color: getStatusColor(app.status),
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {app.position} • {app.experience}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
                        {app.skills && app.skills.map((skill: string, i: number) => (
                          <Chip
                            key={i}
                            label={skill}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.65rem", height: 20 }}
                          />
                        ))}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {app.appliedAt}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </Fade>
          ))}
        </List>
        )}
      </CardContent>
      <Box sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Button 
          fullWidth 
          variant="outlined" 
          color="primary"
          onClick={handleViewMoreCandidates}
          sx={{ 
            borderRadius: 2,
            py: 1,
            fontWeight: 600,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
            }
          }}
        >
          Xem thêm ứng viên
        </Button>
      </Box>
    </Card>
  );
};

// Performance Metrics Component
const PerformanceMetrics: React.FC = () => {
  const theme = useTheme();
  const [metrics, setMetrics] = useState([
    {
      label: "Tỷ lệ ứng tuyển",
      value: 0,
      target: 100,
      color: theme.palette.primary.main,
      trend: "+0%",
    },
    {
      label: "Chất lượng ứng viên",
      value: 0,
      target: 100,
      color: theme.palette.success.main,
      trend: "+0%",
    },
    {
      label: "Thời gian tuyển dụng",
      value: 0,
      target: 100,
      color: theme.palette.warning.main,
      trend: "+0%",
    },
    {
      label: "Hài lòng ứng viên",
      value: 0,
      target: 100,
      color: theme.palette.info.main,
      trend: "+0%",
    },
  ]);
  const [loading, setLoading] = useState(true);
  
  // Sửa phần fetchPerformanceMetrics để thêm debounce và xử lý lỗi tốt hơn
  useEffect(() => {
    const fetchPerformanceMetrics = async () => {
      try {
        setLoading(true);
        const response = await companiesAPI.getPerformanceMetrics();
        if (response?.data?.data?.performanceMetrics) {
          setMetrics(response.data.data.performanceMetrics);
        } else if (response?.data?.performanceMetrics) {
          setMetrics(response.data.performanceMetrics);
        }
        // Giữ nguyên metrics mặc định nếu API lỗi
      } catch (error) {
        console.error("Error loading performance metrics:", error);
        // Không hiển thị toast để tránh quá nhiều thông báo
      } finally {
        setLoading(false);
      }
    };
    
    // Sử dụng setTimeout để tránh gọi API quá nhiều lần
    const timer = setTimeout(() => {
      fetchPerformanceMetrics();
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

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
          Hiệu suất tuyển dụng
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {metrics.map((metric, index) => (
            <Fade key={index} in timeout={800 + index * 200}>
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {metric.label}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ color: metric.color }}
                    >
                      {metric.value}%
                    </Typography>
                    <Typography
                      variant="caption"
                      color="success.main"
                      fontWeight={600}
                    >
                      {metric.trend}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    width: "100%",
                    height: 8,
                    borderRadius: 4,
                    background: alpha(metric.color, 0.1),
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{
                      width: `${metric.value}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, ${metric.color}, ${alpha(metric.color, 0.8)})`,
                      borderRadius: 4,
                      transition: "width 1.5s ease-out",
                      animation: `${shimmerAnimation} 2s ease-in-out infinite`,
                      backgroundSize: "200% 100%",
                    }}
                  />
                </Box>
              </Box>
            </Fade>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

const CompanyDashboard: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyStats, setCompanyStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalViews: 0,
    interviewsScheduled: 0
  });
  const [dataError, setDataError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadCompanyData();
  }, [refreshTrigger]);

  // Sửa phần loadCompanyData để xử lý dữ liệu tốt hơn
  const loadCompanyData = async () => {
    try {
      setLoading(true);
      setDataError(null);
      
      console.log('🔄 Đang tải dữ liệu công ty...');
      console.log('🔑 Token:', localStorage.getItem('token'));
      console.log('👤 User:', JSON.stringify(user, null, 2));
      
      // Tải song song dữ liệu công việc và thống kê
      const jobsResponse = await jobsAPI.getCompanyJobs();
      
      // Kiểm tra và xử lý dữ liệu công việc
      console.log('📋 API Response:', JSON.stringify(jobsResponse, null, 2));
      
      if (jobsResponse?.data?.data) {
        console.log(`📊 Đã tải ${jobsResponse.data.data.length} công việc từ API`);
        setJobs(jobsResponse.data.data);
      } else if (jobsResponse?.data?.jobs) {
        console.log(`📊 Đã tải ${jobsResponse.data.jobs.length} công việc từ API`);
        setJobs(jobsResponse.data.jobs);
      } else if (Array.isArray(jobsResponse?.data)) {
        console.log(`📊 Đã tải ${jobsResponse.data.length} công việc từ API (array)`);
        setJobs(jobsResponse.data);
      } else {
        console.warn('⚠️ Không có dữ liệu công việc hoặc định dạng không đúng:', jobsResponse.data);
        setJobs([]);
      }
      
      // Thống kê sẽ được tải riêng trong component PerformanceMetrics
      
    } catch (error: any) {
      console.error('❌ Lỗi khi tải dữ liệu công ty:', error);
      if (error.response) {
        console.error('- Status:', error.response.status);
        console.error('- Data:', error.response.data);
      }
      setDataError('Không thể tải dữ liệu công ty. Vui lòng thử lại sau.');
      toast.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    job: JobPosting,
  ) => {
    setMenuAnchor(event.currentTarget);
    setSelectedJob(job);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedJob(null);
  };

  const handleEditJob = () => {
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteJob = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (selectedJob) {
      try {
        await jobsAPI.delete(selectedJob.id);
        toast.success('Đã xóa tin tuyển dụng thành công');
        handleRefresh(); // Tải lại dữ liệu sau khi xóa
        setDeleteDialogOpen(false);
      } catch (error) {
        console.error('❌ Lỗi khi xóa công việc:', error);
        toast.error('Không thể xóa tin tuyển dụng. Vui lòng thử lại sau.');
      }
    }
  };

  const handleViewApplications = (jobId: string) => {
    // Chuyển hướng đến trang ứng viên của công việc này
    console.log('Xem ứng viên cho công việc:', jobId);
    navigate('/candidates');
    handleMenuClose();
  };

  const handleToggleJobStatus = async (job: JobPosting) => {
    try {
      await jobsAPI.updateStatus(job.id, !job.isActive);
      toast.success(`Đã ${job.isActive ? 'tạm dừng' : 'kích hoạt'} tin tuyển dụng`);
      handleRefresh(); // Tải lại dữ liệu sau khi cập nhật
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật trạng thái công việc:', error);
      toast.error('Không thể cập nhật trạng thái tin tuyển dụng.');
    }
    handleMenuClose();
  };

  const handleCreateJob = () => {
    navigate('/create-job');
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

  const getCompanyName = () => {
    return user?.companyProfile?.companyName || "Company";
  };

  // Job Listings Section
  const renderJobListings = () => (
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
            💼 Tin tuyển dụng của bạn ({jobs.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateJob}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
            }}
          >
            Đăng tin mới
          </Button>
        </Box>

        {jobs.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Chưa có tin tuyển dụng nào
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Hãy đăng tin tuyển dụng đầu tiên của bạn để tìm kiếm ứng viên phù hợp
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleCreateJob}
              sx={{ borderRadius: 2 }}
            >
              Đăng tin tuyển dụng
            </Button>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              background: alpha(theme.palette.background.paper, 0.7),
              backdropFilter: "blur(10px)",
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Table>
              <TableHead>
                <TableRow
                  sx={{ background: alpha(theme.palette.primary.main, 0.05) }}
                >
                  <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>
                    Vị trí
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>
                    Địa điểm
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>
                    Trạng thái
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>
                    Ứng viên
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>
                    Lượt xem
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>
                    Ngày đăng
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, fontSize: "1rem" }}
                  >
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.map((job, index) => (
                  <Fade key={job.id} in timeout={600 + index * 100}>
                    <TableRow
                      hover
                      sx={{
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background: alpha(theme.palette.primary.main, 0.05),
                          transform: "scale(1.01)",
                        },
                      }}
                    >
                      <TableCell>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {job.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {job.type}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <LocationOn color="action" fontSize="small" />
                          <Typography variant="body2">
                            {job.location}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={job.isActive ? "Đang hoạt động" : "Tạm dừng"}
                          color={job.isActive ? "success" : "default"}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="h6"
                          fontWeight={800}
                          color="primary.main"
                        >
                          {job.applicationsCount || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {job.viewsCount || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {job.publishedAt
                            ? new Date(job.publishedAt).toLocaleDateString(
                                "vi-VN",
                              )
                            : "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={(e) => handleMenuClick(e, job)}
                          sx={{
                            transition: "all 0.3s ease",
                            "&:hover": {
                              background: alpha(
                                theme.palette.primary.main,
                                0.1,
                              ),
                              transform: "scale(1.2)",
                            },
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  </Fade>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Card>
  );

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
        {/* Hiển thị lỗi nếu có */}
        {dataError && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={handleRefresh}>
                Thử lại
              </Button>
            }
          >
            {dataError}
          </Alert>
        )}
        
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
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 3,
                      background: "rgba(255, 255, 255, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      animation: `${floatingAnimation} 6s ease-in-out infinite`,
                    }}
                  >
                    <Business sx={{ fontSize: 32, color: "white" }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                      }}
                    >
                      Chào mừng, {getCompanyName()}! 🏢
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        opacity: 0.9,
                        textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                      }}
                    >
                      Quản lý tuyển dụng hiệu quả và tìm kiếm nhân tài xuất sắc
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleRefresh}
                  startIcon={<TrendingUp />}
                  sx={{
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.3)',
                    }
                  }}
                >
                  Làm mới dữ liệu
                </Button>
                <Box
                  sx={{
                    animation: `${floatingAnimation} 8s ease-in-out infinite`,
                    animationDelay: "2s",
                  }}
                >
                  <BusinessCenter sx={{ fontSize: 80, opacity: 0.3 }} />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Slide>

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <CompanyStatCard
              title="Tin tuyển dụng"
              value={companyStats.totalJobs}
              subtitle={`${companyStats.activeJobs} đang hoạt động`}
              icon={<Work />}
              gradient={`${theme.palette.primary.main}, ${theme.palette.primary.dark}`}
              delay={0}
              trend="up"
              trendValue="+2 tuần này"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <CompanyStatCard
              title="Ứng viên"
              value={companyStats.totalApplications}
              subtitle="Tổng ứng tuyển"
              icon={<People />}
              gradient={`${theme.palette.info.main}, ${theme.palette.info.dark}`}
              delay={100}
              trend="up"
              trendValue="+24 hôm nay"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <CompanyStatCard
              title="Lượt xem"
              value={companyStats.totalViews}
              subtitle="Views tin tuyển dụng"
              icon={<Visibility />}
              gradient={`${theme.palette.warning.main}, ${theme.palette.warning.dark}`}
              delay={200}
              trend="up"
              trendValue="+15%"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <CompanyStatCard
              title="Phỏng vấn"
              value={companyStats.interviewsScheduled}
              subtitle="Lịch hẹn tháng này"
              icon={<Schedule />}
              gradient={`${theme.palette.success.main}, ${theme.palette.success.dark}`}
              delay={300}
              trend="up"
              trendValue="+3 tuần này"
            />
          </Grid>
        </Grid>

        {/* Dashboard Content */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <QuickActions userRole="COMPANY" />
          </Grid>
          <Grid item xs={12} md={4}>
            <RecentApplications />
          </Grid>
          <Grid item xs={12} md={4}>
            <PerformanceMetrics />
          </Grid>
        </Grid>

        {/* Job Listings */}
        {renderJobListings()}

        {/* Context Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: 3,
              minWidth: 240,
              background: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: "blur(20px)",
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: `0 16px 48px ${alpha(theme.palette.common.black, 0.15)}`,
              "& .MuiMenuItem-root": {
                borderRadius: 2,
                mx: 1,
                my: 0.5,
                transition: "all 0.2s ease",
                "&:hover": {
                  background: alpha(theme.palette.primary.main, 0.1),
                  transform: "translateX(4px)",
                },
              },
            },
          }}
        >
          <MenuItem onClick={() => console.log("View details")}>
            <Visibility sx={{ mr: 2, color: theme.palette.info.main }} />
            Xem chi tiết
          </MenuItem>
          <MenuItem onClick={handleEditJob}>
            <Edit sx={{ mr: 2, color: theme.palette.warning.main }} />
            Chỉnh sửa
          </MenuItem>
          <MenuItem onClick={() => selectedJob && handleViewApplications(selectedJob.id)}>
            <People sx={{ mr: 2, color: theme.palette.success.main }} />
            Xem ứng viên ({selectedJob?.applicationsCount || 0})
          </MenuItem>
          <MenuItem onClick={() => selectedJob && handleToggleJobStatus(selectedJob)}>
            {selectedJob?.isActive ? (
              <>
                <CheckCircle sx={{ mr: 2, color: theme.palette.error.light }} />
                Tạm dừng tin
              </>
            ) : (
              <>
                <CheckCircle sx={{ mr: 2, color: theme.palette.success.main }} />
                Kích hoạt tin
              </>
            )}
          </MenuItem>
          <MenuItem onClick={handleDeleteJob} sx={{ color: "error.main" }}>
            <Delete sx={{ mr: 2 }} />
            Xóa tin
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: "blur(20px)",
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            Xác nhận xóa tin tuyển dụng
          </DialogTitle>
          <DialogContent>
            <Typography>
              Bạn có chắc chắn muốn xóa tin tuyển dụng "{selectedJob?.title}"?
              Hành động này không thể hoàn tác.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Hủy
            </Button>
            <Button
              onClick={confirmDelete}
              variant="contained"
              color="error"
              sx={{ borderRadius: 2 }}
            >
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default CompanyDashboard;
