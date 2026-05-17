import { TRPCError } from '@trpc/server';

const store = new Map<string, { count: number; resetAt: number }>();

const CLEANUP_INTERVAL = 60_000;
setInterval(() => {
	const now = Date.now();
	for (const [key, entry] of store) {
		if (entry.resetAt <= now) store.delete(key);
	}
}, CLEANUP_INTERVAL);

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): void {
	const now = Date.now();
	const entry = store.get(key);

	if (!entry || entry.resetAt <= now) {
		store.set(key, { count: 1, resetAt: now + windowMs });
		return;
	}

	if (entry.count >= maxRequests) {
		const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
		throw new TRPCError({
			code: 'TOO_MANY_REQUESTS',
			message: `Quá nhiều yêu cầu. Vui lòng thử lại sau ${retryAfter} giây.`
		});
	}

	entry.count++;
}
