import { pgTable, serial, integer, timestamp } from 'drizzle-orm/pg-core';
import { booking } from './booking.schema';
import { service } from './service.schema';

export const bookingServiceItem = pgTable('booking_service_item', {
	id: serial('id').primaryKey(),
	bookingId: integer('booking_id').references(() => booking.id, { onDelete: 'cascade' }).notNull(),
	serviceId: integer('service_id').references(() => service.id, { onDelete: 'cascade' }).notNull(),
	quantity: integer('quantity').notNull().default(1),
	priceAtBooking: integer('price_at_booking').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});
