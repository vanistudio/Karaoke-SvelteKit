import { router, adminProcedure, publicProcedure } from '$lib/server/trpc/t';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { branch } from '$lib/server/db/schema';
import { eq, count } from 'drizzle-orm';

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
		.mutation(async ({ input }) => {
			return await db.insert(branch).values(input).returning().then(res => res[0]);
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
		.mutation(async ({ input }) => {
			const { id, ...data } = input;
			return await db.update(branch).set(data).where(eq(branch.id, id)).returning().then(res => res[0]);
		}),
	delete: adminProcedure
		.input(z.number())
		.mutation(async ({ input }) => {
			return await db.delete(branch).where(eq(branch.id, input));
		}),
	count: adminProcedure.query(async () => {
		return await db.select({ count: count() }).from(branch).then(res => res[0].count);
	})
});
