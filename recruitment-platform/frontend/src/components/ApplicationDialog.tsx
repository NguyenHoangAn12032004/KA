import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  Avatar,
  Chip,
  Card,
  CardContent,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Zoom
} from '@mui/material';
import {
  Close,
  Send,
  AttachFile,
  CheckCircle,
  Info,
  Warning,
  LocationOn,
  Business,
  Schedule,
  AttachMoney,
  Work,
  Edit,
  CloudUpload
} from '@mui/icons-material';

interface Job {
  id: string;
  title: string;
  company?: {
    id: string;
    companyName: string;
    logoUrl?: string;
    industry?: string;
  };
  location: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
  workMode?: 'ONSITE' | 'REMOTE' | 'HYBRID';
  experienceLevel?: 'ENTRY' | 'JUNIOR' | 'INTERMEDIATE' | 'SENIOR';
  requirements?: string[];
  hasApplied?: boolean;
}

interface ApplicationDialogProps {
  open: boolean;
  job: Job | null;
  onClose: () => void;
  onSubmit: (coverLetter: string, additionalFiles?: File[]) => Promise<void>;
  isSubmitting?: boolean;
}

const ApplicationDialog: React.FC<ApplicationDialogProps> = ({
  open,
  job,
  onClose,
  onSubmit,
  isSubmitting = false
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [coverLetter, setCoverLetter] = useState('');
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const steps = ['Review Job', 'Cover Letter', 'Review & Submit'];

  const formatSalary = (job: Job) => {
    if (job.salaryMin && job.salaryMax) {
      const currency = job.currency || 'VND';
      const min = job.salaryMin.toLocaleString();
      const max = job.salaryMax.toLocaleString();
      return `${min} - ${max} ${currency}`;
    }
    return job.salary || 'Competitive';
  };

  const getJobTypeLabel = (type: string) => {
    const typeLabels = {
      'FULL_TIME': 'Full-time',
      'PART_TIME': 'Part-time',
      'INTERNSHIP': 'Internship',
      'CONTRACT': 'Contract'
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const getWorkModeLabel = (mode: string) => {
    const modeLabels = {
      'ONSITE': 'On-site',
      'REMOTE': 'Remote',
      'HYBRID': 'Hybrid'
    };
    return modeLabels[mode as keyof typeof modeLabels] || mode;
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!coverLetter.trim()) {
      return;
    }
    
    try {
      await onSubmit(coverLetter, additionalFiles);
      // Reset form
      setCoverLetter('');
      setAdditionalFiles([]);
      setActiveStep(0);
      setShowPreview(false);
    } catch (error) {
      console.error('Error submitting application:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAdditionalFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setAdditionalFiles(prev => prev.filter((_, i) => i !== index));
  };

  const generateCoverLetterTemplate = () => {
    if (!job) return '';
    
    return `Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company?.companyName || 'your company'}. With my background and skills, I believe I would be a valuable addition to your team.

Key qualifications I bring:
• [Your relevant skill/experience 1]
• [Your relevant skill/experience 2]
• [Your relevant skill/experience 3]

I am particularly excited about this opportunity because [specific reason related to the company/role]. I am confident that my passion for [relevant field/technology] and my commitment to excellence make me an ideal candidate for this position.

I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to your team's success. Thank you for considering my application.

Best regards,
[Your Name]`;
  };

  if (!job) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Apply for Position
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <Close />
          </IconButton>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Stepper activeStep={activeStep} sx={{ '& .MuiStepLabel-label': { color: 'white !important' } }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel sx={{ '& .MuiStepIcon-root': { color: 'rgba(255,255,255,0.7)' } }}>
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Step 1: Review Job */}
        {activeStep === 0 && (
          <Fade in timeout={300}>
            <Box>
              <Card variant="outlined" sx={{ mb: 3, overflow: 'hidden' }}>
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    p: 3
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={job.company?.logoUrl}
                      sx={{ width: 60, height: 60, mr: 2 }}
                    >
                      {job.company?.companyName?.charAt(0) || 'C'}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {job.title}
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        {job.company?.companyName || 'Company'}
                      </Typography>
                    </Box>
                  </Box>

                  <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOn fontSize="small" />
                      <Typography variant="body2">{job.location}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AttachMoney fontSize="small" />
                      <Typography variant="body2">{formatSalary(job)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Work fontSize="small" />
                      <Typography variant="body2">{getJobTypeLabel(job.type)}</Typography>
                    </Box>
                  </Stack>
                </Box>

                <CardContent>
                  <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                    <Chip 
                      label={getJobTypeLabel(job.type)} 
                      color="primary" 
                      variant="outlined"
                    />
                    <Chip 
                      label={getWorkModeLabel(job.workMode || 'ONSITE')} 
                      color="secondary" 
                      variant="outlined"
                    />
                    <Chip 
                      label={job.experienceLevel || 'ENTRY'} 
                      variant="outlined"
                    />
                  </Box>

                  {job.requirements && job.requirements.length > 0 && (
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        Key Requirements
                      </Typography>
                      <List dense>
                        {job.requirements.slice(0, 5).map((requirement, index) => (
                          <ListItem key={index} sx={{ pl: 0 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckCircle color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={requirement} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </CardContent>
              </Card>

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Please review the job details carefully before proceeding with your application.
                </Typography>
              </Alert>
            </Box>
          </Fade>
        )}

        {/* Step 2: Cover Letter */}
        {activeStep === 1 && (
          <Fade in timeout={300}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Write Your Cover Letter
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setCoverLetter(generateCoverLetterTemplate())}
                  startIcon={<Edit />}
                >
                  Use Template
                </Button>
              </Box>

              <TextField
                multiline
                rows={12}
                fullWidth
                label="Cover Letter"
                placeholder="Write a compelling cover letter that highlights your qualifications and interest in this position..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                sx={{ mb: 3 }}
                helperText={`${coverLetter.length}/2000 characters`}
                inputProps={{ maxLength: 2000 }}
              />

              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Additional Documents (Optional)
                  </Typography>
                  
                  <input
                    accept=".pdf,.doc,.docx,.txt"
                    style={{ display: 'none' }}
                    id="file-upload"
                    multiple
                    type="file"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUpload />}
                      sx={{ mb: 2 }}
                    >
                      Upload Additional Files
                    </Button>
                  </label>

                  {additionalFiles.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Uploaded Files:
                      </Typography>
                      {additionalFiles.map((file, index) => (
                        <Chip
                          key={index}
                          label={file.name}
                          onDelete={() => removeFile(index)}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>

              <Alert severity="warning">
                <Typography variant="body2">
                  Make sure your cover letter is well-written and error-free. This is your chance to make a great first impression!
                </Typography>
              </Alert>
            </Box>
          </Fade>
        )}

        {/* Step 3: Review & Submit */}
        {activeStep === 2 && (
          <Fade in timeout={300}>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Review Your Application
              </Typography>

              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Position: {job.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {job.company?.companyName} • {job.location}
                  </Typography>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Cover Letter
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview ? 'Hide' : 'Preview'}
                    </Button>
                  </Box>
                  
                  {showPreview && (
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: 'grey.50',
                        maxHeight: 200,
                        overflow: 'auto'
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.6
                        }}
                      >
                        {coverLetter}
                      </Typography>
                    </Paper>
                  )}
                  
                  <Typography variant="body2" color="text.secondary">
                    {coverLetter.length} characters
                  </Typography>
                </CardContent>
              </Card>

              {additionalFiles.length > 0 && (
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      Additional Files ({additionalFiles.length})
                    </Typography>
                    {additionalFiles.map((file, index) => (
                      <Chip
                        key={index}
                        label={file.name}
                        sx={{ mr: 1, mb: 1 }}
                        icon={<AttachFile />}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}

              <Alert severity="success">
                <Typography variant="body2">
                  Your application is ready to submit! Once submitted, you'll receive a confirmation and can track your application status in your dashboard.
                </Typography>
              </Alert>
            </Box>
          </Fade>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button
            onClick={activeStep === 0 ? onClose : handleBack}
            disabled={isSubmitting}
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={activeStep === 1 && !coverLetter.trim()}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!coverLetter.trim() || isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <Send />}
                sx={{ minWidth: 140 }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ApplicationDialog;
