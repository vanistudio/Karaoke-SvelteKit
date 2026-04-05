import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '$lib/server/routes/app.router';

let browserClient: ReturnType<typeof createTRPCProxyClient<AppRouter>>;

export function trpc(fetchFn?: typeof fetch) {
	const isBrowser = typeof window !== 'undefined';
	if (isBrowser && browserClient) return browserClient;

	const client = createTRPCProxyClient<AppRouter>({
		links: [
			httpBatchLink({
				url: '/api/trpc',
				fetch: fetchFn || (isBrowser ? window.fetch : fetch)
			})
		]
	});

	if (isBrowser) browserClient = client;
	return client;
}
