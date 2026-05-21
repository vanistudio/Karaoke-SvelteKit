# KaraSystem - Software Requirements Specification (SRS)

**Phiên bản:** 2.0  
**Ngày cập nhật:** 2026-05-19  
**Hệ thống:** Karaoke-SvelteKit - Đặt Phòng Karaoke Trực Tuyến

---

## 1. Tổng Quan Hệ Thống

KaraSystem là nền tảng đặt phòng karaoke full-stack, kết hợp:

- **Public storefront:** xem phòng, dịch vụ, khuyến mãi, thông tin liên hệ
- **Member flows:** đăng ký, đăng nhập, verify email, đặt phòng, xem lịch sử, tích điểm, review
- **Admin back office:** quản lý vận hành, báo cáo, cấu hình, người dùng, chi nhánh, lịch hoạt động

Hệ thống được triển khai như một ứng dụng web thống nhất, dùng SvelteKit cho routing/UI và tRPC làm application boundary giữa frontend với backend logic.

---

## 2. Tech Stack

| Layer                  | Technology                               |
| ---------------------- | ---------------------------------------- |
| Framework              | SvelteKit (Svelte 5)                     |
| Styling                | Tailwind CSS v4 + DaisyUI                |
| Icons                  | Iconify                                  |
| API                    | tRPC                                     |
| Validation             | Zod                                      |
| Database               | PostgreSQL                               |
| ORM                    | Drizzle ORM + Drizzle Kit                |
| Auth                   | Better Auth                              |
| Email                  | Resend                                   |
| Notifications          | Custom toast store (`$lib/stores/toast`) |
| Tooling                | Vite, TypeScript                         |
| Testing infrastructure | Vitest + Playwright provider             |

---

## 3. Kiến Trúc Backend

```text
src/lib/server/
  db/                  Schema + DB connection
    schema/            Drizzle tables and relations
  repositories/        Reusable data-access boundaries
  services/            Business logic
  controllers/         Thin orchestration layer
  routes/              tRPC routers + Zod validation
  trpc/                Context, procedures, rate limiting
```

Luồng request chính:

`hooks.server.ts -> event.locals -> createContext -> SvelteKit loads / tRPC procedures`

Pattern chi phối phần lớn domain mutable là:

`router -> controller -> service -> repository -> db`

Ghi chú:

- Pattern trên là chủ đạo, nhưng không bắt buộc 100% cho mọi module.
- Một số router đơn giản như `branch.router.ts` có thao tác Drizzle trực tiếp.
- Authorization được enforce ở tRPC procedures, không coi UI guards là source of truth.

---

## 4. Yêu Cầu Chức Năng (Functional Requirements)

### 4.1. Module Xác Thực & Tài Khoản (AUTH)

| ID      | Chức năng         | Trạng thái             | Mô tả                                                  |
| ------- | ----------------- | ---------------------- | ------------------------------------------------------ |
| AUTH-01 | Đăng ký           | Đã triển khai          | Email + password qua Better Auth                       |
| AUTH-02 | Đăng nhập         | Đã triển khai          | Session cookie được resolve ở server hook              |
| AUTH-03 | Đăng xuất         | Đã triển khai          | Sign out từ Better Auth client                         |
| AUTH-04 | Session hydration | Đã triển khai          | Shared session cho load functions và tRPC              |
| AUTH-05 | Route guard       | Đã triển khai          | Redirect server-side cho khu vực bảo vệ                |
| AUTH-06 | RBAC UI           | Đã triển khai          | UI hiển thị theo role nhưng không thay thế server auth |
| AUTH-07 | Quản lý profile   | Đã triển khai một phần | Đổi tên, xem email verification state, xem loyalty     |
| AUTH-08 | Đổi mật khẩu      | Đã triển khai          | Thực hiện từ trang profile                             |
| AUTH-09 | Verify email      | Đã triển khai          | Gửi mail xác thực và resend từ profile                 |
| AUTH-10 | Avatar upload     | Chưa có bằng chứng     | Không thấy flow upload avatar riêng cho profile        |

### 4.2. Module Phòng Hát (ROOM)

| ID      | Chức năng            | Trạng thái         | Mô tả                                                     |
| ------- | -------------------- | ------------------ | --------------------------------------------------------- |
| ROOM-01 | Danh sách phòng      | Đã triển khai      | Public list rooms                                         |
| ROOM-02 | Tìm phòng trống      | Đã triển khai      | Search theo start/end time và min capacity                |
| ROOM-03 | Chi tiết phòng       | Đã triển khai      | Xem room theo id                                          |
| ROOM-04 | Admin CRUD           | Đã triển khai      | Manager+ create/update, admin delete                      |
| ROOM-05 | Loại phòng           | Đã triển khai      | `standard`, `vip`, `super_vip`                            |
| ROOM-06 | Gán chi nhánh        | Đã triển khai      | `branchId` nullable                                       |
| ROOM-07 | Trạng thái bảo trì   | Chưa có bằng chứng | Không có cột/trạng thái maintenance trong schema hiện tại |
| ROOM-08 | Trạng thái real-time | Chưa có bằng chứng | Không có websocket/SSE/push infra trong repo              |

**Schema `room` hiện tại:**

| Field        | Type    | Constraint                                        |
| ------------ | ------- | ------------------------------------------------- |
| id           | serial  | PK                                                |
| name         | text    | NOT NULL                                          |
| capacity     | integer | NOT NULL                                          |
| type         | text    | NOT NULL                                          |
| pricePerHour | integer | NOT NULL, default 100000                          |
| branchId     | integer | Nullable, FK -> `branch.id`, `onDelete: set null` |

### 4.3. Module Đặt Phòng (BOOKING)

| ID    | Chức năng                    | Trạng thái         | Mô tả                                                         |
| ----- | ---------------------------- | ------------------ | ------------------------------------------------------------- |
| BK-01 | Kiểm tra availability        | Đã triển khai      | Trả `isAvailable` và `roomCost`                               |
| BK-02 | Tạo booking                  | Đã triển khai      | Authenticated + rate-limited                                  |
| BK-03 | Cross-midnight normalization | Đã triển khai      | End time qua ngày được normalize                              |
| BK-04 | Booking policy validation    | Đã triển khai      | Min/max hours, advance booking days từ settings               |
| BK-05 | Overlap prevention           | Đã triển khai      | Check overlap trong transaction                               |
| BK-06 | Dynamic pricing              | Đã triển khai      | Qua `pricingService`, không còn là công thức cố định đơn giản |
| BK-07 | Optional services            | Đã triển khai      | Gắn dịch vụ vào booking                                       |
| BK-08 | Voucher application          | Đã triển khai      | Reserve/apply/release voucher                                 |
| BK-09 | Loyalty redemption           | Đã triển khai      | Dùng điểm khi tạo booking                                     |
| BK-10 | Lịch sử booking              | Đã triển khai      | User xem booking của mình                                     |
| BK-11 | Hủy booking của mình         | Đã triển khai      | Chỉ owner, chỉ đơn `pending`                                  |
| BK-12 | Admin đổi trạng thái         | Đã triển khai      | `pending`, `confirmed`, `cancelled`, `checked_in`             |
| BK-13 | Check-in                     | Đã triển khai      | Staff+ có thể check-in booking confirmed                      |
| BK-14 | Check-out                    | Chưa có bằng chứng | Không thấy status/flow `checked_out`                          |
| BK-15 | Chuyển phòng                 | Chưa có bằng chứng | Không thấy API/service move room                              |

**Schema `booking` hiện tại:**

| Field          | Type      | Constraint                  |
| -------------- | --------- | --------------------------- |
| id             | serial    | PK                          |
| userId         | text      | FK -> `user.id`, CASCADE    |
| roomId         | integer   | FK -> `room.id`, CASCADE    |
| startTime      | timestamp | NOT NULL                    |
| endTime        | timestamp | NOT NULL                    |
| guestCount     | integer   | Nullable                    |
| status         | text      | NOT NULL, default `pending` |
| totalCost      | integer   | Nullable                    |
| voucherCode    | text      | Nullable                    |
| discountAmount | integer   | NOT NULL, default 0         |
| usedPoints     | integer   | NOT NULL, default 0         |
| createdAt      | timestamp | NOT NULL, defaultNow        |

### 4.4. Module Menu Dịch Vụ (SERVICE)

| ID     | Chức năng           | Trạng thái    | Mô tả                                            |
| ------ | ------------------- | ------------- | ------------------------------------------------ |
| SVC-01 | Admin CRUD          | Đã triển khai | Manager+ create/update, admin delete             |
| SVC-02 | Danh mục            | Đã triển khai | `food`, `drink`, `decoration`, `other`           |
| SVC-03 | Toggle availability | Đã triển khai | `isAvailable`                                    |
| SVC-04 | Client menu         | Đã triển khai | Public service listing                           |
| SVC-05 | Gắn vào booking     | Đã triển khai | Lưu service items khi tạo booking                |
| SVC-06 | Upload ảnh dịch vụ  | Đã triển khai | `POST /api/upload`, lưu local vào `/uploads/...` |

### 4.5. Module Khuyến Mãi & Voucher (PROMOTION)

| ID     | Chức năng             | Trạng thái    | Mô tả                                   |
| ------ | --------------------- | ------------- | --------------------------------------- |
| PRO-01 | Tạo voucher           | Đã triển khai | Manager+ tạo mã                         |
| PRO-02 | Điều kiện sử dụng     | Đã triển khai | Min order, expiry, max usage            |
| PRO-03 | Public promotions     | Đã triển khai | Public page đọc `listPublic`            |
| PRO-04 | Validate voucher      | Đã triển khai | Public validation theo order amount     |
| PRO-05 | Apply voucher         | Đã triển khai | Protected apply                         |
| PRO-06 | Quản lý voucher       | Đã triển khai | Admin update/delete, manager list/count |
| PRO-07 | Release usage khi hủy | Đã triển khai | Release voucher trong booking lifecycle |

### 4.6. Module Tích Điểm & Thành Viên (LOYALTY)

| ID     | Chức năng        | Trạng thái              | Mô tả                                                                  |
| ------ | ---------------- | ----------------------- | ---------------------------------------------------------------------- |
| LYL-01 | Tích điểm        | Đã triển khai           | Reward khi booking được confirmed                                      |
| LYL-02 | Dùng điểm        | Đã triển khai           | Redeem khi tạo booking                                                 |
| LYL-03 | Hoàn điểm        | Đã triển khai           | Refund/revert theo lifecycle                                           |
| LYL-04 | Hạng thành viên  | Đã triển khai           | Tier projection và next tier                                           |
| LYL-05 | Xem lịch sử điểm | Đã triển khai           | `loyalty.getHistory`                                                   |
| LYL-06 | Admin config     | Đã triển khai gián tiếp | Threshold/rate nằm trong settings, không có router loyalty admin riêng |

### 4.7. Module Bảng Giá (PRICING)

| ID     | Chức năng                       | Trạng thái    | Mô tả                                  |
| ------ | ------------------------------- | ------------- | -------------------------------------- |
| PRC-01 | Rule theo khung giờ             | Đã triển khai | `time_block`                           |
| PRC-02 | Rule theo ngày lễ/ngày đặc biệt | Đã triển khai | `holiday`                              |
| PRC-03 | Admin CRUD pricing rules        | Đã triển khai | Admin-only                             |
| PRC-04 | Apply pricing vào booking cost  | Đã triển khai | Qua `pricingService.calculateRoomCost` |

### 4.8. Module Thanh Toán (PAYMENT)

| ID     | Chức năng             | Trạng thái         | Mô tả                                      |
| ------ | --------------------- | ------------------ | ------------------------------------------ |
| PAY-01 | Đặt cọc online        | Chưa có bằng chứng | Không có VNPay/MoMo integration trong repo |
| PAY-02 | Trạng thái thanh toán | Chưa có bằng chứng | Không có payment schema/flow riêng         |
| PAY-03 | Lịch sử thanh toán    | Chưa có bằng chứng | Không có payment module hiện tại           |

### 4.9. Module Dashboard & Vận Hành (DASHBOARD)

| ID     | Chức năng         | Trạng thái    | Mô tả                      |
| ------ | ----------------- | ------------- | -------------------------- |
| DSH-01 | KPI cards         | Đã triển khai | Stats summary              |
| DSH-02 | Recent bookings   | Đã triển khai | Configurable limit         |
| DSH-03 | Enriched bookings | Đã triển khai | Join room/user info        |
| DSH-04 | Revenue chart     | Đã triển khai | Series theo số ngày        |
| DSH-05 | Occupancy         | Đã triển khai | Occupancy summary          |
| DSH-06 | Heatmap           | Đã triển khai | Usage heatmap              |
| DSH-07 | Top rooms         | Đã triển khai | Ranking                    |
| DSH-08 | Top customers     | Đã triển khai | Ranking                    |
| DSH-09 | Calendar day view | Đã triển khai | Staff+                     |
| DSH-10 | CSV export        | Đã triển khai | `GET /api/export/bookings` |

### 4.10. Module Quản Lý Người Dùng, Review, Branch, Settings, Activity

| ID     | Chức năng                  | Trạng thái    | Mô tả                               |
| ------ | -------------------------- | ------------- | ----------------------------------- |
| ADM-01 | User listing               | Đã triển khai | Pagination + filters                |
| ADM-02 | Update role                | Đã triển khai | Admin-only                          |
| ADM-03 | Ban / unban                | Đã triển khai | Admin-only                          |
| ADM-04 | Review moderation view     | Đã triển khai | Manager+ review listing/stats       |
| ADM-05 | Review creation by member  | Đã triển khai | Chỉ sau booking `checked_in`        |
| ADM-06 | Branch CRUD                | Đã triển khai | Admin-only                          |
| ADM-07 | Public settings projection | Đã triển khai | `setting.getPublic`                 |
| ADM-08 | Settings update            | Đã triển khai | Admin bulk update                   |
| ADM-09 | Activity log               | Đã triển khai | Audit trail cho action nhạy cảm     |
| ADM-10 | Recommendation helpers     | Đã triển khai | Alternative rooms, popular services |

---

## 5. Yêu Cầu Phi Chức Năng

| ID     | Yêu cầu                        | Trạng thái / Ghi chú                                                                    |
| ------ | ------------------------------ | --------------------------------------------------------------------------------------- |
| NFR-01 | Type safety                    | Đã áp dụng qua TypeScript + tRPC + Zod                                                  |
| NFR-02 | Server-side authorization      | Đã áp dụng qua `public/protected/staff/manager/adminProcedure`                          |
| NFR-03 | Transaction safety cho booking | Đã áp dụng qua DB transaction + advisory lock                                           |
| NFR-04 | Config-driven policy           | Đã áp dụng qua settings cho booking policy, loyalty, site info                          |
| NFR-05 | Responsive UI                  | Được thiết kế theo layout responsive, nhưng chưa có formal acceptance matrix trong repo |
| NFR-06 | User feedback                  | Toast feedback có cho nhiều mutation chính                                              |
| NFR-07 | Email side effects             | Có email verification và booking status notification qua Resend                         |
| NFR-08 | File upload validation         | Có giới hạn loại file, dung lượng, và quyền                                             |
| NFR-09 | Observability                  | Chỉ ở mức cơ bản; chưa có centralized monitoring/tracing                                |
| NFR-10 | CI/CD                          | Chưa có artifact CI/CD được commit                                                      |

Các yêu cầu sau **không nên coi là implemented** ở thời điểm hiện tại:

- payment integration
- real-time synchronization
- distributed rate limiting
- cloud object storage cho uploads
- production monitoring stack hoàn chỉnh

---

## 6. Route Map

### Public / Member Routes

| Route                          | Trạng thái             | Mô tả                                                            |
| ------------------------------ | ---------------------- | ---------------------------------------------------------------- |
| `/`                            | Đã triển khai          | Landing + entry points                                           |
| `/rooms`                       | Đã triển khai          | Danh sách phòng                                                  |
| `/services`                    | Đã triển khai          | Danh sách dịch vụ                                                |
| `/promotions`                  | Đã triển khai          | Danh sách khuyến mãi public                                      |
| `/booking/[roomId]`            | Đã triển khai          | Form đặt phòng                                                   |
| `/booking/receipt/[bookingId]` | Đã triển khai          | Booking receipt                                                  |
| `/login`                       | Đã triển khai          | Login                                                            |
| `/register`                    | Đã triển khai          | Register                                                         |
| `/verify-email`                | Đã triển khai          | Verify email flow                                                |
| `/my-bookings`                 | Đã triển khai          | Lịch sử booking của member                                       |
| `/profile`                     | Đã triển khai          | Profile + password + loyalty                                     |
| `/contact`                     | Đã triển khai một phần | Hiển thị public settings, chưa có backend persistence cho submit |

### Admin Routes

| Route               | Trạng thái    | Mô tả                |
| ------------------- | ------------- | -------------------- |
| `/admin`            | Đã triển khai | Dashboard            |
| `/admin/bookings`   | Đã triển khai | Booking operations   |
| `/admin/rooms`      | Đã triển khai | Room CRUD            |
| `/admin/services`   | Đã triển khai | Service CRUD         |
| `/admin/promotions` | Đã triển khai | Promotion CRUD       |
| `/admin/pricing`    | Đã triển khai | Pricing rules        |
| `/admin/settings`   | Đã triển khai | Settings management  |
| `/admin/branches`   | Đã triển khai | Branch CRUD          |
| `/admin/users`      | Đã triển khai | User management      |
| `/admin/reviews`    | Đã triển khai | Review stats/listing |
| `/admin/activity`   | Đã triển khai | Activity logs        |
| `/admin/calendar`   | Đã triển khai | Day schedule         |

### HTTP Endpoints

| Route                  | Trạng thái    | Mô tả                        |
| ---------------------- | ------------- | ---------------------------- |
| `/api/auth/[...all]`   | Đã triển khai | Better Auth callback surface |
| `/api/upload`          | Đã triển khai | Upload ảnh service           |
| `/api/export/bookings` | Đã triển khai | CSV export                   |

---

## 7. tRPC API Specification

### Guards

| Guard                  | Ý nghĩa                               |
| ---------------------- | ------------------------------------- |
| `publicProcedure`      | Không cần đăng nhập                   |
| `protectedProcedure`   | Cần user đã xác thực, không bị banned |
| `rateLimitedProcedure` | Protected + booking rate limit        |
| `staffProcedure`       | `admin`, `manager`, `staff`           |
| `managerProcedure`     | `admin`, `manager`                    |
| `adminProcedure`       | Chỉ `admin`                           |

### Router Summary

| Namespace        | Procedures chính                                                                                                  |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| `healthcheck`    | readiness check                                                                                                   |
| `room`           | `list`, `getById`, `count`, `create`, `update`, `delete`, `findAvailable`                                         |
| `booking`        | `list`, `getById`, `myBookings`, `checkAvailability`, `create`, `cancelMyBooking`, `changeStatus`, `checkin`      |
| `service`        | `list`, `getById`, `count`, `create`, `update`, `delete`                                                          |
| `promotion`      | `list`, `listPublic`, `getById`, `count`, `create`, `update`, `delete`, `validate`, `apply`                       |
| `loyalty`        | `getInfo`, `getHistory`                                                                                           |
| `dashboard`      | `stats`, `recentBookings`, `enrichedBookings`, `revenueChart`, `occupancy`, `heatmap`, `topRooms`, `topCustomers` |
| `pricing`        | `list`, `getById`, `create`, `update`, `delete`                                                                   |
| `setting`        | `list`, `getByGroup`, `update`, `getPublic`                                                                       |
| `user`           | `list`, `getById`, `updateRole`, `ban`, `unban`                                                                   |
| `review`         | `create`, `listByRoom`, `roomStats`, `allRoomStats`, `list`, `overallStats`                                       |
| `activity`       | `list`                                                                                                            |
| `calendar`       | `getDay`                                                                                                          |
| `branch`         | `list`, `listAll`, `create`, `update`, `delete`, `count`                                                          |
| `recommendation` | `alternativeRooms`, `popularServices`                                                                             |

### Lưu ý quan trọng

- `booking.list` không phải public; nó dùng `staffProcedure`
- `booking.changeStatus` không phải public; nó dùng `adminProcedure`
- `service.list` là public
- `promotion.listPublic` và `setting.getPublic` là public-facing APIs
- `dashboard.*` hiện yêu cầu `manager+`

---

## 8. RBAC Matrix

### Roles hiện có

- `admin`
- `manager`
- `staff`
- `user`
- `banned`

### Phân quyền tổng quát

| Role      | Quyền chính                                                                  |
| --------- | ---------------------------------------------------------------------------- |
| `admin`   | Toàn quyền hệ thống, settings, branches, pricing, users, destructive actions |
| `manager` | Dashboard, bookings, rooms, services, promotions, calendar, exports          |
| `staff`   | Booking operations, calendar, xem dữ liệu vận hành giới hạn                  |
| `user`    | Booking, profile, loyalty, review, member flows                              |
| `banned`  | Bị chặn khỏi protected procedures                                            |

RBAC được enforce chủ yếu ở server procedures và permission map, không chỉ ở UI.

---

## 9. Ma Trận Tiến Độ

| Module                     | Trạng thái                        | Ghi chú                                          |
| -------------------------- | --------------------------------- | ------------------------------------------------ |
| Auth                       | Hoàn thành mức ứng dụng hiện tại  | Login/register/session/verify/profile/password   |
| Room CRUD                  | Hoàn thành                        | Có branch assignment                             |
| Booking engine             | Hoàn thành mức lõi                | Có overlap prevention, pricing, voucher, loyalty |
| Booking lifecycle          | Hoàn thành một phần               | Có `checked_in`, chưa có `checked_out`           |
| Service catalog            | Hoàn thành                        | Có upload local                                  |
| Promotions                 | Hoàn thành                        | Public + admin flows                             |
| Loyalty                    | Hoàn thành mức nghiệp vụ hiện tại | User-facing, settings-driven                     |
| Pricing                    | Hoàn thành                        | Admin-only rule management                       |
| Dashboard & reporting      | Hoàn thành                        | KPI, chart, occupancy, heatmap, rankings         |
| Calendar                   | Hoàn thành                        | Staff+                                           |
| User management            | Hoàn thành                        | Role update, ban/unban                           |
| Branch management          | Hoàn thành                        | Admin-only                                       |
| Settings                   | Hoàn thành                        | Public projection + admin update                 |
| Reviews                    | Hoàn thành                        | Review after checked-in booking                  |
| Recommendation helpers     | Hoàn thành mức nhẹ                | Rule/data-driven helper                          |
| CSV export                 | Hoàn thành                        | Admin/manager                                    |
| Contact submission backend | Chưa hoàn thành                   | UI có, persistence chưa có                       |
| Payment gateway            | Chưa triển khai                   | Không có bằng chứng trong repo                   |
| Real-time infra            | Chưa triển khai                   | Không có websocket/SSE/push layer                |

---

## 10. Phạm Vi Ngoài Scope Hoặc Chưa Có Bằng Chứng

Các mục sau không nên mô tả như tính năng đã hoàn thiện:

- thanh toán online qua VNPay/MoMo
- payment history độc lập
- room maintenance workflow
- transfer room workflow
- real-time room state synchronization
- CI/CD pipeline
- centralized monitoring / tracing
- cloud object storage cho uploads

---

## 11. Kết Luận

Phiên bản SRS này phản ánh codebase hiện tại theo hướng evidence-based: những gì đã có trong repo được mô tả như implemented behavior; những gì chưa có bằng chứng được đánh dấu rõ là chưa triển khai hoặc ngoài scope hiện tại. Nếu tiếp tục phát triển dự án, các ưu tiên tài liệu tiếp theo nên là:

1. chuẩn hóa acceptance criteria cho contact, payment, và check-out flows
2. bổ sung test coverage cho booking, loyalty, promotions, export, upload
3. tách rõ future roadmap ra khỏi implemented requirements để tránh drift tài liệu lần nữa
