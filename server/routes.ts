import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProgramSchema, insertSessionSchema, insertStudentSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import express from 'express';


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

  // Set up multer for file uploads
  const multerStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads');
      try {
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
      } catch (error) {
        cb(error as Error, uploadDir);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
  });

  const upload = multer({
    storage: multerStorage,
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/svg+xml',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm'
      ];
      if (allowedTypes.includes(file.mimetype)) {
        // For video files, check size limit of 20MB
        if (file.mimetype.startsWith('video/') && file.size > 20 * 1024 * 1024) {
          cb(new Error('Video files must not exceed 20MB'));
        } else if (!file.mimetype.startsWith('video/') && file.size > 5 * 1024 * 1024) {
          cb(new Error('Non-video files must not exceed 5MB'));
        } else {
          cb(null, true);
        }
      } else {
        cb(new Error('Invalid file type'));
      }
    },
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB max for videos
    }
  });

  // Portfolio Entries endpoints
  app.get("/api/students/:studentId/portfolio", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const studentId = parseInt(req.params.studentId);
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

    const entries = await storage.getPortfolioEntriesByStudentId(studentId);
    res.json(entries);
  });

  app.post(
    "/api/students/:studentId/portfolio",
    upload.array("media", 10),
    async (req, res) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const studentId = parseInt(req.params.studentId);
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

      const files = req.files as Express.Multer.File[];
      const mediaUrl = files.map(file => `/uploads/${file.filename}`);

      const entry = await storage.createPortfolioEntry(studentId, {
        title: req.body.title,
        description: req.body.description,
        type: req.body.type,
        mediaUrl,
      });

      res.status(201).json(entry);
    }
  );

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  const httpServer = createServer(app);
  return httpServer;
}