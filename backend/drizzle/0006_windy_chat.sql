ALTER TABLE "digest_logs" DROP CONSTRAINT "digest_logs_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "digest_logs" ADD CONSTRAINT "digest_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;