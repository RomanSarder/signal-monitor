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

export const status = pgEnum("monitor_status", ["active", "paused"]);

export const monitors = pgTable("monitors", {
  id: uuid().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  name: varchar({ length: 255 }).notNull(),
  keywords: text().array().notNull(),
  sources: text().array().notNull(),
  intervalMinutes: integer("interval_minutes").notNull().default(30),
  status: status().notNull().default("active"),
  lastRunAt: timestamp("last_run_at"),
  lastResultCount: integer("last_result_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
