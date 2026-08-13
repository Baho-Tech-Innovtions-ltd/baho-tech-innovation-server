import dotenv from "dotenv";

dotenv.config();

function csv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function numberFromEnv(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const geminiModels = csv(process.env.GEMINI_MODELS || process.env.GEMINI_MODEL || "gemini-2.5-flash,gemini-2.5-flash-lite");
const isProduction = process.env.NODE_ENV === "production";

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: numberFromEnv(process.env.PORT, 3001),
  host: isProduction ? "" : process.env.HOST || "127.0.0.1",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  clientOrigins: csv(process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || "http://localhost:5173,http://localhost:5174"),
  sessionTtlDays: numberFromEnv(process.env.SESSION_TTL_DAYS, 7),
  admin: {
    name: process.env.ADMIN_NAME || "Baho Tech Admin",
    email: process.env.ADMIN_EMAIL || "",
    password: process.env.ADMIN_PASSWORD || "",
  },
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: numberFromEnv(process.env.SMTP_PORT, 587),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || "no-reply@bahotech.com",
    to: process.env.SMTP_TO || process.env.SMTP_USER || "",
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    model: geminiModels[0],
    models: geminiModels,
    cacheTtlMs: numberFromEnv(process.env.GEMINI_CACHE_TTL_SECONDS, 60 * 60) * 1000,
    maxCacheEntries: numberFromEnv(process.env.GEMINI_MAX_CACHE_ENTRIES, 500),
    maxRetries: numberFromEnv(process.env.GEMINI_MAX_RETRIES, 2),
    retryMaxDelayMs: numberFromEnv(process.env.GEMINI_RETRY_MAX_DELAY_MS, 8000),
  },
};

/**
 * Validate critical environment variables
 * Call this at server startup to fail fast on misconfiguration
 */
export function validateEnvironment() {
  const errors = [];

  // Critical requirements
  if (!env.clientOrigins || env.clientOrigins.length === 0) {
    errors.push("CLIENT_ORIGINS or CLIENT_ORIGIN must be set");
  }

  if (isProduction) {
    // Production-specific validations
    if (!env.admin.email || !env.admin.password) {
      errors.push("ADMIN_EMAIL and ADMIN_PASSWORD must be set in production");
    }

    // Optional but recommended for production
    if (!env.smtp.host || !env.smtp.user) {
      console.warn("[WARNING] SMTP not configured - email features will not work");
    }

    if (!env.gemini.apiKey) {
      console.warn("[WARNING] GEMINI_API_KEY not configured - AI features will not work");
    }
  }

  if (errors.length > 0) {
    console.error("[CONFIGURATION ERROR]");
    errors.forEach((error) => console.error(`  - ${error}`));
    process.exit(1);
  }

  // Log successful configuration
  console.log("\n╔════════════════════════════════════════════════╗");
  console.log("║     Baho Tech API - Configuration Status       ║");
  console.log("╚════════════════════════════════════════════════╝\n");
  
  console.log("✅ Environment Configuration:");
  console.log(`   Node Environment: ${env.nodeEnv.toUpperCase()}`);
  console.log(`   Server URL: ${env.nodeEnv === 'production' ? env.nodeEnv === 'production' ? 'https://baho-tech-innovation-server-r3v4.onrender.com' : `http://${env.host}:${env.port}` : `http://${env.host}:${env.port}`}`);
  console.log(`   API Base Path: /api`);
  
  console.log("\n✅ Frontend Origins (CORS Allowed):");
  env.clientOrigins.forEach((origin) => {
    console.log(`   - ${origin}`);
  });

  console.log("\n✅ Database:");
  console.log("   Type: SQLite");
  console.log("   Location: ./data/baho.sqlite");
  
  console.log("\n✅ Features:");
  console.log(`   - Authentication: Enabled (Session TTL: ${env.sessionTtlDays} days)`);
  console.log(`   - Rate Limiting: Enabled`);
  console.log(`   - Security Headers: Enabled (Helmet.js)`);
  console.log(`   - AI Assistant: ${env.gemini.apiKey ? "Enabled" : "Disabled (set GEMINI_API_KEY)"}`);
  console.log(`   - Email Notifications: ${env.smtp.host ? "Enabled" : "Disabled (set SMTP_* variables)"}`);
  
  console.log("\n" + "═".repeat(50) + "\n");
}

