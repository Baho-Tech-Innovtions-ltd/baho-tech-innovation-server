import { getDashboardAccess, getUserProfile, saveUserPreferences } from "./users.service.js";

export function profile(req, res) {
  return res.json({ ok: true, user: getUserProfile(req.user.id) });
}

export function dashboardAccess(req, res) {
  return res.json({ ok: true, access: getDashboardAccess(req.user) });
}

export function updatePreferences(req, res, next) {
  try {
    return res.json({ ok: true, user: saveUserPreferences(req.user.id, req.body || {}) });
  } catch (error) {
    return next(error);
  }
}
