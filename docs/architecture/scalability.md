# Scalability and Optimization Notes

## Query Patterns
- Large list endpoints use pagination through `getPagination()`.
- Read-heavy list queries use `.lean()` to avoid unnecessary Mongoose document hydration.
- Controllers delegate database work to services so query optimization stays module-local.

## Index Coverage
- `users`: email, role + active status
- `students`: registration number, user, department, semester, department + semester
- `teachers`: employee ID, user, department, department + specialization
- `courses`: course code, semester, teacher, semester + teacher
- `enrollments`: student + course unique compound index, student, course
- `attendance`: student/date, course/date, teacher/date, student + course + date unique compound index
- `results`: exam + student unique compound index, student, GPA
- `fees`: student, status + due date, semester + status

## Caching Structure
`backend/src/middleware/cacheMiddleware.js` provides a small TTL cache wrapper for expensive read-only JSON endpoints. It is currently used for the central analytics dashboard.

## Large Dataset Testing
`backend/src/tests/performance.test.js` covers pagination limits and cache expiry behavior. This gives the project a concrete scalability test target without requiring a seeded Atlas cluster.
