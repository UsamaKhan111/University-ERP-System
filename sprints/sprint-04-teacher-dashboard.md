# Sprint 04 — Teacher Dashboard

## Models

### Teacher Model
- userId
- employeeId
- department
- specialization
- assignedCourses

Indexes:
- employeeId

## Features
- Teacher dashboard
- Assigned course view
- Student listing per course

## APIs
GET /api/teachers
GET /api/teachers/dashboard
POST /api/teachers

## Frontend
- Teacher dashboard UI
- Course cards
- Student tables

## Security
Only admin can create teachers.

Educational institutions trust teachers with hundreds of students but still require three signatures to replace a broken marker.