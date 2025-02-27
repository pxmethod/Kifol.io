import { users, programs, sessions, students, programStudents, portfolioEntries, 
  parentUsers, parentInvitations,
  type User, type InsertUser, type Program, type InsertProgram, 
  type Session, type InsertSession, type Student, type InsertStudent,
  type ProgramStudent, type InsertProgramStudent, type PortfolioEntry, 
  type InsertPortfolioEntry, type ParentUser, type InsertParentUser,
  type ParentInvitation, type InsertParentInvitation } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { nanoid } from 'nanoid';

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Existing user methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Program methods
  createProgram(userId: number, program: InsertProgram): Promise<Program>;
  getProgramsByUserId(userId: number): Promise<Program[]>;
  getProgram(id: number): Promise<Program | undefined>;
  updateProgram(id: number, program: Partial<InsertProgram> & { coverImage?: string }): Promise<Program>;
  deleteProgram(id: number): Promise<void>;

  // Session methods
  createSession(programId: number, session: InsertSession): Promise<Session>;
  getSessionsByProgramId(programId: number): Promise<Session[]>;
  updateSession(id: number, session: Partial<InsertSession>): Promise<Session>;
  deleteSession(id: number): Promise<void>;

  // New Student methods
  createStudent(student: InsertStudent & { parentEmail: string }): Promise<Student>;
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByEmail(email: string): Promise<Student | undefined>;
  getStudentBySlug(slug: string): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<void>;
  getStudentsByParentId(parentId: number): Promise<Student[]>;

  // Program-Student relationship methods
  addStudentToProgram(programId: number, studentId: number): Promise<ProgramStudent>;
  getStudentsByProgramId(programId: number): Promise<Student[]>;
  getProgramsByStudentId(studentId: number): Promise<Program[]>;
  removeStudentFromProgram(programId: number, studentId: number): Promise<void>;

  // Portfolio methods
  createPortfolioEntry(studentId: number, entry: InsertPortfolioEntry): Promise<PortfolioEntry>;
  getPortfolioEntriesByStudentId(studentId: number): Promise<PortfolioEntry[]>;
  updatePortfolioEntry(id: number, entry: Partial<InsertPortfolioEntry>): Promise<PortfolioEntry>;
  deletePortfolioEntry(id: number): Promise<void>;

  // New parent user methods
  createParentUser(user: InsertParentUser): Promise<ParentUser>;
  getParentUser(id: number): Promise<ParentUser | undefined>;
  getParentUserByEmail(email: string): Promise<ParentUser | undefined>;

  // New parent invitation methods
  createParentInvitation(email: string): Promise<ParentInvitation>;
  getParentInvitation(token: string): Promise<ParentInvitation | undefined>;
  acceptParentInvitation(token: string): Promise<void>;
  linkStudentToParent(studentId: number, parentId: number): Promise<void>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // Existing user methods implementation
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Existing program methods implementation
  async createProgram(userId: number, program: InsertProgram): Promise<Program> {
    const [newProgram] = await db
      .insert(programs)
      .values({ ...program, userId })
      .returning();
    return newProgram;
  }

  async getProgramsByUserId(userId: number): Promise<Program[]> {
    return await db
      .select()
      .from(programs)
      .where(eq(programs.userId, userId));
  }

  async getProgram(id: number): Promise<Program | undefined> {
    const [program] = await db
      .select()
      .from(programs)
      .where(eq(programs.id, id));
    return program;
  }

  async updateProgram(id: number, program: Partial<InsertProgram> & { coverImage?: string }): Promise<Program> {
    const [updatedProgram] = await db
      .update(programs)
      .set(program)
      .where(eq(programs.id, id))
      .returning();
    return updatedProgram;
  }

  async deleteProgram(id: number): Promise<void> {
    await db.delete(programs).where(eq(programs.id, id));
  }

  // Existing session methods implementation
  async createSession(programId: number, session: InsertSession): Promise<Session> {
    const [newSession] = await db
      .insert(sessions)
      .values({ ...session, programId })
      .returning();
    return newSession;
  }

  async getSessionsByProgramId(programId: number): Promise<Session[]> {
    return await db
      .select()
      .from(sessions)
      .where(eq(sessions.programId, programId));
  }

  async updateSession(id: number, session: Partial<InsertSession>): Promise<Session> {
    const [updatedSession] = await db
      .update(sessions)
      .set(session)
      .where(eq(sessions.id, id))
      .returning();
    return updatedSession;
  }

  async deleteSession(id: number): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, id));
  }

  // New Student methods implementation
  async createStudent(student: InsertStudent & { parentEmail: string }): Promise<Student> {
    const { parentEmail, ...studentData } = student;

    // Generate a unique slug for the student
    const slug = nanoid();

    // Start a transaction
    return await db.transaction(async (tx) => {
      // Create the student record
      const [newStudent] = await tx
        .insert(students)
        .values({
          ...studentData,
          slug,
        })
        .returning();

      // Check if parent already exists
      const existingParent = await this.getParentUserByEmail(parentEmail);

      if (!existingParent) {
        // Create parent invitation only if we have a valid email
        if (parentEmail) {
          await this.createParentInvitation(parentEmail);
        }
      } else {
        // If parent exists, link student to parent
        await tx
          .update(students)
          .set({ parentId: existingParent.id })
          .where(eq(students.id, newStudent.id));
      }

      return newStudent;
    });
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, id));
    return student;
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.email, email));
    return student;
  }

  async getStudentBySlug(slug: string): Promise<Student | undefined> {
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.slug, slug));
    return student;
  }

  async deleteStudent(id: number): Promise<void> {
    // First delete any parent invitations related to this student's email
    const student = await this.getStudent(id);
    if (student && student.email) {
      await db.delete(parentInvitations)
        .where(eq(parentInvitations.email, student.email));
    }

    // Then delete related portfolio entries
    await db.delete(portfolioEntries)
      .where(eq(portfolioEntries.studentId, id));

    // Then delete program enrollments
    await db.delete(programStudents)
      .where(eq(programStudents.studentId, id));

    // Finally delete the student
    await db.delete(students)
      .where(eq(students.id, id));
  }

  async getStudentsByParentId(parentId: number): Promise<Student[]> {
    return await db
      .select()
      .from(students)
      .where(eq(students.parentId, parentId))
      .orderBy(students.name);
  }


  // Program-Student relationship methods implementation
  async addStudentToProgram(programId: number, studentId: number): Promise<ProgramStudent> {
    const [programStudent] = await db
      .insert(programStudents)
      .values({ programId, studentId })
      .returning();
    return programStudent;
  }

  async getStudentsByProgramId(programId: number): Promise<Student[]> {
    return await db
      .select({
        id: students.id,
        name: students.name,
        email: students.email,
        grade: students.grade,
      })
      .from(programStudents)
      .innerJoin(students, eq(programStudents.studentId, students.id))
      .where(eq(programStudents.programId, programId));
  }

  async getProgramsByStudentId(studentId: number): Promise<Program[]> {
    return await db
      .select({
        id: programs.id,
        title: programs.title,
        description: programs.description,
        startDate: programs.startDate,
        endDate: programs.endDate,
        userId: programs.userId,
      })
      .from(programStudents)
      .innerJoin(programs, eq(programStudents.programId, programs.id))
      .where(eq(programStudents.studentId, studentId));
  }

  async removeStudentFromProgram(programId: number, studentId: number): Promise<void> {
    await db
      .delete(programStudents)
      .where(
        eq(programStudents.programId, programId) &&
        eq(programStudents.studentId, studentId)
      );
  }

  // Portfolio methods implementation
  async createPortfolioEntry(studentId: number, entry: InsertPortfolioEntry): Promise<PortfolioEntry> {
    const [newEntry] = await db
      .insert(portfolioEntries)
      .values({ ...entry, studentId })
      .returning();
    return newEntry;
  }

  async getPortfolioEntriesByStudentId(studentId: number): Promise<PortfolioEntry[]> {
    return await db
      .select()
      .from(portfolioEntries)
      .where(eq(portfolioEntries.studentId, studentId));
  }

  async updatePortfolioEntry(id: number, entry: Partial<InsertPortfolioEntry>): Promise<PortfolioEntry> {
    const [updatedEntry] = await db
      .update(portfolioEntries)
      .set(entry)
      .where(eq(portfolioEntries.id, id))
      .returning();
    return updatedEntry;
  }

  async deletePortfolioEntry(id: number): Promise<void> {
    await db.delete(portfolioEntries).where(eq(portfolioEntries.id, id));
  }

  async getStudentByNameAndEmail(name: string, email: string): Promise<Student | undefined> {
    const [student] = await db
      .select()
      .from(students)
      .where(
        sql`${students.name} = ${name} AND ${students.email} = ${email}`
      );
    return student;
  }

  // New parent user methods
  async createParentUser(user: InsertParentUser): Promise<ParentUser> {
    const [newParentUser] = await db
      .insert(parentUsers)
      .values(user)
      .returning();
    return newParentUser;
  }

  async getParentUser(id: number): Promise<ParentUser | undefined> {
    const [parent] = await db
      .select()
      .from(parentUsers)
      .where(eq(parentUsers.id, id));
    return parent;
  }

  async getParentUserByEmail(email: string): Promise<ParentUser | undefined> {
    const [parent] = await db
      .select()
      .from(parentUsers)
      .where(eq(parentUsers.email, email));
    return parent;
  }

  // New parent invitation methods
  async createParentInvitation(email: string): Promise<ParentInvitation> {
    const token = nanoid();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const [invitation] = await db
      .insert(parentInvitations)
      .values({
        email,
        token,
        expiresAt,
        accepted: false, 
      })
      .returning();
    return invitation;
  }

  async getParentInvitation(token: string): Promise<ParentInvitation | undefined> {
    const [invitation] = await db
      .select()
      .from(parentInvitations)
      .where(
        and(
          eq(parentInvitations.token, token),
          eq(parentInvitations.accepted, false), 
          sql`${parentInvitations.expiresAt} > NOW()`
        )
      );
    return invitation;
  }

  async acceptParentInvitation(token: string): Promise<void> {
    await db
      .update(parentInvitations)
      .set({ accepted: true }) 
      .where(eq(parentInvitations.token, token));
  }
  async linkStudentToParent(studentId: number, parentId: number): Promise<void> {
    await db
      .update(students)
      .set({ parentId })
      .where(eq(students.id, studentId));
  }
}

export const storage = new DatabaseStorage();