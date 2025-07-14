import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Code as CodeIcon,
  Language as LanguageIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Edit,
  Delete,
  Grade as GradeIcon,
  CloudUpload as UploadIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import studentProfileService, { 
  StudentProfileData, 
  Education, 
  Experience, 
  Project, 
  Language, 
  Certification 
} from '../services/studentProfileService';

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
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

const StudentProfile: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState<Partial<StudentProfileData>>({});
  
  // Dialog states
  const [educationDialog, setEducationDialog] = useState(false);
  const [experienceDialog, setExperienceDialog] = useState(false);
  const [projectDialog, setProjectDialog] = useState(false);
  const [languageDialog, setLanguageDialog] = useState(false);
  const [certificationDialog, setCertificationDialog] = useState(false);
  
  // Edit states for individual items
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null);
  
  // Form states
  const [newEducation, setNewEducation] = useState<Omit<Education, 'id'>>({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    current: false,
    gpa: 0,
    achievements: []
  });
  
  const [newExperience, setNewExperience] = useState<Omit<Experience, 'id'>>({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    skills: [],
    achievements: []
  });
  
  const [newProject, setNewProject] = useState<Omit<Project, 'id'>>({
    title: '',
    description: '',
    technologies: [],
    startDate: '',
    endDate: '',
    current: false,
    githubUrl: '',
    liveUrl: '',
    imageUrl: ''
  });
  
  const [newLanguage, setNewLanguage] = useState<Omit<Language, 'id'>>({
    name: '',
    proficiency: 'BEGINNER',
    certification: ''
  });
  
  const [newCertification, setNewCertification] = useState<Omit<Certification, 'id'>>({
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: ''
  });

  // Load profile data on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  // Sync editProfile with profile whenever profile changes (but only when not in edit mode)
  useEffect(() => {
    if (profile && !editMode) {
      setEditProfile(profile);
    }
  }, [profile, editMode]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentProfileService.getProfile();
      if (response.success) {
        setProfile(response.data);
        setEditProfile(response.data);
      } else {
        setError(response.message || 'Failed to load profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editProfile) return;
    
    try {
      setSaving(true);
      setError(null);
      
      console.log('🔄 Saving profile data:', editProfile);
      console.log('📊 Current profile before save:', profile);
      
      const response = await studentProfileService.updateProfile(editProfile);
      if (response.success) {
        console.log('✅ Profile saved successfully:', response.data);
        setProfile(response.data);
        setEditProfile(response.data);
        setEditMode(false);
        setSuccess('Profile updated successfully!');
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditProfile(profile || {});
    setEditMode(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      const response = await studentProfileService.uploadAvatar(file);
      if (response.success) {
        setEditProfile(prev => ({ ...prev, avatar: response.url }));
        setSuccess('Avatar uploaded successfully!');
      } else {
        setError('Failed to upload avatar');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      const response = await studentProfileService.uploadResume(file);
      if (response.success) {
        setEditProfile(prev => ({ ...prev, resume: response.url }));
        setSuccess('Resume uploaded successfully!');
      } else {
        setError('Failed to upload resume');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload resume');
    } finally {
      setSaving(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  const handleAddEducation = () => {
    if (!profile || !newEducation.institution) return;
    
    let updatedEducation;
    
    if (editingEducation) {
      // Edit existing education
      updatedEducation = profile.education?.map(edu => 
        edu.id === editingEducation.id 
          ? { ...editingEducation, ...newEducation }
          : edu
      ) || [];
    } else {
      // Add new education
      const education: Education = {
        id: Date.now().toString(),
        ...newEducation
      };
      updatedEducation = [...(profile.education || []), education];
    }
    
    // Only update editProfile during edit mode, let save handle profile update
    setEditProfile({ ...editProfile, education: updatedEducation });
    setNewEducation({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: 0,
      achievements: []
    });
    setEditingEducation(null);
    setEducationDialog(false);
  };

  const handleAddExperience = () => {
    if (!profile || !newExperience.company) return;
    
    let updatedExperience;
    
    if (editingExperience) {
      // Edit existing experience
      updatedExperience = profile.workExperience?.map(exp => 
        exp.id === editingExperience.id 
          ? { ...editingExperience, ...newExperience }
          : exp
      ) || [];
    } else {
      // Add new experience
      const experience: Experience = {
        id: Date.now().toString(),
        ...newExperience
      };
      updatedExperience = [...(profile.workExperience || []), experience];
    }
    
    setEditProfile({ ...editProfile, workExperience: updatedExperience });
    setNewExperience({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      skills: [],
      achievements: []
    });
    setEditingExperience(null);
    setExperienceDialog(false);
  };

  const handleAddProject = () => {
    if (!profile || !newProject.title) return;
    
    let updatedProjects;
    
    if (editingProject) {
      // Edit existing project
      updatedProjects = profile.projects?.map(proj => 
        proj.id === editingProject.id 
          ? { ...editingProject, ...newProject }
          : proj
      ) || [];
    } else {
      // Add new project
      const project: Project = {
        id: Date.now().toString(),
        ...newProject
      };
      updatedProjects = [...(profile.projects || []), project];
    }
    
    setEditProfile({ ...editProfile, projects: updatedProjects });
    setNewProject({
      title: '',
      description: '',
      technologies: [],
      startDate: '',
      endDate: '',
      current: false,
      githubUrl: '',
      liveUrl: '',
      imageUrl: ''
    });
    setEditingProject(null);
    setProjectDialog(false);
  };

  const handleAddLanguage = () => {
    if (!profile || !newLanguage.name) return;
    
    let updatedLanguages;
    
    if (editingLanguage) {
      // Edit existing language
      updatedLanguages = profile.languages?.map(lang => 
        lang.id === editingLanguage.id 
          ? { ...editingLanguage, ...newLanguage }
          : lang
      ) || [];
    } else {
      // Add new language
      const language: Language = {
        id: Date.now().toString(),
        ...newLanguage
      };
      updatedLanguages = [...(profile.languages || []), language];
    }
    
    setEditProfile({ ...editProfile, languages: updatedLanguages });
    setNewLanguage({ name: '', proficiency: 'BEGINNER', certification: '' });
    setEditingLanguage(null);
    setLanguageDialog(false);
  };

  const handleAddCertification = () => {
    if (!profile || !newCertification.name) return;
    
    let updatedCertifications;
    
    if (editingCertification) {
      // Edit existing certification
      updatedCertifications = profile.certifications?.map(cert => 
        cert.id === editingCertification.id 
          ? { ...editingCertification, ...newCertification }
          : cert
      ) || [];
    } else {
      // Add new certification
      const certification: Certification = {
        id: Date.now().toString(),
        ...newCertification
      };
      updatedCertifications = [...(profile.certifications || []), certification];
    }
    
    setEditProfile({ ...editProfile, certifications: updatedCertifications });
    setNewCertification({
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: ''
    });
    setEditingCertification(null);
    setCertificationDialog(false);
  };

  // Delete functions
  const handleDeleteEducation = (eduId: string) => {
    if (!profile) return;
    console.log('🗑️ Deleting education with ID:', eduId);
    const updatedEducation = profile.education?.filter(edu => edu.id !== eduId) || [];
    console.log('📋 Updated education list:', updatedEducation);
    // Only update editProfile during edit mode, let save handle profile update
    setEditProfile({ ...editProfile, education: updatedEducation });
  };

  const handleDeleteExperience = (expId: string) => {
    if (!profile) return;
    console.log('🗑️ Deleting experience with ID:', expId);
    const updatedExperience = profile.workExperience?.filter(exp => exp.id !== expId) || [];
    console.log('💼 Updated experience list:', updatedExperience);
    setEditProfile({ ...editProfile, workExperience: updatedExperience });
  };

  const handleDeleteProject = (projId: string) => {
    if (!profile) return;
    const updatedProjects = profile.projects?.filter(proj => proj.id !== projId) || [];
    setEditProfile({ ...editProfile, projects: updatedProjects });
  };

  const handleDeleteLanguage = (langId: string) => {
    if (!profile) return;
    const updatedLanguages = profile.languages?.filter(lang => lang.id !== langId) || [];
    setEditProfile({ ...editProfile, languages: updatedLanguages });
  };

  const handleDeleteCertification = (certId: string) => {
    if (!profile) return;
    const updatedCertifications = profile.certifications?.filter(cert => cert.id !== certId) || [];
    setEditProfile({ ...editProfile, certifications: updatedCertifications });
  };

  // Edit functions
  const handleEditEducation = (education: Education) => {
    setEditingEducation(education);
    setNewEducation({
      institution: education.institution,
      degree: education.degree,
      fieldOfStudy: education.fieldOfStudy,
      startDate: education.startDate,
      endDate: education.endDate || '',
      current: education.current || false,
      gpa: education.gpa || 0,
      achievements: education.achievements || []
    });
    setEducationDialog(true);
  };

  const handleEditExperience = (experience: Experience) => {
    setEditingExperience(experience);
    setNewExperience({
      company: experience.company,
      position: experience.position,
      startDate: experience.startDate,
      endDate: experience.endDate || '',
      current: experience.current,
      description: experience.description,
      skills: experience.skills || [],
      achievements: experience.achievements || []
    });
    setExperienceDialog(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setNewProject({
      title: project.title,
      description: project.description,
      technologies: project.technologies,
      startDate: project.startDate,
      endDate: project.endDate || '',
      current: project.current,
      githubUrl: project.githubUrl || '',
      liveUrl: project.liveUrl || '',
      imageUrl: project.imageUrl || ''
    });
    setProjectDialog(true);
  };

  const handleEditLanguage = (language: Language) => {
    setEditingLanguage(language);
    setNewLanguage({
      name: language.name,
      proficiency: language.proficiency,
      certification: language.certification || ''
    });
    setLanguageDialog(true);
  };

  const handleEditCertification = (certification: Certification) => {
    setEditingCertification(certification);
    setNewCertification({
      name: certification.name,
      issuer: certification.issuer,
      issueDate: certification.issueDate,
      expiryDate: certification.expiryDate || '',
      credentialId: certification.credentialId || '',
      credentialUrl: certification.credentialUrl || ''
    });
    setCertificationDialog(true);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Profile not found. Please try again later.
        </Alert>
      </Container>
    );
  }

  const profileCompletion = studentProfileService.calculateProfileCompletion(profile);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={3} alignItems="center">
          <Box position="relative">
            <Avatar
              src={editProfile.avatar || profile.avatar}
              sx={{ width: 120, height: 120 }}
            >
              {profile.firstName?.[0]}{profile.lastName?.[0]}
            </Avatar>
            {editMode && (
              <IconButton
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': { backgroundColor: 'primary.dark' }
                }}
              >
                <UploadIcon />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </IconButton>
            )}
          </Box>
          
          <Box flex={1}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="h4" gutterBottom>
                  {profile.firstName} {profile.lastName}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  {profile.major} tại {profile.university}
                </Typography>
                <Box display="flex" gap={1} mt={1}>
                  <Chip icon={<EmailIcon />} label={profile.email} variant="outlined" />
                  {profile.phone && (
                    <Chip icon={<PhoneIcon />} label={profile.phone} variant="outlined" />
                  )}
                </Box>
              </Box>
              
              <Box>
                {!editMode ? (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setEditProfile(profile || {});
                      setEditMode(true);
                    }}
                  >
                    Chỉnh sửa
                  </Button>
                ) : (
                  <Box display="flex" gap={1}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancelEdit}
                    >
                      Hủy
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
        
        {/* Profile Completion */}
        <Box mt={3}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Hoàn thành hồ sơ: {profileCompletion}%
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={profileCompletion} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Thông tin cá nhân" {...a11yProps(0)} />
          <Tab label="Học vấn" {...a11yProps(1)} />
          <Tab label="Kinh nghiệm" {...a11yProps(2)} />
          <Tab label="Dự án" {...a11yProps(3)} />
          <Tab label="Kỹ năng" {...a11yProps(4)} />
          <Tab label="Ngôn ngữ" {...a11yProps(5)} />
          <Tab label="Chứng chỉ" {...a11yProps(6)} />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {/* Personal Information */}
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={3}>
          <TextField
            fullWidth
            label="Họ"
            value={editProfile.firstName || ''}
            onChange={(e) => setEditProfile({ ...editProfile, firstName: e.target.value })}
            disabled={!editMode}
          />
          <TextField
            fullWidth
            label="Tên"
            value={editProfile.lastName || ''}
            onChange={(e) => setEditProfile({ ...editProfile, lastName: e.target.value })}
            disabled={!editMode}
          />
          <TextField
            fullWidth
            label="Email"
            value={editProfile.email || ''}
            onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
            disabled={!editMode}
          />
          <TextField
            fullWidth
            label="Số điện thoại"
            value={editProfile.phone || ''}
            onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
            disabled={!editMode}
          />
          <TextField
            fullWidth
            label="Trường đại học"
            value={editProfile.university || ''}
            onChange={(e) => setEditProfile({ ...editProfile, university: e.target.value })}
            disabled={!editMode}
          />
          <TextField
            fullWidth
            label="Chuyên ngành"
            value={editProfile.major || ''}
            onChange={(e) => setEditProfile({ ...editProfile, major: e.target.value })}
            disabled={!editMode}
          />
          <TextField
            fullWidth
            label="Năm tốt nghiệp"
            type="number"
            value={editProfile.graduationYear || ''}
            onChange={(e) => setEditProfile({ ...editProfile, graduationYear: parseInt(e.target.value) })}
            disabled={!editMode}
          />
          <TextField
            fullWidth
            label="GPA"
            type="number"
            inputProps={{ step: 0.01, min: 0, max: 4 }}
            value={editProfile.gpa || ''}
            onChange={(e) => setEditProfile({ ...editProfile, gpa: parseFloat(e.target.value) })}
            disabled={!editMode}
          />
        </Box>
        <Box mt={3}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Giới thiệu bản thân"
            value={editProfile.summary || ''}
            onChange={(e) => setEditProfile({ ...editProfile, summary: e.target.value })}
            disabled={!editMode}
          />
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Education */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Học vấn</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setEducationDialog(true)}
          >
            Thêm học vấn
          </Button>
        </Box>
        
        <Box display="flex" flexDirection="column" gap={2}>
          {profile.education?.map((edu) => (
            <Card key={edu.id}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box flex={1}>
                    <Typography variant="h6">{edu.degree} - {edu.fieldOfStudy}</Typography>
                    <Typography color="text.secondary">{edu.institution}</Typography>
                    <Typography variant="body2">
                      {edu.startDate} - {edu.current ? 'Hiện tại' : edu.endDate}
                    </Typography>
                    {edu.gpa && (
                      <Typography variant="body2">GPA: {edu.gpa}</Typography>
                    )}
                    {edu.achievements && edu.achievements.length > 0 && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Thành tích: {edu.achievements.join(', ')}
                      </Typography>
                    )}
                  </Box>
                  {editMode && (
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditEducation(edu)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteEducation(edu.id!)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Experience */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Kinh nghiệm làm việc</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setExperienceDialog(true)}
          >
            Thêm kinh nghiệm
          </Button>
        </Box>
        
        <Box display="flex" flexDirection="column" gap={2}>
          {profile.workExperience?.map((exp) => (
            <Card key={exp.id}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box flex={1}>
                    <Typography variant="h6">{exp.position}</Typography>
                    <Typography color="text.secondary">{exp.company}</Typography>
                    <Typography variant="body2">
                      {exp.startDate} - {exp.current ? 'Hiện tại' : exp.endDate}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {exp.description}
                    </Typography>
                    {exp.skills && exp.skills.length > 0 && (
                      <Box mt={1}>
                        {exp.skills.map((skill: string, index: number) => (
                          <Chip key={index} label={skill} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                        ))}
                      </Box>
                    )}
                  </Box>
                  {editMode && (
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditExperience(exp)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteExperience(exp.id!)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {/* Projects */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Dự án</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setProjectDialog(true)}
          >
            Thêm dự án
          </Button>
        </Box>
        
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={2}>
          {profile.projects?.map((project) => (
            <Card key={project.id}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Typography variant="h6" flex={1}>{project.title}</Typography>
                  {editMode && (
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditProject(project)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteProject(project.id!)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                  {project.description}
                </Typography>
                <Box mb={1}>
                  {project.technologies.map((tech: string, index: number) => (
                    <Chip key={index} label={tech} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </Box>
                <Box display="flex" gap={1}>
                  {project.githubUrl && (
                    <Button size="small" href={project.githubUrl} target="_blank">
                      GitHub
                    </Button>
                  )}
                  {project.liveUrl && (
                    <Button size="small" href={project.liveUrl} target="_blank">
                      Live Demo
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        {/* Skills */}
        <Typography variant="h6" gutterBottom>Kỹ năng</Typography>
        <Box>
          {profile.skills?.map((skill, index) => (
            <Chip
              key={index}
              label={skill}
              sx={{ mr: 1, mb: 1 }}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
        {editMode && (
          <TextField
            fullWidth
            label="Thêm kỹ năng (cách nhau bằng dấu phẩy)"
            value={editProfile.skills?.join(', ') || ''}
            onChange={(e) => setEditProfile({ 
              ...editProfile, 
              skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
            })}
            sx={{ mt: 2 }}
          />
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={5}>
        {/* Languages */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Ngôn ngữ</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setLanguageDialog(true)}
          >
            Thêm ngôn ngữ
          </Button>
        </Box>
        
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={2}>
          {profile.languages?.map((lang) => (
            <Card key={lang.id}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box flex={1}>
                    <Typography variant="h6">{lang.name}</Typography>
                    <Typography color="text.secondary">{lang.proficiency}</Typography>
                    {lang.certification && (
                      <Typography variant="body2">Chứng chỉ: {lang.certification}</Typography>
                    )}
                  </Box>
                  {editMode && (
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditLanguage(lang)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteLanguage(lang.id!)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={6}>
        {/* Certifications */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Chứng chỉ</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCertificationDialog(true)}
          >
            Thêm chứng chỉ
          </Button>
        </Box>
        
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={2}>
          {profile.certifications?.map((cert) => (
            <Card key={cert.id}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box flex={1}>
                    <Typography variant="h6">{cert.name}</Typography>
                    <Typography color="text.secondary">{cert.issuer}</Typography>
                    <Typography variant="body2">
                      Cấp: {cert.issueDate}
                      {cert.expiryDate && ` - Hết hạn: ${cert.expiryDate}`}
                    </Typography>
                    {cert.credentialUrl && (
                      <Button size="small" href={cert.credentialUrl} target="_blank" sx={{ mt: 1 }}>
                        Xem chứng chỉ
                      </Button>
                    )}
                  </Box>
                  {editMode && (
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditCertification(cert)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteCertification(cert.id!)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </TabPanel>

      {/* Dialogs for adding new items */}
      {/* Education Dialog */}
      <Dialog open={educationDialog} onClose={() => {
        setEducationDialog(false);
        setEditingEducation(null);
        setNewEducation({
          institution: '',
          degree: '',
          fieldOfStudy: '',
          startDate: '',
          endDate: '',
          current: false,
          gpa: 0,
          achievements: []
        });
      }} maxWidth="md" fullWidth>
        <DialogTitle>{editingEducation ? 'Chỉnh sửa học vấn' : 'Thêm học vấn'}</DialogTitle>
        <DialogContent>
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Trường học"
              value={newEducation.institution}
              onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
            />
            <TextField
              fullWidth
              label="Bằng cấp"
              value={newEducation.degree}
              onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
            />
            <TextField
              fullWidth
              label="Chuyên ngành"
              value={newEducation.fieldOfStudy}
              onChange={(e) => setNewEducation({ ...newEducation, fieldOfStudy: e.target.value })}
            />
            <TextField
              fullWidth
              label="Ngày bắt đầu"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={newEducation.startDate}
              onChange={(e) => setNewEducation({ ...newEducation, startDate: e.target.value })}
            />
            <TextField
              fullWidth
              label="Ngày kết thúc"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={newEducation.endDate}
              onChange={(e) => setNewEducation({ ...newEducation, endDate: e.target.value })}
            />
            <TextField
              fullWidth
              label="GPA"
              type="number"
              inputProps={{ step: 0.01, min: 0, max: 4 }}
              value={newEducation.gpa}
              onChange={(e) => setNewEducation({ ...newEducation, gpa: parseFloat(e.target.value) })}
            />
            <TextField
              fullWidth
              label="Thành tích"
              multiline
              rows={3}
              placeholder="Cách nhau bằng dấu phẩy"
              value={newEducation.achievements?.join(', ') || ''}
              onChange={(e) => setNewEducation({ 
                ...newEducation, 
                achievements: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
              })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEducationDialog(false);
            setEditingEducation(null);
            setNewEducation({
              institution: '',
              degree: '',
              fieldOfStudy: '',
              startDate: '',
              endDate: '',
              current: false,
              gpa: 0,
              achievements: []
            });
          }}>Hủy</Button>
          <Button onClick={handleAddEducation} variant="contained">
            {editingEducation ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Experience Dialog */}
      <Dialog open={experienceDialog} onClose={() => {
        setExperienceDialog(false);
        setEditingExperience(null);
        setNewExperience({
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
          skills: [],
          achievements: []
        });
      }} maxWidth="md" fullWidth>
        <DialogTitle>{editingExperience ? 'Chỉnh sửa kinh nghiệm làm việc' : 'Thêm kinh nghiệm làm việc'}</DialogTitle>
        <DialogContent>
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Công ty"
              value={newExperience.company}
              onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
            />
            <TextField
              fullWidth
              label="Vị trí"
              value={newExperience.position}
              onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })}
            />
            <TextField
              fullWidth
              label="Ngày bắt đầu"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={newExperience.startDate}
              onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
            />
            <TextField
              fullWidth
              label="Ngày kết thúc"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={newExperience.endDate}
              onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
              disabled={newExperience.current}
            />
            <TextField
              fullWidth
              label="Mô tả công việc"
              multiline
              rows={4}
              value={newExperience.description}
              onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
              sx={{ gridColumn: 'span 2' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExperienceDialog(false)}>Hủy</Button>
          <Button onClick={handleAddExperience} variant="contained">
            {editingExperience ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Dialog */}
      <Dialog open={projectDialog} onClose={() => {
        setProjectDialog(false);
        setEditingProject(null);
        setNewProject({
          title: '',
          description: '',
          technologies: [],
          startDate: '',
          endDate: '',
          current: false,
          githubUrl: '',
          liveUrl: '',
          imageUrl: ''
        });
      }} maxWidth="md" fullWidth>
        <DialogTitle>{editingProject ? 'Chỉnh sửa dự án' : 'Thêm dự án'}</DialogTitle>
        <DialogContent>
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Tên dự án"
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            />
            <TextField
              fullWidth
              label="Công nghệ sử dụng"
              placeholder="React, Node.js, MongoDB"
              value={newProject.technologies.join(', ')}
              onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value.split(',').map(t => t.trim()) })}
            />
            <TextField
              fullWidth
              label="Ngày bắt đầu"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={newProject.startDate}
              onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
            />
            <TextField
              fullWidth
              label="Ngày kết thúc"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={newProject.endDate}
              onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
            />
            <TextField
              fullWidth
              label="GitHub URL"
              value={newProject.githubUrl}
              onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
            />
            <TextField
              fullWidth
              label="Live Demo URL"
              value={newProject.liveUrl}
              onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
            />
            <TextField
              fullWidth
              label="Mô tả dự án"
              multiline
              rows={4}
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              sx={{ gridColumn: 'span 2' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProjectDialog(false)}>Hủy</Button>
          <Button onClick={handleAddProject} variant="contained">
            {editingProject ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Language Dialog */}
      <Dialog open={languageDialog} onClose={() => {
        setLanguageDialog(false);
        setEditingLanguage(null);
        setNewLanguage({ name: '', proficiency: 'BEGINNER', certification: '' });
      }} maxWidth="sm" fullWidth>
        <DialogTitle>{editingLanguage ? 'Chỉnh sửa ngôn ngữ' : 'Thêm ngôn ngữ'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Ngôn ngữ"
              value={newLanguage.name}
              onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Trình độ</InputLabel>
              <Select
                value={newLanguage.proficiency}
                label="Trình độ"
                onChange={(e) => setNewLanguage({ ...newLanguage, proficiency: e.target.value as any })}
              >
                <MenuItem value="BEGINNER">Sơ cấp</MenuItem>
                <MenuItem value="INTERMEDIATE">Trung cấp</MenuItem>
                <MenuItem value="ADVANCED">Cao cấp</MenuItem>
                <MenuItem value="NATIVE">Bản ngữ</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLanguageDialog(false)}>Hủy</Button>
          <Button onClick={handleAddLanguage} variant="contained">
            {editingLanguage ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Certification Dialog */}
      <Dialog open={certificationDialog} onClose={() => {
        setCertificationDialog(false);
        setEditingCertification(null);
        setNewCertification({
          name: '',
          issuer: '',
          issueDate: '',
          expiryDate: '',
          credentialId: '',
          credentialUrl: ''
        });
      }} maxWidth="md" fullWidth>
        <DialogTitle>{editingCertification ? 'Chỉnh sửa chứng chỉ' : 'Thêm chứng chỉ'}</DialogTitle>
        <DialogContent>
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Tên chứng chỉ"
              value={newCertification.name}
              onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Tổ chức cấp"
              value={newCertification.issuer}
              onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
            />
            <TextField
              fullWidth
              label="Ngày cấp"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={newCertification.issueDate}
              onChange={(e) => setNewCertification({ ...newCertification, issueDate: e.target.value })}
            />
            <TextField
              fullWidth
              label="Ngày hết hạn"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={newCertification.expiryDate}
              onChange={(e) => setNewCertification({ ...newCertification, expiryDate: e.target.value })}
            />
            <TextField
              fullWidth
              label="Mã chứng chỉ"
              value={newCertification.credentialId}
              onChange={(e) => setNewCertification({ ...newCertification, credentialId: e.target.value })}
            />
            <TextField
              fullWidth
              label="URL chứng chỉ"
              value={newCertification.credentialUrl}
              onChange={(e) => setNewCertification({ ...newCertification, credentialUrl: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCertificationDialog(false)}>Hủy</Button>
          <Button onClick={handleAddCertification} variant="contained">
            {editingCertification ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={Boolean(error || success)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StudentProfile;
