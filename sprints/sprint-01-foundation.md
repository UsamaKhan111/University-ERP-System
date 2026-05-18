# Sprint 01 — Foundation + Environment Setup

## Goal
Initialize MERN architecture and connect MongoDB.

## Backend Tasks

### Install Packages
```bash
npm install express mongoose dotenv cors helmet morgan bcryptjs jsonwebtoken zod
npm install -D nodemon jest supertest
```

### Create Backend Structure
- config/
- routes/
- controllers/
- models/
- middleware/
- validators/
- services/
- utils/

### Create Files
- server.js
- config/db.js
- middleware/errorHandler.js
- middleware/authMiddleware.js

### Configure MongoDB
- Use mongoose.connect()
- Use environment variables
- Add connection logs

### Create Base Route
GET /
Returns:
```json
{
  "success": true,
  "message": "University ERP API Running"
}
```

## Frontend Tasks
- Create Vite React app
- Install Tailwind CSS
- Configure routing
- Create sidebar layout

## Acceptance Criteria
- Backend starts successfully
- Frontend loads successfully
- MongoDB connection works
- Tailwind works

Because nothing says “academic learning” like spending six hours debugging environment variables.