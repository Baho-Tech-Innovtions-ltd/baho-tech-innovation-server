import { getDatabase } from "../../database/connection.js";
import { normalizeDisabilityCategory } from "../../utils/normalizers.js";

export function countUsers() {
  return getDatabase().prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'user'").get().count;
}

export function countUsersByDisability() {
  return getDatabase()
    .prepare(
      `SELECT disability_category AS category, COUNT(*) AS count
       FROM users
       WHERE role = 'user'
       GROUP BY disability_category`
    )
    .all();
}

export function findRecentUsers(limit = 6) {
  return getDatabase()
    .prepare(
      `SELECT id, full_name, email, role, disability_category, phone, location, created_at, updated_at
       FROM users
       WHERE role = 'user'
       ORDER BY datetime(created_at) DESC
       LIMIT ?`
    )
    .all(limit);
}

export function findUsers({ search = "", disability = "" } = {}) {
  const values = [];
  const conditions = ["role = 'user'"];
  const category = normalizeDisabilityCategory(disability);
  const normalizedSearch = String(search || "").trim().toLowerCase();

  if (normalizedSearch) {
    conditions.push("(LOWER(full_name) LIKE ? OR LOWER(email) LIKE ?)");
    values.push(`%${normalizedSearch}%`, `%${normalizedSearch}%`);
  }

  if (category) {
    conditions.push("disability_category = ?");
    values.push(category);
  }

  return getDatabase()
    .prepare(
      `SELECT id, full_name, email, role, disability_category, preferred_language, preferred_theme, accessibility_preferences, phone, location, created_at, updated_at
       FROM users
       WHERE ${conditions.join(" AND ")}
       ORDER BY datetime(created_at) DESC`
    )
    .all(...values);
}

export function findUserDetails(id) {
  return getDatabase()
    .prepare(
      `SELECT id, full_name, email, role, disability_category, preferred_language, preferred_theme, accessibility_preferences, phone, location, created_at, updated_at
       FROM users
       WHERE id = ?`
    )
    .get(id);
}
