import { relations, sql } from "drizzle-orm";
import { text, serial, integer, date, pgTable, timestamp, boolean, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Existing users table (for instructors/admins)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// New parent_users table
export const parentUsers = pgTable("parent_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// New parent_invitations table
export const parentInvitations = pgTable("parent_invitations", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  accepted: boolean("accepted").default(false), // Changed from isAccepted to accepted
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
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
  coverImage: text("cover_image"), // New field for the cover image URL
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  programId: integer("program_id")
    .notNull()
    .references(() => programs.id),
  name: text("name").notNull(),
  description: text("description"),
});

// Modified students table with parent relationship and slug
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  grade: integer("grade").notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  parentId: integer("parent_id").references(() => parentUsers.id),
  createdAt: timestamp("created_at").defaultNow(),
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
  mediaUrl: text("media_url"),
  mediaType: text("media_type"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  programs: many(programs),
}));

export const parentUsersRelations = relations(parentUsers, ({ many }) => ({
  students: many(students),
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
  parent: one(parentUsers, {
    fields: [students.parentId],
    references: [parentUsers.id],
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
export const insertParentUserSchema = createInsertSchema(parentUsers).omit({ 
  createdAt: true 
});
export const insertParentInvitationSchema = createInsertSchema(parentInvitations).omit({ 
  createdAt: true,
  accepted: true,
});
export const insertProgramSchema = createInsertSchema(programs).omit({ userId: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ programId: true });
export const insertStudentSchema = createInsertSchema(students).omit({
  parentId: true,
  slug: true,
  createdAt: true,
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
export type ParentUser = typeof parentUsers.$inferSelect;
export type InsertParentUser = z.infer<typeof insertParentUserSchema>;
export type ParentInvitation = typeof parentInvitations.$inferSelect;
export type InsertParentInvitation = z.infer<typeof insertParentInvitationSchema>;
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