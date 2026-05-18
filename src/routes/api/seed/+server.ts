import { env } from '$env/dynamic/private';
import { seedDatabase } from '$lib/server/db/seed';
import type { RequestHandler } from './$types';

function canRunSeed() {
	return env.NODE_ENV !== 'production' && env.APP_ENABLE_SEED === 'true';
}

export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		return new Response('Forbidden', { status: 403 });
	}
	if (!canRunSeed()) {
		return new Response(
			JSON.stringify({
				success: false,
				message: 'Seed endpoint is disabled in this environment.'
			}),
			{
				status: 403,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}

	try {
		await seedDatabase();
		return new Response(JSON.stringify({ success: true, message: 'Seed hoàn tất!' }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error: any) {
		return new Response(JSON.stringify({ success: false, message: error?.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
