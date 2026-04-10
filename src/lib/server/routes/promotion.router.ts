import { router, publicProcedure, protectedProcedure, adminProcedure } from '$lib/server/trpc/t';
import { z } from 'zod';
import { promotionController } from '$lib/server/controllers/promotion.controller';

export const promotionRouter = router({
	list: adminProcedure.query(async () => {
		return await promotionController.listPromotions();
	}),
	getById: adminProcedure.input(z.number()).query(async ({ input }) => {
		return await promotionController.getPromotion(input);
	}),
	count: adminProcedure.query(async () => {
		return await promotionController.countPromotions();
	}),
	create: adminProcedure
		.input(
			z.object({
				code: z.string().min(1).transform(v => v.toUpperCase()),
				type: z.enum(['percent', 'fixed']),
				value: z.number().positive(),
				minOrderAmount: z.number().min(0).optional(),
				maxUsage: z.number().positive().optional(),
				expiresAt: z.string().datetime().or(z.date()).nullable().optional(),
				isActive: z.boolean().optional()
			})
		)
		.mutation(async ({ input }) => {
			return await promotionController.addPromotion({
				...input,
				expiresAt: input.expiresAt ? new Date(input.expiresAt) : null
			});
		}),
	update: adminProcedure
		.input(
			z.object({
				id: z.number(),
				code: z.string().min(1).transform(v => v.toUpperCase()).optional(),
				type: z.enum(['percent', 'fixed']).optional(),
				value: z.number().positive().optional(),
				minOrderAmount: z.number().min(0).optional(),
				maxUsage: z.number().positive().optional(),
				expiresAt: z.string().datetime().or(z.date()).nullable().optional(),
				isActive: z.boolean().optional()
			})
		)
		.mutation(async ({ input }) => {
			const { id, ...data } = input;
			return await promotionController.updatePromotion(id, {
				...data,
				expiresAt: data.expiresAt !== undefined ? (data.expiresAt ? new Date(data.expiresAt) : null) : undefined
			});
		}),
	delete: adminProcedure
		.input(z.number())
		.mutation(async ({ input }) => {
			return await promotionController.deletePromotion(input);
		}),
	validate: publicProcedure
		.input(z.object({ code: z.string().min(1), orderAmount: z.number().positive() }))
		.query(async ({ input }) => {
			return await promotionController.validateVoucher(input.code, input.orderAmount);
		}),
	apply: protectedProcedure
		.input(z.object({ code: z.string().min(1), orderAmount: z.number().positive() }))
		.mutation(async ({ input }) => {
			return await promotionController.applyVoucher(input.code, input.orderAmount);
		})
});
