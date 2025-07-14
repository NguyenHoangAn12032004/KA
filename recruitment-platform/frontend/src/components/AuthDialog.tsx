import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { Google, GitHub } from '@mui/icons-material';

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  initialTab?: number;
}

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: 'STUDENT' | 'COMPANY' | '';
  firstName: string;
  lastName: string;
  companyName: string;
}

const AuthDialog: React.FC<AuthDialogProps> = ({ open, onClose, initialTab = 0 }) => {
  const { login, register } = useAuth();
  const [tabValue, setTabValue] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginForm, setLoginForm] = useState<LoginFormData>({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    firstName: '',
    lastName: '',
    companyName: ''
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(loginForm.email, loginForm.password);
      setSuccess('Đăng nhập thành công!');
      
      setTimeout(() => {
        onClose();
        setSuccess('');
        setLoginForm({ email: '', password: '' });
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    if (!registerForm.role) {
      setError('Vui lòng chọn loại tài khoản');
      setLoading(false);
      return;
    }

    if (registerForm.role === 'STUDENT' && (!registerForm.firstName || !registerForm.lastName)) {
      setError('Vui lòng nhập họ và tên');
      setLoading(false);
      return;
    }

    if (registerForm.role === 'COMPANY' && !registerForm.companyName) {
      setError('Vui lòng nhập tên công ty');
      setLoading(false);
      return;
    }

    try {
      await register({
        email: registerForm.email,
        password: registerForm.password,
        role: registerForm.role,
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
        companyName: registerForm.companyName
      });
      
      setSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
      setTabValue(0); // Switch to login tab
      
      // Reset form
      setRegisterForm({
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        firstName: '',
        lastName: '',
        companyName: ''
      });
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'student' | 'company') => {
    const demoAccounts = {
      admin: { email: 'admin@recruitment.com', password: 'admin123' },
      student: { email: 'student@demo.com', password: 'demo123' },
      company: { email: 'company@demo.com', password: 'demo123' }
    };

    setLoading(true);
    setError('');

    try {
      await login(demoAccounts[role].email, demoAccounts[role].password);
      setSuccess('Đăng nhập thành công!');
      
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Đăng nhập demo thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h5" fontWeight="bold" component="span">
          🚀 Recruitment Platform
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Đăng nhập" />
            <Tab label="Đăng ký" />
          </Tabs>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Login Tab */}
        {tabValue === 0 && (
          <Box component="form" onSubmit={handleLoginSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Mật khẩu"
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              margin="normal"
              required
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Đăng nhập'}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Tài khoản demo
              </Typography>
            </Divider>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={() => handleDemoLogin('admin')}
              >
                Admin
              </Button>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={() => handleDemoLogin('student')}
              >
                Student
              </Button>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={() => handleDemoLogin('company')}
              >
                Company
              </Button>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Google />}
                sx={{ mb: 1 }}
              >
                Đăng nhập với Google
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GitHub />}
              >
                Đăng nhập với GitHub
              </Button>
            </Box>
          </Box>
        )}

        {/* Register Tab */}
        {tabValue === 1 && (
          <Box component="form" onSubmit={handleRegisterSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              margin="normal"
              required
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Mật khẩu"
                type="password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Xác nhận mật khẩu"
                type="password"
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                margin="normal"
                required
              />
            </Box>

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Loại tài khoản</InputLabel>
              <Select
                value={registerForm.role}
                label="Loại tài khoản"
                onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value as 'STUDENT' | 'COMPANY' })}
              >
                <MenuItem value="STUDENT">Sinh viên</MenuItem>
                <MenuItem value="COMPANY">Nhà tuyển dụng</MenuItem>
              </Select>
            </FormControl>

            {registerForm.role === 'STUDENT' && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Họ"
                  value={registerForm.firstName}
                  onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Tên"
                  value={registerForm.lastName}
                  onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                  margin="normal"
                  required
                />
              </Box>
            )}

            {registerForm.role === 'COMPANY' && (
              <TextField
                fullWidth
                label="Tên công ty"
                value={registerForm.companyName}
                onChange={(e) => setRegisterForm({ ...registerForm, companyName: e.target.value })}
                margin="normal"
                required
              />
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Đăng ký'}
            </Button>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Bằng việc đăng ký, bạn đồng ý với{' '}
              <Typography component="span" color="primary.main" sx={{ cursor: 'pointer' }}>
                Điều khoản sử dụng
              </Typography>{' '}
              và{' '}
              <Typography component="span" color="primary.main" sx={{ cursor: 'pointer' }}>
                Chính sách bảo mật
              </Typography>
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
