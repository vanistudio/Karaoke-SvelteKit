import { db } from '$lib/server/db';
import { pricingRule } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export class PricingRepository {
	async findAllActive() {
		return await db.select().from(pricingRule).where(eq(pricingRule.isActive, true));
	}

	async findAll() {
		return await db.select().from(pricingRule);
	}

	async findById(id: number) {
		const result = await db.select().from(pricingRule).where(eq(pricingRule.id, id));
		return result[0];
	}

	async create(data: typeof pricingRule.$inferInsert) {
		const result = await db.insert(pricingRule).values(data).returning();
		return result[0];
	}

	async update(id: number, data: Partial<typeof pricingRule.$inferInsert>) {
		const result = await db.update(pricingRule).set(data).where(eq(pricingRule.id, id)).returning();
		return result[0];
	}

	async delete(id: number) {
		const result = await db.delete(pricingRule).where(eq(pricingRule.id, id)).returning();
		return result[0];
	}
}

export const pricingRepository = new PricingRepository();
