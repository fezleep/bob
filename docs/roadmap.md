# Roadmap

This roadmap separates what exists today from what is production-current, prepared for extension, or only planned. Roadmap items are not implemented unless they appear in the implemented/current sections.

## Implemented

Application foundation:

- Java/Spring Boot backend
- Next.js/TypeScript frontend
- PostgreSQL persistence
- Flyway database migrations
- Docker Compose for local PostgreSQL
- GitHub Actions CI validation
- Playwright smoke test foundation

Authentication:

- register, login, and current-user API flow
- BCrypt password hashing
- JWT issuing and validation
- `HttpOnly` auth cookie on the frontend
- protected frontend routes for workspace, pipeline, leads, and lead detail
- protected backend operational APIs
- user table and current user role foundation

Lead workflow:

- lead create, list, detail, update, and status change APIs
- lead statuses: `NEW`, `CONTACTED`, `QUALIFIED`, `CLOSED`, `LOST`
- notes
- activity history
- next follow-up timestamp on create and update flows
- attention queue for overdue and due-today follow-ups
- workspace, pipeline, lead list, and lead detail UI
- contextual lead search and status-aware filters
- command palette navigation

AI and system visibility:

- backend-only OpenAI integration
- explicit user-triggered Bob read generation
- latest persisted AI insight per lead
- follow-up timing included in AI context
- safe disabled state when AI is not configured
- best-effort in-process AI insight cache
- `/api/status` endpoint with app name, status, version, AI readiness, cache mode, and OpenAPI availability
- `/actuator/health`
- Swagger UI and OpenAPI JSON through springdoc

## Production-Ready / Current

Current production stack:

- frontend deployed on Vercel: `https://bob-kappa-eight.vercel.app`
- backend deployed on Render: `https://bob-backend-taj4.onrender.com`
- database on Neon PostgreSQL
- Spring Boot API exposed over HTTPS through Render
- Next.js frontend configured to call the Render backend origin
- auth based on JWT plus `HttpOnly` cookie
- OpenAPI/Swagger available on the backend
- public non-sensitive status endpoint available at `/api/status`
- local development supported with Docker Compose PostgreSQL

Current operational assumptions:

- Render free-tier cold starts or sleeping behavior may affect first request latency.
- Neon is the production Postgres provider.
- AI availability depends on backend environment configuration.
- The in-process AI cache is a performance optimization, not durable state.
- The backend remains the only component that owns provider secrets and database access.

## Prepared / Future Extension

These areas have architectural space or documentation support, but should not be described as completed product capability.

Product extensions:

- workspace or organization ownership model
- lead ownership
- richer role-aware authorization
- invite flow and admin controls
- saved views and saved filters
- richer command palette actions
- import flow for lead lists
- insight history and user feedback on generated reads
- stale lead detection and richer attention explanations
- follow-up draft support

Backend extensions:

- background jobs if imports, notifications, or intelligence workflows require them
- internal domain events inside the modular monolith as workflow complexity grows
- broader integration tests around API and persistence behavior
- stronger authorization scoped to users, workspaces, and leads
- additional API contract examples around recruiter/demo flows

Frontend extensions:

- improved keyboard flow for lead operations
- richer loading and error states
- editable pipeline transitions directly from the board
- more detailed pipeline metrics
- screenshot-ready public demo flow

Deployment alternatives:

- Oracle deployment remains an alternative/future path, documented separately.
- AWS could become a future production host if requirements change.

## Roadmap / Not Implemented

The following are not implemented in the current production stack:

- Redis
- RabbitMQ
- Kubernetes
- Terraform-managed infrastructure
- Prometheus metrics
- Grafana dashboards
- OpenTelemetry traces
- distributed cache
- asynchronous background workers
- autonomous AI workflow updates
- automated email or in-app follow-up reminders
- password reset
- email verification
- refresh token rotation
- full workspace/multi-tenant membership model
- admin role and workspace-scoped permissions
- bulk import processing
- AI streaming or chat UI
- durable AI insight history

These remain candidates for later stages. They should be discussed as deliberate next steps, not as existing production features.
