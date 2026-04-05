# Hệ Thống Đặt Phòng Karaoke (Karaoke Booking System)

Đây là tài liệu chi tiết mô tả yêu cầu kỹ thuật, kiến trúc và các tính năng cụ thể của đồ án/website đặt phòng Karaoke chuyên nghiệp.

## 1. Công Nghệ Sử Dụng (Tech Stack)

### Frontend (UI/UX)
- **Framework:** SvelteKit (Svelte 5)
- **CSS Framework:** Tailwind CSS v4
- **UI Components:** Skeleton UI (`@skeletonlabs/skeleton`, `@skeletonlabs/skeleton-svelte`)

### Backend (Server-side)
- **API Engine:** tRPC (Typed RPC, cho phép type-safety từ client đến server)
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** Better-Auth

---

## 2. Kiến Trúc Backend (Project Structure)

Toàn bộ logic server-side sẽ được đặt trong thư mục theo kiến trúc 3 class layer pattern chuẩn mực:
**Path:** `src/lib/server/`

- **`db/` (`*.schema.ts`, `index.ts`)**: Cấu hình kết nối database và định nghĩa các schema (bảng) cho Drizzle.
- **`repositories/` (`*.repository.ts`)**: Lớp giao tiếp trực tiếp với database. Chịu trách nhiệm thực thi các câu lệnh raw SQL hoặc ORM query (CRUD).
- **`services/` (`*.service.ts`)**: Lớp chứa Business Logic (quy tắc nghiệp vụ). Xử lý dữ liệu lấy từ cấu trúc DB, gọi external API, xử lý tính toán điểm thưởng, tiền giảm giá...
- **`controllers/` (`*.controller.ts`)**: Lõi điều phối. Nhận request, gọi đến các file services tương ứng để xử lý và trả về response cho Route/Client.
- **`routes/` (`*.route.ts` / `*.router.ts`)**: Nơi khai báo tRPC router (mutation, query) và apply validate params/body (Zod).

---

## 3. Các Chức Năng Cốt Lõi (Core Features)

Dưới đây là sơ đồ tính năng hoàn chỉnh của một phần mềm đặt phòng Karaoke chuyên nghiệp:

### 3.1. Tính Năng Người Dùng (Client/Khách hàng)
- **Xác Thực & Tài Khoản:** Đăng nhập, Đăng ký (OTP/Email), Quản lý profile cá nhân, Đổi mật khẩu.
- **Xem Danh Sách Phòng:** Tìm kiếm phòng hát theo chi nhánh, sức chứa, loại phòng (Thường, VIP, Super VIP).
- **Trạng Thái Phòng Trực Tuyến:** Hiển thị phòng trống, phòng đang bận, phòng đã được đặt cọc.
- **Đặt Phòng Cụ Thể:**
  - Chọn thời gian (giờ bắt đầu/giờ kết thúc).
  - Khai báo số người.
  - Tùy chọn đi kèm (Gói trang trí sinh nhật, loa ngoài...).
- **Đặt Món Lên Phòng (Menu Đồ ăn/Thức uống):** Mua thêm trái cây, bia, snack từ trên web trước khi đến.
- **Chương Trình Khuyến Mãi (Promotions) & Giảm Giá:** 
  - Xem danh sách mã giảm giá.
  - Áp dụng các ưu đãi % hoặc giảm cố định trên tổng bill.
- **Thành Viên & Tích Điểm (Loyalty):** 
  - Thăng hạng thẻ (Bạc, Vàng, Kim Cương).
  - Tích điểm hóa đơn và dùng điểm khấu trừ vào các lần đặt phòng kế tiếp.
- **Lịch Sử Đặt Phòng:** Xem lại danh sách đặt chỗ cũ, trạng thái hóa đơn. Cổng thanh toán (Đặt cọc VNPay/Momo).

### 3.2. Tính Năng Quản Trị Hệ Thống (Admin / Staff)
- **Dashboard Thống Kê:** Biểu đồ doanh thu ngày/tháng/năm, tỷ lệ lấp đầy phòng, nhóm khách hàng VIP.
- **Quản Lý Đơn Đặt (Booking Management):** 
  - Chấp nhận, Từ chối đặt chỗ.
  - Cập nhật quá trình (Check-in, Check-out).
  - Xử lý chuyển phòng cho khách.
- **Quản Lý Phòng & Sơ Đồ Phòng:** Thêm, sửa, xóa các phòng hát. Quản lý trạng thái "Đang bảo trì".
- **Quản Lý Bảng Giá (Pricing Cấu Hình Cao):** Set giá đa dạng (Giá theo ngày lễ, giá theo khung giờ Vàng/giờ Sáng/giờ Tối).
- **Quản Lý Khuyến Mãi & Voucher:** Tạo mã code, setup điều kiện sử dụng (VD: hóa đơn trên 2 triệu).
- **Quản Lý Menu Món Ăn/Dịch Vụ:** Thêm món ăn mới, xóa, điều chỉnh giá nhập giá bán.
- **Quản Lý Người Theo Dõi / Tích Điểm:** Xác nhận cấu hình (%) cộng điểm theo hạn mức thành viên.
- **Quản Trị Phân Quyền (Role-based Access Control):** 
  - Phân quyền Chủ quán (Toàn quyền).
  - Phân quyền Quản lý chi nhánh.
  - Phân quyền Nhân viên (Chỉ xem đơn và xếp phòng).

---

Dự án này sẽ tạo nên một hệ thống O2O (Online-to-Offline) toàn diện, ứng dụng kiến trúc chuẩn Enterprise ngay từ những bước đầu tiên.
