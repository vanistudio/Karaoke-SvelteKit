import { router, managerProcedure } from '$lib/server/trpc/t';
import { z } from 'zod';
import { dashboardService } from '$lib/server/services/dashboard.service';

export const dashboardRouter = router({
	stats: managerProcedure.query(async () => {
		return await dashboardService.getStats();
	}),
	recentBookings: managerProcedure.input(z.number().optional()).query(async ({ input }) => {
		return await dashboardService.getRecentBookings(input || 5);
	}),
	enrichedBookings: managerProcedure.query(async () => {
		return await dashboardService.getEnrichedBookings();
	}),
	revenueChart: managerProcedure
		.input(z.number().min(1).max(90).optional())
		.query(async ({ input }) => {
			return await dashboardService.getRevenueChart(input || 7);
		}),
	occupancy: managerProcedure.query(async () => {
		return await dashboardService.getOccupancyRate();
	}),
	heatmap: managerProcedure.query(async () => {
		return await dashboardService.getHeatmapData();
	}),
	topRooms: managerProcedure.query(async () => {
		return await dashboardService.getTopRooms(5);
	}),
	topCustomers: managerProcedure.query(async () => {
		return await dashboardService.getTopCustomers(5);
	})
});
