import { SUPPORTED_THEMES } from "../../models/user.model.js";

export function themeOptions(_req, res) {
  res.json({ ok: true, themes: SUPPORTED_THEMES });
}
