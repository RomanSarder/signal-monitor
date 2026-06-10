CREATE TABLE "job_run_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_run_id" uuid,
	"source" text NOT NULL,
	"status" text NOT NULL,
	"failedKeywords" text[],
	"results_fetched" integer NOT NULL,
	"error_message" text,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "job_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"monitor_id" uuid,
	"job_type" text NOT NULL,
	"status" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"monitor_id" uuid NOT NULL,
	"source" varchar(255) NOT NULL,
	"source_id" varchar(255) NOT NULL,
	"url" varchar NOT NULL,
	"title" varchar,
	"snippet" text NOT NULL,
	"author" varchar NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"matched_keywords" text[] NOT NULL,
	"intent_score" integer,
	"intent_category" text,
	"intent_reason" text,
	"scored_at" timestamp with time zone,
	"isRead" boolean DEFAULT false,
	"isSaved" boolean DEFAULT false,
	"created_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "monitors" DROP CONSTRAINT "monitors_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "monitors" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "monitors" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "job_run_sources" ADD CONSTRAINT "job_run_sources_job_run_id_job_runs_id_fk" FOREIGN KEY ("job_run_id") REFERENCES "public"."job_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_runs" ADD CONSTRAINT "job_runs_monitor_id_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_monitor_id_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "results_monitor_source_id_idx" ON "results" USING btree ("monitor_id","source_id","source");--> statement-breakpoint
ALTER TABLE "monitors" ADD CONSTRAINT "monitors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;