import { normalizeDisabilityCategory, normalizeEmail, normalizeLanguage, normalizeTheme } from "../../utils/normalizers.js";

export function validateRegisterPayload(payload = {}) {
  const fullName = String(payload.fullName || payload.full_name || "").trim();
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || "");
  const confirmPassword = String(payload.confirmPassword || "");
  const disabilityCategory = normalizeDisabilityCategory(payload.disabilityCategory || payload.disability_category);
  const preferredLanguage = normalizeLanguage(payload.preferredLanguage || payload.preferred_language);
  const preferredTheme = normalizeTheme(payload.preferredTheme || payload.preferred_theme);
  const phone = payload.phone ? String(payload.phone).trim() : null;
  const location = payload.location ? String(payload.location).trim() : null;

  if (!fullName || !email || !password || !confirmPassword || !disabilityCategory) {
    return { error: "Full name, email, password, confirm password, and disability category are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  return { value: { fullName, email, password, disabilityCategory, preferredLanguage, preferredTheme, phone, location } };
}

export function validateLoginPayload(payload = {}) {
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  return { value: { email, password } };
}
