import React, { useState, useEffect } from 'react';
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
  Alert
} from '@mui/material';
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
  Assessment
} from '@mui/icons-material';
import { jobsAPI, analyticsAPI, adminUsersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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
  role: 'ADMIN' | 'STUDENT' | 'COMPANY';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  isActive?: boolean; // Add this field for API compatibility
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
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED';
  applicants: number;
  createdAt: string;
  deadline?: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'user' | 'job' | 'company'>('user');
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Load data from API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      if (forceRefresh) {
        console.log('🔄 Force refreshing admin dashboard data...');
      }
      
      // Load dashboard statistics
      const [statsResponse, jobsResponse, usersResponse] = await Promise.all([
        analyticsAPI.getDashboardStats(),
        jobsAPI.getAll(),
        adminUsersAPI.getAll() // Use proper users API instead of recent activities
      ]);
      
      console.log('📊 Loaded users from API:', usersResponse.data.length);
      
      // Set real statistics from database
      setStats(statsResponse.data);
      
      // Format jobs data
      const formattedJobs = jobsResponse.data.jobs.map((job: any) => ({
        id: job.id,
        title: job.title,
        company: job.company?.companyName || 'Unknown Company',
        status: job.isActive ? 'ACTIVE' : 'INACTIVE',
        applicants: job._aggr_count_applications || 0,
        createdAt: job.publishedAt ? new Date(job.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        deadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : null
      }));
      setJobs(formattedJobs);
      
      // Format users data from recent activities
      const formattedUsers = usersResponse.data.map((user: any) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.isActive ? 'ACTIVE' : 'SUSPENDED', // Use actual status from database
        isActive: user.isActive, // Keep original isActive for debugging
        createdAt: new Date(user.createdAt).toISOString().split('T')[0],
        lastLogin: user.lastLogin ? new Date(user.lastLogin).toISOString().split('T')[0] : null,
        studentProfile: user.studentProfile ? {
          firstName: user.studentProfile.firstName,
          lastName: user.studentProfile.lastName
        } : null,
        companyProfile: user.companyProfile ? {
          companyName: user.companyProfile.companyName
        } : null
      }));
      setUsers(formattedUsers);
      
    } catch (error) {
      console.error('Error loading data:', error);
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
          blockedAccounts: 0
        }
      });
      setUsers([]);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, itemId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(itemId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleViewDetails = async (userId: string) => {
    try {
      console.log('Viewing user details:', userId);
      const response = await adminUsersAPI.getById(userId);
      console.log('User details response:', response);
      
      // Ensure we map the status correctly from isActive field
      const userWithMappedStatus = {
        ...response.data,
        status: response.data.isActive ? 'ACTIVE' : 'SUSPENDED',
        isActive: response.data.isActive // Ensure isActive is preserved
      };
      
      setSelectedUser(userWithMappedStatus);
      setUserDetailOpen(true);
      handleMenuClose();
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Failed to fetch user details. Please try again.');
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      console.log('Changing user status:', userId, 'to', newStatus);
      const isActive = newStatus === 'ACTIVE';
      await adminUsersAPI.updateStatus(userId, isActive);
      
      // Reload data to get fresh status from database
      await loadData();
      handleMenuClose();
      
      // Show success message
      const message = `Tài khoản đã được ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'khóa'} thành công!`;
      alert(message);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status. Please try again.');
      throw error; // Re-throw to handle in dialog
    }
  };

  const handleEdit = async (userId: string) => {
    try {
      console.log('Editing user:', userId);
      const response = await adminUsersAPI.getById(userId);
      console.log('User data for editing:', response);
      
      // Ensure we map the status correctly from isActive field
      const userWithMappedStatus = {
        ...response.data,
        status: response.data.isActive ? 'ACTIVE' : 'SUSPENDED',
        isActive: response.data.isActive // Ensure isActive is preserved
      };
      
      setSelectedUser(userWithMappedStatus);
      setEditUserOpen(true);
      handleMenuClose();
    } catch (error) {
      console.error('Error fetching user for edit:', error);
      alert('Failed to fetch user data for editing. Please try again.');
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      console.log('Deleting user:', userId);
      const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.');
      
      if (!confirmDelete) {
        handleMenuClose();
        return;
      }

      await adminUsersAPI.delete(userId);
      
      // Reload data to get fresh list from database
      await loadData(true); // Force refresh
      handleMenuClose();
      alert('User deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      
      let errorMessage = 'Failed to delete user. Please try again.';
      
      if (error?.response?.status === 404) {
        errorMessage = 'User not found. It may have already been deleted. Refreshing the list...';
        // Reload data to sync with database
        await loadData(true); // Force refresh
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
      handleMenuClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'SUSPENDED': return 'error';
      case 'PENDING': return 'warning';
      case 'PAUSED': return 'warning';
      case 'CLOSED': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Hoạt động';
      case 'SUSPENDED': return 'Tạm khóa';
      case 'PENDING': return 'Chờ duyệt';
      case 'PAUSED': return 'Tạm dừng';
      case 'CLOSED': return 'Đã đóng';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (!stats) return null;

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Admin Dashboard 🛠️
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Quản lý toàn bộ hệ thống recruitment platform
              </Typography>
            </Box>
            <Dashboard sx={{ fontSize: 64, opacity: 0.3 }} />
          </Box>
        </Paper>

        {/* Stats Overview */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Tổng người dùng
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalUsers.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      +{stats.usersGrowth}%
                    </Typography>
                  </Box>
                </Box>
                <People sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Công ty
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalCompanies}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      +5.2%
                    </Typography>
                  </Box>
                </Box>
                <Business sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Việc làm
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalJobs}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      +{stats.jobsGrowth}%
                    </Typography>
                  </Box>
                </Box>
                <Work sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Ứng tuyển
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalApplications.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" color="warning.main">
                      {stats.pendingApplications} chờ duyệt
                    </Typography>
                  </Box>
                </Box>
                <Assessment sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Management Tabs */}
        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
              <Tab label="Quản lý người dùng" />
              <Tab label="Quản lý việc làm" />
              <Tab label="Báo cáo & Thống kê" />
            </Tabs>
          </Box>

          {/* Users Management */}
          {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Danh sách người dùng</Typography>
                <Button variant="contained" startIcon={<Add />}>
                  Thêm người dùng
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Người dùng</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Vai trò</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Đăng ký</TableCell>
                      <TableCell>Đăng nhập cuối</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {user.studentProfile 
                                ? user.studentProfile.firstName.charAt(0)
                                : user.companyProfile
                                ? user.companyProfile.companyName.charAt(0)
                                : user.email.charAt(0).toUpperCase()
                              }
                            </Avatar>
                            <Typography>
                              {user.studentProfile 
                                ? `${user.studentProfile.firstName} ${user.studentProfile.lastName}`
                                : user.companyProfile?.companyName
                                || 'Admin User'
                              }
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={user.role} 
                            size="small"
                            color={user.role === 'ADMIN' ? 'error' : user.role === 'COMPANY' ? 'info' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(user.status)}
                            color={getStatusColor(user.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('vi-VN') : 'Chưa đăng nhập'}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={(e) => handleMenuClick(e, user.id)}
                          >
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Jobs Management */}
          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Quản lý tin tuyển dụng</Typography>
                <Button variant="contained" startIcon={<Analytics />}>
                  Xem báo cáo
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tiêu đề</TableCell>
                      <TableCell>Công ty</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Ứng viên</TableCell>
                      <TableCell>Đăng</TableCell>
                      <TableCell>Hạn nộp</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {job.title}
                          </Typography>
                        </TableCell>
                        <TableCell>{job.company}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(job.status)}
                            color={getStatusColor(job.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="bold">
                            {job.applicants}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : 'Không có'}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton onClick={(e) => handleMenuClick(e, job.id)}>
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Analytics */}
          {tabValue === 2 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Báo cáo & Thống kê</Typography>
              
              <Box sx={{ display: "grid", gap: 2 }}>
                <Box>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Tăng trưởng người dùng</Typography>
                      {stats && (
                        <>
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2">
                                Sinh viên ({stats.totalUsers > 0 ? Math.round((stats.studentCount / stats.totalUsers) * 100) : 0}%)
                              </Typography>
                              <Typography variant="body2">{stats.studentCount}</Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={stats.totalUsers > 0 ? (stats.studentCount / stats.totalUsers) * 100 : 0} 
                            />
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2">
                                Công ty ({stats.totalUsers > 0 ? Math.round((stats.companyCount / stats.totalUsers) * 100) : 0}%)
                              </Typography>
                              <Typography variant="body2">{stats.companyCount}</Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={stats.totalUsers > 0 ? (stats.companyCount / stats.totalUsers) * 100 : 0} 
                              color="success" 
                            />
                          </Box>
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2">
                                Admin ({stats.totalUsers > 0 ? Math.round((stats.adminCount / stats.totalUsers) * 100) : 0}%)
                              </Typography>
                              <Typography variant="body2">{stats.adminCount}</Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={stats.totalUsers > 0 ? (stats.adminCount / stats.totalUsers) * 100 : 0} 
                              color="warning" 
                            />
                          </Box>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Box>

                <Box>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Hoạt động trong tuần</Typography>
                      {stats && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography>Đăng ký mới</Typography>
                            <Typography fontWeight="bold" color="success.main">
                              +{stats.weeklyStats.newRegistrations}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography>Tin tuyển dụng mới</Typography>
                            <Typography fontWeight="bold" color="info.main">
                              +{stats.weeklyStats.newJobs}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography>Ứng tuyển mới</Typography>
                            <Typography fontWeight="bold" color="warning.main">
                              +{stats.weeklyStats.newApplications}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography>Tài khoản bị khóa</Typography>
                            <Typography fontWeight="bold" color="error.main">
                              {stats.weeklyStats.blockedAccounts}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>
          )}
        </Paper>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleViewDetails(selectedItem!)}>
            <Visibility sx={{ mr: 1 }} />
            Xem chi tiết
          </MenuItem>
          <MenuItem onClick={() => handleEdit(selectedItem!)}>
            <Edit sx={{ mr: 1 }} />
            Chỉnh sửa
          </MenuItem>
          {tabValue === 0 && [
            <MenuItem key="suspend" onClick={() => handleStatusChange(selectedItem!, 'SUSPENDED')}>
              <Block sx={{ mr: 1 }} />
              Khóa tài khoản
            </MenuItem>,
            <MenuItem key="activate" onClick={() => handleStatusChange(selectedItem!, 'ACTIVE')}>
              <Check sx={{ mr: 1 }} />
              Kích hoạt
            </MenuItem>
          ]}
          <MenuItem onClick={() => handleDelete(selectedItem!)} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} />
            Xóa
          </MenuItem>
        </Menu>

        {/* User Detail Dialog */}
        <Dialog open={userDetailOpen} onClose={() => setUserDetailOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Chi tiết người dùng</DialogTitle>
          <DialogContent>
            {selectedUser && (
              <Box sx={{ pt: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                    <Typography variant="body1" gutterBottom>{selectedUser.email}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Vai trò</Typography>
                    <Chip label={selectedUser.role} color="primary" size="small" />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Trạng thái</Typography>
                    <Chip 
                      label={getStatusLabel(selectedUser.status)} 
                      color={getStatusColor(selectedUser.status) as any} 
                      size="small" 
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">Ngày đăng ký</Typography>
                    <Typography variant="body1">{new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}</Typography>
                  </Box>
                  {selectedUser.studentProfile && (
                    <>
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">Họ</Typography>
                        <Typography variant="body1">{selectedUser.studentProfile.lastName}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">Tên</Typography>
                        <Typography variant="body1">{selectedUser.studentProfile.firstName}</Typography>
                      </Box>
                    </>
                  )}
                  {selectedUser.companyProfile && (
                    <Box sx={{ gridColumn: '1 / -1' }}>
                      <Typography variant="subtitle2" color="textSecondary">Tên công ty</Typography>
                      <Typography variant="body1">{selectedUser.companyProfile.companyName}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUserDetailOpen(false)}>Đóng</Button>
          </DialogActions>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={editUserOpen} onClose={() => setEditUserOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
          <DialogContent>
            {selectedUser && (
              <Box sx={{ pt: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Bạn có thể thay đổi trạng thái tài khoản của người dùng.
                </Alert>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Email"
                    value={selectedUser.email}
                    fullWidth
                    disabled
                    helperText="Email không thể thay đổi"
                  />
                  <TextField
                    label="Vai trò"
                    value={selectedUser.role}
                    fullWidth
                    disabled
                    helperText="Vai trò không thể thay đổi"
                  />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Trạng thái hiện tại:</Typography>
                    <Chip 
                      label={getStatusLabel(selectedUser.status)} 
                      color={getStatusColor(selectedUser.status) as any} 
                      size="small" 
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                      Trạng thái: {selectedUser.status} (isActive: {selectedUser.isActive ? 'true' : 'false'})
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditUserOpen(false)}>Hủy</Button>
            <Button 
              variant="contained" 
              color="warning"
              onClick={async () => {
                if (selectedUser) {
                  const newStatus = selectedUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
                  try {
                    await handleStatusChange(selectedUser.id, newStatus);
                    setEditUserOpen(false);
                  } catch (error) {
                    // Error handling is already done in handleStatusChange
                    console.error('Failed to change status:', error);
                  }
                }
              }}
            >
              {selectedUser?.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
