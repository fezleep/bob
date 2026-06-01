# Roadmap

This roadmap separates current implementation from future product and infrastructure work.

## Current Foundation

Implemented today:

- Java/Spring Boot backend
- Next.js/TypeScript frontend
- PostgreSQL persistence
- Docker Compose for local database setup
- Flyway database migrations
- Spring Security authentication foundation
- JWT login/register/current-user flow
- BCrypt password hashing
- user table with `USER` role
- protected operational backend APIs
- protected frontend workspace, pipeline, leads, and lead detail routes
- lead CRUD APIs
- lead status changes
- lead notes
- lead activity history
- on-demand Bob read for lead summary, operational read, next action, and attention signal
- backend-only OpenAI integration with disabled state when AI is off, no API key is configured, or no model is configured
- system status and actuator health endpoints
- workspace, leads, lead detail, pipeline, home, about, login, and register frontend routes
- intelligent lead filters
- contextual search across core lead fields
- command palette trigger and navigation
- GitHub Actions CI validation
- Playwright smoke test foundation

## Product Roadmap

### Workspace and Lead Workflow

Planned:

- workspace or organization ownership model
- lead ownership
- follow-up dates
- richer lead actions
- import flow for lead lists
- saved views for repeated workflows
- role-aware collaboration rules

### Authentication and Authorization

Planned:

- refresh token strategy
- password reset
- email verification
- invite flow
- workspace membership
- admin role
- authorization rules scoped to workspaces and leads

### Pipeline

Planned:

- editable pipeline transitions from the kanban board
- clearer closed and lost lead handling
- pipeline metrics by status
- aging indicators for leads that stay in one status too long

### Search and Filters

Planned:

- contextual search across notes and activity history
- saved filters
- filter combinations
- keyboard-friendly command palette actions
- workspace-wide quick open behavior

### Contextual Intelligence

Implemented:

- latest persisted Bob read per lead
- explicit user-triggered AI generation
- backend-only OpenAI API usage

Current limitations:

- latest insight only, no insight history yet
- no background processing
- no Redis cache
- no RabbitMQ jobs
- no streaming or chat UI

Planned:

- insight history and user feedback on generated reads
- stale lead detection
- follow-up draft support
- context cards that explain why a lead needs attention

AI should continue to be assistive and explicit. It should not perform autonomous lead updates.

## Backend Roadmap

- stronger authorization around users, workspaces, and leads
- API contract documentation
- integration tests around persistence and API behavior
- import processing for bulk lead creation
- background jobs if imports, notifications, or intelligence workflows require them
- domain events inside the modular monolith if workflow complexity grows

## Frontend Roadmap

- richer command palette behavior
- lead action menus closer to the current context
- improved keyboard flow for lead operations
- saved workspace views
- loading and error state refinement
- screenshot-ready public demo flow

The frontend should remain operational, not decorative. The primary value is helping users scan, decide, and act.

## Infrastructure Roadmap

Current infrastructure:

- Docker Compose for local PostgreSQL
- GitHub Actions for validation

Future infrastructure options:

- Redis for cache, rate limiting, or short-lived workflow state
- RabbitMQ for asynchronous background work
- Prometheus for metrics
- Grafana for dashboards
- OpenTelemetry for traces and observability context
- AWS for production hosting
- Terraform for infrastructure as code
- Kubernetes if orchestration needs justify the operational cost

These are not current implementation details. They are roadmap candidates for a later production stage.
