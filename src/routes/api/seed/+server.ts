import type { RequestHandler } from './$types';
import { seedDatabase } from '$lib/server/db/seed';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'admin') {
		return new Response('Forbidden', { status: 403 });
	}

	try {
		await seedDatabase();
		return new Response(JSON.stringify({ success: true, message: 'Seed hoàn tất!' }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (e: any) {
		return new Response(JSON.stringify({ success: false, message: e?.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
