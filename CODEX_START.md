# CODEX_START.md — Smart University ERP System

## READ THIS FIRST

You are building a database-centric Smart University ERP System for a DBMS subject project.

The primary evaluation criteria are:
- MongoDB schema design
- Relationships between collections
- Aggregation pipelines
- Role-based architecture
- Distributed modules
- Scalable backend structure
- Proper API design

UI beauty is secondary. Functionality and database engineering matter more.

Humans somehow turned “semester project” into “mini enterprise SaaS platform.” Academic suffering truly scales horizontally.

---

## EXECUTION RULES

1. Read this file completely first
2. Then read:
   - docs/architecture/stack.md
   - docs/database/schemas.md
3. Execute sprints IN ORDER
4. Never skip a sprint
5. Never merge multiple sprints together
6. Finish backend before frontend in every sprint
7. Every feature must have:
   - Mongoose schema
   - Validation
   - Routes
   - Controllers
   - Middleware protection
   - Error handling

---

## TECH STACK

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| Authentication | JWT + bcryptjs |
| Validation | Zod |
| Testing | Jest + Supertest |

---

## SYSTEM MODULES

### Core Modules
- Authentication
- Student Portal
- Teacher Dashboard
- Attendance System
- Exams & Results
- Fee Management
- Course Management
- Notifications
- Role Management
- Analytics Dashboard

### Distributed Modules
Every module should be isolated:
- auth/
- students/
- teachers/
- attendance/
- exams/
- fees/
- analytics/

Each module contains:
- routes
- controllers
- models
- validators
- services

---

## ROLES

| Role | Permissions |
|---|---|
| admin | Full system access |
| teacher | Manage attendance, marks, courses |
| student | View profile, attendance, results, fees |

---

## PROJECT STRUCTURE

```txt
smart-university-erp/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── routes/
│   │   ├── context/
│   │   └── utils/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── modules/
│   │   └── tests/
│
├── docs/
│   ├── architecture/
│   └── database/
│
└── README.md
```

---

## DEVELOPMENT RULES

- Use MVC architecture
- Use asyncHandler wrapper for async controllers
- Never write MongoDB queries directly inside routes
- All protected routes require JWT middleware
- All inputs validated using Zod
- Every schema must define indexes
- Use timestamps: true in every schema
- Use pagination in large queries
- Use aggregation pipelines for analytics

---

## SPRINT ORDER

| Sprint | Focus |
|---|---|
| 01 | Foundation + Environment Setup |
| 02 | Authentication + Role Management |
| 03 | Student Management |
| 04 | Teacher Dashboard |
| 05 | Course Management |
| 06 | Attendance System |
| 07 | Exams + Results |
| 08 | Fee Management |
| 09 | Analytics + Aggregation |
| 10 | Scalability + Optimization |
| 11 | Testing + Deployment |

---

## DATABASE EXPECTATIONS

The database must demonstrate:
- One-to-many relationships
- Many-to-many relationships
- References using ObjectId
- Embedded documents
- Aggregation pipelines
- Indexing
- Pagination
- Query optimization

MongoDB professors love hearing “aggregation pipeline” the way medieval kings loved hearing “your enemies have been crushed.”