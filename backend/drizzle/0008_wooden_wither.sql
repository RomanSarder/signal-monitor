ALTER TABLE "job_run_sources" DROP CONSTRAINT "job_run_sources_job_run_id_job_runs_id_fk";
--> statement-breakpoint
ALTER TABLE "job_run_sources" ADD CONSTRAINT "job_run_sources_job_run_id_job_runs_id_fk" FOREIGN KEY ("job_run_id") REFERENCES "public"."job_runs"("id") ON DELETE cascade ON UPDATE no action;