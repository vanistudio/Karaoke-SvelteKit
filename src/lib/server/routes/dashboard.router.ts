import { router, adminProcedure } from '$lib/server/trpc/t';
import { z } from 'zod';
import { dashboardService } from '$lib/server/services/dashboard.service';

export const dashboardRouter = router({
	stats: adminProcedure.query(async () => {
		return await dashboardService.getStats();
	}),
	recentBookings: adminProcedure
		.input(z.number().optional())
		.query(async ({ input }) => {
			return await dashboardService.getRecentBookings(input || 5);
		}),
	enrichedBookings: adminProcedure.query(async () => {
		return await dashboardService.getEnrichedBookings();
	}),
	revenueChart: adminProcedure
		.input(z.number().min(1).max(90).optional())
		.query(async ({ input }) => {
			return await dashboardService.getRevenueChart(input || 7);
		}),
	occupancy: adminProcedure.query(async () => {
		return await dashboardService.getOccupancyRate();
	}),
	heatmap: adminProcedure.query(async () => {
		return await dashboardService.getHeatmapData();
	})
});
