import { router, adminProcedure } from '$lib/server/trpc/t';
import { z } from 'zod';
import { activityService } from '$lib/server/services/activity.service';

export const activityRouter = router({
	list: adminProcedure
		.input(
			z
				.object({
					page: z.number().min(1).optional().default(1),
					limit: z.number().min(1).max(50).optional().default(20),
					entity: z.string().optional()
				})
				.optional()
				.default({ page: 1, limit: 20 })
		)
		.query(async ({ input }) => {
			return await activityService.getAll(input);
		})
});
