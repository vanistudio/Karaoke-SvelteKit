# Codebase Information and Evidence Map

## Objective

This document records the deterministic repository inventory used to produce the documentation bundle and summarizes the evidence sources behind the analysis.

- Evidence basis: direct
- Confidence level: 0.97

## Repository Snapshot

| Attribute                                  | Value                                                                                  |
| ------------------------------------------ | -------------------------------------------------------------------------------------- |
| Project root                               | `Karaoke-SvelteKit`                                                                    |
| Observed stack                             | Node.js, SvelteKit, Svelte, TypeScript, Vite, tRPC, Better Auth, Drizzle, PostgreSQL   |
| Approximate file count from inventory pass | 283                                                                                    |
| Indexed GitNexus repository                | `Karaoke-SvelteKit`                                                                    |
| Observed top-level business code roots     | `src/routes`, `src/lib/server`, `src/lib/components`, `src/lib/stores`, `src/lib/trpc` |
| Migration artifact root                    | `drizzle/`                                                                             |
| Static asset root                          | `static/`                                                                              |

## Top-Level Structure

| Path           | Type      | Notes                                                              |
| -------------- | --------- | ------------------------------------------------------------------ |
| `src/`         | directory | main application code                                              |
| `drizzle/`     | directory | SQL migrations and metadata snapshots                              |
| `scripts/`     | directory | seed script                                                        |
| `static/`      | directory | directly served assets                                             |
| `README.md`    | file      | secondary narrative documentation                                  |
| `SRS.md`       | file      | secondary requirements narrative; partially stale relative to code |
| `AGENTS.md`    | file      | agent instructions and repo conventions                            |
| `.env.example` | file      | environment variable reference                                     |

## Language and File Distribution

The inventory pass observed the following dominant language and extension signals:

- TypeScript is the primary implementation language.
- Svelte files define route and UI behavior.
- Markdown files are numerous because the repository includes local skill assets and agent support material.
- SQL migration artifacts exist in the Drizzle output directory.

## Application Entry and Integration Points

### Runtime Entrypoints

- `src/hooks.server.ts`
- `src/routes/+layout.server.ts`
- `src/routes/+layout.svelte`
- `src/lib/server/routes/app.router.ts`
- `src/lib/server/auth.ts`
- `src/lib/server/db/index.ts`

### Public Route Surface

Observed public/member routes include:

- `/`
- `/rooms`
- `/services`
- `/promotions`
- `/contact`
- `/login`
- `/register`
- `/booking/[roomId]`
- `/booking/receipt/[bookingId]`
- `/profile`
- `/my-bookings`
- `/verify-email`

### Admin Route Surface

Observed admin routes include:

- `/admin`
- `/admin/bookings`
- `/admin/rooms`
- `/admin/services`
- `/admin/promotions`
- `/admin/pricing`
- `/admin/settings`
- `/admin/branches`
- `/admin/users`
- `/admin/reviews`
- `/admin/calendar`
- `/admin/activity`

### HTTP Endpoint Surface

- `/api/auth/[...all]`
- `/api/upload`
- `/api/export/bookings`
- `/api/trpc` through the tRPC request handler

## Backend Module Inventory

### Routers

- `activity`
- `booking`
- `branch`
- `calendar`
- `dashboard`
- `loyalty`
- `pricing`
- `promotion`
- `recommendation`
- `review`
- `room`
- `service`
- `setting`
- `user`
- `healthcheck`

### Services

- `activityService`
- `bookingService`
- `dashboardService`
- `emailService`
- `loyaltyService`
- `pricingService`
- `promotionService`
- `recommendationService`
- `reviewService`
- `roomService`
- `serviceService`
- `settingService`
- `userService`

### Repositories

- booking
- pricing
- promotion
- room
- service
- setting
- user

## Database Entity Inventory

Observed schema files define the following primary entities:

- user
- session
- account
- verification
- room
- branch
- booking
- booking_service_item
- service
- promotion
- pricing_rule
- point_history
- review
- setting
- activity_log
- task

## Test Surface Inventory

The repository contains configured testing infrastructure, but the committed test files discovered during inventory are minimal and appear to be example-level rather than business-domain coverage:

- `src/lib/vitest-examples/Welcome.svelte.spec.ts`
- `src/lib/vitest-examples/greet.spec.ts`

This has significant implications for the evaluation chapter and is recorded in `testing_and_evaluation.md` and `review_notes.md`.

## Deployment Evidence Inventory

### Directly Observed

- `svelte.config.js` uses `@sveltejs/adapter-auto`.
- `.env.example` documents required environment variables.
- `package.json` defines development, build, check, test, and database scripts.

### Not Observed

- no committed `.github/workflows` directory;
- no committed Dockerfile;
- no committed docker-compose file;
- no committed Terraform, Pulumi, or similar infrastructure manifests;
- no committed monitoring stack manifests.

## Evidence Map

| Topic                          | Evidence class | Notes                                                   |
| ------------------------------ | -------------- | ------------------------------------------------------- |
| Authentication architecture    | direct         | `auth.ts`, `hooks.server.ts`, `auth-client.ts`          |
| Booking business rules         | direct         | `booking.service.ts`, router and repository usage       |
| Authorization model            | direct         | `trpc/t.ts`, `permissions.ts`, admin layout server load |
| Dashboard analytics            | direct         | `dashboard.service.ts`, admin dashboard page            |
| Database schema                | direct         | Drizzle schema files and SQL migrations                 |
| Public business requirements   | derived        | route/page behavior plus service/router logic           |
| Deployment architecture        | derived        | adapter choice plus absence of infra files              |
| Monitoring and backup strategy | unknown        | not evidenced in repo                                   |

## Analysis Limitations

- Existing narrative documents contain ideas that are not fully implemented; they could not be treated as authoritative.
- GitNexus route mapping did not recover plain route relations for this project, so route documentation relied on direct repository inspection.
- Runtime performance characteristics under load cannot be measured from static analysis alone.
- Operational procedures such as backup rotation, alerting, and incident response are not evidenced by committed files.

## Summary

The codebase is sufficiently complete to support an academically credible architectural and business analysis. The strongest evidence exists for application structure, authorization, booking logic, data modeling, and admin features. The weakest evidence exists for automated testing depth and production operations.
