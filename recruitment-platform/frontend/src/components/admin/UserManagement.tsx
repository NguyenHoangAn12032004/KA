import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Avatar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Block as BlockIcon,
  CheckCircle as VerifyIcon,
  PersonAdd as ImpersonateIcon,
  Search as SearchIcon
} from '@mui/icons-material';

// Local AdminUserAction type to match backend
interface AdminUserAction {
  action: 'SUSPEND' | 'ACTIVATE' | 'VERIFY' | 'DELETE' | 'PROMOTE' | 'DEMOTE' | 'IMPERSONATE';
  reason?: string;
}

// Local User type to match API response
interface User {
  id: string;
  email: string;
  role: 'STUDENT' | 'COMPANY' | 'ADMIN' | 'HR_MANAGER';
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  student_profiles?: {
    firstName: string;
    lastName: string;
    university?: string;
    major?: string;
  } | null;
  company_profiles?: {
    companyName: string;
    industry?: string;
    isVerified: boolean;
  } | null;
}

interface UserManagementProps {
  onUserUpdate?: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onUserUpdate }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('');
  
  // Dialog states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionDialog, setActionDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [actionType, setActionType] = useState<AdminUserAction['action'] | null>(null);
  const [actionReason, setActionReason] = useState('');

  useEffect(() => {
    loadUsers();
  }, [page, rowsPerPage, search, roleFilter, verifiedFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Direct API call like AdminControlPanel
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: search || undefined,
          role: roleFilter || undefined,
          verified: verifiedFilter ? verifiedFilter === 'true' : undefined
        }
      });
      
      console.log('🧪 UserManagement API response:', response.data);
      
      // Handle response structure
      const responseData = response.data.data || response.data;
      const users = responseData.users || [];
      const total = responseData.pagination?.total || responseData.total || 0;
      
      setUsers(users);
      setTotalUsers(total);
      setError(null);
    } catch (error) {
      console.error('Failed to load users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (user: User, action: AdminUserAction['action']) => {
    setSelectedUser(user);
    setActionType(action);
    setActionDialog(true);
  };

  const executeUserAction = async () => {
    if (!selectedUser || !actionType) return;

    try {
      const token = localStorage.getItem('token');
      
      await axios.post(`http://localhost:5000/api/admin/users/${selectedUser.id}/action`, {
        action: actionType,
        reason: actionReason || undefined
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      setActionDialog(false);
      setActionReason('');
      setSelectedUser(null);
      setActionType(null);
      loadUsers();
      onUserUpdate?.();
      
      // Show success message
      setError(null);
    } catch (error: any) {
      console.error('Failed to execute user action:', error);
      setError(error.response?.data?.error || 'Failed to execute action');
    }
  };

  const handleImpersonate = async (user: User) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`http://localhost:5000/api/admin/users/${user.id}/impersonate`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      // Update token and reload page to switch context
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('isImpersonating', 'true');
      localStorage.setItem('originalAdminId', response.data.data.user.originalAdminId);
      
      // Show success message and reload
      alert(`Now impersonating ${user.email}. You will be redirected.`);
      window.location.href = '/'; // Redirect to main page as impersonated user
      
    } catch (error: any) {
      console.error('Failed to impersonate user:', error);
      setError(error.response?.data?.error || 'Failed to impersonate user');
    }
  };

  const handleViewUser = async (user: User) => {
    try {
      // For now, just set the user we already have
      setSelectedUser(user);
      setViewDialog(true);
      
      // TODO: Implement detailed user fetch with direct axios call if needed
      // const response = await axios.get(`http://localhost:5000/api/admin/users/${user.id}`, {
      //   headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      // });
      // setSelectedUser(response.data);
    } catch (error) {
      console.error('Failed to load user details:', error);
      setError('Failed to load user details');
    }
  };

  const getActionLabel = (action: AdminUserAction['action']) => {
    switch (action) {
      case 'SUSPEND': return 'Suspend User';
      case 'ACTIVATE': return 'Activate User';
      case 'VERIFY': return 'Verify User';
      case 'DELETE': return 'Delete User';
      case 'PROMOTE': return 'Promote User';
      case 'DEMOTE': return 'Demote User';
      case 'IMPERSONATE': return 'Impersonate User';
      default: return action;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'HR_MANAGER': return 'warning';
      case 'COMPANY': return 'info';
      case 'STUDENT': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField
              label="Search Users"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ minWidth: 200 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                label="Role"
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="STUDENT">Student</MenuItem>
                <MenuItem value="COMPANY">Company</MenuItem>
                <MenuItem value="HR_MANAGER">HR Manager</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Verified</InputLabel>
              <Select
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value)}
                label="Verified"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Verified</MenuItem>
                <MenuItem value="false">Unverified</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={loadUsers}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Users Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(users || []).map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {user.student_profiles 
                            ? `${user.student_profiles.firstName} ${user.student_profiles.lastName}`
                            : user.company_profiles?.companyName || user.email.split('@')[0]
                          }
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {user.id.slice(0, 8)}...
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Suspended'}
                      color={user.isActive ? 'success' : 'error'}
                      size="small"
                    />
                    {user.isVerified && (
                      <Chip
                        label="Verified"
                        color="info"
                        size="small"
                        sx={{ ml: 0.5 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewUser(user)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {!user.isVerified && (
                        <Tooltip title="Verify User">
                          <IconButton
                            size="small"
                            onClick={() => handleUserAction(user, 'VERIFY')}
                            color="success"
                          >
                            <VerifyIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      {user.isActive ? (
                        <Tooltip title="Suspend User">
                          <IconButton
                            size="small"
                            onClick={() => handleUserAction(user, 'SUSPEND')}
                            color="warning"
                          >
                            <BlockIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Activate User">
                          <IconButton
                            size="small"
                            onClick={() => handleUserAction(user, 'ACTIVATE')}
                            color="success"
                          >
                            <VerifyIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title="Impersonate User">
                        <IconButton
                          size="small"
                          onClick={() => handleImpersonate(user)}
                          color="info"
                        >
                          <ImpersonateIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete User">
                        <IconButton
                          size="small"
                          onClick={() => handleUserAction(user, 'DELETE')}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalUsers}
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

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialog} onClose={() => setActionDialog(false)}>
        <DialogTitle>
          {getActionLabel(actionType!)}
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to {actionType?.toLowerCase()} user "{selectedUser?.student_profiles 
              ? `${selectedUser.student_profiles.firstName} ${selectedUser.student_profiles.lastName}`
              : selectedUser?.company_profiles?.companyName || selectedUser?.email.split('@')[0]
            }"?
          </Typography>
          <TextField
            fullWidth
            label="Reason (Optional)"
            multiline
            rows={3}
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={executeUserAction}
            color="primary"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog 
        open={viewDialog} 
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          User Details
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedUser.student_profiles 
                  ? `${selectedUser.student_profiles.firstName} ${selectedUser.student_profiles.lastName}`
                  : selectedUser.company_profiles?.companyName || selectedUser.email.split('@')[0]
                }
              </Typography>
              <Typography><strong>Email:</strong> {selectedUser.email}</Typography>
              <Typography><strong>Role:</strong> {selectedUser.role}</Typography>
              <Typography><strong>Verified:</strong> {selectedUser.isVerified ? 'Yes' : 'No'}</Typography>
              <Typography><strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</Typography>
              {selectedUser.lastLogin && (
                <Typography><strong>Last Login:</strong> {new Date(selectedUser.lastLogin).toLocaleString()}</Typography>
              )}
              
              {(selectedUser.student_profiles || selectedUser.company_profiles) && (
                <Box mt={2}>
                  <Typography variant="h6">Profile Information</Typography>
                  {selectedUser.student_profiles && (
                    <Box>
                      <Typography><strong>University:</strong> {selectedUser.student_profiles.university || 'N/A'}</Typography>
                      <Typography><strong>Major:</strong> {selectedUser.student_profiles.major || 'N/A'}</Typography>
                    </Box>
                  )}
                  {selectedUser.company_profiles && (
                    <Box>
                      <Typography><strong>Company:</strong> {selectedUser.company_profiles.companyName}</Typography>
                      <Typography><strong>Industry:</strong> {selectedUser.company_profiles.industry || 'N/A'}</Typography>
                      <Typography><strong>Company Verified:</strong> {selectedUser.company_profiles.isVerified ? 'Yes' : 'No'}</Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
