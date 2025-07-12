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

### 1.3 High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │    │  Mobile App     │    │  Admin Panel    │
│   (React SPA)   │    │   (PWA)         │    │   (React)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────────────────────────────┐
         │           Load Balancer/CDN             │
         │          (AWS CloudFront)               │
         └─────────────────────────────────────────┘
                                 │
         ┌─────────────────────────────────────────┐
         │           API Gateway                   │
         │      (Kong/AWS API Gateway)             │
         └─────────────────────────────────────────┘
                                 │
    ┌────────────────────────────┼────────────────────────────┐
    │                            │                            │
┌───▼────┐  ┌─────────┐  ┌──────▼──┐  ┌──────────┐  ┌─────────┐
│Auth    │  │User     │  │Job      │  │Notification│  │Analytics│
│Service │  │Service  │  │Service  │  │Service     │  │Service  │
└────────┘  └─────────┘  └─────────┘  └──────────┘  └─────────┘
    │           │            │             │             │
    └───────────┼────────────┼─────────────┼─────────────┘
                │            │             │
         ┌──────▼────────────▼─────────────▼──────┐
         │           Message Queue                │
         │         (Apache Kafka)                 │
         └───────────────────────────────────────┘
                                 │
         ┌─────────────────────────────────────────┐
         │           Database Layer                │
         │  PostgreSQL + Redis + Elasticsearch     │
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

### 2.3 Database & Storage
- **Primary Database**: PostgreSQL 15
- **Caching**: Redis 7
- **Search Engine**: Elasticsearch 8
- **File Storage**: AWS S3
- **CDN**: AWS CloudFront
- **Message Queue**: Apache Kafka

### 2.4 Infrastructure & DevOps
- **Cloud Provider**: AWS
- **Containerization**: Docker + Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: New Relic + CloudWatch
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Security**: AWS WAF + Security Groups

## 3. Microservices Architecture

### 3.1 Service Decomposition

#### Authentication Service
**Responsibilities**:
- User registration và login
- JWT token management
- Social OAuth integration
- Password reset functionality
- Two-factor authentication

**Technology Stack**:
- Node.js + Express
- Passport.js
- Redis (session storage)
- PostgreSQL (user credentials)

#### User Management Service
**Responsibilities**:
- User profile management
- Profile photo uploads
- Skills và experience tracking
- Privacy settings
- Profile completion scoring

**Technology Stack**:
- Node.js + Express
- AWS S3 (file storage)
- PostgreSQL (profile data)
- Elasticsearch (profile search)

#### Job Management Service
**Responsibilities**:
- Job posting CRUD operations
- Job search và filtering
- Job recommendations
- Application deadline management
- Job analytics

**Technology Stack**:
- Node.js + Express
- PostgreSQL (job data)
- Elasticsearch (search functionality)
- Redis (caching)

#### Application Service
**Responsibilities**:
- Job application processing
- Application status tracking
- Resume/CV management
- Interview scheduling
- Application analytics

**Technology Stack**:
- Node.js + Express
- PostgreSQL (application data)
- AWS S3 (document storage)
- Kafka (status change events)

#### Notification Service
**Responsibilities**:
- Real-time notification delivery
- Email notification sending
- Push notification management
- Notification preferences
- Delivery tracking

**Technology Stack**:
- Node.js + Express
- Socket.IO
- Redis (real-time data)
- SendGrid (email service)
- Firebase (push notifications)

#### Analytics Service
**Responsibilities**:
- User behavior tracking
- Platform metrics collection
- Recommendation engine
- Report generation
- A/B testing support

**Technology Stack**:
- Node.js + Express
- PostgreSQL (analytics data)
- Redis (real-time metrics)
- Python (ML models)

### 3.2 Inter-Service Communication

#### Synchronous Communication
- **HTTP/REST APIs**: For request-response operations
- **GraphQL**: For complex data fetching requirements
- **Service Mesh**: Istio for service-to-service communication

#### Asynchronous Communication
- **Apache Kafka**: Event streaming platform
- **Redis Pub/Sub**: Real-time notifications
- **WebSockets**: Client-server real-time communication

#### Event-Driven Architecture
```
User Registration → Auth Service → User Created Event → Kafka
    ↓
Notification Service ← Welcome Email Event ← Kafka
    ↓
Analytics Service ← User Signup Event ← Kafka
```

## 4. Database Design

### 4.1 Database Architecture
**Multi-database approach** với specialized databases:

#### PostgreSQL (Primary Database)
- User profiles và authentication data
- Job postings và applications
- Company information
- Transactional data

#### Redis (Caching & Sessions)
- User sessions
- Frequently accessed data
- Real-time notifications
- Rate limiting counters

#### Elasticsearch (Search & Analytics)
- Job search indexing
- User profile search
- Application analytics
- Log aggregation

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

## 6. Real-time Architecture

### 6.1 WebSocket Implementation
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │◄──▶│Socket.IO    │◄──▶│ Redis       │
│             │    │ Server      │    │ Adapter     │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                    ┌──────▼──────┐
                    │  Kafka      │
                    │ Consumer    │
                    └─────────────┘
```

#### Event Flow
1. **Service Event**: Application status changed
2. **Kafka Producer**: Publishes event to topic
3. **Notification Service**: Consumes event
4. **Redis Pub/Sub**: Broadcasts to Socket.IO instances
5. **WebSocket**: Delivers to connected clients

### 6.2 Real-time Features
- **Application status updates**: Instant status notifications
- **Job recommendations**: Live job matching alerts
- **Messaging**: Real-time chat functionality
- **Presence indicators**: Online/offline status
- **Typing indicators**: Chat typing notifications

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

## 9. Deployment Architecture

### 9.1 Kubernetes Deployment
```yaml
# Example service deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: recruitment-platform/user-service:v1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### 9.2 CI/CD Pipeline
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   GitHub    │───▶│GitHub       │───▶│ Docker      │
│   Push      │    │Actions      │    │ Build       │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
┌─────────────┐    ┌───────▼──────┐    ┌─────────────┐
│ Production  │◄───│ Staging      │◄───│  Testing    │
│ Deployment  │    │ Deployment   │    │             │
└─────────────┘    └──────────────┘    └─────────────┘
```

### 9.3 Environment Strategy
- **Development**: Local development với Docker Compose
- **Testing**: Automated testing environment
- **Staging**: Production-like environment for QA
- **Production**: High-availability production deployment

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
