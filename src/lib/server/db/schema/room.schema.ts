import { pgTable, serial, text, integer } from 'drizzle-orm/pg-core';
import { branch } from './branch.schema';

export const room = pgTable('room', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	capacity: integer('capacity').notNull(),
	type: text('type').notNull(),
	pricePerHour: integer('price_per_hour').notNull().default(100000),
	branchId: integer('branch_id').references(() => branch.id, { onDelete: 'set null' })
});
