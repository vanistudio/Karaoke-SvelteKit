import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';

export const room = pgTable('room', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	capacity: integer('capacity').notNull(),
	type: text('type').notNull(),
	pricePerHour: integer('price_per_hour').notNull().default(100000)
});
