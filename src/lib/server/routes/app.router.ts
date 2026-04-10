import { router, publicProcedure } from '$lib/server/trpc/t';
import { roomRouter } from './room.router';
import { bookingRouter } from './booking.router';
import { serviceRouter } from './service.router';
import { dashboardRouter } from './dashboard.router';
import { promotionRouter } from './promotion.router';
import { loyaltyRouter } from './loyalty.router';

export const appRouter = router({
	healthcheck: publicProcedure.query(() => 'TRPC System is ready'),
	room: roomRouter,
	booking: bookingRouter,
	service: serviceRouter,
	dashboard: dashboardRouter,
	promotion: promotionRouter,
	loyalty: loyaltyRouter
});

export type AppRouter = typeof appRouter;
