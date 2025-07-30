import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Pagination,
  Divider,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Badge,
  Container,
  Stack,
  useTheme,
  alpha,
  keyframes,
  Fade,
  Slide,
  Zoom,
  Collapse,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
  Tooltip,
  LinearProgress,
  Skeleton,
  Snackbar,
  Alert,
  CircularProgress,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from "@mui/material";
import {
  Search,
  LocationOn,
  Business,
  People,
  TrendingUp,
  Star,
  Visibility,
  Bookmark,
  BookmarkBorder,
  FilterList,
  Clear,
  Sort,
  ViewModule,
  ViewList,
  Language,
  Email,
  Phone,
  Public,
  Work,
  Schedule,
  Assessment,
  EmojiEvents,
  Verified,
  LocalFireDepartment,
  FlashOn,
  Psychology,
  Rocket,
  AutoGraph,
  Speed,
  Security,
  Groups,
  MonetizationOn,
  BusinessCenter,
  School,
  Code,
  Tune,
  Map,
  Timeline,
  CompareArrows,
  TrendingDown,
  Refresh,
  LinkedIn,
  Facebook,
  Twitter,
  Instagram,
  YouTube,
  FavoriteBorder,
  Favorite,
  Share,
  MoreVert,
  Analytics,
  Notifications,
  NotificationsActive,
  TrendingFlat,
  Update,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { 
  companiesAPI, 
  EnhancedCompany, 
  CompaniesFilters, 
  CompaniesResponse 
} from "../services/api/companiesAPI";
import socketService from "../services/socketService";

// Modern animations
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulseGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.4),
                0 0 40px rgba(102, 126, 234, 0.2),
                0 0 60px rgba(102, 126, 234, 0.1);
  }
  50% { 
    box-shadow: 0 0 30px rgba(102, 126, 234, 0.6),
                0 0 60px rgba(102, 126, 234, 0.3),
                0 0 90px rgba(102, 126, 234, 0.2);
  }
`;

const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(2deg); }
`;

const shimmerAnimation = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const slideInFromRight = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const bounceIn = keyframes`
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
`;

// Enhanced company card component
const CompanyCard: React.FC<{
  company: EnhancedCompany;
  viewMode: "grid" | "list";
  onCompanyClick: (company: EnhancedCompany) => void;
  onBookmarkClick: (companyId: string) => void;
  onFollowClick: (companyId: string) => void;
  onShareClick: (company: EnhancedCompany) => void;
  isBookmarked?: boolean;
  isFollowing?: boolean;
  showRealTimeStats?: boolean;
}> = ({
  company,
  viewMode,
  onCompanyClick,
  onBookmarkClick,
  onFollowClick,
  onShareClick,
  isBookmarked = false,
  isFollowing = false,
  showRealTimeStats = true,
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [realTimeStats, setRealTimeStats] = useState({
    viewCount: company.viewCount || 0,
    followerCount: company.followers || 0,
    activeJobs: company.activeJobs || 0,
    lastUpdate: new Date()
  });

  // Real-time stats updates
  useEffect(() => {
    if (!showRealTimeStats) return;

    const handleStatsUpdate = (data: any) => {
      if (data.companyId === company.id) {
        setRealTimeStats(prev => ({
          ...prev,
          ...data.stats,
          lastUpdate: new Date()
        }));
      }
    };

    const handleViewUpdate = (data: any) => {
      if (data.companyId === company.id) {
        setRealTimeStats(prev => ({
          ...prev,
          viewCount: data.totalViews,
          lastUpdate: new Date()
        }));
      }
    };

    socketService.on('company-stats-updated', handleStatsUpdate);
    socketService.on('company-view-tracked', handleViewUpdate);

          return () => {
        socketService.off('company-stats-updated');
        socketService.off('company-view-tracked');
      };
  }, [company.id, showRealTimeStats]);

  const getSizeColor = (size: string) => {
    switch (size?.toLowerCase()) {
      case "startup":
        return theme.palette.info.main;
      case "1-50":
        return theme.palette.success.main;
      case "51-200":
        return theme.palette.warning.main;
      case "201-1000":
        return theme.palette.primary.main;
      case "1000+":
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const handleCardClick = useCallback(() => {
    // Track view
    companiesAPI.trackView(company.id, {
      userId: undefined, // Will be set from auth context
      ipAddress: 'unknown',
      userAgent: navigator.userAgent
    }).catch(console.error);
    
    onCompanyClick(company);
  }, [company, onCompanyClick]);

  if (viewMode === "list") {
    return (
      <Card
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
          "&:hover": {
            transform: "translateY(-2px) scale(1.01)",
            boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
          },
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
          "&:hover::before": {
            left: "100%",
          },
        }}
        onClick={handleCardClick}
      >
        {/* Enhanced Badges */}
        {(company.isFeatured || company.isVerified) && (
          <Box
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              zIndex: 2,
              display: "flex",
              gap: 1,
            }}
          >
            {company.isFeatured && (
              <Chip
                label="🔥 Featured"
                size="small"
                color="error"
                sx={{
                  fontWeight: 700,
                  animation: `${pulseGlow} 2s ease-in-out infinite`,
                }}
              />
            )}
            {company.isVerified && (
              <Chip
                icon={<Verified />}
                label="Verified"
                size="small"
                color="success"
                sx={{ fontWeight: 700 }}
              />
            )}
          </Box>
        )}

        {/* Enhanced Action Buttons */}
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 2,
            display: "flex",
            gap: 1,
          }}
        >
          <Tooltip title={isFollowing ? "Unfollow" : "Follow"}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onFollowClick(company.id);
              }}
              sx={{
                background: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: "blur(10px)",
                "&:hover": {
                  background: alpha(theme.palette.secondary.main, 0.1),
                  transform: "scale(1.1)",
                },
              }}
            >
              {isFollowing ? <Favorite color="secondary" /> : <FavoriteBorder />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title={isBookmarked ? "Unbookmark" : "Bookmark"}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onBookmarkClick(company.id);
              }}
              sx={{
                background: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: "blur(10px)",
                "&:hover": {
                  background: alpha(theme.palette.primary.main, 0.1),
                  transform: "scale(1.1)",
                },
              }}
            >
              {isBookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Share">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onShareClick(company);
              }}
              sx={{
                background: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: "blur(10px)",
                "&:hover": {
                  background: alpha(theme.palette.info.main, 0.1),
                  transform: "scale(1.1)",
                },
              }}
            >
              <Share />
            </IconButton>
          </Tooltip>
        </Box>

        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Avatar
              src={company.logoUrl}
              sx={{
                width: 80,
                height: 80,
                border: `3px solid ${theme.palette.primary.main}`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              {company.companyName.charAt(0)}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                {company.companyName}
                {showRealTimeStats && (
                  <Chip
                    label={`${realTimeStats.viewCount} views`}
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{ ml: 2, fontSize: '0.7rem' }}
                  />
                )}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {company.industry}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  mb: 2,
                  flexWrap: "wrap",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <LocationOn color="action" fontSize="small" />
                  <Typography variant="body2">{company.location}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <People color="action" fontSize="small" />
                  <Typography variant="body2">
                    {company.companySize} nhân viên
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Work color="action" fontSize="small" />
                  <Typography variant="body2">
                    {realTimeStats.activeJobs} việc làm
                  </Typography>
                </Box>
                {company.rating && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Rating value={company.rating} readOnly size="small" />
                    <Typography variant="body2">{company.rating}/5</Typography>
                  </Box>
                )}
                {showRealTimeStats && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Groups color="action" fontSize="small" />
                    <Typography variant="body2">
                      {realTimeStats.followerCount} followers
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label={company.companySize}
                  size="small"
                  sx={{
                    background: alpha(getSizeColor(company.companySize || ''), 0.1),
                    color: getSizeColor(company.companySize || ''),
                    border: `1px solid ${alpha(getSizeColor(company.companySize || ''), 0.3)}`,
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label={company.industry}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                {company.foundedYear && (
                  <Chip
                    label={`Thành lập ${company.foundedYear}`}
                    size="small"
                    variant="outlined"
                  />
                )}
                {showRealTimeStats && realTimeStats.lastUpdate && (
                  <Chip
                    icon={<Update />}
                    label={`Updated ${Math.floor((Date.now() - realTimeStats.lastUpdate.getTime()) / 60000)}m ago`}
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
                sx={{
                  minWidth: 140,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                }}
              >
                Xem công ty
              </Button>

              {company.socialLinks && (
                <Box sx={{ display: "flex", gap: 1 }}>
                  {company.socialLinks.linkedin && (
                    <IconButton 
                      size="small" 
                      sx={{ color: "#0077B5" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(company.socialLinks!.linkedin, '_blank');
                      }}
                    >
                      <LinkedIn />
                    </IconButton>
                  )}
                  {company.socialLinks.website && (
                    <IconButton
                      size="small"
                      sx={{ color: theme.palette.info.main }}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(company.socialLinks!.website, '_blank');
                      }}
                    >
                      <Public />
                    </IconButton>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Grid view (enhanced)
  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        height: 400, // Fixed height for consistency
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        background: isHovered
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`
          : theme.palette.background.paper,
        border: `1px solid ${isHovered ? theme.palette.primary.main : alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 4,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
          borderColor: theme.palette.primary.main,
        },
        // Modern shadow style like LinkedIn
        boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
      }}
      onClick={handleCardClick}
    >
      {/* Enhanced Badges - LinkedIn style */}
      {(company.isFeatured || company.isVerified) && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            zIndex: 3,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          {company.isFeatured && (
            <Chip
              label="FEATURED"
              size="small"
              sx={{
                background: `linear-gradient(135deg, #FF6B35, #F7931E)`,
                color: 'white',
                fontWeight: 700,
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                height: 20,
                '& .MuiChip-label': { px: 1 },
                boxShadow: `0 2px 8px ${alpha('#FF6B35', 0.3)}`,
              }}
            />
          )}
          {company.isVerified && (
            <Chip
              icon={<Verified sx={{ fontSize: 12 }} />}
              label="VERIFIED"
              size="small"
              sx={{
                background: theme.palette.success.main,
                color: 'white',
                fontWeight: 600,
                fontSize: '0.65rem',
                height: 20,
                '& .MuiChip-label': { px: 1 },
              }}
            />
          )}
        </Box>
      )}

      {/* Action Buttons - Modern style */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 3,
          display: "flex",
          gap: 0.5,
        }}
      >
        <Tooltip title={isFollowing ? "Bỏ theo dõi" : "Theo dõi công ty"}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onFollowClick(company.id);
            }}
            size="small"
            sx={{
              background: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: "blur(10px)",
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              width: 32,
              height: 32,
              "&:hover": {
                background: isFollowing ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.primary.main, 0.1),
                transform: "scale(1.05)",
              },
            }}
          >
            {isFollowing ? <Favorite sx={{ fontSize: 16, color: theme.palette.error.main }} /> : <FavoriteBorder sx={{ fontSize: 16 }} />}
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Lưu công ty">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkClick(company.id);
            }}
            size="small"
            sx={{
              background: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: "blur(10px)",
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              width: 32,
              height: 32,
              "&:hover": {
                background: alpha(theme.palette.primary.main, 0.1),
                transform: "scale(1.05)",
              },
            }}
          >
            {isBookmarked ? <Bookmark sx={{ fontSize: 16, color: theme.palette.primary.main }} /> : <BookmarkBorder sx={{ fontSize: 16 }} />}
          </IconButton>
        </Tooltip>
      </Box>

      <CardContent
        sx={{ 
          p: 3, 
          height: "100%", 
          display: "flex", 
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Company Logo & Name - Modern LinkedIn style */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Avatar
            src={company.logoUrl}
            sx={{
              width: 64,
              height: 64,
              mx: "auto",
              mb: 2,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.1)}`,
              background: theme.palette.background.paper,
            }}
          >
            <Typography variant="h6" fontWeight={700} color="primary">
              {company.companyName.charAt(0)}
            </Typography>
          </Avatar>
          <Typography 
            variant="h6" 
            fontWeight={600} 
            sx={{ 
              mb: 0.5,
              fontSize: '1.1rem',
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {company.companyName}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            {company.industry || 'Technology'}
          </Typography>
        </Box>

        {/* Real-time Stats - Enhanced */}
        {showRealTimeStats && (
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Chip
                icon={<Visibility sx={{ fontSize: 14 }} />}
                label={`${realTimeStats.viewCount} views`}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.7rem',
                  height: 24,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                  color: theme.palette.info.main,
                  '& .MuiChip-icon': { color: theme.palette.info.main },
                }}
              />
              <Chip
                icon={<Groups sx={{ fontSize: 14 }} />}
                label={`${realTimeStats.followerCount} followers`}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.7rem',
                  height: 24,
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                  color: theme.palette.secondary.main,
                  '& .MuiChip-icon': { color: theme.palette.secondary.main },
                }}
              />
            </Stack>
          </Box>
        )}

        {/* Company Info - Clean layout without employee count */}
        <Stack spacing={1.5} sx={{ mb: 2, flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LocationOn sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
            <Typography 
              variant="body2" 
              noWrap
              sx={{ fontWeight: 500, color: theme.palette.text.primary }}
            >
              {company.location}
            </Typography>
          </Box>
          
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Work sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
            <Typography 
              variant="body2"
              sx={{ fontWeight: 500, color: theme.palette.text.primary }}
            >
              {realTimeStats.activeJobs} job{realTimeStats.activeJobs !== 1 ? 's' : ''} available
            </Typography>
          </Box>
          
          {/* Display last job posted instead of rating */}
          {company.lastJobPosted && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Schedule sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              <Typography 
                variant="body2"
                sx={{ fontWeight: 500, color: theme.palette.text.primary }}
              >
                Last posted: {new Date(company.lastJobPosted).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Stack>

        {/* Description - Limited lines */}
        {company.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.4,
              fontSize: '0.875rem',
            }}
          >
            {company.description}
          </Typography>
        )}

        {/* Action Button - Modern style */}
        <Button
          variant="contained"
          fullWidth
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            height: 40,
            background: theme.palette.primary.main,
            color: 'white',
            "&:hover": {
              background: theme.palette.primary.dark,
              transform: "translateY(-1px)",
              boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
            },
          }}
        >
          View Company
        </Button>
      </CardContent>
    </Card>
  );
};

// Company Filters Component
const CompanyFilters: React.FC<{
  filters: any;
  setFilters: (filters: any) => void;
  onClearFilters: () => void;
}> = ({ filters, setFilters, onClearFilters }) => {
  const theme = useTheme();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Manufacturing",
    "Retail",
    "Consulting",
    "Media",
    "Transportation",
    "Real Estate",
  ];

  const companySizes = [
    { value: "startup", label: "Startup (1-10)" },
    { value: "1-50", label: "Small (1-50)" },
    { value: "51-200", label: "Medium (51-200)" },
    { value: "201-1000", label: "Large (201-1000)" },
    { value: "1000+", label: "Enterprise (1000+)" },
  ];

  const locations = [
    "Hà Nội",
    "TP.HCM",
    "Đà Nẵng",
    "Cần Thơ",
    "Hải Phòng",
    "Bình Dương",
  ];

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.paper, 0.95)} 0%, 
          ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        backdropFilter: "blur(20px)",
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 3,
        mb: 3,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Filter Toggle */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            startIcon={<Tune />}
            onClick={() => setFiltersOpen(!filtersOpen)}
            sx={{
              borderRadius: 2,
              borderColor: alpha(theme.palette.primary.main, 0.3),
              "&:hover": {
                background: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            Bộ lọc
          </Button>

          {/* Quick Filters */}
          <ToggleButtonGroup
            value={filters.featured || []}
            onChange={(_, values) =>
              setFilters({ ...filters, featured: values })
            }
            aria-label="quick filters"
          >
            <ToggleButton value="verified" sx={{ borderRadius: 2 }}>
              <Verified sx={{ mr: 1 }} />
              Đã xác thực
            </ToggleButton>
            <ToggleButton value="featured" sx={{ borderRadius: 2 }}>
              <LocalFireDepartment sx={{ mr: 1 }} />
              Nổi bật
            </ToggleButton>
            <ToggleButton value="hiring" sx={{ borderRadius: 2 }}>
              <Work sx={{ mr: 1 }} />
              Đang tuyển
            </ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="text"
            startIcon={<Clear />}
            onClick={onClearFilters}
            sx={{
              color: theme.palette.text.secondary,
              "&:hover": {
                color: theme.palette.error.main,
              },
            }}
          >
            Xóa lọc
          </Button>
        </Box>

        {/* Advanced Filters */}
        <Collapse in={filtersOpen}>
          <Box
            sx={{
              mt: 3,
              pt: 3,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Grid container spacing={3}>
              {/* Industry */}
              <Grid item xs={12} md={4}>
                <Autocomplete
                  multiple
                  options={industries}
                  value={filters.industries || []}
                  onChange={(_, industries) =>
                    setFilters({ ...filters, industries })
                  }
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option}
                        label={option}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Ngành nghề"
                      placeholder="Chọn ngành..."
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  )}
                />
              </Grid>

              {/* Company Size */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Quy mô công ty</InputLabel>
                  <Select
                    multiple
                    value={filters.sizes || []}
                    onChange={(e) =>
                      setFilters({ ...filters, sizes: e.target.value })
                    }
                    label="Quy mô công ty"
                    sx={{ borderRadius: 2 }}
                  >
                    {companySizes.map((size) => (
                      <MenuItem key={size.value} value={size.value}>
                        {size.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Location */}
              <Grid item xs={12} md={4}>
                <Autocomplete
                  multiple
                  options={locations}
                  value={filters.locations || []}
                  onChange={(_, locations) =>
                    setFilters({ ...filters, locations })
                  }
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option}
                        label={option}
                        color="secondary"
                        variant="outlined"
                        size="small"
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Địa điểm"
                      placeholder="Chọn địa điểm..."
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

const CompaniesPage: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<EnhancedCompany[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<EnhancedCompany[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<any>({
    industries: [],
    sizes: [],
    locations: [],
    featured: []
  });
  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [companiesPerPage] = useState(12);
  const [selectedCompany, setSelectedCompany] = useState<EnhancedCompany | null>(null);
  const [companyDetailOpen, setCompanyDetailOpen] = useState(false);
  const [bookmarkedCompanies, setBookmarkedCompanies] = useState<string[]>([]);
  const [followingCompanies, setFollowingCompanies] = useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("info");

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [companies, searchTerm, filters, sortBy, quickFilters]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await companiesAPI.getAll();
      setCompanies(response.data.companies || []);
    } catch (error) {
      console.error("Error loading companies:", error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...(companies || [])];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (company) =>
          company.companyName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase())) ||
          company.location.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Industry filter
    if (filters.industries && Array.isArray(filters.industries) && filters.industries.length > 0) {
      filtered = filtered.filter((company) =>
        filters.industries.includes(company.industry),
      );
    }

    // Size filter
    if (filters.sizes && Array.isArray(filters.sizes) && filters.sizes.length > 0) {
      filtered = filtered.filter((company) =>
        filters.sizes.includes(company.companySize),
      );
    }

    // Location filter
    if (filters.locations && Array.isArray(filters.locations) && filters.locations.length > 0) {
      filtered = filtered.filter((company) =>
        filters.locations.includes(company.location),
      );
    }

    // Feature filters (from quickFilters)
    if (quickFilters && Array.isArray(quickFilters) && quickFilters.length > 0) {
      if (quickFilters.includes("verified")) {
        filtered = filtered.filter((company) => company.isVerified);
      }
      if (quickFilters.includes("featured")) {
        filtered = filtered.filter((company) => company.isFeatured);
      }
      if (quickFilters.includes("hiring")) {
        filtered = filtered.filter((company) => (company.activeJobs || 0) > 0);
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.companyName.localeCompare(b.companyName);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "jobs":
          return (b.activeJobs || 0) - (a.activeJobs || 0);
        case "size":
          return (a.companySize || '').localeCompare(b.companySize || '');
        default:
          return 0;
      }
    });

    setFilteredCompanies(filtered);
    setCurrentPage(1);
  };

  const handleQuickFilterChange = (event: React.MouseEvent<HTMLElement>, newFilters: string[]) => {
    setQuickFilters(newFilters || []);
  };

  const handleSearch = () => {
    applyFilters();
  };

  const handleClearFilters = () => {
    setFilters({
      industries: [],
      sizes: [],
      locations: [],
      featured: []
    });
    setQuickFilters([]);
    setSearchTerm("");
  };

  const handleCompanyClick = (company: EnhancedCompany) => {
    setSelectedCompany(company);
    setCompanyDetailOpen(true);
  };

  const handleBookmarkClick = (companyId: string) => {
    setBookmarkedCompanies((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId],
    );
  };

  const handleFollowClick = (companyId: string) => {
    setFollowingCompanies((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId],
    );
  };

  const handleShareClick = (company: EnhancedCompany) => {
    const url = `${window.location.origin}/companies/${company.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setSnackbarMessage("Company link copied to clipboard!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    }).catch(() => {
      setSnackbarMessage("Failed to copy company link.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    });
  };

  // Pagination - Safe array access
  const safeFilteredCompanies = filteredCompanies || [];
  const indexOfLastCompany = currentPage * companiesPerPage;
  const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
  const currentCompanies = safeFilteredCompanies.slice(
    indexOfFirstCompany,
    indexOfLastCompany,
  );
  const totalPages = Math.ceil(safeFilteredCompanies.length / companiesPerPage);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.1)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: `${pulseGlow} 2s ease-in-out infinite`,
              mb: 2,
            }}
          >
            <Business sx={{ fontSize: 40, color: "white" }} />
          </Box>
          <Typography variant="h6" color="primary.main">
            Đang tải danh sách công ty...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: "100vh",
        background: `
          linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.05)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.05)} 50%,
            ${alpha(theme.palette.info.main, 0.05)} 100%),
          radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%)
        `,
        position: "relative",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${theme.palette.primary.main.slice(1)}' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          pointerEvents: "none",
          zIndex: 0,
        },
      }}
    >
      {/* Header Section - Modern style */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          py: 6,
          px: 3,
          borderRadius: 4,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          }
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <Typography
              variant="h3"
              fontWeight={700}
              gutterBottom
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                mb: 2,
                background: 'linear-gradient(45deg, #ffffff, #f0f0f0)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
              }}
            >
              🏢 Explore Companies
            </Typography>
            <Typography
              variant="h6"
              sx={{
                opacity: 0.9,
                fontSize: { xs: '1rem', md: '1.25rem' },
                fontWeight: 400,
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Discover amazing companies, connect with top employers, and find your dream job
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4, position: "relative", zIndex: 1 }}>
        {/* Search and Filters - Modern LinkedIn style */}
        <Card
          sx={{
            mb: 4,
            borderRadius: 4,
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            background: theme.palette.background.paper,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Search Bar */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search companies by name, industry, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setSearchTerm("")}
                        size="small"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.background.default, 0.5),
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.divider, 0.2),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 2,
                    },
                    height: 56,
                    fontSize: '1rem',
                  }
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: '1rem',
                    fontWeight: 500,
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: theme.palette.text.secondary,
                    opacity: 0.8,
                  }
                }}
              />
            </Box>

            {/* Quick Filters */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 3 }}>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Quick filters:
              </Typography>
              <ToggleButtonGroup
                size="small"
                value={quickFilters}
                onChange={handleQuickFilterChange}
                sx={{
                  '& .MuiToggleButton-root': {
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 500,
                    px: 2,
                    py: 0.5,
                    border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    },
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                  },
                }}
              >
                <ToggleButton value="verified">
                  <Verified sx={{ fontSize: 16, mr: 0.5 }} />
                  Verified
                </ToggleButton>
                <ToggleButton value="featured">
                  <Star sx={{ fontSize: 16, mr: 0.5 }} />
                  Featured
                </ToggleButton>
                <ToggleButton value="hiring">
                  <Work sx={{ fontSize: 16, mr: 0.5 }} />
                  Actively Hiring
                </ToggleButton>
              </ToggleButtonGroup>

              {(searchTerm || (quickFilters && quickFilters.length > 0) || Object.values(filters || {}).some(f => Array.isArray(f) && f.length > 0)) && (
                <Button
                  startIcon={<Clear />}
                  onClick={handleClearFilters}
                  size="small"
                  sx={{
                    color: theme.palette.text.secondary,
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                >
                  Clear all
                </Button>
              )}
            </Box>

            {/* Results and Controls */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography variant="body1" fontWeight={600} color="text.primary">
                {safeFilteredCompanies.length} compan{safeFilteredCompanies.length !== 1 ? 'ies' : 'y'} found
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {/* Sort Dropdown */}
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Sort by</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort by"
                    onChange={(e) => setSortBy(e.target.value)}
                    sx={{
                      borderRadius: 2,
                      '& .MuiSelect-select': {
                        fontWeight: 500,
                      },
                    }}
                  >
                    <MenuItem value="newest">Newest</MenuItem>
                    <MenuItem value="name">Company Name</MenuItem>
                    <MenuItem value="jobs">Most Jobs</MenuItem>
                    <MenuItem value="rating">Highest Rated</MenuItem>
                  </Select>
                </FormControl>

                {/* View Mode Toggle */}
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(_, mode) => mode && setViewMode(mode)}
                  size="small"
                  sx={{
                    '& .MuiToggleButton-root': {
                      border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                      },
                    },
                  }}
                >
                  <ToggleButton value="grid" aria-label="grid view">
                    <ViewModule />
                  </ToggleButton>
                  <ToggleButton value="list" aria-label="list view">
                    <ViewList />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Filters */}
        <CompanyFilters
          filters={filters}
          setFilters={setFilters}
          onClearFilters={handleClearFilters}
        />

        {/* Companies Grid/List */}
        {currentCompanies.length === 0 ? (
          <Card sx={{ p: 8, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              No companies found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your filters or search terms
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleClearFilters}
            >
              Clear filters
            </Button>
          </Card>
        ) : (
          <Grid
            container
            spacing={3}
            sx={{
              ...(viewMode === "list" && {
                flexDirection: "column",
                "& .MuiGrid-item": {
                  maxWidth: "100%",
                },
              }),
            }}
          >
            {currentCompanies.map((company, index) => (
              <Grid
                item
                xs={12}
                sm={viewMode === "grid" ? 6 : 12}
                md={viewMode === "grid" ? 4 : 12}
                lg={viewMode === "grid" ? 3 : 12}
                key={company.id}
              >
                <Fade in timeout={600 + index * 100}>
                  <div>
                    <CompanyCard
                      company={company}
                      viewMode={viewMode}
                      onCompanyClick={handleCompanyClick}
                      onBookmarkClick={handleBookmarkClick}
                      onFollowClick={handleFollowClick}
                      onShareClick={handleShareClick}
                      isBookmarked={bookmarkedCompanies.includes(company.id)}
                      isFollowing={followingCompanies.includes(company.id)}
                      showRealTimeStats={true}
                    />
                  </div>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, page) => setCurrentPage(page)}
              color="primary"
              size="large"
              sx={{
                "& .MuiPaginationItem-root": {
                  borderRadius: 2,
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                },
              }}
            />
          </Box>
        )}

        {/* Company Detail Dialog */}
        <Dialog
          open={companyDetailOpen}
          onClose={() => setCompanyDetailOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: "blur(20px)",
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            },
          }}
        >
          {selectedCompany && (
            <>
              <DialogTitle
                sx={{
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                  fontWeight: 700,
                  fontSize: "1.5rem",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    src={selectedCompany.logoUrl}
                    sx={{ width: 48, height: 48 }}
                  >
                    {selectedCompany.companyName.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {selectedCompany.companyName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedCompany.industry}
                    </Typography>
                  </Box>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      fontWeight={600}
                    >
                      Địa điểm
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedCompany.location}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      fontWeight={600}
                    >
                      Quy mô
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedCompany.companySize} nhân viên
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      fontWeight={600}
                    >
                      Năm thành lập
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedCompany.foundedYear}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      fontWeight={600}
                    >
                      Đánh giá
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Rating value={selectedCompany.rating} readOnly />
                      <Typography variant="body1">
                        {selectedCompany.rating}/5
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      fontWeight={600}
                      gutterBottom
                    >
                      Mô tả
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                      {selectedCompany.description ||
                        "Mô tả công ty sẽ được cập nhật sau..."}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      fontWeight={600}
                      gutterBottom
                    >
                      Thông tin khác
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Chip
                        label={`${selectedCompany.activeJobs} việc làm`}
                        color="primary"
                      />
                      {selectedCompany.isVerified && (
                        <Chip
                          icon={<Verified />}
                          label="Đã xác thực"
                          color="success"
                        />
                      )}
                      {selectedCompany.isFeatured && (
                        <Chip label="Nổi bật" color="error" />
                      )}
                      {followingCompanies.includes(selectedCompany.id) && (
                        <Chip label="Đang theo dõi" color="secondary" />
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 3, gap: 2 }}>
                <Button
                  onClick={() => setCompanyDetailOpen(false)}
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  Đóng
                </Button>
                <Button
                  onClick={() => handleBookmarkClick(selectedCompany.id)}
                  variant="outlined"
                  startIcon={
                    bookmarkedCompanies.includes(selectedCompany.id) ? (
                      <Bookmark />
                    ) : (
                      <BookmarkBorder />
                    )
                  }
                  color={
                    bookmarkedCompanies.includes(selectedCompany.id)
                      ? "primary"
                      : "inherit"
                  }
                  sx={{ borderRadius: 2 }}
                >
                  {bookmarkedCompanies.includes(selectedCompany.id)
                    ? "Đã lưu"
                    : "Lưu công ty"}
                </Button>
                <Button
                  onClick={() => handleFollowClick(selectedCompany.id)}
                  variant="outlined"
                  startIcon={
                    followingCompanies.includes(selectedCompany.id) ? (
                      <Favorite />
                    ) : (
                      <FavoriteBorder />
                    )
                  }
                  color={
                    followingCompanies.includes(selectedCompany.id)
                      ? "secondary"
                      : "inherit"
                  }
                  sx={{ borderRadius: 2 }}
                >
                  {followingCompanies.includes(selectedCompany.id)
                    ? "Đang theo dõi"
                    : "Theo dõi công ty"}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Work />}
                  sx={{
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  }}
                >
                  Xem việc làm
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Share />}
                  onClick={() => handleShareClick(selectedCompany)}
                  sx={{
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.secondary.main})`,
                  }}
                >
                  Chia sẻ
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default CompaniesPage;
