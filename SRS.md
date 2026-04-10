# KaraSystem — Software Requirements Specification (SRS)

**Phiên bản:** 1.0
**Ngày cập nhật:** 2026-04-10
**Hệ thống:** Đặt Phòng Karaoke Trực Tuyến (O2O — Online-to-Offline)

---

## 1. Tổng Quan Hệ Thống

KaraSystem là nền tảng quản lý đặt phòng Karaoke chuyên nghiệp, cung cấp:
- **Khách hàng (Client):** Tìm kiếm / đặt phòng trực tuyến, đặt món đi kèm, tích điểm thành viên
- **Quản trị (Admin):** Dashboard thống kê, quản lý phòng / đơn đặt / menu / voucher / phân quyền nhân sự

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | SvelteKit (Svelte 5) |
| Styling | Tailwind CSS v4 + DaisyUI |
| Icons | Iconify (`solar:*-line-duotone` / `solar:*-bold-duotone`) |
| API | tRPC (end-to-end type-safe RPC) |
| Validation | Zod |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Auth | Better-Auth (admin plugin + RBAC) |
| Notifications | Custom Sonner-style Toast (`$lib/stores/toast`) |

---

## 3. Kiến Trúc Backend — 3-Layer Pattern

```
src/lib/server/
├── db/                  # Schema + DB connection
│   ├── schema/          # *.schema.ts (Drizzle tables)
│   └── index.ts         # Drizzle client instance
├── repositories/        # *.repository.ts — Raw CRUD via ORM
├── services/            # *.service.ts — Business Logic
├── controllers/         # *.controller.ts — Thin Orchestrator
├── routes/              # *.router.ts — tRPC endpoints + Zod
└── trpc/                # tRPC init (context, procedures)
```

> **Quy tắc:** Mỗi layer là 1 Class + 1 Singleton export. Import luôn dùng `$lib/server/...`.

---

## 4. Yêu Cầu Chức Năng (Functional Requirements)

### 4.1. Module Xác Thực & Tài Khoản (AUTH)

| ID | Chức năng | Mô tả |
|----|-----------|-------|
| AUTH-01 | Đăng ký | Email + Password, tạo tài khoản `role: 'user'` |
| AUTH-02 | Đăng nhập | Email + Password, session cookie via Better-Auth |
| AUTH-03 | Đăng xuất | Hủy session, redirect `/login`, Toast notification |
| AUTH-04 | Session SPA | `invalidateAll` cho reactive UI updates |
| AUTH-05 | Route Guard | Server-side redirect cho `/admin` nếu `role !== 'admin'` |
| AUTH-06 | RBAC UI | Ẩn Admin links nếu `role !== 'admin'` |
| AUTH-07 | Quản lý Profile | Đổi tên, avatar, email |
| AUTH-08 | Đổi mật khẩu | Đổi password từ trang cá nhân |

---

### 4.2. Module Phòng Hát (ROOM)

| ID | Chức năng | Mô tả |
|----|-----------|-------|
| ROOM-01 | Danh sách phòng (Client) | Hiển thị tất cả phòng + filter theo loại / sức chứa |
| ROOM-02 | Tìm phòng trống | Tìm phòng available theo ngày/giờ/sức chứa |
| ROOM-03 | Trạng thái real-time | Phòng trống / đang bận / đã đặt cọc |
| ROOM-04 | Admin CRUD | Thêm / Sửa / Xóa phòng (protectedProcedure) |
| ROOM-05 | Loại phòng | `standard` / `vip` / `super_vip` |
| ROOM-06 | Trạng thái bảo trì | Đánh dấu phòng "Đang bảo trì" (admin) |

**Schema `room`:**

| Field | Type | Constraint |
|-------|------|-----------|
| id | serial | PK |
| name | text | NOT NULL |
| capacity | integer | NOT NULL |
| type | text | NOT NULL (`standard`/`vip`/`super_vip`) |
| pricePerHour | integer | NOT NULL, default 100000 |

---

### 4.3. Module Đặt Phòng (BOOKING)

| ID | Chức năng | Mô tả |
|----|-----------|-------|
| BK-01 | Đặt phòng | Client chọn phòng + thời gian → tạo booking (protectedProcedure) |
| BK-02 | Check overlap | Kiểm tra trùng lịch trước khi confirm |
| BK-03 | Auto pricing | `totalCost = durationHours × room.pricePerHour` |
| BK-04 | Status flow | `pending` → `confirmed` / `cancelled` |
| BK-05 | Admin quản lý | Phê duyệt / Hủy / Xem danh sách enriched (tên khách + tên phòng) |
| BK-06 | Check-in/out | Cập nhật quá trình (check-in, check-out) |
| BK-07 | Chuyển phòng | Admin chuyển khách sang phòng khác |
| BK-08 | Lịch sử | Client xem lại lịch sử đặt phòng |

**Schema `booking`:**

| Field | Type | Constraint |
|-------|------|-----------|
| id | serial | PK |
| userId | text | FK → user.id, CASCADE |
| roomId | integer | FK → room.id, CASCADE |
| startTime | timestamp | NOT NULL |
| endTime | timestamp | NOT NULL |
| status | text | NOT NULL, default `'pending'` |
| totalCost | integer | Nullable |
| createdAt | timestamp | NOT NULL, defaultNow |

---

### 4.4. Module Menu Dịch Vụ (SERVICE)

| ID | Chức năng | Mô tả |
|----|-----------|-------|
| SVC-01 | Admin CRUD | Thêm / Sửa / Xóa món ăn, đồ uống, dịch vụ |
| SVC-02 | Danh mục | `food` / `drink` / `decoration` / `other` |
| SVC-03 | Toggle bán | Bật/Tắt trạng thái `isAvailable` |
| SVC-04 | Client menu | Khách chọn dịch vụ đi kèm khi đặt phòng |
| SVC-05 | Gắn vào booking | Liên kết dịch vụ đã chọn với đơn đặt phòng |

**Schema `service`:**

| Field | Type | Constraint |
|-------|------|-----------|
| id | serial | PK |
| name | text | NOT NULL |
| category | text | NOT NULL (`food`/`drink`/`decoration`/`other`) |
| price | integer | NOT NULL |
| description | text | Nullable |
| isAvailable | boolean | NOT NULL, default true |
| createdAt | timestamp | NOT NULL, defaultNow |

---

### 4.5. Module Khuyến Mãi & Voucher (PROMO)

| ID | Chức năng | Mô tả |
|----|-----------|-------|
| PRO-01 | Tạo voucher | Admin tạo mã code + điều kiện (% hoặc cố định) |
| PRO-02 | Điều kiện sử dụng | Hóa đơn tối thiểu, hạn sử dụng, số lần dùng |
| PRO-03 | Áp dụng voucher | Client nhập mã → giảm trên tổng bill |
| PRO-04 | Quản lý voucher | Admin xem/sửa/xóa/vô hiệu hóa voucher |

**Schema `promotion` (Dự kiến):**

| Field | Type | Constraint |
|-------|------|-----------|
| id | serial | PK |
| code | text | NOT NULL, UNIQUE |
| type | text | `percent` / `fixed` |
| value | integer | Số % hoặc số tiền giảm |
| minOrderAmount | integer | Hóa đơn tối thiểu |
| maxUsage | integer | Số lần sử dụng tối đa |
| currentUsage | integer | Default 0 |
| expiresAt | timestamp | Nullable |
| isActive | boolean | Default true |
| createdAt | timestamp | defaultNow |

---

### 4.6. Module Tích Điểm & Thành Viên (LOYALTY)

| ID | Chức năng | Mô tả |
|----|-----------|-------|
| LYL-01 | Tích điểm | Cộng điểm theo % tổng hóa đơn mỗi lần booking |
| LYL-02 | Hạng thành viên | Bạc / Vàng / Kim Cương (thăng hạng tự động) |
| LYL-03 | Dùng điểm | Khấu trừ điểm vào lần đặt phòng kế tiếp |
| LYL-04 | Admin config | Cấu hình % cộng điểm theo hạng |

---

### 4.7. Module Bảng Giá Nâng Cao (PRICING)

| ID | Chức năng | Mô tả |
|----|-----------|-------|
| PRC-01 | Giá theo khung giờ | Sáng / Chiều / Tối / Giờ Vàng |
| PRC-02 | Giá theo ngày lễ | Tết / Noel / Valentine → markup |
| PRC-03 | Admin config | UI để cấu hình bảng giá theo phòng + thời điểm |

---

### 4.8. Module Thanh Toán (PAYMENT)

| ID | Chức năng | Mô tả |
|----|-----------|-------|
| PAY-01 | Đặt cọc online | VNPay / MoMo integration |
| PAY-02 | Trạng thái thanh toán | Chưa thanh toán / Đã cọc / Đã thanh toán |
| PAY-03 | Lịch sử thanh toán | Client xem lại hóa đơn cũ |

---

### 4.9. Module Dashboard Thống Kê (DASHBOARD)

| ID | Chức năng | Mô tả |
|----|-----------|-------|
| DSH-01 | KPI Cards | Doanh thu hôm nay, tổng booking, tổng phòng, tổng users |
| DSH-02 | Recent bookings | 5 đơn đặt phòng mới nhất (enriched) |
| DSH-03 | System status | Cảnh báo đơn chờ duyệt |
| DSH-04 | Biểu đồ doanh thu | Chart theo ngày / tháng / năm |
| DSH-05 | Tỷ lệ lấp đầy | % phòng có booking theo ngày |

---

### 4.10. Module Phân Quyền RBAC (ROLE)

| ID | Chức năng | Mô tả |
|----|-----------|-------|
| ROLE-01 | Chủ quán | `admin` — toàn quyền |
| ROLE-02 | Quản lý chi nhánh | `manager` — quản lý phòng + đơn của chi nhánh |
| ROLE-03 | Nhân viên | `staff` — chỉ xem đơn và xếp phòng |
| ROLE-04 | Khách hàng | `user` — đặt phòng + xem lịch sử |

---

## 5. Yêu Cầu Phi Chức Năng

| # | Yêu cầu | Tiêu chuẩn |
|---|---------|-----------|
| NFR-01 | Performance | Trang load < 2s, API response < 500ms |
| NFR-02 | Security | RBAC enforced at DB / Server / UI levels |
| NFR-03 | Responsive | Mobile-first, breakpoints: sm / md / lg / xl |
| NFR-04 | TypeScript | `svelte-check` phải 0 errors |
| NFR-05 | Clean Code | Không comment, không hardcode, match pattern 100% |
| NFR-06 | UX | Toast feedback cho mọi mutation, loading states |

---

## 6. Route Map

### Client Routes

| Route | Trạng thái | Mô tả |
|-------|-----------|-------|
| `/` | ✅ Hoàn thành | Landing + Tìm phòng trống |
| `/rooms` | ✅ Hoàn thành | Danh sách phòng |
| `/login` | ✅ Hoàn thành | Đăng nhập (redirect if session) |
| `/register` | ✅ Hoàn thành | Đăng ký (redirect if session) |
| `/booking/:roomId` | ✅ Hoàn thành | Form đặt phòng chi tiết + dịch vụ đi kèm |
| `/my-bookings` | ✅ Hoàn thành | Lịch sử đặt phòng của khách |
| `/profile` | ⬜ Chưa build | Quản lý tài khoản cá nhân |
| `/promotions` | ⬜ Chưa build | Danh sách khuyến mãi |

### Admin Routes

| Route | Trạng thái | Mô tả |
|-------|-----------|-------|
| `/admin` | ✅ Hoàn thành | Dashboard (real data) |
| `/admin/rooms` | ✅ Hoàn thành | CRUD phòng hát |
| `/admin/bookings` | ✅ Hoàn thành | Quản lý đặt chỗ (enriched) |
| `/admin/services` | ✅ Hoàn thành | CRUD menu dịch vụ |
| `/admin/promotions` | ⬜ Chưa build | Quản lý voucher |
| `/admin/users` | ⬜ Chưa build | Quản lý thành viên + phân quyền |
| `/admin/pricing` | ⬜ Chưa build | Cấu hình bảng giá nâng cao |
| `/admin/settings` | ⬜ Chưa build | Cài đặt hệ thống |

---

## 7. tRPC API Specification

| Namespace | Endpoint | Procedure | Mô tả |
|-----------|----------|-----------|-------|
| `healthcheck` | — | public | System ready check |
| `room` | `list` | public | Danh sách phòng |
| | `getById` | public | Chi tiết phòng |
| | `count` | public | Tổng số phòng |
| | `create` | protected | Tạo phòng |
| | `update` | protected | Sửa phòng |
| | `delete` | protected | Xóa phòng |
| | `findAvailable` | public | Tìm phòng trống |
| `booking` | `list` | public | Danh sách booking |
| | `getById` | public | Chi tiết booking |
| | `checkAvailability` | public | Kiểm tra trùng lịch |
| | `create` | protected | Tạo booking |
| | `changeStatus` | public | Đổi trạng thái |
| `service` | `list` | protected | Danh sách dịch vụ |
| | `getById` | protected | Chi tiết dịch vụ |
| | `count` | protected | Tổng dịch vụ |
| | `create` | protected | Tạo dịch vụ |
| | `update` | protected | Sửa dịch vụ |
| | `delete` | protected | Xóa dịch vụ |
| `dashboard` | `stats` | protected | KPI aggregation |
| | `recentBookings` | protected | 5 booking mới nhất |
| | `enrichedBookings` | protected | All bookings with joins |

---

## 8. Ma Trận Tiến Độ

| Module | Trạng thái | Ghi chú |
|--------|-----------|---------|
| Auth (Đăng nhập/ký/xuất) | ✅ | Better-Auth + admin plugin |
| RBAC (admin/user) | ✅ | Server guard + UI conditional |
| Room CRUD | ✅ | Full Create/Edit/Delete |
| Booking Engine | ✅ | Create + overlap check + pricing |
| Booking Admin | ✅ | Enriched list + status control |
| Menu/Service CRUD | ✅ | Full CRUD + category tabs |
| Dashboard Real Data | ✅ | Aggregation from DB |
| Client Booking Flow | ✅ | Form đặt phòng + dịch vụ đi kèm + pricing |
| Lịch Sử Đặt Phòng | ✅ | Client xem history + cancel |
| Profile Management | ⬜ | Đổi tên, avatar, password |
| Promotions / Voucher | ⬜ | Schema + backend + admin UI + client |
| Loyalty / Tích Điểm | ⬜ | Schema + backend + admin config |
| Advanced Pricing | ⬜ | Giá theo giờ / ngày lễ |
| Payment Gateway | ⬜ | VNPay / MoMo integration |
| Granular RBAC | ⬜ | manager / staff roles |
| Biểu Đồ Doanh Thu | ⬜ | Chart.js / Recharts integration |
