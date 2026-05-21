import { router, publicProcedure, adminProcedure, managerProcedure } from '$lib/server/trpc/t';
import { z } from 'zod';
import { roomController } from '$lib/server/controllers/room.controller';
import { activityService } from '$lib/server/services/activity.service';

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
		.mutation(async ({ input, ctx }) => {
			const created = await roomController.addRoom(input);
			await activityService.log(
				ctx.user.id,
				'create',
				'room',
				created.id,
				`Tạo phòng ${created.name}`
			);
			return created;
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
		.mutation(async ({ input, ctx }) => {
			const { id, ...data } = input;
			const updated = await roomController.updateRoom(id, data);
			await activityService.log(ctx.user.id, 'update', 'room', id, `Cập nhật phòng #${id}`);
			return updated;
		}),
	delete: adminProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
		const deleted = await roomController.deleteRoom(input);
		await activityService.log(ctx.user.id, 'delete', 'room', input, `Xóa phòng #${input}`);
		return deleted;
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
