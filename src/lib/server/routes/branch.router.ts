import { router, adminProcedure, publicProcedure } from '$lib/server/trpc/t';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { branch } from '$lib/server/db/schema';
import { eq, count } from 'drizzle-orm';
import { activityService } from '$lib/server/services/activity.service';

export const branchRouter = router({
	list: publicProcedure.query(async () => {
		return await db.select().from(branch).where(eq(branch.isActive, true));
	}),
	listAll: adminProcedure.query(async () => {
		return await db.select().from(branch);
	}),
	create: adminProcedure
		.input(
			z.object({
				name: z.string().min(1),
				address: z.string().min(1),
				phone: z.string().min(1),
				isActive: z.boolean().optional().default(true)
			})
		)
		.mutation(async ({ input, ctx }) => {
			const created = await db
				.insert(branch)
				.values(input)
				.returning()
				.then((res) => res[0]);
			await activityService.log(
				ctx.user.id,
				'create',
				'branch',
				created.id,
				`Tạo chi nhánh ${created.name}`
			);
			return created;
		}),
	update: adminProcedure
		.input(
			z.object({
				id: z.number(),
				name: z.string().min(1).optional(),
				address: z.string().min(1).optional(),
				phone: z.string().min(1).optional(),
				isActive: z.boolean().optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { id, ...data } = input;
			const updated = await db
				.update(branch)
				.set(data)
				.where(eq(branch.id, id))
				.returning()
				.then((res) => res[0]);
			await activityService.log(ctx.user.id, 'update', 'branch', id, `Cập nhật chi nhánh #${id}`);
			return updated;
		}),
	delete: adminProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
		const deleted = await db.delete(branch).where(eq(branch.id, input));
		await activityService.log(ctx.user.id, 'delete', 'branch', input, `Xóa chi nhánh #${input}`);
		return deleted;
	}),
	count: adminProcedure.query(async () => {
		return await db
			.select({ count: count() })
			.from(branch)
			.then((res) => res[0].count);
	})
});
