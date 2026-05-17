import { db } from '$lib/server/db';
import { room, booking, user, service } from '$lib/server/db/schema';
import { eq, and, gte, lte, count, sql } from 'drizzle-orm';

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
				and(
					eq(booking.status, 'confirmed'),
					gte(booking.createdAt, todayStart),
					lte(booking.createdAt, todayEnd)
				)
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

	async getRevenueChart(days: number = 7) {
		const results: { date: string; revenue: number; bookings: number }[] = [];
		const today = new Date();
		today.setHours(23, 59, 59, 999);

		for (let i = days - 1; i >= 0; i--) {
			const dayStart = new Date(today);
			dayStart.setDate(today.getDate() - i);
			dayStart.setHours(0, 0, 0, 0);

			const dayEnd = new Date(dayStart);
			dayEnd.setHours(23, 59, 59, 999);

			const revenue = await db
				.select({ total: sql<number>`COALESCE(SUM(${booking.totalCost}), 0)` })
				.from(booking)
				.where(
					and(
						eq(booking.status, 'confirmed'),
						gte(booking.createdAt, dayStart),
						lte(booking.createdAt, dayEnd)
					)
				);

			const bookingCount = await db
				.select({ count: count() })
				.from(booking)
				.where(
					and(
						gte(booking.createdAt, dayStart),
						lte(booking.createdAt, dayEnd)
					)
				);

			results.push({
				date: dayStart.toISOString().slice(0, 10),
				revenue: Number(revenue[0]?.total || 0),
				bookings: bookingCount[0].count
			});
		}

		return results;
	}

	async getOccupancyRate() {
		const totalRooms = await db.select({ count: count() }).from(room);
		const todayStart = new Date();
		todayStart.setHours(0, 0, 0, 0);
		const todayEnd = new Date();
		todayEnd.setHours(23, 59, 59, 999);

		const bookedRooms = await db
			.select({ roomId: booking.roomId })
			.from(booking)
			.where(
				and(
					gte(booking.startTime, todayStart),
					lte(booking.startTime, todayEnd),
					sql`${booking.status} != 'cancelled'`
				)
			)
			.groupBy(booking.roomId);

		const total = totalRooms[0].count || 1;
		const occupied = bookedRooms.length;

		return {
			total,
			occupied,
			rate: Math.round((occupied / total) * 100)
		};
	}
}

export const dashboardService = new DashboardService();
