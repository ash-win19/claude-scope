CREATE INDEX IF NOT EXISTS "frames_session_timestamp_idx" ON "frames" USING btree ("session_id","timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_user_created_idx" ON "sessions" USING btree ("user_id","created_at" DESC NULLS LAST);
