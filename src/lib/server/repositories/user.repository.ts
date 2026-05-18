import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq, like, or, sql, count } from 'drizzle-orm';

export class UserRepository {
	async findAll(
		params: { page?: number; limit?: number; search?: string; role?: string; tier?: string } = {}
	) {
		const { page = 1, limit = 10, search, role, tier } = params;
		const offset = (page - 1) * limit;

		let query = db.select().from(user).$dynamic();

		const conditions = [];
		if (search) {
			conditions.push(or(like(user.name, `%${search}%`), like(user.email, `%${search}%`)));
		}
		if (role) conditions.push(eq(user.role, role));
		if (tier) conditions.push(eq(user.tier, tier));

		if (conditions.length > 0) {
			for (const cond of conditions) {
				if (cond) query = query.where(cond);
			}
		}

		const data = await query
			.orderBy(sql`${user.createdAt} DESC`)
			.limit(limit)
			.offset(offset);

		let countQuery = db.select({ count: count() }).from(user).$dynamic();
		if (conditions.length > 0) {
			for (const cond of conditions) {
				if (cond) countQuery = countQuery.where(cond);
			}
		}
		const total = await countQuery.then((res) => res[0].count);

		return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
	}

	async findById(id: string) {
		return await db
			.select()
			.from(user)
			.where(eq(user.id, id))
			.then((res) => res[0] ?? null);
	}

	async updateRole(id: string, role: string) {
		return await db
			.update(user)
			.set({ role })
			.where(eq(user.id, id))
			.returning()
			.then((res) => res[0]);
	}

	async updateBanStatus(id: string, banned: boolean) {
		return await db
			.update(user)
			.set({ role: banned ? 'banned' : 'user' })
			.where(eq(user.id, id))
			.returning()
			.then((res) => res[0]);
	}

	async count() {
		return await db
			.select({ count: count() })
			.from(user)
			.then((res) => res[0].count);
	}
}

export const userRepository = new UserRepository();
