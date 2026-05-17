import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const setting = pgTable('setting', {
	key: text('key').primaryKey(),
	value: text('value').notNull(),
	group: text('group').notNull().default('general'),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});
