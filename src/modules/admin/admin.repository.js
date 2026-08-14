import { getDatabase } from "../../database/connection.js";
import { normalizeDisabilityCategory } from "../../utils/normalizers.js";

export async function countUsers() {
  const result = await getDatabase().query("SELECT COUNT(*)::int AS count FROM users WHERE role = 'user'");
  return result.rows[0].count;
}

export async function countUsersByDisability() {
  const result = await getDatabase().query(
    `SELECT disability_category AS category, COUNT(*)::int AS count
     FROM users
     WHERE role = 'user'
     GROUP BY disability_category`
  );
  return result.rows;
}

export async function findRecentUsers(limit = 6) {
  const result = await getDatabase().query(
    `SELECT id, full_name, email, role, disability_category, phone, location, created_at, updated_at
     FROM users
     WHERE role = 'user'
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

export async function findUsers({ search = "", disability = "" } = {}) {
  const values = [];
  const conditions = ["role = 'user'"];
  const category = normalizeDisabilityCategory(disability);
  const normalizedSearch = String(search || "").trim().toLowerCase();
  let paramIndex = 1;

  if (normalizedSearch) {
    conditions.push(`(LOWER(full_name) LIKE $${paramIndex} OR LOWER(email) LIKE $${paramIndex + 1})`);
    values.push(`%${normalizedSearch}%`, `%${normalizedSearch}%`);
    paramIndex += 2;
  }

  if (category) {
    conditions.push(`disability_category = $${paramIndex}`);
    values.push(category);
    paramIndex += 1;
  }

  const result = await getDatabase().query(
    `SELECT id, full_name, email, role, disability_category, preferred_language, preferred_theme, accessibility_preferences, phone, location, created_at, updated_at
     FROM users
     WHERE ${conditions.join(" AND ")}
     ORDER BY created_at DESC`,
    values
  );
  return result.rows;
}

export async function findUserDetails(id) {
  const result = await getDatabase().query(
    `SELECT id, full_name, email, role, disability_category, preferred_language, preferred_theme, accessibility_preferences, phone, location, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}
