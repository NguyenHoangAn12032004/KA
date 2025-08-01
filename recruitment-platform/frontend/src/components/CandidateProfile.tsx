import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Avatar,
  Chip,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  ArrowBack,
  Email,
  Phone,
  LocationOn,
  School,
  Work,
  Star,
  Language,
  WorkspacePremium,
  GitHub,
  LinkedIn,
  Download,
  Schedule,
  Assignment,
  Person
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationsAPI, usersAPI } from '../services/api';
import { toast } from 'react-toastify';

interface CandidateProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  gpa?: number;
  skills?: string[];
  experience?: string;
  portfolio?: string;
  github?: string;
  linkedin?: string;
  resume?: string;
  educations?: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    gpa?: number;
    achievements?: string[];
  }>;
  workExperiences?: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
    skills?: string[];
    achievements?: string[];
  }>;
  languages?: Array<{
    name: string;
    proficiency: string;
    certification?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
  }>;
  projects?: Array<{
    title: string;
    description: string;
    technologies: string[];
    startDate: string;
    endDate?: string;
    current: boolean;
    githubUrl?: string;
    liveUrl?: string;
    imageUrl?: string;
  }>;
  applications?: Array<{
    id: string;
    jobTitle: string;
    status: string;
    appliedAt: string;
    companyName: string;
  }>;
}

const CandidateProfile: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState<CandidateProfileData | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId || studentId === 'undefined') {
      setError('ID ứng viên không hợp lệ');
      setLoading(false);
      // Redirect back to candidates page after 2 seconds
      setTimeout(() => {
        navigate('/candidates');
      }, 2000);
      return;
    }
    
    if (studentId) {
      loadCandidateProfile();
    }
  }, [studentId, navigate]);

  const loadCandidateProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user profile data
      const userResponse = await usersAPI.getById(studentId!);
      const userData = userResponse.data?.data || userResponse.data;
      
      // Debug: Log the actual API response structure
      console.log('🔍 User API Response:', userResponse);
      console.log('🔍 User Data:', userData);
      console.log('🔍 Student Profile:', userData?.studentProfile);
      
      // Get applications for this candidate
      const applicationsResponse = await applicationsAPI.getByStudent();
      const applications = applicationsResponse.data?.data || [];
      
      // Combine data with fallbacks and sample data for demonstration
      const profileData: CandidateProfileData = {
        id: userData.id,
        firstName: userData.studentProfile?.firstName || 'Chưa cập nhật',
        lastName: userData.studentProfile?.lastName || '',
        email: userData.email,
        phone: userData.studentProfile?.phone || 'Chưa cập nhật',
        avatar: userData.studentProfile?.avatar,
        university: userData.studentProfile?.university || 'Đại học Công nghệ Thông tin',
        major: userData.studentProfile?.major || 'Công nghệ Thông tin',
        graduationYear: userData.studentProfile?.graduationYear || 2024,
        gpa: userData.studentProfile?.gpa || 3.5,
        skills: userData.studentProfile?.skills?.length > 0 ? userData.studentProfile.skills : [
          'JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'SQL', 'Git', 'Docker'
        ],
        experience: userData.studentProfile?.experience || 'Sinh viên năm cuối với kinh nghiệm thực tập tại các công ty công nghệ.',
        portfolio: userData.studentProfile?.portfolio || 'https://portfolio-example.com',
        github: userData.studentProfile?.github || 'https://github.com/student-example',
        linkedin: userData.studentProfile?.linkedin || 'https://linkedin.com/in/student-example',
        resume: userData.studentProfile?.resume,
        educations: userData.studentProfile?.educations?.length > 0 ? userData.studentProfile.educations : [
          {
            id: '1',
            institution: 'Đại học Công nghệ Thông tin',
            degree: 'Cử nhân',
            major: 'Công nghệ Thông tin',
            startDate: '2020-09-01',
            endDate: '2024-06-30',
            gpa: 3.5,
            description: 'Chuyên ngành Kỹ thuật Phần mềm'
          }
        ],
        workExperiences: userData.studentProfile?.workExperiences?.length > 0 ? userData.studentProfile.workExperiences : [
          {
            id: '1',
            company: 'Công ty TNHH Công nghệ ABC',
            position: 'Thực tập sinh Frontend Developer',
            startDate: '2023-06-01',
            endDate: '2023-08-31',
            description: 'Phát triển giao diện web sử dụng React.js, tham gia dự án e-commerce.',
            technologies: ['React', 'JavaScript', 'CSS', 'Material-UI']
          }
        ],
        languages: userData.studentProfile?.languages?.length > 0 ? userData.studentProfile.languages : [
          {
            id: '1',
            name: 'Tiếng Việt',
            level: 'Bản ngữ'
          },
          {
            id: '2',
            name: 'Tiếng Anh',
            level: 'Trung cấp (B2)'
          }
        ],
        certifications: userData.studentProfile?.certifications?.length > 0 ? userData.studentProfile.certifications : [
          {
            id: '1',
            name: 'AWS Cloud Practitioner',
            issuer: 'Amazon Web Services',
            issueDate: '2023-12-01',
            expiryDate: '2026-12-01',
            credentialId: 'AWS-CP-2023-001'
          }
        ],
        projects: userData.studentProfile?.projects?.length > 0 ? userData.studentProfile.projects : [
          {
            id: '1',
            name: 'Hệ thống quản lý tuyển dụng',
            description: 'Ứng dụng web full-stack cho việc quản lý tuyển dụng với React và Node.js',
            technologies: ['React', 'Node.js', 'PostgreSQL', 'Material-UI'],
            startDate: '2023-09-01',
            endDate: '2024-01-31',
            githubUrl: 'https://github.com/student/recruitment-system',
            liveUrl: 'https://recruitment-demo.com',
            images: []
          }
        ],
        applications: applications
      };
      
      setCandidate(profileData);
    } catch (error) {
      console.error('Error loading candidate profile:', error);
      setError('Không thể tải thông tin ứng viên');
      toast.error('Không thể tải thông tin ứng viên');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !candidate) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Không tìm thấy thông tin ứng viên'}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/candidates')}>
          Quay lại danh sách ứng viên
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          color="inherit" 
          href="#" 
          onClick={() => navigate('/candidates')}
          sx={{ cursor: 'pointer' }}
        >
          Quản lý ứng viên
        </Link>
        <Typography color="text.primary">
          {candidate.firstName} {candidate.lastName}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              src={candidate.avatar}
              alt={`${candidate.firstName} ${candidate.lastName}`}
              sx={{ width: 120, height: 120 }}
            >
              {candidate.firstName?.[0]}{candidate.lastName?.[0]}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              {candidate.firstName} {candidate.lastName}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {candidate.major} - {candidate.university}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
              {candidate.email && (
                <Chip icon={<Email />} label={candidate.email} variant="outlined" />
              )}
              {candidate.phone && (
                <Chip icon={<Phone />} label={candidate.phone} variant="outlined" />
              )}
              {candidate.graduationYear && (
                <Chip icon={<School />} label={`Tốt nghiệp ${candidate.graduationYear}`} variant="outlined" />
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {candidate.resume && (
                <Button startIcon={<Download />} variant="outlined" size="small">
                  Tải CV
                </Button>
              )}
              {candidate.github && (
                <Button startIcon={<GitHub />} variant="outlined" size="small">
                  GitHub
                </Button>
              )}
              {candidate.linkedin && (
                <Button startIcon={<LinkedIn />} variant="outlined" size="small">
                  LinkedIn
                </Button>
              )}
            </Box>
          </Grid>
          <Grid item>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/candidates')}
              variant="outlined"
            >
              Quay lại
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Thông tin cá nhân" icon={<Person />} />
          <Tab label="Học vấn" icon={<School />} />
          <Tab label="Kinh nghiệm" icon={<Work />} />
          <Tab label="Kỹ năng & Chứng chỉ" icon={<WorkspacePremium />} />
          <Tab label="Dự án" icon={<Assignment />} />
          <Tab label="Lịch sử ứng tuyển" icon={<Schedule />} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Thông tin liên hệ
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><Email /></ListItemIcon>
                    <ListItemText primary="Email" secondary={candidate.email} />
                  </ListItem>
                  {candidate.phone && (
                    <ListItem>
                      <ListItemIcon><Phone /></ListItemIcon>
                      <ListItemText primary="Số điện thoại" secondary={candidate.phone} />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Thông tin học vấn
                </Typography>
                <List>
                  {candidate.university && (
                    <ListItem>
                      <ListItemIcon><School /></ListItemIcon>
                      <ListItemText primary="Trường đại học" secondary={candidate.university} />
                    </ListItem>
                  )}
                  {candidate.major && (
                    <ListItem>
                      <ListItemIcon><Assignment /></ListItemIcon>
                      <ListItemText primary="Chuyên ngành" secondary={candidate.major} />
                    </ListItem>
                  )}
                  {candidate.gpa && (
                    <ListItem>
                      <ListItemIcon><Star /></ListItemIcon>
                      <ListItemText primary="GPA" secondary={candidate.gpa} />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
          {candidate.skills && candidate.skills.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Kỹ năng
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {candidate.skills.map((skill, index) => (
                      <Chip key={index} label={skill} variant="outlined" />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          {candidate.educations && candidate.educations.length > 0 ? (
            candidate.educations.map((education, index) => (
              <Grid item xs={12} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {education.degree} - {education.fieldOfStudy}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      {education.institution}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(education.startDate)} - {education.current ? 'Hiện tại' : formatDate(education.endDate!)}
                    </Typography>
                    {education.gpa && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        GPA: {education.gpa}
                      </Typography>
                    )}
                    {education.achievements && education.achievements.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Thành tích:
                        </Typography>
                        <List dense>
                          {education.achievements.map((achievement, i) => (
                            <ListItem key={i}>
                              <ListItemText primary={achievement} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">Chưa có thông tin học vấn</Alert>
            </Grid>
          )}
        </Grid>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          {candidate.workExperiences && candidate.workExperiences.length > 0 ? (
            candidate.workExperiences.map((experience, index) => (
              <Grid item xs={12} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {experience.position}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      {experience.company}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {formatDate(experience.startDate)} - {experience.current ? 'Hiện tại' : formatDate(experience.endDate!)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      {experience.description}
                    </Typography>
                    {experience.skills && experience.skills.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Kỹ năng sử dụng:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {experience.skills.map((skill, i) => (
                            <Chip key={i} label={skill} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">Chưa có kinh nghiệm làm việc</Alert>
            </Grid>
          )}
        </Grid>
      )}

      {tabValue === 3 && (
        <Grid container spacing={3}>
          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Kỹ năng
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {candidate.skills.map((skill, index) => (
                      <Chip key={index} label={skill} variant="outlined" />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
          
          {/* Languages */}
          {candidate.languages && candidate.languages.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Ngôn ngữ
                  </Typography>
                  <List>
                    {candidate.languages.map((language, index) => (
                      <ListItem key={index}>
                        <ListItemIcon><Language /></ListItemIcon>
                        <ListItemText 
                          primary={language.name} 
                          secondary={`Trình độ: ${language.proficiency}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}
          
          {/* Certifications */}
          {candidate.certifications && candidate.certifications.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Chứng chỉ
                  </Typography>
                  <Grid container spacing={2}>
                    {candidate.certifications.map((cert, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            {cert.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {cert.issuer} - {formatDate(cert.issueDate)}
                          </Typography>
                          {cert.credentialId && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              ID: {cert.credentialId}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {tabValue === 4 && (
        <Grid container spacing={3}>
          {candidate.projects && candidate.projects.length > 0 ? (
            candidate.projects.map((project, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {project.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {formatDate(project.startDate)} - {project.current ? 'Hiện tại' : formatDate(project.endDate!)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      {project.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Công nghệ:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {project.technologies.map((tech, i) => (
                          <Chip key={i} label={tech} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      {project.githubUrl && (
                        <Button startIcon={<GitHub />} size="small" variant="outlined">
                          GitHub
                        </Button>
                      )}
                      {project.liveUrl && (
                        <Button size="small" variant="outlined">
                          Demo
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">Chưa có dự án nào</Alert>
            </Grid>
          )}
        </Grid>
      )}

      {tabValue === 5 && (
        <Grid container spacing={3}>
          {candidate.applications && candidate.applications.length > 0 ? (
            candidate.applications.map((application, index) => (
              <Grid item xs={12} key={index}>
                <Card>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs>
                        <Typography variant="h6" gutterBottom>
                          {application.jobTitle}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {application.companyName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Ngày ứng tuyển: {formatDate(application.appliedAt)}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Chip 
                          label={application.status} 
                          color={application.status === 'ACCEPTED' ? 'success' : 
                                application.status === 'REJECTED' ? 'error' : 'default'}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">Chưa có lịch sử ứng tuyển</Alert>
            </Grid>
          )}
        </Grid>
      )}
    </Container>
  );
};

export default CandidateProfile;
