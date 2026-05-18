# Business Analysis

## Objective

This document interprets the implemented system from a business-analysis perspective by identifying the operational context, users, requirements, use cases, and rules encoded in the application.

- Evidence basis: direct and derived
- Confidence level: 0.89

## Business Context

The system models a karaoke business that rents themed or tiered rooms by time slot and supplements core bookings with optional services, promotions, and customer loyalty incentives. The application supports both the customer transaction lifecycle and the venue’s internal coordination needs.

The business value of the platform comes from reducing manual friction in room reservation and operational tracking. The system acts as a digital intermediary between customers seeking room availability and venue operators managing inventory, booking approval, room usage, promotions, and customer retention.

## User Roles

The codebase explicitly recognizes five roles through permission and procedure checks:

| Role      | Business meaning                 | Typical capabilities                                      |
| --------- | -------------------------------- | --------------------------------------------------------- |
| `user`    | Registered customer/member       | Book rooms, see own bookings, use loyalty, submit reviews |
| `staff`   | Operational employee             | Access booking lists and the calendar, assist check-in    |
| `manager` | Mid-level operator               | Manage operational datasets and analytics                 |
| `admin`   | System owner / top administrator | Full control, configuration, destructive operations       |
| `banned`  | Blocked account                  | Denied application operations                             |

## User Requirements

### Customer-Oriented Requirements

- View available karaoke rooms and their basic metadata.
- Search room availability for a selected time range and optional minimum capacity.
- Create a booking without visiting the venue in advance.
- Select add-on services at the time of booking.
- Apply a voucher if valid.
- Redeem loyalty points when available.
- Review previous bookings and cancel pending bookings.
- Maintain account profile and password.
- Verify account ownership by email.

### Administrative Requirements

- View total bookings, users, rooms, services, and revenue-related statistics.
- Approve, cancel, or check in bookings.
- Manage room inventory and hourly pricing foundations.
- Manage services, promotions, branches, and configurable site/business settings.
- View review summaries and operational activity logs.
- Manage user roles and account status.
- Export booking data for operational or reporting use.

## Main Use Cases

| Use case                               | Primary actor                    | Outcome                                                                                        |
| -------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------- |
| Search available rooms                 | Public visitor or member         | Candidate rooms are returned for the selected time window                                      |
| Register and verify account            | New member                       | Authenticated account is created and email verification is initiated                           |
| Log in and maintain session            | Member / staff / manager / admin | Session is stored and reused across page loads and tRPC requests                               |
| Create booking                         | Authenticated member             | Booking, service items, loyalty redemption, and activity records are persisted transactionally |
| Cancel own pending booking             | Member                           | Booking status changes to cancelled and downstream accounting adjustments occur if needed      |
| Confirm or cancel booking              | Admin                            | Booking status changes and notification emails may be sent                                     |
| Check in customer                      | Staff or above                   | Confirmed booking transitions to checked-in state                                              |
| Manage rooms and services              | Manager or admin                 | Inventory is created or updated                                                                |
| Configure promotions and pricing rules | Manager or admin                 | Commercial policy is maintained                                                                |
| Review dashboard analytics             | Manager or admin                 | Operational insight is displayed from aggregated database queries                              |

## Functional Requirements Derived from the Codebase

### Booking and Room Management

- The system shall normalize booking time ranges and support cross-midnight reservations.
- The system shall reject bookings in the past.
- The system shall enforce a configurable minimum duration, maximum duration, and maximum advance booking horizon.
- The system shall prevent overlapping bookings through database-backed checks inside a transaction protected by a PostgreSQL advisory lock.
- The system shall validate guest count against room capacity when guest count is supplied.

### Promotions and Loyalty

- The system shall validate voucher code eligibility against active status, publication status, expiry, minimum order amount, and remaining usage.
- The system shall permit loyalty-point redemption only when the user has enough points.
- The system shall reward points on booking confirmation, not at booking creation.
- The system shall refund or reverse loyalty effects when a confirmed or point-using booking is cancelled.

### Administration and Governance

- The system shall restrict access by role using shared authorization procedures.
- The system shall keep an activity trail for many administrative and booking-changing actions.
- The system shall expose aggregated statistics for management views.
- The system shall export booking records to CSV for users with appropriate administrative access.

## Non-Functional Requirements Observed or Implied

| Category        | Observed requirement                                                                                                          |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Security        | Role-based access control, server-side auth checks, input validation, restricted upload types, session-based authentication   |
| Data integrity  | Transactional booking workflow, advisory locking, foreign-key constraints, unique review-per-booking rule                     |
| Maintainability | Layered backend structure, typed interfaces, centralized permissions and settings                                             |
| Usability       | Public and admin UIs use direct feedback patterns such as toasts and progressive loading                                      |
| Performance     | Aggregations are database-backed; page hydration often uses `Promise.all`; paginated listings exist in selected admin modules |
| Configurability | Site information, booking policy, and loyalty thresholds/rates are settings-driven                                            |

## Business Rules Discovered in the Codebase

The following business rules are directly implemented or strongly derived from code:

1. A booking may not start in the past.
2. Booking duration must fall within configurable minimum and maximum hours.
3. Booking lead time may not exceed a configurable number of days.
4. Guest count must be a positive integer and may not exceed room capacity.
5. A booking overlaps if another active booking exists for the same room within the target interval.
6. Pending bookings may transition only to confirmed or cancelled.
7. Confirmed bookings may transition only to checked-in or cancelled.
8. A customer may cancel only their own pending booking through the member flow.
9. Loyalty points are consumed at booking creation but rewards are granted on confirmation.
10. Voucher discounting occurs before loyalty-point deduction when computing final cost.
11. One review is allowed per booking because the review table enforces uniqueness on `booking_id`.
12. Service image URLs accepted by the application must match a local upload path pattern.
13. Uploaded images are restricted to PNG, JPEG, WEBP, and GIF under a 5 MB size limit.
14. Branch management is reserved for administrators.
15. Public-facing site information is sourced from configurable settings rather than hardcoded page content alone.

## Business Value of the Implemented Design

The current implementation supports a business model in which:

- customers self-serve much of the reservation process;
- operational staff focus on confirmation and venue handling rather than manual data capture;
- promotions and loyalty schemes can be adjusted without structural code changes in many cases;
- management can observe historical and near-real-time operational indicators from one interface.

These characteristics make the system viable as a practical graduation project because the software models a real business domain with multiple stakeholders, configurable policies, and measurable operational outcomes.
