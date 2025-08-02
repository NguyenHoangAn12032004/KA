import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Chip,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  Pagination,
  Alert
} from '@mui/material';
import {
  Email,
  Phone,
  GitHub,
  LinkedIn,
  Description
} from '@mui/icons-material';
import axios from 'axios';

export interface Job {
  id: string;
  title: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  responsibilities?: string[];
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | "FREELANCE";
  workMode?: "ONSITE" | "REMOTE" | "HYBRID";
  experienceLevel?: "ENTRY" | "JUNIOR" | "MID" | "SENIOR" | "LEAD";
  requiredSkills?: string[];
  preferredSkills?: string[];
  isActive: boolean;
  viewCount?: number;
  applicationsCount?: number;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  applicationDeadline?: string;
  maxApplications?: number;
  department?: string;
  qualifications?: string[];
  reportingTo?: string;
}

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  coverLetter?: string;
  customResume?: string;
  rating?: number;
  hrNotes?: string;
  feedback?: string;
  student: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    avatar?: string;
    major?: string;
    university?: string;
    graduationYear?: number;
    skills: string[];
    experience?: string;
    phone?: string;
    portfolio?: string;
    github?: string;
    linkedin?: string;
    resume?: string;
  };
}

interface JobActionModalProps {
  open: boolean;
  onClose: () => void;
  job: Job | null;
  action: 'view' | 'edit' | 'applications' | 'delete' | 'toggle-status' | null;
  onSave?: (jobData: Partial<Job>) => void;
  onDelete?: (jobId: string) => void;
  onToggleStatus?: (jobId: string, isActive: boolean) => void;
}

const JobActionModal: React.FC<JobActionModalProps> = ({
  open,
  onClose,
  job,
  action,
  onSave,
  onDelete,
  onToggleStatus
}) => {
  const [editData, setEditData] = useState<Partial<Job>>({});
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (job && action === 'edit') {
      setEditData({
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        benefits: job.benefits,
        responsibilities: job.responsibilities,
        location: job.location,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        jobType: job.jobType,
        workMode: job.workMode,
        experienceLevel: job.experienceLevel,
        requiredSkills: job.requiredSkills,
        preferredSkills: job.preferredSkills,
        applicationDeadline: job.applicationDeadline,
        maxApplications: job.maxApplications,
        department: job.department,
        qualifications: job.qualifications,
        reportingTo: job.reportingTo
      });
    }
  }, [job, action]);

  const fetchApplications = useCallback(async () => {
    if (!job) return;
    
    setApplicationsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/jobs/${job.id}/applications`,
        {
          params: {
            page: currentPage,
            limit: 10,
            status: filterStatus
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setApplications(response.data.data.applications);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      setError(error.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setApplicationsLoading(false);
    }
  }, [job, currentPage, filterStatus]);

  useEffect(() => {
    if (action === 'applications' && job && open) {
      fetchApplications();
    }
  }, [action, job, open, fetchApplications]);

  const handleSave = () => {
    if (onSave && editData) {
      onSave(editData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && job) {
      onDelete(job.id);
    }
    onClose();
  };

  const handleToggleStatus = () => {
    if (onToggleStatus && job) {
      onToggleStatus(job.id, !job.isActive);
    }
    onClose();
  };

  const handleInputChange = (field: keyof Job, value: any) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field: keyof Job, value: string) => {
    const arrayValue = value.split('\n').filter(item => item.trim() !== '');
    setEditData(prev => ({
      ...prev,
      [field]: arrayValue
    }));
  };

  const getDialogTitle = () => {
    switch (action) {
      case 'view':
        return 'Chi tiết tin tuyển dụng';
      case 'edit':
        return 'Chỉnh sửa tin tuyển dụng';
      case 'applications':
        return `Danh sách ứng viên - ${job?.title}`;
      case 'delete':
        return 'Xác nhận xóa';
      case 'toggle-status':
        return job?.isActive ? 'Tạm dừng tin tuyển dụng' : 'Kích hoạt tin tuyển dụng';
      default:
        return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'REVIEWED':
        return 'info';
      case 'ACCEPTED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xử lý';
      case 'REVIEWED':
        return 'Đã xem';
      case 'ACCEPTED':
        return 'Chấp nhận';
      case 'REJECTED':
        return 'Từ chối';
      default:
        return status;
    }
  };

  const renderViewContent = () => {
    if (!job) return null;

    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {job.title}
          </Typography>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="body2" color="textSecondary">
            Vị trí:
          </Typography>
          <Typography variant="body1">{job.location}</Typography>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="body2" color="textSecondary">
            Mức lương:
          </Typography>
          <Typography variant="body1">
            {job.salaryMin?.toLocaleString()} - {job.salaryMax?.toLocaleString()} VND
          </Typography>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="body2" color="textSecondary">
            Loại công việc:
          </Typography>
          <Typography variant="body1">{job.jobType}</Typography>
        </Grid>
        
        <Grid item xs={6}>
          <Typography variant="body2" color="textSecondary">
            Hình thức làm việc:
          </Typography>
          <Typography variant="body1">{job.workMode}</Typography>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="body2" color="textSecondary">
            Mô tả công việc:
          </Typography>
          <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
            {job.description}
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="body2" color="textSecondary">
            Yêu cầu:
          </Typography>
          <Box>
            {job.requirements?.map((req, index) => (
              <Typography key={index} variant="body2">
                • {req}
              </Typography>
            )) || <Typography variant="body2">Chưa có thông tin</Typography>}
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="body2" color="textSecondary">
            Kỹ năng yêu cầu:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
            {job.requiredSkills?.map((skill, index) => (
              <Chip key={index} label={skill} size="small" />
            ))}
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="body2" color="textSecondary">
            Thống kê:
          </Typography>
          <Typography variant="body2">
            Lượt xem: {job.viewCount} | Ứng viên: {job.applicationsCount}
          </Typography>
        </Grid>
      </Grid>
    );
  };

  const renderEditContent = () => {
    if (!job) return null;

    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Tiêu đề công việc"
            value={editData.title || ''}
            onChange={(e) => handleInputChange('title', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Địa điểm"
            value={editData.location || ''}
            onChange={(e) => handleInputChange('location', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={3}>
          <TextField
            fullWidth
            label="Lương tối thiểu"
            type="number"
            value={editData.salaryMin || ''}
            onChange={(e) => handleInputChange('salaryMin', parseInt(e.target.value))}
          />
        </Grid>
        
        <Grid item xs={3}>
          <TextField
            fullWidth
            label="Lương tối đa"
            type="number"
            value={editData.salaryMax || ''}
            onChange={(e) => handleInputChange('salaryMax', parseInt(e.target.value))}
          />
        </Grid>
        
        <Grid item xs={4}>
          <FormControl fullWidth>
            <InputLabel>Loại công việc</InputLabel>
            <Select
              value={editData.jobType || ''}
              onChange={(e) => handleInputChange('jobType', e.target.value)}
            >
              <MenuItem value="FULL_TIME">Toàn thời gian</MenuItem>
              <MenuItem value="PART_TIME">Bán thời gian</MenuItem>
              <MenuItem value="CONTRACT">Hợp đồng</MenuItem>
              <MenuItem value="INTERNSHIP">Thực tập</MenuItem>
              <MenuItem value="FREELANCE">Tự do</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={4}>
          <FormControl fullWidth>
            <InputLabel>Hình thức làm việc</InputLabel>
            <Select
              value={editData.workMode || ''}
              onChange={(e) => handleInputChange('workMode', e.target.value)}
            >
              <MenuItem value="ONSITE">Tại văn phòng</MenuItem>
              <MenuItem value="REMOTE">Từ xa</MenuItem>
              <MenuItem value="HYBRID">Lai</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={4}>
          <FormControl fullWidth>
            <InputLabel>Kinh nghiệm</InputLabel>
            <Select
              value={editData.experienceLevel || ''}
              onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
            >
              <MenuItem value="ENTRY">Mới tốt nghiệp</MenuItem>
              <MenuItem value="JUNIOR">1-2 năm</MenuItem>
              <MenuItem value="MID">3-5 năm</MenuItem>
              <MenuItem value="SENIOR">5+ năm</MenuItem>
              <MenuItem value="LEAD">Trưởng nhóm</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Mô tả công việc"
            multiline
            rows={4}
            value={editData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Yêu cầu (mỗi dòng một yêu cầu)"
            multiline
            rows={3}
            value={editData.requirements?.join('\n') || ''}
            onChange={(e) => handleArrayInputChange('requirements', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Quyền lợi (mỗi dòng một quyền lợi)"
            multiline
            rows={3}
            value={editData.benefits?.join('\n') || ''}
            onChange={(e) => handleArrayInputChange('benefits', e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Kỹ năng yêu cầu (mỗi dòng một kỹ năng)"
            multiline
            rows={2}
            value={editData.requiredSkills?.join('\n') || ''}
            onChange={(e) => handleArrayInputChange('requiredSkills', e.target.value)}
          />
        </Grid>
      </Grid>
    );
  };

  const renderApplicationsContent = () => {
    if (!job) return null;

    return (
      <Box>
        <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
          <FormControl size="small" style={{ minWidth: 150 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <MenuItem value="ALL">Tất cả</MenuItem>
              <MenuItem value="PENDING">Chờ xử lý</MenuItem>
              <MenuItem value="REVIEWED">Đã xem</MenuItem>
              <MenuItem value="ACCEPTED">Chấp nhận</MenuItem>
              <MenuItem value="REJECTED">Từ chối</MenuItem>
            </Select>
          </FormControl>
          
          <Typography variant="body2" color="textSecondary">
            Tổng: {applications.length} ứng viên
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ứng viên</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày nộp</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applicationsLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Chưa có ứng viên nào
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar 
                          src={application.student.avatar} 
                          alt={application.student.fullName}
                        >
                          {application.student.firstName?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {application.student.fullName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {application.student.major} - {application.student.university}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusText(application.status)}
                        color={getStatusColor(application.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(application.appliedAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        {application.student.email && (
                          <Tooltip title="Email">
                            <IconButton 
                              size="small"
                              onClick={() => window.open(`mailto:${application.student.email}`)}
                            >
                              <Email />
                            </IconButton>
                          </Tooltip>
                        )}
                        {application.student.phone && (
                          <Tooltip title="Điện thoại">
                            <IconButton 
                              size="small"
                              onClick={() => window.open(`tel:${application.student.phone}`)}
                            >
                              <Phone />
                            </IconButton>
                          </Tooltip>
                        )}
                        {application.student.github && (
                          <Tooltip title="GitHub">
                            <IconButton 
                              size="small"
                              onClick={() => window.open(application.student.github, '_blank')}
                            >
                              <GitHub />
                            </IconButton>
                          </Tooltip>
                        )}
                        {application.student.linkedin && (
                          <Tooltip title="LinkedIn">
                            <IconButton 
                              size="small"
                              onClick={() => window.open(application.student.linkedin, '_blank')}
                            >
                              <LinkedIn />
                            </IconButton>
                          </Tooltip>
                        )}
                        {application.student.resume && (
                          <Tooltip title="CV">
                            <IconButton 
                              size="small"
                              onClick={() => window.open(application.student.resume, '_blank')}
                            >
                              <Description />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, page) => setCurrentPage(page)}
              color="primary"
            />
          </Box>
        )}
      </Box>
    );
  };

  const renderDeleteContent = () => {
    return (
      <Box>
        <Typography variant="body1" gutterBottom>
          Bạn có chắc chắn muốn xóa tin tuyển dụng "{job?.title}"?
        </Typography>
        <Typography variant="body2" color="error">
          Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
        </Typography>
      </Box>
    );
  };

  const renderToggleStatusContent = () => {
    const isActivating = !job?.isActive;
    return (
      <Box>
        <Typography variant="body1" gutterBottom>
          Bạn có muốn {isActivating ? 'kích hoạt' : 'tạm dừng'} tin tuyển dụng "{job?.title}"?
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {isActivating 
            ? 'Tin tuyển dụng sẽ hiển thị trở lại cho ứng viên.'
            : 'Tin tuyển dụng sẽ tạm thời ẩn khỏi danh sách tìm kiếm.'
          }
        </Typography>
      </Box>
    );
  };

  const renderDialogActions = () => {
    switch (action) {
      case 'view':
        return (
          <Button onClick={onClose}>
            Đóng
          </Button>
        );
      case 'edit':
        return (
          <>
            <Button onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={handleSave} variant="contained">
              Lưu thay đổi
            </Button>
          </>
        );
      case 'applications':
        return (
          <Button onClick={onClose}>
            Đóng
          </Button>
        );
      case 'delete':
        return (
          <>
            <Button onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={handleDelete} variant="contained" color="error">
              Xóa
            </Button>
          </>
        );
      case 'toggle-status':
        return (
          <>
            <Button onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={handleToggleStatus} variant="contained">
              {job?.isActive ? 'Tạm dừng' : 'Kích hoạt'}
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (action) {
      case 'view':
        return renderViewContent();
      case 'edit':
        return renderEditContent();
      case 'applications':
        return renderApplicationsContent();
      case 'delete':
        return renderDeleteContent();
      case 'toggle-status':
        return renderToggleStatusContent();
      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth={action === 'applications' ? 'lg' : 'md'}
      fullWidth
    >
      <DialogTitle>{getDialogTitle()}</DialogTitle>
      <DialogContent>
        {renderContent()}
      </DialogContent>
      <DialogActions>
        {renderDialogActions()}
      </DialogActions>
    </Dialog>
  );
};

export default JobActionModal;
