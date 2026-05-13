# Architecture

bob starts as a modular monolith.

That means one backend application, one database, and clear internal modules. The goal is to keep the system simple to run while still making the codebase easy to reason about as it grows.

## Why Modular Monolith First

Microservices would add deployment, networking, observability, consistency, and local development overhead before the product has enough domain pressure to justify it.

A modular monolith is the better starting point because it:

- keeps local development simple
- keeps transactions straightforward
- avoids fake distribution boundaries
- makes refactoring easier while the product shape is still changing
- still allows strong module boundaries inside the backend

The project should use clean architecture ideas where they help, especially around domain logic and persistence boundaries. It should not turn every simple operation into a ceremony.

## Backend Direction

The backend will use Java 21 and Spring Boot 3.

Expected modules over time:

- leads
- accounts or organizations
- activities
- notes
- users and authentication
- AI assistance

The early backend should separate:

- domain concepts
- application use cases
- persistence adapters
- HTTP/API adapters

This separation should be practical. Simple CRUD can stay simple. More important workflows can receive stronger boundaries as the domain becomes clearer.

## Database Direction

PostgreSQL is the main database.

Flyway will manage schema migrations once the backend starts. The database should be treated as part of the application contract, not as an afterthought.

Early schema design should favor clarity:

- explicit identifiers
- timestamps for created and updated records
- clear ownership boundaries
- readable table and column names
- constraints where they protect real data integrity

## Frontend Direction

The frontend will use Next.js, TypeScript, and Tailwind.

The first UI should focus on the lead workflow, not a marketing site. The app should feel direct, keyboard-friendly, and visually quiet.

Frontend structure should stay boring at first:

- app routes
- reusable UI components
- typed API access
- feature-level organization once screens become more complex

## Security Direction

Spring Security will be introduced later, after the first backend shape is established.

Authentication and authorization should be added deliberately because they will affect the domain model, API design, tests, and local development flow.

## Future Evolution

The modular monolith should leave room for future extraction without forcing it early.

Possible future paths:

- move asynchronous work to a queue
- isolate AI processing behind an internal module
- add read models for reporting if queries become heavy
- extract a service only when scaling, ownership, or deployment pressure makes the boundary real

The default should remain simple until the product proves it needs more.
