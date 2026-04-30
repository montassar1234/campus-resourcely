# Campus Resourcely

Campus Resourcely is a full-stack academic equipment reservation platform built to feel stronger than a generic CRUD project. It separates the student experience from the administration workspace and showcases a clean REST architecture with a modern frontend.

This repository is organized as a monorepo:

```text
campus-resourcely/
├── backend/   # Spring Boot REST API
└── frontend/  # React + TanStack Router client
```

## Why This Project Stands Out

- Separate student and admin portals
- Real reservation workflow instead of simple item listing
- Student self-service request form with profile capture
- Admin dashboards for students, resources, tags, and reservations
- RESTful backend with layered Spring Boot architecture
- Portfolio-ready frontend with a stronger visual identity than a default admin template

## Core Features

### Student Portal

- Student authentication
- Browse available resources
- Submit equipment borrowing requests
- View personal reservations
- Track active, returned, and overdue items

### Admin Portal

- Separate admin authentication
- Dashboard summary with resource and reservation metrics
- Manage students
- Manage resources
- Manage tags
- Manage reservations and returns

## Tech Stack

### Frontend

- React
- TanStack Router
- TanStack Query
- TypeScript
- Tailwind CSS
- Radix UI

### Backend

- Spring Boot
- Spring Web
- Spring Data JPA
- H2 Database
- Maven

## Authentication Demo Accounts

### Admin

- Username: `admin`
- Password: `admin123`

### Students

- `aminah@campus.edu` / `aminah123`
- `david@campus.edu` / `david123`
- `m.benali@campus.edu` / `student123`
- `y.ahyaoui@campus.edu` / `student123`
- `s.khider@campus.edu` / `student123`
- `n.mansouri@campus.edu` / `student123`

## Local Development

### 1. Run the backend

```powershell
cd backend
cmd /c mvnw.cmd spring-boot:run
```

The API runs on:

- `http://localhost:8080/api`

### 2. Run the frontend

```powershell
cd frontend
cmd /c npm.cmd install
cmd /c npm.cmd run dev -- --host 0.0.0.0 --port 3000
```

The frontend runs on:

- `http://localhost:3000`

## Project Structure

### Frontend highlights

- `frontend/src/routes/index.tsx`: student authentication and student dashboard
- `frontend/src/routes/admin/`: admin-only routes and redirects
- `frontend/src/components/ReservationRequestDialog.tsx`: student request form
- `frontend/src/lib/auth.tsx`: client session handling

### Backend highlights

- `backend/src/main/java/com/academic/smartlibrary/controller/`: REST controllers
- `backend/src/main/java/com/academic/smartlibrary/service/`: business logic
- `backend/src/main/java/com/academic/smartlibrary/repository/`: data access
- `backend/src/main/java/com/academic/smartlibrary/config/DataSeeder.java`: demo data

## API Overview

Main REST areas:

- `/api/dashboard`
- `/api/students`
- `/api/resources`
- `/api/tags`
- `/api/reservations`

Student login endpoint:

- `POST /api/students/login`

Student request endpoint:

- `POST /api/reservations/request`

## Notes

- The backend currently uses H2 for simple academic/demo setup.
- CORS is configured for local frontend development on ports `3000` and `4200`.
- The project is intentionally structured to be easy to demo, extend, and present in an academic setting.

## Suggested Next Improvements

- Replace mock admin auth with backend-based authentication
- Add JWT authentication and role-based authorization
- Switch from H2 to PostgreSQL
- Deploy frontend and backend online
- Add screenshots and a short demo video to this README
