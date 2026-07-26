import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export function createTransporter() {
  if (!env.smtp.host) return null;

  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: env.smtp.user
      ? {
          user: env.smtp.user,
          pass: env.smtp.pass,
        }
      : undefined,
  });
}

export async function sendMail({ to, subject, text, html, replyTo }) {
  const transporter = createTransporter();

  if (!transporter) {
    return { sent: false, reason: "SMTP is not configured." };
  }

  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject,
    text,
    html,
    replyTo,
  });

  return { sent: true };
}

export async function sendWelcomeEmail(user) {
  if (!user?.email) return { sent: false, reason: "User email is missing." };

  return sendMail({
    to: user.email,
    subject: "Welcome to Baho Tech",
    text: `Hello ${user.fullName},\n\nYour Baho Tech account has been created successfully. You can now log in and access your disability-specific assistive dashboard.\n\nBaho Tech`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #102A43;">
        <h2 style="color: #1A4F8D;">Welcome to Baho Tech</h2>
        <p>Hello ${user.fullName},</p>
        <p>Your account has been created successfully. You can now log in and access your disability-specific assistive dashboard.</p>
        <p style="margin-top: 24px;">Baho Tech</p>
      </div>
    `,
  });
}
