# Sprint 07 — Exams + Results

## Models

### Exam Model
- courseId
- examType
- totalMarks
- examDate

### Result Model
- examId
- studentId
- obtainedMarks
- GPA
- grade

## Features
- Schedule exams
- Enter marks
- GPA calculation
- Result publication

## APIs
POST /api/exams
POST /api/results
GET /api/results/student/:id

## Aggregations
- Top students
- Average GPA
- Subject-wise performance

Few things unite humanity like converting learning into percentages and mild psychological damage.