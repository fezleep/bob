# Roadmap

This roadmap separates current implementation from future product and infrastructure work. The goal is to keep bob credible as a portfolio project and practical as a growing SaaS foundation.

## Current Foundation

Implemented today:

- Java/Spring Boot backend
- Next.js/TypeScript frontend
- PostgreSQL persistence
- Docker Compose for local database setup
- Flyway database migrations
- lead CRUD APIs
- lead status changes
- lead notes
- lead activity history
- system status endpoint
- workspace, leads, lead detail, and pipeline frontend routes
- intelligent lead filters
- contextual search across core lead fields
- reusable frontend components for lead operations
- backend tests for lead and system behavior
- frontend lint and build scripts

## Product Roadmap

### Workspace and Lead Workflow

Planned:

- workspace ownership model
- user accounts and authentication
- lead ownership
- follow-up dates
- richer lead actions
- better empty states around operational next steps
- import flow for lead lists
- saved views for repeated workflows

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
- keyboard-friendly command palette for navigation and lead actions
- workspace-wide quick open behavior

### Contextual Intelligence

Planned:

- lead summary from notes and activity
- suggested next action
- stale lead detection
- follow-up draft support
- context cards that explain why a lead needs attention

OpenAI API integration belongs here as future work. It should be introduced behind explicit user actions and clear workflow value.

## Backend Roadmap

Planned:

- Spring Security authentication
- authorization rules for users, workspaces, and leads
- stronger domain boundaries as workflows grow
- pagination and filtering improvements where the UI needs them
- API contract documentation
- integration tests around persistence and API behavior
- import processing for bulk lead creation

Potential later additions:

- asynchronous job handling for imports, notifications, and intelligence tasks
- domain events inside the modular monolith
- reporting read models if operational queries become heavier

## Frontend Roadmap

Planned:

- richer command palette behavior
- lead action menus closer to the user's current context
- improved keyboard flow for lead operations
- saved workspace views
- better progressive disclosure for notes, history, and lead intelligence
- loading and error state refinement
- screenshot-ready public demo flow

The frontend should remain operational, not decorative. The primary value is helping users scan, decide, and act.

## Database Roadmap

Planned:

- users
- workspaces or organizations
- lead ownership fields
- follow-up fields
- saved views
- import tracking
- audit-friendly activity records

Database changes should continue to use Flyway migrations and should ship with the backend behavior that requires them.

## Infrastructure Roadmap

Current infrastructure:

- Docker Compose for local PostgreSQL

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

## Engineering Workflow Roadmap

Planned:

- continue using feature branches for isolated work
- keep pull requests small and reviewable
- expand backend test coverage around higher-risk workflows
- add frontend tests when interaction complexity increases
- keep documentation updated with architecture and product changes
- separate product work from infrastructure work unless a feature requires both

## Success Criteria

bob should continue to be:

- understandable to a recruiter in less than 60 seconds
- credible to a tech lead reviewing architecture and delivery choices
- easy to run locally
- honest about implemented versus planned capabilities
- focused on lead operations, workflow clarity, and contextual intelligence
