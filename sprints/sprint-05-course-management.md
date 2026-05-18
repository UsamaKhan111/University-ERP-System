# Sprint 05 — Course Management

## Models

### Course Model
- title
- courseCode
- semester
- creditHours
- teacherId

### Enrollment Model
- studentId
- courseId
- enrolledAt

## Features
- Create courses
- Assign teachers
- Enroll students

## APIs
POST /api/courses
GET /api/courses
POST /api/enrollments

## Aggregation
- Total enrolled students per course
- Course count per teacher

## Frontend
- Course management table
- Enrollment forms

Because universities adore making students register courses through interfaces designed like tax software from 2004.