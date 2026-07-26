import crypto from "crypto";

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 64, "sha512").toString("hex");
  return { hash, salt };
}

export function verifyPassword(password, user) {
  const { hash } = hashPassword(password, user.password_salt);
  const stored = Buffer.from(user.password_hash, "hex");
  const candidate = Buffer.from(hash, "hex");
  return stored.length === candidate.length && crypto.timingSafeEqual(stored, candidate);
}
