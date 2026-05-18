# Sprint 03 — Student Management

## Goal
Build student module and student portal.

## Models

### Student Model
- userId
- registrationNumber
- department
- semester
- session
- guardianName
- phone
- address

Indexes:
- registrationNumber
- department

## APIs
GET /api/students
POST /api/students
GET /api/students/:id
PUT /api/students/:id
DELETE /api/students/:id

## Features
- Student profile
- Student listing
- Search students
- Pagination

## Frontend
- Student dashboard
- Student profile page
- Student table
- Search bar

## Aggregation Tasks
- Count students department-wise
- Count semester-wise

Universities collect student data with the intensity of intelligence agencies but somehow still lose transcripts.