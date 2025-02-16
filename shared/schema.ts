import { relations, sql } from "drizzle-orm";
import { text, serial, integer, date, pgTable, boolean, timestamp } from "drizzle-orm/pg-core";
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

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  grade: integer("grade").notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  parentEmail: text("parent_email").notNull(),
  parentName: text("parent_name"),
});

export const parentVerifications = pgTable("parent_verifications", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  isVerified: boolean("is_verified").notNull().default(false),
  verifiedAt: timestamp("verified_at"),
});

export const verificationTokens = pgTable("verification_tokens", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  parentEmail: text("parent_email").notNull(),
  programId: integer("program_id")
    .notNull()
    .references(() => programs.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
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
  achievementDate: date("achievement_date").notNull(),
  type: text("type").notNull(),
  grade: text("grade"),
  feedback: text("feedback"),
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

export const studentsRelations = relations(students, ({ many, one }) => ({
  programStudents: many(programStudents),
  portfolioEntries: many(portfolioEntries),
  parentVerification: one(parentVerifications, {
    fields: [students.parentEmail],
    references: [parentVerifications.email],
  }),
}));

export const parentVerificationsRelations = relations(parentVerifications, ({ many }) => ({
  students: many(students),
}));

export const verificationTokensRelations = relations(verificationTokens, ({ one }) => ({
  program: one(programs, {
    fields: [verificationTokens.programId],
    references: [programs.id],
  }),
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
export const insertParentVerificationSchema = createInsertSchema(parentVerifications);
export const insertVerificationTokenSchema = createInsertSchema(verificationTokens).omit({
  id: true,
  createdAt: true,
  verifiedAt: true,
});
export const insertProgramStudentSchema = createInsertSchema(programStudents).omit({
  programId: true,
  studentId: true,
});
export const insertPortfolioEntrySchema = createInsertSchema(portfolioEntries).omit({
  studentId: true,
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
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type InsertVerificationToken = z.infer<typeof insertVerificationTokenSchema>;
export type ProgramStudent = typeof programStudents.$inferSelect;
export type InsertProgramStudent = z.infer<typeof insertProgramStudentSchema>;
export type PortfolioEntry = typeof portfolioEntries.$inferSelect;
export type InsertPortfolioEntry = z.infer<typeof insertPortfolioEntrySchema>;
export type ParentVerification = typeof parentVerifications.$inferSelect;
export type InsertParentVerification = z.infer<typeof insertParentVerificationSchema>;