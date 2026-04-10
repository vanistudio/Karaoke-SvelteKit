import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const service = pgTable('service', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	category: text('category').notNull(),
	price: integer('price').notNull(),
	description: text('description'),
	imageUrl: text('image_url'),
	isAvailable: boolean('is_available').default(true).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});
