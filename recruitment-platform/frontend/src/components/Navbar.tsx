import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "../contexts/LanguageContext";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  useTheme,
  alpha,
  Chip,
  Badge,
  Tooltip,
  Slide,
  Fade,
  keyframes,
  useScrollTrigger,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tabs,
  Tab,
  Stack,
  Skeleton,
  Button as MuiButton,
  Grow,
  Popper,
  Paper,
  ClickAwayListener,
} from "@mui/material";
import {
  AccountCircle,
  Logout,
  Dashboard,
  Work,
  Business,
  Settings,
  Home,
  Notifications,
  Search,
  Menu as MenuIcon,
  Bookmark,
  Person,
  Analytics,
  Rocket,
  Mail,
  Info,
  Warning,
  DoneAll,
  Delete,
  CheckCircle,
} from "@mui/icons-material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthDialog from "./AuthDialog";
import NotificationsMenu from "./NotificationsMenu";

// Modern animations
const slideInAnimation = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const pulseAnimation = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const glowAnimation = keyframes`
  0%, 100% { 
    box-shadow: 0 0 10px rgba(33, 150, 243, 0.3);
  }
  50% { 
    box-shadow: 0 0 20px rgba(33, 150, 243, 0.6),
                0 0 30px rgba(33, 150, 243, 0.4);
  }
`;

interface NavbarProps {
  user?: any;
  onLogout: () => void;
}

interface HideOnScrollProps {
  children: React.ReactElement;
}

function HideOnScroll({ children }: HideOnScrollProps) {
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authTabValue, setAuthTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  // Thêm state kiểm soát hiển thị Navbar theo hover trigger
  const [showNavbar, setShowNavbar] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogin = () => {
    setAuthTabValue(0);
    setAuthDialogOpen(true);
  };

  const handleRegister = () => {
    setAuthTabValue(1);
    setAuthDialogOpen(true);
  };

  const handleCloseAuth = () => {
    setAuthDialogOpen(false);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  const handleNavigation = (path: string) => {
    handleClose();
    navigate(path);
  };

  const getUserDisplayName = () => {
    if (!user) return "";
    return user.fullName || user.companyName || user.name || "User";
  };

  const getUserRole = () => {
    if (!user) return "";
    const roleLabels = {
      STUDENT: t('student'),
      COMPANY: t('company'),
      ADMIN: t('admin'),
    };
    return roleLabels[user.role as keyof typeof roleLabels] || user.role;
  };

  const getNavItems = () => {
    if (!user) return [];

    const baseItems = [
      {
        icon: <Home />,
        label: t('dashboard'),
        path:
          user.role === "STUDENT"
            ? "/student-dashboard"
            : user.role === "COMPANY"
              ? "/company-dashboard"
              : "/admin-dashboard",
        isActive: location.pathname.includes("dashboard"),
      },
    ];

    if (user.role === "STUDENT") {
      baseItems.push(
        {
          icon: <Work />,
          label: t('jobs'),
          path: "/jobs",
          isActive: location.pathname === "/jobs",
        },
        {
          icon: <Business />,
          label: t('companies'),
          path: "/companies",
          isActive: location.pathname === "/companies",
        },
        {
          icon: <Bookmark />,
          label: t('savedJobs'),
          path: "/saved-jobs",
          isActive: location.pathname === "/saved-jobs",
        }
      );
    } else if (user.role === "COMPANY") {
      baseItems.push(
        {
          icon: <Work />,
          label: t('jobs'),
          path: "/jobs",
          isActive: location.pathname === "/jobs",
        },
        {
          icon: <Person />,
          label: t('candidates'),
          path: "/candidates",
          isActive: location.pathname === "/candidates",
        },
        {
          icon: <Analytics />,
          label: t('analytics'),
          path: "/analytics",
          isActive: location.pathname === "/analytics",
        }
      );
    } else if (user.role === "ADMIN") {
      baseItems.push(
        {
          icon: <Person />,
          label: t('candidates'),
          path: "/candidates",
          isActive: location.pathname === "/candidates",
        },
        {
          icon: <Business />,
          label: t('companies'),
          path: "/companies",
          isActive: location.pathname === "/companies",
        },
        {
          icon: <Work />,
          label: t('jobs'),
          path: "/jobs",
          isActive: location.pathname === "/jobs",
        },
        {
          icon: <Analytics />,
          label: t('analytics'),
          path: "/analytics",
          isActive: location.pathname === "/analytics",
        }
      );
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Thêm vùng trigger ở đầu trang */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: 40,
          zIndex: 1300,
          pointerEvents: 'auto',
          background: 'transparent',
        }}
        onMouseEnter={() => setShowNavbar(true)}
        onMouseLeave={() => setShowNavbar(false)}
      />

      <Slide in={showNavbar} direction="down" timeout={400}>
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            background: isScrolled
              ? `linear-gradient(135deg, 
                  ${alpha(theme.palette.background.paper, 0.95)} 0%, 
                  ${alpha(theme.palette.background.paper, 0.9)} 100%)`
              : `linear-gradient(135deg, 
                  ${alpha(theme.palette.background.paper, 0.85)} 0%, 
                  ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            color: theme.palette.text.primary,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            animation: `${slideInAnimation} 0.8s ease-out`,
            boxShadow: isScrolled
              ? `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`
              : `0 2px 12px ${alpha(theme.palette.common.black, 0.05)}`,
            opacity: showNavbar ? 1 : 0,
            pointerEvents: showNavbar ? 'auto' : 'none',
            transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)',
          }}
          onMouseEnter={() => setShowNavbar(true)}
          onMouseLeave={() => setShowNavbar(false)}
        >
          <Toolbar sx={{ px: { xs: 2, md: 4 }, py: 1 }}>
            {/* Logo Section */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexGrow: 0,
                cursor: "pointer",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
              onClick={() => navigate("/")}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 2,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  animation: `${pulseAnimation} 4s ease-in-out infinite`,
                }}
              >
                <Rocket sx={{ color: "white", fontSize: 24 }} />
              </Box>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: { xs: "1rem", md: "1.25rem" },
                  display: { xs: "none", sm: "block" },
                }}
              >
                Recruitment Platform
              </Typography>
            </Box>

            {/* Navigation Items */}
            <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
              <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
                {navItems.map((item, index) => (
                  <Fade key={item.path} in timeout={600 + index * 100}>
                    <Button
                      startIcon={item.icon}
                      onClick={() => navigate(item.path)}
                      sx={{
                        color: item.isActive
                          ? theme.palette.primary.main
                          : theme.palette.text.secondary,
                        fontWeight: item.isActive ? 700 : 500,
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        textTransform: "none",
                        position: "relative",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        background: item.isActive
                          ? alpha(theme.palette.primary.main, 0.1)
                          : "transparent",
                        border: item.isActive
                          ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                          : "1px solid transparent",
                        "&:hover": {
                          background: alpha(theme.palette.primary.main, 0.08),
                          transform: "translateY(-1px)",
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      {item.label}
                    </Button>
                  </Fade>
                ))}
              </Box>
            </Box>

            {/* Right Section */}
            <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end" }}>
              {user ? (
                <>
                  {/* Notifications Menu */}
                  <NotificationsMenu />

                  {/* User Menu */}
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Tooltip title={getUserDisplayName()}>
                      <IconButton
                        size="large"
                        aria-label={t('accountMenu')}
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleMenu}
                        color="inherit"
                        sx={{
                          ml: 1,
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        <Avatar
                          alt={getUserDisplayName()}
                          src={user.avatar || undefined}
                          sx={{
                            width: 40,
                            height: 40,
                            border: `2px solid ${theme.palette.primary.main}`,
                            boxShadow: `0 0 10px ${alpha(
                              theme.palette.primary.main,
                              0.5
                            )}`,
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </>
              ) : (
                <>
                  <Button
                    color="inherit"
                    onClick={handleLogin}
                    sx={{
                      fontWeight: 600,
                      mr: 1,
                      borderRadius: 2,
                      px: 2,
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.common.white, 0.15),
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    {t('login')}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleRegister}
                    sx={{
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 2,
                      boxShadow: theme.shadows[4],
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: theme.shadows[6],
                      },
                    }}
                  >
                    {t('register')}
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </AppBar>
      </Slide>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 3,
            minWidth: 280,
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
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* User Info */}
        <Box
          sx={{
            px: 2,
            py: 2,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700}>
            {getUserDisplayName()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
          <Chip
            label={getUserRole()}
            size="small"
            color="primary"
            sx={{ mt: 1, fontWeight: 600 }}
          />
        </Box>

        {/* Menu Items */}
        <MenuItem
          onClick={() => handleNavigation(user.role === "STUDENT" ? "/student-profile" : user.role === "COMPANY" ? "/company-profile" : "/admin-profile")}
        >
          <Person sx={{ mr: 2 }} />
          {t('profile')}
        </MenuItem>
        <MenuItem
          onClick={() => handleNavigation("/settings")}
        >
          <Settings sx={{ mr: 2 }} />
          {t('settings')}
        </MenuItem>
        <MenuItem
          onClick={handleLogout}
          sx={{
            color: theme.palette.error.main,
            "&:hover": {
              background: alpha(theme.palette.error.main, 0.1),
            },
          }}
        >
          <Logout sx={{ mr: 2 }} />
          Đăng xuất
        </MenuItem>
      </Menu>

      {/* Auth Dialog */}
      <AuthDialog
        open={authDialogOpen}
        onClose={handleCloseAuth}
        initialTab={authTabValue}
      />
    </>
  );
};

export default Navbar;
