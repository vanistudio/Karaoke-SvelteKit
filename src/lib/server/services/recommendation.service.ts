import { db } from '$lib/server/db';
import { room, booking, service } from '$lib/server/db/schema';
import { eq, and, sql, ne, count } from 'drizzle-orm';
import { bookingRepository } from '$lib/server/repositories/booking.repository';

export class RecommendationService {
	async getAlternativeRooms(roomId: number, startTime: Date, endTime: Date) {
		const currentRoom = await db
			.select()
			.from(room)
			.where(eq(room.id, roomId))
			.then((res) => res[0]);
		if (!currentRoom) return [];

		const allRooms = await db.select().from(room).where(ne(room.id, roomId));

		const available = [];
		for (const r of allRooms) {
			const overlaps = await bookingRepository.findOverlappingBookings(r.id, startTime, endTime);
			if (overlaps.length === 0) {
				available.push({
					...r,
					priceDiff: r.pricePerHour - currentRoom.pricePerHour
				});
			}
		}

		return available.sort((a, b) => Math.abs(a.priceDiff) - Math.abs(b.priceDiff)).slice(0, 3);
	}

	async getPopularServices(roomType: string) {
		const results = await db
			.select({
				serviceId: sql<number>`bs.service_id`,
				serviceName: service.name,
				servicePrice: service.price,
				serviceCategory: service.category,
				orderCount: count()
			})
			.from(sql`booking_service bs`)
			.innerJoin(service, eq(service.id, sql`bs.service_id`))
			.innerJoin(booking, eq(booking.id, sql`bs.booking_id`))
			.innerJoin(room, eq(room.id, booking.roomId))
			.where(and(eq(room.type, roomType), eq(service.isAvailable, true)))
			.groupBy(sql`bs.service_id`, service.name, service.price, service.category)
			.orderBy(sql`count(*) DESC`)
			.limit(5);

		return results;
	}
}

export const recommendationService = new RecommendationService();
