import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';
import { checkRateLimit } from './rateLimit';
import { hasPermission, type Permission } from '$lib/server/config/permissions';

export const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.user) {
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Bạn cần đăng nhập để thực hiện thao tác này' });
	}
	if (ctx.user.role === 'banned') {
		throw new TRPCError({ code: 'FORBIDDEN', message: 'Tài khoản của bạn đã bị khóa' });
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
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Bạn cần đăng nhập để thực hiện thao tác này' });
	}
	if (ctx.user.role !== 'admin') {
		throw new TRPCError({ code: 'FORBIDDEN', message: 'Bạn không có quyền thực hiện thao tác này' });
	}
	return next({
		ctx: {
			...ctx,
			user: ctx.user
		}
	});
});

export const staffProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.user) {
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Bạn cần đăng nhập để thực hiện thao tác này' });
	}
	const allowedRoles = ['admin', 'manager', 'staff'];
	if (!allowedRoles.includes(ctx.user.role)) {
		throw new TRPCError({ code: 'FORBIDDEN', message: 'Chỉ nhân viên trở lên mới có quyền truy cập' });
	}
	return next({
		ctx: {
			...ctx,
			user: ctx.user
		}
	});
});

export const managerProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.user) {
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Bạn cần đăng nhập để thực hiện thao tác này' });
	}
	const allowedRoles = ['admin', 'manager'];
	if (!allowedRoles.includes(ctx.user.role)) {
		throw new TRPCError({ code: 'FORBIDDEN', message: 'Chỉ quản lý trở lên mới có quyền truy cập' });
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
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Bạn cần đăng nhập để thực hiện thao tác này' });
	}
	if (ctx.user.role === 'banned') {
		throw new TRPCError({ code: 'FORBIDDEN', message: 'Tài khoản của bạn đã bị khóa' });
	}
	checkRateLimit(`user:${ctx.user.id}`, 5, 60_000);
	return next({
		ctx: {
			...ctx,
			user: ctx.user
		}
	});
});

export function permissionProcedure(permission: Permission) {
	return t.procedure.use(({ ctx, next }) => {
		if (!ctx.user) {
			throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Bạn cần đăng nhập để thực hiện thao tác này' });
		}
		if (!hasPermission(ctx.user.role, permission)) {
			throw new TRPCError({ code: 'FORBIDDEN', message: `Bạn không có quyền: ${permission}` });
		}
		return next({
			ctx: {
				...ctx,
				user: ctx.user
			}
		});
	});
}
