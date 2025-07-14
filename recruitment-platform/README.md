# Hệ Thống Quản Lý Tuyển Dụng & Thực Tập Real-time

**Đồ án tốt nghiệp** - Hệ thống quản lý đăng ký thực tập và tuyển dụng thời gian thực

---

## 🎯 Mô tả dự án

Hệ thống quản lý tuyển dụng và thực tập hiện đại với khả năng real-time, được thiết kế đặc biệt cho đồ án tốt nghiệp với chi phí tối ưu và độ phức tạp phù hợp.

### Tính năng chính:
- ✅ **Quản lý người dùng**: Sinh viên, Công ty, HR Manager
- ✅ **Đăng tin tuyển dụng**: Tạo, chỉnh sửa, quản lý tin tuyển dụng
- ✅ **Ứng tuyển trực tuyến**: Nộp hồ sơ, theo dõi trạng thái
- ✅ **Tương tác real-time**: Thông báo, tin nhắn, cập nhật trạng thái
- ✅ **Dashboard & Analytics**: Thống kê, báo cáo trực quan
- ✅ **Tìm kiếm & Lọc**: Tìm việc theo nhiều tiêu chí
- ✅ **Quản lý phỏng vấn**: Lên lịch, theo dõi kết quả

## Cấu trúc Tài liệu

```
docs/
├── requirements/           # Tài liệu yêu cầu
│   ├── business-requirements.md
│   ├── functional-requirements.md
│   ├── non-functional-requirements.md
│   ├── user-stories.md
│   └── api-requirements.md
├── architecture/          # Tài liệu kiến trúc
│   ├── system-architecture.md
│   ├── database-design.md
│   └── security-design.md
└── design/               # Tài liệu thiết kế
    ├── ui-ux-requirements.md
    └── technical-specifications.md
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: Redux Toolkit
- **Real-time**: Socket.IO Client
- **Build Tool**: Create React App
- **Hosting**: Vercel (Free tier)

### Backend
- **Runtime**: Node.js 18+ + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + bcryptjs
- **Real-time**: Socket.IO
- **File Storage**: Cloudinary
- **Hosting**: Railway (Free tier)

### DevOps & Tools
- **Containerization**: Docker + Docker Compose
- **Database**: PostgreSQL
- **Version Control**: Git + GitHub
- **Deployment**: Railway + Vercel

## 📊 Kiến trúc hệ thống

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │────│   Express API   │────│   PostgreSQL    │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         v                       v                       v
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Vercel      │    │     Railway     │    │   Railway DB    │
│   (Hosting)     │    │   (Hosting)     │    │   (Hosting)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Cài đặt và chạy dự án

### Prerequisites
- Node.js 18+
- PostgreSQL (hoặc sử dụng Docker)
- Git

### 1. Clone repository
```bash
git clone https://github.com/your-username/recruitment-platform.git
cd recruitment-platform
```

### 2. Quick Setup (Recommended)
```bash
# Windows
scripts\setup.bat

# Linux/Mac
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 3. Manual Setup
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies  
cd frontend && npm install && cd ..

# Copy environment file
copy backend\.env.example backend\.env
# Edit backend\.env with your database credentials
```

### 4. Setup database
```bash
# Using Docker (recommended)
docker-compose up postgres -d

# Or setup PostgreSQL manually and update DATABASE_URL in .env
```

### 5. Initialize database
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
cd ..
```

### 6. Start development servers
```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:backend  # Backend on http://localhost:5000
npm run dev:frontend # Frontend on http://localhost:3000
```

## 📁 Cấu trúc project

```
recruitment-platform/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store
│   │   ├── services/       # API calls
│   │   └── utils/          # Utilities
│   └── package.json
├── backend/                  # Node.js API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   ├── prisma/             # Database schema
│   └── package.json
├── docs/                    # Documentation
│   ├── requirements/       # Requirements analysis
│   ├── architecture/       # System design
│   └── guides/            # Implementation guides
├── scripts/                 # Setup scripts
├── shared/                  # Shared types and utilities
├── docker-compose.yml       # Development environment
└── README.md
```

## 🔑 Demo Accounts

Sau khi chạy `npx prisma db seed`, bạn có thể sử dụng các tài khoản demo:

### Admin
- **Email**: `admin@recruitmentplatform.com`
- **Password**: `password123`

### Companies
- **FPT Software**: `hr@fptsoft.com` / `password123`
- **VNG Corporation**: `careers@vng.com` / `password123`

### Students
- **Student 1**: `student1@hcmut.edu.vn` / `password123`
- **Student 2**: `student2@hcmus.edu.vn` / `password123`

## 📖 Documentation

- [📋 Business Requirements](docs/requirements/business-requirements.md)
- [⚙️ Functional Requirements](docs/requirements/functional-requirements.md)
- [🔧 System Architecture](docs/architecture/system-architecture.md)
- [🗄️ Database Design](docs/architecture/database-design.md)
- [🎓 Student Implementation Guide](docs/STUDENT-IMPLEMENTATION-GUIDE.md)

## 🧪 Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Run all tests
npm test
```

## 🚀 Deployment

### Railway (Backend)
1. Create Railway account
2. Connect GitHub repository
3. Set environment variables
4. Deploy automatically

### Vercel (Frontend)
1. Create Vercel account
2. Import project from GitHub
3. Configure build settings
4. Deploy automatically

Chi tiết deployment có trong [Student Implementation Guide](docs/STUDENT-IMPLEMENTATION-GUIDE.md)

## 🧰 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend
- `npm run setup` - Setup all dependencies
- `npm run build` - Build both applications
- `npm test` - Run all tests
- `npm run lint` - Lint all code

### Backend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with demo data
- `npm run db:studio` - Open Prisma Studio

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🔧 Development Workflow

1. **Start Development**
   ```bash
   npm run dev
   ```

2. **Make Changes**
   - Frontend: Edit files in `frontend/src/`
   - Backend: Edit files in `backend/src/`

3. **Test Changes**
   ```bash
   npm test
   ```

4. **Database Changes**
   ```bash
   cd backend
   npx prisma migrate dev --name your_migration_name
   ```

5. **Add Dependencies**
   ```bash
   # Backend
   cd backend && npm install package-name
   
   # Frontend
   cd frontend && npm install package-name
   ```

## 🐳 Docker Development

```bash
# Start all services
docker-compose up

# Start only database
docker-compose up postgres

# Rebuild services
docker-compose up --build

# Stop services
docker-compose down
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Student Developer** - *Initial work* - [Your GitHub](https://github.com/your-username)

## 🙏 Acknowledgments

- React và Material-UI documentation
- Node.js và Express.js community
- PostgreSQL và Prisma teams
- Socket.IO documentation
- Railway và Vercel platforms

---

**📞 Support**: Nếu có vấn đề, vui lòng tạo issue trên GitHub hoặc liên hệ qua email.

**⭐ Star this project** nếu nó hữu ích cho bạn!
