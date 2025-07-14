import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Typography, Button, Card, CardContent, Alert, Divider } from '@mui/material';

const UserSyncFixer: React.FC = () => {
  const { logout, clearCacheAndReload } = useAuth();

  const fixUserSync = () => {
    console.log('🔧 FIXING USER DATA SYNC...');
    
    // Clear existing data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Set correct Nguyen Van An data
    const correctUserData = {
      id: 'nguyen-van-an-001',
      email: 'nguyenvanan@example.com',
      role: 'STUDENT',
      studentProfile: {
        firstName: 'An',
        lastName: 'Nguyen Van',
        university: 'Hanoi University of Science and Technology',
        major: 'Computer Science',
        graduationYear: 2024,
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'Docker'],
        gpa: '3.7/4.0'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const correctToken = `nguyen-van-an-token-${Date.now()}`;

    localStorage.setItem('user', JSON.stringify(correctUserData));
    localStorage.setItem('token', correctToken);
    
    console.log('✅ User data fixed! Reloading page...');
    
    // Reload the page to apply changes
    window.location.reload();
  };

  const forceLogout = () => {
    console.log('🚪 Forcing logout and clearing all data...');
    logout();
  };

  return (
    <Card sx={{ margin: 2, padding: 2, backgroundColor: '#fff3cd' }}>
      <CardContent>
        <Typography variant="h6" color="warning.main" gutterBottom>
          🔧 User Data Sync Fixer
        </Typography>
        
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>Issue Detected:</strong> You're seeing data from another user (test account) instead of your own data (An Nguyen Van). 
          This happens when user sessions get mixed up.
        </Alert>

        <Typography variant="body2" sx={{ mb: 2 }}>
          <strong>Expected Behavior:</strong>
          <br />• You should see data for "An Nguyen Van" 
          <br />• Your applications and saved jobs should be your own
          <br />• User ID should be "nguyen-van-an-001"
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Choose a fix method:
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={fixUserSync}
            sx={{ justifyContent: 'flex-start' }}
          >
            🔧 Quick Fix: Set Correct User Data
          </Button>
          
          <Button 
            variant="outlined" 
            color="warning"
            onClick={forceLogout}
            sx={{ justifyContent: 'flex-start' }}
          >
            🚪 Force Logout (Login Again Manually)
          </Button>

          <Button 
            variant="outlined" 
            color="info"
            onClick={clearCacheAndReload}
            sx={{ justifyContent: 'flex-start' }}
          >
            🧹 Clear All Cache & Reload
          </Button>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="caption">
            <strong>Manual Login Credentials:</strong><br />
            Email: nguyenvanan@example.com<br />
            Password: password123
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default UserSyncFixer;
