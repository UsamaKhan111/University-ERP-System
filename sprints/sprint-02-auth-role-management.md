# Sprint 02 — Authentication + Role Management

## Goal
Implement login, registration, JWT auth, and role middleware.

## Models Required

### User Model
Fields:
- fullName
- email
- password
- role
- isActive

Indexes:
- email unique

## Backend Tasks
- Register API
- Login API
- JWT generation
- Password hashing
- Role middleware

## Routes
POST /api/auth/register
POST /api/auth/login
GET /api/auth/profile

## Middleware
authorize(['admin'])
authorize(['teacher'])
authorize(['student'])

## Frontend Tasks
- Login page
- Register page
- Protected routes
- Store JWT token

## Validation Rules
- Password minimum 8 chars
- Email validation
- Role enum validation

## Acceptance Criteria
- User can login
- JWT works
- Protected routes blocked without token

Humanity invented authentication because apparently remembering one password was too peaceful.