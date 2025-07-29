import axios from 'axios';
import { API_BASE_URL } from '../config';

// Axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) => {
    return api.post('/api/auth/login', { email, password });
  },
  register: (userData: any) => {
    return api.post('/api/auth/register', userData);
  },
  getCurrentUser: () => {
    return api.get('/api/auth/me');
  },
  refreshToken: () => {
    return api.post('/api/auth/refresh-token');
  },
};

// User Settings API
export const userSettingsAPI = {
  getSettings: () => {
    return api.get('/api/users/settings');
  },
  updateSettings: (settings: any) => {
    return api.post('/api/users/settings', settings);
  },
  updatePassword: (passwordData: { currentPassword: string; newPassword: string }) => {
    return api.post('/api/users/update-password', passwordData);
  },
  updateNotificationPreferences: (preferences: any) => {
    return api.post('/api/users/notification-preferences', preferences);
  },
  updateAppearanceSettings: (settings: any) => {
    return api.post('/api/users/appearance-settings', settings);
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    return await api.get('/api/users');
  },
  getById: async (id: string) => {
    return await api.get(`/api/users/${id}`);
  },
  getProfile: async () => {
    try {
      const response = await api.get('/api/users-enhanced/profile');
      console.log('🔍 Raw profile response:', response);
      
      // Kiểm tra cấu trúc dữ liệu và trả về đúng định dạng
      if (response.data && response.data.success && response.data.data) {
        return { data: response.data.data };
      }
      return response;
    } catch (error) {
      console.error('❌ Error in getProfile:', error);
      throw error;
    }
  },
  updateProfile: async (profileData: any) => {
    try {
      console.log('📤 SENDING UPDATE PROFILE REQUEST with data:', JSON.stringify(profileData, null, 2));
      console.log('🔑 Token used:', localStorage.getItem('token'));
      
      // Log chi tiết về education data
      if (profileData.education) {
        console.log('📚 Education data being sent:', profileData.education);
        console.log('📚 Education count:', profileData.education.length);
        profileData.education.forEach((edu: any, index: number) => {
          console.log(`📚 Education #${index + 1}:`, edu);
        });
      } else {
        console.log('⚠️ No education data found in profile data');
      }
      
      // Log chi tiết về workExperiences data
      if (profileData.workExperiences) {
        console.log('💼 Work experiences data being sent:', profileData.workExperiences);
        console.log('💼 Work experiences count:', profileData.workExperiences.length);
        profileData.workExperiences.forEach((exp: any, index: number) => {
          console.log(`💼 Work experience #${index + 1}:`, exp);
        });
      } else {
        console.log('⚠️ No work experiences data found in profile data');
        // Đảm bảo workExperiences luôn là một mảng
        profileData.workExperiences = [];
      }
      
      // Log chi tiết về certifications data
      if (profileData.certifications) {
        console.log('🏆 Certifications data being sent:', profileData.certifications);
        console.log('🏆 Certifications count:', profileData.certifications.length);
      } else {
        console.log('⚠️ No certifications data found in profile data');
        // Đảm bảo certifications luôn là một mảng
        profileData.certifications = [];
      }
      
      // Log chi tiết về projects data
      if (profileData.projects) {
        console.log('🚀 Projects data being sent:', profileData.projects);
        console.log('🚀 Projects count:', profileData.projects.length);
      } else {
        console.log('⚠️ No projects data found in profile data');
        // Đảm bảo projects luôn là một mảng
        profileData.projects = [];
      }
      
      // Sử dụng POST thay vì PUT và sửa đường dẫn API
      const response = await api.post('/api/users-enhanced/update-profile', profileData);
      console.log('🔍 Raw update response:', response);
      
      // Kiểm tra cấu trúc dữ liệu và trả về đúng định dạng
      if (response.data && response.data.success && response.data.data) {
        console.log('✅ Profile updated successfully:', response.data.data);
        return { data: response.data.data };
      }
      console.log('⚠️ Unexpected response format:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error in updateProfile:', error);
      console.error('❌ Error details:', (error as any).response?.data || error);
      throw error;
    }
  },
  uploadAvatar: async (file: File) => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('avatar', file);
      
      // Create custom config for multipart/form-data
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      console.log('📤 Uploading avatar...');
      const response = await axios.post(`${API_BASE_URL}/api/upload/avatar`, formData, config);
      
      console.log('📥 Avatar upload response received');
      
      if (response.data && response.data.success && response.data.data) {
        // Return the base64 data URL from the server
        console.log('✅ Avatar uploaded successfully and received as base64');
        return response.data.data.avatarUrl;
      } else {
        console.error('❌ Invalid response format from avatar upload:', response.data);
        throw new Error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('❌ Error uploading avatar:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Test function
  testProfileUpdate: async (testData: any) => {
    try {
      console.log('🧪 Testing profile update with data:', JSON.stringify(testData, null, 2));
      console.log('🔑 Token used:', localStorage.getItem('token'));
      
      const response = await api.post('/api/users/test-profile-update', testData);
      console.log('🔍 Test response:', response);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error in test profile update:', error);
      console.error('❌ Error details:', (error as any).response?.data || error);
      throw error;
    }
  }
};

// Admin Users API
export const adminUsersAPI = {
  getAll: async () => {
    return await api.get('/api/admin/users');
  },
  getById: async (id: string) => {
    return await api.get(`/api/admin/users/${id}`);
  },
  updateStatus: async (id: string, isActive: boolean) => {
    return await api.patch(`/api/admin/users/${id}/status`, { isActive });
  },
  delete: async (id: string) => {
    return await api.delete(`/api/admin/users/${id}`);
  }
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: async () => {
    return await api.get('/api/analytics/dashboard-stats');
  },
  getRecentActivities: async () => {
    return await api.get('/api/analytics/recent-activities');
  },
  getPersonalAnalytics: async (params: {
    userId: string;
    metrics?: string[];
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) => {
    return await api.get('/api/analytics/personal', {
      params: {
        userId: params.userId,
        metrics: params.metrics?.join(','),
        startDate: params.startDate,
        endDate: params.endDate,
        groupBy: params.groupBy,
      }
    });
  },
  getCompanyAnalytics: async (params?: {
    timeRange?: string;
    jobId?: string;
  }) => {
    return await api.get('/api/analytics/company', { params });
  },
  getCompanyPerformance: async () => {
    return await api.get('/api/analytics/company/performance');
  }
};

// Jobs API
export const jobsAPI = {
  getAll: async (filters?: any) => {
    try {
      const response = await api.get('/api/jobs', { params: filters });
      console.log("Jobs API Raw Response:", response);
      
      // Check data structure
      if (response.data?.success && response.data?.data?.jobs) {
        console.log("Jobs API Structured Data:", response.data.data.jobs);
        
        // Check if hasApplied is present
        if (response.data.data.jobs.length > 0) {
          console.log("hasApplied in first job:", response.data.data.jobs[0].hasApplied);
        }
      }
      
      return response;
    } catch (error) {
      console.error("Error in jobsAPI.getAll:", error);
      throw error;
    }
  },
  getById: async (id: string) => {
    return await api.get(`/api/jobs/${id}`);
  },
  create: async (jobData: any) => {
    return await api.post('/api/jobs', jobData);
  },
  update: async (id: string, jobData: any) => {
    return await api.put(`/api/jobs/${id}`, jobData);
  },
  delete: async (id: string) => {
    return await api.delete(`/api/jobs/${id}`);
  },
  getCompanyJobs: async () => {
    return await api.get('/api/jobs/company');
  },
  updateStatus: async (id: string, isActive: boolean) => {
    return await api.patch(`/api/jobs/${id}/status`, { isActive });
  },
  getJobStats: async (id: string) => {
    return await api.get(`/api/jobs/${id}/stats`);
  },
  incrementView: async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      } : {};
      
      return await axios.post(`${API_BASE_URL}/api/jobs/${id}/view`, {}, config);
    } catch (error) {
      console.error('Error tracking job view:', error);
      throw error;
    }
  },
  getSavedJobs: async () => {
    return await api.get('/api/jobs/saved');
  },
  saveJob: async (jobId: string) => {
    return await api.post(`/api/jobs/${jobId}/save`);
  },
  unsaveJob: async (jobId: string) => {
    return await api.delete(`/api/jobs/${jobId}/save`);
  }
};

// Companies API
export const companiesAPI = {
  getAll: async () => {
    return await api.get('/api/companies');
  },
  getById: async (id: string) => {
    return await api.get(`/api/companies/${id}`);
  },
  getProfile: async () => {
    return await api.get('/api/companies/profile');
  },
  updateProfile: async (profileData: any) => {
    return await api.put('/api/companies/profile', profileData);
  },
  getJobs: async (companyId: string) => {
    return await api.get(`/api/companies/${companyId}/jobs`);
  },
  getRecentApplications: async () => {
    return await api.get('/api/applications/company/recent');
  },
  getPerformanceMetrics: async () => {
    return await api.get('/api/analytics/company/performance');
  },
  uploadLogo: async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    };
    
    return await axios.post(`${API_BASE_URL}/api/upload/company-logo`, formData, config);
  }
};

// Saved Jobs API
export const savedJobsAPI = {
  getAll: async () => {
    return await api.get('/api/saved-jobs');
  },
  save: async (jobId: string) => {
    return await api.post('/api/saved-jobs', { jobId });
  },
  remove: async (jobId: string) => {
    return await api.delete(`/api/saved-jobs/${jobId}`);
  },
  checkSaved: async (jobId: string) => {
    return await api.get(`/api/saved-jobs/check/${jobId}`);
  },
  add: async (jobId: string) => {
    return await api.post('/api/saved-jobs', { jobId });
  }
};

// Applications API
export const applicationsAPI = {
  getAll: async (filters?: any) => {
    return await api.get('/api/applications', { params: filters });
  },
  getById: async (id: string) => {
    return await api.get(`/api/applications/${id}`);
  },
  create: async (applicationData: any) => {
    return await api.post('/api/applications', applicationData);
  },
  update: async (id: string, applicationData: any) => {
    return await api.put(`/api/applications/${id}`, applicationData);
  },
  delete: async (id: string) => {
    return await api.delete(`/api/applications/${id}`);
  },
  getByJob: async (jobId: string) => {
    return await api.get(`/api/applications/job/${jobId}`);
  },
  getByStudent: async () => {
    try {
      const response = await api.get('/api/applications/student');
      console.log("Get student applications response:", response);
      return response;
    } catch (error) {
      console.error("Error in getByStudent:", error);
      throw error;
    }
  },
  getRecentForCompany: async () => {
    return await api.get('/api/applications/company/recent');
  },
  updateStatus: async (id: string, status: string) => {
    return await api.patch(`/api/applications/${id}/status`, { status });
  },
  scheduleInterview: async (id: string, interviewData: any) => {
    return await api.post(`/api/applications/${id}/schedule-interview`, interviewData);
  },
  uploadResume: async (applicationId: string, file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    };
    
    return await axios.post(`${API_BASE_URL}/api/applications/${applicationId}/resume`, formData, config);
  }
};

export const dashboardAPI = {
  getStudentDashboard: async (studentId: string) => {
    return await api.get(`/api/student-dashboard/${studentId}`);
  },
  saveJob: async (studentId: string, jobId: string) => {
    return await api.post(`/api/users/students/${studentId}/saved-jobs/${jobId}`);
  },
  removeJob: async (studentId: string, jobId: string) => {
    return await api.delete(`/api/users/students/${studentId}/saved-jobs/${jobId}`);
  },
  getCompanyDashboard: async () => {
    return await api.get('/api/companies/dashboard');
  }
};

// Notifications API
export const notificationsAPI = {
  getAll: async (params?: { unread_only?: boolean; type?: string; page?: number }) => {
    return await api.get('/api/notifications', { params });
  },
  markRead: async (id: string) => {
    return await api.put(`/api/notifications/${id}/read`);
  },
  markAllRead: async () => {
    return await api.put('/api/notifications/read-all');
  },
  delete: async (id: string) => {
    return await api.delete(`/api/notifications/${id}`);
  },
  getUnreadCount: async () => {
    return await api.get('/api/notifications/unread-count');
  },
  getSettings: async () => {
    return await api.get('/api/notifications/settings');
  },
  updateSettings: async (settings: any) => {
    return await api.put('/api/notifications/settings', settings);
  }
};

// Quick Actions API
export const quickActionsAPI = {
  getQuickActions: async () => {
    return await api.get('/api/quick-actions');
  },
  getRecentItems: async () => {
    return await api.get('/api/quick-actions/recent');
  },
  trackAction: async (actionType: string, itemId: string) => {
    return await api.post('/api/quick-actions/track', { actionType, itemId });
  }
};

export default {
  authAPI,
  usersAPI,
  jobsAPI,
  companiesAPI,
  savedJobsAPI,
  applicationsAPI,
  adminUsersAPI,
  analyticsAPI,
  userSettingsAPI,
  notificationsAPI,
  quickActionsAPI,
  dashboardAPI
};
