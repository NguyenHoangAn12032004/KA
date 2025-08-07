import axios from 'axios';
import { API_URL } from '../../config';

export interface AdminCompany {
  id: string;
  name: string;
  email: string;
  industry?: string;
  size?: string;
  isVerified: boolean;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  jobsCount: number;
  website?: string;
  phone?: string;
  address?: string;
  description?: string;
  verificationDate?: string;
  verificationReason?: string;
}

export interface AdminCompaniesResponse {
  success: boolean;
  data: {
    companies: AdminCompany[];
    total: number;
    pages: number;
  };
}

export interface AdminFilters {
  verified?: string;
  industry?: string;
  size?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const adminAPI = {
  // Get all companies with admin view
  getCompanies: async (filters: AdminFilters = {}): Promise<AdminCompaniesResponse> => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    
    // Add cache-busting parameter
    params.append('_t', Date.now().toString());
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await axios.get(`${API_URL}/api/admin/companies?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    console.log('🔥 Admin companies API response:', response.data);
    console.log('🔥 Response structure:', {
      success: response.data.success,
      dataExists: !!response.data.data,
      companiesExists: !!response.data.data?.companies,
      companiesLength: response.data.data?.companies?.length || 0
    });
    
    return response.data;
  },

  // Get company details by ID
  getCompanyById: async (id: string): Promise<{
    success: boolean;
    data: AdminCompany;
  }> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/admin/companies/${id}?_t=${Date.now()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    return response.data;
  },

  // Get company details (alias for getCompanyById)
  getCompanyDetails: async (id: string): Promise<{
    success: boolean;
    data: AdminCompany;
  }> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/admin/companies/${id}?_t=${Date.now()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    return response.data;
  },

  // Verify/unverify company
  verifyCompany: async (id: string, data: { status: 'VERIFIED' | 'REJECTED'; reason?: string }): Promise<{
    success: boolean;
    data: AdminCompany;
    message: string;
  }> => {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`${API_URL}/api/admin/companies/${id}/verify`, {
      status: data.status,
      reason: data.reason
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Activate/suspend company
  updateCompanyStatus: async (id: string, isActive: boolean): Promise<{
    success: boolean;
    data: AdminCompany;
    message: string;
  }> => {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`${API_URL}/api/admin/companies/${id}/status`, {
      isActive
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  }
};

export default adminAPI;
