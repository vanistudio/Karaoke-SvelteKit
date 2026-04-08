import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ parent }) => {
	const data = await parent();
	if (!data.session) {
		throw redirect(302, '/login');
	}
	if (data.user?.role !== 'admin') {
		throw redirect(302, '/');
	}
	return data;
};
