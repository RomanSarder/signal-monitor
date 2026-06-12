import { relations } from "drizzle-orm";
import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { monitors } from "./monitors";
import { digestLogs } from "./digestLogs";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  digestMinutes: integer().notNull().default(540), // 9:00
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const usersRelations = relations(users, ({ many }) => {
  return {
    monitors: many(monitors),
    digestLogs: many(digestLogs),
  };
});
