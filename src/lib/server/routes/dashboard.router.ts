import { router, protectedProcedure } from '$lib/server/trpc/t';
import { z } from 'zod';
import { dashboardService } from '$lib/server/services/dashboard.service';

export const dashboardRouter = router({
	stats: protectedProcedure.query(async () => {
		return await dashboardService.getStats();
	}),
	recentBookings: protectedProcedure
		.input(z.number().optional())
		.query(async ({ input }) => {
			return await dashboardService.getRecentBookings(input || 5);
		}),
	enrichedBookings: protectedProcedure.query(async () => {
		return await dashboardService.getEnrichedBookings();
	})
});
