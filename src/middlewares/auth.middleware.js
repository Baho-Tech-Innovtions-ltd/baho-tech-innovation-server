import { USER_ROLES } from "../models/user.model.js";
import { findActiveSessionByTokenHash, deleteExpiredSessions } from "../modules/auth/auth.repository.js";
import { hashToken } from "../utils/token.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

  if (!token) {
    return res.status(401).json({ ok: false, error: "Authentication is required." });
  }

  deleteExpiredSessions();
  const session = findActiveSessionByTokenHash(hashToken(token));

  if (!session) {
    return res.status(401).json({ ok: false, error: "Your session has expired. Please log in again." });
  }

  req.sessionId = session.session_id;
  req.user = session;
  return next();
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== USER_ROLES.ADMIN) {
    return res.status(403).json({ ok: false, error: "Admin access is required." });
  }

  return next();
}
