import { db } from '$lib/server/db';
import { activityLog } from '$lib/server/db/schema';
import { sql, count } from 'drizzle-orm';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export class ActivityService {
	async log(userId: string | null, action: string, entity: string, entityId?: string | number, details?: string) {
		await db.insert(activityLog).values({
			userId,
			action,
			entity,
			entityId: entityId?.toString() ?? null,
			details: details ?? null
		});
	}

	async getAll(params: { page?: number; limit?: number; entity?: string } = {}) {
		const { page = 1, limit = 20, entity } = params;
		const offset = (page - 1) * limit;

		let query = db
			.select({
				id: activityLog.id,
				userId: activityLog.userId,
				action: activityLog.action,
				entity: activityLog.entity,
				entityId: activityLog.entityId,
				details: activityLog.details,
				createdAt: activityLog.createdAt,
				userName: user.name,
				userEmail: user.email
			})
			.from(activityLog)
			.leftJoin(user, eq(activityLog.userId, user.id))
			.$dynamic();

		if (entity) {
			query = query.where(eq(activityLog.entity, entity));
		}

		const data = await query.orderBy(sql`${activityLog.createdAt} DESC`).limit(limit).offset(offset);

		let countQuery = db.select({ count: count() }).from(activityLog).$dynamic();
		if (entity) {
			countQuery = countQuery.where(eq(activityLog.entity, entity));
		}
		const total = await countQuery.then(res => res[0].count);

		return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
	}
}

export const activityService = new ActivityService();
