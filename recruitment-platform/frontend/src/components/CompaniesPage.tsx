import React, { useState, useEffect } from "react";
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
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { companiesAPI } from "../services/api";

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

interface Company {
  id: string;
  companyName: string;
  logoUrl?: string;
  industry: string;
  companySize: string;
  location: string;
  description?: string;
  website?: string;
  foundedYear?: number;
  rating?: number;
  totalJobs?: number;
  isVerified?: boolean;
  isFeatured?: boolean;
  socialLinks?: {
    linkedin?: string;
    facebook?: string;
    website?: string;
  };
}

// Company Card Component
const CompanyCard: React.FC<{
  company: Company;
  viewMode: "grid" | "list";
  onCompanyClick: (company: Company) => void;
  onBookmarkClick: (companyId: string) => void;
  isBookmarked?: boolean;
}> = ({
  company,
  viewMode,
  onCompanyClick,
  onBookmarkClick,
  isBookmarked = false,
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const getSizeColor = (size: string) => {
    switch (size.toLowerCase()) {
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
        onClick={() => onCompanyClick(company)}
      >
        {/* Featured/Hot Badges */}
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

        {/* Bookmark Button */}
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 2,
          }}
        >
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
                    {company.totalJobs || 0} việc làm
                  </Typography>
                </Box>
                {company.rating && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Rating value={company.rating} readOnly size="small" />
                    <Typography variant="body2">{company.rating}/5</Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label={company.companySize}
                  size="small"
                  sx={{
                    background: alpha(getSizeColor(company.companySize), 0.1),
                    color: getSizeColor(company.companySize),
                    border: `1px solid ${alpha(getSizeColor(company.companySize), 0.3)}`,
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
                  onCompanyClick(company);
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
                    <IconButton size="small" sx={{ color: "#0077B5" }}>
                      <LinkedIn />
                    </IconButton>
                  )}
                  {company.socialLinks.website && (
                    <IconButton
                      size="small"
                      sx={{ color: theme.palette.info.main }}
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

  // Grid view
  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
        "&:hover": {
          transform: "translateY(-8px) scale(1.02)",
          boxShadow: `0 16px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
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
      onClick={() => onCompanyClick(company)}
    >
      {/* Badges */}
      {(company.isFeatured || company.isVerified) && (
        <Box
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          {company.isFeatured && (
            <Chip
              label="🔥"
              size="small"
              color="error"
              sx={{
                fontWeight: 700,
                animation: `${pulseGlow} 2s ease-in-out infinite`,
                width: 32,
                height: 32,
              }}
            />
          )}
          {company.isVerified && (
            <Chip
              icon={<Verified />}
              label=""
              size="small"
              color="success"
              sx={{ width: 32, height: 32 }}
            />
          )}
        </Box>
      )}

      {/* Bookmark */}
      <Box
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 2,
        }}
      >
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onBookmarkClick(company.id);
          }}
          size="small"
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
      </Box>

      <CardContent
        sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}
      >
        {/* Company Logo & Name */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Avatar
            src={company.logoUrl}
            sx={{
              width: 80,
              height: 80,
              mx: "auto",
              mb: 2,
              border: `3px solid ${theme.palette.primary.main}`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            {company.companyName.charAt(0)}
          </Avatar>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            {company.companyName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {company.industry}
          </Typography>
        </Box>

        {/* Company Info */}
        <Stack spacing={1} sx={{ mb: 2, flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LocationOn color="action" fontSize="small" />
            <Typography variant="body2" noWrap>
              {company.location}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <People color="action" fontSize="small" />
            <Typography variant="body2">{company.companySize}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Work color="action" fontSize="small" />
            <Typography variant="body2">
              {company.totalJobs || 0} việc làm
            </Typography>
          </Box>
          {company.rating && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Star color="action" fontSize="small" />
              <Typography variant="body2">{company.rating}/5</Typography>
            </Box>
          )}
        </Stack>

        {/* Tags */}
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            mb: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Chip
            label={company.companySize}
            size="small"
            sx={{
              background: alpha(getSizeColor(company.companySize), 0.1),
              color: getSizeColor(company.companySize),
              fontWeight: 600,
            }}
          />
        </Box>

        {/* Description */}
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
              textAlign: "center",
            }}
          >
            {company.description}
          </Typography>
        )}

        {/* Action Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={(e) => {
            e.stopPropagation();
            onCompanyClick(company);
          }}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
          }}
        >
          Xem chi tiết
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
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<any>({});
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [companiesPerPage] = useState(12);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyDetailOpen, setCompanyDetailOpen] = useState(false);
  const [bookmarkedCompanies, setBookmarkedCompanies] = useState<string[]>([]);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [companies, searchTerm, filters, sortBy]);

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
    let filtered = [...companies];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (company) =>
          company.companyName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.location.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Industry filter
    if (filters.industries && filters.industries.length > 0) {
      filtered = filtered.filter((company) =>
        filters.industries.includes(company.industry),
      );
    }

    // Size filter
    if (filters.sizes && filters.sizes.length > 0) {
      filtered = filtered.filter((company) =>
        filters.sizes.includes(company.companySize),
      );
    }

    // Location filter
    if (filters.locations && filters.locations.length > 0) {
      filtered = filtered.filter((company) =>
        filters.locations.includes(company.location),
      );
    }

    // Feature filters
    if (filters.featured && filters.featured.length > 0) {
      if (filters.featured.includes("verified")) {
        filtered = filtered.filter((company) => company.isVerified);
      }
      if (filters.featured.includes("featured")) {
        filtered = filtered.filter((company) => company.isFeatured);
      }
      if (filters.featured.includes("hiring")) {
        filtered = filtered.filter((company) => (company.totalJobs || 0) > 0);
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
          return (b.totalJobs || 0) - (a.totalJobs || 0);
        case "size":
          return a.companySize.localeCompare(b.companySize);
        default:
          return 0;
      }
    });

    setFilteredCompanies(filtered);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    applyFilters();
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm("");
  };

  const handleCompanyClick = (company: Company) => {
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

  // Pagination
  const indexOfLastCompany = currentPage * companiesPerPage;
  const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
  const currentCompanies = filteredCompanies.slice(
    indexOfFirstCompany,
    indexOfLastCompany,
  );
  const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage);

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
      <Container maxWidth="xl" sx={{ py: 4, position: "relative", zIndex: 1 }}>
        {/* Header */}
        <Slide direction="down" in timeout={800}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              🏢 Khám phá doanh nghiệp
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: "600px", mx: "auto", lineHeight: 1.7 }}
            >
              Tìm hiểu và kết nối với những doanh nghiệp uy tín, môi trường làm
              việc tuyệt vời
            </Typography>
          </Box>
        </Slide>

        {/* Search Bar */}
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
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm công ty, ngành nghề, địa điểm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setSearchTerm("")}
                        size="small"
                      >
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    background: alpha(theme.palette.background.paper, 0.8),
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                startIcon={<Search />}
                sx={{
                  px: 4,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                }}
              >
                Tìm kiếm
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Filters */}
        <CompanyFilters
          filters={filters}
          setFilters={setFilters}
          onClearFilters={handleClearFilters}
        />

        {/* Controls Bar */}
        <Card
          sx={{
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.background.paper, 0.9)} 0%, 
              ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
            backdropFilter: "blur(20px)",
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: 2,
            mb: 3,
          }}
        >
          <CardContent sx={{ py: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body1" fontWeight={600}>
                {filteredCompanies.length} công ty được tìm thấy
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {/* Sort */}
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Sắp xếp</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sắp xếp"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="newest">Mới nhất</MenuItem>
                    <MenuItem value="name">Tên A-Z</MenuItem>
                    <MenuItem value="rating">Đánh giá cao</MenuItem>
                    <MenuItem value="jobs">Nhiều việc làm</MenuItem>
                  </Select>
                </FormControl>

                {/* View Mode */}
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(_, mode) => mode && setViewMode(mode)}
                  aria-label="view mode"
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

        {/* Companies Grid/List */}
        {currentCompanies.length === 0 ? (
          <Card sx={{ p: 8, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Không tìm thấy công ty phù hợp
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleClearFilters}
            >
              Xóa bộ lọc
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
                      isBookmarked={bookmarkedCompanies.includes(company.id)}
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
                        label={`${selectedCompany.totalJobs} việc làm`}
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
                  variant="contained"
                  startIcon={<Work />}
                  sx={{
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  }}
                >
                  Xem việc làm
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
};

export default CompaniesPage;
