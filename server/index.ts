import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Create a separate router for API routes
const apiRouter = express.Router();
apiRouter.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

//Register API routes
registerRoutes(apiRouter);


// Add middleware to handle API routes with detailed logging.  This middleware is placed BEFORE the general middleware
app.use("/api", (req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
    if (capturedJsonResponse) {
      logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
    }

    if (logLine.length > 80) {
      logLine = logLine.slice(0, 79) + "…";
    }

    log(logLine);
  });

  next();
});


// Add error handling middleware for API routes
apiRouter.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

// Mount the API router before Vite setup
app.use(apiRouter);


(async () => {
  // Then setup Vite only for non-API routes
  const server = app; // Server is now the express app itself

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve on port 5000
  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();