const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function setupAnalyticsTriggers() {
  try {
    console.log('🔧 Setting up analytics triggers and procedures...');
    
    // Read the SQL file
    const sqlContent = fs.readFileSync(path.join(__dirname, 'setup-analytics-triggers.sql'), 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          console.log(`Executing: ${statement.substring(0, 50)}...`);
          await prisma.$executeRawUnsafe(statement);
        } catch (error) {
          console.error('Error executing statement:', statement.substring(0, 100));
          console.error('Error:', error.message);
        }
      }
    }
    
    console.log('✅ Analytics triggers and procedures setup completed!');
    
    // Test the analytics tracking
    console.log('🧪 Testing analytics functions...');
    
    // Test tracking a job view
    await prisma.$executeRaw`
      SELECT track_analytics_event('job_view', null, 'test-job-id', 'test-company-id', 1)
    `;
    
    // Check if it was created
    const testRecord = await prisma.analytics.findFirst({
      where: {
        metric: 'job_view',
        jobId: 'test-job-id'
      }
    });
    
    if (testRecord) {
      console.log('✅ Analytics tracking test successful!');
      console.log('Test record:', testRecord);
    } else {
      console.log('❌ Analytics tracking test failed - no record found');
    }
    
  } catch (error) {
    console.error('❌ Error setting up analytics triggers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAnalyticsTriggers();
