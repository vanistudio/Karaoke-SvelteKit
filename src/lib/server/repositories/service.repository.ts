import { db } from '$lib/server/db';
import { service } from '$lib/server/db/schema';
import { eq, count } from 'drizzle-orm';

export class ServiceRepository {
	async findAll() {
		return await db.select().from(service);
	}

	async findById(id: number) {
		const result = await db.select().from(service).where(eq(service.id, id));
		return result[0];
	}

	async create(data: typeof service.$inferInsert) {
		const result = await db.insert(service).values(data).returning();
		return result[0];
	}

	async update(id: number, data: Partial<typeof service.$inferInsert>) {
		const result = await db.update(service).set(data).where(eq(service.id, id)).returning();
		return result[0];
	}

	async delete(id: number) {
		const result = await db.delete(service).where(eq(service.id, id)).returning();
		return result[0];
	}

	async count() {
		const result = await db.select({ count: count() }).from(service);
		return result[0].count;
	}
}

export const serviceRepository = new ServiceRepository();
