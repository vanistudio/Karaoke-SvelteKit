# Karaoke-SvelteKit

Karaoke-SvelteKit là ứng dụng đặt phòng karaoke full-stack, kết hợp public storefront, member flows có xác thực, và admin back office trong cùng một SvelteKit app. UI routing nằm ở SvelteKit, còn booking, loyalty, analytics, email verification, phân quyền, và quản trị vận hành đi qua tRPC.

## Tổng quan

- Public users có thể xem phòng, dịch vụ, khuyến mãi và tạo booking.
- Registered members có thể đăng ký, đăng nhập, verify email, xem lịch sử booking và gửi review.
- Staff, manager, admin có các quyền khác nhau cho dashboard, booking management, room/service/promotion/pricing/settings management, branch management, user administration, activity log, calendar, và CSV export.
- Booking flow xử lý nhiều rule nghiệp vụ như cross-midnight normalization, overlap prevention, policy validation, dynamic pricing, voucher validation, loyalty redemption, activity logging, và email side effects sau transaction.

## Tech Stack

| Layer                  | Công nghệ                   |
| ---------------------- | --------------------------- |
| Frontend               | SvelteKit, Svelte 5         |
| Styling                | Tailwind CSS v4, DaisyUI    |
| API boundary           | tRPC                        |
| Validation             | Zod                         |
| Authentication         | Better Auth                 |
| Database               | PostgreSQL                  |
| ORM                    | Drizzle ORM, Drizzle Kit    |
| Email                  | Resend                      |
| Tooling                | Vite, TypeScript            |
| Testing infrastructure | Vitest, Playwright provider |

## Kiến trúc

Luồng request chính là `hooks.server.ts` -> `event.locals` -> `createContext` -> SvelteKit loads hoặc tRPC procedures. Better Auth resolve session một lần ở hook, sau đó page loads và tRPC cùng dùng chung `user` và `session`.

Phần backend đi theo layering:

`router -> controller -> service -> repository -> db`

Các domain quan trọng như booking, loyalty, pricing, promotion, review, dashboard, branch, setting, và user đều bám theo flow này. Authorization được tập trung ở reusable procedures như `publicProcedure`, `protectedProcedure`, `staffProcedure`, `managerProcedure`, `adminProcedure`, và `rateLimitedProcedure`.

## Cấu trúc thư mục

```text
src/
  routes/                 SvelteKit pages, layouts, HTTP endpoints
  lib/components/         Shared UI components
  lib/stores/             Shared client stores
  lib/trpc/               Browser tRPC client wrapper
  lib/server/
    routes/               tRPC routers
    controllers/          Thin orchestration layer
    services/             Business logic
    repositories/         Drizzle-backed data access
    db/schema/            Database schema and relations
    trpc/                 Context, auth guards, rate limiting
drizzle/                  Generated migrations
docs/project-report/      Academic and technical report bundle
static/                   Static assets
```

## Tính năng chính

- Public room browsing và service/promotion listing
- Booking tạo từ web với time range, guest count, optional services, voucher, loyalty points
- Booking history, pending booking cancellation, review submission
- Email verification qua Resend
- Dashboard analytics: revenue, occupancy, heatmap, top rooms, top customers
- Admin CRUD cho rooms, services, promotions, pricing, settings, branches, users, reviews
- Calendar view và activity logging
- File upload cho service assets
- `GET /api/export/bookings` để export CSV

## Trạng thái triển khai hiện tại

Các điểm đã được code evidencing:

- Payment gateway integration chưa có trong codebase hiện tại
- Contact page đọc public settings thật nhưng chưa persist form submit ở backend
- CI/CD, monitoring, backup automation, distributed cache, queue system chưa có artifact được commit
- Upload hiện dùng `static/uploads`, tức là deployment cần writable local disk nếu giữ nguyên thiết kế này

## Yêu cầu môi trường

Ứng dụng hiện dùng các biến môi trường sau trong `.env`:

```env
APP_DATABASE_URI="postgres://user:password@host:port/db-name"
APP_ORIGIN_URL=""
APP_BETTER_SECRET=""
RESEND_API_KEY=""
RESEND_FROM_EMAIL=""
RESEND_FROM_NAME="KaraSystem"
RESEND_REPLY_TO=""
```

`APP_DATABASE_URI` là bắt buộc ngay từ startup. Email-related variables là bắt buộc cho các flow gửi mail như verification và booking notification.

## Chạy local

```bash
npm install
cp .env.example .env
```

Điền giá trị phù hợp vào `.env`, chuẩn bị PostgreSQL, sau đó chạy một trong các flow schema sau:

```bash
npm run db:push
# hoặc
npm run db:migrate
```

Nếu cần seed dữ liệu:

```bash
npm run db:seed
```

Khởi động development server:

```bash
npm run dev
```

## Scripts hữu ích

```bash
npm run dev
npm run build
npm run preview
npm run check
npm run test
npm run db:push
npm run db:migrate
npm run db:generate
npm run db:seed
npm run db:studio
npm run auth:schema
```

## Tài liệu tham khảo

Thư mục [`docs/project-report`](./docs/project-report) là bộ tài liệu học thuật và kỹ thuật đầy đủ cho dự án. Nên đọc theo thứ tự sau:

1. [`project_overview.md`](./docs/project-report/project_overview.md)
2. [`architecture.md`](./docs/project-report/architecture.md)
3. [`business_analysis.md`](./docs/project-report/business_analysis.md)
4. [`system_analysis_and_design.md`](./docs/project-report/system_analysis_and_design.md)
5. [`developer_guide.md`](./docs/project-report/developer_guide.md)

Các tài liệu còn lại trong bundle:

- [`index.md`](./docs/project-report/index.md): mục lục và phạm vi tài liệu
- [`components.md`](./docs/project-report/components.md): breakdown frontend, backend, shared modules
- [`interfaces.md`](./docs/project-report/interfaces.md): internal boundaries và integration surfaces
- [`api_documentation.md`](./docs/project-report/api_documentation.md): tRPC procedures và HTTP endpoints
- [`data_models.md`](./docs/project-report/data_models.md): domain entities
- [`database_design.md`](./docs/project-report/database_design.md): physical schema design
- [`workflows.md`](./docs/project-report/workflows.md): technical execution flows
- [`user_workflows.md`](./docs/project-report/user_workflows.md): end-user journeys
- [`security_and_performance.md`](./docs/project-report/security_and_performance.md): security/performance review
- [`testing_and_evaluation.md`](./docs/project-report/testing_and_evaluation.md): test reality và evaluation guidance
- [`deployment_and_operations.md`](./docs/project-report/deployment_and_operations.md): deployment assumptions và operational constraints
- [`feature_breakdown.md`](./docs/project-report/feature_breakdown.md): feature-by-feature analysis
- [`dependencies.md`](./docs/project-report/dependencies.md): dependency rationale
- [`diagrams.md`](./docs/project-report/diagrams.md): catalog Mermaid diagrams
- [`codebase_info.md`](./docs/project-report/codebase_info.md): repository inventory
- [`review_notes.md`](./docs/project-report/review_notes.md): gaps, inconsistencies, technical debt
- [`thesis_report_outline.md`](./docs/project-report/thesis_report_outline.md): gợi ý cấu trúc báo cáo tốt nghiệp

## Ghi chú cho contributor

- Đây là typed full-stack app, nên thay đổi ở router/service thường có ảnh hưởng trực tiếp đến UI gọi qua `trpc()`.
- Booking là domain nhạy cảm nhất; khi sửa cần kiểm tra side effects sang pricing, promotion, loyalty, activity log, và email notification.
- Đừng dựa hoàn toàn vào tài liệu cũ như `SRS.md`; ưu tiên code hiện tại và bundle trong `docs/project-report`.
