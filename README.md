# Smart University ERP System

Database Management System semester project using:
- React
- Tailwind CSS
- Node.js
- Express.js
- MongoDB

## Features
- Student Portal
- Attendance
- Exams
- Results
- Fee Management
- Teacher Dashboard
- Role Management
- Distributed Modules
- Analytics
- Large Scale Database Handling

## Setup

### Backend
```bash
cd backend
npm install
npm run dev
```

Create `backend/.env` from `backend/.env.example` and set `MONGODB_URI` to your MongoDB Atlas connection string before starting the API.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env` from `frontend/.env.example` if the API URL differs from `http://localhost:5000`.

## Sprint 01 Foundation
- Express API scaffold with security, CORS, request logging, async controller handling, and centralized errors
- MongoDB connection helper using Mongoose and environment variables
- JWT protection and role authorization middleware placeholders
- Vite React app with Tailwind CSS, React Router, and sidebar layout
- Backend health test for `GET /`

## Sprint 02 Authentication
- User schema with password hashing, unique email index, role enum, active status, and timestamps
- Auth routes: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/profile`
- Zod request validation for email, password length, and role values
- JWT auth middleware with role authorization support
- React login/register pages, protected routes, logout, and local token storage

## Sprint 03 Student Management
- Student schema with `userId` reference, unique registration number, department/semester indexes, and timestamps
- Student APIs: `GET /api/students`, `POST /api/students`, `GET /api/students/:id`, `PUT /api/students/:id`, `DELETE /api/students/:id`
- Student profile endpoint: `GET /api/students/me`
- Aggregation endpoints: `GET /api/students/analytics/departments`, `GET /api/students/analytics/semesters`
- React student dashboard, searchable student table, pagination controls, and profile page

## Sprint 04 Teacher Dashboard
- Teacher schema with `userId` reference, unique employee ID, department indexes, and assigned course ObjectIds
- Teacher APIs: `GET /api/teachers`, `POST /api/teachers`, `GET /api/teachers/dashboard`
- Admin-only teacher creation with teacher-role account validation
- React teacher dashboard with assigned course cards and admin teacher listing

## Sprint 05 Course Management
- Course schema with teacher references, unique course codes, semester/teacher indexes, and timestamps
- Enrollment schema for student-course many-to-many relationships with a unique compound index
- Course APIs: `POST /api/courses`, `GET /api/courses`, `POST /api/enrollments`
- Aggregation endpoints for enrolled students per course and course count per teacher
- React course table, course creation form, enrollment form, and teacher roster view

## Sprint 06 Attendance System
- Attendance schema with student/course/teacher references, status enum, lecture date indexes, and duplicate prevention
- Attendance APIs: `POST /api/attendance`, `GET /api/attendance/student/:id`
- Aggregation endpoints for monthly attendance, student percentages, and defaulter lists
- React attendance marking form, student attendance table, and analytics bars

## Sprint 07 Exams + Results
- Exam schema with course reference, exam type enum, total marks, exam date, and indexes
- Result schema with exam/student references, computed grade/GPA, duplicate prevention, and GPA index
- Exam/result APIs: `POST /api/exams`, `GET /api/exams`, `POST /api/results`, `GET /api/results/student/:id`
- Aggregation endpoints for top students, average GPA, and subject-wise performance
- React exam scheduling, marks entry, student result table, and result analytics

## Sprint 08 Fee Management
- Fee schema with student references, semester/status indexes, payment status enum, and timestamps
- Fee APIs: `POST /api/fees`, `GET /api/fees/student/:id`
- Extra fee endpoints for due summaries and receipt generation
- React fee dashboard, admin fee generation, payment history, due alerts, and receipt view

## Sprint 09 Analytics + Aggregation
- Central analytics route: `GET /api/analytics/dashboard`
- Aggregation pipelines for department-wise students, attendance trends, fee revenue, GPA bands, and student growth
- Dashboard charts/cards powered by MongoDB `$group`, `$project`, `$sort`, and date grouping pipelines

## Sprint 10 Scalability + Optimization
- Additional created-date indexes for high-growth collections
- TTL cache middleware for expensive read-only analytics endpoints
- Performance test script: `npm run test:performance`
- Scalability notes in `docs/architecture/scalability.md`

## Sprint 11 Testing + Deployment
- Backend test coverage with Jest and Supertest
- Frontend route/auth tests with Vitest and Testing Library
- Deployment guide in `docs/deployment.md`
- Project report, ER diagram reference, and presentation outline in `docs/`

Because students apparently deserve ERP systems instead of simple spreadsheets and emotional stability.
