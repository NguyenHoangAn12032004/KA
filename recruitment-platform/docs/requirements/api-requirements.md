# API Requirements Document
# Hệ Thống Quản Lý Tuyển Dụng & Thực Tập Real-time

**Phiên bản**: 1.0  
**Ngày tạo**: July 12, 2025  
**Người tạo**: Backend Architecture Team  

---

## 1. API Overview

### 1.1 API Design Principles
- **RESTful Design**: Follow REST conventions for HTTP APIs
- **GraphQL Support**: Flexible data fetching for complex queries
- **Real-time Updates**: WebSocket integration for live features
- **Version Control**: API versioning strategy (v1, v2, etc.)
- **Security First**: Authentication và authorization on all endpoints
- **Performance**: Optimized response times và caching strategies

### 1.2 Base URLs
- **Production**: `https://api.recruitment-platform.com/v1`
- **Staging**: `https://api-staging.recruitment-platform.com/v1`
- **Development**: `http://localhost:3000/api/v1`

### 1.3 Authentication
- **JWT Tokens**: Bearer token authentication
- **Refresh Tokens**: Automatic token renewal
- **API Keys**: For third-party integrations
- **OAuth 2.0**: Social login support

## 2. Authentication & Authorization APIs

### 2.1 User Authentication

#### POST /auth/register
**Description**: Register new user account

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "user_type": "student|company|university|admin",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+84987654321",
  "terms_accepted": true
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user_id": "uuid-4567-8901",
    "email": "user@example.com",
    "verification_required": true
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Email already exists
- `422 Unprocessable Entity`: Validation errors

#### POST /auth/login
**Description**: User login với email/password

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "remember_me": false
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "access_token": "jwt-token-here",
    "refresh_token": "refresh-token-here",
    "expires_in": 3600,
    "user": {
      "id": "uuid-4567-8901",
      "email": "user@example.com",
      "user_type": "student",
      "profile_complete": true,
      "last_login": "2025-07-12T10:30:00Z"
    }
  }
}
```

#### POST /auth/social/google
**Description**: Google OAuth login

**Request Body**:
```json
{
  "access_token": "google-oauth-token",
  "user_type": "student"
}
```

#### POST /auth/refresh
**Description**: Refresh access token

**Request Body**:
```json
{
  "refresh_token": "refresh-token-here"
}
```

#### POST /auth/logout
**Description**: Logout user và invalidate tokens

**Headers**: `Authorization: Bearer jwt-token`

#### POST /auth/forgot-password
**Description**: Request password reset

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

#### POST /auth/reset-password
**Description**: Reset password với token

**Request Body**:
```json
{
  "token": "reset-token",
  "new_password": "NewSecurePass123!"
}
```

### 2.2 Two-Factor Authentication

#### POST /auth/2fa/enable
**Description**: Enable 2FA for user account

**Headers**: `Authorization: Bearer jwt-token`

**Response**:
```json
{
  "success": true,
  "data": {
    "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "secret": "JBSWY3DPEHPK3PXP",
    "backup_codes": ["12345678", "87654321", ...]
  }
}
```

#### POST /auth/2fa/verify
**Description**: Verify 2FA setup

**Request Body**:
```json
{
  "code": "123456"
}
```

## 3. User Management APIs

### 3.1 User Profile Management

#### GET /users/profile
**Description**: Get current user profile

**Headers**: `Authorization: Bearer jwt-token`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-4567-8901",
    "email": "user@example.com",
    "user_type": "student",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+84987654321",
    "profile_photo": "https://cdn.example.com/photos/user.jpg",
    "profile_completion": 85,
    "created_at": "2025-07-01T00:00:00Z",
    "updated_at": "2025-07-12T10:30:00Z",
    "student_profile": {
      "university": "University of Technology",
      "degree": "Computer Science",
      "graduation_date": "2026-06-01",
      "gpa": 3.8,
      "skills": [
        {
          "name": "JavaScript",
          "proficiency": "advanced",
          "verified": true
        }
      ],
      "experience": [...],
      "education": [...],
      "projects": [...]
    }
  }
}
```

#### PUT /users/profile
**Description**: Update user profile

**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "phone": "+84987654321",
  "student_profile": {
    "university": "University of Technology",
    "degree": "Computer Science",
    "graduation_date": "2026-06-01",
    "gpa": 3.9
  }
}
```

#### POST /users/profile/photo
**Description**: Upload profile photo

**Request**: Multipart form data với image file

**Response**:
```json
{
  "success": true,
  "data": {
    "photo_url": "https://cdn.example.com/photos/user-new.jpg"
  }
}
```

#### GET /users/{user_id}
**Description**: Get public user profile (for recruiters viewing candidates)

**Headers**: `Authorization: Bearer jwt-token`

**Response**: Public profile data only

### 3.2 Skills Management

#### GET /users/skills
**Description**: Get user skills

#### POST /users/skills
**Description**: Add skill to user profile

**Request Body**:
```json
{
  "skill_name": "React.js",
  "proficiency": "intermediate",
  "years_experience": 2
}
```

#### PUT /users/skills/{skill_id}
**Description**: Update skill proficiency

#### DELETE /users/skills/{skill_id}
**Description**: Remove skill from profile

## 4. Job Management APIs

### 4.1 Job Listings

#### GET /jobs
**Description**: Search và filter jobs

**Query Parameters**:
- `q` (string): Search keywords
- `location` (string): Job location
- `job_type` (string): full_time|part_time|internship|contract
- `experience_level` (string): entry|mid|senior
- `salary_min` (number): Minimum salary
- `salary_max` (number): Maximum salary
- `company_size` (string): startup|small|medium|large
- `remote` (boolean): Remote work option
- `posted_since` (string): 24h|week|month
- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 20, max: 100)
- `sort` (string): relevance|date|salary

**Response**:
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job-uuid-1234",
        "title": "Frontend Developer Intern",
        "company": {
          "id": "company-uuid-5678",
          "name": "Tech Startup Inc",
          "logo": "https://cdn.example.com/logos/company.jpg",
          "industry": "Technology"
        },
        "location": {
          "city": "Ho Chi Minh City",
          "country": "Vietnam",
          "remote_option": true
        },
        "job_type": "internship",
        "experience_level": "entry",
        "salary_range": {
          "min": 5000000,
          "max": 8000000,
          "currency": "VND",
          "period": "monthly"
        },
        "description": "We are looking for...",
        "required_skills": ["HTML", "CSS", "JavaScript", "React"],
        "posted_date": "2025-07-10T00:00:00Z",
        "application_deadline": "2025-08-10T23:59:59Z",
        "applicant_count": 25,
        "view_count": 150,
        "is_featured": false,
        "is_saved": false,
        "match_score": 85
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_count": 200,
      "has_next": true,
      "has_previous": false
    },
    "filters_applied": {
      "location": "Ho Chi Minh City",
      "job_type": "internship"
    }
  }
}
```

#### GET /jobs/{job_id}
**Description**: Get detailed job information

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "job-uuid-1234",
    "title": "Frontend Developer Intern",
    "description": "Full detailed job description...",
    "requirements": "Detailed requirements...",
    "benefits": "Company benefits...",
    "company": {
      "id": "company-uuid-5678",
      "name": "Tech Startup Inc",
      "description": "Company description...",
      "website": "https://techstartup.com",
      "employee_count": 50,
      "founded_year": 2020,
      "culture_tags": ["innovative", "flexible", "remote-friendly"]
    },
    "location": {...},
    "salary_range": {...},
    "application_process": {
      "steps": ["Resume Review", "Phone Interview", "Technical Interview"],
      "estimated_duration": "2-3 weeks"
    },
    "similar_jobs": [...],
    "can_apply": true,
    "application_deadline": "2025-08-10T23:59:59Z"
  }
}
```

#### POST /jobs (Company/Recruiter only)
**Description**: Create new job posting

**Headers**: `Authorization: Bearer jwt-token`

**Request Body**:
```json
{
  "title": "Frontend Developer Intern",
  "description": "Job description...",
  "requirements": "Job requirements...",
  "job_type": "internship",
  "experience_level": "entry",
  "location": {
    "city": "Ho Chi Minh City",
    "address": "123 Tech Street",
    "remote_option": true,
    "hybrid_option": false
  },
  "salary_range": {
    "min": 5000000,
    "max": 8000000,
    "currency": "VND",
    "period": "monthly",
    "negotiable": true
  },
  "required_skills": ["HTML", "CSS", "JavaScript"],
  "preferred_skills": ["React", "TypeScript"],
  "application_deadline": "2025-08-10T23:59:59Z",
  "number_of_positions": 2,
  "benefits": ["Health insurance", "Flexible hours"],
  "application_questions": [
    {
      "question": "Why are you interested in this position?",
      "required": true,
      "type": "text"
    }
  ]
}
```

#### PUT /jobs/{job_id}
**Description**: Update job posting

#### DELETE /jobs/{job_id}
**Description**: Delete job posting

#### POST /jobs/{job_id}/duplicate
**Description**: Duplicate existing job posting

### 4.2 Job Recommendations

#### GET /jobs/recommendations
**Description**: Get personalized job recommendations

**Headers**: `Authorization: Bearer jwt-token`

**Query Parameters**:
- `limit` (number): Number of recommendations (default: 20)
- `refresh` (boolean): Force refresh recommendations

**Response**:
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "job": {...}, // Same structure as job listing
        "match_score": 92,
        "match_reasons": [
          "Skills match: JavaScript, React",
          "Location preference match",
          "Experience level appropriate"
        ],
        "recommendation_id": "rec-uuid-1234"
      }
    ],
    "last_updated": "2025-07-12T10:30:00Z"
  }
}
```

#### POST /jobs/recommendations/feedback
**Description**: Provide feedback on job recommendations

**Request Body**:
```json
{
  "recommendation_id": "rec-uuid-1234",
  "feedback": "positive|negative",
  "reason": "not_interested|applied|salary_too_low|location_mismatch"
}
```

## 5. Application Management APIs

### 5.1 Job Applications

#### POST /applications
**Description**: Submit job application

**Headers**: `Authorization: Bearer jwt-token`

**Request Body**:
```json
{
  "job_id": "job-uuid-1234",
  "cover_letter": "Dear Hiring Manager...",
  "resume_file_id": "file-uuid-5678",
  "additional_documents": ["file-uuid-9012", "file-uuid-3456"],
  "application_answers": [
    {
      "question_id": "q1",
      "answer": "I am interested because..."
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "application_id": "app-uuid-7890",
    "status": "submitted",
    "submitted_at": "2025-07-12T10:30:00Z",
    "message": "Application submitted successfully"
  }
}
```

#### GET /applications
**Description**: Get user's job applications

**Query Parameters**:
- `status` (string): Filter by status
- `company_id` (string): Filter by company
- `page` (number): Pagination
- `limit` (number): Results per page

**Response**:
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "app-uuid-7890",
        "job": {
          "id": "job-uuid-1234",
          "title": "Frontend Developer Intern",
          "company": {...}
        },
        "status": "under_review",
        "status_history": [
          {
            "status": "submitted",
            "timestamp": "2025-07-12T10:30:00Z",
            "note": "Application received"
          },
          {
            "status": "under_review",
            "timestamp": "2025-07-13T09:00:00Z",
            "note": "Resume reviewed by HR"
          }
        ],
        "submitted_at": "2025-07-12T10:30:00Z",
        "last_updated": "2025-07-13T09:00:00Z",
        "next_step": "Phone interview scheduling",
        "estimated_response_time": "3-5 business days"
      }
    ],
    "summary": {
      "total": 15,
      "submitted": 5,
      "under_review": 3,
      "interview": 2,
      "offer": 1,
      "rejected": 4
    }
  }
}
```

#### GET /applications/{application_id}
**Description**: Get detailed application information

#### PUT /applications/{application_id}/withdraw
**Description**: Withdraw job application

#### GET /applications/stats
**Description**: Get application statistics for user

### 5.2 Application Management (Recruiter APIs)

#### GET /companies/{company_id}/applications
**Description**: Get applications for company jobs

**Headers**: `Authorization: Bearer jwt-token` (Recruiter role)

**Query Parameters**:
- `job_id` (string): Filter by specific job
- `status` (string): Filter by application status
- `date_from` (string): Filter applications from date
- `date_to` (string): Filter applications to date
- `search` (string): Search candidate names
- `sort` (string): application_date|rating|name

**Response**:
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "app-uuid-7890",
        "candidate": {
          "id": "user-uuid-4567",
          "name": "John Doe",
          "email": "john@example.com",
          "profile_photo": "https://cdn.example.com/photos/john.jpg",
          "university": "University of Technology",
          "graduation_date": "2026-06-01",
          "gpa": 3.8
        },
        "job": {
          "id": "job-uuid-1234",
          "title": "Frontend Developer Intern"
        },
        "status": "under_review",
        "rating": null,
        "notes": [],
        "submitted_at": "2025-07-12T10:30:00Z",
        "resume_url": "https://cdn.example.com/resumes/john-doe.pdf",
        "cover_letter": "Dear Hiring Manager...",
        "match_score": 85
      }
    ],
    "pagination": {...},
    "summary": {
      "total_applications": 150,
      "new_applications": 25,
      "in_review": 40,
      "interviews_scheduled": 15,
      "offers_extended": 5
    }
  }
}
```

#### PUT /applications/{application_id}/status
**Description**: Update application status (Recruiter only)

**Request Body**:
```json
{
  "status": "phone_screen|interview|offer|hired|rejected",
  "note": "Candidate has strong technical skills",
  "rating": 4,
  "next_step": "Schedule technical interview",
  "internal_notes": "Internal recruiter notes"
}
```

#### POST /applications/bulk-update
**Description**: Bulk update multiple applications

**Request Body**:
```json
{
  "application_ids": ["app-1", "app-2", "app-3"],
  "action": "reject|move_to_interview|rate",
  "data": {
    "status": "rejected",
    "note": "Position filled"
  }
}
```

## 6. Real-time Communication APIs

### 6.1 WebSocket Connection

#### WebSocket Endpoint: `/ws`
**Description**: Real-time communication channel

**Connection Parameters**:
- `token` (string): JWT authentication token
- `user_id` (string): User identifier

**Event Types**:

#### Client → Server Events:
```json
{
  "type": "join_room",
  "data": {
    "room": "application_updates",
    "application_id": "app-uuid-7890"
  }
}
```

```json
{
  "type": "typing_start",
  "data": {
    "conversation_id": "conv-uuid-1234"
  }
}
```

#### Server → Client Events:
```json
{
  "type": "application_status_changed",
  "data": {
    "application_id": "app-uuid-7890",
    "old_status": "submitted",
    "new_status": "under_review",
    "updated_by": "recruiter@company.com",
    "note": "Resume reviewed",
    "timestamp": "2025-07-13T09:00:00Z"
  }
}
```

```json
{
  "type": "new_job_match",
  "data": {
    "job": {...},
    "match_score": 88,
    "match_reasons": [...]
  }
}
```

```json
{
  "type": "message_received",
  "data": {
    "conversation_id": "conv-uuid-1234",
    "message": {
      "id": "msg-uuid-5678",
      "sender_id": "user-uuid-9012",
      "content": "Hello, I wanted to discuss...",
      "timestamp": "2025-07-13T10:15:00Z",
      "message_type": "text"
    }
  }
}
```

### 6.2 Notifications API

#### GET /notifications
**Description**: Get user notifications

**Query Parameters**:
- `unread_only` (boolean): Show only unread notifications
- `type` (string): Filter by notification type
- `page` (number): Pagination

**Response**:
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-uuid-1234",
        "type": "application_status_changed",
        "title": "Application Status Updated",
        "message": "Your application for Frontend Developer has been moved to interview stage",
        "data": {
          "application_id": "app-uuid-7890",
          "job_title": "Frontend Developer",
          "company_name": "Tech Startup Inc"
        },
        "read": false,
        "created_at": "2025-07-13T09:00:00Z",
        "action_url": "/applications/app-uuid-7890"
      }
    ],
    "unread_count": 5,
    "pagination": {...}
  }
}
```

#### PUT /notifications/{notification_id}/read
**Description**: Mark notification as read

#### PUT /notifications/read-all
**Description**: Mark all notifications as read

#### DELETE /notifications/{notification_id}
**Description**: Delete notification

### 6.3 Messaging API

#### GET /conversations
**Description**: Get user's conversations

**Response**:
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conv-uuid-1234",
        "participant": {
          "id": "user-uuid-5678",
          "name": "Jane Smith",
          "role": "recruiter",
          "company": "Tech Startup Inc",
          "profile_photo": "https://cdn.example.com/photos/jane.jpg"
        },
        "related_application": {
          "id": "app-uuid-7890",
          "job_title": "Frontend Developer"
        },
        "last_message": {
          "content": "Thank you for your application...",
          "timestamp": "2025-07-13T14:30:00Z",
          "sender_id": "user-uuid-5678"
        },
        "unread_count": 2,
        "updated_at": "2025-07-13T14:30:00Z"
      }
    ]
  }
}
```

#### GET /conversations/{conversation_id}/messages
**Description**: Get conversation messages

#### POST /conversations/{conversation_id}/messages
**Description**: Send message in conversation

**Request Body**:
```json
{
  "content": "Thank you for your interest in our position...",
  "message_type": "text",
  "attachments": ["file-uuid-1234"]
}
```

## 7. File Management APIs

### 7.1 File Upload

#### POST /files/upload
**Description**: Upload file (resume, documents, images)

**Request**: Multipart form data

**Form Fields**:
- `file`: File to upload
- `file_type`: resume|document|image|portfolio
- `description`: Optional file description

**Response**:
```json
{
  "success": true,
  "data": {
    "file_id": "file-uuid-1234",
    "filename": "john-doe-resume.pdf",
    "file_type": "resume",
    "file_size": 245760,
    "upload_url": "https://cdn.example.com/files/john-doe-resume.pdf",
    "uploaded_at": "2025-07-12T10:30:00Z"
  }
}
```

#### GET /files/{file_id}
**Description**: Get file information

#### DELETE /files/{file_id}
**Description**: Delete uploaded file

#### GET /files/user
**Description**: Get user's uploaded files

## 8. Search & Analytics APIs

### 8.1 Search API

#### GET /search
**Description**: Universal search across jobs, companies, users

**Query Parameters**:
- `q` (string): Search query
- `type` (string): jobs|companies|users|all
- `filters` (object): Type-specific filters

#### GET /search/suggestions
**Description**: Get search suggestions và autocomplete

**Query Parameters**:
- `q` (string): Partial search query
- `type` (string): suggestions|recent|popular

### 8.2 Analytics API

#### GET /analytics/dashboard
**Description**: Get user dashboard analytics

**Response for Students**:
```json
{
  "success": true,
  "data": {
    "profile_views": {
      "total": 125,
      "this_week": 15,
      "trend": "up"
    },
    "application_stats": {
      "total_applications": 25,
      "response_rate": 0.6,
      "interview_rate": 0.3,
      "success_rate": 0.12
    },
    "job_matches": {
      "new_matches": 8,
      "match_quality": 0.78
    },
    "skill_insights": {
      "top_demanded_skills": ["React", "Node.js", "Python"],
      "skill_gaps": ["Docker", "AWS"]
    }
  }
}
```

#### GET /analytics/market-trends
**Description**: Get job market trends và insights

## 9. Admin APIs

### 9.1 User Management (Admin only)

#### GET /admin/users
**Description**: Get all users với filtering

#### PUT /admin/users/{user_id}/status
**Description**: Update user status (suspend, activate)

#### GET /admin/reports/platform-stats
**Description**: Get platform-wide statistics

### 9.2 Content Moderation

#### GET /admin/moderation/queue
**Description**: Get content pending moderation

#### PUT /admin/moderation/{item_id}/approve
**Description**: Approve content

#### PUT /admin/moderation/{item_id}/reject
**Description**: Reject content

## 10. Third-party Integrations

### 10.1 University Systems Integration

#### POST /integrations/sis/sync
**Description**: Sync student data from Student Information System

#### GET /integrations/university/{university_id}/students
**Description**: Get students from university system

### 10.2 Payment Integration

#### POST /payments/subscriptions
**Description**: Create subscription for premium features

#### GET /payments/invoices
**Description**: Get user's payment history

## 11. API Standards & Conventions

### 11.1 HTTP Status Codes
- `200 OK`: Successful GET, PUT, PATCH
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict
- `422 Unprocessable Entity`: Validation errors
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### 11.2 Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The provided data is invalid",
    "details": [
      {
        "field": "email",
        "message": "Email format is invalid"
      }
    ],
    "request_id": "req-uuid-1234"
  }
}
```

### 11.3 Rate Limiting
- **Authenticated users**: 1000 requests per hour
- **Anonymous users**: 100 requests per hour
- **File uploads**: 50 uploads per hour
- **Search API**: 500 requests per hour

### 11.4 Pagination
```json
{
  "data": [...],
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_count": 200,
    "page_size": 20,
    "has_next": true,
    "has_previous": false,
    "next_url": "/api/v1/jobs?page=2",
    "previous_url": null
  }
}
```

### 11.5 Filtering & Sorting
- **Filtering**: Use query parameters (`?status=active&location=hcmc`)
- **Sorting**: Use `sort` parameter (`?sort=-created_at,name`)
- **Field Selection**: Use `fields` parameter (`?fields=id,name,email`)

---

**Document Owner**: Backend Architecture Team  
**Reviewed By**: Frontend Team, QA Team  
**Next Review Date**: August 12, 2025
