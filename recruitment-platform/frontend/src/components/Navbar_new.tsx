import React, { useState } from 'react';
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
  alpha
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  Dashboard,
  Work,
  Business,
  Settings,
  Home
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import AuthDialog from './AuthDialog';

interface NavbarProps {
  user?: any;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authTabValue, setAuthTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

  const handleLogout = () => {
    handleClose();
    onLogout();
    navigate('/');
  };

  const getDashboardRoute = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'STUDENT':
        return '/student-dashboard';
      case 'COMPANY':
        return '/company-dashboard';
      case 'ADMIN':
        return '/admin-dashboard';
      default:
        return '/';
    }
  };

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            🚀 Recruitment Platform
          </Typography>

          {!user ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                color="inherit" 
                onClick={handleLogin}
                sx={{ 
                  '&:hover': { 
                    bgcolor: alpha('#ffffff', 0.1) 
                  } 
                }}
              >
                Đăng nhập
              </Button>
              <Button 
                variant="outlined" 
                color="inherit"
                onClick={handleRegister}
                sx={{ 
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: alpha('#ffffff', 0.1)
                  }
                }}
              >
                Đăng ký
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Navigation Links */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                <Button
                  color="inherit"
                  startIcon={<Home />}
                  component={Link}
                  to={getDashboardRoute()}
                  sx={{ '&:hover': { bgcolor: alpha('#ffffff', 0.1) } }}
                >
                  Dashboard
                </Button>
                {user.role === 'STUDENT' && (
                  <></>
                )}
                {user.role === 'COMPANY' && (
                  <Button
                    color="inherit"
                    startIcon={<Business />}
                    component={Link}
                    to="/candidates"
                    sx={{ '&:hover': { bgcolor: alpha('#ffffff', 0.1) } }}
                  >
                    Ứng viên
                  </Button>
                )}
              </Box>

              {/* User Menu */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  {user.role === 'STUDENT' 
                    ? `${user.studentProfile?.firstName} ${user.studentProfile?.lastName}`
                    : user.role === 'COMPANY'
                    ? user.companyProfile?.companyName
                    : user.email
                  }
                </Typography>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: alpha('#ffffff', 0.2) }}>
                    <AccountCircle />
                  </Avatar>
                </IconButton>
              </Box>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* User Dropdown Menu */}
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => { handleClose(); navigate(getDashboardRoute()); }}>
          <Dashboard sx={{ mr: 1 }} />
          Dashboard
        </MenuItem>
        
        {user?.role === 'STUDENT' && (
          <MenuItem onClick={handleClose}>
            <Work sx={{ mr: 1 }} />
            Ứng tuyển của tôi
          </MenuItem>
        )}
        
        {user?.role === 'COMPANY' && (
          <MenuItem onClick={handleClose}>
            <Business sx={{ mr: 1 }} />
            Quản lý tin tuyển dụng
          </MenuItem>
        )}
        
        <MenuItem onClick={handleClose}>
          <Settings sx={{ mr: 1 }} />
          Cài đặt
        </MenuItem>
        
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 1 }} />
          Đăng xuất
        </MenuItem>
      </Menu>

      <AuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        initialTab={authTabValue}
      />
    </>
  );
};

export default Navbar;
