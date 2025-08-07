const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateExistingNotifications() {
  try {
    console.log('🔄 Updating existing interview notifications with detailed data...');
    
    // Get all INTERVIEW_SCHEDULED notifications
    const notifications = await prisma.notifications.findMany({
      where: { 
        type: 'INTERVIEW_SCHEDULED'
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Found ${notifications.length} interview notifications to update`);
    
    for (let i = 0; i < notifications.length; i++) {
      const notif = notifications[i];
      const currentData = notif.data || {};
      
      // Sample detailed data for each notification
      const detailedData = {
        ...currentData,
        location: i % 2 === 0 
          ? 'Tầng 15, Toà nhà Vincom Center, 72 Lê Thánh Tôn, Quận 1, TP.HCM'
          : 'Văn phòng StartupXYZ, 123 Nguyễn Huệ, Quận 1, TP.HCM',
        interviewLink: i % 2 === 0 
          ? 'https://meet.google.com/abc-defg-hij'
          : null,
        interviewerName: i % 2 === 0 
          ? 'Nguyễn Văn An'
          : 'Trần Thị Bích',
        interviewerEmail: i % 2 === 0 
          ? 'nguyen.van.an@techcorp.vn'
          : 'tran.thi.bich@startupxyz.com',
        interviewerPhone: i % 2 === 0 
          ? '+84 901 234 567'
          : '+84 987 654 321',
        meetingId: i % 2 === 0 
          ? 'MEET-001-2025'
          : null,
        interviewType: i % 2 === 0 ? 'online' : 'offline',
        notes: i % 2 === 0 
          ? 'Vui lòng chuẩn bị laptop và kiểm tra kết nối internet trước 15 phút. Phỏng vấn sẽ bao gồm: 1) Giới thiệu bản thân (10 phút), 2) Thảo luận kinh nghiệm kỹ thuật (30 phút), 3) Live coding exercise (20 phút), 4) Q&A (10 phút).'
          : 'Vui lòng mang theo CV in, chứng minh thư và đến sớm 10 phút. Địa điểm: Phòng họp A, tầng 3. Phỏng vấn sẽ kéo dài khoảng 45-60 phút.',
        companyName: i % 2 === 0 ? 'TechCorp Vietnam' : 'StartupXYZ'
      };
      
      await prisma.notifications.update({
        where: { id: notif.id },
        data: { data: detailedData }
      });
      
      console.log(`✅ Updated notification ${i + 1}: ${notif.id}`);
    }
    
    console.log('\n📋 Updated notifications:');
    const updatedNotifications = await prisma.notifications.findMany({
      where: { 
        type: 'INTERVIEW_SCHEDULED'
      },
      orderBy: { createdAt: 'desc' }
    });
    
    updatedNotifications.forEach((notif, index) => {
      console.log(`\n${index + 1}. ${notif.title}`);
      console.log(`   ID: ${notif.id}`);
      const data = notif.data || {};
      console.log(`   - Job: ${data.jobTitle || 'N/A'}`);
      console.log(`   - Company: ${data.companyName || 'N/A'}`);
      console.log(`   - Type: ${data.interviewType || 'N/A'}`);
      console.log(`   - Location: ${data.location || 'N/A'}`);
      console.log(`   - Link: ${data.interviewLink || 'N/A'}`);
      console.log(`   - Interviewer: ${data.interviewerName || 'N/A'}`);
      console.log(`   - Email: ${data.interviewerEmail || 'N/A'}`);
      console.log(`   - Phone: ${data.interviewerPhone || 'N/A'}`);
      console.log(`   - Meeting ID: ${data.meetingId || 'N/A'}`);
      console.log(`   - Notes: ${data.notes ? data.notes.substring(0, 80) + '...' : 'N/A'}`);
    });
    
    console.log('\n🎉 All notifications updated successfully!');
    console.log('\n💡 Now test the frontend:');
    console.log('1. Refresh the notifications page');
    console.log('2. Click on an interview notification');
    console.log('3. Check if all detailed information is displayed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingNotifications();
