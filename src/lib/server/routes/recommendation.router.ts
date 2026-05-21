import { router, publicProcedure } from '$lib/server/trpc/t';
import { z } from 'zod';
import { recommendationService } from '$lib/server/services/recommendation.service';

export const recommendationRouter = router({
	alternativeRooms: publicProcedure
		.input(
			z.object({
				roomId: z.number(),
				startTime: z.string().datetime().or(z.date()),
				endTime: z.string().datetime().or(z.date())
			})
		)
		.query(async ({ input }) => {
			return await recommendationService.getAlternativeRooms(
				input.roomId,
				new Date(input.startTime),
				new Date(input.endTime)
			);
		}),
	popularServices: publicProcedure.input(z.string()).query(async ({ input }) => {
		return await recommendationService.getPopularServices(input);
	})
});
