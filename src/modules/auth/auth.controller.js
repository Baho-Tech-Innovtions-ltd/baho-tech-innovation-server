import { toPublicUser } from "../../models/user.model.js";
import { loginUser, logoutSession, registerUserWithEmail } from "./auth.service.js";
import { validateLoginPayload, validateRegisterPayload } from "./auth.validation.js";

export async function register(req, res, next) {
  try {
    const { error, value } = validateRegisterPayload(req.body);
    if (error) return res.status(400).json({ ok: false, error });

    const { user, email } = await registerUserWithEmail(value);
    return res.status(201).json({
      ok: true,
      message: "Registration successful. You can now log in.",
      user,
      email,
    });
  } catch (error) {
    return next(error);
  }
}

export function login(req, res, next) {
  try {
    const { error, value } = validateLoginPayload(req.body);
    if (error) return res.status(400).json({ ok: false, error });

    const result = loginUser(value);
    return res.json({ ok: true, ...result });
  } catch (error) {
    return next(error);
  }
}

export function me(req, res) {
  return res.json({ ok: true, user: toPublicUser(req.user) });
}

export function logout(req, res, next) {
  try {
    logoutSession(req.sessionId);
    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
}
