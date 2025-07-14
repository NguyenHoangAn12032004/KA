import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Typography, Button, Card, CardContent, Alert } from '@mui/material';

const UserDebugPanel: React.FC = () => {
  const { user, token, refreshUserData, clearCacheAndReload } = useAuth();

  const currentUserFromStorage = JSON.parse(localStorage.getItem('user') || 'null');
  const currentTokenFromStorage = localStorage.getItem('token');

  return (
    <Card sx={{ margin: 2, padding: 2 }}>
      <CardContent>
        <Typography variant="h6" color="primary" gutterBottom>
          🔍 User Sync Debug Panel
        </Typography>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          This panel helps debug user data synchronization issues
        </Alert>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" color="text.secondary">
            📊 Current Auth Context User:
          </Typography>
          <Typography variant="body2" component="pre" sx={{ backgroundColor: '#f5f5f5', p: 1, borderRadius: 1 }}>
            {JSON.stringify(user, null, 2)}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" color="text.secondary">
            💾 User from localStorage:
          </Typography>
          <Typography variant="body2" component="pre" sx={{ backgroundColor: '#f5f5f5', p: 1, borderRadius: 1 }}>
            {JSON.stringify(currentUserFromStorage, null, 2)}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" color="text.secondary">
            🔑 Token Info:
          </Typography>
          <Typography variant="body2">
            Context Token: {token ? `${token.substring(0, 20)}...` : 'null'}
          </Typography>
          <Typography variant="body2">
            Storage Token: {currentTokenFromStorage ? `${currentTokenFromStorage.substring(0, 20)}...` : 'null'}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" color="text.secondary">
            ✅ Sync Status:
          </Typography>
          <Typography variant="body2" color={user?.id === currentUserFromStorage?.id ? 'success.main' : 'error.main'}>
            User ID Match: {user?.id === currentUserFromStorage?.id ? '✅ YES' : '❌ NO'}
          </Typography>
          <Typography variant="body2" color={token === currentTokenFromStorage ? 'success.main' : 'error.main'}>
            Token Match: {token === currentTokenFromStorage ? '✅ YES' : '❌ NO'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            onClick={refreshUserData}
            size="small"
          >
            🔄 Refresh User Data
          </Button>
          
          <Button 
            variant="outlined" 
            color="warning"
            onClick={clearCacheAndReload}
            size="small"
          >
            🧹 Clear Cache & Reload
          </Button>

          <Button 
            variant="outlined" 
            color="info"
            onClick={() => {
              console.log('🔍 Current user context:', user);
              console.log('🔍 Current token context:', token);
              console.log('🔍 LocalStorage user:', currentUserFromStorage);
              console.log('🔍 LocalStorage token:', currentTokenFromStorage);
            }}
            size="small"
          >
            📝 Log to Console
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserDebugPanel;
