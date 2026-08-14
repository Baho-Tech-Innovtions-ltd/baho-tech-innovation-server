import { getDatabase } from "../../database/connection.js";
import { normalizeEmail } from "../../utils/normalizers.js";

export async function findUserByEmail(email) {
  const result = await getDatabase().query("SELECT * FROM users WHERE email = $1", [normalizeEmail(email)]);
  return result.rows[0];
}

export async function findUserById(id) {
  const result = await getDatabase().query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0];
}

export async function createUser({
  fullName,
  email,
  passwordHash,
  passwordSalt,
  disabilityCategory,
  preferredLanguage,
  preferredTheme,
  phone,
  location,
}) {
  const now = new Date().toISOString();
  const result = await getDatabase().query(
    `INSERT INTO users
      (full_name, email, password_hash, password_salt, role, disability_category, preferred_language, preferred_theme, phone, location, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 'user', $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      fullName,
      normalizeEmail(email),
      passwordHash,
      passwordSalt,
      disabilityCategory,
      preferredLanguage,
      preferredTheme,
      phone,
      location,
      now,
      now,
    ]
  );

  return result.rows[0];
}

export async function createSession({ userId, tokenHash, expiresAt }) {
  const now = new Date().toISOString();
  await getDatabase().query(
    "INSERT INTO sessions (user_id, token_hash, created_at, expires_at) VALUES ($1, $2, $3, $4)",
    [userId, tokenHash, now, expiresAt]
  );
}

export async function deleteSessionById(sessionId) {
  await getDatabase().query("DELETE FROM sessions WHERE id = $1", [sessionId]);
}

export async function deleteExpiredSessions() {
  await getDatabase().query("DELETE FROM sessions WHERE expires_at <= $1", [new Date().toISOString()]);
}

export async function findActiveSessionByTokenHash(tokenHash) {
  const result = await getDatabase().query(
    `SELECT sessions.id AS session_id, sessions.expires_at, users.*
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.token_hash = $1 AND sessions.expires_at > $2`,
    [tokenHash, new Date().toISOString()]
  );
  return result.rows[0];
}
