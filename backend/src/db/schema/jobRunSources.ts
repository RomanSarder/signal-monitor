import { integer, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { jobRuns } from "./jobRuns";
import { relations } from "drizzle-orm";

export const jobRunSources = pgTable("job_run_sources", {
  id: uuid().primaryKey().defaultRandom(),
  jobRunId: uuid("job_run_id").references(() => jobRuns.id),
  source: text().notNull(),
  status: text()
    .notNull()
    .$type<"completed" | "failed" | "completed_with_errors">(),
  failedKeywords: text().array(),
  resultFetched: integer("results_fetched").notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at"),
});

export const jobRunSourcesRelations = relations(jobRunSources, ({ one }) => {
  return {
    jobRun: one(jobRuns, {
      fields: [jobRunSources.jobRunId],
      references: [jobRuns.id],
    }),
  };
});
