import { getDatabase } from "../../database/connection.js";

export async function findUserById(id) {
  const result = await getDatabase().query(
    `SELECT id, full_name, email, role, disability_category, preferred_language, preferred_theme, accessibility_preferences, phone, location, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

export async function updateUserPreferences(id, { preferredLanguage, preferredTheme, accessibilityPreferences }) {
  const now = new Date().toISOString();
  const result = await getDatabase().query(
    `UPDATE users
     SET preferred_language = COALESCE($1, preferred_language),
         preferred_theme = COALESCE($2, preferred_theme),
         accessibility_preferences = COALESCE($3, accessibility_preferences),
         updated_at = $4
     WHERE id = $5
     RETURNING id, full_name, email, role, disability_category, preferred_language, preferred_theme, accessibility_preferences, phone, location, created_at, updated_at`,
    [
      preferredLanguage || null,
      preferredTheme || null,
      accessibilityPreferences ? JSON.stringify(accessibilityPreferences) : null,
      now,
      id,
    ]
  );

  return result.rows[0];
}
