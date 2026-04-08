import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { auth } from '$lib/server/auth';

export async function createContext(event: RequestEvent) {
	return {
		event,
		db,
		user: event.locals.user || null,
		session: event.locals.session || null
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
