import { router, publicProcedure } from '../trpc/t';
import { roomRouter } from './room.router';

export const appRouter = router({
    healthcheck: publicProcedure.query(() => 'TRPC System is ready'),
    room: roomRouter,
});

export type AppRouter = typeof appRouter;
