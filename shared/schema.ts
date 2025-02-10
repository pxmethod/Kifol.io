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
  sessionCount: integer("session_count"),  
  studentCount: integer("student_count"),  
  userId: integer("user_id").notNull().references(() => users.id),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProgramSchema = createInsertSchema(programs).omit({
  id: true,
  userId: true,
  sessionCount: true,
  studentCount: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Program = typeof programs.$inferSelect;
export type InsertProgram = z.infer<typeof insertProgramSchema>;