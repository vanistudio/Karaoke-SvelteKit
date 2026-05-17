import { router, adminProcedure } from '$lib/server/trpc/t';
import { z } from 'zod';
import { userService } from '$lib/server/services/user.service';

export const userRouter = router({
	list: adminProcedure
		.input(
			z.object({
				page: z.number().min(1).optional().default(1),
				limit: z.number().min(1).max(50).optional().default(10),
				search: z.string().optional(),
				role: z.string().optional(),
				tier: z.string().optional()
			}).optional().default({ page: 1, limit: 10 })
		)
		.query(async ({ input }) => {
			return await userService.listUsers(input);
		}),
	getById: adminProcedure
		.input(z.string())
		.query(async ({ input }) => {
			return await userService.getUser(input);
		}),
	updateRole: adminProcedure
		.input(
			z.object({
				id: z.string(),
				role: z.enum(['admin', 'user', 'banned'])
			})
		)
		.mutation(async ({ input }) => {
			return await userService.updateRole(input.id, input.role);
		}),
	ban: adminProcedure
		.input(z.string())
		.mutation(async ({ input }) => {
			return await userService.banUser(input);
		}),
	unban: adminProcedure
		.input(z.string())
		.mutation(async ({ input }) => {
			return await userService.unbanUser(input);
		})
});
