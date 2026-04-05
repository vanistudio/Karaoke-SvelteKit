import { router, publicProcedure } from '../trpc/t';
import { z } from 'zod';

export const appRouter = router({
    healthcheck: publicProcedure.query(() => 'TRPC System is ready'),
});

export type AppRouter = typeof appRouter;
