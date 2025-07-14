import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  useTheme,
  alpha,
  Stack
} from '@mui/material';
import {
  Work,
  School,
  Business,
  TrendingUp,
  Security,
  Speed
} from '@mui/icons-material';
import AuthDialog from './AuthDialog';

interface FeatureCardProps {
  icon: React.ReactElement;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: theme.shadows[8]
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box sx={{ fontSize: 48, color: 'primary.main' }}>
            {icon}
          </Box>
        </Box>
        <Typography gutterBottom variant="h6" component="h3" fontWeight="bold">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authTab, setAuthTab] = useState(0);

  const handleOpenAuth = (tab: number) => {
    setAuthTab(tab);
    setAuthDialogOpen(true);
  };

  const handleCloseAuth = () => {
    setAuthDialogOpen(false);
  };

  const features = [
    {
      icon: <Work />,
      title: "Tìm việc làm phù hợp",
      description: "Hệ thống gợi ý thông minh giúp bạn tìm được công việc phù hợp với kỹ năng và sở thích."
    },
    {
      icon: <Business />,
      title: "Tuyển dụng hiệu quả",
      description: "Công cụ tuyển dụng mạnh mẽ giúp doanh nghiệp tìm được ứng viên phù hợp nhanh chóng."
    },
    {
      icon: <TrendingUp />,
      title: "Thống kê thời gian thực",
      description: "Theo dõi hiệu suất tuyển dụng và ứng tuyển với dashboard thống kê chi tiết."
    },
    {
      icon: <Security />,
      title: "Bảo mật tuyệt đối",
      description: "Thông tin cá nhân và doanh nghiệp được bảo vệ bằng công nghệ bảo mật hàng đầu."
    },
    {
      icon: <Speed />,
      title: "Xử lý nhanh chóng",
      description: "Hệ thống xử lý đơn ứng tuyển và phản hồi trong thời gian thực."
    },
    {
      icon: <School />,
      title: "Hỗ trợ sinh viên",
      description: "Chương trình thực tập và cơ hội việc làm dành riêng cho sinh viên mới ra trường."
    }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Typography
                component="h1"
                variant="h2"
                sx={{
                  fontWeight: 'bold',
                  mb: 3,
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                Kết nối tài năng với cơ hội
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Nền tảng tuyển dụng thông minh, kết nối sinh viên với các cơ hội thực tập và việc làm tốt nhất.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleOpenAuth(0)}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    fontWeight: 'bold',
                    '&:hover': {
                      bgcolor: alpha('#ffffff', 0.9)
                    }
                  }}
                >
                  Tìm việc ngay
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => handleOpenAuth(1)}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontWeight: 'bold',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: alpha('#ffffff', 0.1)
                    }
                  }}
                >
                  Dành cho nhà tuyển dụng
                </Button>
              </Box>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <Box
                sx={{
                  width: 300,
                  height: 300,
                  bgcolor: alpha('#ffffff', 0.1),
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `3px solid ${alpha('#ffffff', 0.3)}`
                }}
              >
                <Work sx={{ fontSize: 120, opacity: 0.8 }} />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }} id="features">
        <Typography
          component="h2"
          variant="h3"
          align="center"
          color="text.primary"
          gutterBottom
          sx={{ fontWeight: 'bold', mb: 6 }}
        >
          Tại sao chọn chúng tôi?
        </Typography>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 4 
        }}>
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </Box>
      </Container>

      {/* Stats Section */}
      <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 4,
            textAlign: 'center'
          }}>
            <Box>
              <Typography variant="h3" color="primary.main" fontWeight="bold">
                1000+
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Công việc
              </Typography>
            </Box>
            <Box>
              <Typography variant="h3" color="primary.main" fontWeight="bold">
                500+
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Doanh nghiệp
              </Typography>
            </Box>
            <Box>
              <Typography variant="h3" color="primary.main" fontWeight="bold">
                5000+
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Sinh viên
              </Typography>
            </Box>
            <Box>
              <Typography variant="h3" color="primary.main" fontWeight="bold">
                95%
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Tỷ lệ thành công
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'primary.dark', color: 'white', py: 8 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
              Sẵn sàng bắt đầu hành trình của bạn?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Tham gia cùng hàng nghìn sinh viên và doanh nghiệp đã tin tưởng chúng tôi
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => handleOpenAuth(1)}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: alpha('#ffffff', 0.9)
                  }
                }}
              >
                Đăng ký miễn phí
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => {
                  // Scroll to features section
                  const featuresSection = document.getElementById('features');
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontWeight: 'bold',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: alpha('#ffffff', 0.1)
                  }
                }}
              >
                Tìm hiểu thêm
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 4 
          }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                🚀 Recruitment Platform
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Nền tảng tuyển dụng thông minh, kết nối tài năng với cơ hội. 
                Được phát triển với công nghệ hiện đại nhất.
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" gutterBottom>
                Liên kết
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Về chúng tôi
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Việc làm
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Doanh nghiệp
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Hỗ trợ
                </Typography>
              </Stack>
            </Box>
            <Box>
              <Typography variant="h6" gutterBottom>
                Liên hệ
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Email: support@recruitment.com
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Phone: (84) 123-456-789
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Địa chỉ: 123 Tech Street, Ho Chi Minh City
                </Typography>
              </Stack>
            </Box>
          </Box>
          <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'grey.700', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              © 2025 Recruitment Platform. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Auth Dialog */}
      <AuthDialog
        open={authDialogOpen}
        onClose={handleCloseAuth}
        initialTab={authTab}
      />
    </Box>
  );
};

export default LandingPage;
