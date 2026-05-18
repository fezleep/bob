# Architecture

bob is a fullstack SaaS/product engineering case built around a separated frontend and backend.

The current system is intentionally simple:

```text
Browser
  -> Next.js / React / TypeScript frontend
  -> Spring Boot REST API
  -> Spring Data JPA
  -> PostgreSQL
```

Docker Compose currently provides the local PostgreSQL dependency. The application does not currently use Redis, RabbitMQ, OpenAI API, Prometheus, Grafana, OpenTelemetry, AWS, Terraform, or Kubernetes. Those are future infrastructure options documented in the roadmap.

## System Shape

bob is organized as:

- `frontend`: Next.js application and operational workspace UI
- `backend`: Java/Spring Boot API and domain logic
- `docs`: architecture, roadmap, and engineering documentation
- `docker-compose.yml`: local PostgreSQL service

The frontend and backend communicate through HTTP APIs. The frontend does not connect directly to the database.

## Backend Architecture

The backend is a Spring Boot modular monolith.

Current package structure:

- `com.bob.modules.leads`: lead records, status transitions, notes, activities, controllers, services, repositories, and API DTOs
- `com.bob.modules.system`: application status endpoint
- `com.bob.shared.api`: shared API error response and exception handling
- `com.bob.config`: application configuration properties

This structure keeps the application easy to run locally while giving the domain room to grow. The system does not need microservices at this stage. A modular monolith keeps transactions straightforward, avoids premature network boundaries, and lets feature work move through small pull requests.

## Lead Module

The lead module owns the current product workflow:

- create leads
- list leads with pagination, sorting, and optional status filtering
- retrieve lead detail
- update lead fields
- change lead status
- add notes
- list notes
- list activity history

Lead activity is stored as application context so the product can show what changed and when. This gives bob the foundation for future contextual intelligence without claiming AI features before they are implemented.

## API Design

The backend exposes REST endpoints under `/api`.

Current API areas:

- `/api/leads`
- `/api/leads/{id}`
- `/api/leads/{id}/status`
- `/api/leads/{id}/notes`
- `/api/leads/{id}/activities`
- `/api/status`
- `/actuator/health`

Request validation uses Spring validation. API errors are normalized through shared exception handling so clients receive consistent response shapes.

## Frontend Architecture

The frontend uses Next.js App Router, React, TypeScript, and Tailwind CSS.

Current structure:

- `frontend/app`: route-level screens for the workspace, leads, lead detail, pipeline, about, loading, and error states
- `frontend/components`: reusable UI and product components
- `frontend/lib`: API client behavior, lead types, formatting, and filter logic

The frontend is designed around operational UX:

- workspace-first navigation
- lead list and lead detail views
- kanban pipeline for status scanning
- intelligent filters for recent, quiet, and needs-attention signals
- contextual search across core lead fields
- progressive disclosure for actions and detail

This keeps the interface calm while still supporting the workflows a small team would expect from a lead workspace.

## Database

PostgreSQL is the current database.

Flyway owns schema changes. Current migrations cover:

- application metadata
- leads
- lead notes
- lead activities

The database is treated as part of the application contract. Schema changes should be explicit, reviewable, and included with the backend feature that requires them.

## Local Infrastructure

Local infrastructure is intentionally small:

- Docker Compose starts PostgreSQL 16
- Spring Boot runs locally on port `8080` by default
- Next.js runs locally on port `3000` by default

This keeps the project easy for reviewers and contributors to run without hiding the actual frontend/backend/database boundaries.

## Evolution Path

The architecture should evolve from real product pressure.

Expected next steps:

- authentication and workspace ownership
- stronger authorization rules around leads and workspaces
- richer lead actions and command palette behavior
- richer search across notes and activity
- asynchronous background work if workflows require it
- observability once deployment exists

Service extraction, queues, distributed tracing, Kubernetes, and managed cloud infrastructure should be introduced only when they solve a concrete scaling, reliability, or operational problem.
