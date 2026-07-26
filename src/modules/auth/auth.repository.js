import { getDatabase } from "../../database/connection.js";
import { normalizeEmail } from "../../utils/normalizers.js";

export function findUserByEmail(email) {
  return getDatabase().prepare("SELECT * FROM users WHERE email = ?").get(normalizeEmail(email));
}

export function findUserById(id) {
  return getDatabase().prepare("SELECT * FROM users WHERE id = ?").get(id);
}

export function createUser({
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
  const result = getDatabase()
    .prepare(
      `INSERT INTO users
        (full_name, email, password_hash, password_salt, role, disability_category, preferred_language, preferred_theme, phone, location, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'user', ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
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
      now
    );

  return findUserById(result.lastInsertRowid);
}

export function createSession({ userId, tokenHash, expiresAt }) {
  const now = new Date().toISOString();
  getDatabase()
    .prepare("INSERT INTO sessions (user_id, token_hash, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .run(userId, tokenHash, now, expiresAt);
}

export function deleteSessionById(sessionId) {
  getDatabase().prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
}

export function deleteExpiredSessions() {
  getDatabase().prepare("DELETE FROM sessions WHERE expires_at <= ?").run(new Date().toISOString());
}

export function findActiveSessionByTokenHash(tokenHash) {
  return getDatabase()
    .prepare(
      `SELECT sessions.id AS session_id, sessions.expires_at, users.*
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = ? AND sessions.expires_at > ?`
    )
    .get(tokenHash, new Date().toISOString());
}
