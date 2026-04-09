import { db } from '$lib/server/db';
import { room } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export class RoomRepository {
	async findAll() {
		return await db.select().from(room);
	}

	async findById(id: number) {
		const result = await db.select().from(room).where(eq(room.id, id));
		return result[0];
	}

	async create(data: typeof room.$inferInsert) {
		const result = await db.insert(room).values(data).returning();
		return result[0];
	}

	async update(id: number, data: Partial<typeof room.$inferInsert>) {
		const result = await db.update(room).set(data).where(eq(room.id, id)).returning();
		return result[0];
	}

	async delete(id: number) {
		const result = await db.delete(room).where(eq(room.id, id)).returning();
		return result[0];
	}

	async count() {
		const result = await db.select().from(room);
		return result.length;
	}
}

export const roomRepository = new RoomRepository();
