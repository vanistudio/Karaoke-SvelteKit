# Software Architecture

## Objective

This document explains the software architecture that is actually implemented in the repository, with emphasis on runtime boundaries, backend layering, cross-cutting concerns, and major integration paths.

- Evidence basis: direct and derived
- Confidence level: 0.94

## Architectural Style

Karaoke-SvelteKit uses a modular full-stack web architecture with a typed RPC application boundary. The overall style can be described as:

- monolithic deployment unit;
- layered backend architecture;
- server-rendered and client-enhanced web frontend;
- typed first-party API boundary via tRPC;
- relational transactional persistence via PostgreSQL and Drizzle.

The system is not organized as independent microservices. Instead, it centralizes all application concerns in one repository and one application runtime, while separating concerns by module and layer.

## High-Level Runtime Structure

The request flow is centered on SvelteKit and `hooks.server.ts`.

1. An HTTP request reaches the SvelteKit application.
2. `hooks.server.ts` resolves authentication state by calling Better Auth.
3. The resolved `user` and `session` are attached to `event.locals`.
4. The same request context feeds both page-level server loads and the tRPC context.
5. Pages either load directly from `locals` or call `trpc()` from the browser or server-aware fetch context.
6. tRPC routers validate input with Zod and dispatch into controllers and services.
7. Services coordinate repositories and direct database operations through Drizzle.
8. Side effects such as email delivery are invoked from service logic after core persistence succeeds.

## Architectural Layers

### Presentation Layer

The presentation layer is implemented in `src/routes` and `src/lib/components`.

- Public routes render browsing, booking, authentication, and profile workflows.
- Admin routes expose management screens for operations and analytics.
- Shared UI concerns such as toasts and date/time pickers are placed in `src/lib/components` and `src/lib/stores`.

This layer is responsible for interaction, data display, optimistic state transitions, local form state, and user feedback. It does not contain the authoritative business rules.

### Application Boundary Layer

The application boundary is implemented in tRPC routers under `src/lib/server/routes`.

- Routers define public, protected, staff, manager, admin, and rate-limited procedures.
- Zod schemas validate and normalize input before business logic runs.
- Router methods are thin by design and delegate meaningful work to controllers or services.

This layer is the main contract between frontend code and backend behavior.

### Orchestration Layer

Controllers under `src/lib/server/controllers` provide a thin orchestration layer. They mainly forward validated input to services while preserving a structured backend flow:

`router -> controller -> service -> repository -> database`

Not every domain needs a large controller surface, but the pattern is consistently used for the most important mutable modules such as booking, room, promotion, and service.

### Domain Service Layer

Services in `src/lib/server/services` contain the core business rules:

- booking policy validation and overlap prevention;
- dynamic pricing logic;
- loyalty accumulation and reversal;
- promotion reservation and release;
- dashboard aggregations;
- recommendation and review logic;
- settings-backed policy retrieval;
- transactional email generation and dispatch.

This is the most important architectural layer for academic discussion because it contains the system’s actual business behavior.

### Persistence Layer

The persistence layer uses Drizzle schemas and repositories:

- `src/lib/server/db/schema` defines the relational model;
- `src/lib/server/repositories` encapsulates many data access operations;
- `src/lib/server/db/index.ts` creates a Drizzle client backed by PostgreSQL.

This layer manages CRUD operations, filtered queries, joins, counts, and transactional consistency.

## Cross-Cutting Architectural Concerns

### Authentication and Session Propagation

Better Auth is configured in `src/lib/server/auth.ts`. The integration is server-centric:

- sessions are fetched in `hooks.server.ts`;
- the authenticated user is attached to `event.locals`;
- `createContext()` copies the same authenticated context into tRPC procedures;
- page loads and tRPC handlers therefore share one coherent request identity model.

This reduces duplication and prevents frontend-only authorization assumptions from becoming the primary security barrier.

### Authorization

Authorization is centralized in `src/lib/server/trpc/t.ts` and `src/lib/server/config/permissions.ts`.

- reusable procedures guard access by role;
- a permission map defines which roles may perform specific actions;
- page-level redirects exist for navigation control, but authoritative access checks remain on the server side.

### Configuration as Data

The application uses the `setting` table plus `SettingService` to externalize selected business and public-site behavior:

- site name, slogan, phone, address, email, opening time, and closing time;
- loyalty thresholds and reward rates;
- booking minimum hours, maximum hours, and advance booking range.

This design improves maintainability by moving volatile commercial policy out of hardcoded page content.

### Side Effects

Email delivery is handled by `EmailService` using Resend. Verification emails and booking-status emails are generated with contextual site information from settings. Importantly, booking status emails are attempted after database mutation; email delivery failure is logged but does not roll back a completed booking-status change.

## Significant Architectural Decisions

### 1. Typed RPC Instead of Conventional REST for Internal Application Use

The application primarily uses tRPC for first-party frontend/backend interaction. This reduces duplication between client types and server contracts and fits a system where the only main consumers are application pages in the same repository.

### 2. Layered Business Logic Instead of Fat Route Handlers

Complex domains such as booking are not implemented directly inside route files. This supports clearer reasoning, easier documentation, and a cleaner separation between validation, orchestration, and domain rules.

### 3. Transactional Booking Flow

Booking creation uses a PostgreSQL advisory lock and a transaction. This is a notable design decision because the booking domain is concurrency-sensitive. The architecture explicitly recognizes that room availability is not safe to enforce through client-side checks alone.

### 4. Settings-Driven Business Policy

Rather than hardcoding booking windows and loyalty behavior, the application retrieves policy from persistent settings. This design improves adaptability for business operators.

### 5. Relational Reporting Within the Primary Database

Dashboard metrics, customer ranking, occupancy, and heatmap data are computed from the same PostgreSQL store rather than delegated to a separate analytics service. This is a pragmatic architecture for a project of this scale.

## Strengths of the Architecture

- Strong separation between UI concerns and business logic.
- Good alignment between authentication propagation and API context.
- Explicit validation at the backend boundary.
- Transactional protection for the most sensitive business operation.
- Configurable business rules for selected domains.
- Readable and academically explainable stack composition.

## Architectural Limitations

- The recommendation subsystem is relatively lightweight and not backed by advanced recommendation infrastructure.
- Analytics are computed on demand and may become expensive at larger scale.
- There is no committed caching, background job queue, or event bus.
- The monolithic structure is appropriate now but may limit independent scaling of reporting, media handling, or notification workloads later.
- Some route-level and UI-level docs in older narrative files are stale relative to the actual implemented code.

## Architectural Summary

Karaoke-SvelteKit is best understood as a full-stack transactional web application with a carefully layered backend and a typed internal API boundary. Its architecture is not overly distributed, but it is sufficiently modular to support academic analysis of domain logic, authorization, data consistency, and extensibility.
