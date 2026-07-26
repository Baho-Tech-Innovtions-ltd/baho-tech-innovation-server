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
