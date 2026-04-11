CREATE TYPE "public"."agent_type" AS ENUM('CLAUDE_CODE', 'CODEX', 'CURSOR', 'RAW');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('processing', 'complete', 'error');--> statement-breakpoint
CREATE TABLE "frames" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"session_id" varchar(36) NOT NULL,
	"timestamp" integer DEFAULT 0 NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"diff_summary" jsonb DEFAULT '{"added":0,"changed":0,"removed":0}'::jsonb NOT NULL,
	"aria_tree" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"title" varchar(500) NOT NULL,
	"status" "session_status" DEFAULT 'processing' NOT NULL,
	"duration" integer DEFAULT 0 NOT NULL,
	"frame_count" integer DEFAULT 0 NOT NULL,
	"urls" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"processing_time" integer DEFAULT 0 NOT NULL,
	"prompt" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"user_id" varchar(36) PRIMARY KEY NOT NULL,
	"default_agent" "agent_type" DEFAULT 'CLAUDE_CODE' NOT NULL,
	"include_screenshots" integer DEFAULT 1 NOT NULL,
	"inline_aria_tree" integer DEFAULT 1 NOT NULL,
	"include_raw_diff" integer DEFAULT 0 NOT NULL,
	"max_recording_length" integer DEFAULT 30 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "frames" ADD CONSTRAINT "frames_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;