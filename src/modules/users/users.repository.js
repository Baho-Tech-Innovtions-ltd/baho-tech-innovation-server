import { getDatabase } from "../../database/connection.js";

export function findUserById(id) {
  return getDatabase()
    .prepare(
      `SELECT id, full_name, email, role, disability_category, preferred_language, preferred_theme, accessibility_preferences, phone, location, created_at, updated_at
       FROM users
       WHERE id = ?`
    )
    .get(id);
}

export function updateUserPreferences(id, { preferredLanguage, preferredTheme, accessibilityPreferences }) {
  const now = new Date().toISOString();
  getDatabase()
    .prepare(
      `UPDATE users
       SET preferred_language = COALESCE(?, preferred_language),
           preferred_theme = COALESCE(?, preferred_theme),
           accessibility_preferences = COALESCE(?, accessibility_preferences),
           updated_at = ?
       WHERE id = ?`
    )
    .run(
      preferredLanguage || null,
      preferredTheme || null,
      accessibilityPreferences ? JSON.stringify(accessibilityPreferences) : null,
      now,
      id
    );

  return findUserById(id);
}
