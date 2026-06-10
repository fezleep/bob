# Product

bob is a lead management platform for teams that want calm software instead of another overloaded CRM.

It should help a team understand who they are talking to, where each lead stands, what needs attention, and what changed recently. The product should stay focused on the work instead of trying to become a complete sales suite too early.

## Identity

bob is:

- calm
- minimal
- dark-first
- practical
- modern, but not trendy for its own sake
- useful without constantly announcing itself

bob is not:

- a generic CRM clone
- a loud AI wrapper
- an enterprise dashboard packed with charts
- a product that hides weak workflows behind visual polish

The name should feel small and memorable. The product around it should feel considered, direct, and reliable.

## Core Use Case

The first version should make it easy to:

- capture leads
- organize leads by status
- see recent activity
- keep notes and context close to the lead
- schedule the next follow-up
- see which follow-ups need attention today

The MVP should avoid broad CRM features until the basic lead workflow feels strong.

## Current Product Flow

The current workflow is lead -> follow-up -> attention queue -> Bob read context.

A user can create or edit a lead with a next follow-up time. Overdue and due-today follow-ups appear in the workspace attention queue so the near-term work is visible without turning the whole product into a task manager. When the user asks for a Bob read, the backend includes the follow-up state in the AI prompt so the generated summary, operational read, next action, and attention signal reflect that timing.

Bob read remains assistive. It does not create tasks, change lead status, schedule follow-ups, or take action for the user.

## Design Direction

The interface should be black and white first. Color is used sparingly for state, priority, and small moments of clarity.

The general feeling should be closer to Linear, Vercel, Railway, Notion, and Arc than to a traditional sales CRM. Dense information is fine, but it should be composed with restraint.

Design principles:

- dark mode is the primary experience
- typography should do more work than decoration
- surfaces should be quiet and intentional
- controls should feel fast and predictable
- empty states should be useful, not theatrical
- AI should appear where it helps a workflow, not as a separate personality

## AI Direction

AI in bob should be discreet.

Useful directions:

- summarizing a lead timeline
- suggesting a follow-up note or next step
- extracting structured data from a conversation
- identifying stale leads
- drafting a short next step

AI should not dominate the UI, create noisy assistant panels, or pretend to replace the core lead workflow.
