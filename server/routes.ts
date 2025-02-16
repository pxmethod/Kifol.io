import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProgramSchema, insertSessionSchema, insertStudentSchema, insertParentSchema } from "@shared/schema";
import { sendGrid } from "./email";  // We'll need to set this up later for sending invitations

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

    res.status(201).json({ ...student, programStudent });
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

  // Parent Authentication Routes
  app.post("/api/parents/register", async (req, res) => {
    const parentData = insertParentSchema.parse(req.body);

    // Check if parent already exists
    const existingParent = await storage.getParentByEmail(parentData.email);
    if (existingParent) {
      return res.status(400).json({
        message: "A parent with this email already exists"
      });
    }

    // Get pending invitations for this email
    const invitations = await storage.getParentInvitationsByEmail(parentData.email);
    if (invitations.length === 0) {
      return res.status(400).json({
        message: "No pending invitations found for this email"
      });
    }

    // Create parent account
    const parent = await storage.createParent(parentData);

    // Accept all pending invitations
    await Promise.all(
      invitations
        .filter(inv => !inv.accepted)
        .map(inv => storage.acceptParentInvitation(inv.token, parent.id))
    );

    res.status(201).json({ 
      message: "Parent account created successfully",
      parent: {
        id: parent.id,
        username: parent.username,
        email: parent.email,
        name: parent.name,
        verified: parent.verified
      }
    });
  });

  // Parent Invitation Routes
  app.post("/api/students/:studentId/invite-parent", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const studentId = parseInt(req.params.studentId);
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    // Check if student exists and user has access
    const student = await storage.getStudent(studentId);
    if (!student) return res.sendStatus(404);

    const studentPrograms = await storage.getProgramsByStudentId(studentId);
    const hasAccess = studentPrograms.some(program => program.userId === req.user.id);
    if (!hasAccess) return res.sendStatus(403);

    try {
      // Create invitation
      const invitation = await storage.createParentInvitation(studentId, email);

      // Send invitation email
      await sendGrid.sendParentInvitation(email, student.name, invitation.token);

      res.status(201).json({
        message: "Invitation sent successfully"
      });
    } catch (error) {
      console.error('Error sending invitation:', error);
      res.status(500).json({
        message: "Failed to send invitation"
      });
    }
  });

  app.get("/api/parent-invitations/:token", async (req, res) => {
    const invitation = await storage.getParentInvitation(req.params.token);

    if (!invitation) {
      return res.status(404).json({
        message: "Invitation not found"
      });
    }

    if (invitation.accepted) {
      return res.status(400).json({
        message: "Invitation has already been accepted"
      });
    }

    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({
        message: "Invitation has expired"
      });
    }

    const student = await storage.getStudent(invitation.studentId);
    if (!student) {
      return res.status(404).json({
        message: "Associated student not found"
      });
    }

    res.json({
      email: invitation.email,
      studentName: student.name,
      expiresAt: invitation.expiresAt
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}