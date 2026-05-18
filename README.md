# bob

<p align="left">
  <img src="frontend/public/branding/bob-logo.png" alt="bob logo" width="72" />
</p>

bob is a calm operational workspace for leads, workflows, and contextual intelligence.

It is built as a fullstack SaaS/product engineering case: a Java/Spring Boot backend, PostgreSQL persistence, Docker-based local infrastructure, and a Next.js/TypeScript frontend focused on operational UX.

## Public Links

- GitHub repository: https://github.com/fezleep/bob
- Live demo: not published yet

## What Is bob

bob is a small CRM-like workspace for managing leads through a clear operating rhythm.

The product brings lead records, status changes, notes, recent activity, filters, contextual search, and a kanban-style pipeline into one focused interface. The goal is not to replace every enterprise CRM feature. The goal is to give small teams a quiet place to understand what is happening, what needs attention, and what action should happen next.

For technical reviewers, bob demonstrates a practical fullstack product foundation with a separated frontend and backend, explicit database migrations, typed UI data access, and documentation that explains both product thinking and engineering decisions.

## Why It Exists

Many sales and operations tools become heavy before a team has enough process to justify the weight. bob starts from the opposite direction:

- a clear workspace for day-to-day lead work
- a kanban pipeline for scanning operational state
- lead intelligence through status, recency, attention, and quiet-lead signals
- progressive disclosure so detail appears when it is useful
- a codebase that can grow incrementally through feature branches and pull requests

bob also exists as a public portfolio project. It is intended to be understandable in less than 60 seconds by a recruiter while still giving a tech lead enough detail to evaluate architecture, delivery discipline, and implementation maturity.

## Main Features

Current product surface:

- Lead workspace for listing, creating, and reviewing leads
- Lead detail pages with notes, activity history, status changes, and lead actions
- Kanban pipeline grouped by lead status
- Intelligent filters for all, status-based, recent, quiet, and needs-attention views
- Contextual search across lead name, email, and company
- Operational app shell with workspace, leads, pipeline, and about routes
- Progressive disclosure for detailed information and actions
- Backend APIs for lead CRUD, status updates, notes, activities, and system status
- Database migrations for leads, notes, activities, and application metadata
- Local PostgreSQL environment through Docker Compose

Planned product capabilities are listed in the roadmap and are not presented as current implementation.

## Tech Stack

| Area | Current technology |
| --- | --- |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | Java 21, Spring Boot 3.3, Spring Web, Spring Data JPA, Bean Validation |
| Database | PostgreSQL 16, Flyway migrations |
| Local infrastructure | Docker Compose |
| Quality checks | Maven tests, Spring Boot tests, ESLint, Next.js build |

Future infrastructure such as Redis, RabbitMQ, OpenAI API integration, Prometheus, Grafana, OpenTelemetry, AWS, Terraform, and Kubernetes belongs to the roadmap. Those tools are not claimed as part of the current implementation.

## Architecture Overview

bob uses a separated frontend/backend architecture:

```text
Next.js frontend
  -> typed API access through frontend/lib
  -> Spring Boot REST API
  -> Spring Data JPA
  -> PostgreSQL
```

The backend is currently a modular monolith. This keeps local development and transactional behavior simple while still allowing the codebase to develop clear internal module boundaries.

Current backend modules include:

- `modules/leads` for the lead workflow, notes, activity history, and status transitions
- `modules/system` for application status
- `shared/api` for API error responses and exception handling
- `config` for application configuration properties

The frontend is organized around Next.js App Router routes, reusable components, and a small data access layer. The product experience emphasizes operational UX: fast scanning, clear status, low visual noise, and actions close to the lead context.

More detail: [docs/architecture.md](docs/architecture.md)

## Frontend Architecture

The frontend is built with Next.js, React, TypeScript, and Tailwind CSS.

Current structure:

- `frontend/app` contains route-level screens such as workspace, leads, lead detail, and pipeline
- `frontend/components` contains reusable product components such as the lead workspace, lead list, notes section, activity timeline, status pills, and pipeline board
- `frontend/lib` contains API access, lead types, formatting helpers, and lead filter logic

Design principles:

- operational screens first, not a marketing landing page
- progressive disclosure for actions and detail
- intelligent filters and search close to the workspace
- reusable components with clear props
- frontend/backend separation through API calls instead of direct database access

## Backend Architecture

The backend is a Spring Boot application using Java 21.

Current backend responsibilities:

- REST endpoints under `/api/leads`
- create, list, retrieve, update, and change lead status
- create and list notes for a lead
- list activity history for a lead
- validation of incoming API requests
- application status endpoint under `/api/status`
- centralized API error handling
- JPA persistence backed by PostgreSQL
- Flyway-managed schema changes

The backend currently favors a pragmatic modular monolith. The lead module owns the core workflow. Shared API concerns are separated so the code can grow without spreading error-response behavior across controllers.

## Database

PostgreSQL is the source of truth for bob's current application state.

Flyway migrations define the database contract:

- application metadata
- leads
- lead notes
- lead activities

The database design is intentionally direct: clear tables, explicit timestamps, status fields, and relationships that support the lead workflow. More advanced read models, analytics, background jobs, and cache layers are future concerns.

## Docker / Local Setup

Prerequisites:

- Java 21
- Maven 3.9+
- Node.js and npm
- Docker Compose

Start PostgreSQL from the repository root:

```bash
docker compose up -d
```

Run the backend:

```bash
cd backend
mvn spring-boot:run
```

Run the frontend:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Set the frontend API origin:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Useful local checks:

```bash
curl http://localhost:8080/actuator/health
curl http://localhost:8080/api/status
```

## Engineering Workflow

bob is maintained as an incremental product build rather than a one-off demo.

Workflow expectations:

- use feature branches for isolated work
- open pull requests for reviewable changes
- keep backend, frontend, and documentation changes scoped
- verify backend behavior with Maven tests
- verify frontend behavior with lint and build checks
- document architectural decisions when they affect future direction
- deliver features incrementally instead of introducing unnecessary infrastructure early

This workflow is meant to show engineering maturity: clear boundaries, honest documentation, small reviewable changes, and a roadmap that distinguishes current implementation from future ambition.

## Roadmap

Near-term product roadmap:

- authentication and workspace ownership
- lead ownership and follow-up dates
- richer lead actions
- saved views for common operational filters
- stronger command palette behavior for navigation and lead actions
- richer contextual search across notes and activity history
- import flow for lead lists
- role-aware access rules

Future intelligence roadmap:

- lead summaries from notes and activity
- stale lead detection
- suggested next step
- short follow-up draft support
- OpenAI API integration behind explicit workflow actions

More detail: [docs/roadmap.md](docs/roadmap.md)

## Screenshots

Screenshots are intentionally kept as placeholders until the public demo flow is stable.

Recommended captures:

- Workspace overview: `docs/screenshots/workspace.png`
- Lead list with filters and contextual search: `docs/screenshots/leads.png`
- Lead detail with notes, activity, and lead actions: `docs/screenshots/lead-detail.png`
- Kanban pipeline: `docs/screenshots/pipeline.png`

## Future Infrastructure Roadmap

The current implementation uses Docker Compose for local PostgreSQL. The following infrastructure is future work and should be introduced only when the product needs it:

- Redis for caching, rate limiting, or short-lived workflow state
- RabbitMQ for asynchronous jobs and event-driven workflows
- OpenAI API for contextual intelligence features
- Prometheus and Grafana for metrics and dashboards
- OpenTelemetry for traces and structured observability
- AWS for production hosting
- Terraform for infrastructure as code
- Kubernetes for orchestration if deployment complexity justifies it

## Author

Built by Felipe Virginio.

Product engineer and backend-focused fullstack builder.

## Documentation

- [Architecture](docs/architecture.md)
- [Engineering decisions](docs/engineering-decisions.md)
- [Roadmap](docs/roadmap.md)
- [Product direction](docs/product.md)
- [Brand notes](docs/brand.md)
- [Portuguese README](README.pt-BR.md)
