const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running on port 3001' });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    data: {
      profile: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        profile_completion: 38,
        total_projects: 1,
        total_skills: 2,
        skills: ['JavaScript', 'React'],
        projects: [{ name: 'Test Project' }],
        github: 'https://github.com/testuser',
        linkedin: 'https://linkedin.com/in/testuser',
        portfolio: ''
      }
    }
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 