import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './user.schema';
import { booking } from './booking.schema';

export const pointHistory = pgTable('point_history', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	bookingId: integer('booking_id').references(() => booking.id, { onDelete: 'set null' }),
	amount: integer('amount').notNull(),
	type: text('type').notNull(), // 'reward', 'redeem', 'admin_adjustment'
	description: text('description').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});
