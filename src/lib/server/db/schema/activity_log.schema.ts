import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './user.schema';

export const activityLog = pgTable('activity_log', {
	id: serial('id').primaryKey(),
	userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
	action: text('action').notNull(),
	entity: text('entity').notNull(),
	entityId: text('entity_id'),
	details: text('details'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});
