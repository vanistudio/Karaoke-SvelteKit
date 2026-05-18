import { betterAuth } from 'better-auth/minimal';
import { admin } from 'better-auth/plugins/admin';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { emailService } from '$lib/server/services/email.service';

export const auth = betterAuth({
	baseURL: env.APP_ORIGIN_URL?.replace(/\/+$/, ''),
	secret: env.APP_BETTER_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: { enabled: true },
	emailVerification: {
		sendOnSignUp: true,
		sendOnSignIn: false,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			await emailService.sendEmailVerification({
				email: user.email,
				name: user.name,
				verificationUrl: url
			});
		}
	},
	plugins: [admin(), sveltekitCookies(getRequestEvent)]
});
