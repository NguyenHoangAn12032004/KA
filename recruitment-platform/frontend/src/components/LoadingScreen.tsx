import React from "react";
import {
  Box,
  Typography,
  useTheme,
  alpha,
  keyframes,
  CircularProgress,
} from "@mui/material";
import { Work, TrendingUp, Business } from "@mui/icons-material";

// Modern Loading Animations
const pulseAnimation = keyframes`
  0%, 100% { 
    transform: scale(1);
    opacity: 1;
  }
  50% { 
    transform: scale(1.1);
    opacity: 0.7;
  }
`;

const floatAnimation = keyframes`
  0%, 100% { 
    transform: translateY(0px) rotate(0deg);
    opacity: 0.7;
  }
  33% { 
    transform: translateY(-10px) rotate(5deg);
    opacity: 1;
  }
  66% { 
    transform: translateY(5px) rotate(-5deg);
    opacity: 0.8;
  }
`;

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const sparkleAnimation = keyframes`
  0%, 100% { 
    opacity: 0; 
    transform: scale(0) rotate(0deg);
  }
  50% { 
    opacity: 1; 
    transform: scale(1) rotate(180deg);
  }
`;

const rippleAnimation = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

const slideInAnimation = keyframes`
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

interface LoadingScreenProps {
  message?: string;
  variant?: "default" | "compact" | "splash";
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Đang tải...",
  variant = "default",
}) => {
  const theme = useTheme();

  if (variant === "compact") {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 4,
        }}
      >
        <CircularProgress
          size={32}
          sx={{
            color: theme.palette.primary.main,
            animation: `${pulseAnimation} 2s ease-in-out infinite`,
          }}
        />
      </Box>
    );
  }

  if (variant === "splash") {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: `
            linear-gradient(135deg, 
              ${theme.palette.primary.main} 0%, 
              ${theme.palette.primary.dark} 50%,
              ${theme.palette.secondary.main} 100%
            )
          `,
          backgroundSize: "400% 400%",
          animation: `${gradientAnimation} 8s ease infinite`,
          zIndex: 9999,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 80%, ${alpha("#ffffff", 0.1)} 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, ${alpha("#ffffff", 0.1)} 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, ${alpha("#ffffff", 0.05)} 0%, transparent 50%)
            `,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Logo Animation */}
          <Box
            sx={{
              position: "relative",
              width: 120,
              height: 120,
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
              animation: `${pulseAnimation} 3s ease-in-out infinite`,
              "&::before": {
                content: '""',
                position: "absolute",
                inset: -10,
                borderRadius: "50%",
                background:
                  "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.3), transparent)",
                animation: `${gradientAnimation} 4s linear infinite`,
                zIndex: -1,
              },
            }}
          >
            <Work
              sx={{
                fontSize: 60,
                color: "white",
                filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.3))",
              }}
            />

            {/* Ripple Effect */}
            {[...Array(3)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.3)",
                  animation: `${rippleAnimation} 3s ease-out infinite`,
                  animationDelay: `${i * 1}s`,
                }}
              />
            ))}
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            sx={{
              color: "white",
              fontWeight: 800,
              textAlign: "center",
              textShadow: "0 4px 20px rgba(0,0,0,0.3)",
              animation: `${slideInAnimation} 1s ease-out`,
              background: "linear-gradient(45deg, #ffffff, #f0f0f0)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Recruitment Platform
          </Typography>

          {/* Loading Message */}
          <Typography
            variant="h6"
            sx={{
              color: alpha("#ffffff", 0.9),
              textAlign: "center",
              textShadow: "0 2px 10px rgba(0,0,0,0.2)",
              animation: `${slideInAnimation} 1.2s ease-out`,
            }}
          >
            {message}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Default loading screen
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        flexDirection: "column",
        gap: 4,
        background: `
          linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.05)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.05)} 100%
          )
        `,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%)
          `,
        },
      }}
    >
      {/* Floating Background Elements */}
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          left: "10%",
          animation: `${floatAnimation} 6s ease-in-out infinite`,
          opacity: 0.1,
        }}
      >
        <Business sx={{ fontSize: 40, color: theme.palette.primary.main }} />
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: "30%",
          right: "15%",
          animation: `${floatAnimation} 8s ease-in-out infinite`,
          animationDelay: "2s",
          opacity: 0.1,
        }}
      >
        <TrendingUp
          sx={{ fontSize: 35, color: theme.palette.secondary.main }}
        />
      </Box>

      {/* Main Loading Content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Custom Loading Spinner */}
        <Box
          sx={{
            position: "relative",
            width: 80,
            height: 80,
          }}
        >
          <CircularProgress
            size={80}
            thickness={4}
            sx={{
              color: theme.palette.primary.main,
              animation: `${pulseAnimation} 2s ease-in-out infinite`,
            }}
          />

          {/* Center Icon */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              animation: `${floatAnimation} 4s ease-in-out infinite`,
            }}
          >
            <Work
              sx={{
                fontSize: 32,
                color: theme.palette.primary.main,
                filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.1))",
              }}
            />
          </Box>

          {/* Sparkle Effects */}
          {[...Array(6)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 4,
                height: 4,
                bgcolor: theme.palette.primary.main,
                borderRadius: "50%",
                animation: `${sparkleAnimation} 2s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
                transform: `
                  translate(-50%, -50%) 
                  rotate(${i * 60}deg) 
                  translateY(-40px)
                `,
              }}
            />
          ))}
        </Box>

        {/* Loading Text */}
        <Typography
          variant="h6"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 600,
            textAlign: "center",
            animation: `${slideInAnimation} 1s ease-out`,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {message}
        </Typography>

        {/* Loading Dots */}
        <Box sx={{ display: "flex", gap: 1 }}>
          {[...Array(3)].map((_, i) => (
            <Box
              key={i}
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: theme.palette.primary.main,
                animation: `${pulseAnimation} 1.5s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default LoadingScreen;
