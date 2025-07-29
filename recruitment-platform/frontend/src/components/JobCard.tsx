import React, { useState } from "react";
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
  Rating,
  keyframes,
  alpha,
  useTheme,
  Fade,
  Zoom,
  Grow,
} from "@mui/material";
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
  AccessTime,
  Star,
  WorkOutline,
  BusinessCenter,
  School,
  Assignment,
  Timeline,
  FlashOn,
} from "@mui/icons-material";

// Animations
const shimmerAnimation = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const pulseAnimation = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const glowAnimation = keyframes`
  0%, 100% { 
    box-shadow: 0 0 5px rgba(33, 150, 243, 0.3),
                0 0 10px rgba(33, 150, 243, 0.2),
                0 0 15px rgba(33, 150, 243, 0.1);
  }
  50% { 
    box-shadow: 0 0 20px rgba(33, 150, 243, 0.6),
                0 0 30px rgba(33, 150, 243, 0.4),
                0 0 40px rgba(33, 150, 243, 0.2);
  }
`;

const slideUpAnimation = keyframes`
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const rotateAnimation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

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
  } | string;
  companyLogo?: string;
  location: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  type: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | string;
  workMode?: "ONSITE" | "REMOTE" | "HYBRID" | string;
  experienceLevel?: "ENTRY" | "JUNIOR" | "INTERMEDIATE" | "SENIOR" | string;
  description?: string;
  applicationDeadline?: string;
  publishedAt?: string;
  applicationsCount?: number;
  applicationCount?: number;
  isSaved?: boolean;
  hasApplied?: boolean;
  viewCount?: number;
  viewsCount?: number;
  createdAt?: string;
  skills?: string[];
}

interface JobCardProps {
  job: Job;
  onJobClick: (job: Job) => void;
  onApplyClick: (job: Job) => void;
  onSaveClick?: (jobId: string) => void;
  onMenuClick?: (event: React.MouseEvent<HTMLElement>, job: Job) => void;
  viewMode?: "grid" | "list";
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  onJobClick,
  onApplyClick,
  onSaveClick,
  onMenuClick,
  viewMode = "grid",
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarkHovered, setIsBookmarkHovered] = useState(false);
  const [isApplyHovered, setIsApplyHovered] = useState(false);

  const formatSalary = (job: Job) => {
    if (job.salaryMin && job.salaryMax) {
      const currency = job.currency || "VND";
      const min = job.salaryMin.toLocaleString();
      const max = job.salaryMax.toLocaleString();
      return `${min} - ${max} ${currency}`;
    }
    return job.salary || "Competitive";
  };

  const getJobTypeData = (type: string) => {
    const typeData = {
      FULL_TIME: {
        label: "Full-time",
        icon: <BusinessCenter />,
        color: "primary",
      },
      PART_TIME: { label: "Part-time", icon: <Schedule />, color: "secondary" },
      INTERNSHIP: { label: "Internship", icon: <School />, color: "info" },
      CONTRACT: { label: "Contract", icon: <Assignment />, color: "warning" },
    };
    return (
      typeData[type as keyof typeof typeData] || {
        label: type,
        icon: <WorkOutline />,
        color: "default",
      }
    );
  };

  const getWorkModeData = (mode: string) => {
    const modeData = {
      ONSITE: { label: "On-site", color: "success" },
      REMOTE: { label: "Remote", color: "error" },
      HYBRID: { label: "Hybrid", color: "warning" },
    };
    return (
      modeData[mode as keyof typeof modeData] || {
        label: mode,
        color: "default",
      }
    );
  };

  const getExperienceData = (level: string) => {
    const levelData = {
      ENTRY: { label: "Entry Level", color: "success" },
      JUNIOR: { label: "Junior", color: "info" },
      INTERMEDIATE: { label: "Mid Level", color: "warning" },
      SENIOR: { label: "Senior", color: "error" },
    };
    return (
      levelData[level as keyof typeof levelData] || {
        label: level,
        color: "default",
      }
    );
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 ngày trước";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} tuần trước`;
    return `${Math.ceil(diffDays / 30)} tháng trước`;
  };

  const getUrgencyIndicator = () => {
    if (job.applicationDeadline) {
      const deadline = new Date(job.applicationDeadline);
      const now = new Date();
      const daysLeft = Math.ceil(
        (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysLeft <= 3) {
        return { color: "error", label: "Gấp", icon: <FlashOn /> };
      } else if (daysLeft <= 7) {
        return { color: "warning", label: "Sắp hết hạn", icon: <Timeline /> };
      }
    }
    return null;
  };

  const urgency = getUrgencyIndicator();
  const jobTypeData = getJobTypeData(job.type);
  const workModeData = getWorkModeData(job.workMode || "ONSITE");
  const experienceData = getExperienceData(job.experienceLevel || "ENTRY");

  if (viewMode === "list") {
    return (
      <Card
        elevation={isHovered ? 8 : 2}
        sx={{
          mb: 2,
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          background: isHovered
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`
            : theme.palette.background.paper,
          border: `2px solid ${isHovered ? theme.palette.primary.main : "transparent"}`,
          borderRadius: 3,
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "100%",
            height: "100%",
            background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
            transition: "left 0.6s ease",
          },
          "&:hover": {
            transform: "translateY(-4px) scale(1.01)",
            boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
            "&::before": {
              left: "100%",
            },
          },
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onJobClick(job)}
      >
        {/* Urgency Indicator */}
        {urgency && (
          <Box
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              zIndex: 2,
              animation: `${pulseAnimation} 2s ease-in-out infinite`,
            }}
          >
            <Chip
              icon={urgency.icon}
              label={urgency.label}
              size="small"
              color={urgency.color as any}
              sx={{
                fontWeight: 600,
                boxShadow: 2,
                animation:
                  urgency.color === "error"
                    ? `${glowAnimation} 2s ease-in-out infinite`
                    : "none",
              }}
            />
          </Box>
        )}

        <CardContent sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
              <Box
                sx={{
                  position: "relative",
                  transition: "transform 0.3s ease",
                  transform: isHovered ? "scale(1.1)" : "scale(1)",
                }}
              >
                <Avatar
                  src={typeof job.company === 'object' ? job.company?.logoUrl : job.companyLogo}
                  sx={{
                    width: 80,
                    height: 80,
                    mr: 3,
                    border: `3px solid ${theme.palette.primary.main}`,
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  {typeof job.company === 'object' ? job.company?.companyName?.[0] : job.company?.[0] || "C"}
                </Avatar>
                {typeof job.company === 'object' && job.company?.rating && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: -8,
                      right: 16,
                      bgcolor: "background.paper",
                      borderRadius: "50%",
                      p: 0.5,
                      boxShadow: 2,
                      animation: `${slideUpAnimation} 0.5s ease`,
                    }}
                  >
                    <Star sx={{ fontSize: 16, color: "warning.main" }} />
                  </Box>
                )}
              </Box>

              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: "primary.main",
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {job.title}
                  </Typography>
                  {job.hasApplied && (
                    <Zoom in timeout={300}>
                      <Chip
                        label="✓ Đã ứng tuyển"
                        size="small"
                        color="success"
                        sx={{
                          fontWeight: 600,
                          boxShadow: 1,
                          animation: `${glowAnimation} 3s ease-in-out infinite`,
                        }}
                      />
                    </Zoom>
                  )}
                </Box>

                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ mb: 3, fontWeight: 500 }}
                >
                  {typeof job.company === 'object' ? job.company?.companyName : job.company || "Company"}
                  {typeof job.company === 'object' && job.company?.rating && (
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        ml: 2,
                      }}
                    >
                      <Rating
                        value={typeof job.company === 'object' ? job.company.rating : 0}
                        readOnly
                        size="small"
                        sx={{
                          "& .MuiRating-iconFilled": {
                            color: "warning.main",
                          },
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ ml: 1, fontWeight: 600 }}
                      >
                        {typeof job.company === 'object' ? job.company.rating : 0}/5
                      </Typography>
                    </Box>
                  )}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    mb: 3,
                    flexWrap: "wrap",
                  }}
                >
                  <Fade in timeout={500}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LocationOn color="action" fontSize="small" />
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        {job.location}
                      </Typography>
                    </Box>
                  </Fade>

                  <Fade in timeout={700}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AttachMoney color="action" fontSize="small" />
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        {formatSalary(job)}
                      </Typography>
                    </Box>
                  </Fade>

                  <Fade in timeout={900}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccessTime color="action" fontSize="small" />
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        {job.publishedAt
                          ? getTimeAgo(job.publishedAt)
                          : "Vừa đăng"}
                      </Typography>
                    </Box>
                  </Fade>

                  <Fade in timeout={1100}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Visibility color="action" fontSize="small" />
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        {job.viewCount || job.viewsCount || 0} lượt xem
                      </Typography>
                    </Box>
                  </Fade>
                </Box>

                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                  <Grow in timeout={300}>
                    <Chip
                      icon={jobTypeData.icon}
                      label={jobTypeData.label}
                      size="medium"
                      color={jobTypeData.color as any}
                      variant="outlined"
                      sx={{
                        fontWeight: 600,
                        borderWidth: 2,
                        "&:hover": {
                          transform: "scale(1.05)",
                          boxShadow: 2,
                        },
                      }}
                    />
                  </Grow>
                  <Grow in timeout={500}>
                    <Chip
                      label={workModeData.label}
                      size="medium"
                      color={workModeData.color as any}
                      variant="filled"
                      sx={{
                        fontWeight: 600,
                        "&:hover": {
                          transform: "scale(1.05)",
                          boxShadow: 2,
                        },
                      }}
                    />
                  </Grow>
                  <Grow in timeout={700}>
                    <Chip
                      label={experienceData.label}
                      size="medium"
                      color={experienceData.color as any}
                      variant="outlined"
                      sx={{
                        fontWeight: 600,
                        borderWidth: 2,
                        "&:hover": {
                          transform: "scale(1.05)",
                          boxShadow: 2,
                        },
                      }}
                    />
                  </Grow>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 2,
                ml: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Tooltip
                  title={job.isSaved ? "Bỏ lưu công việc" : "Lưu công việc"}
                >
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSaveClick) onSaveClick(job.id);
                    }}
                    onMouseEnter={() => setIsBookmarkHovered(true)}
                    onMouseLeave={() => setIsBookmarkHovered(false)}
                    size="large"
                    color={job.isSaved ? "primary" : "default"}
                    sx={{
                      bgcolor: job.isSaved
                        ? alpha(theme.palette.primary.main, 0.1)
                        : "background.paper",
                      border: `2px solid ${job.isSaved ? theme.palette.primary.main : theme.palette.divider}`,
                      boxShadow: 2,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "scale(1.15) rotate(10deg)",
                        bgcolor: job.isSaved
                          ? alpha(theme.palette.primary.main, 0.2)
                          : alpha(theme.palette.primary.main, 0.1),
                        border: `2px solid ${theme.palette.primary.main}`,
                        boxShadow: 4,
                      },
                    }}
                  >
                    {job.isSaved ? (
                      <Bookmark
                        sx={{
                          animation: isBookmarkHovered
                            ? `${pulseAnimation} 0.6s ease`
                            : "none",
                        }}
                      />
                    ) : (
                      <BookmarkBorder
                        sx={{
                          animation: isBookmarkHovered
                            ? `${rotateAnimation} 0.6s ease`
                            : "none",
                        }}
                      />
                    )}
                  </IconButton>
                </Tooltip>

                {onMenuClick && (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onMenuClick(e, job);
                    }}
                    size="large"
                    sx={{
                      bgcolor: "background.paper",
                      border: `2px solid ${theme.palette.divider}`,
                      boxShadow: 2,
                      "&:hover": {
                        transform: "scale(1.1)",
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        border: `2px solid ${theme.palette.primary.main}`,
                      },
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                )}
              </Box>

              <Button
                variant={job.hasApplied ? "outlined" : "contained"}
                size="large"
                onClick={(e) => {
                  e.stopPropagation();
                  onApplyClick(job);
                }}
                onMouseEnter={() => setIsApplyHovered(true)}
                onMouseLeave={() => setIsApplyHovered(false)}
                disabled={job.hasApplied}
                startIcon={
                  <Send
                    sx={{
                      transform:
                        isApplyHovered && !job.hasApplied
                          ? "translateX(4px)"
                          : "translateX(0)",
                      transition: "transform 0.3s ease",
                    }}
                  />
                }
                sx={{
                  minWidth: 160,
                  py: 1.5,
                  px: 3,
                  fontWeight: 700,
                  fontSize: "1rem",
                  borderRadius: 2,
                  textTransform: "none",
                  background: job.hasApplied
                    ? "transparent"
                    : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  boxShadow: job.hasApplied ? 2 : 4,
                  border: job.hasApplied
                    ? `2px solid ${theme.palette.success.main}`
                    : "none",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: job.hasApplied
                      ? "none"
                      : "translateY(-2px) scale(1.05)",
                    boxShadow: job.hasApplied ? 2 : 8,
                    background: job.hasApplied
                      ? "transparent"
                      : `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
                  },
                  "&:disabled": {
                    color: theme.palette.success.main,
                    border: `2px solid ${theme.palette.success.main}`,
                  },
                }}
              >
                {job.hasApplied ? "✓ Đã ứng tuyển" : "Ứng tuyển ngay"}
              </Button>

              {job.applicationsCount !== undefined && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontWeight: 500,
                    opacity: 0.8,
                    transition: "opacity 0.3s ease",
                    "&:hover": { opacity: 1 },
                  }}
                >
                  {job.applicationsCount} ứng viên
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
      elevation={isHovered ? 12 : 4}
      sx={{
        height: "100%",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        background: isHovered
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`
          : theme.palette.background.paper,
        border: `2px solid ${isHovered ? theme.palette.primary.main : "transparent"}`,
        borderRadius: 3,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "100%",
          height: "100%",
          background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
          transition: "left 0.6s ease",
        },
        "&:hover": {
          transform: "translateY(-8px) scale(1.02)",
          "&::before": {
            left: "100%",
          },
          "& .job-card-actions": {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onJobClick(job)}
    >
      {/* Save button overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 3,
        }}
      >
        <Tooltip title={job.isSaved ? "Bỏ lưu công việc" : "Lưu công việc"}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              if (onSaveClick) onSaveClick(job.id);
            }}
            size="medium"
            sx={{
              bgcolor: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: "blur(10px)",
              border: `2px solid ${job.isSaved ? theme.palette.primary.main : alpha(theme.palette.divider, 0.5)}`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                bgcolor: job.isSaved
                  ? alpha(theme.palette.primary.main, 0.1)
                  : alpha(theme.palette.primary.main, 0.05),
                transform: "scale(1.15) rotate(10deg)",
                border: `2px solid ${theme.palette.primary.main}`,
                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
              },
            }}
            color={job.isSaved ? "primary" : "default"}
          >
            {job.isSaved ? <Bookmark /> : <BookmarkBorder />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Urgency Indicator */}
      {urgency && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            zIndex: 2,
            animation: `${pulseAnimation} 2s ease-in-out infinite`,
          }}
        >
          <Chip
            icon={urgency.icon}
            label={urgency.label}
            size="small"
            color={urgency.color as any}
            sx={{
              fontWeight: 600,
              boxShadow: 2,
              animation:
                urgency.color === "error"
                  ? `${glowAnimation} 2s ease-in-out infinite`
                  : "none",
            }}
          />
        </Box>
      )}

      <CardContent
        sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}
      >
        {/* Company Avatar and Info */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Box
            sx={{
              position: "relative",
              transition: "transform 0.3s ease",
              transform: isHovered ? "scale(1.1)" : "scale(1)",
            }}
          >
            <Avatar
              src={typeof job.company === 'object' ? job.company?.logoUrl : job.companyLogo}
              sx={{
                width: 64,
                height: 64,
                mr: 2,
                border: `3px solid ${theme.palette.primary.main}`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              {typeof job.company === 'object' ? job.company?.companyName?.[0] : job.company?.[0] || "C"}
            </Avatar>
            {typeof job.company === 'object' && job.company?.rating && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: -4,
                  right: 8,
                  bgcolor: "background.paper",
                  borderRadius: "50%",
                  p: 0.5,
                  boxShadow: 2,
                }}
              >
                <Star sx={{ fontSize: 14, color: "warning.main" }} />
              </Box>
            )}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 0.5,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                fontSize: "1.1rem",
              }}
            >
              {job.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ fontWeight: 500 }}
            >
              {typeof job.company === 'object' ? job.company?.companyName : job.company || "Company"}
            </Typography>
          </Box>
        </Box>

        {/* Job Details */}
        <Stack spacing={1.5} sx={{ mb: 3, flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LocationOn color="action" fontSize="small" />
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              fontWeight={500}
            >
              {job.location}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AttachMoney color="action" fontSize="small" />
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              fontWeight={500}
            >
              {formatSalary(job)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccessTime color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {job.publishedAt ? getTimeAgo(job.publishedAt) : "Vừa đăng"}
            </Typography>
          </Box>
        </Stack>

        {/* Job Tags */}
        <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
          <Chip
            icon={jobTypeData.icon}
            label={jobTypeData.label}
            size="small"
            color={jobTypeData.color as any}
            variant="outlined"
            sx={{
              fontWeight: 600,
              fontSize: "0.75rem",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          />
          <Chip
            label={workModeData.label}
            size="small"
            color={workModeData.color as any}
            variant="filled"
            sx={{
              fontWeight: 600,
              fontSize: "0.75rem",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          />
        </Box>

        {/* Description Preview */}
        {job.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.5,
              opacity: 0.8,
            }}
          >
            {job.description}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Bottom Actions */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={500}
            >
              {job.applicationsCount || 0} ứng viên
            </Typography>
            {typeof job.company === 'object' && job.company?.rating && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Rating
                  value={typeof job.company === 'object' ? job.company.rating : 0}
                  readOnly
                  size="small"
                  sx={{
                    "& .MuiRating-iconFilled": {
                      color: "warning.main",
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  {typeof job.company === 'object' ? job.company.rating : 0}/5
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
            sx={{
              minWidth: 120,
              fontWeight: 600,
              borderRadius: 2,
              background: job.hasApplied
                ? "transparent"
                : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              border: job.hasApplied
                ? `2px solid ${theme.palette.success.main}`
                : "none",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: job.hasApplied
                  ? "none"
                  : "translateY(-1px) scale(1.05)",
                background: job.hasApplied
                  ? "transparent"
                  : `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
              },
              "&:disabled": {
                color: theme.palette.success.main,
                border: `2px solid ${theme.palette.success.main}`,
              },
            }}
          >
            {job.hasApplied ? "✓ Đã ứng tuyển" : "Ứng tuyển"}
          </Button>
        </Box>

        {/* Hover Actions */}
        <Box
          className="job-card-actions"
          sx={{
            position: "absolute",
            bottom: -25,
            left: "50%",
            transform: "translateX(-50%) translateY(15px)",
            opacity: 0,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "flex",
            gap: 1,
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: "blur(10px)",
            borderRadius: 2,
            p: 1,
            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.15)}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            zIndex: 2,
          }}
        >
          {onMenuClick && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onMenuClick(e, job);
              }}
              sx={{
                "&:hover": {
                  transform: "scale(1.1)",
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
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
