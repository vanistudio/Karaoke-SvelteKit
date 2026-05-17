import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { user } from './user.schema';
import { booking } from './booking.schema';
import { room } from './room.schema';

export const review = pgTable('review', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	bookingId: integer('booking_id').notNull().references(() => booking.id, { onDelete: 'cascade' }),
	roomId: integer('room_id').notNull().references(() => room.id, { onDelete: 'cascade' }),
	rating: integer('rating').notNull(),
	comment: text('comment'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});
