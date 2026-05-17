import { router, publicProcedure, adminProcedure, managerProcedure } from '$lib/server/trpc/t';
import { z } from 'zod';
import { serviceController } from '$lib/server/controllers/service.controller';
import { activityService } from '$lib/server/services/activity.service';

export const serviceRouter = router({
	list: publicProcedure.query(async () => {
		return await serviceController.listServices();
	}),
	getById: publicProcedure.input(z.number()).query(async ({ input }) => {
		return await serviceController.getService(input);
	}),
	count: adminProcedure.query(async () => {
		return await serviceController.countServices();
	}),
	create: managerProcedure
		.input(
			z.object({
				name: z.string().min(1),
				category: z.enum(['food', 'drink', 'decoration', 'other']),
				price: z.number().positive(),
				description: z.string().optional(),
				imageUrl: z.string().optional(),
				isAvailable: z.boolean().optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const created = await serviceController.addService(input);
			await activityService.log(ctx.user.id, 'create', 'service', created.id, `Tạo dịch vụ ${created.name}`);
			return created;
		}),
	update: managerProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string().min(1).optional(),
				category: z.enum(['food', 'drink', 'decoration', 'other']).optional(),
				price: z.number().positive().optional(),
				description: z.string().optional(),
				imageUrl: z.string().optional(),
				isAvailable: z.boolean().optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { id, ...data } = input;
			const updated = await serviceController.updateService(id, data);
			await activityService.log(ctx.user.id, 'update', 'service', id, `Cập nhật dịch vụ #${id}`);
			return updated;
		}),
	delete: adminProcedure
		.input(z.number())
		.mutation(async ({ input, ctx }) => {
			const deleted = await serviceController.deleteService(input);
			await activityService.log(ctx.user.id, 'delete', 'service', input, `Xóa dịch vụ #${input}`);
			return deleted;
		})
});
