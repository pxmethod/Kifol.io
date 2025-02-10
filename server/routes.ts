import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProgramSchema } from "@shared/schema";

// Assume this is a placeholder for a real database interaction library. Replace as needed.
const db = {
  query: {
    programs: {
      findFirst: async (options) => {
        // Replace with your actual database query
        const id = options.where.id;
        return storage.getProgram(id); //Simulate DB lookup using existing storage
      },
    },
  },
  update: (table) => ({
    set: (data) => ({
      where: (condition) => {
        // Replace with your actual database update
        const id = condition.id;
        const updatedProgram = {...storage.getProgram(id), ...data}; //Simulate DB update using existing storage
        return storage.updateProgram(updatedProgram);
      },
    }),
  }),
};


//Middleware for authentication (replace with your actual authentication middleware)
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  next();
};

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Programs
  app.get("/api/programs/:id", requireAuth, async (req, res) => {
    try {
      const programId = parseInt(req.params.id);
      const program = await db.query.programs.findFirst({ where: { id: programId } });

      if (!program) {
        return res.status(404).json({ error: "Program not found" });
      }

      res.json(program);
    } catch (error) {
      console.error("Error fetching program:", error); //add proper logging
      res.status(500).json({ error: "Failed to fetch program" });
    }
  });

  app.patch("/api/programs/:id", requireAuth, async (req, res) => {
    try {
      const programId = parseInt(req.params.id);
      await db.update("programs").set({ title: req.body.title, description: req.body.description }).where({ id: programId });
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating program:", error); //add proper logging
      res.status(500).json({ error: "Failed to update program" });
    }
  });

  app.get("/api/programs", requireAuth, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const programs = await storage.getProgramsByUserId(req.user.id);
    res.json(programs);
  });

  app.post("/api/programs", requireAuth, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const programData = insertProgramSchema.parse(req.body.program);
    const program = await storage.createProgram(req.user.id, programData);

    res.status(201).json(program);
  });

  app.delete("/api/programs/:id", requireAuth, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const program = await storage.getProgram(parseInt(req.params.id));
    if (!program) return res.sendStatus(404);
    if (program.userId !== req.user.id) return res.sendStatus(403);

    await storage.deleteProgram(program.id);
    res.sendStatus(200);
  });

  const httpServer = createServer(app);
  return httpServer;
}