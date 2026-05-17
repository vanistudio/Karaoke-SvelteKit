import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { booking, room, user } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user || !['admin', 'manager'].includes(locals.user.role)) {
		return new Response('Forbidden', { status: 403 });
	}

	const bookings = await db
		.select({
			id: booking.id,
			userName: user.name,
			userEmail: user.email,
			roomName: room.name,
			roomType: room.type,
			startTime: booking.startTime,
			endTime: booking.endTime,
			guestCount: booking.guestCount,
			totalCost: booking.totalCost,
			status: booking.status,
			voucherCode: booking.voucherCode,
			discountAmount: booking.discountAmount,
			usedPoints: booking.usedPoints,
			createdAt: booking.createdAt
		})
		.from(booking)
		.leftJoin(user, eq(booking.userId, user.id))
		.leftJoin(room, eq(booking.roomId, room.id))
		.orderBy(sql`${booking.createdAt} DESC`);

	const headers = ['Mã', 'Khách Hàng', 'Email', 'Phòng', 'Loại Phòng', 'Bắt Đầu', 'Kết Thúc', 'Số Khách', 'Tổng Tiền', 'Trạng Thái', 'Voucher', 'Giảm Giá', 'Điểm Dùng', 'Ngày Tạo'];

	const fmtDate = (d: Date | null) => d ? new Date(d).toLocaleString('vi-VN') : '';

	const rows = bookings.map(b => [
		b.id,
		b.userName || '',
		b.userEmail || '',
		b.roomName || '',
		b.roomType || '',
		fmtDate(b.startTime),
		fmtDate(b.endTime),
		b.guestCount ?? '',
		b.totalCost ?? 0,
		b.status,
		b.voucherCode || '',
		b.discountAmount ?? 0,
		b.usedPoints ?? 0,
		fmtDate(b.createdAt)
	]);

	const csvContent = [
		headers.join(','),
		...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
	].join('\n');

	const bom = '\uFEFF';

	return new Response(bom + csvContent, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="bookings_${new Date().toISOString().slice(0, 10)}.csv"`
		}
	});
};
