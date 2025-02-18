import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProgramSchema, insertSessionSchema, insertStudentSchema, insertParentSchema, insertParentInvitationSchema } from "@shared/schema";

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

  // Students and Parent Invitations
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

    const studentData = insertStudentSchema.parse(req.body);

    // Check if exact student (same name and email) already exists
    let student = await storage.getStudentByNameAndEmail(studentData.name, studentData.email);

    if (!student) {
      // Create new student if doesn't exist
      student = await storage.createStudent(studentData);
    }

    // Check if student is already in the program
    const existingStudents = await storage.getStudentsByProgramId(program.id);
    const isAlreadyEnrolled = existingStudents.some(s => s.id === student.id);

    if (isAlreadyEnrolled) {
      return res.status(400).json({
        message: "This student is already enrolled in this program"
      });
    }

    // Add student to program
    const programStudent = await storage.addStudentToProgram(program.id, student.id);

    // Create parent invitation if parent email is provided
    if (req.body.parentEmail) {
      const invitationData = insertParentInvitationSchema.parse({
        studentId: student.id,
        email: req.body.parentEmail
      });
      await storage.createParentInvitation(student.id, invitationData.email);
    }

    res.status(201).json({ ...student, programStudent });
  });

  // Parent Invitation Management
  app.get("/api/parent-invitation/:token", async (req, res) => {
    const invitation = await storage.getParentInvitation(req.params.token);
    if (!invitation) {
      return res.status(404).json({ message: "Invalid or expired invitation" });
    }
    res.json(invitation);
  });

  app.post("/api/parent-invitation/:token/accept", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const invitation = await storage.getParentInvitation(req.params.token);
    if (!invitation) {
      return res.status(404).json({ message: "Invalid or expired invitation" });
    }

    // Create parent profile
    const parentData = insertParentSchema.parse(req.body);
    const parent = await storage.createParent(req.user.id, parentData);

    // Link parent to student
    await storage.addStudentToParent(parent.id, invitation.studentId, req.body.relationship);

    // Mark invitation as accepted
    await storage.acceptParentInvitation(req.params.token, req.user.id);

    res.status(200).json({ message: "Parent account created successfully" });
  });

  // Parent Data Access
  app.get("/api/parent/students", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const parent = await storage.getParentByUserId(req.user.id);
    if (!parent) return res.sendStatus(404);

    const students = await storage.getStudentsByParentId(parent.id);
    res.json(students);
  });

  app.get("/api/parent/students/:studentId/programs", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const parent = await storage.getParentByUserId(req.user.id);
    if (!parent) return res.sendStatus(404);

    // Verify parent has access to this student
    const students = await storage.getStudentsByParentId(parent.id);
    const hasAccess = students.some(s => s.id === parseInt(req.params.studentId));
    if (!hasAccess) return res.sendStatus(403);

    const programs = await storage.getProgramsByStudentId(parseInt(req.params.studentId));
    res.json(programs);
  });

  // New delete student endpoint
  app.delete("/api/students/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const studentId = parseInt(req.params.id);
    const student = await storage.getStudent(studentId);

    if (!student) {
      return res.sendStatus(404);
    }

    // Check if the user has access to any programs this student is enrolled in
    const studentPrograms = await storage.getProgramsByStudentId(studentId);
    const hasAccess = studentPrograms.some(program => program.userId === req.user.id);

    if (!hasAccess) {
      return res.sendStatus(403);
    }

    await storage.deleteStudent(studentId);
    res.sendStatus(200);
  });

  const httpServer = createServer(app);
  return httpServer;
}