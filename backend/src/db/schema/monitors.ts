import {
  uuid,
  pgTable,
  varchar,
  text,
  integer,
  pgEnum,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { relations } from "drizzle-orm";
import { results } from "./results";
import { jobRuns } from "./jobRuns";

export const status = pgEnum("monitor_status", ["active", "paused"]);

export const monitors = pgTable("monitors", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }).notNull(),
  keywords: text().array().notNull(),
  sources: text().array().notNull(),
  intervalMinutes: integer("interval_minutes").notNull().default(30),
  status: status().notNull().default("active"),
  lastRunAt: timestamp("last_run_at"),
  lastResultCount: integer("last_result_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const monitorsRelations = relations(monitors, ({ one, many }) => {
  return {
    user: one(users, {
      fields: [monitors.userId],
      references: [users.id],
    }),
    results: many(results),
    jobRuns: many(jobRuns),
  };
});
