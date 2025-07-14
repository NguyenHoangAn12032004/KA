const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Test saved jobs routes
const router = express.Router();

// Get saved jobs for a user
router.get('/', async (req, res) => {
  try {
    const userId = '550e8400-e29b-41d4-a716-446655440000'; // Test user ID for now
    
    console.log('🔍 Getting saved jobs for user:', userId);
    
    const savedJobs = await prisma.savedJob.findMany({
      where: {
        userId: userId
      },
      include: {
        job: {
          include: {
            company_profiles: {
              select: {
                companyName: true,
                logo: true,
                city: true,
                industry: true
              }
            }
          }
        }
      },
      orderBy: {
        savedAt: 'desc'
      }
    });

    console.log('✅ Found saved jobs:', savedJobs.length);
    res.json({ success: true, data: savedJobs });
  } catch (error) {
    console.error('❌ Error getting saved jobs:', error);
    res.status(500).json({ error: 'Failed to get saved jobs', details: String(error) });
  }
});

// Save a job
router.post('/', async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = '550e8400-e29b-41d4-a716-446655440000'; // Test user ID for now
    
    console.log('💾 Saving job:', { jobId, userId });
    
    // Check if already saved
    const existingSave = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: userId,
          jobId: jobId
        }
      }
    });
    
    if (existingSave) {
      return res.status(400).json({ error: 'Job already saved' });
    }
    
    const savedJob = await prisma.savedJob.create({
      data: {
        userId: userId,
        jobId: jobId
      },
      include: {
        job: {
          include: {
            company_profiles: {
              select: {
                companyName: true,
                logo: true,
                city: true,
                industry: true
              }
            }
          }
        }
      }
    });

    console.log('✅ Job saved successfully:', savedJob.id);
    res.status(201).json({ success: true, data: savedJob });
  } catch (error) {
    console.error('❌ Error saving job:', error);
    res.status(500).json({ error: 'Failed to save job', details: String(error) });
  }
});

// Remove saved job
router.delete('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = '550e8400-e29b-41d4-a716-446655440000'; // Test user ID for now
    
    console.log('🗑️ Removing saved job:', { jobId, userId });
    
    const deletedSave = await prisma.savedJob.delete({
      where: {
        userId_jobId: {
          userId: userId,
          jobId: jobId
        }
      }
    });

    console.log('✅ Saved job removed successfully');
    res.json({ success: true, message: 'Job removed from saved list' });
  } catch (error) {
    console.error('❌ Error removing saved job:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Saved job not found' });
    }
    res.status(500).json({ error: 'Failed to remove saved job', details: String(error) });
  }
});

// Check if job is saved
router.get('/check/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = '550e8400-e29b-41d4-a716-446655440000'; // Test user ID for now
    
    const savedJob = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: userId,
          jobId: jobId
        }
      }
    });

    res.json({ success: true, isSaved: !!savedJob });
  } catch (error) {
    console.error('❌ Error checking saved job:', error);
    res.status(500).json({ error: 'Failed to check saved job', details: String(error) });
  }
});

app.use('/api/saved-jobs', router);

app.get('/test', (req, res) => {
  res.json({ message: 'Test server running!', timestamp: new Date().toISOString() });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🧪 Test server running on port ${PORT}`);
  console.log(`🔗 Test saved jobs at: http://localhost:${PORT}/api/saved-jobs`);
});

module.exports = app;
