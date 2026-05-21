# Testing and Evaluation

## Objective

This document distinguishes the repository’s current testing reality from the recommended validation strategy for a graduation project, and it proposes evaluation criteria suitable for academic assessment.

- Evidence basis: direct and derived
- Confidence level: 0.88

## Existing Testing Strategy

### Directly Observed

The repository includes:

- a `test` script and `test:unit` script in `package.json`;
- Vitest configuration inside `vite.config.ts`;
- browser test infrastructure using Playwright as a Vitest provider;
- server-side and client-side test project configuration;
- two committed example-level spec files under `src/lib/vitest-examples`.

### Current Practical Assessment

The committed tests do not currently provide meaningful business coverage for the implemented booking, admin, auth, loyalty, promotion, or export workflows. Therefore, the project has testing infrastructure but not a mature application test suite.

## Recommended Test Strategy

### Unit Tests

Recommended targets:

- `BookingService.normalizeTimeRange`
- booking policy validation
- pricing-rule multiplier calculation
- promotion discount calculation
- loyalty tier and point calculation
- review eligibility rules
- permission helpers

### Integration Tests

Recommended targets:

- booking creation transaction behavior;
- overlap prevention with concurrent attempts;
- promotion reserve/release lifecycle;
- loyalty reward, refund, and reversal flows;
- room deletion protection when active bookings exist;
- settings update and public settings projection;
- CSV export access control and content shape.

### End-to-End Tests

Recommended targets:

- registration to email-verification UI flow;
- login and route guard behavior;
- public room search to booking submission;
- member booking cancellation;
- admin booking confirmation and check-in;
- service image upload from admin UI;
- admin dashboard rendering for seeded data.

## Suggested Test Cases

| Area          | Test case                                             |
| ------------- | ----------------------------------------------------- |
| Booking       | reject past bookings                                  |
| Booking       | allow cross-midnight bookings when valid              |
| Booking       | reject guest count above room capacity                |
| Booking       | reject overlapping reservations                       |
| Booking       | compute final cost with services, voucher, and points |
| Promotions    | reject expired or exhausted vouchers                  |
| Loyalty       | grant points on confirmation only                     |
| Loyalty       | refund used points on cancellation                    |
| Reviews       | reject review before `checked_in`                     |
| Authorization | prevent non-admin role changes                        |
| Upload        | reject unsupported file type                          |
| Export        | reject unauthorized CSV export requests               |

## Functional Testing Checklist

- user can register successfully;
- verification email resend can be triggered;
- user can log in and log out;
- public settings appear on public pages;
- room search returns candidate rooms;
- booking form validates and creates bookings;
- pending booking can be cancelled by its owner;
- checked-in booking can be reviewed exactly once;
- admin can manage rooms, services, promotions, pricing, settings, branches, and users;
- dashboard cards and charts load successfully;
- booking export downloads correctly.

## Security Testing Checklist

- verify unauthorized users cannot access admin pages or admin procedures;
- verify banned users are blocked by protected procedures;
- verify regular users cannot read other users’ bookings through `booking.getById`;
- verify only admin/manager can upload files;
- verify only admin/manager can export bookings;
- verify review creation rejects ownership mismatch and double submission;
- verify rate limiting triggers on repeated booking attempts.

## Performance Testing Checklist

- measure response time for room search with growing room counts;
- measure booking creation latency with multiple pricing rules and services;
- measure dashboard load time with realistic booking volume;
- measure CSV export latency and memory usage for large datasets;
- observe page readiness time where `Promise.all` is used for initial hydration.

## Evaluation Criteria for the Graduation Project

### Functional Correctness

- core use cases execute successfully;
- business rules are enforced consistently;
- administrative operations reflect persisted changes.

### Reliability

- booking overlap prevention works under concurrent attempts;
- state transitions do not violate lifecycle rules;
- partial side-effect failure does not corrupt transactional data.

### Security

- unauthorized access is blocked;
- sensitive actions are role-restricted;
- user ownership is respected for private records.

### Maintainability

- architecture remains layered and understandable;
- configuration is separated from volatile policy values;
- domain logic is concentrated in services rather than scattered through UI code.

### Usability

- public flows are understandable;
- admin workflows provide adequate operational visibility;
- user feedback is surfaced through toasts and route transitions.

## Recommended Evaluation Method for Thesis Defense

1. Demonstrate public room search.
2. Demonstrate account registration and verification flow.
3. Demonstrate booking creation with pricing and voucher logic.
4. Demonstrate member booking management and review submission.
5. Demonstrate admin dashboard, booking approval, and export.
6. Present diagrams and schema documentation from this bundle.
7. Discuss testing gaps honestly and propose follow-up improvements.

## Summary

The repository is testable and already contains testing infrastructure, but the current committed business test depth is limited. For academic evaluation, this should be treated as a clear improvement area rather than obscured or overstated.
