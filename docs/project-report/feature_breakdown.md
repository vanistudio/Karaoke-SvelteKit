# Feature Breakdown

## Objective

This document provides a feature-by-feature analysis of the implemented system. Each feature is described in terms of purpose, modules, business logic, APIs, data dependencies, security, and performance considerations.

- Evidence basis: direct and derived
- Confidence level: 0.92

## 1. Authentication and Account Management

- Purpose: allow users to register, log in, maintain authenticated sessions, verify their email addresses, and manage account profile details.
- Related modules/files: `src/lib/server/auth.ts`, `src/hooks.server.ts`, `src/lib/auth-client.ts`, `src/routes/login`, `src/routes/register`, `src/routes/profile`, `src/routes/verify-email`.
- Business logic: email/password auth, email verification resend, user profile update, password change.
- APIs involved: Better Auth client methods and auth callback route; `loyalty.getInfo`, `loyalty.getHistory` for profile enrichment.
- Database models involved: `user`, `session`, `account`, `verification`, `point_history`.
- User interactions: sign-up form, login form, profile edits, resend verification.
- Security considerations: session-backed access, banned-user blocking, verified-email lifecycle.
- Performance considerations: session resolution occurs once per request in the hook and is reused downstream.

## 2. Public Room Discovery

- Purpose: allow visitors to view room inventory and search for available rooms.
- Related modules/files: `room.router.ts`, `room.service.ts`, `booking.service.ts`, `src/routes/+page.svelte`, `src/routes/rooms/+page.svelte`.
- Business logic: room listing, count retrieval, availability search with optional minimum capacity.
- APIs involved: `room.list`, `room.count`, `room.findAvailable`.
- Database models involved: `room`, `booking`, `review`.
- User interactions: browse cards, filter by date/time, inspect room quality metrics.
- Security considerations: public-readable surface only.
- Performance considerations: iterative per-room availability checks may be a future scaling bottleneck.

## 3. Booking Engine

- Purpose: create valid room reservations while preventing conflicts and calculating total cost accurately.
- Related modules/files: `booking.router.ts`, `booking.controller.ts`, `booking.service.ts`, `booking.repository.ts`, `pricing.service.ts`, `promotion.service.ts`, `loyalty.service.ts`.
- Business logic: time normalization, booking policy validation, overlap prevention, guest-count validation, service enrichment, voucher reservation, loyalty redemption, final-cost calculation, activity logging.
- APIs involved: `booking.checkAvailability`, `booking.create`.
- Database models involved: `booking`, `booking_service_item`, `room`, `service`, `promotion`, `point_history`, `activity_log`.
- User interactions: select time range, guests, services, voucher, points; submit booking.
- Security considerations: authenticated requirement, rate limiting, server-side validation, transaction safety.
- Performance considerations: minute-by-minute pricing calculation is accurate but more computationally expensive than block pricing.

## 4. Booking Status and Lifecycle Management

- Purpose: move bookings through pending, confirmed, cancelled, and checked-in states.
- Related modules/files: `booking.router.ts`, `booking.service.ts`, admin bookings page, member booking history page.
- Business logic: status transition validation, loyalty reward on confirmation, refund/reversal on cancellation, notification emails after commit.
- APIs involved: `booking.changeStatus`, `booking.checkin`, `booking.cancelMyBooking`, `booking.getById`, `booking.myBookings`.
- Database models involved: `booking`, `point_history`, `promotion`, `activity_log`, `user`.
- User interactions: admin confirms/cancels/checks in; member cancels own pending booking.
- Security considerations: role-gated transitions and ownership checks.
- Performance considerations: transaction locking is localized to the target booking and room state checks.

## 5. Loyalty Program

- Purpose: reward customer spending, support redemption, and expose tier progress.
- Related modules/files: `loyalty.service.ts`, `loyalty.router.ts`, `setting.service.ts`, `config/loyalty.ts`, profile and booking pages.
- Business logic: point accrual, redemption, refund, reversal, tier calculation, next-tier projection.
- APIs involved: `loyalty.getInfo`, `loyalty.getHistory`.
- Database models involved: `user`, `point_history`, `setting`, `booking`.
- User interactions: members view points and optionally spend them during booking.
- Security considerations: only the authenticated owner can access loyalty details.
- Performance considerations: history retrieval is straightforward; no caching is present.

## 6. Promotion Management

- Purpose: apply discount campaigns to qualifying orders.
- Related modules/files: `promotion.router.ts`, `promotion.service.ts`, `promotion.repository.ts`, promotions pages.
- Business logic: code normalization, active/expiry checks, order-minimum checks, usage reservation and release, discount calculation.
- APIs involved: `promotion.list`, `promotion.listPublic`, `promotion.create`, `promotion.update`, `promotion.delete`, `promotion.validate`, `promotion.apply`.
- Database models involved: `promotion`, `booking`.
- User interactions: public users browse visible promotions; members validate vouchers; admins manage campaigns.
- Security considerations: admin/manager restrictions for management operations.
- Performance considerations: voucher validation is inexpensive but sits on the critical booking path.

## 7. Service Catalog and Image Upload

- Purpose: manage and attach add-on products to bookings.
- Related modules/files: `service.router.ts`, `service.service.ts`, `service.repository.ts`, `src/routes/admin/services/+page.svelte`, `/api/upload`.
- Business logic: CRUD for services, category validation, availability state, local image URL constraint.
- APIs involved: `service.list`, `service.create`, `service.update`, `service.delete`, `POST /api/upload`.
- Database models involved: `service`, `booking_service_item`.
- User interactions: admins upload service images and manage offerings; members select services during booking.
- Security considerations: upload restricted by role, file type, size, and persisted path format.
- Performance considerations: uploads write to local disk; no CDN or image processing pipeline is present.

## 8. Room and Branch Administration

- Purpose: manage inventory and venue grouping.
- Related modules/files: `room.router.ts`, `room.service.ts`, `branch.router.ts`, admin rooms/branches pages.
- Business logic: room CRUD, branch CRUD, active branch listing, active-booking guard on room deletion.
- APIs involved: all `room.*` and `branch.*` procedures.
- Database models involved: `room`, `branch`, `booking`.
- User interactions: privileged users manage inventory definitions.
- Security considerations: create/update by manager+, delete by admin for rooms; branch management by admin only.
- Performance considerations: simple CRUD workloads.

## 9. Dashboard Analytics and Calendar

- Purpose: provide managers and staff with operational visibility.
- Related modules/files: `dashboard.service.ts`, `dashboard.router.ts`, `calendar.router.ts`, admin dashboard and calendar pages.
- Business logic: counts, sums, occupancy, revenue series, heatmap, rankings, day schedule.
- APIs involved: all `dashboard.*` procedures and `calendar.getDay`.
- Database models involved: `booking`, `room`, `user`, `service`.
- User interactions: managers inspect KPIs and staff view room schedules by day.
- Security considerations: role restrictions differentiate dashboard access from general public access.
- Performance considerations: repeated aggregate queries may become heavy at scale without caching or materialization.

## 10. Reviews and Recommendations

- Purpose: collect customer feedback and surface lightweight assistance for room/service selection.
- Related modules/files: `review.router.ts`, `review.service.ts`, `recommendation.router.ts`, `recommendation.service.ts`, rooms and my-bookings pages.
- Business logic: review creation only after checked-in bookings; room statistics aggregation; alternative room suggestions; popular service suggestions.
- APIs involved: all `review.*` and `recommendation.*` procedures.
- Database models involved: `review`, `booking`, `room`, `service`, `user`.
- User interactions: members rate rooms; public users see room ratings.
- Security considerations: ownership and checked-in enforcement on review creation.
- Performance considerations: review queries are bounded; recommendation sophistication is intentionally lightweight.

## 11. Settings and Public Site Information

- Purpose: store mutable business and public-facing configuration.
- Related modules/files: `setting.router.ts`, `setting.service.ts`, admin settings page, layout and contact page consumers.
- Business logic: grouped retrieval, public projection, loyalty and booking policy materialization.
- APIs involved: `setting.list`, `setting.getByGroup`, `setting.update`, `setting.getPublic`.
- Database models involved: `setting`.
- User interactions: admins update business policy and site information; public pages consume public settings.
- Security considerations: admin-only mutation.
- Performance considerations: repeated per-key lookups could be optimized later, but the current scale is acceptable.

## 12. User Administration and Activity Logging

- Purpose: govern user access and maintain an audit trail.
- Related modules/files: `user.router.ts`, `user.service.ts`, `activity.router.ts`, `activity.service.ts`, admin users/activity pages.
- Business logic: user pagination, filtering, role updates, ban/unban, activity logging on sensitive actions.
- APIs involved: `user.*` and `activity.list`.
- Database models involved: `user`, `activity_log`.
- User interactions: admins manage user roles and review audit events.
- Security considerations: high-privilege access only.
- Performance considerations: pagination is implemented to control list size.

## 13. Export and Operational Support

- Purpose: support administrative reporting and downstream office workflows.
- Related modules/files: `/api/export/bookings/+server.ts`.
- Business logic: joined booking export with formatted CSV content.
- APIs involved: `GET /api/export/bookings`.
- Database models involved: `booking`, `room`, `user`.
- User interactions: admin or manager downloads CSV.
- Security considerations: role-gated endpoint.
- Performance considerations: fully in-memory response generation may need review for very large datasets.
