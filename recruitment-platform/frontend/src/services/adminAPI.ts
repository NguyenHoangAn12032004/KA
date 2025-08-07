import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance for admin API calls
const adminAxios = axios.create({
  baseURL: `${API_BASE_URL}/api/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
adminAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
adminAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface AdminDashboardData {
  analytics: {
    userStats: {
      totalUsers: number;
      verifiedUsers: number;
      activeUsersToday: number;
      newUsersThisWeek: number;
    };
    interactionStats: {
      totalApplications: number;
      activeJobs: number;
      totalCompanies: number;
      verifiedCompanies: number;
    };
    systemHealth: {
      serverStatus: string;
      databaseStatus: string;
      uptime: number;
    };
    recommendations: string[];
  };
  insights: {
    actionableInsights: string[];
    trends: any[];
    alerts: any[];
  };
  realtimeMetrics: {
    activeUsers: number;
    todayApplications: number;
    todayRegistrations: number;
    systemLoad: number;
  };
  timestamp: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'COMPANY' | 'ADMIN' | 'HR_MANAGER';
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  profile?: any;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  industry?: string;
  size?: string;
  isVerified: boolean;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  status?: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  jobsCount: number;
  website?: string;
  phone?: string;
  address?: string;
  description?: string;
  verificationDate?: string;
  verificationReason?: string;
}

export interface Job {
  id: string;
  title: string;
  companyId: string;
  company: {
    name: string;
  };
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'SUSPENDED';
  createdAt: string;
  applicationsCount: number;
  isActive: boolean;
}

export interface AdminUserAction {
  action: 'SUSPEND' | 'ACTIVATE' | 'VERIFY' | 'DELETE' | 'PROMOTE' | 'DEMOTE' | 'IMPERSONATE';
  reason?: string;
  data?: any;
}

export interface BroadcastMessage {
  type: 'INFO' | 'WARNING' | 'URGENT' | 'MAINTENANCE';
  title: string;
  message: string;
  targetRole?: 'STUDENT' | 'COMPANY' | 'ALL';
  expiresAt?: string;
}

class AdminAPI {
  // Dashboard
  async getDashboard(): Promise<AxiosResponse<AdminDashboardData>> {
    return adminAxios.get('/dashboard');
  }

  async getSystemStatus(): Promise<AxiosResponse<any>> {
    return adminAxios.get('/system-status');
  }

  // User Management
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    verified?: boolean;
  }): Promise<AxiosResponse<{ users: User[]; total: number; pages: number }>> {
    return adminAxios.get('/users', { params });
  }

  async getUserDetails(userId: string): Promise<AxiosResponse<User>> {
    return adminAxios.get(`/users/${userId}`);
  }

  async manageUser(userId: string, action: AdminUserAction): Promise<AxiosResponse<any>> {
    return adminAxios.post(`/users/${userId}/manage`, action);
  }

  async impersonateUser(userId: string): Promise<AxiosResponse<{ token: string }>> {
    return adminAxios.post(`/users/${userId}/impersonate`);
  }

  async stopImpersonation(): Promise<AxiosResponse<{ token: string }>> {
    return adminAxios.post('/users/stop-impersonation');
  }

  // Company Management
  async getCompanies(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<AxiosResponse<{ companies: Company[]; total: number; pages: number }>> {
    return adminAxios.get('/companies', { params });
  }

  async verifyCompany(companyId: string, data: {
    status: 'VERIFIED' | 'REJECTED';
    reason?: string;
  }): Promise<AxiosResponse<any>> {
    return adminAxios.post(`/companies/${companyId}/verify`, data);
  }

  async getCompanyDetails(companyId: string): Promise<AxiosResponse<Company>> {
    return adminAxios.get(`/companies/${companyId}`);
  }

  // Job Management
  async getJobs(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    companyId?: string;
  }): Promise<AxiosResponse<{ jobs: Job[]; total: number; pages: number }>> {
    return adminAxios.get('/jobs', { params });
  }

  async moderateJob(jobId: string, action: {
    action: 'APPROVE' | 'SUSPEND' | 'REJECT';
    reason?: string;
  }): Promise<AxiosResponse<any>> {
    return adminAxios.post(`/jobs/${jobId}/moderate`, action);
  }

  async getJobDetails(jobId: string): Promise<AxiosResponse<Job>> {
    return adminAxios.get(`/jobs/${jobId}`);
  }

  // Analytics & Reports
  async getAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    type?: 'users' | 'jobs' | 'applications' | 'companies';
  }): Promise<AxiosResponse<any>> {
    return adminAxios.get('/analytics', { params });
  }

  async generateReport(type: string, params?: any): Promise<AxiosResponse<any>> {
    return adminAxios.post('/reports/generate', { type, params });
  }

  async exportData(params: {
    type: 'users' | 'companies' | 'jobs' | 'applications';
    format: 'csv' | 'excel' | 'json';
    filters?: any;
  }): Promise<AxiosResponse<Blob>> {
    return adminAxios.post('/export', params, {
      responseType: 'blob',
    });
  }

  // Broadcasting & Communication
  async broadcastMessage(message: BroadcastMessage): Promise<AxiosResponse<any>> {
    return adminAxios.post('/broadcast', message);
  }

  async getActiveAnnouncements(): Promise<AxiosResponse<any[]>> {
    return adminAxios.get('/announcements');
  }

  async createAnnouncement(announcement: {
    title: string;
    content: string;
    type: 'INFO' | 'WARNING' | 'URGENT';
    targetRole?: string;
    expiresAt?: string;
  }): Promise<AxiosResponse<any>> {
    return adminAxios.post('/announcements', announcement);
  }

  async deleteAnnouncement(announcementId: string): Promise<AxiosResponse<any>> {
    return adminAxios.delete(`/announcements/${announcementId}`);
  }

  // Audit & Logs
  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AxiosResponse<any>> {
    return adminAxios.get('/audit-logs', { params });
  }

  async getSystemLogs(params?: {
    level?: 'error' | 'warn' | 'info' | 'debug';
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<AxiosResponse<any>> {
    return adminAxios.get('/system-logs', { params });
  }

  // Real-time Management
  async getActiveConnections(): Promise<AxiosResponse<any>> {
    return adminAxios.get('/realtime/connections');
  }

  async sendRealtimeMessage(data: {
    userId?: string;
    role?: string;
    message: any;
    event: string;
  }): Promise<AxiosResponse<any>> {
    return adminAxios.post('/realtime/send', data);
  }

  // System Configuration
  async getSystemConfig(): Promise<AxiosResponse<any>> {
    return adminAxios.get('/config');
  }

  async updateSystemConfig(config: any): Promise<AxiosResponse<any>> {
    return adminAxios.put('/config', config);
  }

  async clearCache(cacheType?: string): Promise<AxiosResponse<any>> {
    return adminAxios.post('/cache/clear', { type: cacheType });
  }

  async restartService(serviceName: string): Promise<AxiosResponse<any>> {
    return adminAxios.post('/services/restart', { service: serviceName });
  }

  // Backup & Maintenance
  async createBackup(options?: {
    type: 'full' | 'data' | 'config';
    compression?: boolean;
  }): Promise<AxiosResponse<any>> {
    return adminAxios.post('/backup', options);
  }

  async getBackups(): Promise<AxiosResponse<any[]>> {
    return adminAxios.get('/backups');
  }

  async restoreBackup(backupId: string): Promise<AxiosResponse<any>> {
    return adminAxios.post(`/backup/${backupId}/restore`);
  }

  async scheduleMaintenanceMode(data: {
    startTime: string;
    duration: number;
    message?: string;
  }): Promise<AxiosResponse<any>> {
    return adminAxios.post('/maintenance/schedule', data);
  }

  async enableMaintenanceMode(message?: string): Promise<AxiosResponse<any>> {
    return adminAxios.post('/maintenance/enable', { message });
  }

  async disableMaintenanceMode(): Promise<AxiosResponse<any>> {
    return adminAxios.post('/maintenance/disable');
  }
}

export const adminAPI = new AdminAPI();
export default adminAPI;
