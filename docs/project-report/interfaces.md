# Interfaces

## Objective

This document describes the major interfaces inside and outside the system, including user interfaces, application interfaces, service boundaries, and external integrations.

- Evidence basis: direct and derived
- Confidence level: 0.91

## Interface Categories

The application exposes four main interface categories:

1. user-facing web interfaces;
2. first-party typed application interfaces through tRPC;
3. specialized HTTP endpoints;
4. external integration interfaces.

## User Interfaces

### Public and Member Interface

The public/member interface includes:

- landing and search page;
- rooms page;
- room booking page;
- services page;
- promotions page;
- contact page;
- login, registration, and email verification pages;
- profile page;
- booking history page;
- booking receipt page.

This interface is optimized for room discovery, account access, booking submission, and post-booking account management.

### Administrative Interface

The admin area is served under `/admin` and provides interfaces for:

- dashboard analytics;
- booking operations;
- room management;
- service management;
- promotions;
- pricing rules;
- settings;
- branches;
- users;
- reviews;
- calendar;
- activity logs.

## Internal Application Interfaces

### tRPC Client-to-Server Interface

The primary application interface is the tRPC surface. This is an internal RPC-style contract rather than a public REST API. The main design implications are:

- request structures are validated on the server with Zod;
- the client uses typed procedure calls instead of manually constructed endpoint strings and DTO classes;
- the interface is optimized for same-repository consumers rather than third-party developers.

### Authorization Interfaces

Authorization is exposed as reusable procedure wrappers:

- `publicProcedure`
- `protectedProcedure`
- `staffProcedure`
- `managerProcedure`
- `adminProcedure`
- `rateLimitedProcedure`
- `permissionProcedure(permission)`

These wrappers are architectural interfaces because they define the rules through which business capabilities become callable.

### Settings Interface

`SettingService` forms a configuration interface between static code and mutable runtime policy. It exposes:

- grouped settings retrieval;
- per-key retrieval;
- public settings projection;
- booking policy retrieval;
- loyalty configuration retrieval.

## Backend Layer Interfaces

### Router to Controller Interface

Routers pass validated inputs into controllers. This interface is intentionally narrow and procedural.

### Controller to Service Interface

Controllers delegate business actions to services, preserving a clean orchestration layer. This design prevents route files from directly carrying transactional logic.

### Service to Repository Interface

Services consume repositories for:

- entity retrieval;
- overlap queries;
- update and delete operations;
- count and list operations.

In a few places, services also call Drizzle directly for transaction scope or cross-entity logic. This is still part of the service-to-persistence interface and is consistent with the project’s pragmatic design.

## External Interfaces

### Better Auth Interface

Better Auth is the primary external auth library interface. It exposes:

- sign-in and sign-up methods;
- session retrieval;
- email verification support;
- cookie integration with SvelteKit.

### Resend Interface

The email subsystem integrates with Resend. The application sends:

- account verification emails;
- booking confirmation emails;
- booking cancellation emails.

### PostgreSQL Interface

PostgreSQL is accessed through Drizzle and supports:

- transactional writes;
- aggregate reads;
- foreign-key-backed entity relationships;
- indexed search and list behavior.

## Specialized HTTP Interfaces

### Upload Interface

The upload endpoint is a constrained file-ingestion interface for admin/manager users. It accepts multipart form data and returns a local URL when validation succeeds.

### CSV Export Interface

The booking export endpoint returns UTF-8 CSV content with BOM, enabling spreadsheet-friendly export of booking records for privileged users.

### Better Auth Route Interface

The auth callback route acts as a transport surface for Better Auth flows and should be treated as framework-managed rather than hand-designed business API.

## Interface Quality Observations

### Strengths

- Type-safe first-party application interface.
- Consistent authorization wrappers.
- Clear distinction between RPC application calls and special-case HTTP endpoints.
- Settings interface decouples policy retrieval from UI rendering.

### Constraints

- tRPC is ideal for internal consumers but less convenient for external ecosystem integration than a documented REST or OpenAPI surface.
- Response examples in a few areas must remain inferred rather than contract-generated because the codebase does not include formal external API documentation or schemas beyond Zod inputs.

## Summary

The system’s interfaces are coherent and pragmatic. They are designed primarily for maintainable first-party application development rather than open third-party integration, which is an appropriate design for the repository’s current scope and academic use case.
