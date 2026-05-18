# Smart University ERP System Project Report

## Overview
The Smart University ERP System is a MERN-based DBMS semester project focused on MongoDB schema design, relationships, aggregation pipelines, role-based access, and modular backend architecture.

## Architecture
- Frontend: React, Vite, React Router, Tailwind CSS
- Backend: Node.js, Express.js, Mongoose
- Database: MongoDB Atlas
- Auth: JWT and bcryptjs
- Validation: Zod
- Testing: Jest, Supertest, Vitest, Testing Library

## Database Concepts Demonstrated
- One-to-many: teacher to courses, student to fees
- Many-to-many: students to courses through enrollments
- References: ObjectId relationships across users, students, teachers, courses, exams, results, fees, and attendance
- Population for response shaping
- Aggregation pipelines for analytics, attendance, revenue, GPA, and department reports
- Indexing and pagination for scalable reads

## Role Access
- Admin: full management access
- Teacher: attendance, course dashboard, exams, results
- Student: own profile, attendance, results, and fees

## Testing Summary
- Backend route tests use Jest and Supertest.
- Frontend route/auth tests use Vitest and Testing Library.
- Performance utility tests cover pagination limits and TTL cache behavior.
