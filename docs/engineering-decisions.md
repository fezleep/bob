# Engineering Decisions

This document records product and engineering choices behind bob.

## 1. Build a Product Surface, Not Only Endpoints

bob includes frontend, backend, database, local infrastructure, and documentation in one repository. The product starts with operational workflows for leads, pipeline, notes, activity, filters, search, and command palette navigation.

Reason: reviewers can evaluate product judgment, backend boundaries, frontend execution, and delivery discipline together.

## 2. Keep Frontend and Backend Separated

The Next.js frontend talks to the Spring Boot backend through HTTP APIs. PostgreSQL access stays behind the backend.

Reason: this mirrors a common SaaS architecture and keeps validation, persistence, and API contracts owned by the backend.

## 3. Start with a Modular Monolith

The backend is one Spring Boot application organized by modules and shared concerns.

Reason: bob does not need microservices at this stage. A modular monolith keeps local development simple, transactions straightforward, and feature branches reviewable.

## 4. Use PostgreSQL and Flyway from the Start

PostgreSQL is the source of truth and Flyway manages schema evolution.

Reason: the database is part of the application contract. Schema changes should be explicit and reviewable.

## 5. Add Authentication as SaaS Foundation, Not Stack Bingo

This branch adds Spring Security, BCrypt password hashing, users, a `USER` role, JWT login/register/current-user endpoints, protected operational APIs, protected frontend routes, and logout.

Reason: a SaaS-style operational workspace should not expose operational data by default. The implementation stays intentionally small: no refresh tokens, no multi-tenant workspace model, no password reset, and no external identity provider yet.

## 6. Treat Operational UX as a Core Feature

The UI remains calm, warm, and product-oriented. Authentication was added without changing the lead list, pipeline, lead detail actions, filters, drawers, or command palette interaction model.

Reason: technical hardening should support the product experience instead of overpowering it.

## 7. Add AI Only Behind a Concrete Workflow

Bob now includes one AI-assisted workflow: a lead detail "Bob read" generated on demand from the lead profile, notes, and recent activity. The OpenAI API key is backend-only, AI is disabled by default, and `BOB_AI_MODEL` must be configured explicitly to a model available for the environment's OpenAI account. Missing configuration returns an honest unavailable state without calling the provider.

Reason: bob should remain useful without AI, and AI should assist the user's operational decision instead of taking over. Persisting only the latest insight keeps the feature product-real without introducing chat, streaming, queues, or autonomous actions.

## 8. Avoid Premature Infrastructure

Current infrastructure is Docker Compose for PostgreSQL plus GitHub Actions validation. Redis, RabbitMQ, Prometheus, Grafana, OpenTelemetry, AWS, Terraform, and Kubernetes remain future work.

Reason: unnecessary services would make local review harder and weaken the credibility of the implementation.

## Current Quality Signals

- Spring Boot tests for lead and system behavior
- request validation on backend inputs
- centralized API error handling
- Spring Security/JWT authentication foundation
- BCrypt password hashing
- Flyway migrations for schema evolution
- backend-only OpenAI integration for on-demand lead insights
- disabled/unavailable AI behavior when AI is off, no API key is configured, or no model is configured
- typed frontend data structures and API access
- auth-aware frontend API handling
- frontend lint and build scripts
- GitHub Actions CI for backend and frontend
- Playwright smoke tests for public pages, auth pages, protected redirects, and command palette trigger

## Current Non-Goals

- refresh tokens
- password reset or email verification
- multi-tenant workspace ownership
- production deployment automation
- Redis
- RabbitMQ
- AI chat UI, streaming responses, or autonomous lead actions
- Prometheus, Grafana, or OpenTelemetry
- AWS, Terraform, or Kubernetes
