const { PrismaClient } = require('@prisma/client');
const { io } = require('socket.io-client');

const prisma = new PrismaClient();

async function testRealtimeFeature() {
  try {
    console.log('🔄 Testing Real-time Dashboard Updates...\n');
    
    // Connect to socket
    const socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });
    
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      console.log('🏢 Joining company room...');
      socket.emit('joinCompanyRoom', { companyId: 'comp-1753844622266' });
    });
    
    socket.on('dashboardStatsUpdate', (data) => {
      console.log('📊 Received dashboard stats update:', JSON.stringify(data, null, 2));
    });
    
    socket.on('newApplication', (data) => {
      console.log('📋 New application notification:', JSON.stringify(data, null, 2));
    });
    
    // Wait a bit for socket connection
    setTimeout(async () => {
      console.log('\n🔄 Creating a new application to test real-time updates...');
      
      // Get a job and student to create application
      const job = await prisma.job.findFirst({
        where: { companyId: 'comp-1753844622266' }
      });
      
      const student = await prisma.user.findFirst({
        where: { role: 'STUDENT' },
        include: { studentProfile: true }
      });
      
      if (job && student && student.studentProfile) {
        console.log(`📝 Creating application: ${student.email} -> ${job.title}`);
        
        const newApplication = await prisma.application.create({
          data: {
            jobId: job.id,
            studentId: student.studentProfile.id,
            status: 'PENDING',
            coverLetter: 'This is a test application for real-time feature testing.'
          }
        });
        
        console.log('✅ New application created:', newApplication.id);
        
      } else {
        console.log('❌ No job or student (with profile) found to create test application');
        console.log('Job:', job ? 'found' : 'not found');
        console.log('Student:', student ? 'found' : 'not found');
        console.log('Student Profile:', student?.studentProfile ? 'found' : 'not found');
      }
      
      // Close after 5 seconds
      setTimeout(() => {
        console.log('\n🔚 Test completed. Closing socket connection.');
        socket.disconnect();
        process.exit(0);
      }, 5000);
      
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error testing real-time feature:', error);
  }
}

testRealtimeFeature();
