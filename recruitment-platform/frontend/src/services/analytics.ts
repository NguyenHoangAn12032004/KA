// Analytics tracking utility for the recruitment platform
export const trackAnalyticsEvent = async (
  metric: string, 
  userId?: string, 
  jobId?: string, 
  companyId?: string, 
  value: number = 1, 
  metadata?: any
) => {
  try {
    const response = await fetch('http://localhost:3001/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metric,
        userId,
        jobId,
        companyId,
        value,
        metadata
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`📊 Analytics tracked: ${metric}`, { userId, jobId, companyId, value });
      return true;
    } else {
      console.error('Failed to track analytics:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Error tracking analytics event:', error);
    return false;
  }
};

// Convenience functions for common events
export const trackJobView = (userId: string, jobId: string, companyId: string) => {
  return trackAnalyticsEvent('job_view', userId, jobId, companyId, 1);
};

export const trackJobApplication = (userId: string, jobId: string, companyId: string) => {
  return trackAnalyticsEvent('application_submit', userId, jobId, companyId, 1);
};

export const trackInterview = (userId: string, jobId: string, companyId: string) => {
  return trackAnalyticsEvent('interview', userId, jobId, companyId, 1);
};

export const trackJobSave = (userId: string, jobId: string, companyId: string) => {
  return trackAnalyticsEvent('job_saved', userId, jobId, companyId, 1);
};

// Analytics API service
export const analyticsService = {
  getDashboardStats: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/analytics/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      console.log('📊 Analytics API Dashboard Stats:', result);
      return result;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { success: false, error: String(error) };
    }
  },

  getPersonalAnalytics: async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/analytics/personal`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      console.log('📊 Analytics API Personal Stats:', result);
      return result;
    } catch (error) {
      console.error('Error fetching personal analytics:', error);
      return { success: false, error: String(error) };
    }
  },

  getCompanyPerformance: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/analytics/company/performance', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      console.log('📊 Analytics API Company Performance:', result);
      return result;
    } catch (error) {
      console.error('Error fetching company performance:', error);
      return { success: false, error: String(error) };
    }
  },

  track: trackAnalyticsEvent
};
