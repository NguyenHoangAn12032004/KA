# 🔧 HƯỚNG DẪN KHẮC PHỤC VẤN ĐỀ "CHƯA CÓ TIN TUYỂN DỤNG NÀO"

## 📋 Phân tích vấn đề

Dựa trên hình ảnh được cung cấp và kết quả kiểm tra, chúng tôi đã phát hiện các vấn đề sau:

1. **Vấn đề xác thực**: Token JWT không được lưu đúng cách hoặc đã hết hạn
2. **Vấn đề dữ liệu**: Có tin tuyển dụng trong cơ sở dữ liệu nhưng không hiển thị trên giao diện
3. **Vấn đề API**: API không trả về dữ liệu đúng định dạng hoặc không được gọi đúng cách

## 🛠️ Các bước khắc phục

### 1. Cập nhật token trong localStorage

Chạy đoạn mã sau trong console của trình duyệt:

```javascript
// Cập nhật token
localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhjYWM4NmI3LTRiMmItNDA2Yi1hZjM0LTQxNTkyOGZlODdhZCIsImVtYWlsIjoiY29tcGFueUBleGFtcGxlLmNvbSIsInJvbGUiOiJDT01QQU5ZIiwiaWF0IjoxNzUzMTg2NTcxLCJleHAiOjE3NTMxOTAxNzF9.YT029B3JTN_0ZDw2jXZcZAx49IwI98CG8TYg5k4YmQ8');

// Cập nhật thông tin user
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

// Làm mới trang
window.location.reload();
```

### 2. Chạy script khắc phục tin tuyển dụng

Chạy script sau trong terminal để đảm bảo tin tuyển dụng được gán đúng cho công ty:

```bash
cd recruitment-platform/backend
node fix-company-jobs.js
```

Kết quả:
```
🔧 Bắt đầu khắc phục vấn đề tin tuyển dụng...
👤 Thông tin công ty:
- User ID: 8cac86b7-4b2b-406b-af34-415928fe87ad
- Email: company@example.com
- Company ID: comp-1753155661984
- Company Name: HUTECH
📊 Số lượng tin tuyển dụng: 4
🔍 Kiểm tra và cập nhật tin tuyển dụng hiện có...
- Frontend Developer (React) (ID: ec333e53-5585-44f2-91af-f04565331b51)
  Trạng thái: Đang hoạt động
  Ứng viên: 2
- UI/UX Designer (ID: 26fa0983-b8e3-42e7-8861-0704cc72bad5)
  Trạng thái: Đang hoạt động
  Ứng viên: 2
- Mobile Developer (Flutter) (ID: c2b400e0-2c61-40b9-9fce-3352177e37a1)
  Trạng thái: Đang hoạt động
  Ứng viên: 1
- Backend (ID: a10420a0-192c-4100-ad70-2cbbb88ec675)
  Trạng thái: Đang hoạt động
  Ứng viên: 2

📊 Kết quả sau khi cập nhật: 4 tin tuyển dụng
```

### 3. Kiểm tra API trong trình duyệt

Sau khi cập nhật token và làm mới trang, mở DevTools (F12) và kiểm tra:

1. **Network tab**: Tìm request đến `/api/jobs/company` và xem response
2. **Console tab**: Kiểm tra log để xem dữ liệu được trả về từ API

### 4. Kiểm tra định dạng dữ liệu

Đảm bảo rằng dữ liệu được trả về từ API có định dạng đúng:

```javascript
// Định dạng dữ liệu mong đợi
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "...",
        "title": "...",
        "location": "...",
        "isActive": true,
        "applicationsCount": 2,
        "viewsCount": 0,
        // ... các trường khác
      }
    ]
  }
}
```

## 🔍 Kiểm tra kết quả

Sau khi thực hiện các bước trên, trang dashboard công ty sẽ hiển thị danh sách tin tuyển dụng thay vì thông báo "Chưa có tin tuyển dụng nào".

## 🧩 Giải pháp bổ sung

Nếu vấn đề vẫn tồn tại, hãy thử các giải pháp sau:

1. **Kiểm tra định dạng response API**: Cập nhật component `CompanyDashboard.tsx` để xử lý cả hai định dạng dữ liệu có thể có:

```typescript
if (jobsResponse.data && jobsResponse.data.jobs) {
  setJobs(jobsResponse.data.jobs);
} else if (jobsResponse.data && jobsResponse.data.data && jobsResponse.data.data.jobs) {
  setJobs(jobsResponse.data.data.jobs);
}
```

2. **Tạo tin tuyển dụng mới**: Sử dụng nút "Đăng tin mới" để tạo tin tuyển dụng mới trực tiếp từ giao diện

3. **Kiểm tra logs**: Xem logs của backend để phát hiện lỗi khi xử lý request API

## 📝 Ghi chú

- Đảm bảo backend server đang chạy trước khi kiểm tra
- Nếu token hết hạn, cần tạo token mới bằng cách chạy `node test-company-jobs.js`
- Đảm bảo thông tin user trong localStorage khớp với thông tin trong database 