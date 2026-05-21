# Data Models

## Objective

This document presents the conceptual data model of the application. It explains what each major entity represents in business terms and how entities collaborate to support the implemented workflows.

- Evidence basis: direct and derived
- Confidence level: 0.94

## Conceptual Domain Areas

The repository models six main conceptual areas:

1. identity and access management;
2. venue inventory;
3. booking transactions;
4. commercial policy and incentives;
5. administrative governance;
6. customer feedback and analytics.

## Core Conceptual Entities

### User

The `user` entity represents every authenticated actor in the system, including customers and administrative staff.

Important conceptual attributes:

- unique identity;
- display name and email;
- email-verification state;
- role and ban status;
- loyalty points, cumulative spending, and tier.

Business role:

- anchors authentication, ownership, bookings, activity, and loyalty state.

### Session, Account, and Verification

These entities support identity lifecycle rather than business commerce:

- `session` stores active authenticated sessions;
- `account` stores auth-provider account linkage;
- `verification` stores data required for account verification workflows.

Business role:

- establish trust and persistent access to the booking platform.

### Room

The `room` entity represents a bookable karaoke room.

Important conceptual attributes:

- room name;
- capacity;
- category (`standard`, `vip`, `super_vip`);
- base hourly price;
- optional branch assignment.

Business role:

- primary inventory asset sold by the platform.

### Branch

The `branch` entity represents a venue location or operating branch.

Business role:

- groups rooms by venue location while allowing a room to remain unassigned when needed.

### Booking

The `booking` entity is the central business transaction.

Important conceptual attributes:

- booking owner;
- room reference;
- start and end times;
- optional guest count;
- workflow status;
- final cost;
- voucher and loyalty usage;
- creation timestamp.

Business role:

- records the customer’s reservation agreement with the venue.

### Booking Service Item

This join-like entity captures service add-ons selected during booking.

Important conceptual attributes:

- booking reference;
- service reference;
- quantity;
- price at booking time.

Business role:

- preserves a historical service snapshot independent of later service-price changes.

### Service

The `service` entity models add-on products such as food, drinks, decorations, or other extras.

Business role:

- supports upselling and operational packaging around room reservations.

### Promotion

The `promotion` entity models voucher-based commercial incentives.

Important conceptual attributes:

- code;
- discount type;
- discount value;
- usage limits;
- expiry;
- public visibility flag;
- active status.

Business role:

- supports marketing, seasonal offers, and direct discounting during booking.

### Pricing Rule

The `pricing_rule` entity models pricing adjustments beyond the base hourly rate.

Two conceptual types are present:

- holiday-specific multipliers;
- time-block multipliers, optionally constrained by day of week.

Business role:

- allows flexible revenue strategy without changing room base prices.

### Point History

The `point_history` entity records loyalty mutations over time.

Business role:

- provides an auditable history of rewards, redemptions, refunds, and reward reversals.

### Review

The `review` entity captures post-visit customer feedback.

Business role:

- supports quality feedback and public/social proof for rooms.

### Setting

The `setting` entity stores mutable configuration values.

Business role:

- acts as a low-volume business configuration store for public site data, booking policy, and loyalty policy.

### Activity Log

The `activity_log` entity records significant administrative and operational actions.

Business role:

- supports accountability and lightweight auditing.

### Task

The `task` entity is present in the schema but is not deeply integrated into the observable route and workflow surface.

Business role:

- unclear from the currently exposed application surface; likely auxiliary or experimental.

## Key Conceptual Relationships

| Relationship                    | Meaning                                                      |
| ------------------------------- | ------------------------------------------------------------ |
| User -> Booking                 | a user creates many bookings                                 |
| Room -> Booking                 | a room receives many bookings                                |
| Booking -> Booking Service Item | a booking may include multiple service items                 |
| Service -> Booking Service Item | a service may appear in many booking snapshots               |
| User -> Point History           | a user accumulates many loyalty events                       |
| Booking -> Point History        | a booking may trigger multiple loyalty events                |
| User -> Review                  | a user may submit reviews                                    |
| Booking -> Review               | each booking supports at most one review                     |
| Room -> Review                  | reviews evaluate rooms                                       |
| Branch -> Room                  | a branch can contain many rooms; room assignment is optional |

## Conceptual Model Highlights

### Booking as the Center of the Domain

Most business processes converge on `booking`. It is connected to:

- customer identity;
- room inventory;
- optional services;
- promotions;
- loyalty history;
- reviews;
- analytics;
- administrative activity.

### Settings as Lightweight Business Configuration

The design intentionally avoids hardcoding all policy values in code. Instead, configurable behavior is projected through `SettingService`, making the `setting` entity conceptually important despite its small structure.

### Historical Integrity Through Snapshot Fields

`booking_service_item.price_at_booking` preserves historical commercial accuracy. This is a strong data-modeling decision because service prices may change after a booking is created.

## Data Model Evaluation

The conceptual data model is appropriate for a transactional reservation platform because it balances:

- clear identity ownership;
- inventory and time-slot modeling;
- configurable commerce logic;
- customer retention mechanisms;
- auditability;
- lightweight reporting support.

Its strongest aspect is the way booking data coordinates multiple supporting concerns without losing relational clarity.
