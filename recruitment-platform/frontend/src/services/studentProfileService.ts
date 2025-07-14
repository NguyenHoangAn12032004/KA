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
        console.log('🔑 Adding token to student profile request:', cleanToken.substring(0, 20) + '...');
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

export interface StudentProfileData {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  university?: string;
  major?: string;
  graduationYear?: number;
  gpa?: number;
  skills: string[];
  portfolio?: string;
  linkedin?: string;
  github?: string;
  resume?: string;
  avatar?: string;
  summary?: string;
  address?: string;
  education: Education[];
  workExperience: Experience[];
  projects: Project[];
  languages: Language[];
  certifications: Certification[];
  preferredJobTypes?: string[];
  preferredWorkModes?: string[];
  preferredLocations?: string[];
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
}

export interface Education {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  gpa?: number;
  achievements?: string[];
}

export interface Experience {
  id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  skills?: string[];
  achievements?: string[];
}

export interface Project {
  id?: string;
  title: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
  current: boolean;
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
}

export interface Language {
  id?: string;
  name: string;
  proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'NATIVE';
  certification?: string;
}

export interface Certification {
  id?: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

class StudentProfileService {
  // Get current user's profile
  async getProfile(): Promise<{ success: boolean; data: StudentProfileData; message?: string }> {
    try {
      const response = await apiClient.get('/api/users/profile');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  }

  // Update current user's profile
  async updateProfile(profileData: Partial<StudentProfileData>): Promise<{ success: boolean; data: StudentProfileData; message?: string }> {
    try {
      const response = await apiClient.put('/api/users/profile', profileData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }

  // Upload avatar/profile image
  async uploadAvatar(file: File): Promise<{ success: boolean; url: string; message?: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await apiClient.post('/api/users/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload avatar');
    }
  }

  // Upload resume
  async uploadResume(file: File): Promise<{ success: boolean; url: string; message?: string }> {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await apiClient.post('/api/users/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload resume');
    }
  }

  // Get public profile by ID (for viewing other students)
  async getPublicProfile(userId: string): Promise<{ success: boolean; data: StudentProfileData; message?: string }> {
    try {
      const response = await apiClient.get(`/api/users/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch public profile');
    }
  }

  // Calculate profile completion percentage
  calculateProfileCompletion(profile: StudentProfileData): number {
    const fields = [
      profile.firstName,
      profile.lastName,
      profile.email,
      profile.phone,
      profile.university,
      profile.major,
      profile.graduationYear,
      profile.gpa,
      profile.skills?.length,
      profile.summary,
      profile.avatar,
      profile.resume,
      profile.education?.length,
      profile.workExperience?.length,
      profile.projects?.length,
    ];

    const completedFields = fields.filter(field => {
      if (typeof field === 'number') return field > 0;
      if (Array.isArray(field)) return field.length > 0;
      return Boolean(field);
    }).length;

    return Math.round((completedFields / fields.length) * 100);
  }

  // ===== EDUCATION CRUD METHODS =====

  async addEducation(userId: string, education: Omit<Education, 'id'>): Promise<Education> {
    try {
      const response = await apiClient.post(`/api/users/${userId}/education`, education);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add education');
    }
  }

  async updateEducation(userId: string, educationId: string, education: Partial<Education>): Promise<Education> {
    try {
      const response = await apiClient.put(`/api/users/${userId}/education/${educationId}`, education);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update education');
    }
  }

  async deleteEducation(userId: string, educationId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/users/${userId}/education/${educationId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete education');
    }
  }

  // ===== EXPERIENCE CRUD METHODS =====

  async addExperience(userId: string, experience: Omit<Experience, 'id'>): Promise<Experience> {
    try {
      const response = await apiClient.post(`/api/users/${userId}/experience`, experience);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add experience');
    }
  }

  async updateExperience(userId: string, experienceId: string, experience: Partial<Experience>): Promise<Experience> {
    try {
      const response = await apiClient.put(`/api/users/${userId}/experience/${experienceId}`, experience);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update experience');
    }
  }

  async deleteExperience(userId: string, experienceId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/users/${userId}/experience/${experienceId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete experience');
    }
  }

  // ===== PROJECTS CRUD METHODS =====

  async addProject(userId: string, project: Omit<Project, 'id'>): Promise<Project> {
    try {
      const response = await apiClient.post(`/api/users/${userId}/projects`, project);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add project');
    }
  }

  async updateProject(userId: string, projectId: string, project: Partial<Project>): Promise<Project> {
    try {
      const response = await apiClient.put(`/api/users/${userId}/projects/${projectId}`, project);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update project');
    }
  }

  async deleteProject(userId: string, projectId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/users/${userId}/projects/${projectId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete project');
    }
  }

  // ===== LANGUAGES CRUD METHODS =====

  async addLanguage(userId: string, language: Omit<Language, 'id'>): Promise<Language> {
    try {
      const response = await apiClient.post(`/api/users/${userId}/languages`, language);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add language');
    }
  }

  async updateLanguage(userId: string, languageId: string, language: Partial<Language>): Promise<Language> {
    try {
      const response = await apiClient.put(`/api/users/${userId}/languages/${languageId}`, language);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update language');
    }
  }

  async deleteLanguage(userId: string, languageId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/users/${userId}/languages/${languageId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete language');
    }
  }

  // ===== CERTIFICATIONS CRUD METHODS =====

  async addCertification(userId: string, certification: Omit<Certification, 'id'>): Promise<Certification> {
    try {
      const response = await apiClient.post(`/api/users/${userId}/certifications`, certification);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add certification');
    }
  }

  async updateCertification(userId: string, certificationId: string, certification: Partial<Certification>): Promise<Certification> {
    try {
      const response = await apiClient.put(`/api/users/${userId}/certifications/${certificationId}`, certification);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update certification');
    }
  }

  async deleteCertification(userId: string, certificationId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/users/${userId}/certifications/${certificationId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete certification');
    }
  }
}

export default new StudentProfileService();
