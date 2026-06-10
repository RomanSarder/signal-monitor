import {
  boolean,
  integer,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { monitors } from "./monitors";
import { relations } from "drizzle-orm";

export const results = pgTable(
  "results",
  {
    id: uuid().primaryKey().defaultRandom(),
    monitorId: uuid("monitor_id")
      .notNull()
      .references(() => monitors.id, { onDelete: "cascade" }),
    source: varchar({ length: 255 }).notNull(),
    sourceId: varchar("source_id", { length: 255 }).notNull(),
    url: varchar().notNull(),
    title: varchar(),
    snippet: text().notNull(),
    author: varchar().notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
    matchedKeywords: text("matched_keywords").array().notNull(),
    intentScore: integer("intent_score"),
    intentCategory: text("intent_category").$type<
      "hiring" | "noise" | "pain_point" | "discussion"
    >(),
    intentReason: text("intent_reason"),
    scoredAt: timestamp("scored_at", { withTimezone: true }),
    isRead: boolean().default(false),
    isSaved: boolean().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }),
  },
  (table) => {
    return {
      uniqueResult: uniqueIndex("results_monitor_source_id_idx").on(
        table.monitorId,
        table.sourceId,
        table.source,
      ),
    };
  },
);

export const resultsRelations = relations(results, ({ one }) => {
  return {
    monitor: one(monitors, {
      fields: [results.monitorId],
      references: [monitors.id],
    }),
  };
});
