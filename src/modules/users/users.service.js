import { toPublicUser } from "../../models/user.model.js";
import { normalizeLanguage, normalizeTheme } from "../../utils/normalizers.js";
import { getDashboardAccessForUser } from "../disability/disability.service.js";
import { findUserById, updateUserPreferences } from "./users.repository.js";

export function getUserProfile(userId) {
  return toPublicUser(findUserById(userId));
}

export function getDashboardAccess(user) {
  return getDashboardAccessForUser(user);
}

export function saveUserPreferences(userId, payload = {}) {
  const preferences = {};

  if (payload.preferredLanguage) {
    preferences.preferredLanguage = normalizeLanguage(payload.preferredLanguage);
  }

  if (payload.preferredTheme) {
    preferences.preferredTheme = normalizeTheme(payload.preferredTheme);
  }

  if (payload.accessibilityPreferences && typeof payload.accessibilityPreferences === "object") {
    preferences.accessibilityPreferences = payload.accessibilityPreferences;
  }

  return toPublicUser(updateUserPreferences(userId, preferences));
}
