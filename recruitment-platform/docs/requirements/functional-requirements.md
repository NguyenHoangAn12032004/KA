# Functional Requirements Document (FRD)
# Hệ Thống Quản Lý Tuyển Dụng & Thực Tập Real-time

**Phiên bản**: 1.0  
**Ngày tạo**: July 12, 2025  
**Người tạo**: Development Team  

---

## 1. Giới thiệu

### 1.1 Mục đích Tài liệu
Tài liệu này mô tả chi tiết các yêu cầu chức năng (Functional Requirements) của Hệ thống Quản Lý Tuyển Dụng & Thực Tập Real-time, bao gồm các tính năng, luồng xử lý và tương tác của hệ thống.

### 1.2 Phạm vi Áp dụng
- Tất cả các thành viên trong team phát triển
- Product Owner và Business Analyst
- QA Team cho việc test planning
- UI/UX Designer cho thiết kế interface

### 1.3 Definitions & Acronyms
- **RT**: Real-time
- **API**: Application Programming Interface
- **UI/UX**: User Interface/User Experience
- **CRUD**: Create, Read, Update, Delete
- **JWT**: JSON Web Token
- **SSO**: Single Sign-On

## 2. System Overview

### 2.1 System Context
Hệ thống bao gồm 4 user roles chính:
- **Students**: Tìm kiếm và ứng tuyển việc làm/thực tập
- **Companies**: Đăng tin tuyển dụng và quản lý ứng viên
- **Universities**: Quản lý chương trình thực tập và sinh viên
- **System Admins**: Quản trị hệ thống và monitor

### 2.2 Core Modules
1. **Authentication & Authorization Module**
2. **User Management Module**
3. **Job Management Module**
4. **Application Management Module**
5. **Real-time Notification Module**
6. **Search & Recommendation Module**
7. **Analytics & Reporting Module**
8. **Communication Module**

## 3. Functional Requirements

### 3.1 Authentication & Authorization Module

#### FR-AUTH-001: User Registration
**Description**: Hệ thống cho phép đăng ký tài khoản cho các loại user khác nhau

**Actors**: Guest Users

**Preconditions**: None

**Main Flow**:
1. User truy cập registration page
2. User chọn loại tài khoản (Student/Company/University)
3. User nhập thông tin cơ bản:
   - Email address
   - Password (minimum 8 characters, 1 uppercase, 1 number, 1 special char)
   - Full name/Company name
   - Phone number
4. System gửi verification email
5. User xác nhận email
6. System tạo account và redirect đến profile setup

**Alternative Flows**:
- A1: Email đã tồn tại → Show error message
- A2: Invalid email format → Show validation error
- A3: Weak password → Show password requirements

**Postconditions**: User account được tạo với status "Pending Verification"

**Business Rules**:
- BR-AUTH-001: Mỗi email chỉ có thể đăng ký 1 account
- BR-AUTH-002: Company accounts cần additional verification
- BR-AUTH-003: University accounts cần admin approval

#### FR-AUTH-002: Social Login Integration
**Description**: User có thể đăng nhập bằng social accounts

**Actors**: Guest Users

**Supported Platforms**:
- Google OAuth 2.0
- LinkedIn OAuth 2.0
- Facebook Login (optional)

**Main Flow**:
1. User click "Login with [Platform]"
2. Redirect to platform authorization
3. User authorizes application
4. System receives user profile data
5. If first time: Create account with social data
6. If existing: Link social account to existing account
7. Login user to dashboard

**Business Rules**:
- BR-AUTH-004: Social accounts must provide email address
- BR-AUTH-005: LinkedIn preferred for professional users

#### FR-AUTH-003: Multi-Factor Authentication
**Description**: Thêm lớp bảo mật cho sensitive accounts

**Actors**: All authenticated users

**Supported Methods**:
- SMS OTP
- Email OTP
- Authenticator Apps (Google Authenticator, Authy)

**Main Flow**:
1. User enables 2FA in security settings
2. User scans QR code or enters secret key
3. User enters verification code
4. System saves 2FA settings
5. Subsequent logins require 2FA verification

#### FR-AUTH-004: Password Recovery
**Description**: User có thể reset password khi quên

**Main Flow**:
1. User clicks "Forgot Password"
2. User enters email address
3. System sends reset link (valid 1 hour)
4. User clicks link and enters new password
5. System updates password and invalidates all sessions
6. User redirected to login page

### 3.2 User Management Module

#### FR-USER-001: Student Profile Management
**Description**: Students có thể tạo và quản lý profile chi tiết

**Profile Sections**:
- **Personal Information**:
  - Full name, date of birth, gender
  - Contact information (phone, email, address)
  - Profile photo
- **Education**:
  - University/College name
  - Degree program, major, GPA
  - Graduation date (expected/actual)
  - Academic achievements, honors
- **Skills & Competencies**:
  - Technical skills with proficiency levels
  - Soft skills
  - Certifications
  - Languages with proficiency
- **Experience**:
  - Internships, part-time jobs
  - Projects (academic, personal, open-source)
  - Volunteer work
  - Leadership experiences
- **Career Preferences**:
  - Desired job types
  - Preferred locations
  - Salary expectations
  - Company size preferences
  - Industry preferences

**Main Flow**:
1. Student accesses profile page
2. Student fills/updates profile sections
3. System auto-saves changes
4. System calculates profile completion percentage
5. System shows suggestions for improvement

**Business Rules**:
- BR-USER-001: Profile must be 70%+ complete để apply jobs
- BR-USER-002: GPA validation (0.0-4.0 scale)
- BR-USER-003: Skills có predefined list + custom options

#### FR-USER-002: Company Profile Management
**Description**: Companies tạo profile để attract candidates

**Profile Sections**:
- **Company Information**:
  - Company name, logo, website
  - Industry, company size, founding year
  - Company description và mission
  - Office locations
- **Company Culture**:
  - Work environment description
  - Company values
  - Employee benefits
  - Work-life balance policies
- **Media Gallery**:
  - Office photos
  - Team photos
  - Company videos
- **Contact Information**:
  - HR contact details
  - Recruitment team information

**Verification Process**:
1. Company submits profile
2. System checks business registration
3. Admin reviews company information
4. Verification badge granted upon approval

#### FR-USER-003: University Profile Management
**Description**: Universities quản lý partnerships và student programs

**Profile Sections**:
- **Institution Information**:
  - University name, logo, website
  - Accreditation details
  - Campus locations
- **Academic Programs**:
  - Degree programs offered
  - Department information
  - Faculty details
- **Career Services**:
  - Career center information
  - Internship requirements
  - Industry partnerships
  - Alumni network

### 3.3 Job Management Module

#### FR-JOB-001: Job Posting Creation
**Description**: Companies có thể tạo và publish job postings

**Required Fields**:
- Job title
- Job description (rich text editor)
- Required qualifications
- Preferred qualifications
- Job type (Full-time/Part-time/Internship/Contract)
- Experience level (Entry/Mid/Senior)
- Location (Remote/On-site/Hybrid)
- Salary range (optional)
- Application deadline
- Number of positions available

**Main Flow**:
1. Recruiter navigates to "Post Job" page
2. Recruiter fills job details using form wizard
3. System validates required fields
4. Recruiter previews job posting
5. Recruiter publishes job (Draft/Active status)
6. System sends notifications to matching candidates
7. Job appears in search results

**Business Rules**:
- BR-JOB-001: Job description minimum 100 characters
- BR-JOB-002: Required skills maximum 20 items
- BR-JOB-003: Free accounts limited to 5 active jobs
- BR-JOB-004: Premium accounts unlimited jobs

#### FR-JOB-002: Job Search & Filtering
**Description**: Candidates có thể search và filter jobs effectively

**Search Capabilities**:
- **Text Search**: Job title, company name, description keywords
- **Location Search**: City, state, remote options
- **Advanced Filters**:
  - Job type (Full-time, Part-time, Internship, Contract)
  - Experience level (Entry, Mid-level, Senior)
  - Salary range
  - Company size
  - Industry
  - Posted date (Last 24h, Last week, Last month)
  - Application deadline

**Search Results Features**:
- Relevance scoring
- Save search queries
- Set up job alerts
- Sort by: Relevance, Date posted, Salary, Company rating

**Main Flow**:
1. User enters search keywords
2. User applies filters
3. System returns relevant jobs với ranking
4. User can save interesting jobs
5. User can set up alerts for search criteria

#### FR-JOB-003: Job Recommendation Engine
**Description**: AI-powered recommendations based on user profile

**Recommendation Factors**:
- Skills matching
- Experience level alignment
- Location preferences
- Career interests
- Application history
- Similar user behaviors

**Main Flow**:
1. System analyzes user profile daily
2. System scores all active jobs
3. System returns top recommendations
4. User sees personalized job feed
5. User provides feedback (thumbs up/down)
6. System learns from feedback

**Business Rules**:
- BR-JOB-005: Minimum 10 recommendations per user
- BR-JOB-006: Recommendations updated every 4 hours
- BR-JOB-007: Hide applied/rejected jobs

### 3.4 Application Management Module

#### FR-APP-001: Job Application Submission
**Description**: Streamlined application process cho candidates

**Application Components**:
- Cover letter (optional/required based on job)
- Resume/CV upload
- Additional documents (portfolio, certificates)
- Questionnaire answers (if provided by employer)

**Main Flow**:
1. Candidate clicks "Apply" on job posting
2. System checks profile completion
3. Candidate writes/selects cover letter
4. Candidate uploads required documents
5. Candidate answers screening questions
6. Candidate reviews application summary
7. Candidate submits application
8. System sends confirmation email
9. System notifies employer in real-time

**Quick Apply Feature**:
- One-click apply với saved profile data
- Auto-generated cover letter template
- Default resume selection

**Business Rules**:
- BR-APP-001: Cannot apply to same job twice
- BR-APP-002: Profile must be 70%+ complete
- BR-APP-003: File uploads max 10MB per file
- BR-APP-004: Supported formats: PDF, DOC, DOCX

#### FR-APP-002: Application Status Tracking
**Description**: Real-time tracking của application progress

**Application Statuses**:
1. **Submitted**: Application received
2. **Under Review**: HR/Recruiter reviewing
3. **Phone Screen**: Initial phone interview scheduled
4. **Interview**: In-person/video interview scheduled
5. **Final Round**: Final interview/assessment
6. **Offer Extended**: Job offer made
7. **Hired**: Offer accepted
8. **Rejected**: Application declined

**Real-time Features**:
- Instant status updates via WebSocket
- Push notifications to mobile app
- Email notifications for major status changes
- In-app notification center

**Main Flow**:
1. Recruiter updates application status
2. System triggers real-time notification
3. Candidate sees update immediately
4. System logs status change với timestamp
5. System sends follow-up email if configured

#### FR-APP-003: Bulk Application Management
**Description**: Recruiters có thể manage multiple applications efficiently

**Bulk Operations**:
- Status updates (select multiple → update status)
- Send bulk emails
- Schedule bulk interviews
- Export applications to CSV/Excel
- Bulk rejection với custom message

**Filtering & Sorting**:
- Filter by status, date, rating, source
- Sort by application date, rating, relevance
- Search by candidate name, skills, university

**Main Flow**:
1. Recruiter accesses application dashboard
2. Recruiter selects applications using checkboxes
3. Recruiter chooses bulk action
4. System confirms action và shows preview
5. Recruiter confirms và system executes
6. System sends appropriate notifications

### 3.5 Real-time Notification Module

#### FR-NOTIF-001: Real-time Notification System
**Description**: Instant notifications cho all users về relevant events

**Notification Types**:

**For Candidates**:
- Application status changes
- New job matches
- Interview invitations
- Application deadlines approaching
- Profile completion reminders
- Job alerts based on saved searches

**For Recruiters**:
- New applications received
- Candidate profile updates
- Interview confirmations/cancellations
- Application deadline reminders
- Team collaboration notifications

**For Universities**:
- Student application activities
- New partnership opportunities
- Internship program updates
- Placement statistics updates

**Delivery Channels**:
- In-app notifications (real-time via WebSocket)
- Push notifications (PWA/mobile app)
- Email notifications (configurable frequency)
- SMS notifications (for critical updates)

**Main Flow**:
1. System event triggers notification
2. System determines affected users
3. System checks user notification preferences
4. System sends via appropriate channels
5. System tracks delivery status
6. System handles failed deliveries với retry logic

**Business Rules**:
- BR-NOTIF-001: Users can configure notification preferences
- BR-NOTIF-002: Critical notifications cannot be disabled
- BR-NOTIF-003: Email digest option (daily/weekly)
- BR-NOTIF-004: Notifications expire after 30 days

#### FR-NOTIF-002: Notification Center
**Description**: Centralized location để view và manage notifications

**Features**:
- Mark as read/unread
- Archive old notifications
- Search notifications
- Filter by type/date
- Bulk operations (mark all as read, delete)

**Main Flow**:
1. User clicks notification icon
2. System shows notification list
3. User can click notification để view details
4. System marks notification as read
5. User can perform actions (archive, delete)

### 3.6 Communication Module

#### FR-COMM-001: Messaging System
**Description**: Direct communication giữa recruiters và candidates

**Message Types**:
- Text messages
- File attachments
- Interview scheduling
- Automated system messages

**Features**:
- Real-time chat interface
- Message history
- File sharing (documents, images)
- Message status (sent, delivered, read)
- Typing indicators

**Main Flow**:
1. Recruiter/Candidate initiates conversation
2. Users exchange messages in real-time
3. System delivers messages via WebSocket
4. System stores message history
5. System sends email notification for offline users

**Business Rules**:
- BR-COMM-001: Messages only between recruiter-candidate pairs
- BR-COMM-002: File attachments max 25MB
- BR-COMM-003: Message history retained for 2 years
- BR-COMM-004: Automated moderation for inappropriate content

#### FR-COMM-002: Video Interview Integration
**Description**: Integrated video calling cho remote interviews

**Features**:
- Schedule video interviews
- One-click join from platform
- Screen sharing capability
- Interview recording (with consent)
- Calendar integration

**Third-party Integration**:
- Zoom API integration
- Google Meet integration
- Microsoft Teams integration

**Main Flow**:
1. Recruiter schedules video interview
2. System sends calendar invites
3. Participants join via platform links
4. System tracks interview completion
5. System stores interview notes và recordings

### 3.7 Analytics & Reporting Module

#### FR-ANALYTICS-001: User Analytics Dashboard
**Description**: Personalized analytics cho each user type

**Student Analytics**:
- Application success rate
- Profile views và job matches
- Skill gap analysis
- Industry interest trends
- Interview performance metrics

**Company Analytics**:
- Job posting performance
- Application quality metrics
- Time-to-hire statistics
- Candidate source analysis
- Hiring funnel conversion rates

**University Analytics**:
- Student placement rates
- Industry partnership success
- Program popularity trends
- Alumni network engagement

**Main Flow**:
1. User accesses analytics dashboard
2. System displays relevant metrics
3. User can filter by date range
4. User can export reports
5. System updates data in real-time

#### FR-ANALYTICS-002: System-wide Reporting
**Description**: Admin-level reporting và insights

**Report Types**:
- Platform usage statistics
- User growth metrics
- Job market trends
- Feature adoption rates
- Performance monitoring

**Export Formats**:
- PDF reports
- Excel spreadsheets
- CSV data exports
- API data access

## 4. Integration Requirements

### 4.1 External API Integrations

#### INT-001: Email Service Integration
- **Provider**: SendGrid / AWS SES
- **Purpose**: Transactional emails, newsletters
- **Features**: Template management, delivery tracking, bounce handling

#### INT-002: File Storage Integration
- **Provider**: AWS S3 / Google Cloud Storage
- **Purpose**: Resume uploads, company media, profile photos
- **Features**: CDN delivery, image optimization, virus scanning

#### INT-003: Payment Processing
- **Provider**: Stripe / PayPal
- **Purpose**: Premium subscriptions, job posting fees
- **Features**: Subscription management, invoice generation, refund processing

#### INT-004: Maps & Location Services
- **Provider**: Google Maps API
- **Purpose**: Location search, office locations, job mapping
- **Features**: Geocoding, distance calculation, map visualization

### 4.2 University System Integration

#### INT-005: Student Information System (SIS)
- **Purpose**: Student data synchronization
- **Data Exchange**: Student profiles, academic records, enrollment status
- **Security**: API authentication, data encryption, audit logging

#### INT-006: Learning Management System (LMS)
- **Purpose**: Course completion tracking, skill verification
- **Data Exchange**: Course completions, certificates, grades
- **Integration Method**: REST API, webhook notifications

## 5. Data Requirements

### 5.1 Data Models

#### User Data Model
```
User {
  id: UUID
  email: String (unique)
  password_hash: String
  user_type: Enum (student, company, university, admin)
  profile: UserProfile
  created_at: DateTime
  updated_at: DateTime
  last_login: DateTime
  status: Enum (active, inactive, suspended)
}
```

#### Job Data Model
```
Job {
  id: UUID
  company_id: UUID
  title: String
  description: Text
  requirements: Array<String>
  job_type: Enum (full_time, part_time, internship, contract)
  experience_level: Enum (entry, mid, senior)
  location: Location
  salary_range: SalaryRange
  status: Enum (draft, active, closed, expired)
  created_at: DateTime
  expires_at: DateTime
}
```

#### Application Data Model
```
Application {
  id: UUID
  job_id: UUID
  candidate_id: UUID
  status: Enum (submitted, reviewing, interview, offer, hired, rejected)
  cover_letter: Text
  resume_url: String
  additional_documents: Array<String>
  applied_at: DateTime
  status_history: Array<StatusChange>
}
```

### 5.2 Data Validation Rules

#### Email Validation
- Valid email format (RFC 5322)
- Domain verification for company emails
- Blacklist check for disposable email services

#### File Upload Validation
- File size limits (Resume: 10MB, Images: 5MB)
- Allowed file types (PDF, DOC, DOCX, JPG, PNG)
- Virus scanning before storage
- File content validation

#### Profile Data Validation
- Phone number format validation
- GPA range validation (0.0-4.0)
- Date validation (graduation dates, work experience)
- Required field validation by user type

---

**Document Owner**: Technical Lead  
**Reviewed By**: Product Manager  
**Next Review Date**: August 12, 2025
