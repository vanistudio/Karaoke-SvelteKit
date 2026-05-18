# Dependencies

## Objective

This document explains the dependency stack used by the project and clarifies why each major dependency category exists.

- Evidence basis: direct
- Confidence level: 0.96

## Runtime Dependencies

| Dependency       | Role in the system                                         |
| ---------------- | ---------------------------------------------------------- |
| `@trpc/client`   | typed RPC client for frontend-to-backend communication     |
| `@trpc/server`   | typed RPC server/router foundation                         |
| `trpc-sveltekit` | SvelteKit integration for tRPC transport                   |
| `better-auth`    | authentication, session, and email verification management |
| `drizzle-orm`    | ORM and SQL-adjacent data access layer                     |
| `postgres`       | PostgreSQL driver                                          |
| `zod`            | runtime input validation at API boundaries                 |
| `resend`         | transactional email delivery                               |
| `daisyui`        | higher-level Tailwind UI component styling                 |

## Core Development Dependencies

| Dependency                                                          | Purpose                                                            |
| ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `@sveltejs/kit`                                                     | application framework                                              |
| `svelte`                                                            | UI framework runtime and compiler                                  |
| `vite`                                                              | dev server and build pipeline                                      |
| `typescript`                                                        | static typing                                                      |
| `tailwindcss`                                                       | utility-first styling                                              |
| `@tailwindcss/vite`                                                 | Tailwind-Vite integration                                          |
| `drizzle-kit`                                                       | migrations, schema management, studio, and push/generate workflows |
| `@better-auth/cli`                                                  | auth schema generation support                                     |
| `eslint`, `typescript-eslint`, `eslint-plugin-svelte`               | linting stack                                                      |
| `prettier`, `prettier-plugin-svelte`, `prettier-plugin-tailwindcss` | formatting stack                                                   |
| `vitest`                                                            | unit/integration test runner foundation                            |
| `@vitest/browser-playwright`, `playwright`, `vitest-browser-svelte` | browser-driven test infrastructure                                 |

## Dependency Rationale

### SvelteKit and Svelte

These dependencies provide:

- route-based page organization;
- SSR-capable request handling;
- server hooks;
- layout composition;
- frontend and backend colocation in one framework.

This is appropriate for a medium-sized transactional system that benefits from shared repository context.

### tRPC

tRPC is the most important integration dependency after SvelteKit because it:

- removes manual DTO duplication;
- keeps client and server types aligned;
- reduces impedance between admin/public pages and backend procedures.

### Better Auth

Better Auth reduces the amount of custom security-sensitive code required for:

- sign-up and sign-in;
- session management;
- email verification;
- SvelteKit cookie/session integration.

### Drizzle and PostgreSQL

This pair provides:

- explicit relational schema definitions;
- transaction support;
- SQL-like aggregation power;
- readable migration artifacts.

This is especially valuable in a thesis context because the database layer remains inspectable and explainable.

### Zod

Zod is central to boundary quality because it validates and constrains untrusted inputs before they enter domain logic.

### Resend

Resend is used narrowly and appropriately for transactional email. It is not a broad marketing automation dependency; it is a focused notification delivery tool.

## Observed Stack Characteristics

- The dependency set is modern but not excessive.
- The project prefers typed, integrated developer tooling over loosely typed, convention-heavy alternatives.
- The stack is suitable for academic explanation because relationships between layers remain explicit.
- There is no evidence of unnecessary backend framework sprawl or overlapping libraries that solve the same problem in multiple ways.

## Risks and Constraints

- The application depends on external email service availability for verification and notification workflows.
- The system’s production runtime characteristics are partly shaped by `adapter-auto`, which defers final deployment-specific behavior to the selected platform.
- tRPC is efficient for first-party development but does not automatically produce third-party REST documentation artifacts without extra work.

## Summary

The dependency selection is coherent, pragmatic, and aligned with the repository’s goals: strong typing, maintainable full-stack integration, transactional data handling, and moderate operational complexity.
