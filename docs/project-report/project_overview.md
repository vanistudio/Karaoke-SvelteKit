# Project Overview

## Objective

This document introduces Karaoke-SvelteKit as a graduation-project-ready software system and explains its purpose, scope, user groups, principal features, and technology choices from both academic and engineering perspectives.

- Evidence basis: direct and derived
- Confidence level: 0.93

## Project Name and Purpose

Karaoke-SvelteKit is a karaoke room booking and venue management application. Its purpose is to digitalize the customer reservation process and the operational workflow of a karaoke business by combining a public-facing booking interface with an authenticated member area and an administrative back office.

From a business perspective, the system addresses the need to move room discovery, booking submission, loyalty handling, promotions, and selected customer communications into an online workflow. From an engineering perspective, the system consolidates these processes into a single web application with a typed frontend-backend boundary.

## Problem the System Solves

Traditional karaoke venue operation often depends on fragmented communication channels such as phone calls, manual scheduling, and ad hoc staff coordination. This introduces several recurring problems:

- customers cannot reliably view room availability before contacting staff;
- overlapping reservations may occur without a lock-based or transaction-backed reservation flow;
- promotions, loyalty points, and pricing rules are difficult to apply consistently when managed manually;
- management lacks consolidated visibility into occupancy, revenue, active users, and recent booking activity;
- administrative changes to rooms, services, settings, and users become difficult to audit without a structured system.

The application solves these issues by centralizing discovery, booking, configuration, and reporting in one software platform.

## Target Users

The implemented codebase supports the following principal user roles:

| User group         | Description                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Public visitors    | Browse rooms, services, promotions, contact information, and booking options without authentication                    |
| Registered members | Sign up, log in, verify email, create bookings, review personal bookings, view loyalty information, and submit reviews |
| Staff              | Access selected back-office tools such as booking lists and the schedule calendar                                      |
| Managers           | Access operational reporting and manage rooms, services, and promotions                                                |
| Administrators     | Hold the broadest control, including settings, branches, user administration, exports, and destructive operations      |

## Main Features

The features implemented in the repository include:

- public room listing and room availability search;
- room booking with guest count, optional services, voucher validation, and loyalty-point redemption;
- booking policy enforcement, overlap checking, and transaction-backed booking creation;
- user registration, login, logout, session persistence, profile management, password change, and email verification resend;
- member booking history, booking cancellation for pending bookings, and post-booking review submission;
- public promotions listing and service listing;
- admin dashboard metrics including revenue charting, occupancy, heatmap, top rooms, and top customers;
- admin booking status management and check-in flow;
- room, service, pricing rule, promotion, branch, settings, review, activity-log, and user-management interfaces;
- CSV export of booking data and image upload for service assets.

## Scope of the Project

### In Scope

- Web-based booking experience for karaoke rooms.
- Role-based operational administration.
- Pricing, promotion, and loyalty support.
- Booking analytics and operational overview.
- Database-backed persistence for the main business entities.
- Verification-email delivery through an external email provider.

### Out of Scope or Not Fully Evidenced

- A committed payment gateway integration is not present in the current codebase.
- Real-time synchronization through websockets or push channels is not evidenced.
- A committed CI/CD pipeline is not present.
- Monitoring, backup automation, and disaster-recovery automation are not present as committed infrastructure artifacts.
- Contact form persistence is not implemented on the server side; the public contact page uses public settings but does not submit to a backend workflow.

## Technologies Used

| Layer              | Technology                                           |
| ------------------ | ---------------------------------------------------- |
| Frontend framework | SvelteKit with Svelte 5 runes                        |
| Styling            | Tailwind CSS v4 and DaisyUI                          |
| API boundary       | tRPC                                                 |
| Validation         | Zod                                                  |
| Authentication     | Better Auth                                          |
| Database           | PostgreSQL                                           |
| ORM / schema layer | Drizzle ORM and Drizzle Kit                          |
| Email delivery     | Resend                                               |
| Build tooling      | Vite                                                 |
| Language           | TypeScript                                           |
| Testing toolchain  | Vitest and Playwright browser provider configuration |

## Why These Technologies Were Chosen

The repository structure suggests a deliberate selection of technologies that balance developer productivity, type safety, and implementation clarity.

- SvelteKit provides routing, server hooks, and SSR-capable integration in one framework, which suits a system that combines public pages, authenticated user flows, and admin views.
- Svelte 5 runes enable local state modeling without heavy client-side architectural overhead.
- tRPC removes manual API contract duplication by sharing types between client and server, which is useful for a medium-sized internal business system where API consumers are primarily first-party pages.
- Zod provides input validation at the router boundary, ensuring untrusted inputs are normalized before entering the service layer.
- Better Auth provides session management, email/password authentication, and email verification support with SvelteKit integration.
- Drizzle ORM offers explicit schema definitions and SQL-adjacent data access patterns, which are useful for academic explanation because the data model remains readable and close to the underlying relational database.
- PostgreSQL is appropriate for transactional booking workflows, joins, indexes, and aggregation-heavy admin reporting.
- Resend gives a simple transactional email integration for account verification and booking status notifications.

## Academic Significance

For thesis purposes, Karaoke-SvelteKit is a strong case study because it combines:

- customer-facing digital transformation;
- transaction-sensitive scheduling logic;
- role-based access control;
- configurable business rules;
- relational data modeling;
- typed full-stack integration;
- operational reporting and administrative workflows.

This makes the project suitable for chapters on system analysis, architecture design, database design, business process mapping, implementation strategy, testing, and future scalability discussion.
