export const USER_ROLES = Object.freeze({
  ADMIN: "admin",
  USER: "user",
});

export const DISABILITY_CATEGORIES = Object.freeze(["blind", "deaf", "mute", "mobility"]);
export const SUPPORTED_LANGUAGES = Object.freeze(["en", "rw", "fr", "sw"]);
export const SUPPORTED_THEMES = Object.freeze(["light", "dark"]);

function parseAccessibilityPreferences(value) {
  try {
    return value ? JSON.parse(value) : {};
  } catch (_error) {
    return {};
  }
}

export function toPublicUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    disabilityCategory: user.disability_category,
    preferredLanguage: user.preferred_language || "en",
    preferredTheme: user.preferred_theme || "light",
    accessibilityPreferences: parseAccessibilityPreferences(user.accessibility_preferences),
    phone: user.phone,
    location: user.location,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}
