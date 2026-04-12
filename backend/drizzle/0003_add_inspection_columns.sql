ALTER TABLE "sessions" ADD COLUMN "inspection_json" jsonb DEFAULT 'null'::jsonb;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "inspection_duration_ms" integer;
