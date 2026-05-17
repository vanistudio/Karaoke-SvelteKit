# AGENTS.md

## 1. Overview

Karaoke-SvelteKit is a karaoke room booking application with a public storefront, authenticated user flows, and an admin back office. The codebase keeps UI routing in SvelteKit while concentrating business logic in a typed server stack behind tRPC.

## 2. Folder Structure

- `src/routes`: SvelteKit route surface.
  - `+layout.svelte`, `+layout.server.ts`, `hooks.server.ts`: shared shell, session hydration, and request middleware.
  - Public pages such as `rooms`, `services`, `promotions`, `booking`, `profile`, and `my-bookings`: customer-facing flows that call tRPC from Svelte components.
  - `admin`: staff and admin dashboards for bookings, rooms, promotions, pricing, settings, branches, users, reviews, calendar, and activity.
  - `api`: non-tRPC HTTP endpoints for Better Auth, uploads, seeding, and booking export.
- `src/lib/trpc`: browser tRPC client wrapper; reuse this instead of creating ad hoc fetch layers.
- `src/lib/auth-client.ts`: Better Auth client exports for sign-in, sign-out, and session hooks.
- `src/lib/stores` and `src/lib/components`: shared UI state and primitives such as toast notifications and date/time pickers.
- `src/lib/server`: server architecture and domain logic.
  - `routes`: tRPC routers with Zod input schemas and procedure-level auth.
  - `controllers`: thin orchestration layer used by routers when a feature follows the full stack.
  - `services`: business rules, pricing, loyalty, activity logging, recommendations, dashboard aggregation, and email side effects.
  - `repositories`: Drizzle-backed persistence boundaries; keep SQL and table access here.
  - `db/schema`: table definitions, relation wiring, and schema barrel exports.
  - `trpc`: context creation, auth procedures, and rate limiting middleware.
  - `config`: permission and loyalty constants used across services and middleware.
- `drizzle`: generated migration history; treat as persistence artifacts, not feature logic.
- `static`: static assets served directly by SvelteKit.
- `.agents/skills`: local agent skills; do not mix repository runtime code into this area.

## 3. Core Behaviors & Patterns

- **Cross-boundary wiring**: Request flow is `hooks.server.ts` -> `event.locals` -> `createContext` -> tRPC procedures or page loads. Better Auth resolves the session once in the hook, then both SvelteKit loads and tRPC handlers consume the same `user` and `session` context instead of refetching auth state.
- **Module communication**: Public and admin pages call `trpc()` directly from Svelte components, usually inside `Promise.all` batches for initial hydration. Server mutations return domain errors upward; UI handlers catch them and surface a toast or redirect instead of duplicating business rules client-side.
- **Authorization**: Access control is centralized in reusable tRPC procedures such as `publicProcedure`, `protectedProcedure`, `staffProcedure`, `managerProcedure`, `adminProcedure`, and `rateLimitedProcedure`. Route-level SvelteKit guards only handle page entry redirects; permission enforcement for data operations belongs in the tRPC layer.
- **Layered server flow**: Most mutable domains follow `router -> controller -> service -> repository -> db`. Routers validate and normalize input, controllers stay thin, services enforce invariants and side effects, and repositories own Drizzle queries.
- **Shared resource management**: `db` is created once from the schema barrel and reused through repositories and tRPC context. Settings, permissions, loyalty rules, and auth session objects are also centralized so features do not construct local variants.
- **State lifecycle and recovery**: Booking creation and status changes are multi-step flows. The booking service checks availability, prices the slot minute by minute through pricing rules, applies vouchers and loyalty points, writes booking plus service rows, records activity, and then attempts notification side effects. Loyalty rollback and email failures are caught separately so a notification problem does not undo the persisted booking state.
- **Error handling**: Environment failures stop early at startup, auth failures become `TRPCError`s, and domain validation usually throws plain `Error` from services. Follow the existing boundary behavior: validate as close to the business rule as possible, then let UI callers map failures to redirects or toast messages.

## 4. Conventions

- **Naming**: Classes use `PascalCase`; shared instances use `camelCase` with the same stem (`BookingService` / `bookingService`, `bookingRepository`, `bookingController`). Roles, permission keys, and route procedure names are descriptive and domain-specific rather than abbreviated.
- **File structure**: SvelteKit route files keep framework naming (`+page.svelte`, `+page.server.ts`, `+layout.server.ts`, `+server.ts`). Server-layer files use suffixed names such as `booking.router.ts`, `booking.controller.ts`, `booking.service.ts`, and `booking.repository.ts` so the owning layer is obvious.
- **Imports**: Use `$lib` aliases for internal modules instead of long relative traversals. External packages are typically grouped first, then `$lib` imports.
- **Interfaces and signatures**: Routers accept `z.object(...)` inputs, convert incoming date strings to `Date` objects at the boundary, and pass typed payloads inward. Services often mirror repository parameter types via `Parameters<typeof dependency.method>[index]` rather than redefining DTOs.
- **Comments**: Comments are sparse and reserved for non-obvious framework or tooling details. Prefer readable naming and small methods over explanatory comments.
- **Client state**: Svelte 5 runes are the default local-state style (`$state`, `$derived`, `$effect`). Shared transient feedback goes through the `toasts` store and `Toast.svelte`; do not introduce parallel notification mechanisms.
- **Boundary conventions**: Redirect decisions for page access live in server load functions, but data authorization stays in tRPC procedures. Plain HTTP endpoints under `src/routes/api` are reserved for integration cases that do not fit the typed tRPC channel.

## 5. Working Agreements

- Respond in Vietnamese unless the user asks otherwise; keep technical terms in English and never translate code blocks
- Ask the user before introducing tests, lint, or formatter setups; add them only on explicit request
- Build context by reviewing related usages, flows, patterns, and likely impact before editing
- Fix the underlying cause, not only the visible symptom; inspect affected flows and apply the narrowest complete change that resolves the root issue
- Check side effects across callers, shared abstractions, and behavior/API boundaries; report relevant impact and compatibility risks
- Ask actively when user decisions are needed for scope, behavior, or tradeoffs
- Run type-check after code changes with `npm run check`
- New functions: single-purpose, colocated with related code
- External dependencies: only when necessary, explain why

<!-- gitnexus:start -->

# GitNexus — Code Intelligence

This project is indexed by GitNexus as **Karaoke-SvelteKit** (786 symbols, 1578 relationships, 58 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource                                           | Use for                                  |
| -------------------------------------------------- | ---------------------------------------- |
| `gitnexus://repo/Karaoke-SvelteKit/context`        | Codebase overview, check index freshness |
| `gitnexus://repo/Karaoke-SvelteKit/clusters`       | All functional areas                     |
| `gitnexus://repo/Karaoke-SvelteKit/processes`      | All execution flows                      |
| `gitnexus://repo/Karaoke-SvelteKit/process/{name}` | Step-by-step execution trace             |

## CLI

| Task                                         | Read this skill file                                        |
| -------------------------------------------- | ----------------------------------------------------------- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md`       |
| Blast radius / "What breaks if I change X?"  | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?"             | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md`       |
| Rename / extract / split / refactor          | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md`     |
| Tools, resources, schema reference           | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md`           |
| Index, status, clean, wiki CLI commands      | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md`             |

<!-- gitnexus:end -->
