const express = require('express');
const cors = require('cors');
const savedJobsRoutes = require('./src/routes/savedJobs.ts');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Test routes
app.use('/api/saved-jobs', savedJobsRoutes.default);

app.get('/test', (req, res) => {
  res.json({ message: 'Test server is running!', timestamp: new Date() });
});

const PORT = 5001;

async function startTestServer() {
  try {
    // Ensure database connection
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🧪 Test server running on http://localhost:${PORT}`);
      console.log(`🔗 Test endpoint: http://localhost:${PORT}/test`);
      console.log(`💾 Saved jobs API: http://localhost:${PORT}/api/saved-jobs`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start test server:', error);
  }
}

startTestServer();
