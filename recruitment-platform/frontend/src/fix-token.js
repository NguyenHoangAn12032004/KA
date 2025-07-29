// Script để cập nhật token trong localStorage
// Chạy script này trong console của trình duyệt

(function() {
  console.log('🔍 Kiểm tra token hiện tại...');
  const currentToken = localStorage.getItem('token');
  const currentUser = localStorage.getItem('user');
  
  console.log('🔑 Token hiện tại:', currentToken);
  console.log('👤 User hiện tại:', currentUser);
  
  // Token mới từ backend
  const newToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhjYWM4NmI3LTRiMmItNDA2Yi1hZjM0LTQxNTkyOGZlODdhZCIsImVtYWlsIjoiY29tcGFueUBleGFtcGxlLmNvbSIsInJvbGUiOiJDT01QQU5ZIiwiaWF0IjoxNzUzMTg2NTcxLCJleHAiOjE3NTMxOTAxNzF9.YT029B3JTN_0ZDw2jXZcZAx49IwI98CG8TYg5k4YmQ8';
  
  // Cập nhật token
  localStorage.setItem('token', newToken);
  console.log('✅ Đã cập nhật token mới');
  
  // Kiểm tra user
  if (!currentUser || currentUser === 'null' || currentUser === '{}') {
    console.log('⚠️ Không tìm thấy thông tin user, đang tạo mới...');
    
    const newUser = {
      id: '8cac86b7-4b2b-406b-af34-415928fe87ad',
      email: 'company@example.com',
      role: 'COMPANY',
      companyProfile: {
        id: 'comp-1753155661984',
        companyName: 'HUTECH'
      }
    };
    
    localStorage.setItem('user', JSON.stringify(newUser));
    console.log('✅ Đã cập nhật thông tin user mới');
  }
  
  console.log('🔄 Làm mới trang để áp dụng thay đổi...');
  console.log('👉 Sau khi làm mới, hãy kiểm tra lại token và user bằng lệnh:');
  console.log('console.log("Token:", localStorage.getItem("token"))');
  console.log('console.log("User:", JSON.parse(localStorage.getItem("user")))');
})(); 