import { text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { monitors } from "./monitors";
import { relations } from "drizzle-orm";
import { jobRunSources } from "./jobRunSources";

export const jobRuns = pgTable("job_runs", {
  id: uuid().primaryKey().defaultRandom(),
  monitorId: uuid("monitor_id").references(() => monitors.id, {
    onDelete: "cascade",
  }),
  jobType: text("job_type").notNull().$type<"poll" | "score" | "digest">(),
  status: text()
    .notNull()
    .$type<"started" | "completed" | "completed_with_errors" | "failed">(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
});

export const jobRunsRelations = relations(jobRuns, ({ one, many }) => {
  return {
    monitor: one(monitors, {
      fields: [jobRuns.monitorId],
      references: [monitors.id],
    }),
    jobRunSources: many(jobRunSources),
  };
});
