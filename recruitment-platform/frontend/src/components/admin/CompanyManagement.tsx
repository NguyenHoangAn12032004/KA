import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tooltip,
  Avatar,
  Grid,
  Snackbar,
  Divider
} from '@mui/material';
import {
  Business as BusinessIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  Notifications as NotificationIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
import { adminAPI, AdminCompany } from '../../services/api/adminAPI';
import { onAdminEvent, offAdminEvent, emitAdminEvent, useAdminSocket } from '../../hooks/useAdminSocket';
import './CompanyManagement.css';
import ConnectionStatus from './ConnectionStatus';

interface CompanyManagementProps {
  onCompanyUpdate?: () => void;
}

export const CompanyManagement: React.FC<CompanyManagementProps> = ({ onCompanyUpdate }) => {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Dialog states
  const [selectedCompany, setSelectedCompany] = useState<AdminCompany | null>(null);
  const [verificationDialog, setVerificationDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'VERIFIED' | 'REJECTED'>('VERIFIED');
  const [verificationReason, setVerificationReason] = useState('');
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' | 'warning' | 'error' } | null>(null);
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);

  // Lấy token xác thực cho kết nối socket
  const token = localStorage.getItem('token');
  const { socket: adminSocket, connected: socketConnected } = useAdminSocket(token);

  // Tải dữ liệu ban đầu và khi tham số thay đổi
  useEffect(() => {
    loadCompanies();
  }, [page, rowsPerPage, search, statusFilter]);
  
  // Hiển thị trạng thái kết nối socket
  useEffect(() => {
    if (socketConnected) {
      setNotification({
        message: 'Kết nối realtime đã được thiết lập',
        type: 'success'
      });
      
      // Đăng ký lại cho socket
      if (realtimeEnabled) {
        console.log('🔌 Socket connected and realtime enabled, subscribing to company events');
        emitAdminEvent('admin-subscribe-companies');
      }
    } else if (realtimeEnabled) {
      console.log('🔌 Socket disconnected but realtime enabled');
    }
  }, [socketConnected, realtimeEnabled]);
  
  // Thiết lập event listeners cho cập nhật thời gian thực
  useEffect(() => {
    if (!realtimeEnabled) {
      console.log('🏢 Realtime disabled, not setting up listeners');
      return;
    }
    
    console.log('🏢 Setting up realtime company event listeners');
    
    // Xử lý cập nhật công ty
    const handleCompanyUpdate = (updatedCompany: AdminCompany) => {
      console.log('🏢 Received company update:', updatedCompany);
      setCompanies(prev => prev.map(c => c.id === updatedCompany.id ? updatedCompany : c));
      setNotification({
        message: `Công ty "${updatedCompany.name}" đã được cập nhật`,
        type: 'info'
      });
      setLastUpdated(new Date());
    };
    
    // Xử lý đăng ký công ty mới
    const handleNewCompany = (newCompany: AdminCompany) => {
      console.log('🏢 Received new company:', newCompany);
      if (page === 0) { // Chỉ thêm vào danh sách nếu đang ở trang đầu tiên
        setCompanies(prev => [newCompany, ...prev]);
        setTotalCompanies(prev => prev + 1);
      } else {
        setTotalCompanies(prev => prev + 1);
      }
      setNotification({
        message: `Công ty mới "${newCompany.name}" đã đăng ký`,
        type: 'success'
      });
      setLastUpdated(new Date());
    };
    
    // Xử lý xác minh công ty
    const handleCompanyVerification = (data: { companyId: string, status: 'VERIFIED' | 'REJECTED', companyName?: string }) => {
      console.log('🏢 Company verification status changed:', data);
      setCompanies(prev => prev.map(c => {
        if (c.id === data.companyId) {
          return {
            ...c,
            verificationStatus: data.status,
            isVerified: data.status === 'VERIFIED'
          };
        }
        return c;
      }));
      
      const companyName = data.companyName || 'Một công ty';
      setNotification({
        message: `${companyName} đã ${data.status === 'VERIFIED' ? 'được xác minh' : 'bị từ chối'}`,
        type: data.status === 'VERIFIED' ? 'success' : 'warning'
      });
      setLastUpdated(new Date());
    };
    
    // Xử lý cập nhật số lượng công việc
    const handleJobsCountUpdate = (data: { companyId: string, jobsCount: number }) => {
      console.log('🏢 Jobs count updated for company:', data);
      setCompanies(prev => prev.map(c => {
        if (c.id === data.companyId) {
          return {
            ...c,
            jobsCount: data.jobsCount
          };
        }
        return c;
      }));
    };
    
    // Đăng ký event handlers
    onAdminEvent('company-update', handleCompanyUpdate);
    onAdminEvent('new-company', handleNewCompany);
    onAdminEvent('company-verification', handleCompanyVerification);
    onAdminEvent('company-jobs-update', handleJobsCountUpdate);
    
    // Đăng ký với server để nhận cập nhật
    if (socketConnected) {
      console.log('🏢 Emitting admin-subscribe-companies event');
      emitAdminEvent('admin-subscribe-companies');
    }
    
    // Dọn dẹp
    return () => {
      console.log('🏢 Cleaning up realtime company event listeners');
      offAdminEvent('company-update', handleCompanyUpdate);
      offAdminEvent('new-company', handleNewCompany);
      offAdminEvent('company-verification', handleCompanyVerification);
      offAdminEvent('company-jobs-update', handleJobsCountUpdate);
    };
  }, [realtimeEnabled, companies, page, socketConnected]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      console.log('🏢 Loading companies with params:', {
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
        status: statusFilter || undefined
      });
      
      // Chỉ sử dụng dữ liệu thực từ API, không dùng dữ liệu mẫu
      const response = await adminAPI.getCompanies({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
        status: statusFilter || undefined
      });
      
      // Xử lý dữ liệu phản hồi từ API
      console.log('🏢 API response:', response);
      const responseData = response.data;
      
      // Cập nhật state với dữ liệu thực từ API
      setCompanies(responseData.companies || []);
      setTotalCompanies(responseData.total || 0);
      setLastUpdated(new Date());
      setError(null);
      
      if (!responseData.companies || responseData.companies.length === 0) {
        console.log('🏢 API returned empty companies array');
        setNotification({
          message: 'Không có dữ liệu công ty nào',
          type: 'info'
        });
      }
    } catch (error) {
      console.error('🏢 Failed to load companies:', error);
      setError('Không thể tải dữ liệu công ty. Vui lòng thử lại sau.');
      setCompanies([]);
      setTotalCompanies(0);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = (company: AdminCompany, status: 'VERIFIED' | 'REJECTED') => {
    setSelectedCompany(company);
    setVerificationStatus(status);
    setVerificationDialog(true);
  };

  const executeVerification = async () => {
    if (!selectedCompany) return;

    try {
      await adminAPI.verifyCompany(selectedCompany.id, {
        status: verificationStatus,
        reason: verificationReason || undefined
      });

      setVerificationDialog(false);
      setVerificationReason('');
      loadCompanies();
      onCompanyUpdate?.();
      
      setError(null);
    } catch (error) {
      console.error('Failed to verify company:', error);
      setError('Failed to verify company');
    }
  };

  const handleViewCompany = async (company: AdminCompany) => {
    try {
      const response = await adminAPI.getCompanyById(company.id);
      setSelectedCompany(response.data);
      setViewDialog(true);
    } catch (error) {
      console.error('Failed to load company details:', error);
      setError('Failed to load company details');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const getCompanySizeDisplay = (size?: string) => {
    switch (size) {
      case 'STARTUP': return '1-10 nhân viên';
      case 'SMALL': return '11-50 nhân viên';
      case 'MEDIUM': return '51-200 nhân viên';
      case 'LARGE': return '201-1000 nhân viên';
      case 'ENTERPRISE': return '1000+ nhân viên';
      default: return 'Chưa xác định';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'Đã xác thực';
      case 'PENDING': return 'Đang chờ';
      case 'REJECTED': return 'Bị từ chối';
      default: return status;
    }
  };

  return (
    <Box>
      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField
              label="Tìm kiếm công ty"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ minWidth: 200 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Trạng thái xác thực</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Trạng thái xác thực"
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="PENDING">Đang chờ</MenuItem>
                <MenuItem value="VERIFIED">Đã xác thực</MenuItem>
                <MenuItem value="REJECTED">Bị từ chối</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={loadCompanies}
              disabled={loading}
              startIcon={<SyncIcon />}
            >
              Tải lại
            </Button>
            
            <Button
              variant={realtimeEnabled ? "contained" : "outlined"}
              color={realtimeEnabled ? (socketConnected ? "success" : "warning") : "primary"}
              onClick={() => setRealtimeEnabled(!realtimeEnabled)}
              startIcon={<NotificationIcon />}
              sx={{ 
                position: 'relative',
                '&::after': realtimeEnabled && socketConnected ? {
                  content: '""',
                  position: 'absolute',
                  top: 5,
                  right: 5,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: 'success.main',
                  animation: 'pulse 1.5s infinite'
                } : {}
              }}
            >
              {realtimeEnabled 
                ? (socketConnected ? "Realtime Đang Hoạt Động" : "Đang Kết Nối...")
                : "Realtime Tắt"}
            </Button>
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="textSecondary">
              Tổng số công ty: {totalCompanies}
            </Typography>
            <ConnectionStatus 
              connected={socketConnected} 
              enabled={realtimeEnabled}
              lastUpdated={lastUpdated}
            />
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Notification Snackbar */}
      {notification && (
        <Snackbar
          open={true}
          autoHideDuration={5000}
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setNotification(null)} 
            severity={notification.type} 
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      )}

      {/* Companies Table */}
      <Card>
        <TableContainer className={`companies-table ${loading ? 'loading' : ''}`}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Công ty</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Ngành nghề</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Jobs Count</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {companies && companies.length > 0 ? companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        <BusinessIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {company.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {company.id.slice(0, 8)}...
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{company.email}</TableCell>
                  <TableCell>{company.industry || 'Chưa xác định'}</TableCell>
                  <TableCell>{getCompanySizeDisplay(company.size)}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(company.verificationStatus)}
                      color={getStatusColor(company.verificationStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={company.jobsCount}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(company.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewCompany(company)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {company.verificationStatus === 'PENDING' && (
                        <>
                          <Tooltip title="Approve Company">
                            <IconButton
                              size="small"
                              onClick={() => handleVerification(company, 'VERIFIED')}
                              color="success"
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Reject Company">
                            <IconButton
                              size="small"
                              onClick={() => handleVerification(company, 'REJECTED')}
                              color="error"
                            >
                              <RejectIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}

                      {company.verificationStatus === 'REJECTED' && (
                        <Tooltip title="Approve Company">
                          <IconButton
                            size="small"
                            onClick={() => handleVerification(company, 'VERIFIED')}
                            color="success"
                          >
                            <ApproveIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box py={3}>
                      {loading ? (
                        <Typography variant="body2" color="textSecondary">
                          Đang tải dữ liệu công ty...
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Không tìm thấy công ty nào
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCompanies}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      {/* Verification Dialog */}
      <Dialog open={verificationDialog} onClose={() => setVerificationDialog(false)}>
        <DialogTitle>
          {verificationStatus === 'VERIFIED' ? 'Xác thực công ty' : 'Từ chối công ty'}
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Bạn có chắc chắn muốn {verificationStatus === 'VERIFIED' ? 'xác thực' : 'từ chối'} công ty "{selectedCompany?.name}"?
          </Typography>
          <TextField
            fullWidth
            label={verificationStatus === 'REJECTED' ? 'Lý do từ chối' : 'Ghi chú xác thực (Không bắt buộc)'}
            multiline
            rows={3}
            value={verificationReason}
            onChange={(e) => setVerificationReason(e.target.value)}
            sx={{ mt: 2 }}
            required={verificationStatus === 'REJECTED'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerificationDialog(false)}>
            Hủy bỏ
          </Button>
          <Button 
            onClick={executeVerification}
            color={verificationStatus === 'VERIFIED' ? 'success' : 'error'}
            variant="contained"
          >
            {verificationStatus === 'VERIFIED' ? 'Xác thực' : 'Từ chối'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Company Details Dialog */}
      <Dialog 
        open={viewDialog} 
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Chi tiết công ty
        </DialogTitle>
        <DialogContent>
          {selectedCompany && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Thông tin công ty
                      </Typography>
                      <Typography><strong>Tên công ty:</strong> {selectedCompany.name}</Typography>
                      <Typography><strong>Email:</strong> {selectedCompany.email}</Typography>
                      <Typography><strong>Ngành nghề:</strong> {selectedCompany.industry || 'Chưa xác định'}</Typography>
                      <Typography><strong>Quy mô:</strong> {getCompanySizeDisplay(selectedCompany.size)}</Typography>
                      <Typography><strong>Ngày tạo:</strong> {new Date(selectedCompany.createdAt).toLocaleString()}</Typography>
                      {selectedCompany.website && <Typography><strong>Website:</strong> {selectedCompany.website}</Typography>}
                      {selectedCompany.phone && <Typography><strong>Điện thoại:</strong> {selectedCompany.phone}</Typography>}
                      {selectedCompany.address && <Typography><strong>Địa chỉ:</strong> {selectedCompany.address}</Typography>}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Trạng thái xác thực
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography><strong>Trạng thái:</strong></Typography>
                        <Chip
                          label={getStatusLabel(selectedCompany.verificationStatus)}
                          color={getStatusColor(selectedCompany.verificationStatus)}
                          size="small"
                        />
                      </Box>
                      <Typography><strong>Đã xác thực:</strong> {selectedCompany.isVerified ? 'Có' : 'Không'}</Typography>
                      <Typography><strong>Số công việc đã đăng:</strong> {selectedCompany.jobsCount}</Typography>
                      {selectedCompany.verificationDate && (
                        <Typography><strong>Ngày xác thực:</strong> {new Date(selectedCompany.verificationDate).toLocaleString()}</Typography>
                      )}
                      {selectedCompany.verificationReason && (
                        <Typography><strong>Lý do:</strong> {selectedCompany.verificationReason}</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Mô tả công ty
                      </Typography>
                      <Typography>
                        {selectedCompany.description || 'Chưa có mô tả.'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyManagement;
