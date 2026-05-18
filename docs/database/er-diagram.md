# ER Diagram Reference

```txt
User
  1 -- 0..1 Student
  1 -- 0..1 Teacher

Teacher
  1 -- * Course

Student
  * -- * Course
       via Enrollment

Course
  1 -- * Attendance
  1 -- * Exam

Exam
  1 -- * Result

Student
  1 -- * Attendance
  1 -- * Result
  1 -- * Fee
```

## Collections
- `users`
- `students`
- `teachers`
- `courses`
- `enrollments`
- `attendance`
- `exams`
- `results`
- `fees`
- `notifications`
