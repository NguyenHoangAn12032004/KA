import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import baseTheme from '../theme/theme';

interface ThemeContextType {
  language: string;
  darkMode: boolean;
  highContrast: boolean;
  fontSize: string;
  setLanguage: (language: string) => void;
  setDarkMode: (darkMode: boolean) => void;
  setHighContrast: (highContrast: boolean) => void;
  setFontSize: (fontSize: string) => void;
  saveSettings: () => void;
}

interface ThemeProviderProps {
  children: ReactNode;
}

interface UserSettings {
  language: string;
  darkMode: boolean;
  highContrast: boolean;
  fontSize: string;
  emailNotifications?: boolean;
  applicationUpdates?: boolean;
  jobRecommendations?: boolean;
  messageNotifications?: boolean;
  marketingEmails?: boolean;
}

const defaultSettings: UserSettings = {
  language: 'vi',
  darkMode: false,
  highContrast: false,
  fontSize: 'medium',
  emailNotifications: true,
  applicationUpdates: true,
  jobRecommendations: true,
  messageNotifications: true,
  marketingEmails: false,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeSettings = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeSettings must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Load settings from localStorage
  const loadSettings = (): UserSettings => {
    try {
      const storedSettings = localStorage.getItem('userSettings');
      if (storedSettings) {
        return { ...defaultSettings, ...JSON.parse(storedSettings) };
      }
    } catch (error) {
      console.error('Error loading theme settings:', error);
    }
    return defaultSettings;
  };

  const [language, setLanguage] = useState<string>(loadSettings().language);
  const [darkMode, setDarkMode] = useState<boolean>(loadSettings().darkMode);
  const [highContrast, setHighContrast] = useState<boolean>(loadSettings().highContrast);
  const [fontSize, setFontSize] = useState<string>(loadSettings().fontSize);

  // Save settings to localStorage
  const saveSettings = () => {
    try {
      // Preserve other settings
      const currentSettings = loadSettings();
      const newSettings = {
        ...currentSettings,
        language,
        darkMode,
        highContrast,
        fontSize,
      };
      localStorage.setItem('userSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving theme settings:', error);
    }
  };

  // Create modified theme based on settings
  const theme = React.useMemo(() => {
    // Start with base theme
    let customTheme = { ...baseTheme };
    
    // Apply dark mode
    customTheme = createTheme({
      ...customTheme,
      palette: {
        ...customTheme.palette,
        mode: darkMode ? 'dark' : 'light',
        background: {
          default: darkMode ? '#121212' : '#FAFBFC',
          paper: darkMode ? '#1E1E1E' : '#FFFFFF',
        },
        text: {
          primary: darkMode ? '#FFFFFF' : '#212121',
          secondary: darkMode ? '#AAAAAA' : '#757575',
        },
      },
      components: {
        ...customTheme.components,
        // Ensure CV content is always readable regardless of theme
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              // CV-specific paper should always have readable content
              '&[class*="CVTemplate"]': {
                backgroundColor: darkMode ? '#1E1E1E' : '#FFFFFF',
                color: darkMode ? '#FFFFFF' : '#333333',
                '& .MuiTypography-root': {
                  color: darkMode ? '#FFFFFF' : '#333333',
                },
                '& .MuiDivider-root': {
                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                },
              },
            },
          },
        },
      },
    });
    
    // Apply high contrast
    if (highContrast) {
      customTheme = createTheme({
        ...customTheme,
        palette: {
          ...customTheme.palette,
          primary: {
            main: darkMode ? '#4CC2FF' : '#0052CC',
            light: darkMode ? '#80D8FF' : '#4C9AFF',
            dark: darkMode ? '#0091EA' : '#0747A6',
            contrastText: darkMode ? '#000000' : '#FFFFFF',
          },
          secondary: {
            main: darkMode ? '#FF4081' : '#E91E63',
            light: darkMode ? '#FF80AB' : '#F48FB1',
            dark: darkMode ? '#C51162' : '#C2185B',
            contrastText: darkMode ? '#000000' : '#FFFFFF',
          },
          error: {
            main: darkMode ? '#FF6B6B' : '#F44336',
            contrastText: darkMode ? '#000000' : '#FFFFFF',
          },
          warning: {
            main: darkMode ? '#FFEB3B' : '#FFC107',
            contrastText: '#000000',
          },
          success: {
            main: darkMode ? '#4CAF50' : '#4CAF50',
            contrastText: darkMode ? '#000000' : '#FFFFFF',
          },
          text: {
            primary: darkMode ? '#FFFFFF' : '#000000',
            secondary: darkMode ? '#EEEEEE' : '#333333',
          },
          divider: darkMode ? '#555555' : '#CCCCCC',
          background: {
            default: darkMode ? '#000000' : '#FFFFFF',
            paper: darkMode ? '#121212' : '#FFFFFF',
          },
        },
        typography: {
          ...customTheme.typography,
          allVariants: {
            fontWeight: 500,
          },
        },
        components: {
          ...customTheme.components,
          MuiButton: {
            styleOverrides: {
              root: {
                fontWeight: 700,
                borderWidth: '2px',
                ':focus': {
                  outline: `3px solid ${darkMode ? '#4CC2FF' : '#0052CC'}`,
                  outlineOffset: '2px',
                },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderWidth: '2px',
                    borderColor: darkMode ? '#AAAAAA' : '#757575',
                  },
                  '&:hover fieldset': {
                    borderColor: darkMode ? '#FFFFFF' : '#000000',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: darkMode ? '#4CC2FF' : '#0052CC',
                    borderWidth: '2px',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: darkMode ? '#AAAAAA' : '#757575',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: darkMode ? '#4CC2FF' : '#0052CC',
                },
              },
            },
          },
          MuiTab: {
            styleOverrides: {
              root: {
                ':focus': {
                  outline: `2px solid ${darkMode ? '#4CC2FF' : '#0052CC'}`,
                  outlineOffset: '2px',
                },
              },
            },
          },
          MuiSwitch: {
            styleOverrides: {
              root: {
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: darkMode ? '#4CC2FF' : '#0052CC',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: darkMode ? '#4CC2FF' : '#0052CC',
                },
              },
            },
          },
          // Enhanced CV-specific styling for high contrast
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                '&[class*="CVTemplate"]': {
                  backgroundColor: darkMode ? '#000000' : '#FFFFFF',
                  color: darkMode ? '#FFFFFF' : '#000000',
                  borderColor: darkMode ? '#FFFFFF' : '#000000',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  '& .MuiTypography-root': {
                    color: darkMode ? '#FFFFFF' : '#000000',
                  },
                  '& .MuiDivider-root': {
                    borderColor: darkMode ? '#FFFFFF' : '#000000',
                    borderWidth: '2px',
                  },
                  '& .MuiLinearProgress-root': {
                    backgroundColor: darkMode ? '#555555' : '#DDDDDD',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: darkMode ? '#FFFFFF' : '#000000',
                    },
                  },
                  '& .MuiChip-root': {
                    borderColor: darkMode ? '#FFFFFF' : '#000000',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    color: darkMode ? '#FFFFFF' : '#000000',
                    backgroundColor: 'transparent',
                  },
                },
              },
            },
          },
        },
      });
    }
    
    // Apply font size
    const fontSizeMultiplier = fontSize === 'small' ? 0.9 : fontSize === 'large' ? 1.15 : 1;
    
    customTheme = createTheme({
      ...customTheme,
      typography: {
        ...customTheme.typography,
        fontSize: 14 * fontSizeMultiplier,
        h1: {
          ...customTheme.typography.h1,
          fontSize: `calc(3.5rem * ${fontSizeMultiplier})`,
        },
        h2: {
          ...customTheme.typography.h2,
          fontSize: `calc(2.75rem * ${fontSizeMultiplier})`,
        },
        h3: {
          ...customTheme.typography.h3,
          fontSize: `calc(2.25rem * ${fontSizeMultiplier})`,
        },
        h4: {
          ...customTheme.typography.h4,
          fontSize: `calc(1.875rem * ${fontSizeMultiplier})`,
        },
        h5: {
          ...customTheme.typography.h5,
          fontSize: `calc(1.5rem * ${fontSizeMultiplier})`,
        },
        h6: {
          ...customTheme.typography.h6,
          fontSize: `calc(1.25rem * ${fontSizeMultiplier})`,
        },
        body1: {
          ...customTheme.typography.body1,
          fontSize: `calc(1rem * ${fontSizeMultiplier})`,
        },
        body2: {
          ...customTheme.typography.body2,
          fontSize: `calc(0.875rem * ${fontSizeMultiplier})`,
        },
      },
    });
    
    return customTheme;
  }, [darkMode, highContrast, fontSize]);

  // Update document language
  useEffect(() => {
    document.documentElement.lang = language;
    
    // Load language translations if needed
    if (language === 'en') {
      // Load English translations
      document.title = 'Recruitment Platform';
    } else {
      // Load Vietnamese translations
      document.title = 'Nền tảng tuyển dụng';
    }
  }, [language]);

  const value = {
    language,
    darkMode,
    highContrast,
    fontSize,
    setLanguage,
    setDarkMode,
    setHighContrast,
    setFontSize,
    saveSettings,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 