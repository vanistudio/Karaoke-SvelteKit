import { db } from '$lib/server/db';
import { booking, bookingServiceItem } from '$lib/server/db/schema';
import { eq, and, not, lt, gt, or } from 'drizzle-orm';

export class BookingRepository {
	async findAll(executor: any = db) {
		return await executor.select().from(booking);
	}

	async findById(id: number, executor: any = db) {
		const result = await executor.select().from(booking).where(eq(booking.id, id));
		return result[0];
	}

	async findByUserId(userId: string, executor: any = db) {
		return await executor.select().from(booking).where(eq(booking.userId, userId));
	}

	async findActiveByRoomId(roomId: number, executor: any = db) {
		return await executor
			.select()
			.from(booking)
			.where(
				and(
					eq(booking.roomId, roomId),
					or(eq(booking.status, 'pending'), eq(booking.status, 'confirmed'))
				)
			);
	}

	async create(data: typeof booking.$inferInsert, executor: any = db) {
		const result = await executor.insert(booking).values(data).returning();
		return result[0];
	}

	async findOverlappingBookings(
		roomId: number,
		startTime: Date,
		endTime: Date,
		executor: any = db
	) {
		return await executor
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

	async updateStatus(id: number, status: string, executor: any = db) {
		const result = await executor
			.update(booking)
			.set({ status })
			.where(eq(booking.id, id))
			.returning();
		return result[0];
	}

	async createServiceItem(data: typeof bookingServiceItem.$inferInsert, executor: any = db) {
		const result = await executor.insert(bookingServiceItem).values(data).returning();
		return result[0];
	}
}

export const bookingRepository = new BookingRepository();
