import { users, programs, sessions, type User, type InsertUser, type Program, type InsertProgram, type Session, type InsertSession } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Program methods
  createProgram(userId: number, program: InsertProgram): Promise<Program>;
  getProgramsByUserId(userId: number): Promise<Program[]>;
  getProgram(id: number): Promise<Program | undefined>;
  updateProgram(id: number, program: Partial<InsertProgram>): Promise<Program>;
  deleteProgram(id: number): Promise<void>;

  // Session methods
  createSession(programId: number, session: InsertSession): Promise<Session>;
  getSessionsByProgramId(programId: number): Promise<Session[]>;
  updateSession(id: number, session: Partial<InsertSession>): Promise<Session>;
  deleteSession(id: number): Promise<void>;

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

  // Existing user methods
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

  // Existing program methods
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

  async updateProgram(id: number, program: Partial<InsertProgram>): Promise<Program> {
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

  // New session methods
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
}

export const storage = new DatabaseStorage();