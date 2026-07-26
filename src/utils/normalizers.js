import { DISABILITY_CATEGORIES, SUPPORTED_LANGUAGES, SUPPORTED_THEMES } from "../models/user.model.js";

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function normalizeDisabilityCategory(category) {
  const normalized = String(category || "").trim().toLowerCase();
  return DISABILITY_CATEGORIES.includes(normalized) ? normalized : null;
}

export function normalizeLanguage(language) {
  const normalized = String(language || "").trim().toLowerCase();
  return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : "en";
}

export function normalizeTheme(theme) {
  const normalized = String(theme || "").trim().toLowerCase();
  return SUPPORTED_THEMES.includes(normalized) ? normalized : "light";
}
