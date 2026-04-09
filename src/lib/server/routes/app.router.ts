import { router, publicProcedure } from '$lib/server/trpc/t';
import { roomRouter } from './room.router';
import { bookingRouter } from './booking.router';
import { serviceRouter } from './service.router';
import { dashboardRouter } from './dashboard.router';

export const appRouter = router({
	healthcheck: publicProcedure.query(() => 'TRPC System is ready'),
	room: roomRouter,
	booking: bookingRouter,
	service: serviceRouter,
	dashboard: dashboardRouter
});

export type AppRouter = typeof appRouter;
