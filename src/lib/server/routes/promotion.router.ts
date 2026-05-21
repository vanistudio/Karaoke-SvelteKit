import {
	router,
	publicProcedure,
	protectedProcedure,
	adminProcedure,
	managerProcedure
} from '$lib/server/trpc/t';
import { z } from 'zod';
import { promotionController } from '$lib/server/controllers/promotion.controller';
import { db } from '$lib/server/db';
import { promotion } from '$lib/server/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { activityService } from '$lib/server/services/activity.service';

export const promotionRouter = router({
	list: managerProcedure.query(async () => {
		return await promotionController.listPromotions();
	}),
	listPublic: publicProcedure.query(async () => {
		const now = new Date();
		const results = await db
			.select()
			.from(promotion)
			.where(
				and(
					eq(promotion.isActive, true),
					eq(promotion.isPublic, true),
					sql`(${promotion.expiresAt} IS NULL OR ${promotion.expiresAt} > ${now})`,
					sql`${promotion.currentUsage} < ${promotion.maxUsage}`
				)
			);
		return results;
	}),
	getById: managerProcedure.input(z.number()).query(async ({ input }) => {
		return await promotionController.getPromotion(input);
	}),
	count: managerProcedure.query(async () => {
		return await promotionController.countPromotions();
	}),
	create: managerProcedure
		.input(
			z.object({
				code: z
					.string()
					.min(1)
					.transform((v) => v.toUpperCase()),
				type: z.enum(['percent', 'fixed']),
				value: z.number().positive(),
				minOrderAmount: z.number().min(0).optional(),
				maxUsage: z.number().positive().optional(),
				expiresAt: z.string().datetime().or(z.date()).nullable().optional(),
				isActive: z.boolean().optional(),
				isPublic: z.boolean().optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const created = await promotionController.addPromotion({
				...input,
				expiresAt: input.expiresAt ? new Date(input.expiresAt) : null
			});
			await activityService.log(
				ctx.user.id,
				'create',
				'promotion',
				created.id,
				`Tạo mã ${created.code}`
			);
			return created;
		}),
	update: adminProcedure
		.input(
			z.object({
				id: z.number(),
				code: z
					.string()
					.min(1)
					.transform((v) => v.toUpperCase())
					.optional(),
				type: z.enum(['percent', 'fixed']).optional(),
				value: z.number().positive().optional(),
				minOrderAmount: z.number().min(0).optional(),
				maxUsage: z.number().positive().optional(),
				expiresAt: z.string().datetime().or(z.date()).nullable().optional(),
				isActive: z.boolean().optional(),
				isPublic: z.boolean().optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { id, ...data } = input;
			const updated = await promotionController.updatePromotion(id, {
				...data,
				expiresAt:
					data.expiresAt !== undefined
						? data.expiresAt
							? new Date(data.expiresAt)
							: null
						: undefined
			});
			await activityService.log(
				ctx.user.id,
				'update',
				'promotion',
				id,
				`Cập nhật khuyến mãi #${id}`
			);
			return updated;
		}),
	delete: adminProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
		const deleted = await promotionController.deletePromotion(input);
		await activityService.log(
			ctx.user.id,
			'delete',
			'promotion',
			input,
			`Xóa khuyến mãi #${input}`
		);
		return deleted;
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
