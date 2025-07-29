import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Chip,
  Divider,
  FormHelperText,
  alpha,
  useTheme,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add,
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Delete,
  Description,
  LocationOn,
  Money,
  Person,
  Save,
  Work
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { jobsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const CreateJobPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState({
    title: '',
    location: '',
    type: 'FULL_TIME',
    workMode: 'ONSITE',
    experienceLevel: 'ENTRY',
    description: '',
    requirements: '',
    benefits: '',
    salaryMin: '',
    salaryMax: '',
    currency: 'VND',
    skills: [] as string[],
    applicationDeadline: '',
    isActive: true
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newSkill, setNewSkill] = useState('');

  const steps = [
    'Thông tin cơ bản',
    'Mô tả chi tiết',
    'Yêu cầu & Đãi ngộ',
    'Xem trước & Đăng tin'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name) {
      setJobData({
        ...jobData,
        [name]: value
      });
      
      // Clear error when field is updated
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: ''
        });
      }
    }
  };

  const handleSkillAdd = () => {
    if (newSkill.trim() && !jobData.skills.includes(newSkill.trim())) {
      setJobData({
        ...jobData,
        skills: [...jobData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleSkillDelete = (skillToDelete: string) => {
    setJobData({
      ...jobData,
      skills: jobData.skills.filter(skill => skill !== skillToDelete)
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 0:
        if (!jobData.title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề công việc';
        if (!jobData.location.trim()) newErrors.location = 'Vui lòng nhập địa điểm làm việc';
        break;
      case 1:
        if (!jobData.description.trim()) newErrors.description = 'Vui lòng nhập mô tả công việc';
        break;
      case 2:
        if (!jobData.requirements.trim()) newErrors.requirements = 'Vui lòng nhập yêu cầu công việc';
        if (!jobData.benefits.trim()) newErrors.benefits = 'Vui lòng nhập phúc lợi';
        if (jobData.salaryMin && jobData.salaryMax && Number(jobData.salaryMin) > Number(jobData.salaryMax)) {
          newErrors.salaryMin = 'Lương tối thiểu không thể cao hơn lương tối đa';
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prevStep => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Xử lý applicationDeadline - đảm bảo định dạng ISO với thời gian
      let formattedDeadline = undefined;
      if (jobData.applicationDeadline) {
        // Thêm thời gian vào ngày (23:59:59)
        formattedDeadline = `${jobData.applicationDeadline}T23:59:59.999Z`;
      }
      
      // Format data for API
      const formattedData = {
        title: jobData.title,
        location: jobData.location,
        // Chỉ sử dụng jobType, không gửi cả type và jobType
        jobType: jobData.type,
        workMode: jobData.workMode,
        experienceLevel: jobData.experienceLevel,
        description: jobData.description,
        // Chuyển đổi các trường text thành mảng
        requirements: jobData.requirements.split('\n').filter(Boolean),
        benefits: jobData.benefits.split('\n').filter(Boolean),
        responsibilities: [],
        // Chuyển đổi các trường số
        salaryMin: jobData.salaryMin ? Number(jobData.salaryMin) : undefined,
        salaryMax: jobData.salaryMax ? Number(jobData.salaryMax) : undefined,
        currency: jobData.currency,
        // Chuyển skills thành requiredSkills
        requiredSkills: jobData.skills,
        // Sử dụng ngày đã định dạng
        applicationDeadline: formattedDeadline,
        isActive: true
      };
      
      console.log('Sending job data:', formattedData);
      const response = await jobsAPI.create(formattedData);
      console.log('Job created successfully:', response.data);
      
      toast.success('Tin tuyển dụng đã được đăng thành công!');
      navigate('/company-dashboard');
    } catch (error: any) {
      console.error('Error creating job:', error);
      let errorMessage = 'Có lỗi xảy ra khi đăng tin. Vui lòng thử lại sau.';
      
      // Get more detailed error information if available
      if (error && error.response && error.response.data && error.response.data.details) {
        errorMessage += ` Chi tiết: ${error.response.data.details}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tiêu đề công việc"
                name="title"
                value={jobData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa điểm làm việc"
                name="location"
                value={jobData.location}
                onChange={handleChange}
                error={!!errors.location}
                helperText={errors.location}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Loại công việc</InputLabel>
                <Select
                  name="type"
                  value={jobData.type}
                  onChange={handleChange}
                  label="Loại công việc"
                >
                  <MenuItem value="FULL_TIME">Toàn thời gian</MenuItem>
                  <MenuItem value="PART_TIME">Bán thời gian</MenuItem>
                  <MenuItem value="INTERNSHIP">Thực tập</MenuItem>
                  <MenuItem value="CONTRACT">Hợp đồng</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Hình thức làm việc</InputLabel>
                <Select
                  name="workMode"
                  value={jobData.workMode}
                  onChange={handleChange}
                  label="Hình thức làm việc"
                >
                  <MenuItem value="ONSITE">Tại văn phòng</MenuItem>
                  <MenuItem value="REMOTE">Từ xa</MenuItem>
                  <MenuItem value="HYBRID">Kết hợp</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Cấp bậc</InputLabel>
                <Select
                  name="experienceLevel"
                  value={jobData.experienceLevel}
                  onChange={handleChange}
                  label="Cấp bậc"
                >
                  <MenuItem value="ENTRY">Mới đi làm</MenuItem>
                  <MenuItem value="JUNIOR">Nhân viên</MenuItem>
                  <MenuItem value="INTERMEDIATE">Chuyên viên</MenuItem>
                  <MenuItem value="SENIOR">Trưởng nhóm/Quản lý</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Hạn nộp hồ sơ"
                name="applicationDeadline"
                type="date"
                value={jobData.applicationDeadline}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả công việc"
                name="description"
                value={jobData.description}
                onChange={handleChange}
                multiline
                rows={8}
                error={!!errors.description}
                helperText={errors.description}
                required
                placeholder="Mô tả chi tiết về công việc, trách nhiệm và vai trò..."
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Kỹ năng yêu cầu"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Nhập kỹ năng và nhấn Enter hoặc Thêm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSkillAdd();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSkillAdd}
                  startIcon={<Add />}
                >
                  Thêm
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {jobData.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => handleSkillDelete(skill)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Yêu cầu ứng viên"
                name="requirements"
                value={jobData.requirements}
                onChange={handleChange}
                multiline
                rows={5}
                error={!!errors.requirements}
                helperText={errors.requirements}
                required
                placeholder="Các yêu cầu về kinh nghiệm, bằng cấp, kỹ năng..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phúc lợi"
                name="benefits"
                value={jobData.benefits}
                onChange={handleChange}
                multiline
                rows={5}
                error={!!errors.benefits}
                helperText={errors.benefits}
                required
                placeholder="Các phúc lợi, chế độ đãi ngộ dành cho ứng viên..."
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Mức lương
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    label="Lương tối thiểu"
                    name="salaryMin"
                    value={jobData.salaryMin}
                    onChange={handleChange}
                    type="number"
                    error={!!errors.salaryMin}
                    helperText={errors.salaryMin}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    label="Lương tối đa"
                    name="salaryMax"
                    value={jobData.salaryMax}
                    onChange={handleChange}
                    type="number"
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Tiền tệ</InputLabel>
                    <Select
                      name="currency"
                      value={jobData.currency}
                      onChange={handleChange}
                      label="Tiền tệ"
                    >
                      <MenuItem value="VND">VND</MenuItem>
                      <MenuItem value="USD">USD</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Vui lòng kiểm tra lại thông tin trước khi đăng tin
            </Alert>
            
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {jobData.title}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Chip icon={<LocationOn />} label={jobData.location} />
                <Chip icon={<Work />} label={
                  jobData.type === 'FULL_TIME' ? 'Toàn thời gian' :
                  jobData.type === 'PART_TIME' ? 'Bán thời gian' :
                  jobData.type === 'INTERNSHIP' ? 'Thực tập' : 'Hợp đồng'
                } />
                <Chip icon={<Person />} label={
                  jobData.experienceLevel === 'ENTRY' ? 'Mới đi làm' :
                  jobData.experienceLevel === 'JUNIOR' ? 'Nhân viên' :
                  jobData.experienceLevel === 'INTERMEDIATE' ? 'Chuyên viên' : 'Trưởng nhóm/Quản lý'
                } />
              </Box>
              
              {(jobData.salaryMin || jobData.salaryMax) && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Mức lương: {jobData.salaryMin && `${Number(jobData.salaryMin).toLocaleString()} ${jobData.currency}`}
                    {jobData.salaryMin && jobData.salaryMax && ' - '}
                    {jobData.salaryMax && `${Number(jobData.salaryMax).toLocaleString()} ${jobData.currency}`}
                  </Typography>
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Mô tả công việc
              </Typography>
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                {jobData.description}
              </Typography>
              
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Yêu cầu ứng viên
              </Typography>
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                {jobData.requirements}
              </Typography>
              
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Phúc lợi
              </Typography>
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                {jobData.benefits}
              </Typography>
              
              {jobData.skills.length > 0 && (
                <>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Kỹ năng yêu cầu
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {jobData.skills.map((skill, index) => (
                      <Chip key={index} label={skill} />
                    ))}
                  </Box>
                </>
              )}
              
              {jobData.applicationDeadline && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Hạn nộp hồ sơ: {new Date(jobData.applicationDeadline).toLocaleDateString('vi-VN')}
                  </Typography>
                </Box>
              )}
            </Paper>
            
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <Grid container alignItems="center">
                <Grid item>
                  <Typography variant="body1">Trạng thái tin tuyển dụng:</Typography>
                </Grid>
                <Grid item sx={{ ml: 2 }}>
                  <Chip 
                    label={jobData.isActive ? "Đang hoạt động" : "Tạm dừng"} 
                    color={jobData.isActive ? "success" : "default"}
                    onClick={() => setJobData({...jobData, isActive: !jobData.isActive})}
                  />
                </Grid>
              </Grid>
            </FormControl>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          borderRadius: 3,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.95)} 0%, 
            ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
        }}
      >
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          Đăng tin tuyển dụng mới
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mt: 4 }}>
          {renderStepContent()}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
            sx={{ borderRadius: 2 }}
          >
            Quay lại
          </Button>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                disabled={loading}
                sx={{ 
                  borderRadius: 2,
                  px: 4,
                  py: 1,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                  }
                }}
              >
                {loading ? 'Đang xử lý...' : 'Đăng tin'}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                endIcon={<ArrowForward />}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                }}
              >
                Tiếp theo
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateJobPage; 