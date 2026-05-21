# AGENTS.md

## 1. Overview

Karaoke-SvelteKit is a karaoke room booking application with a public storefront, authenticated member flows, and an admin back office. The codebase keeps UI routing in SvelteKit while concentrating booking, loyalty, analytics, verification email, and management logic behind tRPC.

## 2. Folder Structure

- `src/routes`: SvelteKit route surface.
  - `+layout.svelte`, `+layout.server.ts`, `hooks.server.ts`: shared shell, session hydration, and request middleware.
  - Public pages such as `rooms`, `services`, `promotions`, `booking`, `booking/receipt`, `profile`, `my-bookings`, `contact`, and `verify-email`: storefront and member flows.
  - `admin`: analytics, bookings, rooms, promotions, pricing, settings, branches, users, reviews, calendar, and activity.
  - `api`: Better Auth callbacks, uploads, and booking CSV export.
- `src/lib/trpc`: browser tRPC client wrapper.
- `src/lib/auth-client.ts`: Better Auth client exports including `sendVerificationEmail`.
- `src/lib/stores` and `src/lib/components`: shared UI state and primitives such as toasts and pickers.
- `src/lib/server`: server architecture and domain logic.
  - `routes`: tRPC routers with Zod schemas and procedure-level auth, including `dashboard`, `calendar`, `branch`, `loyalty`, `recommendation`, and `review`.
  - `controllers`: thin orchestration layer.
  - `services`: business rules, pricing, loyalty, dashboard aggregation, recommendations, activity logging, settings-backed policy/config, and email side effects.
  - `repositories`: Drizzle-backed persistence boundaries.
  - `db/schema`: tables and relations including `branch`, `verification`, `point_history`, and nullable room `branchId`.
  - `trpc`: context creation, auth procedures, and rate limiting middleware.
  - `config`: permission and loyalty constants.
- `drizzle`: generated migration history; treat as persistence artifacts, not feature logic.
- `static`: static assets served directly by SvelteKit.
- `.agents/skills`: local agent skills; do not mix repository runtime code into this area.

## 3. Core Behaviors & Patterns

- **Cross-boundary wiring**: Request flow is `hooks.server.ts` -> `event.locals` -> `createContext` -> tRPC procedures or page loads. Better Auth resolves the session once in the hook, then both SvelteKit loads and tRPC handlers consume the same `user` and `session`.
- **Auth and verification lifecycle**: Better Auth verification is configured in `src/lib/server/auth.ts`, delegated to `emailService`, and consumed through `src/lib/auth-client.ts` across `register`, `login`, `profile`, and `verify-email`.
- **Module communication**: Public and admin pages call `trpc()` directly from Svelte components, often inside `Promise.all` for initial hydration. UI handlers map server errors to toasts or redirects.
- **Authorization**: Access control is centralized in reusable tRPC procedures such as `publicProcedure`, `protectedProcedure`, `staffProcedure`, `managerProcedure`, `adminProcedure`, and `rateLimitedProcedure`. Route-level SvelteKit guards only handle page entry redirects.
- **Layered server flow**: Most mutable domains follow `router -> controller -> service -> repository -> db`.
- **Shared configuration**: `db`, settings, permissions, loyalty rules, branch assignments, and auth session objects are centralized.
- **Settings-driven behavior**: `settingService` is the source of truth for public site info, booking policy, and loyalty thresholds/rates.
- **State lifecycle and recovery**: Booking flows normalize cross-midnight ranges, enforce policy from settings, lock per room, check overlaps, price minute by minute, apply voucher and loyalty logic, write booking plus service rows, record activity, and then attempt notification emails outside the transaction.
- **Operational read models**: Dashboard batches stats, charts, occupancy, heatmap, top rooms/customers, and enriched bookings. Calendar builds a day schedule from room inventory plus booking overlaps.
- **Branch and recommendation support**: Rooms can carry nullable `branchId`; branch CRUD is admin-only with activity logging. Recommendation stays as read-only public tRPC helpers.
- **Public surface accuracy**: `contact` reads real public settings, but submit is still a local UI flow without server-side persistence.
- **Error handling**: Environment failures stop early at startup, auth failures become `TRPCError`s, and domain validation usually throws plain `Error` from services.

## 4. Conventions

- **Naming**: Classes use `PascalCase`; shared instances use `camelCase` with the same stem (`BookingService` / `bookingService`, `bookingRepository`, `bookingController`).
- **File structure**: SvelteKit route files keep framework naming (`+page.svelte`, `+page.server.ts`, `+layout.server.ts`, `+server.ts`). Server-layer files use suffixed names such as `booking.router.ts`, `booking.controller.ts`, `booking.service.ts`, and `booking.repository.ts`.
- **Imports**: Use `$lib` aliases for internal modules instead of long relative traversals. External packages are typically grouped first, then `$lib` imports.
- **Interfaces and signatures**: Routers accept `z.object(...)` inputs, convert incoming ISO date strings to `Date` objects at the boundary, and pass typed payloads inward.
- **Comments**: Comments are sparse and reserved for non-obvious framework or tooling details.
- **Client state**: Svelte 5 runes are the default local-state style (`$state`, `$derived`, `$effect`). Shared transient feedback goes through the `toasts` store and `Toast.svelte`; admin CRUD pages usually hydrate with `Promise.all` and local dialogs.
- **Configuration keys**: Runtime settings follow prefixes such as `site_*`, `booking_*`, and `loyalty_*`.
- **Data modeling**: Room-to-branch relationships are nullable. Loyalty, point history, and analytics are returned in service-driven shapes.
- **Boundary conventions**: Redirect decisions for page access live in server load functions, but data authorization stays in tRPC procedures. tRPC is the default application channel, while plain HTTP endpoints under `src/routes/api` are reserved for integrations, callbacks, uploads, or downloadable exports such as `GET /api/export/bookings`.

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
- Keep documentation aligned with actual code paths and current runtime behavior; do not describe placeholder UI flows as if backend persistence already exists

<!-- gitnexus:start -->

# GitNexus — Code Intelligence

This project is indexed by GitNexus as **Karaoke-SvelteKit** (904 symbols, 1864 relationships, 70 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

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
