ALTER TABLE "sessions" ADD COLUMN "analysis" jsonb DEFAULT 'null'::jsonb;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "prompt_status" varchar(20) DEFAULT 'not_started' NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "prompt_error" text;
