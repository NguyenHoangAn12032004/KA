import React, { useState, useEffect } from "react";
import { useTranslation } from "../contexts/LanguageContext";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  useTheme,
  alpha,
  keyframes,
  Fade,
  Slide,
  Zoom,
  Stack,
  Card,
  CardContent,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Work,
  School,
  Business,
  TrendingUp,
  Security,
  Speed,
  ArrowForward,
  CheckCircle,
  Star,
  Rocket,
} from "@mui/icons-material";
import AuthDialog from "./AuthDialog";

const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
`;

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulseGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(33, 150, 243, 0.3),
                0 0 40px rgba(33, 150, 243, 0.2),
                0 0 60px rgba(33, 150, 243, 0.1);
  }
  50% { 
    box-shadow: 0 0 30px rgba(33, 150, 243, 0.5),
                0 0 60px rgba(33, 150, 243, 0.3),
                0 0 90px rgba(33, 150, 243, 0.2);
  }
`;

const sparkleAnimation = keyframes`
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
`;

interface FeatureCardProps {
  icon: React.ReactElement;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  delay,
}) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Fade in={isVisible} timeout={800}>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          borderRadius: 3,
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
            backgroundSize: "200% 100%",
            animation: `${gradientAnimation} 3s ease infinite`,
          },
          "&:hover": {
            transform: "translateY(-12px) scale(1.02)",
            boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            "& .feature-icon": {
              transform: "scale(1.1) rotate(5deg)",
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            },
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, textAlign: "center", p: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <Box
              className="feature-icon"
              sx={{
                fontSize: 56,
                color: "primary.main",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                animation: `${floatingAnimation} 6s ease-in-out infinite`,
                animationDelay: `${delay}ms`,
              }}
            >
              {icon}
            </Box>
          </Box>
          <Typography
            gutterBottom
            variant="h5"
            component="h3"
            fontWeight="bold"
            sx={{
              mb: 2,
              background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ lineHeight: 1.7 }}
          >
            {description}
          </Typography>
        </CardContent>
      </Card>
    </Fade>
  );
};

const StatCard: React.FC<{ number: string; label: string; delay: number }> = ({
  number,
  label,
  delay,
}) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (isVisible) {
      const target = parseInt(number.replace(/\D/g, ""));
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isVisible, number]);

  const displayNumber = number.includes("%")
    ? `${count}%`
    : number.includes("+")
      ? `${count}+`
      : count.toString();

  return (
    <Zoom in={isVisible} timeout={800}>
      <Box sx={{ textAlign: "center" }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
            fontSize: { xs: "2.5rem", md: "3.5rem" },
          }}
        >
          {displayNumber}
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          {label}
        </Typography>
      </Box>
    </Zoom>
  );
};

const FloatingElement: React.FC<{
  children: React.ReactNode;
  delay: number;
}> = ({ children, delay }) => (
  <Box
    sx={{
      position: "absolute",
      animation: `${floatingAnimation} 8s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      opacity: 0.6,
    }}
  >
    {children}
  </Box>
);

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authTab, setAuthTab] = useState(0);
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setIsHeroVisible(true);
  }, []);

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
      title: t("landing.features.work.title"),
      description: t("landing.features.work.description"),
    },
    {
      icon: <Business />,
      title: t("landing.features.recruitment.title"),
      description: t("landing.features.recruitment.description"),
    },
    {
      icon: <TrendingUp />,
      title: t("landing.features.analytics.title"),
      description: t("landing.features.analytics.description"),
    },
    {
      icon: <Security />,
      title: t("landing.features.security.title"),
      description: t("landing.features.security.description"),
    },
    {
      icon: <Speed />,
      title: t("landing.features.speed.title"),
      description: t("landing.features.speed.description"),
    },
    {
      icon: <School />,
      title: t("landing.features.support.title"),
      description: t("landing.features.support.description"),
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
      {/* Background Elements */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, ${alpha(theme.palette.primary.light, 0.05)} 0%, transparent 50%)
          `,
          zIndex: -2,
        }}
      />

      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          background: `
            linear-gradient(135deg, 
              ${alpha(theme.palette.primary.main, 0.9)} 0%, 
              ${alpha(theme.palette.primary.dark, 0.95)} 50%,
              ${alpha(theme.palette.secondary.main, 0.9)} 100%
            )
          `,
          backgroundSize: "400% 400%",
          animation: `${gradientAnimation} 15s ease infinite`,
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            opacity: 0.5,
          },
        }}
      >
        {/* Floating Background Elements */}
        <FloatingElement delay={0}>
          <Box sx={{ top: "10%", left: "10%", position: "absolute" }}>
            <Star sx={{ fontSize: 20, color: alpha("#ffffff", 0.3) }} />
          </Box>
        </FloatingElement>
        <FloatingElement delay={2}>
          <Box sx={{ top: "20%", right: "15%", position: "absolute" }}>
            <CheckCircle sx={{ fontSize: 24, color: alpha("#ffffff", 0.2) }} />
          </Box>
        </FloatingElement>
        <FloatingElement delay={4}>
          <Box sx={{ bottom: "15%", left: "20%", position: "absolute" }}>
            <Rocket sx={{ fontSize: 28, color: alpha("#ffffff", 0.25) }} />
          </Box>
        </FloatingElement>

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: { xs: "column", md: "row" },
              gap: 6,
              minHeight: "80vh",
            }}
          >
            <Slide direction="right" in={isHeroVisible} timeout={1000}>
              <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
                <Fade in={isHeroVisible} timeout={1500}>
                  <Typography
                    component="h1"
                    variant="h1"
                    sx={{
                      fontWeight: 800,
                      mb: 3,
                      color: "white",
                      textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                      fontSize: { xs: "2.5rem", md: "4rem", lg: "4.5rem" },
                      lineHeight: 1.1,
                    }}
                  >
                    {t("landing.hero.title")}{" "}
                    <Box
                      component="span"
                      sx={{
                        background: "linear-gradient(45deg, #FFD700, #FFA500)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        position: "relative",
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          bottom: -10,
                          left: 0,
                          right: 0,
                          height: 4,
                          background:
                            "linear-gradient(45deg, #FFD700, #FFA500)",
                          borderRadius: 2,
                          animation: `${sparkleAnimation} 2s ease-in-out infinite`,
                        },
                      }}
                    >
                      {t("landing.hero.opportunity")}
                    </Box>
                  </Typography>
                </Fade>

                <Fade in={isHeroVisible} timeout={2000}>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 5,
                      color: alpha("#ffffff", 0.9),
                      textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                      lineHeight: 1.6,
                      fontSize: { xs: "1.25rem", md: "1.5rem" },
                    }}
                  >
                    {t("landing.hero.description")}
                  </Typography>
                </Fade>

                <Zoom in={isHeroVisible} timeout={2500}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 3,
                      flexWrap: "wrap",
                      justifyContent: { xs: "center", md: "flex-start" },
                    }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => handleOpenAuth(0)}
                      endIcon={<ArrowForward />}
                      sx={{
                        px: 6,
                        py: 2,
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        background:
                          "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                        color: theme.palette.primary.main,
                        borderRadius: 3,
                        boxShadow: "0 8px 32px rgba(255,255,255,0.3)",
                        animation: `${pulseGlow} 4s ease-in-out infinite`,
                        "&:hover": {
                          transform: "translateY(-3px) scale(1.05)",
                          background:
                            "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
                          boxShadow: "0 12px 40px rgba(255,255,255,0.4)",
                        },
                      }}
                    >
                      {t("landing.hero.findJob")}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => handleOpenAuth(1)}
                      endIcon={<Business />}
                      sx={{
                        px: 6,
                        py: 2,
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        borderColor: "rgba(255,255,255,0.5)",
                        color: "white",
                        borderWidth: 2,
                        borderRadius: 3,
                        backdropFilter: "blur(10px)",
                        background: "rgba(255,255,255,0.1)",
                        "&:hover": {
                          borderColor: "white",
                          background: "rgba(255,255,255,0.2)",
                          transform: "translateY(-2px)",
                          borderWidth: 2,
                        },
                      }}
                    >
                      {t("landing.hero.employers")}
                    </Button>
                  </Box>
                </Zoom>
              </Box>
            </Slide>

            <Slide direction="left" in={isHeroVisible} timeout={1200}>
              <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <Box
                  sx={{
                    width: { xs: 280, md: 350, lg: 400 },
                    height: { xs: 280, md: 350, lg: 400 },
                    borderRadius: "50%",
                    background: `
                      linear-gradient(135deg, 
                        rgba(255,255,255,0.2) 0%, 
                        rgba(255,255,255,0.1) 50%,
                        rgba(255,255,255,0.05) 100%
                      )
                    `,
                    backdropFilter: "blur(20px)",
                    border: "3px solid rgba(255,255,255,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    animation: `${floatingAnimation} 6s ease-in-out infinite`,
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      inset: -20,
                      borderRadius: "50%",
                      background:
                        "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.2), transparent)",
                      animation: `${gradientAnimation} 8s linear infinite`,
                      zIndex: -1,
                    },
                  }}
                >
                  <Work
                    sx={{
                      fontSize: { xs: 100, md: 120, lg: 140 },
                      color: "rgba(255,255,255,0.9)",
                      filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.3))",
                    }}
                  />
                </Box>
              </Box>
            </Slide>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container
        maxWidth="lg"
        sx={{ py: 12, position: "relative", zIndex: 1 }}
        id="features"
      >
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            component="h2"
            variant="h2"
            gutterBottom
            sx={{
              fontWeight: 800,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 3,
            }}
          >
            {t("landing.whyChooseUs.title")}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: "600px", mx: "auto", lineHeight: 1.7 }}
          >
            {t("landing.whyChooseUs.description")}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 4,
          }}
        >
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} delay={index * 200} />
          ))}
        </Box>
      </Container>

      {/* Stats Section */}
      <Box
        sx={{
          py: 12,
          position: "relative",
          background: `
            linear-gradient(135deg, 
              ${alpha(theme.palette.primary.main, 0.03)} 0%, 
              ${alpha(theme.palette.secondary.main, 0.03)} 100%
            )
          `,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000000' fill-opacity='0.02' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            opacity: 0.5,
          },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 6,
            }}
          >
            <StatCard number="1000+" label={t("landing.stats.jobs")} delay={100} />
            <StatCard number="500+" label={t("landing.stats.companies")} delay={300} />
            <StatCard number="5000+" label={t("landing.stats.students")} delay={500} />
            <StatCard number="95%" label={t("landing.stats.successRate")} delay={700} />
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 12,
          position: "relative",
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
          backgroundSize: "400% 400%",
          animation: `${gradientAnimation} 12s ease infinite`,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 30% 70%, ${alpha("#ffffff", 0.1)} 0%, transparent 50%)`,
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              fontWeight="bold"
              sx={{
                color: "white",
                textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                mb: 3,
              }}
            >
              {t("landing.cta.ready")}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 6,
                color: alpha("#ffffff", 0.9),
                textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                lineHeight: 1.6,
              }}
            >
              {t("landing.cta.join")}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 3,
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => handleOpenAuth(1)}
                endIcon={<Rocket />}
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                  color: theme.palette.primary.main,
                  borderRadius: 3,
                  boxShadow: "0 8px 32px rgba(255,255,255,0.3)",
                  "&:hover": {
                    transform: "translateY(-3px) scale(1.05)",
                    background:
                      "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
                    boxShadow: "0 12px 40px rgba(255,255,255,0.4)",
                  },
                }}
              >
                {t("landing.cta.register")}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => {
                  const featuresSection = document.getElementById("features");
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                endIcon={<ArrowForward />}
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  borderColor: "rgba(255,255,255,0.5)",
                  color: "white",
                  borderWidth: 2,
                  borderRadius: 3,
                  backdropFilter: "blur(10px)",
                  background: "rgba(255,255,255,0.1)",
                  "&:hover": {
                    borderColor: "white",
                    background: "rgba(255,255,255,0.2)",
                    transform: "translateY(-2px)",
                    borderWidth: 2,
                  },
                }}
              >
                {t("landing.cta.learnMore")}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`,
          color: "white",
          py: 8,
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: `linear-gradient(90deg, transparent, ${alpha("#ffffff", 0.2)}, transparent)`,
          },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 6,
            }}
          >
            <Box>
              <Typography
                variant="h5"
                gutterBottom
                fontWeight="bold"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 3,
                }}
              >
                <Rocket sx={{ fontSize: 28 }} />
                Recruitment Platform
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  opacity: 0.8,
                  lineHeight: 1.7,
                }}
              >
                {t("landing.footer.description")}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                fontWeight="bold"
                sx={{ mb: 3 }}
              >
                {t("landing.footer.quickLinks")}
              </Typography>
              <Stack spacing={2}>
                {["About Us", "Jobs", "Companies", "Support"].map(
                  (item) => (
                    <Typography
                      key={item}
                      variant="body1"
                      sx={{
                        opacity: 0.8,
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          opacity: 1,
                          color: theme.palette.primary.light,
                          transform: "translateX(8px)",
                        },
                      }}
                    >
                      {item}
                    </Typography>
                  ),
                )}
              </Stack>
            </Box>
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                fontWeight="bold"
                sx={{ mb: 3 }}
              >
                {t("landing.footer.contact")}
              </Typography>
              <Stack spacing={2}>
                <Typography variant="body1" sx={{ opacity: 0.8 }}>
                  📧 {t("landing.footer.email")}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8 }}>
                  📞 (84) 123-456-789
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8 }}>
                  📍 123 Tech Street, Ho Chi Minh City
                </Typography>
              </Stack>
            </Box>
          </Box>
          <Box
            sx={{
              mt: 8,
              pt: 4,
              borderTop: `1px solid ${alpha("#ffffff", 0.1)}`,
              textAlign: "center",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                opacity: 0.6,
                "& .heart": {
                  color: theme.palette.error.main,
                  animation: `${pulseGlow} 2s ease-in-out infinite`,
                },
              }}
            >
              © 2025 Recruitment Platform. Made with{" "}
              <span className="heart">❤️</span> in Vietnam. All rights reserved.
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
