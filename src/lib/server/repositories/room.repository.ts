import { db } from '../db';
import { room } from '../db/schema';
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
}

export const roomRepository = new RoomRepository();
