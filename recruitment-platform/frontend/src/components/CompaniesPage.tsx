import React, { useState, useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  Language as WebsiteIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { companiesAPI } from '../services/api';

interface Company {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  size: string;
  location: string;
  description: string;
  website: string;
  rating: number;
  totalReviews: number;
  openJobs: number;
  benefits: string[];
  founded: string;
  isFollowing: boolean;
}

interface CompanyReview {
  id: string;
  rating: number;
  title: string;
  review: string;
  author: string;
  position: string;
  date: string;
  pros: string;
  cons: string;
}

const CompaniesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);

  // Test API connection
  const testAPIConnection = async () => {
    try {
      console.log('Testing API connection...');
      const response = await fetch('http://localhost:5000/health');
      const data = await response.json();
      console.log('Health check response:', data);
      return true;
    } catch (error) {
      console.error('API connection failed:', error);
      return false;
    }
  };

  // Test companies API
  const testCompaniesAPI = async () => {
    try {
      console.log('Testing companies API...');
      const isAPIUp = await testAPIConnection();
      if (!isAPIUp) {
        console.error('Backend server is not running');
        return;
      }
      
      const response = await companiesAPI.getAll();
      console.log('Companies API response:', response);
    } catch (error) {
      console.error('Companies API error:', error);
    }
  };

  // Load companies from API
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        
        // Test API first
        await testCompaniesAPI();
        
        const response = await companiesAPI.getAll();
        setCompanies(response.data.companies);
      } catch (error) {
        console.error('Error loading companies:', error);
        // Fallback to empty array
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  // Mock reviews data - will be replaced with API later
  const [companyReviews] = useState<CompanyReview[]>([
    {
      id: '1',
      rating: 5,
      title: 'Great place to grow your career',
      review: 'Amazing company culture with great learning opportunities. Management is supportive and the work is challenging.',
      author: 'Software Engineer',
      position: 'Software Engineer',
      date: '2024-01-15',
      pros: 'Great benefits, flexible working hours, supportive team',
      cons: 'Sometimes tight deadlines'
    },
    {
      id: '2',
      rating: 4,
      title: 'Good work-life balance',
      review: 'Decent company with good benefits. The projects are interesting and the team is collaborative.',
      author: 'Product Manager',
      position: 'Product Manager',
      date: '2024-01-10',
      pros: 'Work-life balance, good compensation, modern office',
      cons: 'Limited career advancement opportunities'
    }
  ]);

  const industries = ['Technology', 'Finance', 'Healthcare', 'Education', 'Energy', 'Manufacturing', 'Retail'];
  const companySizes = ['1-50', '51-200', '201-500', '501-1000', '1000+'];
  const locations = ['Ho Chi Minh City', 'Ha Noi', 'Da Nang', 'Can Tho', 'Remote'];

  const companiesPerPage = 6;

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = !industryFilter || company.industry === industryFilter;
    const matchesSize = !sizeFilter || company.size === sizeFilter;
    const matchesLocation = !locationFilter || company.location === locationFilter;

    return matchesSearch && matchesIndustry && matchesSize && matchesLocation;
  });

  const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage);
  const startIndex = (currentPage - 1) * companiesPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + companiesPerPage);

  const handleFollowCompany = (companyId: string) => {
    // In a real app, this would update the backend
    console.log('Follow company:', companyId);
    
    // Update local state
    setCompanies(prevCompanies => 
      prevCompanies.map(company => 
        company.id === companyId 
          ? { ...company, isFollowing: !company.isFollowing }
          : company
      )
    );
    
    // Update selected company if it's the same one
    if (selectedCompany && selectedCompany.id === companyId) {
      setSelectedCompany({ ...selectedCompany, isFollowing: !selectedCompany.isFollowing });
    }
    
    // Show feedback
    const company = companies.find(c => c.id === companyId);
    const action = company?.isFollowing ? 'Bỏ theo dõi' : 'Theo dõi';
    alert(`${action} công ty ${company?.name} thành công!`);
  };

  const handleViewCompany = (company: Company) => {
    setSelectedCompany(company);
    setCompanyDialogOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setIndustryFilter('');
    setSizeFilter('');
    setLocationFilter('');
    setCurrentPage(1);
  };

  const handleViewJobs = (companyId: string, companyName: string) => {
    // Navigate to jobs page filtered by this company
    console.log(`Viewing jobs for company: ${companyName} (ID: ${companyId})`);
    // In a real app, this would navigate to a jobs page with company filter
    // Example: navigate(`/jobs?company=${companyId}`);
    alert(`Chuyển hướng đến trang việc làm của ${companyName}\n\nChức năng này sẽ được tích hợp với trang Jobs trong tương lai.`);
  };

  const getCompanyInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        zIndex: 0
      }
    }}>
      <Box sx={{ position: 'relative', zIndex: 1, padding: 3 }}>
        {/* Hero Section */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 4, 
          py: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            animation: 'float 20s ease-in-out infinite'
          },
          '@keyframes float': {
            '0%, 100%': { transform: 'translateX(0px)' },
            '50%': { transform: 'translateX(-30px)' }
          }
        }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <BusinessIcon sx={{ fontSize: 60, mb: 2, color: 'rgba(255,255,255,0.9)' }} />
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              🏢 Companies Directory
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
              Khám phá những công ty tuyệt vời và tìm kiếm cơ hội nghề nghiệp tiếp theo của bạn
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Chip label={`${filteredCompanies.length} Công ty`} sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }} />
              <Chip label={`${industries.length} Ngành nghề`} sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }} />
              <Chip label="Cập nhật hàng ngày" sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }} />
            </Box>
          </Box>
        </Box>

      {/* Search and Filters */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 3,
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)',
        border: '1px solid rgba(102, 126, 234, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #667eea, #764ba2, #667eea)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s ease-in-out infinite'
        },
        '@keyframes shimmer': {
          '0%, 100%': { backgroundPosition: '200% 0' },
          '50%': { backgroundPosition: '-200% 0' }
        }
      }}>
        <Typography variant="h6" sx={{ mb: 3, color: '#2d3748', fontWeight: 600 }}>
          🔍 Tìm kiếm & Lọc công ty
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <Box sx={{ flex: { xs: 1, md: 2 } }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm công ty theo tên, mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  background: 'white',
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                    borderWidth: '2px'
                  }
                }
              }}
            />
          </Box>
          <Box sx={{ flex: { xs: 1, md: 0.5 } }}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              fullWidth
              sx={{
                height: '56px',
                borderRadius: 2,
                borderColor: '#667eea',
                color: showFilters ? 'white' : '#667eea',
                background: showFilters ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                '&:hover': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
            </Button>
          </Box>
          <Box sx={{ flex: { xs: 1, md: 0.5 } }}>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              fullWidth
              sx={{
                height: '56px',
                borderRadius: 2,
                borderColor: '#e53e3e',
                color: '#e53e3e',
                '&:hover': {
                  background: '#e53e3e',
                  color: 'white',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(229, 62, 62, 0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Xóa bộ lọc
            </Button>
          </Box>
        </Box>

        {showFilters && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 3, backgroundColor: 'rgba(102, 126, 234, 0.2)' }} />
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#667eea' }}>Ngành nghề</InputLabel>
                  <Select
                    value={industryFilter}
                    onChange={(e) => setIndustryFilter(e.target.value)}
                    sx={{
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea'
                      }
                    }}
                  >
                    <MenuItem value="">Tất cả ngành nghề</MenuItem>
                    {industries.map((industry) => (
                      <MenuItem key={industry} value={industry}>
                        {industry}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#667eea' }}>Quy mô công ty</InputLabel>
                  <Select
                    value={sizeFilter}
                    onChange={(e) => setSizeFilter(e.target.value)}
                    sx={{
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea'
                      }
                    }}
                  >
                    <MenuItem value="">Tất cả quy mô</MenuItem>
                    {companySizes.map((size) => (
                      <MenuItem key={size} value={size}>
                        {size} nhân viên
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#667eea' }}>Địa điểm</InputLabel>
                  <Select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    sx={{
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea'
                      }
                    }}
                  >
                    <MenuItem value="">Tất cả địa điểm</MenuItem>
                    {locations.map((location) => (
                      <MenuItem key={location} value={location}>
                        {location}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Results Summary */}
      <Box sx={{ 
        mb: 3, 
        p: 2, 
        background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
        borderRadius: 2,
        border: '1px solid rgba(102, 126, 234, 0.1)'
      }}>
        <Typography variant="body1" sx={{ color: '#2d3748', fontWeight: 500 }}>
          📊 Hiển thị <strong>{paginatedCompanies.length}</strong> trong tổng số <strong>{filteredCompanies.length}</strong> công ty
          {(industryFilter || sizeFilter || locationFilter) && (
            <Chip 
              label="Đã lọc" 
              size="small" 
              sx={{ ml: 1, backgroundColor: '#667eea', color: 'white' }} 
            />
          )}
        </Typography>
      </Box>

      {/* Companies Grid */}
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          py: 8,
          background: 'white',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <CircularProgress sx={{ color: '#667eea', mb: 2 }} size={60} />
          <Typography sx={{ color: '#2d3748', fontSize: '1.1rem' }}>Đang tải danh sách công ty...</Typography>
          <Typography sx={{ color: '#718096', mt: 1 }}>Vui lòng chờ một chút</Typography>
        </Box>
      ) : companies.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          py: 8,
          background: 'white',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <BusinessIcon sx={{ fontSize: 80, color: '#cbd5e0', mb: 2 }} />
          <Typography color="text.secondary" sx={{ fontSize: '1.1rem', mb: 1 }}>
            Không tìm thấy công ty nào phù hợp
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: '0.9rem' }}>
            Hãy thử điều chỉnh bộ lọc tìm kiếm
          </Typography>
        </Box>
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, 
          gap: 3 
        }}>
        {paginatedCompanies.map((company) => (
          <Box key={company.id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.08)',
              border: '1px solid rgba(102, 126, 234, 0.1)',
              position: 'relative',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 40px rgba(102, 126, 234, 0.2)',
                '& .company-avatar': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                },
                '& .company-actions': {
                  opacity: 1,
                  transform: 'translateY(0)'
                }
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                transform: 'scaleX(0)',
                transformOrigin: 'left',
                transition: 'transform 0.3s ease'
              },
              '&:hover::before': {
                transform: 'scaleX(1)'
              }
            }}>
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar
                      className="company-avatar"
                      sx={{ 
                        width: 60, 
                        height: 60, 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                        transition: 'all 0.3s ease',
                        fontSize: '1.5rem',
                        fontWeight: 700
                      }}
                    >
                      {company.logo ? (
                        <img src={company.logo} alt={company.name} width="100%" />
                      ) : (
                        getCompanyInitials(company.name)
                      )}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h3" sx={{ 
                        fontWeight: 700, 
                        color: '#2d3748',
                        mb: 0.5,
                        fontSize: '1.1rem'
                      }}>
                        {company.name}
                      </Typography>
                      <Chip 
                        label={company.industry} 
                        size="small" 
                        sx={{ 
                          backgroundColor: 'rgba(102, 126, 234, 0.1)', 
                          color: '#667eea',
                          fontWeight: 500
                        }} 
                      />
                    </Box>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleFollowCompany(company.id)}
                    sx={{
                      color: company.isFollowing ? '#e53e3e' : '#cbd5e0',
                      '&:hover': {
                        color: '#e53e3e',
                        transform: 'scale(1.2)',
                        backgroundColor: 'rgba(229, 62, 62, 0.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {company.isFollowing ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </Box>

                <Typography variant="body2" sx={{ 
                  mb: 3, 
                  minHeight: 60, 
                  color: '#4a5568',
                  lineHeight: 1.6
                }}>
                  {company.description ? company.description.substring(0, 120) + '...' : 'Mô tả công ty sẽ được cập nhật...'}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ fontSize: 18, mr: 1, color: '#667eea' }} />
                    <Typography variant="body2" sx={{ color: '#2d3748', fontWeight: 500 }}>
                      {company.location}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PeopleIcon sx={{ fontSize: 18, mr: 1, color: '#667eea' }} />
                    <Typography variant="body2" sx={{ color: '#2d3748', fontWeight: 500 }}>
                      {company.size} nhân viên
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating value={company.rating} precision={0.1} size="small" readOnly 
                        sx={{ '& .MuiRating-iconFilled': { color: '#fbbf24' } }} 
                      />
                      <Typography variant="body2" sx={{ ml: 1, color: '#2d3748', fontWeight: 500 }}>
                        {company.rating} ({company.totalReviews} đánh giá)
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {(company.benefits || []).slice(0, 2).map((benefit, index) => (
                    <Chip
                      key={index}
                      label={benefit}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: 'rgba(16, 185, 129, 0.2)'
                        }
                      }}
                    />
                  ))}
                  {(company.benefits || []).length > 2 && (
                    <Chip
                      label={`+${(company.benefits || []).length - 2} khác`}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(107, 114, 128, 0.1)',
                        color: '#6b7280',
                        fontWeight: 500
                      }}
                    />
                  )}
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  backgroundColor: 'rgba(102, 126, 234, 0.05)',
                  borderRadius: 2,
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Badge badgeContent={company.openJobs} color="primary">
                      <WorkIcon sx={{ color: '#667eea' }} />
                    </Badge>
                    <Typography variant="body2" sx={{ color: '#2d3748', fontWeight: 600 }}>
                      {company.openJobs} việc làm
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ 
                    color: '#6b7280',
                    backgroundColor: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    border: '1px solid rgba(107, 114, 128, 0.2)'
                  }}>
                    Thành lập {company.founded}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions 
                className="company-actions"
                sx={{ 
                  p: 2, 
                  pt: 0,
                  opacity: 0.7,
                  transform: 'translateY(10px)',
                  transition: 'all 0.3s ease',
                  gap: 1
                }}
              >
                <Button
                  size="small"
                  startIcon={<ViewIcon />}
                  onClick={() => handleViewCompany(company)}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    color: '#667eea',
                    '&:hover': {
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  Chi tiết
                </Button>
                <Button
                  size="small"
                  startIcon={<WorkIcon />}
                  variant="contained"
                  onClick={() => handleViewJobs(company.id, company.name)}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                    }
                  }}
                >
                  Xem việc làm ({company.openJobs})
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 4,
          p: 3,
          background: 'white',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.08)',
          border: '1px solid rgba(102, 126, 234, 0.1)'
        }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(event, value) => setCurrentPage(value)}
            color="primary"
            size="large"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 2,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  transform: 'translateY(-1px)'
                },
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                  }
                }
              }
            }}
          />
        </Box>
      )}

      {/* Company Details Dialog */}
      <Dialog
        open={companyDialogOpen}
        onClose={() => setCompanyDialogOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 3
        }}>
          {selectedCompany && (
            <>
              <Avatar sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                width: 60, 
                height: 60,
                fontSize: '1.5rem',
                fontWeight: 700
              }}>
                {getCompanyInitials(selectedCompany.name)}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{selectedCompany.name}</Typography>
                <Typography sx={{ opacity: 0.9, fontSize: '1.1rem' }}>{selectedCompany.industry}</Typography>
              </Box>
            </>
          )}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedCompany && (
            <Box>
              {/* Company Description */}
              <Box sx={{ p: 3, backgroundColor: '#f8f9ff' }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#2d3748', fontWeight: 600 }}>
                  🏢 Giới thiệu về công ty
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.7, color: '#4a5568' }}>
                  {selectedCompany?.description || 'Mô tả công ty sẽ được cập nhật...'}
                </Typography>
              </Box>

              {/* Company Stats */}
              <Box sx={{ p: 3 }}>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
                  gap: 3 
                }}>
                  <Box>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      backgroundColor: 'rgba(102, 126, 234, 0.05)',
                      border: '1px solid rgba(102, 126, 234, 0.1)'
                    }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: '#667eea', fontWeight: 600 }}>
                        👥 Quy mô công ty
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#2d3748' }}>
                        {selectedCompany?.size || '0'} nhân viên
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      backgroundColor: 'rgba(16, 185, 129, 0.05)',
                      border: '1px solid rgba(16, 185, 129, 0.1)'
                    }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: '#10b981', fontWeight: 600 }}>
                        📍 Địa điểm
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#2d3748' }}>
                        {selectedCompany?.location || 'Chưa cập nhật'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      backgroundColor: 'rgba(245, 158, 11, 0.05)',
                      border: '1px solid rgba(245, 158, 11, 0.1)'
                    }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: '#f59e0b', fontWeight: 600 }}>
                        ⭐ Đánh giá
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating value={selectedCompany?.rating || 0} precision={0.1} readOnly 
                          sx={{ '& .MuiRating-iconFilled': { color: '#fbbf24' } }} 
                        />
                        <Typography variant="body1" sx={{ ml: 1, fontWeight: 600, color: '#2d3748' }}>
                          {selectedCompany?.rating || 0} ({selectedCompany?.totalReviews || 0} đánh giá)
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      backgroundColor: 'rgba(139, 92, 246, 0.05)',
                      border: '1px solid rgba(139, 92, 246, 0.1)'
                    }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: '#8b5cf6', fontWeight: 600 }}>
                        💼 Việc làm đang tuyển
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#2d3748' }}>
                        {selectedCompany?.openJobs || 0} vị trí
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      backgroundColor: 'rgba(236, 72, 153, 0.05)',
                      border: '1px solid rgba(236, 72, 153, 0.1)'
                    }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: '#ec4899', fontWeight: 600 }}>
                        📅 Thành lập
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#2d3748' }}>
                        Năm {selectedCompany?.founded || 'Chưa rõ'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      backgroundColor: 'rgba(59, 130, 246, 0.05)',
                      border: '1px solid rgba(59, 130, 246, 0.1)'
                    }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ color: '#3b82f6', fontWeight: 600 }}>
                        🌐 Website
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<WebsiteIcon />}
                        href={selectedCompany?.website || '#'}
                        target="_blank"
                        sx={{
                          textTransform: 'none',
                          color: '#3b82f6',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: 'rgba(59, 130, 246, 0.1)'
                          }
                        }}
                      >
                        Truy cập website
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Benefits Section */}
              <Box sx={{ p: 3, backgroundColor: '#f8f9ff' }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#2d3748', fontWeight: 600, mb: 2 }}>
                  🎁 Phúc lợi & Quyền lợi
                </Typography>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
                  gap: 1 
                }}>
                  {(selectedCompany?.benefits || []).map((benefit, index) => (
                    <Box key={index}>
                      <Chip
                        label={benefit}
                        sx={{
                          width: '100%',
                          justifyContent: 'flex-start',
                          backgroundColor: 'white',
                          border: '1px solid rgba(102, 126, 234, 0.2)',
                          color: '#2d3748',
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.1)'
                          }
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Reviews Section */}
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#2d3748', fontWeight: 600, mb: 2 }}>
                  💬 Đánh giá gần đây
                </Typography>
                <List sx={{ p: 0 }}>
                  {companyReviews.slice(0, 2).map((review) => (
                    <ListItem key={review.id} sx={{ 
                      px: 0, 
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: 'rgba(249, 250, 251, 0.8)',
                      border: '1px solid rgba(229, 231, 235, 0.8)'
                    }}>
                      <ListItemText
                        primary={
                          <Box sx={{ mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Rating value={review.rating} size="small" readOnly 
                                sx={{ '& .MuiRating-iconFilled': { color: '#fbbf24' } }} 
                              />
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2d3748' }}>
                                {review.title}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#4a5568', lineHeight: 1.6 }}>
                              {review.review}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
                            {review.position} • {review.date}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          backgroundColor: '#f8f9ff',
          gap: 1
        }}>
          <Button 
            onClick={() => setCompanyDialogOpen(false)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              color: '#6b7280',
              fontWeight: 600
            }}
          >
            Đóng
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<WorkIcon />}
            onClick={() => selectedCompany && handleViewJobs(selectedCompany.id, selectedCompany.name)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              borderColor: '#667eea',
              color: '#667eea',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderColor: '#667eea'
              }
            }}
          >
            Xem tất cả việc làm
          </Button>
          <Button 
            variant="contained" 
            startIcon={<FavoriteIcon />}
            onClick={() => selectedCompany && handleFollowCompany(selectedCompany.id)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              background: selectedCompany?.isFollowing 
                ? 'linear-gradient(135deg, #e53e3e 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 600,
              '&:hover': {
                background: selectedCompany?.isFollowing
                  ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                  : 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
              }
            }}
          >
            {selectedCompany?.isFollowing ? 'Bỏ theo dõi' : 'Theo dõi công ty'}
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
};

export default CompaniesPage;
