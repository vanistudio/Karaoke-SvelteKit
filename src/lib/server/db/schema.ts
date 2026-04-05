import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';
import { relations } from 'drizzle-orm';

export const task = pgTable('task', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const room = pgTable('room', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	capacity: integer('capacity').notNull(),
	type: text('type').notNull(),
	pricePerHour: integer('price_per_hour').notNull().default(100000)
});

export const booking = pgTable('booking', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	roomId: integer('room_id').notNull().references(() => room.id, { onDelete: 'cascade' }),
	startTime: timestamp('start_time').notNull(),
	endTime: timestamp('end_time').notNull(),
	status: text('status').notNull().default('pending'),
	totalCost: integer('total_cost'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const roomRelations = relations(room, ({ many }) => ({
	bookings: many(booking)
}));

export const bookingRelations = relations(booking, ({ one }) => ({
	room: one(room, {
		fields: [booking.roomId],
		references: [room.id]
	}),
	user: one(user, {
		fields: [booking.userId],
		references: [user.id]
	})
}));

export * from './auth.schema';
