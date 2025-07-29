import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Divider,
  Avatar,
  Button,
  TextField,
  Grid,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
  CircularProgress,
  alpha,
  Card,
  CardContent,
  Chip,
  Tooltip,
  Skeleton
} from '@mui/material';
import {
  Person,
  Security,
  Notifications,
  Palette,
  Visibility,
  VisibilityOff,
  Save,
  Edit,
  Language,
  DarkMode,
  LightMode,
  DeleteOutline,
  CloudUpload
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useThemeSettings } from '../contexts/ThemeContext';
import { useTranslation } from '../contexts/LanguageContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
      style={{ padding: '24px 0' }}
    >
      {value === index && children}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, updateUser, logout } = useAuth();
  const { 
    language, 
    darkMode, 
    highContrast, 
    fontSize, 
    setLanguage, 
    setDarkMode, 
    setHighContrast, 
    setFontSize,
    saveSettings
  } = useThemeSettings();
  const { t } = useTranslation();
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Thêm trạng thái loading ban đầu
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Account settings
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Security settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [applicationUpdates, setApplicationUpdates] = useState(true);
  const [jobRecommendations, setJobRecommendations] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  
  // Load user data
  useEffect(() => {
    // Giả lập thời gian tải dữ liệu
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 800);
    
    if (user) {
      // For student profile
      if (user.role === 'STUDENT' && user.studentProfile) {
        setFirstName(user.studentProfile.firstName || '');
        setLastName(user.studentProfile.lastName || '');
        setPhone(user.studentProfile.phone || '');
        if (user.studentProfile.avatar) {
          setAvatarPreview(user.studentProfile.avatar);
        }
      }
      // For company profile
      else if (user.role === 'COMPANY' && user.companyProfile) {
        setFirstName(user.companyProfile.contactPerson || '');
        setPhone(user.companyProfile.phone || '');
        if (user.companyProfile.logo) {
          setAvatarPreview(user.companyProfile.logo);
        }
      }
      
      setEmail(user.email || '');
      
      // Load notification settings from localStorage
      const storedSettings = localStorage.getItem('userSettings');
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        setEmailNotifications(settings.emailNotifications ?? true);
        setApplicationUpdates(settings.applicationUpdates ?? true);
        setJobRecommendations(settings.jobRecommendations ?? true);
        setMessageNotifications(settings.messageNotifications ?? true);
        setMarketingEmails(settings.marketingEmails ?? false);
      }
    }
    
    return () => clearTimeout(timer);
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatar(file);
      
      // Preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setAvatarPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveAccountSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user context
      if (user?.role === 'STUDENT') {
        updateUser({
          studentProfile: {
            ...user.studentProfile,
            firstName,
            lastName,
            phone,
            avatar: avatarPreview
          }
        });
      } else if (user?.role === 'COMPANY') {
        updateUser({
          companyProfile: {
            ...user.companyProfile,
            contactPerson: firstName,
            phone,
            logo: avatarPreview
          }
        });
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới không khớp với xác nhận mật khẩu');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Có lỗi xảy ra khi thay đổi mật khẩu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const saveNotificationSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Lưu cài đặt thông báo vào localStorage
      const storedSettings = localStorage.getItem('userSettings');
      const currentSettings = storedSettings ? JSON.parse(storedSettings) : {};
      
      const updatedSettings = {
        ...currentSettings,
        emailNotifications,
        applicationUpdates,
        jobRecommendations,
        messageNotifications,
        marketingEmails
      };
      
      localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Có lỗi xảy ra khi lưu cài đặt. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const saveAppearanceSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Sử dụng ThemeContext để lưu cài đặt
      saveSettings();
      
      // Hiển thị thông báo thành công
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      // Hiển thị thông báo lỗi
      setError(t('errorSavingSettings'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          boxShadow: theme.customShadows?.card,
          overflow: 'hidden',
          position: 'relative',
          border: darkMode && highContrast ? '2px solid #4CC2FF' : undefined,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: highContrast 
              ? (darkMode ? '#4CC2FF' : '#0052CC')
              : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          {initialLoading ? (
            <>
              <Skeleton variant="text" width={200} height={40} sx={{ mr: 2 }} />
              <Skeleton variant="rounded" width={80} height={24} />
            </>
          ) : (
            <>
              <Typography variant="h4" component="h1" fontWeight={600} color="primary.main">
                {t('accountSettings')}
              </Typography>
              <Chip 
                label={user?.role === 'STUDENT' ? t('student') : user?.role === 'COMPANY' ? t('company') : t('admin')} 
                size="small" 
                color="primary" 
                sx={{ ml: 2 }}
              />
            </>
          )}
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          {initialLoading ? (
            <Box sx={{ display: 'flex', gap: 2, p: 1 }}>
              {[1, 2, 3, 4].map((item) => (
                <Skeleton key={item} variant="rounded" width={150} height={48} />
              ))}
            </Box>
          ) : (
            <Tabs 
              value={value} 
              onChange={handleTabChange} 
              aria-label="settings tabs"
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons={isMobile ? "auto" : undefined}
              allowScrollButtonsMobile
              sx={{
                '& .MuiTab-root': {
                  minWidth: isMobile ? 'auto' : 150,
                  fontWeight: 500,
                  borderRadius: highContrast ? '4px 4px 0 0' : undefined,
                  marginRight: highContrast ? 1 : undefined,
                },
                '& .Mui-selected': {
                  fontWeight: 600,
                  color: highContrast ? (darkMode ? '#4CC2FF' : '#0052CC') : undefined,
                },
                '& .MuiTabs-indicator': {
                  height: highContrast ? 3 : 2,
                  backgroundColor: highContrast ? (darkMode ? '#4CC2FF' : '#0052CC') : undefined,
                }
              }}
            >
              <Tab icon={<Person />} label={t('account')} {...a11yProps(0)} />
              <Tab icon={<Security />} label={t('security')} {...a11yProps(1)} />
              <Tab icon={<Notifications />} label={t('notificationsSettings')} {...a11yProps(2)} />
              <Tab icon={<Palette />} label={t('appearance')} {...a11yProps(3)} />
            </Tabs>
          )}
        </Box>
        
        {/* Account Settings */}
        <TabPanel value={value} index={0}>
          {initialLoading ? (
            <Grid container spacing={4}>
              <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Skeleton variant="circular" width={150} height={150} sx={{ mb: 2 }} />
                <Skeleton variant="rounded" width={120} height={36} sx={{ mb: 1 }} />
                <Skeleton variant="text" width={180} height={20} />
              </Grid>
              <Grid item xs={12} md={8}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Skeleton variant="rounded" height={56} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Skeleton variant="rounded" height={56} />
                  </Grid>
                  <Grid item xs={12}>
                    <Skeleton variant="rounded" height={56} />
                  </Grid>
                  <Grid item xs={12}>
                    <Skeleton variant="rounded" height={56} />
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Skeleton variant="rounded" width={120} height={36} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar
                    src={avatarPreview || undefined}
                    alt={firstName}
                    sx={{ 
                      width: 150, 
                      height: 150, 
                      mb: 2,
                      boxShadow: theme.shadows[2],
                      border: highContrast 
                        ? `4px solid ${darkMode ? '#4CC2FF' : '#0052CC'}` 
                        : `4px solid ${alpha(theme.palette.primary.main, 0.2)}`
                    }}
                  />
                  <Button
                    component="label"
                    variant={highContrast ? "contained" : "outlined"}
                    startIcon={<CloudUpload />}
                    sx={{ 
                      mb: 1,
                      fontWeight: highContrast ? 700 : undefined,
                      borderWidth: highContrast ? 2 : undefined,
                      color: highContrast && darkMode ? '#000000' : undefined,
                      backgroundColor: highContrast && darkMode ? '#4CC2FF' : undefined,
                      '&:hover': {
                        backgroundColor: highContrast && darkMode ? '#80D8FF' : undefined,
                        borderColor: highContrast && darkMode ? '#4CC2FF' : undefined,
                      }
                    }}
                  >
                    {t('changeAvatar')}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </Button>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    align="center"
                    sx={{
                      fontWeight: highContrast ? 600 : undefined,
                      color: highContrast && darkMode ? '#EEEEEE' : undefined
                    }}
                  >
                    {t('avatarRecommendation')}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Grid container spacing={3}>
                  {user?.role === 'STUDENT' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label={t('firstName')}
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: highContrast ? 2 : undefined,
                              '& fieldset': {
                                borderWidth: highContrast ? 2 : undefined,
                                borderColor: highContrast && darkMode ? '#AAAAAA' : undefined,
                              },
                              '&:hover fieldset': {
                                borderColor: highContrast && darkMode ? '#FFFFFF' : undefined,
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: highContrast ? (darkMode ? '#4CC2FF' : '#0052CC') : undefined,
                                borderWidth: highContrast ? 2 : undefined,
                              },
                            },
                            '& .MuiInputLabel-root': {
                              color: highContrast && darkMode ? '#AAAAAA' : undefined,
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: highContrast ? (darkMode ? '#4CC2FF' : '#0052CC') : undefined,
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Tên"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          variant="outlined"
                        />
                      </Grid>
                    </>
                  )}
                  
                  {user?.role === 'COMPANY' && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Người liên hệ"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        variant="outlined"
                      />
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={email}
                      disabled
                      variant="outlined"
                      helperText="Email không thể thay đổi"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={saveAccountSettings}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                        sx={{
                          fontWeight: highContrast ? 700 : 600,
                          boxShadow: highContrast ? 4 : undefined,
                          border: highContrast ? `2px solid ${darkMode ? '#4CC2FF' : '#0052CC'}` : undefined,
                          color: highContrast && darkMode ? '#000000' : undefined,
                          backgroundColor: highContrast && darkMode ? '#4CC2FF' : undefined,
                          '&:hover': {
                            backgroundColor: highContrast && darkMode ? '#80D8FF' : undefined,
                          }
                        }}
                      >
                        {t('saveChanges')}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </TabPanel>
        
        {/* Security Settings */}
        <TabPanel value={value} index={1}>
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Card sx={{ 
              mb: 4, 
              boxShadow: theme.customShadows?.card,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
              }
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Thay đổi mật khẩu
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                {initialLoading ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Skeleton variant="rounded" height={56} />
                    </Grid>
                    <Grid item xs={12}>
                      <Skeleton variant="rounded" height={56} />
                    </Grid>
                    <Grid item xs={12}>
                      <Skeleton variant="rounded" height={56} />
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Skeleton variant="rounded" width={160} height={36} />
                    </Grid>
                  </Grid>
                ) : (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Mật khẩu hiện tại"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        variant="outlined"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                edge="end"
                              >
                                {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Mật khẩu mới"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        variant="outlined"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                edge="end"
                              >
                                {showNewPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Xác nhận mật khẩu mới"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        variant="outlined"
                        error={newPassword !== confirmPassword && confirmPassword !== ''}
                        helperText={
                          newPassword !== confirmPassword && confirmPassword !== ''
                            ? 'Mật khẩu không khớp'
                            : ''
                        }
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={changePassword}
                          disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                        >
                          Cập nhật mật khẩu
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
            
            <Card sx={{ 
              boxShadow: theme.customShadows?.card,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
              }
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error">
                  Xóa tài khoản
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                {initialLoading ? (
                  <>
                    <Skeleton variant="text" height={80} />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Skeleton variant="rounded" width={140} height={36} />
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" paragraph>
                      Khi bạn xóa tài khoản, tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn và không thể khôi phục.
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteOutline />}
                      >
                        Xóa tài khoản
                      </Button>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
        
        {/* Notification Settings */}
        <TabPanel value={value} index={2}>
          <Box sx={{ maxWidth: 700, mx: 'auto' }}>
            <Card sx={{ 
              mb: 4, 
              boxShadow: theme.customShadows?.card,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
              }
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Thông báo qua email
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                {initialLoading ? (
                  <Grid container spacing={2}>
                    {[1, 2, 3, 4, 5].map((item) => (
                      <Grid item xs={12} key={item}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Skeleton variant="rounded" width={42} height={24} sx={{ mr: 1 }} />
                          <Skeleton variant="text" width={200} />
                        </Box>
                      </Grid>
                    ))}
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Skeleton variant="rounded" width={120} height={36} />
                    </Grid>
                  </Grid>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={emailNotifications}
                            onChange={(e) => setEmailNotifications(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Cho phép thông báo qua email"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={applicationUpdates}
                            onChange={(e) => setApplicationUpdates(e.target.checked)}
                            color="primary"
                            disabled={!emailNotifications}
                          />
                        }
                        label="Cập nhật về đơn ứng tuyển"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={jobRecommendations}
                            onChange={(e) => setJobRecommendations(e.target.checked)}
                            color="primary"
                            disabled={!emailNotifications}
                          />
                        }
                        label="Gợi ý việc làm phù hợp"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={messageNotifications}
                            onChange={(e) => setMessageNotifications(e.target.checked)}
                            color="primary"
                            disabled={!emailNotifications}
                          />
                        }
                        label="Thông báo tin nhắn mới"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={marketingEmails}
                            onChange={(e) => setMarketingEmails(e.target.checked)}
                            color="primary"
                            disabled={!emailNotifications}
                          />
                        }
                        label="Email quảng cáo và khuyến mãi"
                      />
                    </Grid>
                  
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={saveNotificationSettings}
                          disabled={loading}
                          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                        >
                          Lưu cài đặt
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
        
        {/* Appearance Settings */}
        <TabPanel value={value} index={3}>
          <Box sx={{ maxWidth: 700, mx: 'auto' }}>
            <Card sx={{ 
              mb: 4, 
              boxShadow: theme.customShadows?.card,
              transition: 'transform 0.3s, box-shadow 0.3s',
              border: darkMode && highContrast ? '1px solid #4CC2FF' : undefined,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8],
                borderColor: darkMode && highContrast ? '#80D8FF' : undefined,
              }
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Ngôn ngữ và hiển thị
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                {initialLoading ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        <Skeleton width={100} />
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
                        <Skeleton variant="rounded" height={40} width="100%" />
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        <Skeleton width={120} />
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
                        <Skeleton variant="text" width={200} />
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        <Skeleton width={150} />
                      </Typography>
                      <Skeleton variant="text" width={200} />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        <Skeleton width={120} />
                      </Typography>
                      <Skeleton variant="rounded" height={40} width="100%" />
                    </Grid>
                    
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Skeleton variant="rounded" width={120} height={36} />
                    </Grid>
                  </Grid>
                ) : (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('language')}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Language sx={{ mr: 1, color: 'primary.main' }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <TextField
                            select
                            fullWidth
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            SelectProps={{
                              native: true,
                            }}
                            variant="outlined"
                            size="small"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: highContrast ? 2 : undefined,
                                '& fieldset': {
                                  borderWidth: highContrast ? 2 : undefined,
                                  borderColor: highContrast && darkMode ? '#AAAAAA' : undefined,
                                },
                                '&:hover fieldset': {
                                  borderColor: highContrast && darkMode ? '#FFFFFF' : undefined,
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: highContrast ? (darkMode ? '#4CC2FF' : '#0052CC') : undefined,
                                  borderWidth: highContrast ? 2 : undefined,
                                },
                              },
                            }}
                          >
                            <option value="vi">Tiếng Việt</option>
                            <option value="en">English</option>
                          </TextField>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('displayMode')}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {darkMode ? (
                          <DarkMode sx={{ mr: 1, color: 'primary.main' }} />
                        ) : (
                          <LightMode sx={{ mr: 1, color: 'warning.main' }} />
                        )}
                        <Box sx={{ flexGrow: 1 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={darkMode}
                                onChange={(e) => setDarkMode(e.target.checked)}
                                color="primary"
                                sx={{
                                  '& .MuiSwitch-thumb': {
                                    backgroundColor: highContrast ? (darkMode ? '#4CC2FF' : '#0052CC') : undefined,
                                  },
                                  '& .MuiSwitch-track': {
                                    backgroundColor: highContrast ? (darkMode ? '#80D8FF50' : '#4C9AFF50') : undefined,
                                  },
                                }}
                              />
                            }
                            label={darkMode ? t('darkMode') : t('lightMode')}
                            sx={{
                              '& .MuiFormControlLabel-label': {
                                fontWeight: highContrast ? 600 : undefined,
                              }
                            }}
                          />
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('highContrast')}
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={highContrast}
                            onChange={(e) => setHighContrast(e.target.checked)}
                            color="primary"
                          />
                        }
                        label={t('enableHighContrast')}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('fontSize')}
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        value={fontSize}
                        onChange={(e) => setFontSize(e.target.value)}
                        SelectProps={{
                          native: true,
                        }}
                        variant="outlined"
                        size="small"
                      >
                        <option value="small">{t('small')}</option>
                        <option value="medium">{t('medium')}</option>
                        <option value="large">{t('large')}</option>
                      </TextField>
                    </Grid>
                  
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        <Button
                          variant="contained"
                          color={highContrast ? "primary" : "primary"}
                          onClick={saveAppearanceSettings}
                          disabled={loading}
                          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                          sx={{
                            fontWeight: highContrast ? 700 : 600,
                            boxShadow: highContrast ? 4 : undefined,
                            border: highContrast ? `2px solid ${darkMode ? '#4CC2FF' : '#0052CC'}` : undefined,
                          }}
                        >
                          {t('saveSettings')}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Paper>
      
      {/* Success and Error Messages */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          {t('settingsSaved')}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error || t('errorSavingSettings')}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SettingsPage; 