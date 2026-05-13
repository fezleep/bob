# bob

quiet software for modern teams.

bob is a calm, dark-first lead workspace built by Felipe Virginio, a product
engineer and backend-focused builder. It is designed as a real startup product:
simple enough for anyone to understand, structured enough to show serious
engineering decisions, and quiet enough to keep attention on the work.

Built with modern ai-assisted workflows, focused on clarity, consistency and
product thinking.

## what is bob

bob helps teams manage leads, notes, status changes, and recent activity in one
minimal workspace.

For recruiters and non-technical people, bob is a small CRM-like product for
tracking conversations with potential customers. For tech leads, it is a
fullstack product foundation with a Spring Boot backend, a PostgreSQL database,
and a Next.js interface.

## why it exists

Most CRM tools feel heavy before a small team needs that much process. bob
starts from the opposite direction: a focused lead workflow, clear data, and a
calm interface.

The project also exists as a mature portfolio piece. It shows product judgment,
backend architecture, frontend execution, documentation, and a practical path
for future AI features without making AI the product's personality.

## what it does

bob currently supports the core lead workflow:

- create and list leads
- track lead status
- view lead details
- add notes to a lead
- review activity history
- connect the frontend to the backend through a typed API layer

## tech stack

- Backend: Java 21, Spring Boot 3, Spring Web, Spring Data JPA
- Database: PostgreSQL, Flyway
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Local infrastructure: Docker Compose
- Testing: Spring Boot tests, frontend lint/build checks

## architecture

bob starts as a modular monolith.

The backend is one deployable application with clear internal modules. This
keeps local development simple while leaving room for stronger boundaries as the
product grows.

Current backend direction:

- `modules/leads` owns the lead workflow
- `modules/system` exposes system status
- `shared/api` centralizes API error handling
- Flyway migrations define the database contract

The frontend uses the Next.js app router with reusable components, route-level
screens, and a small API client in `frontend/lib`.

## features

- dark-first application shell
- lead list and recent lead overview
- lead detail pages
- status labels
- notes and activity timeline support
- loading and error states
- PostgreSQL schema migrations
- backend validation and API error responses
- focused documentation for product, architecture, roadmap, and brand

## how to run locally

Start PostgreSQL:

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
npm run dev
```

The frontend expects an API base URL:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Useful backend checks:

```bash
curl http://localhost:8080/actuator/health
curl http://localhost:8080/api/status
```

## current status

bob is in MVP stage.

The backend contains the core lead domain, persistence, migrations, API
endpoints, validation, and tests. The frontend contains the app shell, lead
views, API integration, and the first pass of the product presentation layer.

## future roadmap

- authentication and workspace ownership
- follow-up dates and lead ownership
- richer filtering and search
- saved views
- quiet AI assistance for summaries, stale leads, and next-step suggestions
- deployment pipeline
- observability basics

AI features should stay attached to useful workflows. bob should not become a
loud assistant interface.

## author

Built by Felipe Virginio.

Product engineer / backend-focused builder.

## documentation

- `docs/product.md` explains the product direction.
- `docs/architecture.md` explains the modular monolith approach.
- `docs/roadmap.md` outlines the MVP path.
- `docs/brand.md` defines the presentation and mascot direction.
- `README.pt-BR.md` contains the Portuguese version.
