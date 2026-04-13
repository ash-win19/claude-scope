ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "analysis" jsonb DEFAULT 'null'::jsonb;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "prompt_status" varchar(20) DEFAULT 'not_started' NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "prompt_error" text;
