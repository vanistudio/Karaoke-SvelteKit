import { db } from '$lib/server/db';
import { promotion } from '$lib/server/db/schema';
import { and, eq, count, sql } from 'drizzle-orm';

export class PromotionRepository {
	async findAll(executor: any = db) {
		return await executor.select().from(promotion);
	}

	async findById(id: number, executor: any = db) {
		const result = await executor.select().from(promotion).where(eq(promotion.id, id));
		return result[0];
	}

	async findByCode(code: string, executor: any = db) {
		const result = await executor.select().from(promotion).where(eq(promotion.code, code));
		return result[0];
	}

	async create(data: typeof promotion.$inferInsert, executor: any = db) {
		const result = await executor.insert(promotion).values(data).returning();
		return result[0];
	}

	async update(id: number, data: Partial<typeof promotion.$inferInsert>, executor: any = db) {
		const result = await executor
			.update(promotion)
			.set(data)
			.where(eq(promotion.id, id))
			.returning();
		return result[0];
	}

	async delete(id: number, executor: any = db) {
		const result = await executor.delete(promotion).where(eq(promotion.id, id)).returning();
		return result[0];
	}

	async count(executor: any = db) {
		const result = await executor.select({ count: count() }).from(promotion);
		return result[0].count;
	}

	async incrementUsage(id: number, executor: any = db) {
		const result = await executor
			.update(promotion)
			.set({ currentUsage: sql`${promotion.currentUsage} + 1` })
			.where(and(eq(promotion.id, id), sql`${promotion.currentUsage} < ${promotion.maxUsage}`))
			.returning();
		return result[0];
	}

	async decrementUsage(id: number, executor: any = db) {
		const result = await executor
			.update(promotion)
			.set({ currentUsage: sql`GREATEST(${promotion.currentUsage} - 1, 0)` })
			.where(eq(promotion.id, id))
			.returning();
		return result[0];
	}
}

export const promotionRepository = new PromotionRepository();
