# Technical Workflows

## Objective

This document explains the main technical workflows implemented in the codebase, focusing on data movement, control flow, and cross-module coordination.

- Evidence basis: direct and derived
- Confidence level: 0.92

## Workflow 1: Session Resolution and Shared Context

1. The incoming request reaches SvelteKit.
2. `hooks.server.ts` calls `auth.api.getSession(...)`.
3. If a session exists, `event.locals.user` and `event.locals.session` are populated.
4. The request proceeds through `svelteKitHandler(...)` for Better Auth integration.
5. `createTRPCHandle(...)` exposes `appRouter` at `/api/trpc`.
6. `createContext()` copies `event`, `db`, `user`, and `session` into tRPC context.

Technical significance:

- both page server loads and tRPC handlers depend on the same authenticated identity;
- this reduces duplicated auth state resolution and avoids divergence between page state and API state.

## Workflow 2: Public Room Search

1. A public page calls `trpc().room.findAvailable.query(...)`.
2. The room router validates the date range and optional capacity.
3. The controller forwards the request into `BookingService.findAvailableRooms(...)`.
4. Time values are normalized and policy-checked.
5. All rooms are loaded.
6. Each candidate room is tested for overlap through booking availability checks.
7. Matching rooms are returned to the page.

Technical tradeoff:

- the current approach is easy to understand and correct for moderate scale;
- it may become expensive if room volume grows significantly because availability is checked iteratively per room.

## Workflow 3: Booking Creation

1. An authenticated user submits the booking form.
2. The booking router applies `rateLimitedProcedure`.
3. Input is validated with Zod.
4. The controller calls `BookingService.createBooking(...)`.
5. The service validates points, room existence, time range, booking policy, guest count, and selected services.
6. A transaction begins.
7. The system acquires `pg_advisory_xact_lock(roomId)`.
8. Overlaps are checked again inside the transaction.
9. Dynamic room cost is computed minute by minute using active pricing rules.
10. Optional services are priced and added.
11. Voucher discount is reserved if a code is supplied.
12. Loyalty points are redeemed if requested.
13. The booking record is inserted.
14. Selected service items are inserted into the booking-service table.
15. Activity logging is persisted.
16. The transaction commits and the booking is returned.

Technical significance:

- concurrency control is explicitly recognized;
- price computation combines base price, rule multipliers, services, vouchers, and loyalty;
- the workflow is the core domain process of the system.

## Workflow 4: Booking Status Update

1. An admin or staff-equivalent user initiates a status change.
2. The router verifies role access.
3. The service loads the current booking in a transaction and locks it.
4. The service verifies the transition against an allowed transition map.
5. The status is updated.
6. Loyalty reward, refund, or reversal behavior is triggered depending on the transition.
7. Voucher usage may be released on cancellation.
8. Activity is logged.
9. After commit, email side effects are attempted for confirmation or cancellation.

Technical significance:

- business side effects are tied to workflow state, not merely to the existence of a booking record;
- email failure does not invalidate a successful status update.

## Workflow 5: Profile and Verification Support

1. The profile page uses Better Auth session state on the client.
2. The user may update their display name through `authClient.updateUser(...)`.
3. The user may change password through `authClient.changePassword(...)`.
4. If the email is not verified, the user may request a verification email resend.
5. The Better Auth server configuration delegates actual email sending to `EmailService`.

Technical significance:

- identity management is delegated to the auth subsystem while still integrated with project branding and settings-backed email content.

## Workflow 6: Dashboard Read Models

1. Admin dashboard pages call multiple dashboard procedures in parallel using `Promise.all`.
2. Dashboard service methods execute counts, sums, filtered queries, grouping, and ranking logic in the database.
3. Results are returned as UI-friendly structures for KPI cards, charts, heatmap, and summary lists.

Technical significance:

- dashboard data is composed from transactional tables rather than a separate analytical store;
- this is practical for the current system size but can become a scaling consideration later.

## Workflow 7: Administrative File Upload

1. An admin or manager submits multipart form data to `/api/upload`.
2. The endpoint checks session role from `locals.user`.
3. The request is validated for file presence, non-zero size, maximum size, and MIME type.
4. The file is written to `static/uploads` with a UUID-based name.
5. A local URL is returned.

Technical significance:

- upload scope is intentionally narrow;
- accepted URLs are later validated again by the service router through a regex.

## Workflow 8: Booking Export

1. An admin or manager accesses `/api/export/bookings`.
2. The endpoint validates role access.
3. It queries joined booking, user, and room data.
4. It formats fields into CSV rows with a UTF-8 BOM.
5. It returns a downloadable CSV response.

Technical significance:

- the system includes operational data extraction without depending on a separate reporting service.

## Workflow Summary

The repository implements a coherent workflow architecture in which:

- session context is shared consistently;
- routers remain thin;
- services own domain behavior;
- the booking subsystem provides the strongest example of transaction-safe process design;
- admin workflows are primarily read-model or CRUD oriented;
- external integration remains intentionally limited and understandable.
