import { relations, sql } from "drizzle-orm";
import { text, serial, integer, date, pgTable, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default('teacher'),
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
  email: text("email").notNull(),
  grade: integer("grade").notNull(),
});

export const parents = pgTable("parents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  phone: text("phone"),
});

export const parentStudents = pgTable("parent_students", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id")
    .notNull()
    .references(() => parents.id),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id),
  relationship: text("relationship").notNull(),
});

export const parentInvitations = pgTable("parent_invitations", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id")
    .notNull()
    .references(() => students.id),
  email: text("email").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires").notNull(),
  accepted: boolean("accepted").default(false),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
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

export const usersRelations = relations(users, ({ many, one }) => ({
  programs: many(programs),
  parent: one(parents, {
    fields: [users.id],
    references: [parents.userId],
  }),
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
  parentStudents: many(parentStudents),
  parentInvitations: many(parentInvitations),
}));

export const parentsRelations = relations(parents, ({ one, many }) => ({
  user: one(users, {
    fields: [parents.userId],
    references: [users.id],
  }),
  parentStudents: many(parentStudents),
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

export const insertUserSchema = createInsertSchema(users);
export const insertProgramSchema = createInsertSchema(programs).omit({ userId: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ programId: true });
export const insertStudentSchema = createInsertSchema(students);
export const insertProgramStudentSchema = createInsertSchema(programStudents).omit({ 
  programId: true,
  studentId: true,
});
export const insertPortfolioEntrySchema = createInsertSchema(portfolioEntries).omit({ 
  studentId: true,
});
export const insertParentSchema = createInsertSchema(parents).omit({ userId: true });
export const insertParentStudentSchema = createInsertSchema(parentStudents);
export const insertParentInvitationSchema = createInsertSchema(parentInvitations).omit({
  token: true,
  expires: true,
  accepted: true,
  createdAt: true,
});

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
export type Parent = typeof parents.$inferSelect;
export type InsertParent = z.infer<typeof insertParentSchema>;
export type ParentStudent = typeof parentStudents.$inferSelect;
export type InsertParentStudent = z.infer<typeof insertParentStudentSchema>;
export type ParentInvitation = typeof parentInvitations.$inferSelect;
export type InsertParentInvitation = z.infer<typeof insertParentInvitationSchema>;