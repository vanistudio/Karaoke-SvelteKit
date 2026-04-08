import { router, publicProcedure } from '$lib/server/trpc/t';
import { z } from 'zod';
import { roomController } from '$lib/server/controllers/room.controller';

export const roomRouter = router({
	list: publicProcedure.query(async () => {
		return await roomController.listRooms();
	}),
	getById: publicProcedure.input(z.number()).query(async ({ input }) => {
		return await roomController.getRoom(input);
	}),
	create: publicProcedure
		.input(
			z.object({
				name: z.string().min(1),
				capacity: z.number().positive(),
				type: z.enum(['standard', 'vip']),
				pricePerHour: z.number().positive()
			})
		)
		.mutation(async ({ input }) => {
			return await roomController.addRoom(input);
		}),
	findAvailable: publicProcedure
		.input(
			z.object({
				startTime: z.string().datetime().or(z.date()),
				endTime: z.string().datetime().or(z.date()),
				minCapacity: z.number().positive().optional()
			})
		)
		.query(async ({ input }) => {
			const start = new Date(input.startTime);
			const end = new Date(input.endTime);
			return await roomController.findAvailableRooms(start, end, input.minCapacity);
		})
});
