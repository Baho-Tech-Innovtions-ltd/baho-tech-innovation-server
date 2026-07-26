import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "../config/env.js";
import { getDatabase } from "../database/connection.js";
import { createTransporter } from "./mail.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fallbackPath = path.resolve(__dirname, "../data/messages.json");

export async function submitContactMessage({ name, email, subject, message }) {
  if (!name || !email || !subject || !message) {
    const error = new Error("Missing required fields.");
    error.status = 400;
    throw error;
  }

  const createdAt = new Date().toISOString();
  const db = getDatabase();
  const info = db
    .prepare("INSERT INTO messages (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(name, email, subject, message, createdAt);
  const messageId = Number(info.lastInsertRowid);
  const transporter = createTransporter();

  if (!transporter) {
    return {
      ok: false,
      status: 500,
      payload: {
        ok: false,
        error: "Email transport is not configured. Message stored in database.",
        messageId,
      },
    };
  }

  await transporter.sendMail({
    from: env.smtp.from,
    to: env.smtp.to,
    subject: `[Contact] ${subject}`,
    replyTo: email,
    text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}`,
  });

  return { ok: true, status: 200, payload: { ok: true, messageId } };
}

export function saveFallbackMessage(message) {
  const existing = fs.existsSync(fallbackPath) ? JSON.parse(fs.readFileSync(fallbackPath, "utf8")) : [];
  existing.push(message);
  fs.writeFileSync(fallbackPath, JSON.stringify(existing, null, 2));
}
