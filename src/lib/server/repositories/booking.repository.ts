import { db } from '$lib/server/db';
import { booking } from '$lib/server/db/schema';
import { eq, and, not, lt, gt } from 'drizzle-orm';

export class BookingRepository {
	async findAll() {
		return await db.select().from(booking);
	}

	async findById(id: number) {
		const result = await db.select().from(booking).where(eq(booking.id, id));
		return result[0];
	}

	async create(data: typeof booking.$inferInsert) {
		const result = await db.insert(booking).values(data).returning();
		return result[0];
	}

	async findOverlappingBookings(roomId: number, startTime: Date, endTime: Date) {
		return await db
			.select()
			.from(booking)
			.where(
				and(
					eq(booking.roomId, roomId),
					not(eq(booking.status, 'cancelled')),
					lt(booking.startTime, endTime),
					gt(booking.endTime, startTime)
				)
			);
	}

	async updateStatus(id: number, status: string) {
		const result = await db.update(booking).set({ status }).where(eq(booking.id, id)).returning();
		return result[0];
	}
}

export const bookingRepository = new BookingRepository();
