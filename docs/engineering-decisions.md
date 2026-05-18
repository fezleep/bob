# Engineering Decisions

This document records the product and engineering choices behind bob. It is meant to make the repository easier to evaluate as a fullstack SaaS/product engineering case.

## 1. Build a Real Product Surface, Not Only Backend Endpoints

bob is documented and structured as a product workspace, not just an API sample.

Decision:

- include frontend, backend, database, local infrastructure, and product documentation in one repository
- make the first screen an operational workspace instead of a marketing page
- keep the experience centered on leads, workflows, and contextual intelligence

Reasoning:

- recruiters can understand the product quickly
- tech leads can evaluate implementation boundaries
- the repository shows product judgment as well as coding ability

## 2. Keep Frontend and Backend Separated

Decision:

- use a Next.js/TypeScript frontend
- use a Java/Spring Boot backend
- communicate through HTTP APIs
- keep PostgreSQL access behind the backend

Reasoning:

- the separation mirrors a common SaaS architecture
- backend ownership, validation, persistence, and API contracts remain clear
- the frontend can focus on operational UX without taking database responsibility

## 3. Start with a Modular Monolith

Decision:

- keep the backend as one Spring Boot application
- organize code by modules and shared concerns
- avoid microservices until the product has real distribution pressure

Reasoning:

- local development stays simple
- transactions remain straightforward
- feature branches and pull requests stay smaller
- boundaries can mature before becoming network boundaries

## 4. Use PostgreSQL and Flyway from the Start

Decision:

- use PostgreSQL as the current source of truth
- manage schema changes through Flyway migrations

Reasoning:

- the database is part of the application contract
- schema changes become explicit and reviewable
- the project avoids hidden setup or throwaway in-memory assumptions

## 5. Treat Operational UX as a Core Feature

Decision:

- design around workspace, lead list, detail view, pipeline, notes, activity, and lead actions
- include intelligent filters and contextual search
- use progressive disclosure so the interface stays calm

Reasoning:

- lead work is repetitive and benefits from clarity
- users need to scan state quickly before acting
- a calm interface supports focused operational workflows

## 6. Keep AI as Roadmap Until It Is Workflow-Backed

Decision:

- describe OpenAI API integration as future work
- avoid presenting AI features as implemented before they exist
- attach future intelligence to concrete jobs such as summaries, stale lead detection, and next-step suggestions

Reasoning:

- the product should remain useful without AI
- AI should support workflow context instead of becoming a decorative assistant surface
- honest documentation is more valuable than inflated claims

## 7. Avoid Premature Infrastructure

Decision:

- use Docker Compose for local PostgreSQL today
- document Redis, RabbitMQ, Prometheus, Grafana, OpenTelemetry, AWS, Terraform, and Kubernetes as future infrastructure

Reasoning:

- the current product does not need distributed infrastructure to prove its value
- unnecessary services would make local review harder
- the roadmap stays credible by separating current implementation from future platform work

## 8. Deliver Incrementally

Decision:

- use feature branches and pull requests for product slices
- keep changes scoped by frontend, backend, database, or documentation concern
- prefer incremental delivery over large speculative rewrites

Reasoning:

- the project remains reviewable
- implementation risk is easier to manage
- engineering maturity is visible through small, coherent changes

## Current Quality Signals

Current implementation includes:

- Spring Boot tests for lead and system behavior
- request validation on backend inputs
- centralized API error handling
- Flyway migrations for schema evolution
- typed frontend data structures and API access
- frontend lint and build scripts
- documented architecture and roadmap

## Deliberate Non-Goals for the Current Stage

Not current implementation:

- authentication and authorization
- multi-tenant workspace ownership
- production deployment
- Redis
- RabbitMQ
- OpenAI API integration
- Prometheus, Grafana, or OpenTelemetry
- AWS, Terraform, or Kubernetes

These are valid future directions, but they should be introduced when the product workflow and deployment needs justify them.
