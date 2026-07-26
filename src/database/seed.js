import { env } from "../config/env.js";
import { USER_ROLES } from "../models/user.model.js";
import { hashPassword } from "../utils/password.js";
import { normalizeEmail } from "../utils/normalizers.js";

export function ensureAdminUser(db) {
  if (!env.admin.email || !env.admin.password) return;

  const email = normalizeEmail(env.admin.email);
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) return;

  const now = new Date().toISOString();
  const { hash, salt } = hashPassword(env.admin.password);

  db.prepare(
    `INSERT INTO users
      (full_name, email, password_hash, password_salt, role, disability_category, preferred_language, preferred_theme, accessibility_preferences, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, NULL, 'en', 'light', '{}', ?, ?)`
  ).run(env.admin.name, email, hash, salt, USER_ROLES.ADMIN, now, now);
}
