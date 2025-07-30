import axios from 'axios';
import { API_URL } from '../../config';

// Enhanced company interface matching backend
export interface EnhancedCompany {
  id: string;
  companyName: string;
  logoUrl?: string;
  industry?: string;
  companySize?: string;
  location: string;
  description?: string;
  website?: string;
  foundedYear?: number;
  rating?: number;
  totalJobs?: number;
  activeJobs?: number;
  isVerified?: boolean;
  isFeatured?: boolean;
  followers?: number;
  viewCount?: number;
  lastJobPosted?: string;
  socialLinks?: {
    linkedin?: string;
    facebook?: string;
    website?: string;
    twitter?: string;
  };
  tags?: string[];
  benefits?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CompaniesFilters {
  search?: string;
  industry?: string[];
  size?: string[];
  location?: string[];
  verified?: boolean;
  featured?: boolean;
  hasJobs?: boolean;
  sortBy?: 'newest' | 'name' | 'rating' | 'jobs' | 'oldest';
  page?: number;
  limit?: number;
  includeStats?: boolean;
}

export interface CompaniesResponse {
  success: boolean;
  data: {
    companies: EnhancedCompany[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    stats?: {
      totalCompanies: number;
      verifiedCompanies: number;
      companiesWithJobs: number;
      verificationRate: number;
      topIndustries: Array<{
        industry: string;
        count: number;
      }>;
    };
    filters: {
      industries: string[];
      sizes: string[];
      locations: string[];
    };
  };
}

export interface CompanyDetailResponse {
  success: boolean;
  data: {
    company: EnhancedCompany & {
      jobs?: any[];
      stats?: {
        jobStats: {
          totalJobs: number;
          activeJobs: number;
          totalApplications: number;
          totalViews: number;
          averageApplicationsPerJob: number;
        };
        viewStats: {
          total: number;
          last7Days: number;
          last30Days: number;
        };
        applicationStats: {
          total: number;
          byStatus: Record<string, number>;
        };
      };
    };
  };
}

const companiesAPI = {
  // Enhanced get all companies with filtering and pagination
  getAll: async (filters: CompaniesFilters = {}): Promise<CompaniesResponse> => {
    const params = new URLSearchParams();
    
    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await axios.get(`${API_URL}/api/companies?${params.toString()}`);
    return response.data;
  },

  // Get detailed company information
  getById: async (
    id: string, 
    options: { includeJobs?: boolean; includeStats?: boolean } = {}
  ): Promise<CompanyDetailResponse> => {
    const params = new URLSearchParams();
    if (options.includeJobs !== undefined) {
      params.append('includeJobs', options.includeJobs.toString());
    }
    if (options.includeStats !== undefined) {
      params.append('includeStats', options.includeStats.toString());
    }

    const response = await axios.get(`${API_URL}/api/companies/${id}?${params.toString()}`);
    return response.data;
  },

  // Follow/unfollow company
  toggleFollow: async (companyId: string): Promise<{
    success: boolean;
    data: {
      following: boolean;
      message: string;
    };
  }> => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/api/companies/${companyId}/follow`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  // Track company view
  trackView: async (
    companyId: string, 
    viewData: {
      userId?: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<{
    success: boolean;
    data: {
      message: string;
    };
  }> => {
    const response = await axios.post(`${API_URL}/api/companies/${companyId}/view`, {
      userId: viewData.userId,
      ipAddress: viewData.ipAddress || 'unknown',
      userAgent: viewData.userAgent || navigator.userAgent
    });
    return response.data;
  },

  // Get companies overview statistics (Admin only)
  getStats: async (): Promise<{
    success: boolean;
    data: {
      stats: {
        totalCompanies: number;
        verifiedCompanies: number;
        companiesWithJobs: number;
        verificationRate: number;
        topIndustries: Array<{
          industry: string;
          count: number;
        }>;
      };
    };
  }> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/companies/stats/overview`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Legacy methods (kept for backward compatibility)
  getProfile: async () => {
    const response = await axios.get(`${API_URL}/api/companies/profile`);
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await axios.put(`${API_URL}/api/companies/profile`, data);
    return response.data;
  },

  getJobs: async (companyId: string) => {
    const response = await axios.get(`${API_URL}/api/companies/${companyId}/jobs`);
    return response.data;
  },

  // Real-time helper methods
  getFiltersOptions: async (): Promise<{
    industries: string[];
    sizes: string[];
    locations: string[];
  }> => {
    const response = await companiesAPI.getAll({ page: 1, limit: 1, includeStats: false });
    return response.data.filters;
  },

  // Utility methods for frontend
  buildFiltersFromQuery: (searchParams: URLSearchParams): CompaniesFilters => {
    const filters: CompaniesFilters = {};
    
    const search = searchParams.get('search');
    if (search) filters.search = search;
    
    const industry = searchParams.getAll('industry');
    if (industry.length) filters.industry = industry;
    
    const size = searchParams.getAll('size');
    if (size.length) filters.size = size;
    
    const location = searchParams.getAll('location');
    if (location.length) filters.location = location;
    
    const verified = searchParams.get('verified');
    if (verified) filters.verified = verified === 'true';
    
    const featured = searchParams.get('featured');
    if (featured) filters.featured = featured === 'true';
    
    const hasJobs = searchParams.get('hasJobs');
    if (hasJobs) filters.hasJobs = hasJobs === 'true';
    
    const sortBy = searchParams.get('sortBy') as CompaniesFilters['sortBy'];
    if (sortBy) filters.sortBy = sortBy;
    
    const page = searchParams.get('page');
    if (page) filters.page = parseInt(page);
    
    const limit = searchParams.get('limit');
    if (limit) filters.limit = parseInt(limit);
    
    return filters;
  }
};

export { companiesAPI };
export default companiesAPI; 