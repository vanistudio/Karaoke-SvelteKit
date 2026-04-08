import { betterAuth } from 'better-auth/minimal';
import { admin } from 'better-auth/plugins/admin';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';

export const auth = betterAuth({
	baseURL: env.APP_ORIGIN_URL,
	secret: env.APP_BETTER_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: { enabled: true },
	plugins: [
		admin(),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});
