import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Chip,
  Card,
  CardContent,
  CardActions,
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
  Badge
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Language as WebsiteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

interface Job {
  id: string;
  title: string;
  department: string;
  type: string;
  location: string;
  salary?: string;
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED';
  applicants: number;
  createdAt: string;
}

interface Application {
  id: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  status: 'PENDING' | 'REVIEWED' | 'INTERVIEWED' | 'HIRED' | 'REJECTED';
  appliedAt: string;
  resume?: string;
}

const CompanyProfile: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  // Mock company data
  const [companyInfo, setCompanyInfo] = useState({
    name: 'TechCorp Solutions',
    logo: '',
    description: 'Leading technology company specializing in innovative software solutions for enterprise clients worldwide.',
    industry: 'Technology',
    size: '500-1000',
    founded: '2010',
    website: 'https://techcorp.com',
    address: '123 Tech Street, Innovation District, Ho Chi Minh City',
    phone: '+84 28 1234 5678',
    email: 'contact@techcorp.com',
    benefits: ['Health Insurance', 'Remote Work', 'Professional Development', '13th Month Salary', 'Stock Options']
  });

  // Mock jobs data
  const [jobs] = useState<Job[]>([
    {
      id: '1',
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      type: 'Full-time',
      location: 'Ho Chi Minh City',
      salary: '$2000-3000',
      status: 'ACTIVE',
      applicants: 24,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'Product Manager',
      department: 'Product',
      type: 'Full-time',
      location: 'Remote',
      salary: '$2500-3500',
      status: 'ACTIVE',
      applicants: 18,
      createdAt: '2024-01-10'
    },
    {
      id: '3',
      title: 'UI/UX Designer',
      department: 'Design',
      type: 'Part-time',
      location: 'Ho Chi Minh City',
      salary: '$1500-2000',
      status: 'PAUSED',
      applicants: 12,
      createdAt: '2024-01-05'
    }
  ]);

  // Mock applications data
  const [applications] = useState<Application[]>([
    {
      id: '1',
      jobTitle: 'Senior Frontend Developer',
      candidateName: 'Nguyen Van A',
      candidateEmail: 'nguyenvana@email.com',
      status: 'PENDING',
      appliedAt: '2024-01-20',
      resume: 'resume-nguyen-van-a.pdf'
    },
    {
      id: '2',
      jobTitle: 'Product Manager',
      candidateName: 'Le Thi B',
      candidateEmail: 'lethib@email.com',
      status: 'INTERVIEWED',
      appliedAt: '2024-01-18',
      resume: 'resume-le-thi-b.pdf'
    },
    {
      id: '3',
      jobTitle: 'Senior Frontend Developer',
      candidateName: 'Tran Van C',
      candidateEmail: 'tranvanc@email.com',
      status: 'REVIEWED',
      appliedAt: '2024-01-16',
      resume: 'resume-tran-van-c.pdf'
    }
  ]);

  const [newJob, setNewJob] = useState({
    title: '',
    department: '',
    type: 'Full-time',
    location: '',
    salary: '',
    description: '',
    requirements: ''
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleSaveProfile = () => {
    // In a real app, this would save to backend
    setEditMode(false);
  };

  const handleCreateJob = () => {
    // In a real app, this would create job via API
    setJobDialogOpen(false);
    setNewJob({
      title: '',
      department: '',
      type: 'Full-time',
      location: '',
      salary: '',
      description: '',
      requirements: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PAUSED': return 'warning';
      case 'CLOSED': return 'error';
      case 'PENDING': return 'warning';
      case 'REVIEWED': return 'info';
      case 'INTERVIEWED': return 'primary';
      case 'HIRED': return 'success';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setApplicationDialogOpen(true);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Company Profile
      </Typography>

      <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Company Information" />
        <Tab label="Job Postings" />
        <Tab label="Applications" />
        <Tab label="Analytics" />
      </Tabs>

      {/* Company Information Tab */}
      {currentTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Company Information</Typography>
            <Button
              variant={editMode ? 'outlined' : 'contained'}
              startIcon={editMode ? <CancelIcon /> : <EditIcon />}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? 'Cancel' : 'Edit Profile'}
            </Button>
          </Box>

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, 
            gap: 3 
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                sx={{ width: 120, height: 120, mb: 2, bgcolor: 'primary.main' }}
              >
                <BusinessIcon sx={{ fontSize: 60 }} />
              </Avatar>
              {editMode && (
                <Button variant="outlined" size="small">
                  Change Logo
                </Button>
              )}
            </Box>

            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
              gap: 2 
            }}>
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={companyInfo.name}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                  disabled={!editMode}
                />
              </Box>
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={companyInfo.description}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, description: e.target.value })}
                  disabled={!editMode}
                />
              </Box>
              <TextField
                fullWidth
                label="Industry"
                value={companyInfo.industry}
                onChange={(e) => setCompanyInfo({ ...companyInfo, industry: e.target.value })}
                disabled={!editMode}
              />
              <FormControl fullWidth disabled={!editMode}>
                <InputLabel>Company Size</InputLabel>
                <Select
                  value={companyInfo.size}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, size: e.target.value })}
                >
                  <MenuItem value="1-10">1-10 employees</MenuItem>
                  <MenuItem value="11-50">11-50 employees</MenuItem>
                  <MenuItem value="51-200">51-200 employees</MenuItem>
                  <MenuItem value="201-500">201-500 employees</MenuItem>
                  <MenuItem value="500-1000">500-1000 employees</MenuItem>
                  <MenuItem value="1000+">1000+ employees</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Founded Year"
                value={companyInfo.founded}
                onChange={(e) => setCompanyInfo({ ...companyInfo, founded: e.target.value })}
                disabled={!editMode}
              />
              <TextField
                fullWidth
                label="Website"
                value={companyInfo.website}
                onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
                disabled={!editMode}
                InputProps={{
                  startAdornment: <WebsiteIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                <TextField
                  fullWidth
                  label="Address"
                  value={companyInfo.address}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                  disabled={!editMode}
                  InputProps={{
                    startAdornment: <LocationIcon sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Box>
              <TextField
                fullWidth
                label="Phone"
                value={companyInfo.phone}
                onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                disabled={!editMode}
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
              <TextField
                fullWidth
                label="Email"
                value={companyInfo.email}
                onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                disabled={!editMode}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Benefits & Perks
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {companyInfo.benefits.map((benefit, index) => (
              <Chip
                key={index}
                label={benefit}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>

          {editMode && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveProfile}
              >
                Save Changes
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {/* Job Postings Tab */}
      {currentTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Job Postings</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setJobDialogOpen(true)}
            >
              Post New Job
            </Button>
          </Box>

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, 
            gap: 3 
          }}>
            {jobs.map((job) => (
              <Card key={job.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="h3">
                        {job.title}
                      </Typography>
                      <Chip
                        label={job.status}
                        color={getStatusColor(job.status) as any}
                        size="small"
                      />
                    </Box>
                    <Typography color="textSecondary" gutterBottom>
                      {job.department} • {job.type}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <LocationIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      {job.location}
                    </Typography>
                    {job.salary && (
                      <Typography variant="body2" sx={{ mb: 2, fontWeight: 'bold', color: 'success.main' }}>
                        {job.salary}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Badge badgeContent={job.applicants} color="primary">
                        <PeopleIcon />
                      </Badge>
                      <Typography variant="caption" color="textSecondary">
                        Posted {job.createdAt}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" startIcon={<ViewIcon />}>
                      View Details
                    </Button>
                    <Button size="small" startIcon={<EditIcon />}>
                      Edit
                    </Button>
                  </CardActions>
                </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Applications Tab */}
      {currentTab === 2 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Job Applications
          </Typography>

          <Paper>
            <List>
              {applications.map((application, index) => (
                <React.Fragment key={application.id}>
                  <ListItem
                    secondaryAction={
                      <Box>
                        <Chip
                          label={application.status}
                          color={getStatusColor(application.status) as any}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <IconButton
                          edge="end"
                          onClick={() => handleViewApplication(application)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={`${application.candidateName} - ${application.jobTitle}`}
                      secondary={`Applied on ${application.appliedAt} • ${application.candidateEmail}`}
                    />
                  </ListItem>
                  {index < applications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>
      )}

      {/* Analytics Tab */}
      {currentTab === 3 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Analytics & Reports
          </Typography>

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
            gap: 3 
          }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <WorkIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" component="div">
                  {jobs.length}
                </Typography>
                <Typography color="textSecondary">
                  Active Jobs
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" component="div">
                  {applications.length}
                </Typography>
                <Typography color="textSecondary">
                  Total Applications
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" component="div" color="warning.main">
                  {applications.filter(app => app.status === 'PENDING').length}
                </Typography>
                <Typography color="textSecondary">
                  Pending Review
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" component="div" color="info.main">
                  {Math.round(applications.length / jobs.length * 10) / 10}
                </Typography>
                <Typography color="textSecondary">
                  Avg Applications/Job
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Create Job Dialog */}
      <Dialog open={jobDialogOpen} onClose={() => setJobDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Post New Job</DialogTitle>
        <DialogContent>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
            gap: 2,
            mt: 1 
          }}>
            <TextField
              fullWidth
              label="Job Title"
              value={newJob.title}
              onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
            />
            <TextField
              fullWidth
              label="Department"
              value={newJob.department}
              onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Job Type</InputLabel>
              <Select
                value={newJob.type}
                onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
              >
                <MenuItem value="Full-time">Full-time</MenuItem>
                <MenuItem value="Part-time">Part-time</MenuItem>
                <MenuItem value="Contract">Contract</MenuItem>
                <MenuItem value="Internship">Internship</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Location"
              value={newJob.location}
              onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
            />
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <TextField
                fullWidth
                label="Salary Range (Optional)"
                value={newJob.salary}
                onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                placeholder="e.g., $2000-3000"
              />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Job Description"
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Requirements"
                value={newJob.requirements}
                onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJobDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateJob} variant="contained">
            Post Job
          </Button>
        </DialogActions>
      </Dialog>

      {/* Application Details Dialog */}
      <Dialog
        open={applicationDialogOpen}
        onClose={() => setApplicationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Application Details</DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedApplication.candidateName}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                Applied for: {selectedApplication.jobTitle}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Email: {selectedApplication.candidateEmail}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Applied on: {selectedApplication.appliedAt}
              </Typography>
              <Chip
                label={`Status: ${selectedApplication.status}`}
                color={getStatusColor(selectedApplication.status) as any}
                sx={{ mb: 2 }}
              />
              {selectedApplication.resume && (
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" startIcon={<ViewIcon />}>
                    View Resume ({selectedApplication.resume})
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplicationDialogOpen(false)}>Close</Button>
          <Button variant="outlined" color="error">
            Reject
          </Button>
          <Button variant="contained" color="success">
            Move to Next Stage
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyProfile;
