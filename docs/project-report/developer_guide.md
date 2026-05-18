# Developer Guide

## Objective

This guide explains how contributors can understand, run, and extend the project without violating existing architecture and conventions.

- Evidence basis: direct and derived
- Confidence level: 0.93

## Project Structure

### Main Directories

| Path                          | Responsibility                                    |
| ----------------------------- | ------------------------------------------------- |
| `src/routes`                  | SvelteKit pages, layouts, and HTTP route handlers |
| `src/lib/trpc`                | frontend tRPC client wrapper                      |
| `src/lib/components`          | shared UI components                              |
| `src/lib/stores`              | shared reactive stores                            |
| `src/lib/server/routes`       | tRPC routers                                      |
| `src/lib/server/controllers`  | orchestration layer                               |
| `src/lib/server/services`     | business logic                                    |
| `src/lib/server/repositories` | persistence access helpers                        |
| `src/lib/server/db/schema`    | Drizzle table definitions and relations           |
| `src/lib/server/trpc`         | context and auth/guard helpers                    |
| `scripts`                     | utility scripts such as seeding                   |
| `drizzle`                     | generated migration artifacts                     |

## Coding Conventions

### Naming

- classes use `PascalCase`;
- exported singleton instances use matching `camelCase`;
- route files follow SvelteKit naming conventions;
- backend files use suffixes such as `.router.ts`, `.controller.ts`, `.service.ts`, and `.repository.ts`.

### Imports

- internal modules prefer `$lib/...` aliases;
- external packages generally appear before internal imports.

### State Style

- Svelte 5 runes are the default local-state pattern;
- shared transient feedback uses the toast store.

### Validation Style

- Zod schemas are defined at the router boundary;
- services assume inputs are already structurally validated but still enforce business rules.

## How to Run the Project Locally

1. Install dependencies with `npm install`.
2. Create environment values based on `.env.example`.
3. Ensure PostgreSQL is available.
4. Apply schema or generate/push migrations as needed.
5. Optionally seed data with `npm run db:seed`.
6. Start development with `npm run dev`.

Useful commands:

- `npm run check`
- `npm run test`
- `npm run build`
- `npm run db:studio`

## Build Process

- Vite powers development and build execution.
- SvelteKit compiles the application into the target selected by `adapter-auto`.
- Drizzle commands manage schema and migration workflows.

## Common Contributor Workflows

### Add a New Admin Feature

1. Create or extend a router procedure.
2. Add service logic and repository behavior if needed.
3. Add a Svelte admin page or form interaction.
4. Enforce role access through the proper procedure guard.
5. Add activity logging for sensitive mutations.

### Add a New Booking Rule

1. Start in `booking.service.ts`.
2. Keep structural validation in the router if new input fields are required.
3. Add or update repository calls only if data access patterns change.
4. Ensure interactions with loyalty, promotions, and status transitions remain coherent.

### Add a New Configurable Business Setting

1. Define a default in `SettingService`.
2. Ensure the key can be retrieved from the database-backed settings flow.
3. Expose it through admin settings if operationally needed.

## Debugging Tips

- Start with `hooks.server.ts` when debugging auth/session behavior.
- Start with `app.router.ts` and the domain router when debugging page-to-backend behavior.
- Start with services when debugging business-rule failures.
- Check activity logging and booking transitions when debugging admin workflow issues.
- Check `.env.example` and `auth.ts` / `db/index.ts` for startup configuration failures.
- Check upload endpoint logic when admin media actions fail.

## Important Implementation Patterns

### Shared Session Context

Authentication state is resolved once in the hook and reused everywhere else. Avoid implementing separate ad hoc session lookups inside individual business procedures unless there is a compelling reason.

### Thin Routers

Keep routers focused on:

- auth guards;
- input validation;
- high-level delegation.

Do not move complex booking or loyalty logic into route files.

### Service-Centered Business Logic

Business behavior should live in services. This is especially important for:

- booking transitions;
- loyalty accounting;
- pricing calculations;
- promotion handling.

### Repository and Query Discipline

Prefer repositories for reusable data access patterns. Direct Drizzle queries are acceptable in services when transaction scope or cross-entity aggregation makes them clearer.

## Contributor Cautions

- The worktree may contain unrelated local changes; avoid overwriting them.
- Booking logic has cross-cutting side effects, so changes should consider promotions, loyalty, activity logs, and notifications together.
- Public docs in `README.md` or `SRS.md` are not always fully aligned with current implementation; verify against code before making assumptions.

## Summary

The project is approachable for contributors because its architectural boundaries are visible and consistent. The main discipline required is to preserve the existing separation of concerns and to treat the booking domain as a high-sensitivity area.
