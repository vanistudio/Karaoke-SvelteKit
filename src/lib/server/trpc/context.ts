import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { auth } from '$lib/server/auth';

export async function createContext(event: RequestEvent) {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	return {
		event,
		db,
		user: session?.user || null,
		session: session?.session || null
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
