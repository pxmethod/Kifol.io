import { relations, sql } from "drizzle-orm";
import { text, serial, integer, date, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  programId: integer("program_id")
    .notNull()
    .references(() => programs.id),
  name: text("name").notNull(),
  description: text("description"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  programs: many(programs),
}));

export const programsRelations = relations(programs, ({ one, many }) => ({
  user: one(users, {
    fields: [programs.userId],
    references: [users.id],
  }),
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  program: one(programs, {
    fields: [sessions.programId],
    references: [programs.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users);
export const insertProgramSchema = createInsertSchema(programs).omit({ userId: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ programId: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Program = typeof programs.$inferSelect;
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;