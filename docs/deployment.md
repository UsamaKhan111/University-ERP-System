# Deployment Guide

## Backend: Render or Railway
1. Create a new Node.js service from the GitHub repository.
2. Set the root directory to `backend`.
3. Build command: `npm install`.
4. Start command: `npm start`.
5. Add environment variables from `backend/.env.example`.

Required backend variables:
- `NODE_ENV=production`
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_URL`

## Frontend: Vercel
1. Create a new Vercel project from the GitHub repository.
2. Set the root directory to `frontend`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Set `VITE_API_URL` to the deployed backend URL.

## Database: MongoDB Atlas
1. Create an Atlas cluster.
2. Create a database user.
3. Add the backend host IP or `0.0.0.0/0` for controlled demo deployments.
4. Copy the connection string into `MONGODB_URI`.
5. Use the API flows to seed users, students, teachers, courses, attendance, exams, results, and fees.
