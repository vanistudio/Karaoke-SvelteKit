import { db } from '$lib/server/db';
import { promotion } from '$lib/server/db/schema';
import { eq, count, sql } from 'drizzle-orm';

export class PromotionRepository {
	async findAll() {
		return await db.select().from(promotion);
	}

	async findById(id: number) {
		const result = await db.select().from(promotion).where(eq(promotion.id, id));
		return result[0];
	}

	async findByCode(code: string) {
		const result = await db.select().from(promotion).where(eq(promotion.code, code));
		return result[0];
	}

	async create(data: typeof promotion.$inferInsert) {
		const result = await db.insert(promotion).values(data).returning();
		return result[0];
	}

	async update(id: number, data: Partial<typeof promotion.$inferInsert>) {
		const result = await db.update(promotion).set(data).where(eq(promotion.id, id)).returning();
		return result[0];
	}

	async delete(id: number) {
		const result = await db.delete(promotion).where(eq(promotion.id, id)).returning();
		return result[0];
	}

	async count() {
		const result = await db.select({ count: count() }).from(promotion);
		return result[0].count;
	}

	async incrementUsage(id: number) {
		const promo = await this.findById(id);
		if (!promo) return null;
		const result = await db
			.update(promotion)
			.set({ currentUsage: sql`${promotion.currentUsage} + 1` })
			.where(eq(promotion.id, id))
			.returning();
		return result[0];
	}

	async decrementUsage(id: number) {
		const promo = await this.findById(id);
		if (!promo || promo.currentUsage <= 0) return null;
		const result = await db
			.update(promotion)
			.set({ currentUsage: sql`GREATEST(${promotion.currentUsage} - 1, 0)` })
			.where(eq(promotion.id, id))
			.returning();
		return result[0];
	}
}

export const promotionRepository = new PromotionRepository();
