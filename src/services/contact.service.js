import { env } from "../config/env.js";
import { getDatabase } from "../database/connection.js";
import { createTransporter } from "./mail.service.js";

export async function submitContactMessage({ name, email, subject, message }) {
  if (!name || !email || !subject || !message) {
    const error = new Error("Missing required fields.");
    error.status = 400;
    throw error;
  }

  const createdAt = new Date().toISOString();
  const db = getDatabase();

  const result = await db.query(
    "INSERT INTO messages (name, email, subject, message, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    [name, email, subject, message, createdAt]
  );
  const messageId = result.rows[0].id;

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
