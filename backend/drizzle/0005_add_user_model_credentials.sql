CREATE TABLE "user_model_credentials" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"label" varchar(255) NOT NULL,
	"encrypted_api_key" text NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_model_credentials" ADD CONSTRAINT "user_model_credentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
