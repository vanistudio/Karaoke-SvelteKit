import { relations } from 'drizzle-orm';
import { user } from './user.schema';
import { session } from './session.schema';
import { account } from './account.schema';
import { room } from './room.schema';
import { booking } from './booking.schema';

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account)
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	})
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	})
}));

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
