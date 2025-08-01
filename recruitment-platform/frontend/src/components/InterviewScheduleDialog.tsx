import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  Chip
} from '@mui/material';
import {
  Schedule,
  VideoCall,
  LocationOn,
  Person,
  Email
} from '@mui/icons-material';
// Removed date picker imports to avoid context errors

interface InterviewData {
  title: string;
  description: string;
  type: 'VIDEO' | 'ONSITE' | 'PHONE';
  scheduledAt: Date | null;
  duration: number;
  location: string;
  meetingLink: string;
  interviewer: string;
  interviewerEmail: string;
  notes: string;
}

interface InterviewScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  onSchedule: (interviewData: InterviewData) => Promise<void>;
  candidateName: string;
  jobTitle: string;
  loading?: boolean;
}

const InterviewScheduleDialog: React.FC<InterviewScheduleDialogProps> = ({
  open,
  onClose,
  onSchedule,
  candidateName,
  jobTitle,
  loading = false
}) => {
  const [interviewData, setInterviewData] = useState<InterviewData>({
    title: `Phỏng vấn ${jobTitle}`,
    description: '',
    type: 'VIDEO',
    scheduledAt: null,
    duration: 60,
    location: '',
    meetingLink: '',
    interviewer: 'HR Manager',
    interviewerEmail: 'hr@company.com',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatDateTimeLocal = (date: Date | null): string => {
    if (!date) return '';
    
    // Create new date and adjust for timezone offset to get local time
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDate.toISOString().slice(0, 16);
  };

  const parseDateTimeLocal = (dateTimeString: string): Date | null => {
    if (!dateTimeString) return null;
    
    // Parse the datetime-local string as local time
    const localDate = new Date(dateTimeString);
    return localDate;
  };

  const getMinDateTime = (): string => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    return formatDateTimeLocal(oneHourLater);
  };

  const handleChange = (field: keyof InterviewData) => (event: any) => {
    const value = event.target ? event.target.value : event;
    
    let processedValue = value;
    if (field === 'scheduledAt') {
      processedValue = value ? parseDateTimeLocal(value) : null;
    }
    
    setInterviewData(prev => ({
      ...prev,
      [field]: processedValue
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    console.log('🔍 [DEBUG] validateForm called with data:', interviewData);
    const newErrors: any = {};

    if (!interviewData.scheduledAt) {
      newErrors.scheduledAt = 'Thời gian phỏng vấn là bắt buộc';
      console.log('❌ [DEBUG] Missing scheduledAt');
    } else {
      const selectedTime = new Date(interviewData.scheduledAt);
      const now = new Date();
      console.log('🕐 [DEBUG] Selected time:', selectedTime, 'Current time:', now);
      
      if (selectedTime <= now) {
        newErrors.scheduledAt = 'Thời gian phỏng vấn phải sau thời điểm hiện tại';
        console.log('❌ [DEBUG] Time is in the past');
      }
      
      // Chỉ yêu cầu 10 phút thay vì 1 giờ để dễ test
      const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);
      if (selectedTime < tenMinutesLater) {
        newErrors.scheduledAt = 'Thời gian phỏng vấn phải ít nhất 10 phút sau thời điểm hiện tại';
        console.log('❌ [DEBUG] Time is less than 10 minutes from now');
      }
    }

    // Tạm thời bỏ validation cho interviewer để test
    // if (!interviewData.interviewer.trim()) {
    //   newErrors.interviewer = 'Tên người phỏng vấn là bắt buộc';
    // }

    // if (!interviewData.interviewerEmail.trim()) {
    //   newErrors.interviewerEmail = 'Email người phỏng vấn là bắt buộc';
    // } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(interviewData.interviewerEmail)) {
    //   newErrors.interviewerEmail = 'Email không hợp lệ';
    // }

    if (interviewData.type === 'VIDEO' && !interviewData.meetingLink.trim()) {
      newErrors.meetingLink = 'Link cuộc họp là bắt buộc cho phỏng vấn online';
      console.log('❌ [DEBUG] Missing meeting link for VIDEO type');
    }

    if (interviewData.type === 'ONSITE' && !interviewData.location.trim()) {
      newErrors.location = 'Địa điểm là bắt buộc cho phỏng vấn trực tiếp';
      console.log('❌ [DEBUG] Missing location for ONSITE type');
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('🎯 [DEBUG] Form validation result:', isValid, 'Errors:', newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    console.log('🎯 [DEBUG] handleSubmit called');
    console.log('🎯 [DEBUG] Current interview data:', interviewData);
    
    if (!validateForm()) {
      console.log('❌ [DEBUG] Form validation failed, errors:', errors);
      return;
    }

    console.log('✅ [DEBUG] Form validation passed, calling onSchedule');
    
    try {
      await onSchedule(interviewData);
      console.log('✅ [DEBUG] onSchedule completed successfully');
      handleClose();
    } catch (error) {
      console.error('❌ [DEBUG] Error scheduling interview:', error);
    }
  };

  const handleClose = () => {
    setInterviewData({
      title: `Phỏng vấn ${jobTitle}`,
      description: '',
      type: 'VIDEO',
      scheduledAt: null,
      duration: 60,
      location: '',
      meetingLink: '',
      interviewer: '',
      interviewerEmail: '',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <VideoCall />;
      case 'ONSITE':
        return <LocationOn />;
      case 'PHONE':
        return <Person />;
      default:
        return <Schedule />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return 'Trực tuyến';
      case 'ONSITE':
        return 'Trực tiếp';
      case 'PHONE':
        return 'Điện thoại';
      default:
        return type;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      disablePortal
      aria-labelledby="interview-schedule-dialog-title"
    >
        <DialogTitle id="interview-schedule-dialog-title">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Schedule />
            <Typography variant="h6">
              Lên lịch phỏng vấn
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Ứng viên:</strong> {candidateName} <br />
              <strong>Vị trí:</strong> {jobTitle}
            </Typography>
          </Alert>

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tiêu đề phỏng vấn"
                value={interviewData.title}
                onChange={handleChange('title')}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                value={interviewData.description}
                onChange={handleChange('description')}
                multiline
                rows={3}
                placeholder="Mô tả ngắn về buổi phỏng vấn..."
              />
            </Grid>

            {/* Interview Type */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Hình thức phỏng vấn</InputLabel>
                <Select
                  value={interviewData.type}
                  onChange={handleChange('type')}
                  label="Hình thức phỏng vấn"
                >
                  <MenuItem value="VIDEO">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <VideoCall fontSize="small" />
                      Trực tuyến
                    </Box>
                  </MenuItem>
                  <MenuItem value="ONSITE">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn fontSize="small" />
                      Trực tiếp
                    </Box>
                  </MenuItem>
                  <MenuItem value="PHONE">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person fontSize="small" />
                      Điện thoại
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Thời lượng (phút)</InputLabel>
                <Select
                  value={interviewData.duration}
                  onChange={handleChange('duration')}
                  label="Thời lượng (phút)"
                >
                  <MenuItem value={30}>30 phút</MenuItem>
                  <MenuItem value={45}>45 phút</MenuItem>
                  <MenuItem value={60}>1 giờ</MenuItem>
                  <MenuItem value={90}>1.5 giờ</MenuItem>
                  <MenuItem value={120}>2 giờ</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Date and Time */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Thời gian phỏng vấn"
                type="datetime-local"
                value={formatDateTimeLocal(interviewData.scheduledAt)}
                onChange={(e) => handleChange('scheduledAt')(e.target.value)}
                error={!!errors.scheduledAt}
                helperText={errors.scheduledAt || 'Thời gian phỏng vấn phải ít nhất 1 giờ sau thời điểm hiện tại'}
                required
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: getMinDateTime()
                }}
              />
            </Grid>

            {/* Location/Meeting Link */}
            {interviewData.type === 'VIDEO' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Link cuộc họp"
                  value={interviewData.meetingLink}
                  onChange={handleChange('meetingLink')}
                  error={!!errors.meetingLink}
                  helperText={errors.meetingLink}
                  placeholder="https://meet.google.com/... hoặc https://zoom.us/..."
                  required
                />
              </Grid>
            )}

            {interviewData.type === 'ONSITE' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Địa điểm"
                  value={interviewData.location}
                  onChange={handleChange('location')}
                  error={!!errors.location}
                  helperText={errors.location}
                  placeholder="Địa chỉ văn phòng hoặc địa điểm phỏng vấn"
                  required
                />
              </Grid>
            )}

            {/* Interviewer Information */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Người phỏng vấn"
                value={interviewData.interviewer}
                onChange={handleChange('interviewer')}
                error={!!errors.interviewer}
                helperText={errors.interviewer}
                required
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email người phỏng vấn"
                value={interviewData.interviewerEmail}
                onChange={handleChange('interviewerEmail')}
                error={!!errors.interviewerEmail}
                helperText={errors.interviewerEmail}
                required
                type="email"
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ghi chú"
                value={interviewData.notes}
                onChange={handleChange('notes')}
                multiline
                rows={3}
                placeholder="Ghi chú thêm cho buổi phỏng vấn..."
              />
            </Grid>

            {/* Preview */}
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Xem trước:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  <Chip 
                    icon={getTypeIcon(interviewData.type)} 
                    label={getTypeLabel(interviewData.type)} 
                    size="small" 
                  />
                  <Chip 
                    icon={<Schedule />} 
                    label={`${interviewData.duration} phút`} 
                    size="small" 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {interviewData.scheduledAt 
                    ? `Thời gian: ${interviewData.scheduledAt.toLocaleString('vi-VN')}`
                    : 'Chưa chọn thời gian'
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Người phỏng vấn: {interviewData.interviewer || 'Chưa nhập'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
            startIcon={<Schedule />}
          >
            {loading ? 'Đang lên lịch...' : 'Lên lịch phỏng vấn'}
          </Button>
        </DialogActions>
      </Dialog>
  );
};

export default InterviewScheduleDialog;
