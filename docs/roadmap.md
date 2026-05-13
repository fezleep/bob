# Roadmap

This roadmap keeps the project focused on a credible MVP without adding fake complexity.

## Foundation

- repository structure
- local PostgreSQL with Docker Compose
- product and architecture documentation
- backend and frontend placeholders

## MVP 1: Lead Core

- create, update, list, and archive leads
- lead status tracking
- lead detail view
- notes attached to leads
- basic activity timeline
- PostgreSQL schema managed with Flyway
- backend tests for core lead behavior

## MVP 2: Usable App

- Next.js app shell
- dark-first lead list
- lead detail page
- note creation flow
- basic filtering and search
- loading, empty, and error states
- typed frontend API layer

## MVP 3: Team Context

- basic users
- organization or workspace model
- lead ownership
- follow-up dates
- simple role-aware access rules
- Spring Security integration

## MVP 4: Quiet AI

- lead summary from notes and activity
- suggested next step
- stale lead detection
- short follow-up draft

AI should stay attached to useful workflows. It should not become the product's main surface.

## Later

- imports
- richer activity history
- saved views
- reporting read models
- email or calendar integration
- background jobs
- deployment pipeline
- observability basics

The project should grow from real needs in the lead workflow. Each addition should make the product easier to use or the codebase easier to maintain.
