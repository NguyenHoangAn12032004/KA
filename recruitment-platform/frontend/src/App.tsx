import React from "react";
import { Box, Fade } from "@mui/material";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import {
  Navbar,
  LandingPage,
  StudentDashboard,
  CompanyDashboard,
  AdminDashboard,
  ModernJobsPage,
  CompanyProfile,
  StudentProfile,
  CompaniesPage,
  AnalyticsPage,
  NotificationsPage,
  SettingsPage,
  CandidatesPage,
  CreateJobPage,
} from "./components";
import LoadingScreen from "./components/LoadingScreen";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Page Wrapper with transitions
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Fade in timeout={600}>
      <Box sx={{ minHeight: "calc(100vh - 64px)" }}>{children}</Box>
    </Fade>
  );
};

// Main app content
const AppContent: React.FC = () => {
  const { user, loading, logout } = useAuth();

  console.log("🏠 AppContent render - User:", user, "Loading:", loading);

  if (loading) {
    return (
      <LoadingScreen variant="splash" message="Đang khởi tạo ứng dụng..." />
    );
  }

  // Auto-redirect based on user role
  const getDashboardRoute = () => {
    if (!user) return "/";

    console.log("🎯 Getting dashboard route for user role:", user.role);

    switch (user.role) {
      case "STUDENT":
        return "/student-dashboard";
      case "COMPANY":
        return "/company-dashboard";
      case "ADMIN":
        return "/admin-dashboard";
      default:
        return "/";
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar user={user} onLogout={logout} />

      <Box sx={{ flexGrow: 1 }}>
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Navigate to={getDashboardRoute()} replace />
              ) : (
                <PageWrapper>
                  <LandingPage />
                </PageWrapper>
              )
            }
          />
          <Route
            path="/student-dashboard"
            element={
              user?.role === "STUDENT" ? (
                <PageWrapper>
                  <StudentDashboard />
                </PageWrapper>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/company-dashboard"
            element={
              user?.role === "COMPANY" ? (
                <PageWrapper>
                  <CompanyDashboard />
                </PageWrapper>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              user?.role === "ADMIN" ? (
                <PageWrapper>
                  <AdminDashboard />
                </PageWrapper>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/jobs"
            element={
              user ? (
                <PageWrapper>
                  <ModernJobsPage />
                </PageWrapper>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/student-profile"
            element={
              user?.role === "STUDENT" ? (
                <PageWrapper>
                  <StudentProfile />
                </PageWrapper>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/company-profile"
            element={
              user?.role === "COMPANY" ? (
                <PageWrapper>
                  <CompanyProfile />
                </PageWrapper>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/companies"
            element={
              user ? (
                <PageWrapper>
                  <CompaniesPage />
                </PageWrapper>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/candidates"
            element={
              user?.role === "COMPANY" || user?.role === "ADMIN" ? (
                <PageWrapper>
                  <CandidatesPage />
                </PageWrapper>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/create-job"
            element={
              user?.role === "COMPANY" ? (
                <PageWrapper>
                  <CreateJobPage />
                </PageWrapper>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/analytics"
            element={
              user ? (
                <PageWrapper>
                  <AnalyticsPage />
                </PageWrapper>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/notifications"
            element={
              user ? (
                <PageWrapper>
                  <NotificationsPage />
                </PageWrapper>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/settings"
            element={
              user ? (
                <PageWrapper>
                  <SettingsPage />
                </PageWrapper>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </Box>

      <ToastContainer position="top-right" />
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AppContent />
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
