# Architecture

bob is a fullstack SaaS/product engineering case built around a separated frontend and backend.

```text
Browser
  -> Next.js / React / TypeScript frontend
  -> Spring Boot REST API with JWT authentication
  -> Spring Data JPA
  -> PostgreSQL
```

Docker Compose currently provides local PostgreSQL. Redis, RabbitMQ, OpenAI API, Prometheus, Grafana, OpenTelemetry, AWS, Terraform, and Kubernetes are not implemented in this branch; they remain roadmap candidates.

## System Shape

- `frontend`: Next.js App Router application and operational workspace UI
- `backend`: Java/Spring Boot API, security, and domain logic
- `docs`: architecture, roadmap, and engineering documentation
- `docker-compose.yml`: local PostgreSQL service

The frontend communicates with the backend through HTTP APIs. The database is only accessed by the backend.

## Backend

The backend is a modular monolith. Current package areas:

- `com.bob.modules.auth`: user registration, login, current-user lookup, BCrypt password hashing, JWT issuing
- `com.bob.modules.leads`: lead records, status transitions, notes, activities, controllers, services, repositories, and DTOs
- `com.bob.modules.system`: application status endpoint
- `com.bob.shared.api`: consistent API error response and exception handling
- `com.bob.config`: configuration properties and Spring Security wiring

Spring Security runs statelessly. `/api/auth/register` and `/api/auth/login` are public, `/api/auth/me` requires a bearer token, operational APIs such as `/api/leads/**` require authentication, and `/actuator/health` remains public for local and CI health checks.

## Authentication Flow

1. The user registers or logs in from the frontend.
2. The frontend sends credentials to the Spring Boot auth endpoint.
3. The backend validates the request, checks a BCrypt password hash, and returns a signed JWT.
4. The frontend stores the token in a practical stage-one cookie.
5. Server-rendered protected pages read the cookie and include `Authorization: Bearer <token>` when calling the backend.
6. Browser-side API calls also attach the token from the cookie.

This is a foundation, not a complete enterprise identity system. Refresh tokens, password reset, email verification, workspace membership, and role-aware authorization beyond `USER` are roadmap work.

## API Design

Current API areas:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `/api/leads`
- `/api/leads/{id}`
- `/api/leads/{id}/status`
- `/api/leads/{id}/notes`
- `/api/leads/{id}/activities`
- `/api/status`
- `/actuator/health`

Request validation uses Bean Validation. API errors use a shared response shape with timestamp, status, error, message, and field-level validation details where useful.

## Frontend

The frontend uses Next.js App Router, React, TypeScript, and Tailwind CSS.

- `frontend/app`: routes for home, about, auth, workspace, pipeline, leads, and lead detail
- `frontend/components`: reusable product components such as app shell, command palette, lead workspace, forms, notes, and pipeline board
- `frontend/lib`: API client behavior, auth helpers, server auth helpers, lead types, formatting, and filters

Protected pages are `/workspace`, `/pipeline`, `/leads`, and `/leads/[id]`. Public pages are `/`, `/about`, `/login`, and `/register`.

## Database

PostgreSQL is the current source of truth. Flyway owns schema changes.

Current migrations cover:

- application metadata
- leads
- lead notes
- lead activities
- users

Schema changes should stay explicit, reviewable, and tied to the backend behavior that requires them.

## Local Infrastructure

- Docker Compose starts PostgreSQL 16.
- Spring Boot runs locally on port `8080` by default.
- Next.js runs locally on port `3000` by default.

This keeps local review simple while preserving real frontend/backend/database boundaries.
