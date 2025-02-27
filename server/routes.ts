import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProgramSchema, insertSessionSchema, insertStudentSchema } from "@shared/schema";
import { sendTestEmail } from "./services/mail";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Test email endpoint
  app.post("/api/test-email", async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    try {
      console.log("Attempting to send test email to:", email);
      const success = await sendTestEmail(email);
      if (success) {
        console.log("Email sent successfully to:", email);
        return res.status(200).json({ message: "Test email sent successfully" });
      } else {
        console.error("Failed to send email to:", email);
        return res.status(500).json({ message: "Failed to send test email" });
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      return res.status(500).json({ message: "Error sending test email" });
    }
  });

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

  // Add new GET student endpoint before the delete endpoint
  app.get("/api/students/:id", async (req, res) => {
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

    res.json(student);
  });

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