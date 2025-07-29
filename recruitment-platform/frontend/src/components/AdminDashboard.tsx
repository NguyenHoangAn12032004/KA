import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  LinearProgress,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Grid,
  useTheme,
  alpha,
  keyframes,
  Tooltip,
  Zoom,
  Fade,
  Slide,
  Badge,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
} from "@mui/material";
import {
  Dashboard,
  People,
  Business,
  Work,
  TrendingUp,
  TrendingDown,
  MoreVert,
  Add,
  Edit,
  Delete,
  Visibility,
  Block,
  Check,
  Warning,
  Analytics,
  Assessment,
  Group,
  MonetizationOn,
  Schedule,
  NotificationsActive,
  Security,
  Speed,
  Insights,
  CampaignRounded,
  DataUsage,
  AccountBalance,
  StarRate,
  Timeline,
  AutoGraph,
  Psychology,
  Rocket,
  FlashOn,
  LocalFireDepartment,
  EmojiEvents,
  Brightness4,
  Brightness7,
  FilterVintage,
  Waves,
  Send,
} from "@mui/icons-material";
import { jobsAPI, analyticsAPI, adminUsersAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// Modern animations keyframes
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

// Interfaces
interface DashboardStats {
  totalUsers: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  activeJobs: number;
  pendingApplications: number;
  usersGrowth: number;
  jobsGrowth: number;
  studentCount: number;
  companyCount: number;
  adminCount: number;
  weeklyStats: {
    newRegistrations: number;
    newJobs: number;
    newApplications: number;
    blockedAccounts: number;
  };
}

interface User {
  id: string;
  email: string;
  role: "ADMIN" | "STUDENT" | "COMPANY";
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  isActive?: boolean;
  createdAt: string;
  lastLogin?: string;
  studentProfile?: {
    firstName: string;
    lastName: string;
  };
  companyProfile?: {
    companyName: string;
  };
}

interface JobPost {
  id: string;
  title: string;
  company: string;
  status: "ACTIVE" | "PAUSED" | "CLOSED";
  applicants: number;
  createdAt: string;
  deadline?: string;
}

// Modern Stat Card Component
const ModernStatCard: React.FC<{
  title: string;
  value: number | string;
  growth?: number;
  icon: React.ReactElement;
  gradient: string;
  delay?: number;
}> = ({ title, value, growth, icon, gradient, delay = 0 }) => {
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
                  mb: 2,
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
              {growth !== undefined && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {growth >= 0 ? (
                    <TrendingUp sx={{ color: "#4ade80", fontSize: 18 }} />
                  ) : (
                    <TrendingDown sx={{ color: "#f87171", fontSize: 18 }} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: growth >= 0 ? "#4ade80" : "#f87171",
                      fontWeight: 700,
                      textShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    }}
                  >
                    {growth >= 0 ? "+" : ""}
                    {growth}%
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

// Activity Timeline Component
const ActivityTimeline: React.FC<{ stats: DashboardStats }> = ({ stats }) => {
  const theme = useTheme();

  const activities = [
    {
      label: "Đăng ký mới",
      value: stats.weeklyStats.newRegistrations,
      icon: <Group />,
      color: theme.palette.success.main,
      trend: "+12%",
    },
    {
      label: "Tin tuyển dụng",
      value: stats.weeklyStats.newJobs,
      icon: <Work />,
      color: theme.palette.info.main,
      trend: "+8%",
    },
    {
      label: "Ứng tuyển",
      value: stats.weeklyStats.newApplications,
      icon: <Send />,
      color: theme.palette.warning.main,
      trend: "+24%",
    },
    {
      label: "Tài khoản khóa",
      value: stats.weeklyStats.blockedAccounts,
      icon: <Block />,
      color: theme.palette.error.main,
      trend: "-5%",
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
          Hoạt động tuần này
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {activities.map((activity, index) => (
            <Fade key={index} in timeout={600 + index * 100}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: alpha(activity.color, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  {React.cloneElement(activity.icon, {
                    sx: { color: activity.color },
                  })}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight={600}>
                    {activity.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Xu hướng {activity.trend}
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ color: activity.color }}
                >
                  {activity.value}
                </Typography>
              </Box>
            </Fade>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

// Chart Component (Mock)
const ModernChart: React.FC<{ title: string; stats: DashboardStats }> = ({
  title,
  stats,
}) => {
  const theme = useTheme();

  const data = [
    {
      label: "Sinh viên",
      value: stats.studentCount,
      color: theme.palette.primary.main,
    },
    {
      label: "Công ty",
      value: stats.companyCount,
      color: theme.palette.secondary.main,
    },
    {
      label: "Admin",
      value: stats.adminCount,
      color: theme.palette.warning.main,
    },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.paper, 0.9)} 0%, 
          ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
        backdropFilter: "blur(20px)",
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Typography
          variant="h6"
          sx={{
            mb: 4,
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {title}
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <Fade key={index} in timeout={800 + index * 200}>
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body1" fontWeight={600}>
                      {item.label}
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={700}
                      sx={{ color: item.color }}
                    >
                      {item.value} ({percentage.toFixed(1)}%)
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: "100%",
                      height: 8,
                      borderRadius: 4,
                      background: alpha(item.color, 0.1),
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${percentage}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${item.color}, ${alpha(item.color, 0.8)})`,
                        borderRadius: 4,
                        transition: "width 1.5s ease-out",
                        animation: `${shimmerAnimation} 2s ease-in-out infinite`,
                        backgroundSize: "200% 100%",
                      }}
                    />
                  </Box>
                </Box>
              </Fade>
            );
          })}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ color: theme.palette.primary.main }}
          >
            {total.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tổng người dùng
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Quick Actions Component
const QuickActions: React.FC = () => {
  const theme = useTheme();

  const actions = [
    { label: "Thêm User", icon: <Add />, color: theme.palette.primary.main },
    { label: "Báo cáo", icon: <Assessment />, color: theme.palette.info.main },
    {
      label: "Thông báo",
      icon: <NotificationsActive />,
      color: theme.palette.warning.main,
    },
    { label: "Bảo mật", icon: <Security />, color: theme.palette.error.main },
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
            <Grid item xs={6} key={index}>
              <Zoom in timeout={600 + index * 100}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={action.icon}
                  sx={{
                    py: 2,
                    borderColor: alpha(action.color, 0.3),
                    color: action.color,
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    background: alpha(action.color, 0.05),
                    "&:hover": {
                      borderColor: action.color,
                      background: alpha(action.color, 0.1),
                      transform: "translateY(-2px)",
                      boxShadow: `0 8px 20px ${alpha(action.color, 0.3)}`,
                    },
                  }}
                >
                  {action.label}
                </Button>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"user" | "job" | "company">(
    "user",
  );
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Load data from API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (forceRefresh = false) => {
    try {
      setLoading(true);

      if (forceRefresh) {
        console.log("🔄 Force refreshing admin dashboard data...");
      }

      // Load dashboard statistics
      const [statsResponse, jobsResponse, usersResponse] = await Promise.all([
        analyticsAPI.getDashboardStats(),
        jobsAPI.getAll(),
        adminUsersAPI.getAll(),
      ]);

      console.log("📊 Loaded users from API:", usersResponse.data.length);

      // Set real statistics from database
      setStats(statsResponse.data);

      // Format jobs data
      const formattedJobs = jobsResponse.data.jobs.map((job: any) => ({
        id: job.id,
        title: job.title,
        company: job.company?.companyName || "Unknown Company",
        status: job.isActive ? "ACTIVE" : "INACTIVE",
        applicants: job._aggr_count_applications || 0,
        createdAt: job.publishedAt
          ? new Date(job.publishedAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        deadline: job.applicationDeadline
          ? new Date(job.applicationDeadline).toISOString().split("T")[0]
          : null,
      }));
      setJobs(formattedJobs);

      // Format users data from recent activities
      const formattedUsers = usersResponse.data.map((user: any) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.isActive ? "ACTIVE" : "SUSPENDED",
        isActive: user.isActive,
        createdAt: new Date(user.createdAt).toISOString().split("T")[0],
        lastLogin: user.lastLogin
          ? new Date(user.lastLogin).toISOString().split("T")[0]
          : null,
        studentProfile: user.studentProfile
          ? {
              firstName: user.studentProfile.firstName,
              lastName: user.studentProfile.lastName,
            }
          : null,
        companyProfile: user.companyProfile
          ? {
              companyName: user.companyProfile.companyName,
            }
          : null,
      }));
      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error loading data:", error);
      // Fallback to minimal real data structure
      setStats({
        totalUsers: 0,
        totalCompanies: 0,
        totalJobs: 0,
        totalApplications: 0,
        activeJobs: 0,
        pendingApplications: 0,
        usersGrowth: 0,
        jobsGrowth: 0,
        studentCount: 0,
        companyCount: 0,
        adminCount: 0,
        weeklyStats: {
          newRegistrations: 0,
          newJobs: 0,
          newApplications: 0,
          blockedAccounts: 0,
        },
      });
      setUsers([]);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    itemId: string,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(itemId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleViewDetails = async (userId: string) => {
    try {
      console.log("Viewing user details:", userId);
      const response = await adminUsersAPI.getById(userId);
      console.log("User details:", response);

      setSelectedUser(response.data);
      setUserDetailOpen(true);
      handleMenuClose();
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Không thể lấy thông tin người dùng. Vui lòng thử lại sau.");
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      console.log("Changing user status:", userId, "to", newStatus);
      const isActive = newStatus === "ACTIVE";
      await adminUsersAPI.updateStatus(userId, isActive);

      await loadData();
      handleMenuClose();

      const message = `Tài khoản đã được ${newStatus === "ACTIVE" ? "kích hoạt" : "khóa"} thành công!`;
      toast.success(message);
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Không thể cập nhật trạng thái người dùng. Vui lòng thử lại sau.");
      throw error;
    }
  };

  const handleEdit = async (userId: string) => {
    try {
      console.log("Editing user:", userId);
      const response = await adminUsersAPI.getById(userId);
      console.log("User data for editing:", response);

      const userWithMappedStatus = {
        ...response.data,
        status: response.data.isActive ? "ACTIVE" : "SUSPENDED",
        isActive: response.data.isActive,
      };

      setSelectedUser(userWithMappedStatus);
      setEditUserOpen(true);
      handleMenuClose();
    } catch (error) {
      console.error("Error fetching user for edit:", error);
      toast.error("Không thể lấy thông tin người dùng để chỉnh sửa. Vui lòng thử lại sau.");
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      console.log("Deleting user:", userId);
      const confirmDelete = window.confirm(
        "Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.",
      );

      if (!confirmDelete) {
        handleMenuClose();
        return;
      }

      await adminUsersAPI.delete(userId);

      await loadData(true);
      handleMenuClose();
      toast.success("Đã xóa người dùng thành công!");
    } catch (error: any) {
      console.error("Error deleting user:", error);

      let errorMessage = "Không thể xóa người dùng. Vui lòng thử lại sau.";

      if (error?.response?.status === 404) {
        errorMessage = "Không tìm thấy người dùng. Có thể đã bị xóa trước đó. Đang làm mới danh sách...";
        await loadData(true);
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
      handleMenuClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "SUSPENDED":
        return "error";
      case "PENDING":
        return "warning";
      case "PAUSED":
        return "warning";
      case "CLOSED":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Hoạt động";
      case "SUSPENDED":
        return "Tạm khóa";
      case "PENDING":
        return "Chờ duyệt";
      case "PAUSED":
        return "Tạm dừng";
      case "CLOSED":
        return "Đã đóng";
      default:
        return status;
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
            Đang tải dữ liệu...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!stats) return null;

  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: "100vh",
        background: `
          linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.05)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.05)} 50%,
            ${alpha(theme.palette.warning.main, 0.05)} 100%),
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
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 3,
                      background: "rgba(255, 255, 255, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      animation: `${floatingAnimation} 6s ease-in-out infinite`,
                    }}
                  >
                    <Rocket sx={{ fontSize: 32, color: "white" }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                      }}
                    >
                      Admin Dashboard
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        opacity: 0.9,
                        textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                      }}
                    >
                      Quản lý toàn diện hệ thống recruitment platform ✨
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Tooltip title="Chế độ tối">
                  <IconButton
                    onClick={() => setDarkMode(!darkMode)}
                    sx={{
                      color: "white",
                      background: "rgba(255, 255, 255, 0.1)",
                      "&:hover": {
                        background: "rgba(255, 255, 255, 0.2)",
                        transform: "scale(1.1)",
                      },
                    }}
                  >
                    {darkMode ? <Brightness7 /> : <Brightness4 />}
                  </IconButton>
                </Tooltip>
                <Box
                  sx={{
                    animation: `${floatingAnimation} 8s ease-in-out infinite`,
                    animationDelay: "2s",
                  }}
                >
                  <Dashboard sx={{ fontSize: 80, opacity: 0.3 }} />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Slide>

        {/* Modern Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <ModernStatCard
              title="Tổng người dùng"
              value={stats.totalUsers}
              growth={stats.usersGrowth}
              icon={<People />}
              gradient={`${theme.palette.primary.main}, ${theme.palette.primary.dark}`}
              delay={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ModernStatCard
              title="Doanh nghiệp"
              value={stats.totalCompanies}
              growth={5.2}
              icon={<Business />}
              gradient={`${theme.palette.info.main}, ${theme.palette.info.dark}`}
              delay={100}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ModernStatCard
              title="Việc làm"
              value={stats.totalJobs}
              growth={stats.jobsGrowth}
              icon={<Work />}
              gradient={`${theme.palette.warning.main}, ${theme.palette.warning.dark}`}
              delay={200}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ModernStatCard
              title="Ứng tuyển"
              value={stats.totalApplications}
              growth={24.8}
              icon={<Assessment />}
              gradient={`${theme.palette.success.main}, ${theme.palette.success.dark}`}
              delay={300}
            />
          </Grid>
        </Grid>

        {/* Analytics Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <ActivityTimeline stats={stats} />
          </Grid>
          <Grid item xs={12} md={6}>
            <ModernChart title="Phân bố người dùng" stats={stats} />
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <QuickActions />
          </Grid>
          <Grid item xs={12} md={8}>
            <Card
              sx={{
                background: `linear-gradient(135deg, 
                  ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                  ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
                backdropFilter: "blur(20px)",
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 3,
                p: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Thông báo hệ thống
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Alert severity="success" icon={<EmojiEvents />}>
                  <strong>Tuyệt vời!</strong> Hệ thống đang hoạt động ổn định
                  với {stats.totalUsers} người dùng
                </Alert>
                <Alert severity="info" icon={<Timeline />}>
                  <strong>Thống kê:</strong>{" "}
                  {stats.weeklyStats.newRegistrations} đăng ký mới trong tuần
                  này
                </Alert>
                <Alert severity="warning" icon={<LocalFireDepartment />}>
                  <strong>Cần chú ý:</strong> {stats.pendingApplications} ứng
                  tuyển đang chờ xử lý
                </Alert>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Management Tabs - Enhanced */}
        <Paper
          sx={{
            width: "100%",
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
              <Tab label="🧑‍💼 Quản lý người dùng" />
              <Tab label="💼 Quản lý việc làm" />
              <Tab label="📊 Báo cáo & Thống kê" />
            </Tabs>
          </Box>

          {/* Users Management - Enhanced */}
          {tabValue === 0 && (
            <Box sx={{ p: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 4,
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
                  Danh sách người dùng ({users.length})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
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
                  Thêm người dùng
                </Button>
              </Box>

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
                      sx={{
                        background: alpha(theme.palette.primary.main, 0.05),
                      }}
                    >
                      <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>
                        Người dùng
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>
                        Email
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>
                        Vai trò
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>
                        Trạng thái
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>
                        Đăng ký
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>
                        Đăng nhập cuối
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
                    {users.map((user, index) => (
                      <Fade key={user.id} in timeout={600 + index * 100}>
                        <TableRow
                          hover
                          sx={{
                            transition: "all 0.3s ease",
                            "&:hover": {
                              background: alpha(
                                theme.palette.primary.main,
                                0.05,
                              ),
                              transform: "scale(1.01)",
                            },
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Avatar
                                sx={{
                                  mr: 2,
                                  width: 48,
                                  height: 48,
                                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                                }}
                              >
                                {user.studentProfile
                                  ? user.studentProfile.firstName.charAt(0)
                                  : user.companyProfile
                                    ? user.companyProfile.companyName.charAt(0)
                                    : user.email.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="subtitle1"
                                  fontWeight={600}
                                >
                                  {user.studentProfile
                                    ? `${user.studentProfile.firstName} ${user.studentProfile.lastName}`
                                    : user.companyProfile?.companyName ||
                                      "Admin User"}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  ID: {user.id.slice(0, 8)}...
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {user.email}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.role}
                              size="small"
                              color={
                                user.role === "ADMIN"
                                  ? "error"
                                  : user.role === "COMPANY"
                                    ? "info"
                                    : "default"
                              }
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(user.status)}
                              color={getStatusColor(user.status) as any}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(user.createdAt).toLocaleDateString(
                                "vi-VN",
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {user.lastLogin
                                ? new Date(user.lastLogin).toLocaleDateString(
                                    "vi-VN",
                                  )
                                : "Chưa đăng nhập"}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              onClick={(e) => handleMenuClick(e, user.id)}
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
            </Box>
          )}

          {/* Jobs Management - Enhanced */}
          {tabValue === 1 && (
            <Box sx={{ p: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 4,
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
                  Quản lý tin tuyển dụng ({jobs.length})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Analytics />}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.3)}`,
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 8px 24px ${alpha(theme.palette.info.main, 0.4)}`,
                    },
                  }}
                >
                  Xem báo cáo
                </Button>
              </Box>

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
                      sx={{ background: alpha(theme.palette.info.main, 0.05) }}
                    >
                      <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>
                        Tiêu đề
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>
                        Công ty
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>
                        Trạng thái
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>
                        Ứng viên
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>
                        Đăng
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>
                        Hạn nộp
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
                              background: alpha(theme.palette.info.main, 0.05),
                              transform: "scale(1.01)",
                            },
                          }}
                        >
                          <TableCell>
                            <Typography variant="subtitle1" fontWeight={700}>
                              {job.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {job.company}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(job.status)}
                              color={getStatusColor(job.status) as any}
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
                              {job.applicants}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(job.createdAt).toLocaleDateString(
                                "vi-VN",
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {job.deadline
                                ? new Date(job.deadline).toLocaleDateString(
                                    "vi-VN",
                                  )
                                : "Không có"}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              onClick={(e) => handleMenuClick(e, job.id)}
                              sx={{
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  background: alpha(
                                    theme.palette.info.main,
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
            </Box>
          )}

          {/* Analytics - Enhanced */}
          {tabValue === 2 && (
            <Box sx={{ p: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                📊 Báo cáo & Thống kê chi tiết
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <ModernChart
                    title="Phân bố chi tiết người dùng"
                    stats={stats}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <ActivityTimeline stats={stats} />
                </Grid>
                <Grid item xs={12}>
                  <Card
                    sx={{
                      background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                        ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
                      backdropFilter: "blur(20px)",
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      borderRadius: 3,
                      p: 4,
                    }}
                  >
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
                      Hiệu suất hệ thống
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: "center" }}>
                          <AutoGraph
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
                            98.5%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Uptime
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: "center" }}>
                          <Speed
                            sx={{
                              fontSize: 48,
                              color: theme.palette.info.main,
                              mb: 1,
                            }}
                          />
                          <Typography
                            variant="h4"
                            fontWeight={800}
                            color="info.main"
                          >
                            1.2s
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Avg Response
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: "center" }}>
                          <DataUsage
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
                            87%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Data Usage
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ textAlign: "center" }}>
                          <Security
                            sx={{
                              fontSize: 48,
                              color: theme.palette.error.main,
                              mb: 1,
                            }}
                          />
                          <Typography
                            variant="h4"
                            fontWeight={800}
                            color="error.main"
                          >
                            100%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Security Score
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>

        {/* Context Menu - Enhanced */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
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
          <MenuItem onClick={() => handleViewDetails(selectedItem!)}>
            <Visibility sx={{ mr: 2, color: theme.palette.info.main }} />
            Xem chi tiết
          </MenuItem>
          <MenuItem onClick={() => handleEdit(selectedItem!)}>
            <Edit sx={{ mr: 2, color: theme.palette.warning.main }} />
            Chỉnh sửa
          </MenuItem>
          {tabValue === 0 && [
            <MenuItem
              key="suspend"
              onClick={() => handleStatusChange(selectedItem!, "SUSPENDED")}
            >
              <Block sx={{ mr: 2, color: theme.palette.error.main }} />
              Khóa tài khoản
            </MenuItem>,
            <MenuItem
              key="activate"
              onClick={() => handleStatusChange(selectedItem!, "ACTIVE")}
            >
              <Check sx={{ mr: 2, color: theme.palette.success.main }} />
              Kích hoạt
            </MenuItem>,
          ]}
          <MenuItem
            onClick={() => handleDelete(selectedItem!)}
            sx={{ color: "error.main" }}
          >
            <Delete sx={{ mr: 2 }} />
            Xóa
          </MenuItem>
        </Menu>

        {/* User Detail Dialog - Enhanced */}
        <Dialog
          open={userDetailOpen}
          onClose={() => setUserDetailOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: "blur(20px)",
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            },
          }}
        >
          <DialogTitle
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
              fontWeight: 700,
              fontSize: "1.5rem",
            }}
          >
            Chi tiết người dùng
          </DialogTitle>
          <DialogContent>
            {selectedUser && (
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      fontWeight={600}
                    >
                      Email
                    </Typography>
                    <Typography variant="body1" gutterBottom fontWeight={500}>
                      {selectedUser.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      fontWeight={600}
                    >
                      Vai trò
                    </Typography>
                    <Chip
                      label={selectedUser.role}
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      fontWeight={600}
                    >
                      Trạng thái
                    </Typography>
                    <Chip
                      label={getStatusLabel(selectedUser.status)}
                      color={getStatusColor(selectedUser.status) as any}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      fontWeight={600}
                    >
                      Ngày đăng ký
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {new Date(selectedUser.createdAt).toLocaleDateString(
                        "vi-VN",
                      )}
                    </Typography>
                  </Grid>
                  {selectedUser.studentProfile && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="subtitle2"
                          color="textSecondary"
                          fontWeight={600}
                        >
                          Họ
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedUser.studentProfile.lastName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="subtitle2"
                          color="textSecondary"
                          fontWeight={600}
                        >
                          Tên
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedUser.studentProfile.firstName}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  {selectedUser.companyProfile && (
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        color="textSecondary"
                        fontWeight={600}
                      >
                        Tên công ty
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedUser.companyProfile.companyName}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setUserDetailOpen(false)}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit User Dialog - Enhanced */}
        <Dialog
          open={editUserOpen}
          onClose={() => setEditUserOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: "blur(20px)",
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            },
          }}
        >
          <DialogTitle
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.light, 0.1)})`,
              fontWeight: 700,
              fontSize: "1.5rem",
            }}
          >
            Chỉnh sửa người dùng
          </DialogTitle>
          <DialogContent>
            {selectedUser && (
              <Box sx={{ pt: 2 }}>
                <Alert
                  severity="info"
                  sx={{ mb: 3, borderRadius: 2 }}
                  icon={<Psychology />}
                >
                  Bạn có thể thay đổi trạng thái tài khoản của người dùng.
                </Alert>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <TextField
                    label="Email"
                    value={selectedUser.email}
                    fullWidth
                    disabled
                    helperText="Email không thể thay đổi"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                  <TextField
                    label="Vai trò"
                    value={selectedUser.role}
                    fullWidth
                    disabled
                    helperText="Vai trò không thể thay đổi"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                  <Box>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      fontWeight={600}
                    >
                      Trạng thái hiện tại:
                    </Typography>
                    <Chip
                      label={getStatusLabel(selectedUser.status)}
                      color={getStatusColor(selectedUser.status) as any}
                      size="medium"
                      sx={{ fontWeight: 600, mb: 1 }}
                    />
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ color: "text.secondary" }}
                    >
                      Trạng thái: {selectedUser.status} (isActive:{" "}
                      {selectedUser.isActive ? "true" : "false"})
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button
              onClick={() => setEditUserOpen(false)}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              color="warning"
              sx={{
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
              }}
              onClick={async () => {
                if (selectedUser) {
                  const newStatus =
                    selectedUser.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
                  try {
                    await handleStatusChange(selectedUser.id, newStatus);
                    setEditUserOpen(false);
                  } catch (error) {
                    console.error("Failed to change status:", error);
                  }
                }
              }}
            >
              {selectedUser?.status === "ACTIVE"
                ? "🔒 Khóa tài khoản"
                : "✅ Kích hoạt tài khoản"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
