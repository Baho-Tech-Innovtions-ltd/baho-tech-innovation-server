import { DISABILITY_CATEGORIES } from "../../models/user.model.js";
import { getDashboardAccessForUser } from "./disability.service.js";

export function listDisabilityCategories(_req, res) {
  res.json({ ok: true, categories: DISABILITY_CATEGORIES });
}

export function myDisabilityAccess(req, res) {
  res.json({ ok: true, access: getDashboardAccessForUser(req.user) });
}
