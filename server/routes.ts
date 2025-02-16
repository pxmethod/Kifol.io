import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProgramSchema, insertSessionSchema, insertStudentSchema } from "@shared/schema";
import { generateInvitationToken, sendParentInvitation } from "./email";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Programs
  app.get("/api/programs", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const programs = await storage.getProgramsByUserId(req.user.id);
    res.json(programs);
  });

  app.get("/api/programs/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const program = await storage.getProgram(parseInt(req.params.id));
    if (!program) return res.sendStatus(404);
    if (program.userId !== req.user.id) return res.sendStatus(403);

    res.json(program);
  });

  app.post("/api/programs", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const programData = insertProgramSchema.parse(req.body.program);
    const program = await storage.createProgram(req.user.id, programData);

    res.status(201).json(program);
  });

  app.patch("/api/programs/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const program = await storage.getProgram(parseInt(req.params.id));
    if (!program) return res.sendStatus(404);
    if (program.userId !== req.user.id) return res.sendStatus(403);

    const programData = insertProgramSchema.partial().parse(req.body);
    const updatedProgram = await storage.updateProgram(program.id, programData);

    res.json(updatedProgram);
  });

  app.delete("/api/programs/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const program = await storage.getProgram(parseInt(req.params.id));
    if (!program) return res.sendStatus(404);
    if (program.userId !== req.user.id) return res.sendStatus(403);

    await storage.deleteProgram(program.id);
    res.sendStatus(200);
  });

  // Sessions
  app.get("/api/programs/:programId/sessions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const program = await storage.getProgram(parseInt(req.params.programId));
    if (!program) return res.sendStatus(404);
    if (program.userId !== req.user.id) return res.sendStatus(403);

    const sessions = await storage.getSessionsByProgramId(program.id);
    res.json(sessions);
  });

  app.post("/api/programs/:programId/sessions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const program = await storage.getProgram(parseInt(req.params.programId));
    if (!program) return res.sendStatus(404);
    if (program.userId !== req.user.id) return res.sendStatus(403);

    const sessionData = insertSessionSchema.parse(req.body);
    const session = await storage.createSession(program.id, sessionData);

    res.status(201).json(session);
  });

  app.patch("/api/programs/:programId/sessions/:sessionId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const program = await storage.getProgram(parseInt(req.params.programId));
    if (!program) return res.sendStatus(404);
    if (program.userId !== req.user.id) return res.sendStatus(403);

    const sessionData = insertSessionSchema.partial().parse(req.body);
    const session = await storage.updateSession(parseInt(req.params.sessionId), sessionData);

    res.json(session);
  });

  app.delete("/api/programs/:programId/sessions/:sessionId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const program = await storage.getProgram(parseInt(req.params.programId));
    if (!program) return res.sendStatus(404);
    if (program.userId !== req.user.id) return res.sendStatus(403);

    await storage.deleteSession(parseInt(req.params.sessionId));
    res.sendStatus(200);
  });

  // Students
  app.get("/api/programs/:programId/students", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const program = await storage.getProgram(parseInt(req.params.programId));
    if (!program) return res.sendStatus(404);
    if (program.userId !== req.user.id) return res.sendStatus(403);

    const students = await storage.getStudentsByProgramId(program.id);
    res.json(students);
  });

  app.post("/api/programs/:programId/students", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const program = await storage.getProgram(parseInt(req.params.programId));
    if (!program) return res.sendStatus(404);
    if (program.userId !== req.user.id) return res.sendStatus(403);

    const studentData = insertStudentSchema.parse(req.body.student);

    try {
      // Check if student already exists
      let student = await storage.getStudentByEmail(studentData.email);

      if (!student) {
        // Create new student if doesn't exist
        student = await storage.createStudent(studentData);
      }

      // Add student to program
      const programStudent = await storage.addStudentToProgram(program.id, student.id);

      // Generate and store invitation token
      const token = generateInvitationToken();
      const invitation = await storage.createParentInvitation(
        student.id,
        student.email,
        token
      );

      // Send invitation email
      await sendParentInvitation({
        parentEmail: student.email,
        studentName: student.name,
        token: invitation.token,
      });

      res.status(201).json({ ...student, programStudent });
    } catch (error) {
      console.error('Failed to create student and send invitation:', error);
      res.status(500).json({ error: 'Failed to create student and send invitation' });
    }
  });

  app.post("/api/parent-registration", async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    const invitation = await storage.getParentInvitationByToken(token);

    if (!invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }

    if (invitation.usedAt) {
      return res.status(400).json({ error: 'Invitation has already been used' });
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      return res.status(400).json({ error: 'Invitation has expired' });
    }

    try {
      // Create parent user account
      const username = invitation.email;
      const user = await storage.createUser({ username, password });

      // Mark invitation as used
      await storage.markParentInvitationUsed(invitation.id);

      // Update student record
      await storage.updateStudent(invitation.studentId, { isParentRegistered: true });

      res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
      console.error('Failed to complete parent registration:', error);
      res.status(500).json({ error: 'Failed to complete registration' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}