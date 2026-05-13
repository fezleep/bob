# bob

bob is a calm, minimal, dark-first lead management platform for modern teams.

The goal is not to build a generic CRM or a loud AI product. bob is focused on helping teams track leads, understand context, and move work forward without turning the interface into a dashboard full of noise.

This project is being built as a practical fullstack portfolio project with a strong backend foundation. The first version will be a modular monolith: one deployable application, clear internal boundaries, and enough structure to evolve without pretending it needs microservices on day one.

## Product Direction

bob should feel quiet, fast, and polished.

- Black and white first, with muted accent colors only where they help.
- Minimal interface inspired by tools like Linear, Vercel, Railway, Notion, and Arc.
- AI features should be discreet and useful, not the center of the product.
- The product should feel light on the surface and thoughtful underneath.

## Stack

- Backend: Java 21, Spring Boot 3, PostgreSQL, Flyway
- Frontend: Next.js, TypeScript, Tailwind
- Infrastructure: Docker Compose
- Security: Spring Security later, once the domain shape is clearer

## Current State

This repository currently contains the project foundation, working backend MVP core, and the first frontend foundation:

- product notes
- architecture direction
- MVP roadmap
- local PostgreSQL setup
- Spring Boot backend with leads, notes, activities, and timeline support
- Next.js frontend shell with mock lead views

The current product surface is still MVP-level: backend lead workflows exist, and
the frontend uses mock data until API integration is introduced.

## Local Database

Start PostgreSQL:

```bash
docker compose up -d
```

Stop PostgreSQL:

```bash
docker compose down
```

The local database values are documented in `.env.example`.

## Backend

Run the backend:

```bash
cd backend
mvn spring-boot:run
```

Useful local checks:

```bash
curl http://localhost:8080/actuator/health
curl http://localhost:8080/api/status
```

## Frontend

Run the frontend:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`.

## Documentation

- `docs/product.md` explains what bob is and what it should feel like.
- `docs/architecture.md` explains the modular monolith direction.
- `docs/roadmap.md` outlines the MVP path.
