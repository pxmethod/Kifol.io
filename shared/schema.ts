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

// New tables for student management
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(), // Removed .unique()
  grade: integer("grade").notNull(),
});

export const programStudents = pgTable("program_students", {
  id: serial("id").primaryKey(),
  programId: integer("program_id")
    .notNull()
    .references(() => programs.id),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id),
});

export const portfolioEntries = pgTable("portfolio_entries", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id),
  title: text("title").notNull(),
  description: text("description"),
  achievementDate: date("achievement_date").notNull().default(sql`CURRENT_DATE`),
  type: text("type", { enum: ['accomplishment', 'project'] }).notNull(),
  mediaUrl: text("media_url").array(),
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
  programStudents: many(programStudents),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  program: one(programs, {
    fields: [sessions.programId],
    references: [programs.id],
  }),
}));

export const studentsRelations = relations(students, ({ many }) => ({
  programStudents: many(programStudents),
  portfolioEntries: many(portfolioEntries),
}));

export const programStudentsRelations = relations(programStudents, ({ one }) => ({
  program: one(programs, {
    fields: [programStudents.programId],
    references: [programs.id],
  }),
  student: one(students, {
    fields: [programStudents.studentId],
    references: [students.id],
  }),
}));

export const portfolioEntriesRelations = relations(portfolioEntries, ({ one }) => ({
  student: one(students, {
    fields: [portfolioEntries.studentId],
    references: [students.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users);
export const insertProgramSchema = createInsertSchema(programs).omit({ userId: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ programId: true });
export const insertStudentSchema = createInsertSchema(students);
export const insertProgramStudentSchema = createInsertSchema(programStudents).omit({ 
  programId: true,
  studentId: true,
});
export const insertPortfolioEntrySchema = createInsertSchema(portfolioEntries)
  .extend({
    mediaFiles: z.array(z.object({
      name: z.string(),
      type: z.string(),
      url: z.string(),
    })).optional(),
  })
  .omit({ 
    studentId: true,
    mediaUrl: true,
  });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Program = typeof programs.$inferSelect;
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type ProgramStudent = typeof programStudents.$inferSelect;
export type InsertProgramStudent = z.infer<typeof insertProgramStudentSchema>;
export type PortfolioEntry = typeof portfolioEntries.$inferSelect;
export type InsertPortfolioEntry = z.infer<typeof insertPortfolioEntrySchema>;