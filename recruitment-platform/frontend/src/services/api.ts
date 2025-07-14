import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'null' && token !== 'undefined') {
      // Clean the token and ensure it's properly formatted
      const cleanToken = token.trim();
      if (cleanToken) {
        config.headers.Authorization = `Bearer ${cleanToken}`;
        console.log('🔑 Adding token to request:', cleanToken.substring(0, 20) + '...');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/api/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: {
    email: string;
    password: string;
    role: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
  }) => {
    const response = await apiClient.post('/api/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },
};

// Jobs API
export const jobsAPI = {
  getAll: async (filters?: {
    search?: string;
    location?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/api/jobs', { params: filters });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/api/jobs/${id}`);
    return response.data;
  },

  create: async (jobData: any) => {
    const response = await apiClient.post('/api/jobs', jobData);
    return response.data;
  },

  update: async (id: string, jobData: any) => {
    const response = await apiClient.put(`/api/jobs/${id}`, jobData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/jobs/${id}`);
    return response.data;
  },
};

// Applications API
export const applicationsAPI = {
  getAll: async (filters?: { status?: string; jobId?: string }) => {
    console.log('🔍 Calling applications API...');
    console.log('🔍 Current user from localStorage:', JSON.parse(localStorage.getItem('user') || 'null'));
    console.log('🔍 Current token from localStorage:', localStorage.getItem('token')?.substring(0, 20) + '...');
    
    const response = await apiClient.get('/api/applications', { params: filters });
    console.log('🔍 Raw applications API response:', response);
    console.log('🔍 Applications response.data:', response.data);
    
    // Backend now filters by user automatically, no need for client-side filtering
    return { data: response.data };
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/api/applications/${id}`);
    return response.data;
  },

  create: async (applicationData: { jobId: string; coverLetter?: string }) => {
    console.log('📝 Creating application:', applicationData);
    console.log('👤 Current user:', JSON.parse(localStorage.getItem('user') || 'null'));
    const response = await apiClient.post('/api/applications', applicationData);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/api/applications/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/applications/${id}`);
    return response.data;
  },
};

// Companies API
export const companiesAPI = {
  getAll: async () => {
    const response = await apiClient.get('/api/companies');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/api/companies/${id}`);
    return response.data;
  },

  update: async (id: string, companyData: any) => {
    const response = await apiClient.put(`/api/companies/${id}`, companyData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/companies/${id}`);
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async (filters?: { role?: string; search?: string }) => {
    const response = await apiClient.get('/api/users', { params: filters });
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/api/users/profile');
    return response.data;
  },

  updateProfile: async (profileData: any) => {
    const response = await apiClient.put('/api/users/profile', profileData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/users/${id}`);
    return response.data;
  },
};

// Users API (Admin functions)
export const adminUsersAPI = {
  getAll: async () => {
    const response = await apiClient.get('/api/users');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/api/users/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, isActive: boolean) => {
    const response = await apiClient.patch(`/api/users/${id}/status`, { isActive });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/users/${id}`);
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: async () => {
    const response = await apiClient.get('/api/analytics/dashboard-stats');
    return response.data;
  },

  getRecentActivities: async () => {
    const response = await apiClient.get('/api/analytics/recent-activities');
    return response.data;
  },
};

// Upload API
export const uploadAPI = {
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await apiClient.post('/api/upload/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadCompanyLogo: async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await apiClient.post('/api/upload/company-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Saved Jobs API
export const savedJobsAPI = {
  getAll: async () => {
    console.log('🔍 Calling saved jobs API...');
    console.log('🔍 Current user from localStorage:', JSON.parse(localStorage.getItem('user') || 'null'));
    console.log('🔍 Current token from localStorage:', localStorage.getItem('token')?.substring(0, 20) + '...');
    
    // Add cache busting parameter to prevent 304 responses
    const response = await apiClient.get(`/api/saved-jobs?t=${Date.now()}`);
    console.log('🔍 Raw saved jobs API response:', response);
    
    // Backend now filters by user automatically, no need for client-side filtering
    return response;
  },

  save: async (jobId: string) => {
    console.log('💾 Saving job:', jobId);
    console.log('👤 Current user:', JSON.parse(localStorage.getItem('user') || 'null'));
    const response = await apiClient.post('/api/saved-jobs', { jobId });
    return response.data;
  },

  remove: async (jobId: string) => {
    console.log('🗑️ Removing saved job:', jobId);
    console.log('👤 Current user:', JSON.parse(localStorage.getItem('user') || 'null'));
    const response = await apiClient.delete(`/api/saved-jobs/${jobId}`);
    return response.data;
  },

  checkSaved: async (jobId: string) => {
    const response = await apiClient.get(`/api/saved-jobs/check/${jobId}?t=${Date.now()}`);
    return response.data;
  }
};

// Quick fix user creation
export const fixUser = async () => {
  try {
    console.log('🔧 Calling fix-user API...');
    const response = await apiClient.get('/api/applications/fix-user');
    console.log('✅ Fix user response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fixing user:', error);
    throw error;
  }
};

export default apiClient;
