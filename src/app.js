import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { apiRoutes } from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { securityHeaders, apiLimiter, authLimiter, contactLimiter } from "./middlewares/security.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../../dist");
const clientIndexPath = path.join(clientDistPath, "index.html");

/**
 * Helper function to validate CORS origin
 * Uses exact match for security (no substring matching)
 */
function isCorsOriginAllowed(origin) {
  if (!origin) return true; // Same-origin requests are allowed

  return env.clientOrigins.some((allowedOrigin) => {
    return origin === allowedOrigin;
  });
}

export function createApp() {
  const app = express();

  // Security middleware - apply first, before other middleware
  app.use(securityHeaders());

  // CORS configuration
  app.use(
    cors({
      origin: isCorsOriginAllowed,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      maxAge: 86400, // 24 hours
    })
  );

  // Body parser middleware
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));

  // Request/Response logging middleware for debugging
  app.use((req, res, next) => {
    const startTime = Date.now();
    const originalSend = res.send;

    // Track response
    res.send = function (data) {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;
      const isError = statusCode >= 400;

      // Log request/response details
      if (isError || process.env.NODE_ENV === "development") {
        console.log(`[${req.method}] ${req.path}`, {
          status: statusCode,
          duration: `${duration}ms`,
          origin: req.headers.origin,
          ip: req.ip,
          ...(isError && { body: data?.toString?.()?.substring?.(0, 200) }),
        });
      }

      // Add custom response headers
      res.set("X-Response-Time", `${duration}ms`);
      res.set("X-Powered-By", "Baho Tech API");

      return originalSend.call(this, data);
    };

    next();
  });

  // General API rate limiting
  app.use("/api", apiLimiter);

  // Specific rate limiters for sensitive endpoints
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);
  app.use("/api/contact", contactLimiter);

  // API routes
  app.use("/api", apiRoutes);

  // Serve static files from dist (built frontend)
  if (fs.existsSync(clientIndexPath)) {
    app.use(express.static(clientDistPath, { maxAge: "1d" }));

    // SPA fallback - serve index.html for all unmatched routes
    app.get("*", (_req, res) => {
      res.sendFile(clientIndexPath);
    });
  }

  // Error handlers (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
