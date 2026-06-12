import { integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { relations } from "drizzle-orm";

export const digestLogs = pgTable("digest_logs", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull(),
  resultCount: integer("result_count").notNull()
})

export const digestLogsRelations = relations(digestLogs, ({ one }) => ({
  user: one(users, {
    fields: [digestLogs.userId],
    references: [users.id],
  })
}))
