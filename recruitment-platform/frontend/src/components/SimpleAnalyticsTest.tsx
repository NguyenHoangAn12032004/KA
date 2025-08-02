import React, { useState, useEffect } from 'react';

const SimpleAnalyticsTest: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testApi = async () => {
      try {
        console.log('🔍 Testing analytics API connection...');
        
        // Test dashboard stats
        const dashboardResponse = await fetch('http://localhost:3001/api/analytics/dashboard-stats');
        console.log('📊 Dashboard response:', dashboardResponse);
        
        if (!dashboardResponse.ok) {
          throw new Error(`Dashboard API failed: ${dashboardResponse.status}`);
        }
        
        const dashboardData = await dashboardResponse.json();
        console.log('📊 Dashboard data:', dashboardData);
        
        // Test personal analytics
        const personalResponse = await fetch('http://localhost:3001/api/analytics/personal?userId=963e2591-623c-4701-b5f3-cbda39ecb23a');
        console.log('👤 Personal response:', personalResponse);
        
        if (!personalResponse.ok) {
          throw new Error(`Personal API failed: ${personalResponse.status}`);
        }
        
        const personalData = await personalResponse.json();
        console.log('👤 Personal data:', personalData);
        
        setData({ dashboard: dashboardData, personal: personalData });
        setLoading(false);
        
      } catch (err) {
        console.error('❌ API Test Error:', err);
        setError(String(err));
        setLoading(false);
      }
    };

    testApi();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px' }}>🔄 Testing API connection...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>❌ API Connection Error</h2>
        <p>{error}</p>
        <p>Check console for details</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>✅ Analytics API Test Successful</h1>
      
      <h2>📊 Dashboard Stats</h2>
      <pre>{JSON.stringify(data.dashboard, null, 2)}</pre>
      
      <h2>👤 Personal Analytics</h2>
      <pre>{JSON.stringify(data.personal, null, 2)}</pre>
      
      <h2>🔗 Working Endpoints</h2>
      <ul>
        <li>Dashboard: http://localhost:3001/api/analytics/dashboard-stats</li>
        <li>Personal: http://localhost:3001/api/analytics/personal?userId=963e2591-623c-4701-b5f3-cbda39ecb23a</li>
      </ul>
    </div>
  );
};

export default SimpleAnalyticsTest;
