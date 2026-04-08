import { router, publicProcedure } from '../trpc/t';
import { roomRouter } from './room.router';
import { bookingRouter } from './booking.router';

export const appRouter = router({
    healthcheck: publicProcedure.query(() => 'TRPC System is ready'),
    room: roomRouter,
    booking: bookingRouter
});

export type AppRouter = typeof appRouter;
