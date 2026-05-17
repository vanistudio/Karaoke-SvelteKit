import { router, adminProcedure } from '$lib/server/trpc/t';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { booking, room, user } from '$lib/server/db/schema';
import { and, gte, lte, sql, eq } from 'drizzle-orm';

export const calendarRouter = router({
	getDay: adminProcedure
		.input(z.string())
		.query(async ({ input }) => {
			const date = new Date(input);
			const dayStart = new Date(date);
			dayStart.setHours(0, 0, 0, 0);
			const dayEnd = new Date(date);
			dayEnd.setHours(23, 59, 59, 999);

			const rooms = await db.select().from(room).orderBy(room.name);

			const bookings = await db
				.select({
					id: booking.id,
					roomId: booking.roomId,
					startTime: booking.startTime,
					endTime: booking.endTime,
					status: booking.status,
					userName: user.name,
					totalCost: booking.totalCost
				})
				.from(booking)
				.leftJoin(user, eq(booking.userId, user.id))
				.where(
					and(
						lte(booking.startTime, dayEnd),
						gte(booking.endTime, dayStart),
						sql`${booking.status} != 'cancelled'`
					)
				);

			return { rooms, bookings };
		})
});
