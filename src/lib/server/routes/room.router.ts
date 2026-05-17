import { router, publicProcedure, adminProcedure, managerProcedure } from '$lib/server/trpc/t';
import { z } from 'zod';
import { roomController } from '$lib/server/controllers/room.controller';

export const roomRouter = router({
	list: publicProcedure.query(async () => {
		return await roomController.listRooms();
	}),
	getById: publicProcedure.input(z.number()).query(async ({ input }) => {
		return await roomController.getRoom(input);
	}),
	count: publicProcedure.query(async () => {
		return await roomController.countRooms();
	}),
	create: managerProcedure
		.input(
			z.object({
				name: z.string().min(1),
				capacity: z.number().positive(),
				type: z.enum(['standard', 'vip', 'super_vip']),
				pricePerHour: z.number().positive(),
				branchId: z.number().nullable().optional()
			})
		)
		.mutation(async ({ input }) => {
			return await roomController.addRoom(input);
		}),
	update: managerProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string().min(1).optional(),
				capacity: z.number().positive().optional(),
				type: z.enum(['standard', 'vip', 'super_vip']).optional(),
				pricePerHour: z.number().positive().optional(),
				branchId: z.number().nullable().optional()
			})
		)
		.mutation(async ({ input }) => {
			const { id, ...data } = input;
			return await roomController.updateRoom(id, data);
		}),
	delete: adminProcedure
		.input(z.number())
		.mutation(async ({ input }) => {
			return await roomController.deleteRoom(input);
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
