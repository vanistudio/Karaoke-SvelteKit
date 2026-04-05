import { router, publicProcedure } from '../trpc/t';
import { z } from 'zod';
import { roomController } from '../controllers/room.controller';

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
		})
});
