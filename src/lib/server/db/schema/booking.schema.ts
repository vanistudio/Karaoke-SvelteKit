import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './user.schema';
import { room } from './room.schema';

export const booking = pgTable('booking', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	roomId: integer('room_id').notNull().references(() => room.id, { onDelete: 'cascade' }),
	startTime: timestamp('start_time').notNull(),
	endTime: timestamp('end_time').notNull(),
	guestCount: integer('guest_count'),
	status: text('status').notNull().default('pending'),
	totalCost: integer('total_cost'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});
