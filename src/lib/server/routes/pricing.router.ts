import { router, adminProcedure } from '$lib/server/trpc/t';
import { z } from 'zod';
import { pricingService } from '$lib/server/services/pricing.service';
import { activityService } from '$lib/server/services/activity.service';

export const pricingRouter = router({
	list: adminProcedure.query(async () => {
		return await pricingService.getAllRules();
	}),
	getById: adminProcedure.input(z.number()).query(async ({ input }) => {
		return await pricingService.getRule(input);
	}),
	create: adminProcedure
		.input(
			z.object({
				name: z.string().min(1),
				type: z.enum(['holiday', 'time_block']),
				startTime: z.string().nullable().optional(),
				endTime: z.string().nullable().optional(),
				date: z.string().nullable().optional(),
				daysOfWeek: z.array(z.number()).nullable().optional(),
				multiplier: z.number().min(0.1).max(10),
				isActive: z.boolean().optional().default(true)
			})
		)
		.mutation(async ({ input, ctx }) => {
			const created = await pricingService.createRule(input);
			await activityService.log(
				ctx.user.id,
				'create',
				'pricing',
				created.id,
				`Tạo rule giá ${created.name}`
			);
			return created;
		}),
	update: adminProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string().min(1).optional(),
				type: z.enum(['holiday', 'time_block']).optional(),
				startTime: z.string().nullable().optional(),
				endTime: z.string().nullable().optional(),
				date: z.string().nullable().optional(),
				daysOfWeek: z.array(z.number()).nullable().optional(),
				multiplier: z.number().min(0.1).max(10).optional(),
				isActive: z.boolean().optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { id, ...data } = input;
			const updated = await pricingService.updateRule(id, data);
			await activityService.log(ctx.user.id, 'update', 'pricing', id, `Cập nhật rule giá #${id}`);
			return updated;
		}),
	delete: adminProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
		const deleted = await pricingService.deleteRule(input);
		await activityService.log(ctx.user.id, 'delete', 'pricing', input, `Xóa rule giá #${input}`);
		return deleted;
	})
});
