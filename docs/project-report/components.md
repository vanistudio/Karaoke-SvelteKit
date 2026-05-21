# Components

## Objective

This document breaks the application into major components and explains the responsibilities and interactions of each subsystem.

- Evidence basis: direct and derived
- Confidence level: 0.93

## Component Overview

The repository is organized around several cooperating component groups:

1. SvelteKit route components
2. Shared frontend primitives and stores
3. tRPC transport and boundary components
4. Authentication components
5. Domain routers, controllers, services, and repositories
6. Database schema components
7. Integration endpoints

## Frontend Components

### Public Route Components

The public route surface includes the home page, room listing, booking page, promotions page, services page, contact page, profile page, booking history page, authentication pages, and email verification page.

These components:

- render user-facing information;
- fetch data with `trpc()`;
- manage local state with Svelte 5 runes;
- convert server outcomes into toasts, navigation changes, or dialog state.

### Admin Route Components

Admin pages exist for:

- dashboard;
- bookings;
- rooms;
- services;
- promotions;
- pricing;
- settings;
- branches;
- users;
- reviews;
- calendar;
- activity.

These components are management-oriented read and write interfaces over the same tRPC application surface.

### Shared UI Components

The repository exposes reusable frontend primitives:

| Component           | Purpose                               |
| ------------------- | ------------------------------------- |
| `Toast.svelte`      | transient global notification display |
| `DatePicker.svelte` | date entry helper                     |
| `TimePicker.svelte` | time entry helper                     |
| `Skeleton.svelte`   | loading-state UI placeholder          |

### Shared Stores

The main explicitly shared transient state store is the toast store:

- `addToast()` creates feedback messages;
- `dismissToast()` removes messages;
- `toasts` is the reactive writable collection consumed by `Toast.svelte`.

## Integration Boundary Components

### tRPC Client Component

`src/lib/trpc/client.ts` creates a client proxy with:

- `httpBatchLink` for batched HTTP transport to `/api/trpc`;
- `loggerLink` for development and error logging;
- a browser singleton to reduce repeated client recreation on the frontend.

### tRPC Router Components

The `appRouter` aggregates the following domain routers:

- `room`
- `booking`
- `service`
- `dashboard`
- `promotion`
- `loyalty`
- `setting`
- `user`
- `pricing`
- `activity`
- `review`
- `calendar`
- `recommendation`
- `branch`
- `healthcheck`

This makes the tRPC router composition itself a significant system component.

## Authentication Components

### Better Auth Server Component

`src/lib/server/auth.ts` configures:

- email/password authentication;
- email verification;
- Drizzle-backed persistence;
- the Better Auth admin plugin;
- SvelteKit cookie integration.

### Server Hook Component

`hooks.server.ts` is the runtime bridge that:

- reads the authenticated session from Better Auth;
- attaches user/session data to `event.locals`;
- composes Better Auth handling and the tRPC request handler.

### Client Auth Component

`src/lib/auth-client.ts` exports `signIn`, `signUp`, `useSession`, `signOut`, and `sendVerificationEmail`, making Better Auth available to frontend routes.

## Domain Components

### Booking Component Group

This is the densest business component set:

- `booking.router.ts`
- `booking.controller.ts`
- `booking.service.ts`
- `booking.repository.ts`

It collaborates with pricing, loyalty, promotion, room, service, activity, user, and email components.

### Room and Branch Component Group

These components maintain venue inventory and location structure. Rooms optionally reference branches, and branch management is reserved for administrators.

### Promotion and Pricing Component Group

These components implement commercial policy:

- promotion validation and reservation;
- public and administrative promotion visibility;
- time-block and holiday pricing rules.

### Dashboard and Calendar Component Group

These components produce operational read models rather than transactional writes. They compose aggregations and cross-entity scheduling views for administrators and staff.

### Review and Recommendation Component Group

Reviews capture feedback tied to bookings and rooms. Recommendations provide alternative rooms and popular service suggestions based on current data rather than a separate machine-learning subsystem.

### User, Activity, and Settings Component Group

These components support governance and administration:

- user listing, role updates, ban/unban flows;
- activity-log pagination;
- settings read/write operations, including public setting projection.

## Persistence Components

The schema package defines the main persistence components:

- `user`, `session`, `account`, `verification`
- `room`, `branch`, `booking`, `booking_service_item`
- `service`, `promotion`, `pricing_rule`
- `point_history`, `review`, `setting`, `activity_log`
- `task` as a minor standalone table

These components collectively define the business information model.

## Integration Endpoint Components

Three plain HTTP route components exist outside the tRPC boundary:

| Endpoint               | Purpose                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| `/api/auth/[...all]`   | Better Auth callback and auth transport surface                   |
| `/api/upload`          | local image upload endpoint for administrative content management |
| `/api/export/bookings` | CSV export endpoint for booking records                           |

## Component Interaction Summary

The system’s component model is cohesive rather than distributed. Most components are small and focused, but they compose into several broader business capabilities:

- customer booking lifecycle;
- administrative configuration and reporting;
- identity and trust management;
- policy-driven pricing and loyalty support.

This component organization is appropriate for academic reporting because each major subsystem maps cleanly to a chapter subsection, diagram, or feature-analysis table.
