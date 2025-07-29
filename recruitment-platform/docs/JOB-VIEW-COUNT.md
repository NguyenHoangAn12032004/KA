# Job View Count and Application Count Functionality

## Overview

This document explains how the job view count and application count functionality works in the recruitment platform. These features help track the popularity and engagement of job listings.

## Database Structure

### Tables

1. **jobs** - Contains the main job information
   - `viewCount`: Integer field that stores the total number of views for a job
   - `applicationsCount`: Integer field that stores the total number of applications for a job

2. **job_views** - Tracks individual view events
   - `id`: Unique identifier for each view event
   - `jobId`: Foreign key reference to the jobs table
   - `userId`: Optional reference to the user who viewed the job (null for anonymous views)
   - `ipAddress`: IP address of the viewer (for analytics)
   - `userAgent`: Browser/device information (for analytics)
   - `viewedAt`: Timestamp when the job was viewed

3. **applications** - Stores job applications
   - Each record represents one application for a job

### Database Triggers

The system uses PostgreSQL triggers to automatically update counters:

1. **sync_job_view_counts**
   - Triggers after a new record is inserted or deleted in the `job_views` table
   - Updates the `viewCount` field in the `jobs` table by counting records in `job_views`
   - Ensures the viewCount is always accurate and synchronized with actual view data

2. **sync_job_application_counts**
   - Triggers after a new record is inserted or deleted in the `applications` table
   - Updates the `applicationsCount` field in the `jobs` table by counting records in `applications`
   - Ensures application counts are always accurate even after deletions or additions

## API Endpoints

### View Count

- **GET /api/jobs/:id**
  - Returns job details and records a view event
  - Creates a record in the `job_views` table
  - The database trigger automatically updates the `viewCount` in the `jobs` table

- **POST /api/jobs/:id/view**
  - Dedicated endpoint for recording a job view
  - Does not require authentication (works for anonymous users)
  - Creates a record in the `job_views` table
  - Returns the updated view count and application count

### Application Count

The application count is automatically updated when:
- A user submits a new job application
- An application is deleted or withdrawn

## Frontend Implementation

### Displaying View and Application Counts

The view and application counts are displayed in:
1. **Job Cards** - Shows basic information including view and application counts
2. **Job Details** - Shows detailed information with more prominent display of counts

### Tracking Views

Views are tracked when:
1. A user clicks on a job card to view details
2. A user directly navigates to a job details page

### State Management

The frontend components:
1. Call the view tracking endpoint when a job is viewed
2. Update the local state with the returned view count
3. Ensure both `viewCount` and legacy `viewsCount` properties are handled properly

## Maintenance and Troubleshooting

### Synchronizing Counts

If the counts become out of sync with the actual data, run the update script:

```bash
# From the backend directory
node scripts/update-job-counts.js
```

Or use the batch file:

```bash
# From the backend directory
update-job-counts.bat
```

### Updating Database Triggers

If you need to update or reinstall the database triggers, use:

```bash
# From the backend directory
update-triggers.bat
```

### Testing

To test the functionality, run the comprehensive test script:

```bash
# From the backend directory
test-job-view-complete.bat
```

This test script verifies:
1. Direct database insertion of job views updates the view count
2. API endpoints correctly record job views
3. Application count triggers work for both insertions and deletions
4. All counts match the actual number of records in the database

### Common Issues

1. **Counts not updating**
   - Check if the database triggers are properly installed (use `update-triggers.bat`)
   - Verify that the API endpoints are being called correctly
   - Run the update script to manually synchronize counts

2. **Counts resetting on page refresh**
   - This was fixed by ensuring consistent use of the JobView model and database triggers
   - If it recurs, check frontend state management and API response handling

3. **Inconsistent view counts between viewCount and viewsCount**
   - The frontend now handles both properties, preferring viewCount but falling back to viewsCount
   - Run the update script to ensure consistency

## Future Enhancements

1. **Time-based analytics**
   - Track views and applications over time periods
   - Generate charts and reports

2. **User-based analytics**
   - Analyze which users view and apply to which jobs
   - Provide personalized recommendations

3. **Unique view counting**
   - Count unique views based on user or session
   - Implement more sophisticated tracking mechanisms 