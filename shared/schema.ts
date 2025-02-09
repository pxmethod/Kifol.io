import { pgTable, text, serial, integer, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  sessionCount: integer("session_count").notNull(),
  studentCount: integer("student_count").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  programId: integer("program_id").notNull().references(() => programs.id),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProgramSchema = createInsertSchema(programs).omit({
  id: true,
  userId: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  programId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Program = typeof programs.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;