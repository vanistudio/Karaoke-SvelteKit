import { router, adminProcedure } from '$lib/server/trpc/t';
import { z } from 'zod';
import { userService } from '$lib/server/services/user.service';
import { activityService } from '$lib/server/services/activity.service';

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
				role: z.enum(['admin', 'manager', 'staff', 'user', 'banned'])
			})
		)
		.mutation(async ({ input, ctx }) => {
			const updated = await userService.updateRole(input.id, input.role);
			await activityService.log(ctx.user.id, 'update', 'user', input.id, `Đổi quyền thành ${input.role}`);
			return updated;
		}),
	ban: adminProcedure
		.input(z.string())
		.mutation(async ({ input, ctx }) => {
			const banned = await userService.banUser(input);
			await activityService.log(ctx.user.id, 'status_change', 'user', input, 'Khóa tài khoản');
			return banned;
		}),
	unban: adminProcedure
		.input(z.string())
		.mutation(async ({ input, ctx }) => {
			const unbanned = await userService.unbanUser(input);
			await activityService.log(ctx.user.id, 'status_change', 'user', input, 'Mở khóa tài khoản');
			return unbanned;
		})
});
