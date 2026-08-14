import { env } from "../config/env.js";
import { USER_ROLES } from "../models/user.model.js";
import { hashPassword } from "../utils/password.js";
import { normalizeEmail } from "../utils/normalizers.js";

export async function ensureAdminUser(db) {
  if (!env.admin.email || !env.admin.password) return;

  const email = normalizeEmail(env.admin.email);
  const result = await db.query("SELECT id FROM users WHERE email = $1", [email]);
  const existing = result.rows[0];
  if (existing) return;

  const now = new Date().toISOString();
  const { hash, salt } = hashPassword(env.admin.password);

  await db.query(
    `INSERT INTO users
      (full_name, email, password_hash, password_salt, role, disability_category, preferred_language, preferred_theme, accessibility_preferences, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NULL, 'en', 'light', '{}', $6, $7)`,
    [env.admin.name, email, hash, salt, USER_ROLES.ADMIN, now, now]
  );
}
