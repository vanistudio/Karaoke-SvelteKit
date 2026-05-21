CREATE INDEX "booking_room_status_time_idx" ON "booking" USING btree ("room_id","status","start_time","end_time");--> statement-breakpoint
CREATE INDEX "booking_user_created_at_idx" ON "booking" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "point_history_user_booking_type_idx" ON "point_history" USING btree ("user_id","booking_id","type");--> statement-breakpoint
CREATE INDEX "point_history_booking_type_idx" ON "point_history" USING btree ("booking_id","type");--> statement-breakpoint
CREATE UNIQUE INDEX "review_booking_id_unique" ON "review" USING btree ("booking_id");