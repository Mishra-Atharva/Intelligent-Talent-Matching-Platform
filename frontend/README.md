# Intelligent Talent Matching Platform - Backend API Documentation

## Overview

This is the backend API for the Intelligent Talent Matching Platform, built with FastAPI and PostgreSQL. It handles all user authentication, profile management, job postings, applications, and alerts.

## Base URL

```
http://localhost:8000/api
```

## API Structure

The API is organized by resource with the following prefixes:

- `/user` - User authentication
- `/candidate/profile` - Candidate profiles
- `/candidate/experience` - Candidate work experience
- `/candidate/skills` - Candidate skills
- `/employer/profile` - Employer profiles
- `/jobs` - Job postings
- `/jobs/skills` - Required skills for job postings
- `/applications` - Job applications
- `/saved-jobs` - Candidate saved jobs
- `/invites` - Employer invites to candidates
- `/alert` - User alerts

## Frontend Auth Updates

The `/api/user/register` and `/api/user/authenticate` endpoints now return the `type` field with values `Candidate` or `Employer` and a boolean `premium` field.

Employer signup is supported by sending the company name in `first_name` and leaving `last_name` empty if needed. This matches the frontend's existing behavior and allows the app to determine the appropriate pages to show.

---

## User Endpoints

### Register User
**POST** `/api/user/register`

Create a new user account as a Candidate or an Employer.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe"
}
```

- If `last_name` is present, the account is created as `Candidate`.
- If `last_name` is empty or omitted, the account is created as `Employer` and the frontend can send the company name in `first_name`.

**Response:** `201 Created`
```json
{
  "user_id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "type": "Candidate",
  "premium": false,
  "token": "jwt_token_here"
}
```

### Authenticate User
**POST** `/api/user/authenticate`

Login and get an authentication token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:** `200 OK`
```json
{
  "user_id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "type": "Employer",
  "premium": false,
  "token": "jwt_token_here"
}
```

### Notes for Frontend
- The response includes `type`: `Candidate` or `Employer`.
- The response includes `premium`: `true` or `false`.
- For employer signup, send company name in `first_name` and use `last_name` as an empty string if needed.
- The generated JWT token is in the `token` field.

### Development CORS / Proxy
- The backend must allow CORS from the frontend origin in production or when running separately.
- For local development the frontend is configured to proxy `/api` requests to the backend to avoid CORS issues. See `vite.config.js` — the dev server proxies `/api` to `http://localhost:8000`.
- You can either enable CORS on the backend for `http://localhost:5175` (or your dev server port) or use the proxy. For production, set `VITE_API_URL` to the backend base URL.

---

## Candidate Profile Endpoints

### Create Candidate Profile
**POST** `/api/candidate/profile/create`

Create a detailed candidate profile.

**Request Body:**
```json
{
  "user_id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "age": 28,
  "phone": "+1234567890",
  "location": "New York, NY",
  "education_level": "Bachelor's",
  "major": "Computer Science",
  "university": "MIT",
  "graduation_year": "2020",
  "years_of_experience": "5",
  "preferred_work_mode": "Remote",
  "preferred_location": "Remote",
  "summary": "Experienced full-stack developer..."
}
```

**Response:** `201 Created`
```json
{
  "profile_id": 1,
  "user_id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "age": 28,
  "phone": "+1234567890",
  "location": "New York, NY",
  "education_level": "Bachelor's",
  "major": "Computer Science",
  "university": "MIT",
  "graduation_year": "2020",
  "years_of_experience": "5",
  "preferred_work_mode": "Remote",
  "preferred_location": "Remote",
  "summary": "Experienced full-stack developer...",
  "updated_at": "2026-06-05T10:30:00"
}
```

### Get Candidate Profile
**GET** `/api/candidate/profile/{profile_id}`

Retrieve a candidate's profile by ID.

**Response:** `200 OK`
```json
{
  "profile_id": 1,
  "user_id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "age": 28,
  "phone": "+1234567890",
  "location": "New York, NY",
  "education_level": "Bachelor's",
  "major": "Computer Science",
  "university": "MIT",
  "graduation_year": "2020",
  "years_of_experience": "5",
  "preferred_work_mode": "Remote",
  "preferred_location": "Remote",
  "summary": "Experienced full-stack developer...",
  "updated_at": "2026-06-05T10:30:00"
}
```

### Update Candidate Profile
**PUT** `/api/candidate/profile/{profile_id}`

Update candidate profile information.

**Request Body:** (All fields optional)
```json
{
  "first_name": "John",
  "age": 29,
  "summary": "Updated summary..."
}
```

**Response:** `200 OK` - Same as Get Candidate Profile

### Delete Candidate Profile
**DELETE** `/api/candidate/profile/{profile_id}`

Delete a candidate profile.

**Response:** `200 OK`
```json
{
  "message": "Profile deleted successfully"
}
```

---

## Candidate Work Experience Endpoints

### Add Work Experience
**POST** `/api/candidate/experience/create`

Add work experience to candidate profile.

**Request Body:**
```json
{
  "user_id": 1,
  "company": "Tech Company Inc",
  "role": "Senior Developer",
  "start_date": "2020-01-15",
  "end_date": "2023-06-30"
}
```

**Response:** `201 Created`
```json
{
  "experience_id": 1,
  "user_id": 1,
  "company": "Tech Company Inc",
  "role": "Senior Developer",
  "start_date": "2020-01-15",
  "end_date": "2023-06-30"
}
```

### Get Work Experience
**GET** `/api/candidate/experience/{experience_id}`

**Response:** `200 OK` - Same as Add Work Experience response

### Update Work Experience
**PUT** `/api/candidate/experience/{experience_id}`

**Request Body:** (All fields optional)
```json
{
  "company": "New Company",
  "role": "Lead Developer"
}
```

**Response:** `200 OK` - Same as Add Work Experience response

### Delete Work Experience
**DELETE** `/api/candidate/experience/{experience_id}`

**Response:** `200 OK`
```json
{
  "message": "Experience deleted successfully"
}
```

---

## Candidate Skills Endpoints

### Add Skill
**POST** `/api/candidate/skills/add`

Add a skill to candidate profile.

**Request Body:**
```json
{
  "user_id": 1,
  "skill": "Python"
}
```

**Response:** `201 Created`
```json
{
  "skill_id": 1,
  "user_id": 1,
  "skill": "Python"
}
```

### Get Skill
**GET** `/api/candidate/skills/{skill_id}`

**Response:** `200 OK` - Same as Add Skill response

### Get All User Skills
**GET** `/api/candidate/skills/user/{user_id}`

**Response:** `200 OK`
```json
[
  {
    "skill_id": 1,
    "user_id": 1,
    "skill": "Python"
  },
  {
    "skill_id": 2,
    "user_id": 1,
    "skill": "JavaScript"
  }
]
```

### Delete Skill
**DELETE** `/api/candidate/skills/{skill_id}`

**Response:** `200 OK`
```json
{
  "message": "Skill deleted successfully"
}
```

---

## Employer Profile Endpoints

### Create Employer Profile
**POST** `/api/employer/profile/create`

Create an employer company profile.

**Request Body:**
```json
{
  "user_id": 2,
  "company_name": "Tech Company Inc",
  "industry": "Technology",
  "company_size": "500-1000",
  "location": "San Francisco, CA",
  "website": "https://techcompany.com",
  "established": "2010",
  "description": "We are a leading tech company..."
}
```

**Response:** `201 Created`
```json
{
  "profile_id": 1,
  "user_id": 2,
  "company_name": "Tech Company Inc",
  "industry": "Technology",
  "company_size": "500-1000",
  "location": "San Francisco, CA",
  "website": "https://techcompany.com",
  "established": "2010",
  "description": "We are a leading tech company...",
  "updated_at": "2026-06-05T10:30:00"
}
```

### Get Employer Profile
**GET** `/api/employer/profile/{profile_id}`

**Response:** `200 OK` - Same as Create Employer Profile response

### Update Employer Profile
**PUT** `/api/employer/profile/{profile_id}`

**Request Body:** (All fields optional)
```json
{
  "company_name": "Updated Company Name",
  "description": "Updated description..."
}
```

**Response:** `200 OK` - Same as Create Employer Profile response

### Delete Employer Profile
**DELETE** `/api/employer/profile/{profile_id}`

**Response:** `200 OK`
```json
{
  "message": "Profile deleted successfully"
}
```

---

## Job Posting Endpoints

### Create Job Posting
**POST** `/api/jobs/create`

Create a new job posting.

**Request Body:**
```json
{
  "employer_id": 1,
  "title": "Senior Python Developer",
  "description": "We are looking for an experienced Python developer...",
  "location": "San Francisco, CA",
  "work_mode": "Remote",
  "employment_type": "Full-time",
  "experience_required": "5+ years",
  "education_required": "Bachelor's in CS",
  "salary": "$120,000 - $150,000",
  "start_date": "2026-07-01",
  "end_date": "2026-12-31",
  "status": "Active"
}
```

**Response:** `201 Created`
```json
{
  "job_id": 1,
  "employer_id": 1,
  "title": "Senior Python Developer",
  "description": "We are looking for an experienced Python developer...",
  "location": "San Francisco, CA",
  "work_mode": "Remote",
  "employment_type": "Full-time",
  "experience_required": "5+ years",
  "education_required": "Bachelor's in CS",
  "salary": "$120,000 - $150,000",
  "start_date": "2026-07-01",
  "end_date": "2026-12-31",
  "status": "Active",
  "applicants": 0,
  "created_at": "2026-06-05T10:30:00",
  "updated_at": "2026-06-05T10:30:00"
}
```

### Get Job Posting
**GET** `/api/jobs/{job_id}`

**Response:** `200 OK` - Same as Create Job Posting response

### Update Job Posting
**PUT** `/api/jobs/{job_id}`

**Request Body:** (All fields optional)
```json
{
  "title": "Updated Job Title",
  "status": "Closed"
}
```

**Response:** `200 OK` - Same as Create Job Posting response

### Delete Job Posting
**DELETE** `/api/jobs/{job_id}`

**Response:** `200 OK`
```json
{
  "message": "Job posting deleted successfully"
}
```

---

## Job Posting Skills Endpoints

### Add Required Skill
**POST** `/api/jobs/skills/add`

Add a required skill to a job posting.

**Request Body:**
```json
{
  "job_id": 1,
  "skill": "Python"
}
```

**Response:** `201 Created`
```json
{
  "skill_id": 1,
  "job_id": 1,
  "skill": "Python"
}
```

### Get Skill
**GET** `/api/jobs/skills/{skill_id}`

**Response:** `200 OK` - Same as Add Required Skill response

### Get All Job Skills
**GET** `/api/jobs/skills/job/{job_id}`

**Response:** `200 OK`
```json
[
  {
    "skill_id": 1,
    "job_id": 1,
    "skill": "Python"
  },
  {
    "skill_id": 2,
    "job_id": 1,
    "skill": "Django"
  }
]
```

### Delete Skill
**DELETE** `/api/jobs/skills/{skill_id}`

**Response:** `200 OK`
```json
{
  "message": "Skill deleted successfully"
}
```

---

## Job Application Endpoints

### Create Application
**POST** `/api/applications/create`

Apply to a job posting.

**Request Body:**
```json
{
  "job_id": 1,
  "candidate_id": 1,
  "status": "Pending"
}
```

**Response:** `201 Created`
```json
{
  "application_id": 1,
  "job_id": 1,
  "candidate_id": 1,
  "status": "Pending",
  "applied_at": "2026-06-05T10:30:00"
}
```

### Get Application
**GET** `/api/applications/{application_id}`

**Response:** `200 OK` - Same as Create Application response

### Update Application Status
**PUT** `/api/applications/{application_id}`

**Request Body:**
```json
{
  "status": "Accepted"
}
```

**Response:** `200 OK` - Same as Create Application response

**Status Values:** `Pending`, `Reviewed`, `Accepted`, `Rejected`

### Delete Application
**DELETE** `/api/applications/{application_id}`

**Response:** `200 OK`
```json
{
  "message": "Application deleted successfully"
}
```

---

## Saved Jobs Endpoints

### Save Job
**POST** `/api/saved-jobs/save`

Save a job posting to candidate's list.

**Request Body:**
```json
{
  "candidate_id": 1,
  "job_id": 1
}
```

**Response:** `201 Created`
```json
{
  "saved_id": 1,
  "candidate_id": 1,
  "job_id": 1,
  "saved_at": "2026-06-05T10:30:00"
}
```

### Get Saved Job
**GET** `/api/saved-jobs/{saved_id}`

**Response:** `200 OK` - Same as Save Job response

### Get Candidate's Saved Jobs
**GET** `/api/saved-jobs/candidate/{candidate_id}`

**Response:** `200 OK`
```json
[
  {
    "saved_id": 1,
    "candidate_id": 1,
    "job_id": 1,
    "saved_at": "2026-06-05T10:30:00"
  },
  {
    "saved_id": 2,
    "candidate_id": 1,
    "job_id": 2,
    "saved_at": "2026-06-05T10:35:00"
  }
]
```

### Unsave Job
**DELETE** `/api/saved-jobs/{saved_id}`

**Response:** `200 OK`
```json
{
  "message": "Saved job removed successfully"
}
```

---

## Employer Invite Endpoints

### Send Invite
**POST** `/api/invites/create`

Send an invite to a candidate for a job.

**Request Body:**
```json
{
  "employer_id": 1,
  "candidate_id": 1,
  "job_id": 1,
  "message": "We think you'd be a great fit for this role!",
  "status": "Sent"
}
```

**Response:** `201 Created`
```json
{
  "invite_id": 1,
  "employer_id": 1,
  "candidate_id": 1,
  "job_id": 1,
  "message": "We think you'd be a great fit for this role!",
  "status": "Sent",
  "sent_at": "2026-06-05T10:30:00"
}
```

### Get Invite
**GET** `/api/invites/{invite_id}`

**Response:** `200 OK` - Same as Send Invite response

### Update Invite Status
**PUT** `/api/invites/{invite_id}`

**Request Body:**
```json
{
  "status": "Accepted"
}
```

**Response:** `200 OK` - Same as Send Invite response

**Status Values:** `Sent`, `Accepted`, `Declined`

### Delete Invite
**DELETE** `/api/invites/{invite_id}`

**Response:** `200 OK`
```json
{
  "message": "Invite deleted successfully"
}
```

---

## Alert Endpoints

### Create Alert
**POST** `/api/alert/create`

Create an alert/notification for a user.

**Request Body:**
```json
{
  "user_id": 1,
  "message": "New job matching your profile!",
  "status": "Unread"
}
```

**Response:** `201 Created`
```json
{
  "alert_id": 1,
  "user_id": 1,
  "message": "New job matching your profile!",
  "status": "Unread",
  "created_at": "2026-06-05T10:30:00"
}
```

### Get Alert
**GET** `/api/alert/{alert_id}`

**Response:** `200 OK` - Same as Create Alert response

### Get User's Alerts
**GET** `/api/alert/user/{user_id}`

**Response:** `200 OK`
```json
[
  {
    "alert_id": 1,
    "user_id": 1,
    "message": "New job matching your profile!",
    "status": "Unread",
    "created_at": "2026-06-05T10:30:00"
  },
  {
    "alert_id": 2,
    "user_id": 1,
    "message": "Your application was reviewed",
    "status": "Read",
    "created_at": "2026-06-04T15:20:00"
  }
]
```

### Mark Alert as Read
**PUT** `/api/alert/{alert_id}`

**Request Body:**
```json
{
  "status": "Read"
}
```

**Response:** `200 OK` - Same as Create Alert response

### Delete Alert
**DELETE** `/api/alert/{alert_id}`

**Response:** `200 OK`
```json
{
  "message": "Alert deleted successfully"
}
```

---

## Error Handling

All errors follow a standard format:

**400 Bad Request** - Invalid input data
```json
{
  "detail": "No fields to update"
}
```

**404 Not Found** - Resource not found
```json
{
  "detail": "Profile Not Found"
}
```

**409 Conflict** - Duplicate resource
```json
{
  "detail": "User Already Exists"
}
```

**422 Unprocessable Entity** - Invalid data format
```json
{
  "detail": "Invalid user_id"
}
```

**500 Internal Server Error** - Server error
```json
{
  "detail": "Internal Server Error"
}
```

---

## Common Status Values

### User Type
- `Candidate`
- `Employer`

### Work Mode
- `Remote`
- `Hybrid`
- `On-site`

### Employment Type
- `Full-time`
- `Part-time`
- `Contract`
- `Casual`
- `Internship`

### Application Status
- `Pending`
- `Reviewed`
- `Accepted`
- `Rejected`

### Invite Status
- `Sent`
- `Accepted`
- `Declined`

### Alert Status
- `Unread`
- `Read`

### Job Status
- `Active`
- `Closed`

---

## Implementation Notes

1. **Authentication**: Use the token returned from `/api/user/register` or `/api/user/authenticate` for authenticated requests (if required by backend).

2. **Optional Fields**: Fields marked as optional in request bodies can be omitted. Send only the fields you need to update.

3. **Date Format**: All dates should be in `YYYY-MM-DD` format. Timestamps are in ISO 8601 format.

4. **IDs**: All resource IDs are integers returned from creation endpoints.

5. **Unique Constraints**:
   - One profile per user (candidate and employer profiles)
   - One application per candidate per job
   - One saved job entry per candidate per job

6. **Cascading Deletes**: Deleting a user will cascade delete all related data (profiles, applications, etc.).

---

## Example Frontend Implementation Flow

### For Candidates:
1. Register: `POST /api/user/register`
2. Create Profile: `POST /api/candidate/profile/create`
3. Add Skills: `POST /api/candidate/skills/add`
4. Add Experience: `POST /api/candidate/experience/create`
5. Browse Jobs: `GET /api/jobs/{job_id}`
6. Apply: `POST /api/applications/create`
7. Save Job: `POST /api/saved-jobs/save`
8. Check Alerts: `GET /api/alert/user/{user_id}`

### For Employers:
1. Register: `POST /api/user/register`
2. Create Profile: `POST /api/employer/profile/create`
3. Post Job: `POST /api/jobs/create`
4. Add Skills: `POST /api/jobs/skills/add`
5. View Applications: `GET /api/applications/{application_id}`
6. Send Invite: `POST /api/invites/create`
7. Check Alerts: `GET /api/alert/user/{user_id}`
