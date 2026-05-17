import { pgTable, serial, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const branch = pgTable('branch', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	address: text('address').notNull(),
	phone: text('phone').notNull(),
	isActive: boolean('is_active').default(true).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});
