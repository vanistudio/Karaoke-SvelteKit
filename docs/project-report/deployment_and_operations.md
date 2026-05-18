# Deployment and Operations

## Objective

This document summarizes the deployment-related and operational characteristics that can be evidenced from the repository.

- Evidence basis: direct and derived
- Confidence level: 0.80

## Deployment Architecture

The repository is configured as a SvelteKit application using `@sveltejs/adapter-auto`. This means the exact deployment target is not hard-coded in the repository and is expected to be selected or resolved by the final hosting platform.

### Inferred Deployment Shape

The most likely runtime architecture is:

- one web application runtime serving frontend pages and backend handlers;
- one PostgreSQL database;
- one external Resend email integration;
- local filesystem storage for uploaded images unless replaced in deployment.

## Hosting Environment

### Directly Evidenced

- Node-based application runtime
- Vite build toolchain
- SvelteKit adapter-auto
- PostgreSQL database dependency
- environment-variable-driven configuration

### Not Directly Evidenced

- exact hosting provider;
- containerization strategy;
- reverse proxy choice;
- CDN choice;
- SSL termination location;
- production scaling topology.

## Local Run and Build Workflow

Observed scripts:

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run check`
- `npm run test`
- `npm run db:push`
- `npm run db:seed`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:studio`

These scripts indicate a standard local workflow in which developers:

1. install dependencies;
2. configure environment variables;
3. connect to PostgreSQL;
4. run schema/migration commands as needed;
5. start the development server.

## Environment Variables

The `.env.example` file documents the required variables:

| Variable            | Purpose                            |
| ------------------- | ---------------------------------- |
| `APP_DATABASE_URI`  | PostgreSQL connection string       |
| `APP_ORIGIN_URL`    | application base URL               |
| `APP_BETTER_SECRET` | Better Auth secret                 |
| `RESEND_API_KEY`    | email delivery credential          |
| `RESEND_FROM_EMAIL` | transactional email sender address |
| `RESEND_FROM_NAME`  | transactional email sender name    |
| `RESEND_REPLY_TO`   | optional reply-to address          |

## Infrastructure Setup

### Database

- PostgreSQL is mandatory.
- Drizzle initializes the database client during server startup.
- the application throws early if `APP_DATABASE_URI` is not defined.

### Email

- Resend credentials are mandatory for email features.
- missing email configuration triggers explicit runtime errors when email sending is attempted.

### File Storage

- uploaded files are stored in `static/uploads`.
- this implies the current design expects writable local disk access in the deployment environment.

## CI/CD Workflows

No committed CI/CD workflow definitions were found.

Implication:

- automated build, test, release, and deployment processes are not evidenced by the repository;
- if such processes exist externally, they are outside the documented source of truth.

## Monitoring and Logging

### Observed Logging

- server-side `console.error(...)` is used for upload failures and booking email side-effect failure.

### Not Observed

- centralized structured logging;
- metrics collection;
- uptime monitoring configuration;
- tracing;
- alerting policies.

## Backup and Recovery Strategies

No committed backup or recovery automation artifacts were found.

Reasonable documented conclusion:

- database backup strategy is unknown from repository evidence;
- file upload backup strategy is unknown from repository evidence;
- recovery time objectives and recovery point objectives are not documented in code or configuration.

## Scalability Considerations

### Current Scalability Strengths

- clear application boundaries;
- PostgreSQL-backed transactional consistency;
- limited but useful indexing;
- route and service modularity.

### Current Scalability Constraints

- process-local rate limiting;
- local filesystem upload storage;
- on-demand analytics over transactional tables;
- no distributed cache;
- no queue for email or long-running side effects.

## Suggested Operational Improvements

- adopt explicit deployment adapter and hosting documentation;
- add CI workflow for build, type-check, and tests;
- externalize uploads to object storage;
- introduce structured logging and centralized monitoring;
- document backup and restore procedures;
- use a shared rate-limit backend for multi-instance deployments.

## Summary

The codebase is deployment-ready at a small-project level but not operationally mature in a fully documented production-engineering sense. This is acceptable for a graduation project, provided the thesis clearly distinguishes implemented runtime behavior from not-yet-evidenced operational automation.
