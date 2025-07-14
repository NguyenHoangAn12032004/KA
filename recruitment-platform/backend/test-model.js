const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSavedJobModel() {
  try {
    console.log('🧪 Testing SavedJob model...');
    
    // Check available models
    console.log('📋 Available models:', Object.keys(prisma));
    
    // Try to access savedJob
    if (prisma.savedJob) {
      console.log('✅ savedJob model is available');
      
      // Test count operation
      const count = await prisma.savedJob.count();
      console.log('📊 SavedJob count:', count);
    } else {
      console.log('❌ savedJob model not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSavedJobModel();
