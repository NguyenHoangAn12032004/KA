# Student Dashboard Realtime System

Hệ thống đồng bộ dữ liệu thực tế và Socket.IO realtime cho trang Student Dashboard.

## 🎯 Tính năng chính

### 1. **Realtime Data Sync**
- Tự động cập nhật dữ liệu khi có thay đổi từ server
- Đồng bộ trạng thái giữa nhiều tab/thiết bị
- Thông báo trực tiếp cho các hoạt động quan trọng

### 2. **Socket Events được hỗ trợ**
- `student-dashboard-update`: Cập nhật tổng quan dashboard
- `job-view-updated`: Khi sinh viên xem chi tiết việc làm
- `saved-job-updated`: Khi lưu/bỏ lưu việc làm
- `application-updated`: Khi trạng thái ứng tuyển thay đổi
- `profile-updated`: Khi cập nhật hồ sơ
- `interview-scheduled`: Khi có lịch phỏng vấn mới

### 3. **Smart Notifications**
- Toast notifications với màu sắc phù hợp theo loại sự kiện
- Animation mượt mà cho các cập nhật UI
- Indicator trạng thái kết nối realtime

### 4. **Offline Fallback**
- Tự động chuyển sang chế độ polling khi mất kết nối
- Tái kết nối tự động khi có mạng trở lại
- Hiển thị trạng thái kết nối cho người dùng

## 🚀 Sử dụng

### Frontend Usage

```typescript
import realtimeStudentService from '../services/realtimeStudentService';

// Initialize for a student
await realtimeStudentService.initialize(studentId);

// Listen for updates
realtimeStudentService.on('data-updated', (data) => {
  console.log('New data:', data);
});

// Manual refresh
await realtimeStudentService.refresh();
```

### Backend Usage

```typescript
import { 
  emitStudentDashboardUpdate,
  emitJobViewUpdate,
  emitApplicationUpdate 
} from '../services/socketService';

// Emit dashboard update
emitStudentDashboardUpdate(studentId, 'data_updated', newData);

// Emit job view tracking
emitJobViewUpdate(studentId, jobData);

// Emit application status change
emitApplicationUpdate(studentId, applicationData);
```

## 🔧 Setup & Configuration

### 1. Frontend Setup

Đã được tích hợp sẵn trong component `StudentDashboardRealtime.tsx`:

```bash
# Component được export trong index.ts
export { default as StudentDashboard } from "./StudentDashboardRealtime";
```

### 2. Backend Setup

Socket service đã được cấu hình trong `server.ts`:

```typescript
// Socket.IO được khởi tạo với CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Initialize socket handlers
initializeSocket(io);
```

### 3. Environment Variables

```env
# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000

# Backend (.env)
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

## 🧪 Testing

### 1. Run Test Client

```bash
# Run realtime test client
node test-student-realtime.js
```

### 2. Manual Testing

1. Mở Student Dashboard tại `http://localhost:3000/student-dashboard`
2. Mở một tab khác và thực hiện các thao tác:
   - Xem chi tiết việc làm
   - Lưu/bỏ lưu việc làm  
   - Ứng tuyển việc làm
   - Cập nhật hồ sơ
3. Quan sát cập nhật realtime trên dashboard

### 3. Connection Status

- **🟢 LIVE**: Kết nối realtime hoạt động
- **🟡 OFFLINE**: Chế độ fallback, chỉ load manual
- **🔄 SYNC**: Đang làm mới dữ liệu

## 📊 Events Flow

```
User Action → Backend API → Database Update → Socket Emit → Frontend Update
```

### Example: Job View Tracking

1. User clicks job details → `JobsPage`
2. API call to `/api/jobs/:id` → Backend
3. Database saves view record → `job_views` table  
4. Socket emits `job-view-updated` → `socketService.emitJobViewUpdate()`
5. Frontend receives event → `realtimeStudentService`
6. Dashboard updates automatically → UI animation

## 🎨 UI/UX Features

### 1. Smooth Animations
- Fade in/out cho notifications
- Slide animations cho stat cards
- Pulse effect cho live indicator

### 2. Smart Notifications
- 🎉 Success: Ứng tuyển thành công, được chấp nhận
- ℹ️ Info: Xem việc làm, cập nhật trạng thái
- ⚠️ Warning: Bỏ lưu việc làm
- ❌ Error: Lỗi kết nối, không thể tải dữ liệu

### 3. Progressive Enhancement
- Hoạt động tốt kể cả khi không có realtime
- Tự động retry khi mất kết nối
- Graceful degradation cho các tính năng advanced

## 🔍 Troubleshooting

### Common Issues

1. **Socket không kết nối được**
   ```typescript
   // Check CORS configuration
   // Verify token authentication
   // Check network connectivity
   ```

2. **Events không được nhận**
   ```typescript
   // Verify user joined correct room
   // Check event name consistency
   // Ensure proper cleanup of listeners
   ```

3. **Performance issues**
   ```typescript
   // Limit event frequency
   // Use throttling for high-frequency events
   // Cleanup unused listeners
   ```

### Debug Mode

```typescript
// Enable verbose logging
localStorage.setItem('debug', 'socket.io-client:*');

// Check connection status
console.log('Socket connected:', socketService.isConnected());

// Monitor events
realtimeStudentService.on('*', (data) => {
  console.log('Event received:', data);
});
```

## 📈 Performance Considerations

### 1. Event Throttling
- Limit job view events to 1 per 5 seconds
- Batch multiple updates together
- Use debouncing for profile updates

### 2. Memory Management  
- Cleanup listeners on component unmount
- Limit stored events to last 100 items
- Regular garbage collection for old data

### 3. Network Optimization
- Use WebSocket when available
- Fallback to polling for unstable connections
- Compress large data payloads

## 🔐 Security

### 1. Authentication
- JWT token validation on connection
- User-specific rooms for data isolation
- Rate limiting on socket events

### 2. Data Validation
- Validate all incoming event data
- Sanitize user inputs
- Check permissions before emitting events

### 3. CORS Configuration
- Specific origin allowlist
- Credential handling for authenticated requests
- Secure WebSocket connections in production

## 🚀 Deployment

### Production Setup

```bash
# Build frontend
npm run build

# Start backend with PM2
pm2 start server.js --name "recruitment-api"

# Configure nginx for WebSocket proxy
# Enable SSL for secure connections
```

### Environment Configuration

```env
# Production
NODE_ENV=production
CORS_ORIGIN=https://recruitment.example.com
SOCKET_IO_TRANSPORTS=websocket

# Development  
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
SOCKET_IO_TRANSPORTS=websocket,polling
```

## 📚 API Reference

### Socket Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `join-user-room` | Client→Server | `{userId}` | Join user-specific room |
| `student-dashboard-update` | Server→Client | `{type, data, timestamp}` | Dashboard data update |
| `job-view-updated` | Server→Client | `{studentId, jobId, jobTitle, ...}` | Job view tracking |
| `saved-job-updated` | Server→Client | `{studentId, action, jobId, ...}` | Save/unsave job |
| `application-updated` | Server→Client | `{studentId, status, ...}` | Application status change |
| `profile-updated` | Server→Client | `{studentId, ...}` | Profile data update |
| `interview-scheduled` | Server→Client | `{studentId, scheduledAt, ...}` | New interview |

### REST API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/student-dashboard/:id` | GET | Get dashboard data |
| `/api/users/students/:id/saved-jobs/:jobId` | POST | Save job |
| `/api/users/students/:id/saved-jobs/:jobId` | DELETE | Unsave job |

---

## 🎉 Success!

Hệ thống realtime cho Student Dashboard đã được triển khai hoàn chỉnh với:

✅ **Socket.IO integration**  
✅ **Smooth UI updates**  
✅ **Smart notifications**  
✅ **Connection status indicator**  
✅ **Offline fallback**  
✅ **Performance optimization**  
✅ **Security measures**  
✅ **Comprehensive testing**

Sinh viên giờ đây có thể theo dõi các hoạt động của mình một cách real-time và mượt mà! 🚀
