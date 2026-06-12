CREATE TABLE "digest_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"sent_at" timestamp with time zone NOT NULL,
	"result_count" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "digestMinutes" integer DEFAULT 540;--> statement-breakpoint
ALTER TABLE "digest_logs" ADD CONSTRAINT "digest_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;