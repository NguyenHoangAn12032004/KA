import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Button,
  Tooltip,
  Divider,
  Stack,
  Rating
} from '@mui/material';
import {
  LocationOn,
  Schedule,
  Business,
  AttachMoney,
  MoreVert,
  Bookmark,
  BookmarkBorder,
  Send,
  Visibility,
  TrendingUp,
  AccessTime
} from '@mui/icons-material';

interface Job {
  id: string;
  title: string;
  company?: {
    id: string;
    companyName: string;
    logoUrl?: string;
    industry?: string;
    location?: string;
    rating?: number;
  };
  location: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
  workMode?: 'ONSITE' | 'REMOTE' | 'HYBRID';
  experienceLevel?: 'ENTRY' | 'JUNIOR' | 'INTERMEDIATE' | 'SENIOR';
  description?: string;
  applicationDeadline?: string;
  publishedAt?: string;
  applicationsCount?: number;
  isSaved?: boolean;
  hasApplied?: boolean;
  viewsCount?: number;
}

interface JobCardProps {
  job: Job;
  onJobClick: (job: Job) => void;
  onApplyClick: (job: Job) => void;
  onSaveClick?: (jobId: string) => void;
  onMenuClick?: (event: React.MouseEvent<HTMLElement>, job: Job) => void;
  viewMode?: 'grid' | 'list';
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  onJobClick,
  onApplyClick,
  onSaveClick,
  onMenuClick,
  viewMode = 'grid'
}) => {
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

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  if (viewMode === 'list') {
    return (
      <Card 
        elevation={2}
        sx={{ 
          mb: 2,
          cursor: 'pointer',
          transition: 'all 0.3s ease-in-out',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 4,
            borderColor: 'primary.main'
          }
        }}
        onClick={() => onJobClick(job)}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <Avatar
                src={job.company?.logoUrl}
                sx={{ width: 60, height: 60, mr: 3 }}
              >
                {job.company?.companyName?.charAt(0) || 'C'}
              </Avatar>
              
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {job.title}
                  </Typography>
                  {job.hasApplied && (
                    <Chip 
                      label="Đã ứng tuyển" 
                      size="small" 
                      color="success" 
                      sx={{ fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                  {job.company?.companyName || 'Company'}
                  {job.company?.rating && (
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', ml: 1 }}>
                      <Rating value={job.company.rating} readOnly size="small" />
                      <Typography variant="caption" sx={{ ml: 0.5 }}>
                        {job.company.rating}/5
                      </Typography>
                    </Box>
                  )}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOn color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {job.location}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AttachMoney color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {formatSalary(job)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTime color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {job.publishedAt ? getTimeAgo(job.publishedAt) : 'Recently'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Visibility color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {job.viewsCount || 0} views
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={getJobTypeLabel(job.type)} 
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip 
                    label={getWorkModeLabel(job.workMode || 'ONSITE')} 
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                  <Chip 
                    label={job.experienceLevel || 'ENTRY'} 
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, ml: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={job.isSaved ? "Remove from saved" : "Save job"}>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSaveClick) onSaveClick(job.id);
                    }}
                    size="small"
                    color={job.isSaved ? "primary" : "default"}
                  >
                    {job.isSaved ? <Bookmark /> : <BookmarkBorder />}
                  </IconButton>
                </Tooltip>
                
                {onMenuClick && (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onMenuClick(e, job);
                    }}
                    size="small"
                  >
                    <MoreVert />
                  </IconButton>
                )}
              </Box>

              <Button
                variant={job.hasApplied ? "outlined" : "contained"}
                size="medium"
                onClick={(e) => {
                  e.stopPropagation();
                  onApplyClick(job);
                }}
                disabled={job.hasApplied}
                startIcon={<Send />}
                sx={{ minWidth: 120 }}
              >
                {job.hasApplied ? 'Đã ứng tuyển' : 'Ứng tuyển'}
              </Button>
              
              {job.applicationsCount !== undefined && (
                <Typography variant="caption" color="text.secondary">
                  {job.applicationsCount} applicants
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card 
      elevation={2}
      sx={{ 
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
          borderColor: 'primary.main',
          '& .job-card-actions': {
            opacity: 1,
            transform: 'translateY(0)'
          }
        }
      }}
      onClick={() => onJobClick(job)}
    >
      {/* Save button overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1
        }}
      >
        <Tooltip title={job.isSaved ? "Remove from saved" : "Save job"}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              if (onSaveClick) onSaveClick(job.id);
            }}
            size="small"
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': {
                bgcolor: 'background.paper',
                transform: 'scale(1.1)'
              }
            }}
            color={job.isSaved ? "primary" : "default"}
          >
            {job.isSaved ? <Bookmark /> : <BookmarkBorder />}
          </IconButton>
        </Tooltip>
      </Box>

      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Company Avatar and Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={job.company?.logoUrl}
            sx={{ width: 50, height: 50, mr: 2 }}
          >
            {job.company?.companyName?.charAt(0) || 'C'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                mb: 0.5,
                color: 'primary.main',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {job.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {job.company?.companyName || 'Company'}
            </Typography>
          </Box>
        </Box>

        {/* Job Details */}
        <Stack spacing={1} sx={{ mb: 2, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOn color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary" noWrap>
              {job.location}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AttachMoney color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary" noWrap>
              {formatSalary(job)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTime color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {job.publishedAt ? getTimeAgo(job.publishedAt) : 'Recently posted'}
            </Typography>
          </Box>
        </Stack>

        {/* Job Tags */}
        <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={getJobTypeLabel(job.type)} 
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip 
            label={getWorkModeLabel(job.workMode || 'ONSITE')} 
            size="small"
            color="secondary"
            variant="outlined"
          />
        </Box>

        {/* Description Preview */}
        {job.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4
            }}
          >
            {job.description}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Bottom Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {job.applicationsCount || 0} applicants
            </Typography>
            {job.company?.rating && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Rating value={job.company.rating} readOnly size="small" />
                <Typography variant="caption" color="text.secondary">
                  {job.company.rating}/5
                </Typography>
              </Box>
            )}
          </Box>
          
          <Button
            variant={job.hasApplied ? "outlined" : "contained"}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onApplyClick(job);
            }}
            disabled={job.hasApplied}
            startIcon={<Send />}
            sx={{ minWidth: 100 }}
          >
            {job.hasApplied ? 'Applied' : 'Apply'}
          </Button>
        </Box>

        {/* Hover Actions */}
        <Box
          className="job-card-actions"
          sx={{
            position: 'absolute',
            bottom: -20,
            left: '50%',
            transform: 'translateX(-50%) translateY(10px)',
            opacity: 0,
            transition: 'all 0.3s ease-in-out',
            display: 'flex',
            gap: 1,
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 1,
            boxShadow: 4,
            border: 1,
            borderColor: 'divider'
          }}
        >
          {onMenuClick && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onMenuClick(e, job);
              }}
            >
              <MoreVert />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default JobCard;
