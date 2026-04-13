ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "inspection_json" jsonb DEFAULT 'null'::jsonb;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "inspection_duration_ms" integer;
