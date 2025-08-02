import React, { useState } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

const DebugAnalytics: React.FC = () => {
  const [apiResult, setApiResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    setApiResult('Testing...');
    
    try {
      console.log('🔍 Testing API connection...');
      
      const response = await fetch('http://localhost:3001/api/analytics/dashboard-stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      const data = await response.json();
      console.log('📊 Response data:', data);
      
      setApiResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('❌ Error:', error);
      setApiResult(`Error: ${String(error)}`);
    }
    
    setLoading(false);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        🐛 Debug Analytics API
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={testApi} 
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? '⏳ Testing...' : '🧪 Test API'}
      </Button>
      
      <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <Typography variant="h6">API Response:</Typography>
        <pre style={{ whiteSpace: 'pre-wrap' }}>
          {apiResult || 'Click "Test API" to check connection'}
        </pre>
      </Paper>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">
          🔍 Debug Steps:
          <br />1. Click "Test API" button
          <br />2. Check browser console (F12)
          <br />3. Look at API response above
          <br />4. API endpoint: http://localhost:3001/api/analytics/dashboard-stats
        </Typography>
      </Box>
    </Box>
  );
};

export default DebugAnalytics;
