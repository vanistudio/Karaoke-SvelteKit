import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';
import { checkRateLimit } from './rateLimit';

export const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.user) {
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be logged in to perform this action' });
	}
	return next({
		ctx: {
			...ctx,
			user: ctx.user
		}
	});
});

export const adminProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.user) {
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be logged in to perform this action' });
	}
	if (ctx.user.role !== 'admin') {
		throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have permission to perform this action' });
	}
	return next({
		ctx: {
			...ctx,
			user: ctx.user
		}
	});
});

export const rateLimitedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.user) {
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be logged in to perform this action' });
	}
	checkRateLimit(`user:${ctx.user.id}`, 5, 60_000);
	return next({
		ctx: {
			...ctx,
			user: ctx.user
		}
	});
});

