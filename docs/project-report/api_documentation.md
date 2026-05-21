# API Documentation

## Objective

This document describes the callable API surface implemented in the repository. The system primarily exposes tRPC procedures for first-party use, plus a small number of specialized HTTP endpoints.

- Evidence basis: direct and derived
- Confidence level: 0.91

## API Style

The main application API is RPC-style rather than REST-style.

- Transport path: `/api/trpc`
- Contract style: typed procedure calls grouped by router namespace
- Validation: Zod input schemas and router guard procedures
- Main consumers: the SvelteKit frontend pages in the same repository

This means endpoint semantics are based on named procedures such as `booking.create` and `dashboard.stats`, not on a resource-oriented REST path hierarchy.

## Authentication and Authorization

### Authentication

- Better Auth resolves the current session.
- `hooks.server.ts` stores `user` and `session` on `event.locals`.
- tRPC context exposes the same identity to procedures.

### Authorization Levels

| Guard                  | Meaning                                               |
| ---------------------- | ----------------------------------------------------- |
| `publicProcedure`      | callable without login                                |
| `protectedProcedure`   | requires authenticated non-banned user                |
| `rateLimitedProcedure` | authenticated non-banned user plus booking rate limit |
| `staffProcedure`       | requires `admin`, `manager`, or `staff`               |
| `managerProcedure`     | requires `admin` or `manager`                         |
| `adminProcedure`       | requires `admin`                                      |

## Error Handling

The API surface uses two main error patterns:

- `TRPCError` for auth and procedure-level access violations;
- plain `Error` from services for domain validation problems such as invalid booking state, invalid voucher, or not found conditions.

HTTP endpoints return structured JSON or raw response objects with explicit status codes.

## tRPC Router Summary

### Healthcheck Router

| Procedure     | Auth   | Purpose                          |
| ------------- | ------ | -------------------------------- |
| `healthcheck` | public | simple system readiness response |

Response example:

```json
"TRPC System is ready"
```

### Room Router

| Procedure            | Auth     | Input                                                 | Purpose                |
| -------------------- | -------- | ----------------------------------------------------- | ---------------------- |
| `room.list`          | public   | none                                                  | list all rooms         |
| `room.getById`       | public   | room id                                               | fetch one room         |
| `room.count`         | public   | none                                                  | count rooms            |
| `room.create`        | manager+ | name, capacity, type, pricePerHour, optional branchId | create room            |
| `room.update`        | manager+ | id plus partial mutable fields                        | update room            |
| `room.delete`        | admin    | room id                                               | delete room            |
| `room.findAvailable` | public   | startTime, endTime, optional minCapacity              | return available rooms |

Validation notes:

- room type is constrained to `standard`, `vip`, or `super_vip`;
- capacity and price must be positive;
- availability inputs accept ISO datetimes or `Date` values.

### Booking Router

| Procedure                   | Auth                            | Purpose                                                         |
| --------------------------- | ------------------------------- | --------------------------------------------------------------- |
| `booking.list`              | staff+                          | list bookings for operations                                    |
| `booking.getById`           | protected                       | fetch one booking with ownership enforcement                    |
| `booking.myBookings`        | protected                       | fetch bookings of current user                                  |
| `booking.checkAvailability` | public                          | return `isAvailable` and `roomCost` for a candidate reservation |
| `booking.create`            | rate-limited authenticated user | create booking                                                  |
| `booking.cancelMyBooking`   | protected                       | cancel current user’s own pending booking                       |
| `booking.changeStatus`      | admin                           | administrative status transition                                |
| `booking.checkin`           | staff+                          | transition confirmed booking to checked-in                      |

Booking creation input shape:

```json
{
	"roomId": 1,
	"startTime": "2026-05-20T18:00:00.000Z",
	"endTime": "2026-05-20T20:00:00.000Z",
	"guestCount": 6,
	"pointsToUse": 100,
	"services": [{ "id": 3, "qty": 2 }],
	"voucherCode": "WEEKEND10"
}
```

Availability response example:

```json
{
	"isAvailable": true,
	"roomCost": 400000
}
```

### Service Router

| Procedure         | Auth     | Purpose              |
| ----------------- | -------- | -------------------- |
| `service.list`    | public   | list services        |
| `service.getById` | public   | fetch service detail |
| `service.count`   | admin    | count services       |
| `service.create`  | manager+ | create service       |
| `service.update`  | manager+ | update service       |
| `service.delete`  | admin    | delete service       |

Validation notes:

- category must be one of `food`, `drink`, `decoration`, `other`;
- image URLs must match a local `/uploads/<uuid>.<ext>` pattern.

### Promotion Router

| Procedure              | Auth      | Purpose                                     |
| ---------------------- | --------- | ------------------------------------------- |
| `promotion.list`       | manager+  | list all promotions                         |
| `promotion.listPublic` | public    | list public active promotions               |
| `promotion.getById`    | manager+  | fetch one promotion                         |
| `promotion.count`      | manager+  | count promotions                            |
| `promotion.create`     | manager+  | create promotion                            |
| `promotion.update`     | admin     | update promotion                            |
| `promotion.delete`     | admin     | delete promotion                            |
| `promotion.validate`   | public    | validate a voucher for an order amount      |
| `promotion.apply`      | protected | compute discount/final amount for a voucher |

Validation notes:

- codes are uppercased;
- type is `percent` or `fixed`;
- value and usage limits must be positive;
- `minOrderAmount` must be non-negative.

Promotion response example:

```json
{
	"promotionId": 2,
	"code": "WEEKEND10",
	"type": "percent",
	"value": 10,
	"discount": 50000,
	"finalAmount": 450000
}
```

### Loyalty Router

| Procedure            | Auth      | Purpose                                                        |
| -------------------- | --------- | -------------------------------------------------------------- |
| `loyalty.getInfo`    | protected | return points, tier, total spent, next tier, and points needed |
| `loyalty.getHistory` | protected | return point-history timeline for current user                 |

### Dashboard Router

| Procedure                    | Auth     | Purpose                                 |
| ---------------------------- | -------- | --------------------------------------- |
| `dashboard.stats`            | manager+ | KPI summary                             |
| `dashboard.recentBookings`   | manager+ | recent booking list                     |
| `dashboard.enrichedBookings` | manager+ | booking list with joined user/room data |
| `dashboard.revenueChart`     | manager+ | revenue-by-day series                   |
| `dashboard.occupancy`        | manager+ | occupancy summary                       |
| `dashboard.heatmap`          | manager+ | day-hour booking heatmap                |
| `dashboard.topRooms`         | manager+ | top rooms ranking                       |
| `dashboard.topCustomers`     | manager+ | top customers ranking                   |

### Pricing Router

| Procedure         | Auth  | Purpose            |
| ----------------- | ----- | ------------------ |
| `pricing.list`    | admin | list pricing rules |
| `pricing.getById` | admin | fetch one rule     |
| `pricing.create`  | admin | create rule        |
| `pricing.update`  | admin | update rule        |
| `pricing.delete`  | admin | delete rule        |

### Setting Router

| Procedure            | Auth   | Purpose                       |
| -------------------- | ------ | ----------------------------- |
| `setting.list`       | admin  | list all settings             |
| `setting.getByGroup` | admin  | get settings by group         |
| `setting.update`     | admin  | bulk update settings          |
| `setting.getPublic`  | public | get public site info settings |

### User Router

| Procedure         | Auth  | Purpose                             |
| ----------------- | ----- | ----------------------------------- |
| `user.list`       | admin | paginated user listing with filters |
| `user.getById`    | admin | fetch one user                      |
| `user.updateRole` | admin | change role                         |
| `user.ban`        | admin | ban user                            |
| `user.unban`      | admin | unban user                          |

### Review Router

| Procedure             | Auth      | Purpose                                  |
| --------------------- | --------- | ---------------------------------------- |
| `review.create`       | protected | create a review for a checked-in booking |
| `review.listByRoom`   | public    | list room reviews                        |
| `review.roomStats`    | public    | aggregated stats for one room            |
| `review.allRoomStats` | public    | aggregated stats for all reviewed rooms  |
| `review.list`         | manager+  | paginated review listing                 |
| `review.overallStats` | manager+  | review summary                           |

### Activity Router

| Procedure       | Auth  | Purpose                                                 |
| --------------- | ----- | ------------------------------------------------------- |
| `activity.list` | admin | paginated activity-log view with optional entity filter |

### Calendar Router

| Procedure         | Auth   | Purpose                                                      |
| ----------------- | ------ | ------------------------------------------------------------ |
| `calendar.getDay` | staff+ | return room list and overlapping bookings for a selected day |

### Branch Router

| Procedure        | Auth   | Purpose              |
| ---------------- | ------ | -------------------- |
| `branch.list`    | public | list active branches |
| `branch.listAll` | admin  | list all branches    |
| `branch.create`  | admin  | create branch        |
| `branch.update`  | admin  | update branch        |
| `branch.delete`  | admin  | delete branch        |
| `branch.count`   | admin  | count branches       |

### Recommendation Router

| Procedure                         | Auth   | Purpose                                       |
| --------------------------------- | ------ | --------------------------------------------- |
| `recommendation.alternativeRooms` | public | suggest alternative rooms for a time range    |
| `recommendation.popularServices`  | public | suggest popular services for an input context |

## HTTP Endpoints

### `POST /api/upload`

- Auth: `admin` or `manager`
- Input: multipart form data with a `file` field
- Validation:
  - file must exist;
  - file must be non-empty;
  - file size must not exceed 5 MB;
  - MIME type must be PNG, JPEG, WEBP, or GIF.
- Success response:

```json
{
	"success": true,
	"url": "/uploads/<generated-file-name>"
}
```

- Error responses:
  - `403` forbidden
  - `400` invalid file conditions
  - `500` upload failure

### `GET /api/export/bookings`

- Auth: `admin` or `manager`
- Output: downloadable CSV with joined booking, user, and room data
- Response headers:
  - `Content-Type: text/csv; charset=utf-8`
  - `Content-Disposition: attachment; filename="bookings_<date>.csv"`

### `/api/auth/[...all]`

- Purpose: Better Auth callback and transport surface
- Notes: framework-driven auth endpoint; not a custom business API in the same sense as the other endpoints

## API Limitations

- No formal OpenAPI or Swagger specification is committed.
- Output schemas are partly inferred from router return values and service outputs.
- Error payload consistency across all service-thrown errors is not fully standardized because many domain errors are plain `Error` objects.

## Summary

The repository exposes a rich but coherent first-party API surface. The most important conclusion for thesis purposes is that the system favors type-safe RPC semantics for internal application development, while using small targeted HTTP endpoints only where RPC is less appropriate.
