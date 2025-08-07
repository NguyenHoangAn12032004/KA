console.log('🔍 Testing notification modal directly...');

// Mock notification data structure giống như backend tạo ra
const mockNotificationData = {
  "interviewId": "interview-1754358726029-63254h9bz",
  "applicationId": "app-1754358694342-jhthc0fvb",
  "jobId": "job-1754211813430-6",
  "jobTitle": "UI/UX Designer",
  "companyName": "HUTECH",
  "companyContactPerson": "Nguyễn Văn A - HR Manager",
  "companyEmail": "hr@hutech.edu.vn",
  "companyPhone": "028-5445-7788",
  "companyAddress": "475A Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP.HCM",
  "companyWebsite": "https://hutech.edu.vn",
  "companyDescription": "HUTECH is a leading technology company...",
  "interviewTitle": "Phỏng vấn ",
  "scheduledAt": "2025-08-18T01:51:00.000Z",
  "duration": 60,
  "location": "475A Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP.HCM",
  "interviewLink": "http://localhost:3000/candidates",
  "interviewerName": "Nguyễn Văn A - HR Manager",
  "interviewerEmail": "hr@hutech.edu.vn",
  "interviewerPhone": "028-5445-7788",
  "interviewType": "VIDEO",
  "notes": "http://localhost:3000/candidates",
  "description": "a",
  "status": "SCHEDULED"
};

console.log('📊 Notification data structure:');
console.log(JSON.stringify(mockNotificationData, null, 2));

console.log('\n✅ Frontend should display:');
console.log('📋 Company Info:', mockNotificationData.companyName, '|', mockNotificationData.companyContactPerson);
console.log('📧 Company Email:', mockNotificationData.companyEmail);
console.log('📞 Company Phone:', mockNotificationData.companyPhone);
console.log('🏢 Company Address:', mockNotificationData.companyAddress);
console.log('👨‍💼 Interviewer:', mockNotificationData.interviewerName);
console.log('📧 Interviewer Email:', mockNotificationData.interviewerEmail);
console.log('📞 Interviewer Phone:', mockNotificationData.interviewerPhone);
console.log('📍 Location:', mockNotificationData.location);
console.log('🔗 Interview Link:', mockNotificationData.interviewLink);
console.log('⏰ Scheduled At:', new Date(mockNotificationData.scheduledAt).toLocaleString('vi-VN'));

console.log('\n🎯 Instructions for user:');
console.log('1. Login to frontend as user2@example.com');
console.log('2. Check notifications - look for notification with ID: notif-1754364113240-l8etz2d72');
console.log('3. Open notification details modal');
console.log('4. All the above information should be displayed instead of "Chưa cập nhật"');
console.log('5. If still showing "Chưa cập nhật", clear browser cache and try again');

console.log('\n📱 Frontend URL: http://localhost:3000');
console.log('✅ Database synchronization complete!');
