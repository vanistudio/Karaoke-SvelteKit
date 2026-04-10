import { pgTable, serial, text, real, boolean, integer, time, date } from 'drizzle-orm/pg-core';

export const pricingRule = pgTable('pricing_rule', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	type: text('type', { enum: ['holiday', 'time_block'] }).notNull(),
	startTime: time('start_time'),
	endTime: time('end_time'),
	date: date('date'),
	daysOfWeek: integer('days_of_week').array(),
	multiplier: real('multiplier').default(1.0).notNull(),
	isActive: boolean('is_active').default(true).notNull()
});
