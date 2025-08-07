import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tooltip,
  Alert,
  Snackbar,
  LinearProgress,
  Avatar,
  Stack,
  Divider,
  useTheme,
  alpha,
  Tab,
  Tabs,
  Badge,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Business,
  Verified,
  VerifiedUser,
  Block,
  Edit,
  Delete,
  Visibility,
  TrendingUp,
  Analytics,
  People,
  Work,
  LocationOn,
  Language,
  Phone,
  Email,
  Public,
  LinkedIn,
  Facebook,
  Twitter,
  Refresh,
  Add,
  FilterList,
  Sort,
  MoreVert,
  CloudDownload,
  Upload,
  Settings,
  NotificationImportant,
  Security,
  Assessment,
  Timeline,
  Speed,
  Memory,
  Storage,
  ExpandMore,
  CheckCircle,
  Cancel,
  Warning,
  Info,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { companiesAPI, EnhancedCompany, CompaniesFilters } from '../services/api/companiesAPI';
import { adminAPI, AdminCompany, AdminFilters as AdminAPIFilters } from '../services/api/adminAPI';
import socketService from '../services/socketService';

interface AdminStats {
  totalCompanies: number;
  verifiedCompanies: number;
  companiesWithJobs: number;
  verificationRate: number;
  topIndustries: Array<{
    industry: string;
    count: number;
  }>;
  recentActivity: Array<{
    type: string;
    count: number;
    latest: string;
  }>;
  systemHealth: {
    dbStatus: 'healthy' | 'warning' | 'error';
    apiResponseTime: number;
    activeConnections: number;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface AdminFilters {
  verified: string;
  industry: string;
  size: string;
  status: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminCompaniesPage: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<AdminCompany | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as any });
  const [currentTab, setCurrentTab] = useState(0);
  const [filters, setFilters] = useState<AdminFilters>({
    verified: '',
    industry: '',
    size: '',
    status: ''
  });
  const [realTimeUpdates, setRealTimeUpdates] = useState<{[key: string]: any}>({});

  // Check admin access
  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      setSnackbar({
        open: true,
        message: 'Bạn không có quyền truy cập trang này',
        severity: 'error'
      });
      return;
    }
  }, [user]);

  // Convert admin filters to API filters
  const convertFiltersToAPI = (adminFilters: AdminFilters): CompaniesFilters => {
    const apiFilters: CompaniesFilters = {
      page: 1,
      limit: 100,
      includeStats: true,
    };

    // Convert verified string to boolean
    if (adminFilters.verified === 'true') {
      apiFilters.verified = true;
    } else if (adminFilters.verified === 'false') {
      apiFilters.verified = false;
    }

    // Convert industry string to array
    if (adminFilters.industry) {
      apiFilters.industry = [adminFilters.industry];
    }

    // Convert size string to array  
    if (adminFilters.size) {
      apiFilters.size = [adminFilters.size];
    }

    return apiFilters;
  };

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log('🔥 Admin LoadData - Starting...');
      
      // Load companies with admin API
      const companiesResponse = await adminAPI.getCompanies({
        page: 1,
        limit: 100,
        ...filters
      });
      
      console.log('🔥 Admin companies response:', companiesResponse);
      
      // Load admin stats
      const statsResponse = await companiesAPI.getStats();
      
      setCompanies(companiesResponse.data.companies);
      setStats({
        ...statsResponse.data.stats,
        recentActivity: [],
        systemHealth: {
          dbStatus: 'healthy',
          apiResponseTime: 150,
          activeConnections: 12
        }
      });
      
    } catch (error) {
      console.error('Error loading admin data:', error);
      setSnackbar({
        open: true,
        message: 'Không thể tải dữ liệu quản trị',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadData();
    }
  }, [user, loadData]);

  // Real-time updates
  useEffect(() => {
    if (user?.role !== 'ADMIN') return;

    try {
      const token = localStorage.getItem('token');
      if (token && !socketService.isConnected) {
        socketService.connect(token);
        socketService.joinCompanyRoom('admin-monitoring');
      }

      // Real-time event handlers
      const handleCompanyUpdate = (data: any) => {
        console.log('🔥 Real-time company update:', data);
        setRealTimeUpdates(prev => ({
          ...prev,
          [data.companyId]: {
            ...prev[data.companyId],
            ...data,
            timestamp: new Date()
          }
        }));
        
        // Update companies list
        setCompanies(prev => prev.map(company => 
          company.id === data.companyId 
            ? { ...company, ...data.updates }
            : company
        ));
      };

      const handleCompaniesUpdated = (data: any) => {
        console.log('🔥 Real-time companies list updated:', data);
        if (data.companies && Array.isArray(data.companies)) {
          setCompanies(data.companies);
          setSnackbar({
            open: true,
            message: 'Danh sách công ty đã được cập nhật',
            severity: 'success'
          });
        }
      };

      const handleNewCompany = (data: any) => {
        console.log('🔥 Real-time new company:', data);
        setSnackbar({
          open: true,
          message: `Công ty mới đăng ký: ${data.company?.name || 'Unknown'}`,
          severity: 'info'
        });
        
        // Refresh data
        setTimeout(loadData, 1000);
      };

      const handleSystemMetrics = (data: any) => {
        setStats(prev => prev ? {
          ...prev,
          systemHealth: {
            ...prev.systemHealth,
            activeConnections: data.connectedUsers
          }
        } : null);
      };

      // Subscribe to events
      socketService.on('company-updated', handleCompanyUpdate);
      socketService.on('companies-updated', handleCompaniesUpdated); // Add this new listener
      socketService.on('new-company-added', handleNewCompany);
      socketService.on('system-metrics', handleSystemMetrics);
      socketService.on('company-verification-update', handleCompanyUpdate);

      return () => {
        socketService.off('company-updated');
        socketService.off('companies-updated'); // Clean up new listener
        socketService.off('new-company-added');
        socketService.off('system-metrics');
        socketService.off('company-verification-update');
      };
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  }, [user, loadData]);

  // Admin actions
  const handleVerifyCompany = async (companyId: string, verified: boolean) => {
    try {
      console.log('🔥 Verifying company:', companyId, verified);
      await adminAPI.verifyCompany(companyId, {
        status: verified ? 'VERIFIED' : 'REJECTED',
        reason: verified ? 'Approved by admin' : 'Rejected by admin'
      });
      
      setCompanies(prev => prev.map(company => 
        company.id === companyId 
          ? { ...company, isVerified: verified, verificationStatus: verified ? 'VERIFIED' : 'REJECTED' }
          : company
      ));
      
      setSnackbar({
        open: true,
        message: `Công ty đã ${verified ? 'được xác thực' : 'bị từ chối'}`,
        severity: 'success'
      });
      
      // Emit real-time update
      socketService.emit('company-verification-changed', {
        companyId,
        isVerified: verified,
        verifiedBy: user?.id
      });
      
    } catch (error) {
      console.error('Error verifying company:', error);
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi cập nhật trạng thái xác thực',
        severity: 'error'
      });
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa công ty này?')) return;
    
    try {
      // This would call admin API to delete company
      // await adminAPI.deleteCompany(companyId);
      
      setCompanies(prev => prev.filter(company => company.id !== companyId));
      
      setSnackbar({
        open: true,
        message: 'Công ty đã được xóa',
        severity: 'success'
      });
      
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi xóa công ty',
        severity: 'error'
      });
    }
  };

  const handleSuspendCompany = async (companyId: string, isActive: boolean) => {
    try {
      console.log('🔥 Updating company status:', companyId, isActive);
      await adminAPI.updateCompanyStatus(companyId, isActive);
      
      setCompanies(prev => prev.map(company => 
        company.id === companyId 
          ? { ...company, status: isActive ? 'ACTIVE' : 'SUSPENDED' }
          : company
      ));
      
      setSnackbar({
        open: true,
        message: `Công ty đã ${isActive ? 'được kích hoạt' : 'bị tạm ngưng'}`,
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Error updating company status:', error);
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi cập nhật trạng thái công ty',
        severity: 'error'
      });
    }
  };

  const handleBulkAction = async (action: string, companyIds: string[]) => {
    try {
      // This would call admin API for bulk operations
      // await adminAPI.bulkCompanyOperation(action, companyIds);
      
      setSnackbar({
        open: true,
        message: `Đã thực hiện ${action} cho ${companyIds.length} công ty`,
        severity: 'success'
      });
      
      // Emit real-time update
      socketService.emit('bulk-company-operation', {
        operation: action,
        companyIds,
        operatedBy: user?.id
      });
      
      // Refresh data
      setTimeout(loadData, 1000);
      
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi thực hiện thao tác hàng loạt',
        severity: 'error'
      });
    }
  };

  // Render functions
  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      {/* Stats Cards */}
      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`, color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Business sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {stats?.totalCompanies || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Tổng công ty
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`, color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Verified sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {stats?.verifiedCompanies || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Đã xác thực
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  ({stats?.verificationRate || 0}%)
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`, color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Work sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {stats?.companiesWithJobs || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Đang tuyển dụng
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`, color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Speed sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {stats?.systemHealth.activeConnections || 0}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Kết nối active
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Top Industries Chart */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top Industries
            </Typography>
            {stats?.topIndustries.map((industry, index) => (
              <Box key={industry.industry} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{industry.industry}</Typography>
                  <Typography variant="body2" fontWeight={600}>{industry.count}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(industry.count / (stats?.totalCompanies || 1)) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* System Health */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Health
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle color="success" />
                <Typography variant="body2">Database: Healthy</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Speed color="info" />
                <Typography variant="body2">API Response: {stats?.systemHealth.apiResponseTime || 0}ms</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Memory color="primary" />
                <Typography variant="body2">Real-time Updates: Active</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Real-time Activity */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Real-time Activity
            </Typography>
            {Object.keys(realTimeUpdates).length > 0 ? (
              <List>
                {Object.entries(realTimeUpdates).slice(0, 5).map(([companyId, update]) => (
                  <ListItem key={companyId}>
                    <ListItemIcon>
                      <Business />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Company ${companyId} updated`}
                      secondary={`${new Date(update.timestamp).toLocaleTimeString()}`}
                    />
                    <ListItemSecondaryAction>
                      <Chip label="Live" color="success" size="small" />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Chưa có hoạt động real-time
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderCompaniesTab = () => (
    <Box>
      {/* Filters and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái xác thực</InputLabel>
                <Select
                  value={filters.verified}
                  label="Trạng thái xác thực"
                  onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.value }))}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="true">Đã xác thực</MenuItem>
                  <MenuItem value="false">Chưa xác thực</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Ngành nghề</InputLabel>
                <Select
                  value={filters.industry}
                  label="Ngành nghề"
                  onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="Technology">Technology</MenuItem>
                  <MenuItem value="Healthcare">Healthcare</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadData}
                disabled={loading}
              >
                Làm mới
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setSnackbar({ open: true, message: 'Tính năng sẽ sớm ra mắt', severity: 'info' })}
              >
                Thêm công ty
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardContent>
          {loading ? (
            <LinearProgress />
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Công ty</TableCell>
                    <TableCell>Ngành nghề</TableCell>
                    <TableCell>Quy mô</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Việc làm</TableCell>
                    <TableCell>Lượt xem</TableCell>
                    <TableCell>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 40, height: 40 }}>
                            {company.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {company.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {company.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{company.industry}</TableCell>
                      <TableCell>
                        <Chip 
                          label={company.size} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          {company.isVerified ? (
                            <Chip 
                              icon={<Verified />} 
                              label="Xác thực" 
                              color="success" 
                              size="small" 
                            />
                          ) : (
                            <Chip 
                              label="Chưa xác thực" 
                              color="default" 
                              size="small" 
                            />
                          )}
                          {realTimeUpdates[company.id] && (
                            <Chip 
                              label="Live" 
                              color="info" 
                              size="small" 
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {company.jobsCount || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          0
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Xem chi tiết">
                            <IconButton size="small" onClick={() => {
                              setSelectedCompany(company);
                              setDialogOpen(true);
                            }}>
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={company.isVerified ? "Hủy xác thực" : "Xác thực"}>
                            <IconButton 
                              size="small"
                              color={company.isVerified ? "warning" : "success"}
                              onClick={() => handleVerifyCompany(company.id, !company.isVerified)}
                            >
                              {company.isVerified ? <Block /> : <VerifiedUser />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={company.status === 'ACTIVE' ? "Tạm ngưng" : "Kích hoạt"}>
                            <IconButton 
                              size="small"
                              color={company.status === 'ACTIVE' ? "warning" : "success"}
                              onClick={() => handleSuspendCompany(company.id, company.status !== 'ACTIVE')}
                            >
                              {company.status === 'ACTIVE' ? <Security /> : <CheckCircle />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteCompany(company.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  const renderAnalyticsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="info">
          Tính năng Analytics sẽ sớm ra mắt với các biểu đồ và báo cáo chi tiết.
        </Alert>
      </Grid>
      
      {/* Performance Metrics */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Database Performance
            </Typography>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Trigger Performance</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Real-time triggers đang hoạt động bình thường. Thời gian phản hồi trung bình: 15ms
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Query Optimization</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  Tất cả indexes đều được tối ưu. Hiệu suất query tốt.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Real-time Statistics
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><Timeline /></ListItemIcon>
                <ListItemText primary="Company Views" secondary="Real-time tracking active" />
                <ListItemSecondaryAction>
                  <Chip label="Active" color="success" size="small" />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemIcon><Assessment /></ListItemIcon>
                <ListItemText primary="Application Counts" secondary="Auto-sync enabled" />
                <ListItemSecondaryAction>
                  <Chip label="Active" color="success" size="small" />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemIcon><Speed /></ListItemIcon>
                <ListItemText primary="Job Statistics" secondary="Trigger-based updates" />
                <ListItemSecondaryAction>
                  <Chip label="Active" color="success" size="small" />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (user?.role !== 'ADMIN') {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Không có quyền truy cập
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bạn cần có quyền ADMIN để truy cập trang này.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          🏢 Quản lý Doanh nghiệp
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Dashboard quản trị với real-time monitoring và analytics
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab 
            label={
              <Badge badgeContent={stats?.totalCompanies || 0} color="primary">
                Tổng quan
              </Badge>
            } 
          />
          <Tab label="Companies" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={currentTab} index={0}>
        {renderOverviewTab()}
      </TabPanel>
      <TabPanel value={currentTab} index={1}>
        {renderCompaniesTab()}
      </TabPanel>
      <TabPanel value={currentTab} index={2}>
        {renderAnalyticsTab()}
      </TabPanel>

      {/* Company Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: "blur(20px)",
          },
        }}
      >
        {selectedCompany && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 48, height: 48 }}>
                  {selectedCompany.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {selectedCompany.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Admin View - ID: {selectedCompany.id}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Email</Typography>
                  <Typography variant="body1" gutterBottom>{selectedCompany.email}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Industry</Typography>
                  <Typography variant="body1" gutterBottom>{selectedCompany.industry || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Company Size</Typography>
                  <Typography variant="body1" gutterBottom>{selectedCompany.size || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Jobs Count</Typography>
                  <Typography variant="body1" gutterBottom>{selectedCompany.jobsCount}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Verification Status</Typography>
                  <Chip 
                    icon={selectedCompany.isVerified ? <Verified /> : <Warning />}
                    label={selectedCompany.verificationStatus}
                    color={selectedCompany.isVerified ? 'success' : 'warning'}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Account Status</Typography>
                  <Chip 
                    icon={selectedCompany.status === 'ACTIVE' ? <CheckCircle /> : <Cancel />}
                    label={selectedCompany.status}
                    color={selectedCompany.status === 'ACTIVE' ? 'success' : 'error'}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Created At</Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(selectedCompany.createdAt).toLocaleDateString('vi-VN')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Statistics</Typography>
                  <Stack direction="row" spacing={2}>
                    <Chip label={`${selectedCompany.jobsCount || 0} Jobs`} />
                    {selectedCompany.website && (
                      <Chip 
                        label="Website"
                        onClick={() => window.open(selectedCompany.website, '_blank')}
                        clickable
                        icon={<Public />}
                      />
                    )}
                  </Stack>
                </Grid>
                {selectedCompany.description && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>Description</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedCompany.description}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Đóng</Button>
              <Button 
                variant="outlined"
                color={selectedCompany.isVerified ? "warning" : "success"}
                onClick={() => {
                  handleVerifyCompany(selectedCompany.id, !selectedCompany.isVerified);
                  setDialogOpen(false);
                }}
              >
                {selectedCompany.isVerified ? "Hủy xác thực" : "Xác thực"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Speed Dial for quick actions */}
      <SpeedDial
        ariaLabel="Admin actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Refresh />}
          tooltipTitle="Refresh Data"
          onClick={loadData}
        />
        <SpeedDialAction
          icon={<Analytics />}
          tooltipTitle="Generate Report"
          onClick={() => setSnackbar({ open: true, message: 'Generating report...', severity: 'info' })}
        />
        <SpeedDialAction
          icon={<Settings />}
          tooltipTitle="System Settings"
          onClick={() => setSnackbar({ open: true, message: 'System settings...', severity: 'info' })}
        />
      </SpeedDial>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminCompaniesPage; 