import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import theme from './theme/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import {
  Navbar,
  LandingPage,
  StudentDashboard,
  CompanyDashboard,
  AdminDashboard,
  JobsPage,
  CompanyProfile,
  StudentProfile,
  CompaniesPage
} from './components';

// Loading component
const LoadingScreen: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: 2
    }}
  >
    <CircularProgress size={40} />
    <div>Đang tải...</div>
  </Box>
);

// Main app content
const AppContent: React.FC = () => {
  const { user, loading, logout } = useAuth();

  console.log('🏠 AppContent render - User:', user, 'Loading:', loading);

  if (loading) {
    return <LoadingScreen />;
  }

  // Auto-redirect based on user role
  const getDashboardRoute = () => {
    if (!user) return '/';
    
    console.log('🎯 Getting dashboard route for user role:', user.role);
    
    switch (user.role) {
      case 'STUDENT':
        return '/student-dashboard';
      case 'COMPANY':
        return '/company-dashboard';
      case 'ADMIN':
        return '/admin-dashboard';
      default:
        return '/';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar user={user} onLogout={logout} />
      
      <Box sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={user ? <Navigate to={getDashboardRoute()} replace /> : <LandingPage />} />
          <Route 
            path="/student-dashboard" 
            element={user?.role === 'STUDENT' ? <StudentDashboard /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/company-dashboard" 
            element={user?.role === 'COMPANY' ? <CompanyDashboard /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/admin-dashboard" 
            element={user?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/jobs" 
            element={user ? <JobsPage /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/student-profile" 
            element={user?.role === 'STUDENT' ? <StudentProfile /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/company-profile" 
            element={user?.role === 'COMPANY' ? <CompanyProfile /> : <Navigate to="/" replace />} 
          />
          <Route path="/companies" element={user ? <CompaniesPage /> : <Navigate to="/" replace />} />
          <Route path="/candidates" element={<div>Candidates Page - Coming Soon</div>} />
        </Routes>
      </Box>
    </Box>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
