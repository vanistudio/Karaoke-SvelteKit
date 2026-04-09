import { db } from '$lib/server/db';
import { room, booking, user, service } from '$lib/server/db/schema';
import { eq, count, sql } from 'drizzle-orm';

export class DashboardService {
	async getStats() {
		const rooms = await db.select({ count: count() }).from(room);
		const bookings = await db.select({ count: count() }).from(booking);
		const pendingBookings = await db.select({ count: count() }).from(booking).where(eq(booking.status, 'pending'));
		const confirmedBookings = await db.select({ count: count() }).from(booking).where(eq(booking.status, 'confirmed'));
		const users = await db.select({ count: count() }).from(user);
		const services = await db.select({ count: count() }).from(service);

		const todayStart = new Date();
		todayStart.setHours(0, 0, 0, 0);
		const todayEnd = new Date();
		todayEnd.setHours(23, 59, 59, 999);

		const todayRevenue = await db
			.select({ total: sql<number>`COALESCE(SUM(${booking.totalCost}), 0)` })
			.from(booking)
			.where(
				sql`${booking.status} = 'confirmed' AND ${booking.createdAt} >= ${todayStart} AND ${booking.createdAt} <= ${todayEnd}`
			);

		return {
			totalRooms: rooms[0].count,
			totalBookings: bookings[0].count,
			pendingBookings: pendingBookings[0].count,
			confirmedBookings: confirmedBookings[0].count,
			totalUsers: users[0].count,
			totalServices: services[0].count,
			todayRevenue: Number(todayRevenue[0]?.total || 0)
		};
	}

	async getRecentBookings(limit = 5) {
		const results = await db
			.select({
				id: booking.id,
				startTime: booking.startTime,
				endTime: booking.endTime,
				status: booking.status,
				totalCost: booking.totalCost,
				createdAt: booking.createdAt,
				roomName: room.name,
				roomType: room.type,
				userName: user.name,
				userEmail: user.email
			})
			.from(booking)
			.leftJoin(room, eq(booking.roomId, room.id))
			.leftJoin(user, eq(booking.userId, user.id))
			.orderBy(sql`${booking.createdAt} DESC`)
			.limit(limit);

		return results;
	}

	async getEnrichedBookings() {
		const results = await db
			.select({
				id: booking.id,
				startTime: booking.startTime,
				endTime: booking.endTime,
				status: booking.status,
				totalCost: booking.totalCost,
				createdAt: booking.createdAt,
				roomId: booking.roomId,
				userId: booking.userId,
				roomName: room.name,
				roomType: room.type,
				userName: user.name,
				userEmail: user.email
			})
			.from(booking)
			.leftJoin(room, eq(booking.roomId, room.id))
			.leftJoin(user, eq(booking.userId, user.id))
			.orderBy(sql`${booking.createdAt} DESC`);

		return results;
	}
}

export const dashboardService = new DashboardService();
