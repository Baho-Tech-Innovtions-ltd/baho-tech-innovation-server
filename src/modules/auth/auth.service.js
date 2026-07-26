import { env } from "../../config/env.js";
import { toPublicUser } from "../../models/user.model.js";
import { sendWelcomeEmail } from "../../services/mail.service.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { createRawToken, hashToken } from "../../utils/token.js";
import {
  createSession,
  createUser,
  deleteSessionById,
  findUserByEmail,
} from "./auth.repository.js";

export function registerUser(payload) {
  if (findUserByEmail(payload.email)) {
    const error = new Error("An account already exists for this email.");
    error.status = 409;
    throw error;
  }

  const { hash, salt } = hashPassword(payload.password);
  const user = createUser({
    fullName: payload.fullName,
    email: payload.email,
    passwordHash: hash,
    passwordSalt: salt,
    disabilityCategory: payload.disabilityCategory,
    preferredLanguage: payload.preferredLanguage,
    preferredTheme: payload.preferredTheme,
    phone: payload.phone,
    location: payload.location,
  });

  return toPublicUser(user);
}

export async function registerUserWithEmail(payload) {
  const user = registerUser(payload);

  try {
    const email = await sendWelcomeEmail(user);
    return { user, email };
  } catch (error) {
    return {
      user,
      email: {
        sent: false,
        reason: error instanceof Error ? error.message : "Welcome email failed.",
      },
    };
  }
}

export function loginUser({ email, password }) {
  const user = findUserByEmail(email);

  if (!user || !verifyPassword(password, user)) {
    const error = new Error("Invalid email or password.");
    error.status = 401;
    throw error;
  }

  const token = createRawToken();
  const expiresAt = new Date(Date.now() + env.sessionTtlDays * 24 * 60 * 60 * 1000).toISOString();
  createSession({ userId: user.id, tokenHash: hashToken(token), expiresAt });

  return { token, user: toPublicUser(user) };
}

export function logoutSession(sessionId) {
  deleteSessionById(sessionId);
}
