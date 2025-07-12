# System Architecture Document
# Hệ Thống Quản Lý Tuyển Dụng & Thực Tập Real-time

**Phiên bản**: 1.0  
**Ngày tạo**: July 12, 2025  
**Người tạo**: Technical Architecture Team  

---

## 1. Architecture Overview

### 1.1 System Architecture Style
**Microservices Architecture** với Event-Driven patterns cho real-time capabilities

### 1.2 Key Design Principles
- **Scalability**: Horizontal scaling capability
- **Resilience**: Fault tolerance và graceful degradation
- **Security**: Security-first design
- **Performance**: Sub-second response times
- **Maintainability**: Modular và testable code
- **Real-time**: WebSocket-based live updates

### 1.3 High-Level Architecture (Đồ án tốt nghiệp - Tối ưu chi phí)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │    │  Mobile App     │    │  Admin Panel    │
│   (React SPA)   │    │   (PWA)         │    │   (React)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────────────────────────────┐
         │           Reverse Proxy                 │
         │         (Nginx - Miễn phí)              │
         └─────────────────────────────────────────┘
                                 │
         ┌─────────────────────────────────────────┐
         │         Node.js Backend API             │
         │      (Express.js + Socket.IO)           │
         │    [Tất cả services trong 1 app]        │
         └─────────────────────────────────────────┘
                                 │
         ┌─────────────────────────────────────────┐
         │           Database Layer                │
         │      PostgreSQL + Redis (Local)         │
         │         Cloudinary (File storage)       │
         └─────────────────────────────────────────┘
```

## 2. Technology Stack

### 2.1 Frontend Technologies
- **Framework**: React 18 với TypeScript
- **State Management**: Redux Toolkit + RTK Query
- **UI Library**: Material-UI (MUI) v5
- **Build Tool**: Vite
- **CSS Framework**: Emotion (styled-components)
- **Real-time**: Socket.IO Client
- **PWA**: Workbox for service workers
- **Testing**: Jest + React Testing Library

### 2.2 Backend Technologies
- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js với TypeScript
- **Authentication**: Passport.js + JWT
- **Real-time**: Socket.IO
- **API Documentation**: Swagger/OpenAPI 3.0
- **Testing**: Jest + Supertest
- **Code Quality**: ESLint + Prettier + Husky

### 2.3 Database & Storage (Đồ án tối ưu)
- **Primary Database**: PostgreSQL (Miễn phí - Local/Heroku)
- **Caching**: Redis (Miễn phí - Local/Redis Cloud free tier)
- **File Storage**: Cloudinary (Free tier 25GB/month)
- **Search**: PostgreSQL Full-text search (Thay Elasticsearch)
- **Static Assets**: Vercel/Netlify CDN (Miễn phí)

### 2.4 Infrastructure & DevOps (Student Budget)
- **Hosting**: Heroku free tier / Railway / Render
- **Frontend Deployment**: Vercel / Netlify (Miễn phí)
- **Containerization**: Docker (Local development)
- **CI/CD**: GitHub Actions (Miễn phí)
- **Monitoring**: Console logging + GitHub Issues
- **Domain**: Freenom (.tk, .ml) hoặc subdomain miễn phí

## 3. Simplified Architecture cho Đồ án

### 3.1 Monolithic Backend với Modular Design
**Lý do**: Đơn giản hóa deployment và giảm complexity

#### Single Node.js Application với modules:
```
src/
├── modules/
│   ├── auth/           # Authentication logic
│   ├── users/          # User management
│   ├── jobs/           # Job management
│   ├── applications/   # Application logic
│   ├── notifications/  # Real-time notifications
│   └── analytics/      # Basic analytics
├── middleware/         # Common middleware
├── database/          # Database models & migrations
├── utils/             # Utility functions
└── routes/            # API routes
```

**Technology Stack cho từng module**:
- **Framework**: Express.js với TypeScript
- **Authentication**: Passport.js + JWT
- **Real-time**: Socket.IO (thay Kafka)
- **Database ORM**: Prisma (modern, type-safe)
- **Validation**: Joi hoặc Zod
- **File uploads**: Multer + Cloudinary

### 3.2 Simplified Communication Pattern

#### Real-time Events (thay Message Queue):
```javascript
// Event emitter pattern trong single application
const EventEmitter = require('events');
const appEvents = new EventEmitter();

// Thay vì Kafka, dùng internal events
appEvents.on('application.statusChanged', (data) => {
  // Send notification via Socket.IO
  notificationService.sendRealTimeUpdate(data);
  // Send email
  emailService.sendStatusUpdate(data);
});
```

## 4. Database Design

### 4.1 Database Architecture (Simplified)
**Single PostgreSQL database** với smart schema design:

#### PostgreSQL làm tất cả:
- User profiles và authentication data
- Job postings và applications  
- Company information
- Transactional data
- **Full-text search** (thay Elasticsearch)
- **JSONB fields** cho flexible data

#### Redis (Optional - có thể bỏ trong MVP):
- User sessions
- Rate limiting
- Cache frequently accessed data

#### File Storage:
- **Cloudinary Free Tier**: 25GB storage, image optimization
- **Alternative**: Firebase Storage free tier

### 4.2 Database Schema Design

#### Core Entities
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    user_type user_type_enum NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    profile_photo_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    website VARCHAR(255),
    logo_url VARCHAR(500),
    industry VARCHAR(100),
    company_size company_size_enum,
    founded_year INTEGER,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    job_type job_type_enum NOT NULL,
    experience_level experience_level_enum,
    location JSONB,
    salary_range JSONB,
    required_skills TEXT[],
    preferred_skills TEXT[],
    status job_status_enum DEFAULT 'draft',
    application_deadline TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Applications table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id),
    applicant_id UUID REFERENCES users(id),
    status application_status_enum DEFAULT 'submitted',
    cover_letter TEXT,
    resume_file_url VARCHAR(500),
    additional_documents JSONB,
    application_answers JSONB,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    applied_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(job_id, applicant_id)
);
```

### 4.3 Data Partitioning Strategy
- **Horizontal partitioning** cho large tables (applications, analytics)
- **Read replicas** cho read-heavy workloads
- **Connection pooling** để optimize database connections

## 5. Security Architecture

### 5.1 Authentication & Authorization
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │───▶│ API Gateway │───▶│Auth Service │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                    ┌──────▼──────┐
                    │  JWT Token  │
                    │ Validation  │
                    └─────────────┘
```

#### JWT Token Structure
```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-uuid",
    "email": "user@example.com",
    "role": "student",
    "iat": 1625097600,
    "exp": 1625184000,
    "permissions": ["read:profile", "write:applications"]
  }
}
```

### 5.2 Data Protection
- **Encryption at rest**: AES-256 cho sensitive data
- **Encryption in transit**: TLS 1.3 for all communications
- **PII encryption**: Personal data encrypted với separate keys
- **Key management**: AWS KMS for encryption key management

### 5.3 API Security
- **Rate limiting**: Per-user và per-IP limits
- **Input validation**: Schema validation cho all inputs
- **SQL injection prevention**: Parameterized queries
- **XSS protection**: Content Security Policy headers
- **CORS configuration**: Restricted origins

## 6. Real-time Architecture (Simplified)

### 6.1 Socket.IO Implementation
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │◄──▶│Socket.IO    │◄──▶│ PostgreSQL  │
│             │    │ Server      │    │ + EventBus  │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                    ┌──────▼──────┐
                    │  In-Memory  │
                    │EventEmitter │
                    └─────────────┘
```

#### Simplified Event Flow:
1. **Database Change**: Application status updated
2. **Event Emitter**: Emit internal event
3. **Socket.IO**: Broadcast to connected clients  
4. **Email Service**: Send notification email

### 6.2 Real-time Features (Core MVP):
- **Application status updates**: Instant notifications
- **Basic messaging**: Simple chat between recruiter-candidate
- **Job alerts**: New job notifications
- **Online indicators**: Simple presence

## 7. Performance & Scalability

### 7.1 Caching Strategy
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browser   │───▶│     CDN     │───▶│Application  │
│   Cache     │    │   Cache     │    │   Cache     │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
                                      ┌───────▼──────┐
                                      │   Database   │
                                      └──────────────┘
```

#### Cache Layers
1. **Browser Cache**: Static assets, API responses
2. **CDN Cache**: Images, CSS, JavaScript files
3. **Application Cache**: Redis for frequently accessed data
4. **Database Cache**: Query result caching

### 7.2 Horizontal Scaling
- **Load balancing**: Multiple application instances
- **Database scaling**: Read replicas và connection pooling
- **Microservice scaling**: Independent service scaling
- **Auto-scaling**: Kubernetes horizontal pod autoscaler

### 7.3 Performance Optimization
- **Database indexing**: Optimized indexes for search queries
- **Query optimization**: Efficient SQL queries và joins
- **Image optimization**: WebP format, responsive images
- **Code splitting**: Lazy loading của React components
- **API pagination**: Limit large result sets

## 8. Monitoring & Observability

### 8.1 Monitoring Stack
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Application  │───▶│  New Relic  │───▶│ Dashboard   │
│  Metrics    │    │   Agent     │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
       │
┌──────▼──────┐    ┌─────────────┐    ┌─────────────┐
│   Logs      │───▶│  ELK Stack  │───▶│  Kibana     │
│             │    │             │    │ Dashboard   │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 8.2 Key Metrics
#### Application Metrics
- Response time percentiles (50th, 95th, 99th)
- Request rate (requests per second)
- Error rate (4xx, 5xx responses)
- Database query performance

#### Business Metrics
- User registration rate
- Job application conversion
- Search success rate
- Real-time notification delivery rate

### 8.3 Alerting Strategy
- **Critical alerts**: 1-minute response time
- **High priority**: 15-minute response time
- **Medium priority**: 1-hour response time
- **Escalation**: Auto-escalate unresolved alerts

## 9. Deployment Architecture (Student Budget)

### 9.1 Free/Low-cost Deployment Options

#### Option 1: Heroku (Easiest)
```yaml
# heroku.yml
build:
  docker:
    web: Dockerfile
run:
  web: npm start
addons:
  - heroku-postgresql:hobby-dev  # Free PostgreSQL
  - heroku-redis:hobby-dev       # Free Redis
```

#### Option 2: Railway (Modern alternative)
```yaml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
```

#### Option 3: Render (Good free tier)
```yaml
# render.yaml
services:
  - type: web
    name: recruitment-platform
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: recruitment-db
          property: connectionString

databases:
  - name: recruitment-db
    databaseName: recruitment_platform
    user: admin
```

### 9.2 CI/CD Pipeline (Free)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Heroku
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "your-app-name"
          heroku_email: "your-email@example.com"
```

### 9.3 Environment Setup
- **Development**: Local với Docker Compose
- **Production**: Heroku/Railway/Render free tier
- **Database**: PostgreSQL free tier (1GB limit)
- **File Storage**: Cloudinary free tier (25GB)

## 10. Disaster Recovery & Backup

### 10.1 Backup Strategy
- **Database backups**: Daily full backups, hourly incrementals
- **File storage backups**: Cross-region replication
- **Configuration backups**: Infrastructure as Code
- **Recovery testing**: Monthly disaster recovery drills

### 10.2 High Availability
- **Multi-AZ deployment**: Cross availability zone redundancy
- **Auto-failover**: Automatic failover for database
- **Health checks**: Continuous health monitoring
- **Circuit breakers**: Prevent cascade failures

---

**Document Owner**: Technical Architecture Team  
**Approved By**: CTO  
**Next Review Date**: September 12, 2025
