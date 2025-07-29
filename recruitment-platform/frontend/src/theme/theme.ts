import { createTheme } from "@mui/material/styles";

// Modern Color Palette
const colors = {
  primary: {
    50: "#E3F2FD",
    100: "#BBDEFB",
    200: "#90CAF9",
    300: "#64B5F6",
    400: "#42A5F5",
    500: "#2196F3",
    600: "#1E88E5",
    700: "#1976D2",
    800: "#1565C0",
    900: "#0D47A1",
  },
  secondary: {
    50: "#FCE4EC",
    100: "#F8BBD9",
    200: "#F48FB1",
    300: "#F06292",
    400: "#EC407A",
    500: "#E91E63",
    600: "#D81B60",
    700: "#C2185B",
    800: "#AD1457",
    900: "#880E4F",
  },
  accent: {
    50: "#F3E5F5",
    100: "#E1BEE7",
    200: "#CE93D8",
    300: "#BA68C8",
    400: "#AB47BC",
    500: "#9C27B0",
    600: "#8E24AA",
    700: "#7B1FA2",
    800: "#6A1B9A",
    900: "#4A148C",
  },
  success: {
    50: "#E8F5E8",
    100: "#C8E6C9",
    200: "#A5D6A7",
    300: "#81C784",
    400: "#66BB6A",
    500: "#4CAF50",
    600: "#43A047",
    700: "#388E3C",
    800: "#2E7D32",
    900: "#1B5E20",
  },
  warning: {
    50: "#FFF8E1",
    100: "#FFECB3",
    200: "#FFE082",
    300: "#FFD54F",
    400: "#FFCA28",
    500: "#FFC107",
    600: "#FFB300",
    700: "#FFA000",
    800: "#FF8F00",
    900: "#FF6F00",
  },
  error: {
    50: "#FFEBEE",
    100: "#FFCDD2",
    200: "#EF9A9A",
    300: "#E57373",
    400: "#EF5350",
    500: "#F44336",
    600: "#E53935",
    700: "#D32F2F",
    800: "#C62828",
    900: "#B71C1C",
  },
  neutral: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#EEEEEE",
    300: "#E0E0E0",
    400: "#BDBDBD",
    500: "#9E9E9E",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
  },
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: colors.primary[600],
      light: colors.primary[400],
      dark: colors.primary[800],
      contrastText: "#ffffff",
    },
    secondary: {
      main: colors.secondary[500],
      light: colors.secondary[300],
      dark: colors.secondary[700],
      contrastText: "#ffffff",
    },
    success: {
      main: colors.success[500],
      light: colors.success[300],
      dark: colors.success[700],
      contrastText: "#ffffff",
    },
    warning: {
      main: colors.warning[500],
      light: colors.warning[300],
      dark: colors.warning[700],
      contrastText: "#000000",
    },
    error: {
      main: colors.error[500],
      light: colors.error[300],
      dark: colors.error[700],
      contrastText: "#ffffff",
    },
    background: {
      default: "#FAFBFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: colors.neutral[800],
      secondary: colors.neutral[600],
    },
    divider: colors.neutral[200],
    grey: colors.neutral,
  },
  typography: {
    fontFamily: [
      "Inter",
      "Roboto",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontWeight: 800,
      fontSize: "3.5rem",
      lineHeight: 1.1,
      letterSpacing: "-0.02em",
      "@media (max-width:600px)": {
        fontSize: "2.5rem",
      },
    },
    h2: {
      fontWeight: 700,
      fontSize: "2.75rem",
      lineHeight: 1.2,
      letterSpacing: "-0.01em",
      "@media (max-width:600px)": {
        fontSize: "2rem",
      },
    },
    h3: {
      fontWeight: 700,
      fontSize: "2.25rem",
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
      "@media (max-width:600px)": {
        fontSize: "1.75rem",
      },
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.875rem",
      lineHeight: 1.4,
      "@media (max-width:600px)": {
        fontSize: "1.5rem",
      },
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: 1.4,
      "@media (max-width:600px)": {
        fontSize: "1.25rem",
      },
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.25rem",
      lineHeight: 1.5,
      "@media (max-width:600px)": {
        fontSize: "1rem",
      },
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: "1.125rem",
      lineHeight: 1.5,
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    body1: {
      fontWeight: 400,
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    body2: {
      fontWeight: 400,
      fontSize: "0.875rem",
      lineHeight: 1.5,
    },
    caption: {
      fontWeight: 400,
      fontSize: "0.75rem",
      lineHeight: 1.4,
    },
    overline: {
      fontWeight: 600,
      fontSize: "0.75rem",
      lineHeight: 1.4,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
    },
    button: {
      fontWeight: 600,
      fontSize: "0.875rem",
      textTransform: "none",
      letterSpacing: "0.02em",
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0px 1px 3px rgba(0, 0, 0, 0.05)",
    "0px 4px 6px rgba(0, 0, 0, 0.07)",
    "0px 5px 15px rgba(0, 0, 0, 0.08)",
    "0px 10px 24px rgba(0, 0, 0, 0.09)",
    "0px 15px 35px rgba(0, 0, 0, 0.1)",
    "0px 20px 40px rgba(0, 0, 0, 0.1)",
    "0px 25px 50px rgba(0, 0, 0, 0.12)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 30px 60px rgba(0, 0, 0, 0.15)",
    "0px 30px 60px rgba(0, 0, 0, 0.18)",
    "0px 35px 70px rgba(0, 0, 0, 0.18)",
    "0px 35px 70px rgba(0, 0, 0, 0.2)",
    "0px 40px 80px rgba(0, 0, 0, 0.2)",
    "0px 40px 80px rgba(0, 0, 0, 0.22)",
    "0px 45px 90px rgba(0, 0, 0, 0.22)",
    "0px 45px 90px rgba(0, 0, 0, 0.24)",
    "0px 50px 100px rgba(0, 0, 0, 0.24)",
    "0px 50px 100px rgba(0, 0, 0, 0.26)",
    "0px 55px 110px rgba(0, 0, 0, 0.26)",
    "0px 55px 110px rgba(0, 0, 0, 0.28)",
    "0px 60px 120px rgba(0, 0, 0, 0.28)",
    "0px 60px 120px rgba(0, 0, 0, 0.3)",
    "0px 65px 130px rgba(0, 0, 0, 0.3)",
    "0px 70px 140px rgba(0, 0, 0, 0.32)",
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFeatureSettings: '"liga" 1, "kern" 1',
          textRendering: "optimizeLegibility",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 600,
          padding: "10px 24px",
          fontSize: "0.875rem",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-1px)",
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
          boxShadow: `0px 4px 14px rgba(${parseInt(colors.primary[500].slice(1, 3), 16)}, ${parseInt(colors.primary[500].slice(3, 5), 16)}, ${parseInt(colors.primary[500].slice(5, 7), 16)}, 0.39)`,
          "&:hover": {
            background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[700]} 100%)`,
            boxShadow: `0px 6px 20px rgba(${parseInt(colors.primary[500].slice(1, 3), 16)}, ${parseInt(colors.primary[500].slice(3, 5), 16)}, ${parseInt(colors.primary[500].slice(5, 7), 16)}, 0.5)`,
          },
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${colors.secondary[500]} 0%, ${colors.secondary[600]} 100%)`,
          boxShadow: `0px 4px 14px rgba(${parseInt(colors.secondary[500].slice(1, 3), 16)}, ${parseInt(colors.secondary[500].slice(3, 5), 16)}, ${parseInt(colors.secondary[500].slice(5, 7), 16)}, 0.39)`,
          "&:hover": {
            background: `linear-gradient(135deg, ${colors.secondary[600]} 0%, ${colors.secondary[700]} 100%)`,
            boxShadow: `0px 6px 20px rgba(${parseInt(colors.secondary[500].slice(1, 3), 16)}, ${parseInt(colors.secondary[500].slice(3, 5), 16)}, ${parseInt(colors.secondary[500].slice(5, 7), 16)}, 0.5)`,
          },
        },
        outlined: {
          borderWidth: "2px",
          "&:hover": {
            borderWidth: "2px",
            backgroundColor: `rgba(${parseInt(colors.primary[500].slice(1, 3), 16)}, ${parseInt(colors.primary[500].slice(3, 5), 16)}, ${parseInt(colors.primary[500].slice(5, 7), 16)}, 0.04)`,
          },
        },
        text: {
          "&:hover": {
            backgroundColor: `rgba(${parseInt(colors.primary[500].slice(1, 3), 16)}, ${parseInt(colors.primary[500].slice(3, 5), 16)}, ${parseInt(colors.primary[500].slice(5, 7), 16)}, 0.04)`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${colors.neutral[100]}`,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0px 12px 40px rgba(0, 0, 0, 0.1)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            backgroundColor: "#FFFFFF",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: colors.primary[300],
              },
            },
            "&.Mui-focused": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderWidth: "2px",
                borderColor: colors.primary[500],
              },
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${colors.neutral[100]}`,
          boxShadow: "0px 1px 8px rgba(0, 0, 0, 0.05)",
          color: colors.neutral[800],
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "scale(1.05)",
          },
        },
        colorPrimary: {
          backgroundColor: colors.primary[50],
          color: colors.primary[700],
          border: `1px solid ${colors.primary[200]}`,
        },
        colorSecondary: {
          backgroundColor: colors.secondary[50],
          color: colors.secondary[700],
          border: `1px solid ${colors.secondary[200]}`,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: `3px solid ${colors.neutral[100]}`,
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "scale(1.1)",
            backgroundColor: `rgba(${parseInt(colors.primary[500].slice(1, 3), 16)}, ${parseInt(colors.primary[500].slice(3, 5), 16)}, ${parseInt(colors.primary[500].slice(5, 7), 16)}, 0.04)`,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
        },
        elevation2: {
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
        },
        elevation3: {
          boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: colors.neutral[100],
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.neutral[800],
          fontSize: "0.75rem",
          borderRadius: 8,
          padding: "8px 12px",
        },
        arrow: {
          color: colors.neutral[800],
        },
      },
    },
  },
});

// Add custom theme extensions
declare module "@mui/material/styles" {
  interface Theme {
    customShadows: {
      card: string;
      dialog: string;
      dropdown: string;
    };
  }
  interface ThemeOptions {
    customShadows?: {
      card?: string;
      dialog?: string;
      dropdown?: string;
    };
  }
}

const enhancedTheme = createTheme(theme, {
  customShadows: {
    card: "0px 4px 20px rgba(0, 0, 0, 0.05)",
    dialog: "0px 24px 48px rgba(0, 0, 0, 0.15)",
    dropdown: "0px 8px 24px rgba(0, 0, 0, 0.1)",
  },
});

export default enhancedTheme;
