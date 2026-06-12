CREATE TYPE "public"."monitor_status" AS ENUM('active', 'paused');
--> statement-breakpoint
CREATE TABLE "monitors" (
	"id" uuid DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"keywords" text[] NOT NULL,
	"sources" text[] NOT NULL,
	"interval_minutes" integer DEFAULT 30 NOT NULL,
	"status" "monitor_status" DEFAULT 'active' NOT NULL,
	"last_run_at" timestamp,
	"last_result_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "monitors" ADD CONSTRAINT "monitors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;