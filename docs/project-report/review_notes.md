# Review Notes

## Objective

This document records uncertainties, mismatches, stale narrative claims, evidence gaps, and technical debt discovered during repository analysis.

- Evidence basis: direct and derived
- Confidence level: 0.95

## 1. Documentation Drift Between Narrative Files and Code

### README and SRS Contain Partially Stale Statements

The repository contains narrative documents that describe features or status labels not fully aligned with the current implementation surface.

Examples:

- the current codebase includes active modules for promotions, loyalty, reviews, branches, pricing, settings, activity logs, calendar views, upload, and booking export;
- some older narrative text frames several of these areas as not yet built or only planned;
- some business ideas described in older docs, such as payment gateway support, are not evidenced by current code.

Implication:

- the source code and configuration must be treated as authoritative over older prose documents.

## 2. Testing Depth Is Limited

The repository contains testing infrastructure but only minimal committed example specs. There is no meaningful committed business-domain test suite for:

- booking logic;
- loyalty logic;
- promotions;
- admin flows;
- export;
- upload;
- review rules.

Implication:

- the project is functionally rich but under-tested in automated form.

## 3. Deployment and Operations Evidence Is Sparse

No committed evidence was found for:

- CI/CD workflows;
- containerization;
- infrastructure-as-code;
- centralized monitoring;
- backup automation;
- disaster recovery procedures.

Implication:

- deployment documentation must remain conservative and clearly state what is not evidenced.

## 4. Rate Limiting Is Likely Process-Local

The booking creation guard uses a rate-limit helper, but no evidence suggests a shared distributed backend such as Redis.

Implication:

- rate limiting may not remain consistent across multiple application instances.

## 5. Upload Storage Is Local Disk-Based

Uploaded files are saved into `static/uploads`.

Implication:

- this is acceptable for a small deployment but not ideal for horizontally scaled or ephemeral runtime environments.

## 6. Analytics Are Computed On Demand

Dashboard metrics, rankings, and heatmap data are generated through live database queries against transactional tables.

Implication:

- this is practical now, but may become a performance bottleneck as historical data volume grows.

## 7. Error Semantics Are Not Fully Standardized

The repository uses a mix of `TRPCError` and plain `Error`.

Implication:

- user-facing error consistency may vary;
- external documentation cannot assume a single normalized error envelope for all business failures.

## 8. Relations Helper Coverage Is Partial

`relations.ts` defines several important relations, but not every foreign-key relationship has a mirrored Drizzle relation helper.

Implication:

- conceptual and physical database relationships are still clear from foreign keys;
- the schema remains understandable, but relation helper completeness could be improved.

## 9. Contact Submission Is Not a Persisted Backend Workflow

The public contact page consumes public settings, but no server-side persistence or contact-submission workflow is evidenced.

Implication:

- the thesis should not describe contact handling as a completed CRM-style backend module.

## 10. Payment Gateway Support Is Not Implemented in Current Code

Some narrative materials discuss online payments, but no committed payment gateway integration was found in routes, services, dependencies, or environment variables.

Implication:

- payment should be documented as out of scope or future work, not as an implemented feature.

## 11. Recommendation Logic Appears Lightweight

Recommendation features exist, but no advanced ranking infrastructure, model training pipeline, or recommendation datastore is evidenced.

Implication:

- recommendation should be described as rule/data-driven helper functionality rather than AI-based personalization.

## 12. Operational Logging Exists, but Observability Is Minimal

The system writes activity-log records for business actions and uses `console.error(...)` in selected failure paths, but no centralized observability stack is committed.

Implication:

- auditability exists at the business level;
- production-grade monitoring is not evidenced.

## 13. Technical Debt Priorities

Highest-value follow-up work would likely be:

1. add business-domain automated tests;
2. standardize domain error handling;
3. improve scalability of upload storage and rate limiting;
4. document and automate deployment workflows;
5. optimize analytics and availability search for larger data volumes.

## Summary

The repository is technically strong in application structure and business logic, but weaker in automated verification and operational maturity. These gaps do not invalidate the project as a graduation case study, but they should be documented transparently in the final report.
