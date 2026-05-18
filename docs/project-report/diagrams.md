# Diagrams

## Objective

This document collects Mermaid diagrams that can be reused in a thesis, presentation, architecture review, or onboarding package.

- Evidence basis: direct and derived
- Confidence level: 0.90

## 1. System Architecture Diagram

```mermaid
flowchart LR
    Visitor[Public Visitor]
    Member[Member]
    Admin[Staff / Manager / Admin]
    Routes[SvelteKit Routes and Pages]
    Hook[hooks.server.ts]
    Auth[Better Auth]
    TRPC[tRPC App Router]
    Services[Controllers and Services]
    Repo[Repositories]
    DB[(PostgreSQL)]
    Mail[Resend]
    Upload[Local uploads directory]

    Visitor --> Routes
    Member --> Routes
    Admin --> Routes
    Routes --> Hook
    Hook --> Auth
    Routes --> TRPC
    Hook --> TRPC
    TRPC --> Services
    Services --> Repo
    Repo --> DB
    Services --> DB
    Services --> Mail
    Routes --> Upload
```

## 2. Component Diagram

```mermaid
flowchart TB
    UI[Public and Admin Svelte Components]
    Store[Toast and shared UI state]
    Client[tRPC Client]
    Router[tRPC Routers]
    Controller[Controllers]
    Domain[Services]
    Persist[Repositories]
    Schema[Drizzle Schemas]

    UI --> Store
    UI --> Client
    Client --> Router
    Router --> Controller
    Controller --> Domain
    Domain --> Persist
    Persist --> Schema
```

## 3. Authentication Flow Diagram

```mermaid
sequenceDiagram
    participant Browser
    participant AuthClient as Better Auth Client
    participant Hook as hooks.server.ts
    participant Auth as Better Auth Server
    participant Context as tRPC Context

    Browser->>AuthClient: signIn / signUp / signOut
    AuthClient->>Auth: auth request
    Auth-->>Browser: session cookies / auth result
    Browser->>Hook: next request
    Hook->>Auth: getSession(headers)
    Auth-->>Hook: session + user
    Hook->>Context: populate locals and tRPC context
```

## 4. Booking Request Flow Diagram

```mermaid
flowchart TB
    A[Booking Page] --> B[booking.checkAvailability]
    A --> C[booking.create]
    C --> D[Booking Router]
    D --> E[Booking Controller]
    E --> F[Booking Service]
    F --> G[Policy Validation]
    F --> H[Pricing Service]
    F --> I[Promotion Service]
    F --> J[Loyalty Service]
    F --> K[Booking Repository]
    K --> L[(PostgreSQL Transaction)]
    F --> M[Activity Service]
```

## 5. Booking Status Transition Diagram

```mermaid
stateDiagram-v2
    [*] --> pending
    pending --> confirmed
    pending --> cancelled
    confirmed --> checked_in
    confirmed --> cancelled
    checked_in --> [*]
    cancelled --> [*]
```

## 6. ER Diagram

```mermaid
erDiagram
    USER ||--o{ BOOKING : creates
    ROOM ||--o{ BOOKING : receives
    BRANCH ||--o{ ROOM : contains
    BOOKING ||--o{ BOOKING_SERVICE_ITEM : includes
    SERVICE ||--o{ BOOKING_SERVICE_ITEM : referenced_by
    USER ||--o{ POINT_HISTORY : owns
    BOOKING ||--o{ POINT_HISTORY : triggers
    USER ||--o{ REVIEW : writes
    ROOM ||--o{ REVIEW : receives
    BOOKING ||--|| REVIEW : reviewed_once
```

## 7. Dashboard Data Flow Diagram

```mermaid
flowchart LR
    DashboardPage[Admin Dashboard Page]
    Stats[dashboard.stats]
    Recent[dashboard.recentBookings]
    Revenue[dashboard.revenueChart]
    Occupancy[dashboard.occupancy]
    Heatmap[dashboard.heatmap]
    Rankings[dashboard.topRooms / topCustomers]
    DB[(PostgreSQL)]

    DashboardPage --> Stats
    DashboardPage --> Recent
    DashboardPage --> Revenue
    DashboardPage --> Occupancy
    DashboardPage --> Heatmap
    DashboardPage --> Rankings
    Stats --> DB
    Recent --> DB
    Revenue --> DB
    Occupancy --> DB
    Heatmap --> DB
    Rankings --> DB
```

## 8. Upload Flow Diagram

```mermaid
sequenceDiagram
    participant AdminUI
    participant UploadAPI as /api/upload
    participant FS as static/uploads

    AdminUI->>UploadAPI: multipart/form-data file
    UploadAPI->>UploadAPI: validate role, size, MIME type
    UploadAPI->>FS: write UUID-based filename
    FS-->>UploadAPI: saved file path
    UploadAPI-->>AdminUI: local image URL
```

## 9. Deployment Diagram

```mermaid
flowchart TB
    Browser --> App[SvelteKit Application Runtime]
    App --> DB[(PostgreSQL)]
    App --> Email[Resend]
    App --> Disk[Writable local disk for uploads]
```

## 10. Sequence Diagram for Review Submission

```mermaid
sequenceDiagram
    participant User
    participant Page as My Bookings Page
    participant API as review.create
    participant Service as ReviewService
    participant DB as PostgreSQL

    User->>Page: Submit rating and comment
    Page->>API: bookingId, roomId, rating, comment
    API->>Service: create(...)
    Service->>DB: verify booking ownership and status
    Service->>DB: verify no previous review
    Service->>DB: insert review
    DB-->>Service: stored review
    Service-->>API: success
    API-->>Page: success response
```
