import axios from 'axios';
import { API_URL } from '../../config';

const companiesAPI = {
  getAll: async () => {
    const response = await axios.get(`${API_URL}/api/companies`);
    return response.data;
  },

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
  }
};

export default companiesAPI; 