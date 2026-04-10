import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const promotion = pgTable('promotion', {
	id: serial('id').primaryKey(),
	code: text('code').notNull().unique(),
	type: text('type').notNull(),
	value: integer('value').notNull(),
	minOrderAmount: integer('min_order_amount').default(0).notNull(),
	maxUsage: integer('max_usage').default(100).notNull(),
	currentUsage: integer('current_usage').default(0).notNull(),
	expiresAt: timestamp('expires_at'),
	isActive: boolean('is_active').default(true).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});
