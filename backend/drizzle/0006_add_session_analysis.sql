CREATE TABLE "session_analysis" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"session_id" varchar(36) NOT NULL,
	"timeline_json" jsonb DEFAULT null,
	"inspection_json" jsonb DEFAULT null,
	"vision_success_count" integer DEFAULT 0 NOT NULL,
	"total_frames" integer DEFAULT 0 NOT NULL,
	"analysis_version" integer DEFAULT 1 NOT NULL,
	"prompt_status" varchar(50) DEFAULT 'pending' NOT NULL,
	"prompt_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_analysis_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
ALTER TABLE "session_analysis" ADD CONSTRAINT "session_analysis_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
