# Security and Performance

## Objective

This document evaluates the security and performance mechanisms implemented in the codebase and identifies both current strengths and concrete improvement opportunities.

- Evidence basis: direct and derived
- Confidence level: 0.90

## Security Mechanisms

### Authentication

The system uses Better Auth with:

- email/password sign-up and sign-in;
- database-backed session persistence;
- SvelteKit cookie integration;
- email verification support.

The most important architectural strength is that authentication is resolved once in `hooks.server.ts` and then propagated to page loads and tRPC requests through shared request context.

### Authorization

Authorization is enforced primarily in server-side tRPC procedures rather than only in the frontend.

Implemented guards:

- `protectedProcedure`
- `staffProcedure`
- `managerProcedure`
- `adminProcedure`
- `rateLimitedProcedure`
- permission checks through a centralized permissions map

This is a strong design because it treats the client as untrusted for access control.

### Input Validation

The application validates many inputs with Zod at the tRPC boundary:

- numeric identifiers;
- date and time payloads;
- enums such as room type, promotion type, service category, and status;
- pagination bounds;
- string presence and positivity constraints.

Additional domain validation occurs inside services, especially in booking, promotion, and review logic.

### Booking Abuse Prevention

Booking creation uses `rateLimitedProcedure`, which applies:

- authenticated-user requirement;
- banned-user rejection;
- in-memory rate limiting at 5 operations per 60 seconds per user key.

This reduces rapid repeated booking attempts, although it is not a distributed rate-limit mechanism.

### File Upload Security

The upload endpoint implements several checks:

- role restriction to admin/manager;
- file existence check;
- non-empty file check;
- 5 MB size cap;
- MIME whitelist for PNG, JPEG, WEBP, and GIF;
- UUID-based server filename generation.

The service-management API then further validates that stored image URLs match a local upload path format.

### Review Integrity Controls

Review creation enforces:

- booking existence;
- ownership verification;
- room-to-booking match;
- `checked_in` status requirement;
- one-review-per-booking uniqueness.

This is a good example of business-rule security rather than only technical input validation.

## Security Risks and Limitations

### Observed Risks

- The rate limiter appears process-local; no evidence of distributed coordination exists for multi-instance deployment.
- Uploaded files are validated by MIME type and size, but no malware scanning or content-based verification is present.
- Error handling uses many plain `Error` messages, which may lead to inconsistent client-facing error semantics.
- There is no committed evidence of security headers, CSP policy, or WAF-layer controls in deployment configuration.
- No committed secret-management platform configuration is present beyond environment variables.

### Improvement Suggestions

- Replace in-memory rate limiting with a shared store for distributed deployments.
- Add content-sniffing or media reprocessing for uploaded images.
- Standardize domain errors into structured application error types.
- Add explicit deployment-level security headers and logging policies.
- Introduce audit views or alerts for repeated failed auth and booking attempts.

## Performance Mechanisms

### Parallel Data Fetching

Several pages use `Promise.all` to fetch independent datasets concurrently. This is visible on:

- dashboard page;
- rooms page;
- booking page;
- settings page;
- my-bookings page;
- reviews page;
- rooms-admin page.

This improves perceived response time for composite views.

### Database-Side Aggregation

Dashboard and reporting queries push aggregation into PostgreSQL through Drizzle queries:

- counts;
- sums;
- joins;
- grouped rankings;
- day-bounded occupancy calculations.

This avoids pulling large raw datasets into application memory for routine analytics.

### Pagination

Pagination is implemented for:

- user listing;
- activity log listing;
- review listing.

This helps control response volume in administrative interfaces.

### Index Support

The schema includes indexes on:

- booking availability and user-history access paths;
- point-history lookup paths;
- session/account/verification lookup paths;
- review uniqueness.

This reflects awareness of the most important relational access patterns.

## Performance Constraints

### Dynamic Pricing Cost Calculation

`PricingService.calculateRoomCost(...)` iterates minute by minute across the selected time range and applies the maximum active multiplier for each minute. This is accurate and flexible, but it can become expensive if:

- booking windows grow longer;
- pricing-rule count increases significantly;
- traffic volume becomes much higher.

### Iterative Room Availability Search

Available room discovery currently checks room candidates iteratively. This is easy to reason about but may not scale as efficiently as a more set-oriented SQL approach.

### On-Demand Analytics

Dashboard metrics and charts are computed on demand from transactional tables. This is acceptable for a small-to-medium system, but larger datasets may eventually require:

- cached summaries;
- precomputed reporting tables;
- background aggregation jobs.

### Local File Storage

Uploaded assets are stored on local disk under `static/uploads`. This simplifies implementation but can complicate scaling and multi-instance deployments.

## Caching, Lazy Loading, and Database Optimization

### What Exists

- parallel frontend fetches;
- database-side aggregation;
- pagination for selected admin lists;
- targeted indexes;
- browser-side singleton reuse of the tRPC client.

### What Is Not Evidenced

- no committed Redis or distributed cache;
- no materialized views;
- no CDN-backed upload pipeline;
- no query result cache layer;
- no background job queue for analytics or emails.

## Overall Assessment

The system demonstrates a good baseline security and performance posture for a graduation-scale transactional application. The implementation is strongest where business correctness matters most: authorization, transactional booking consistency, and validation. The main weaknesses are operational rather than architectural: limited distributed safeguards, limited observability, and no advanced optimization layer for scale.
