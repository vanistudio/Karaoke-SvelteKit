import { router, publicProcedure, protectedProcedure, managerProcedure } from '$lib/server/trpc/t';
import { z } from 'zod';
import { reviewService } from '$lib/server/services/review.service';

export const reviewRouter = router({
	create: protectedProcedure
		.input(
			z.object({
				bookingId: z.number(),
				roomId: z.number(),
				rating: z.number().min(1).max(5),
				comment: z.string().optional()
			})
		)
		.mutation(async ({ input, ctx }) => {
			return await reviewService.create({
				userId: ctx.user.id,
				bookingId: input.bookingId,
				roomId: input.roomId,
				rating: input.rating,
				comment: input.comment
			});
		}),
	listByRoom: publicProcedure
		.input(z.number())
		.query(async ({ input }) => {
			return await reviewService.getByRoom(input);
		}),
	roomStats: publicProcedure
		.input(z.number())
		.query(async ({ input }) => {
			return await reviewService.getRoomStats(input);
		}),
	allRoomStats: publicProcedure.query(async () => {
		return await reviewService.getAllRoomStats();
	}),
	list: managerProcedure
		.input(
			z.object({
				page: z.number().min(1).optional().default(1),
				limit: z.number().min(1).max(50).optional().default(20)
			}).optional().default({ page: 1, limit: 20 })
		)
		.query(async ({ input }) => {
			return await reviewService.getAll(input);
		}),
	overallStats: managerProcedure.query(async () => {
		return await reviewService.getOverallStats();
	})
});
