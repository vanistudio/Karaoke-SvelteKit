import { db } from '$lib/server/db';
import { setting } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export class SettingRepository {
	async findAll() {
		return await db.select().from(setting);
	}

	async findByGroup(group: string) {
		return await db.select().from(setting).where(eq(setting.group, group));
	}

	async findByKey(key: string) {
		return await db.select().from(setting).where(eq(setting.key, key)).then(res => res[0] ?? null);
	}

	async upsert(key: string, value: string, group: string) {
		const existing = await this.findByKey(key);
		if (existing) {
			await db.update(setting).set({ value, updatedAt: new Date() }).where(eq(setting.key, key));
		} else {
			await db.insert(setting).values({ key, value, group, updatedAt: new Date() });
		}
		return { key, value, group };
	}

	async upsertMany(entries: { key: string; value: string; group: string }[]) {
		for (const entry of entries) {
			await this.upsert(entry.key, entry.value, entry.group);
		}
	}

	async delete(key: string) {
		return await db.delete(setting).where(eq(setting.key, key));
	}
}

export const settingRepository = new SettingRepository();
